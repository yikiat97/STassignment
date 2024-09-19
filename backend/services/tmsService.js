const dotenv = require("dotenv");
const db = require("../config/database"); // Import the database connection

dotenv.config();


const getAllApplicationByUsername = async username => {
  try {
    // Prepare the query, including the parameter placeholder
    const query = `
SELECT a.* FROM application a
JOIN user_group ug ON JSON_CONTAINS(a.App_permit_Open, JSON_QUOTE(ug.usergroup)) 
                 OR JSON_CONTAINS(a.App_permit_toDoList, JSON_QUOTE(ug.usergroup))
                 OR JSON_CONTAINS(a.App_permit_Doing, JSON_QUOTE(ug.usergroup))
                 OR JSON_CONTAINS(a.App_permit_Done, JSON_QUOTE(ug.usergroup))
                 OR JSON_CONTAINS(a.App_permit_create, JSON_QUOTE(ug.usergroup))
WHERE ug.username = ?;  
    `;

    // Execute the query, passing the username as a parameter
    const [rows] = await db.query(query, [username]);
    console.log(rows);

    // Since username should be unique, expect either one result or none
    if (rows.length) {
      return rows
    } else {
      return null; // or throw new Error('User not found') if you expect to always find a user
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


const insertApplication = async appData => {
  try {
    // Destructure the appData object to extract values
    const {
      App_Acronym,
      App_Rnumber,
      App_startDate,
      App_endDate,
      App_permit_Open,
      App_permit_toDoList,
      App_permit_Doing,
      App_permit_Done,
      App_permit_create
    } = appData;

    // Validate mandatory fields
    if (!App_Acronym || !App_Rnumber || !App_startDate || !App_endDate) {
      throw new Error(
        "App_Acronym, App_Rnumber, App_startDate, and App_endDate are mandatory fields"
      );
    }

    // Build the SQL query dynamically to include only optional fields if provided
    let query = `
      INSERT INTO application (App_Acronym, App_Rnumber, App_startDate, App_endDate
    `;

    // Prepare the values array for query execution
    const values = [App_Acronym, App_Rnumber, App_startDate, App_endDate];

    // Dynamically add fields for optional parameters if provided
    if (App_permit_Open) {
      query += `, App_permit_Open`;
      values.push(JSON.stringify(App_permit_Open));
    }

    if (App_permit_toDoList) {
      query += `, App_permit_toDoList`;
      values.push(JSON.stringify(App_permit_toDoList));
    }

    if (App_permit_Doing) {
      query += `, App_permit_Doing`;
      values.push(JSON.stringify(App_permit_Doing));
    }

    if (App_permit_Done) {
      query += `, App_permit_Done`;
      values.push(JSON.stringify(App_permit_Done));
    }

    if (App_permit_create) {
      query += `, App_permit_create`;
      values.push(JSON.stringify(App_permit_create));
    }

    // Close the SQL query
    query += `) VALUES (?, ?, ?, ?`;

    // Dynamically add placeholders for optional parameters
    for (let i = 4; i < values.length; i++) {
      query += `, ?`;
    }

    query += `)`;

    // Execute the query
    const [result] = await db.query(query, values);

    return result; // Return result of the query
  } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(
          "App Name already exists, please use a unique App Name"
        );
      }
      throw new Error(error.message);
  }
};


module.exports = {
  getAllApplicationByUsername,
  insertApplication
};