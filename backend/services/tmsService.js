const dotenv = require("dotenv");
const db = require("../config/database"); // Import the database connection
const nodemailer = require('nodemailer'); // Using nodemailer to send emails


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
    //console.log(rows);

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


const updateApplication = async (appData) => {
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

    // Ensure the mandatory App_Acronym is provided
    if (!App_Acronym) {
      throw new Error("App_Acronym is required to update the application");
    }

    // Initialize query for updating the application
    let query = `UPDATE application SET `;
    let values = [];

    // Conditionally add fields to update only if they are provided
    if (App_Rnumber) {
      query += `App_Rnumber = ?, `;
      values.push(App_Rnumber);
    }

    if (App_Description) {
      query += `App_Description = ?, `;
      values.push(App_Description);
    }

    if (App_startDate) {
      App_startDate = convertDateToInt(App_startDate);
      query += `App_startDate = ?, `;
      values.push(App_startDate);
    }

    if (App_endDate) {
      App_endDate = convertDateToInt(App_endDate);
      query += `App_endDate = ?, `;
      values.push(App_endDate);
    }

    if (App_permit_Open) {
      query += `App_permit_Open = ?, `;
      values.push(App_permit_Open);
    }

    if (App_permit_toDoList) {
      query += `App_permit_toDoList = ?, `;
      values.push(App_permit_toDoList);
    }

    if (App_permit_Doing) {
      query += `App_permit_Doing = ?, `;
      values.push(App_permit_Doing);
    }

    if (App_permit_Done) {
      query += `App_permit_Done = ?, `;
      values.push(App_permit_Done);
    }

    if (App_permit_create) {
      query += `App_permit_create = ?, `;
      values.push(App_permit_create);
    }

    // Remove the trailing comma and space
    query = query.slice(0, -2);

    // Add the WHERE clause to target the specific application
    query += ` WHERE App_Acronym = ?`;
    values.push(App_Acronym);

    // Execute the query with the built query and values
    const [result] = await db.query(query, values);

    return result; // Return result of the query
  } catch (error) {
    throw new Error(error.message);
  }
};


const getAllPlansByAppAcronym = async appAcronym => {
  try {
    // Query to fetch all plans by the App_Acronym
    const [rows] = await db.query(
      `SELECT * FROM plan WHERE Plan_app_Acronym = ?`,
      [appAcronym]
    );

    if (rows.length === 0) {
      return rows;
    }

    return rows; // Return the rows containing all plans for the specified App_Acronym
  } catch (error) {
    throw new Error(error.message);
  }
};



const insertPlan = async planData => {
  try {
    let { planName, applicationName, startDate, endDate, color } = planData;

    // Validate mandatory fields
    if (!planName || !applicationName || !startDate || !endDate) {
      throw new Error(
        "Plan_MVP_name, Plan_app_Acronym, Plan_startDate, and Plan_endDate are mandatory fields"
      );
    }

    startDate = convertDateToInt(startDate);
    endDate = convertDateToInt(endDate);

    // Check if the application exists for the given App_Acronym
    const [applicationExists] = await db.query(
      "SELECT * FROM application WHERE App_Acronym = ?",
      [applicationName]
    );

    if (applicationExists.length === 0) {
      throw new Error("Application does not exist for the given App_Acronym");
    }

    // Check if the Plan_MVP_name already exists
    const [existingPlan] = await db.query(
      "SELECT * FROM plan WHERE Plan_MVP_name = ?",
      [planName]
    );

    if (existingPlan.length > 0) {
      throw new Error("Plan_MVP_name already exists");
    }

    // Insert the new plan into the database
    const query = `
      INSERT INTO plan (Plan_MVP_name, Plan_app_Acronym, Plan_startDate, Plan_endDate, Plan_color)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      planName,
      applicationName,
      startDate,
      endDate,
      color || '#000000'
    ]; // Plan_color is optional

    const [result] = await db.query(query, values);

    return result; // Return the result of the query
  } catch (error) {
    throw new Error(error.message);
  }
};


const updateTaskPlan = async (task_id, newTaskPlan) => {
  try {
    // Check if the task exists
    const [task] = await db.query("SELECT * FROM task WHERE Task_id = ?", [
      task_id
    ]);

    if (task.length === 0) {
      throw new Error(`Task with ID '${task_id}' not found`);
    }

    // Update only the Task_plan
    const [result] = await db.query(
      "UPDATE task SET Task_plan = ? WHERE Task_id = ?",
      [newTaskPlan, task_id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update task plan");
    }

    return {
      message: `Task ${task_id} updated successfully with new plan: ${newTaskPlan}`
    };
  } catch (error) {
    throw new Error(error.message);
  }
};



const insertTaskWithGeneratedTaskID = async (
  appAcronym,
  taskData
) => {
  const connection = await db.getConnection();

  try {
    // Start the transaction
    await connection.beginTransaction();

    // Lock the application row to prevent race conditions
    const [app] = await connection.query(
      "SELECT App_Rnumber FROM application WHERE App_Acronym = ? FOR UPDATE",
      [appAcronym]
    );

    if (app.length === 0) {
      throw new Error("Application not found for the given App_Acronym");
    }

    // Get and increment the Rnumber
    const currentRnumber = app[0].App_Rnumber;
    const newRnumber = currentRnumber + 1;

    // Update the App_Rnumber in the database
    await connection.query(
      "UPDATE application SET App_Rnumber = ? WHERE App_Acronym = ?",
      [newRnumber, appAcronym]
    );

    // Generate the new Task ID (appAcronym + newRnumber)
    const newTaskID = `${appAcronym}_${currentRnumber}`;

    // Set defaults for required fields
    const taskState = taskData.taskState;
    const taskCreator = taskData.taskCreator; 
    const taskOwner = taskData.taskOwner;
    const taskCreateDate = convertDateToInt(taskData.taskCreateDate);
    taskData.notes += `\n\n {State Transit to: ${taskState} }`

    // Insert the new task with the generated Task ID and other data
    await connection.query(
      `INSERT INTO task (
        Task_id, 
        Task_name, 
        Task_description, 
        Task_plan, 
        Task_notes, 
        Task_app_Acronym, 
        Task_state, 
        Task_creator, 
        Task_owner, 
        Task_createDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTaskID,
        taskData.title,
        taskData.description || "", // Optional
        taskData.planName || null, // Optional
        taskData.notes || null, // Optional
        appAcronym,
        taskState,
        taskCreator,
        taskOwner,
        taskCreateDate
      ]
    );

    // Commit the transaction
    await connection.commit();

    return { message: "Task created successfully", Task_id: newTaskID };
  } catch (error) {
    // Roll back the transaction in case of an error
    await connection.rollback();
    throw new Error(error.message);
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};


const getKanbanBoardByAppAcronym = async appAcronym => {
  try {
    // Query to get tasks with associated plan and application information
    const [tasks] = await db.query(
      `SELECT 
          t.Task_id AS taskID,
          t.Task_name AS title,
          t.Task_description AS description,
          t.Task_state AS taskState,
          t.Task_owner AS taskOwner,
          t.Task_creator AS taskCreator,
          t.Task_createDate AS taskCreateDate,
          t.Task_notes AS notes,
          p.Plan_MVP_name AS planName,
          p.Plan_color AS color
        FROM task t
        LEFT JOIN plan p ON t.Task_plan = p.Plan_MVP_name
        WHERE t.Task_app_Acronym = ?`,
      [appAcronym]
    );

    // Create the Kanban board structure
    let kanbanBoard = {
      open: [],
      todo: [],
      doing: [],
      done: [],
      closed: []
    };

    // Populate the Kanban board based on task state
    tasks.forEach(task => {
      const taskObj = {
        taskID: task.taskID,
        title: task.title,
        description: task.description || "",
        color: task.color || "#FFFFFF", // Default color if none exists
        taskOwner: task.taskOwner,
        planName: task.planName || "",
        taskState: task.taskState,
        taskCreator: task.taskCreator,
        taskCreateDate: convertIntToDate(task.taskCreateDate),
        notes: task.notes || ""
      };

      // Categorize task based on its state
      switch (task.taskState.toLowerCase()) {
        case "open":
          kanbanBoard.open.push(taskObj);
          break;
        case "todo":
          kanbanBoard.todo.push(taskObj);
          break;
        case "doing":
          kanbanBoard.doing.push(taskObj);
          break;
        case "done":
          kanbanBoard.done.push(taskObj);
          break;
        case "closed":
          kanbanBoard.closed.push(taskObj);
          break;
        default:
          break;
      }
    });
    //console.log(kanbanBoard);

    return kanbanBoard;
  } catch (error) {
    throw new Error(error.message);
  }
};



const stateTransitions = {
  open: ["todo"], // open can only move to todo
  todo: ["doing"], // todo can only move to doing
  doing: ["todo", "done"], // doing can move to done or back to todo
  done: ["doing", "closed"], // done can move to closing or back to doing
  closed: [] // closing is the final state, no transitions
};

const updateTaskState = async (task_id, newState) => {
  const connection = await db.getConnection();

  try {
    // Start the transaction
    await connection.beginTransaction();

    // Fetch the current state and notes of the task with a lock to prevent race conditions
    const [task] = await connection.query(
      "SELECT Task_state, Task_notes FROM task WHERE Task_id = ? FOR UPDATE",
      [task_id]
    );

    if (task.length === 0) {
      throw new Error(`Task with ID '${task_id}' not found`);
    }

    const currentState = task[0].Task_state;
    const currentNotes = task[0].Task_notes || ""; // Ensure notes are not null

    // Validate if the transition is allowed
    const allowedTransitions = stateTransitions[currentState];
    if (!allowedTransitions.includes(newState)) {
      throw new Error(
        `Invalid state transition: Cannot move from '${currentState}' to '${newState}'`
      );
    }

    // Append the state transition details to the notes
    const newNotes = `${currentNotes}\n\n{State Transited to: ${newState}}`;

    // Update the task's state and notes
    const [result] = await connection.query(
      "UPDATE task SET Task_state = ?, Task_notes = ? WHERE Task_id = ?",
      [newState, newNotes, task_id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update task state");
    }

    // Commit the transaction
    await connection.commit();

    return {
      message: `Task ${task_id} state updated from '${currentState}' to '${newState}'`
    };
  } catch (error) {
    // Roll back the transaction in case of an error
    await connection.rollback();
    throw new Error(error.message);
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};




const updateTask = async (taskData) => {
  const connection = await db.getConnection();

  const { taskState, taskCreator, taskOwner, taskCreateDate } = taskData;
  if (!taskState || !taskCreator || !taskOwner || !taskCreateDate) {
    return res.status(400).json({
      message:
        "Task_state, Task_creator, Task_owner, and Task_createDate are required fields"
    });
  }

  try {
    // Start the transaction to prevent race conditions
    await connection.beginTransaction();

    // Extract mandatory and optional fields from taskData
    let {
      taskID,
      planName,
      title,
      description,
      notes,
      taskState,
      taskCreator,
      taskOwner,
      taskCreateDate
    } = taskData;

    taskCreateDate = convertDateToInt(taskCreateDate);
 

    // Build the SQL query dynamically
    let query = `UPDATE task SET Task_state = ?, Task_creator = ?, Task_owner = ?, Task_createDate = ?`;
    const values = [taskState, taskCreator, taskOwner, taskCreateDate];

    // Append optional fields only if provided
    if (planName) {
      query += `, Task_plan = ?`;
      values.push(planName);
    }
    if (title) {
      query += `, Task_name = ?`;
      values.push(title);
    }
    if (description) {
      query += `, Task_description = ?`;
      values.push(description);
    }
    if (notes) {
      query += `, Task_notes = ?`;
      values.push(notes);
    }

    // Complete the SQL query
    query += ` WHERE Task_id = ?`;
    values.push(taskID);

    // Execute the update query
    const [result] = await connection.query(query, values);

    // Commit the transaction
    await connection.commit();

    if (result.affectedRows === 0) {
      throw new Error(`No task found with Task_id: ${taskID}`);
    }

    return { message: "Task updated successfully" };
  } catch (error) {
    // Rollback the transaction in case of an error
    await connection.rollback();
    throw new Error(`Failed to update task: ${error.message}`);
  } finally {
    // Release the connection
    connection.release();
  }
};



const getUserPermits = async (username, appAcronym) => {
  try {
    // Get the user's groups from the user_group table
    const [userGroups] = await db.query(
      `
      SELECT usergroup 
      FROM user_group 
      WHERE username = ?
    `,
      [username]
    );

    if (userGroups.length === 0) {
      throw new Error("User has no assigned groups");
    }

    // Extract the user groups
    const groups = userGroups.map((group) => group.usergroup);

    // Initialize permissions array
    const permissions = [];

    // First check if user belongs to 'PL' or 'PM' groups and add to the permissions list
    if (groups.includes("PL")) {
      permissions.push("PL");
    }
    if (groups.includes("PM")) {
      permissions.push("PM");
    }

    // If no App_Acronym is provided, just return PL/PM permissions
    if (!appAcronym) {
      return { permissions };
    }

    // If App_Acronym is provided, check the user’s permissions for that specific application
    const [applications] = await db.query(
      `
      SELECT 
        App_Acronym,
        App_permit_Open, 
        App_permit_toDoList, 
        App_permit_Doing, 
        App_permit_Done, 
        App_permit_create
      FROM application
      WHERE App_Acronym = ?
        AND (App_permit_Open IN (?) 
        OR App_permit_toDoList IN (?)
        OR App_permit_Doing IN (?)
        OR App_permit_Done IN (?)
        OR App_permit_create IN (?))
    `,
      [appAcronym, groups, groups, groups, groups, groups]
    );

    // If no application matches, return just PL/PM permissions
    if (applications.length === 0) {
      return { permissions };
    }

    // Build the permission list for the specific application
    const appPermissions = [...permissions]; // Start with global permissions (PL/PM)

    const app = applications[0]; // We're assuming only one application should match

    // Check if the user has application-level permits
    if (groups.includes(app.App_permit_Open)) {
      appPermissions.push("open");
    }
    if (groups.includes(app.App_permit_toDoList)) {
      appPermissions.push("todo");
    }
    if (groups.includes(app.App_permit_Doing)) {
      appPermissions.push("doing");
    }
    if (groups.includes(app.App_permit_Done)) {
      appPermissions.push("done");
    }
    if (groups.includes(app.App_permit_create)) {
      appPermissions.push("create");
    }

    return {
      App_Acronym: appAcronym,
      permissions: appPermissions
    };
  } catch (error) {
    throw new Error(error.message);
  }
};



;

const sendEmailToPLorPermitDone = async (App_Acronym) => {
  try {
    // Fetch all users who are in the 'PL' group or have 'permit_Done'
    const [users] = await db.query(
      `
      SELECT DISTINCT accounts.email 
      FROM accounts 
      JOIN user_group ON accounts.username = user_group.username
      JOIN application ON (user_group.usergroup = 'PL' OR application.App_permit_Done = user_group.usergroup)
      WHERE application.App_Acronym = ?
      AND (user_group.usergroup = 'PL' OR user_group.usergroup = application.App_permit_Done)
      `,
      [App_Acronym]
    );

    // Extract email addresses
    const emails = users.map((user) => user.email).filter((email) => email);

    // Check if any emails exist
    if (emails.length === 0) {
      throw new Error(
        'No users found with group "PL" or "permit_Done" for the given application.'
      );
    }

    // Create a transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Replace with your Gmail address
        pass: process.env.EMAIL_PASS, // Use App Password if 2FA is enabled
      },
    });

    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email
      to: emails.join(","),
      subject: "Task Notification",
      text: "Hello, this is a notification for the task related to your application.",
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success message
    return { message: `Email sent successfully to ${emails.length} users.` };
  } catch (error) {
    // Handle any errors
    console.log(error)
    throw new Error(`Error sending email: ${error.message}`);
  }
};

module.exports = {
  sendEmailToPLorPermitDone,
};




module.exports = {
  getAllApplicationByUsername,
  insertApplication,
  updateApplication,
  getAllPlansByAppAcronym,
  insertPlan,
  updateTaskPlan,
  insertTaskWithGeneratedTaskID,
  getKanbanBoardByAppAcronym,
  updateTaskState,
  updateTask,
  getUserPermits,
  sendEmailToPLorPermitDone
};