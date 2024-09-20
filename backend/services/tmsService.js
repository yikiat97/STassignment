const dotenv = require("dotenv");
const db = require("../config/database"); // Import the database connection

dotenv.config();

function convertDateToInt(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-based
  const day = ("0" + date.getDate()).slice(-2);
  return parseInt(`${year}${month}${day}`);
}

function convertIntToDate(intDate) {
  const dateStr = intDate.toString();
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${year}-${month}-${day}`;
}

const getAllApplicationByUsername = async username => {
  try {
    // Prepare the query with simple string comparisons instead of JSON_CONTAINS
    const query = `
      SELECT a.* FROM application a
      JOIN user_group ug ON a.App_permit_Open = ug.usergroup 
                      OR a.App_permit_toDoList = ug.usergroup
                      OR a.App_permit_Doing = ug.usergroup
                      OR a.App_permit_Done = ug.usergroup
                      OR a.App_permit_create = ug.usergroup
      WHERE ug.username = ?;
    `;

    // Execute the query, passing the username as a parameter
    const [rows] = await db.query(query, [username]);
    console.log(rows);

    // Return the rows if found, otherwise return null
    if (rows.length) {
      return rows;
    } else {
      return null; // or throw new Error('No applications found for the user') if you expect results
    }
  } catch (error) {
    throw new Error(error.message);
  }
};





const insertApplication = async appData => {
  try {
    // Destructure the appData object to extract values
    let {
      App_Acronym,
      App_Rnumber,
      App_Description,
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

    App_startDate = convertDateToInt(App_startDate);
    App_endDate = convertDateToInt(App_endDate);


    // Build the SQL query dynamically to include only optional fields if provided
    let query = `
      INSERT INTO application (App_Acronym, App_Rnumber, App_startDate, App_endDate
    `;

    // Prepare the values array for query execution
    const values = [App_Acronym, App_Rnumber, App_startDate, App_endDate];

    if (App_Description) {
      query += `, App_Description`;
      values.push(App_Description);
    }

    // Dynamically add fields for optional parameters if provided
    if (App_permit_Open) {
      query += `, App_permit_Open`;
      values.push(App_permit_Open);
    }

    if (App_permit_toDoList) {
      query += `, App_permit_toDoList`;
      values.push(App_permit_toDoList);
    }

    if (App_permit_Doing) {
      query += `, App_permit_Doing`;
      values.push(App_permit_Doing);
    }

    if (App_permit_Done) {
      query += `, App_permit_Done`;
      values.push(App_permit_Done);
    }

    if (App_permit_create) {
      query += `, App_permit_create`;
      values.push(App_permit_create);
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