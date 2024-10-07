const dotenv = require("dotenv");
const db = require("../config/database"); // Import the database connection
const nodemailer = require("nodemailer"); // Using nodemailer to send emails
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const ERROR_CODES = {
  SUCCESS: "SUCC2001",
  INVALID_INPUT: "ERR4001",
  ENTRY_EXISTS: "ERR4002",
  INVALID_STATE_CHANGE: "ERR4003",
  NOT_FOUND: "ERR4004",
  INVALID_CREDENTIALS: "ERR4005",
  NOT_AUTHORIZED: "ERR4006",
  INTERNAL_ERROR: "ERR5001"
};


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

const checkGroup = async (username, groupname) => {
  try {
    // Query the database to check if the user is in the specified group
    const [result] = await db.query(
      `
      SELECT 1 FROM user_group 
      WHERE username = ? AND usergroup = ?
      LIMIT 1
      `,
      [username, groupname]
    );

    // If a row is found, the user is in the group
    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(`Error checking group: ${error.message}`);
  }
};


const sendEmailToPLorPermitDone = (App_Acronym, task_id) => {
  // Fetch all users who are in the 'PL' group or have 'permit_Done'
  return db
    .query(
    `
    SELECT DISTINCT accounts.email 
    FROM accounts 
    JOIN user_group ON accounts.username = user_group.username
    JOIN application ON (user_group.usergroup = 'PL' OR application.App_permit_Done = user_group.usergroup)
    WHERE application.App_Acronym = ?
    AND (user_group.usergroup = 'PL' OR user_group.usergroup = application.App_permit_Done)
    `,
      [App_Acronym]
    )
    .then(([users]) => {
      // Extract email addresses
      const emails = users.map(user => user.email).filter(email => email);
console.log(emails);
      // Check if any emails exist
      if (emails.length === 0) {
      throw {
        message: "No Email Found",
        MsgCode: ERROR_CODES.NOT_FOUND
      };
      }

      // Create a transporter for Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Replace with your Gmail address
          pass: process.env.EMAIL_PASS // Use App Password if 2FA is enabled
        }
      });

      // Set up the email options
      const mailOptions = {
        from: process.env.EMAIL_USER, // Your email
        to: emails.join(","),
        subject: "Task Notification",
        text: `Hello, you have a Task ID:${task_id} in ${App_Acronym} to review`
      };

      // Send the email
      return transporter.sendMail(mailOptions);
    })
    .then(info => {
      // Return success message
      console.log("Email sent:", info.response);
      return { message: `Email sent successfully.` };
    })
    .catch(error => {
      // Handle any errors
      console.error("Error sending email:", error);
      throw new Error(`Error sending email: ${error.message}`);
    });
};




const CreateTask = async (req, res) => {
  const { username, password, appAcronym, taskName, description, taskNotes } = req.body;
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const browserType = req.headers["user-agent"];
  const urlParams = req.query
  const expectedKeys = [
    "username",
    "password",
    "appAcronym",
    "taskName",
    "description",
    "taskNotes"
  ];
  const bodyKeys = Object.keys(req.body);

  const connection = await db.getConnection();

  try {
    if (urlParams && Object.keys(urlParams).length != 0) {
      throw {
        message: "URL Params error",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    // Check if the body contains exactly the expected keys
    if (
      bodyKeys.length !== expectedKeys.length ||
      !bodyKeys.every(key => expectedKeys.includes(key))
    ) {
      throw {
        message: "Request body contains invalid or extra fields",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    if (!username || !password || !appAcronym || !taskName) {
      throw {
        message: "Mandatory fields not filled up",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    const [user] = await db.query(
      `
      SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups 
      FROM accounts a 
      LEFT JOIN user_group ug ON a.username = ug.username 
      WHERE a.username = ? GROUP BY a.username`,
      [username]
    );

    if (user.length === 0) {
      throw {
        message: "Invalid credentials",
        MsgCode: ERROR_CODES.INVALID_CREDENTIALS
      };
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      throw {
        message: "Invalid credentials",
        MsgCode: ERROR_CODES.INVALID_CREDENTIALS
      };
    }

    const token = jwt.sign(
      {
        id: user[0].username,
        ip: ipAddress,
        browser: browserType
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await connection.beginTransaction();
    // Lock the application row to prevent race conditions
    const [app] = await connection.query(
      "SELECT App_Rnumber, App_permit_create FROM application WHERE App_Acronym = ? FOR UPDATE",
      [appAcronym]
    );

    if (app.length === 0) {
      throw {
        message: "Application not found for the given App_Acronym",
        MsgCode: ERROR_CODES.NOT_FOUND
      };
    }

    // Check if the user has permission to create a task
    if (!app[0].App_permit_create) {
      throw {
        message: "App_permit_create Not created",
        MsgCode: ERROR_CODES.INVALID_STATE_CHANGE
      };
    }
    const permitCreate = app[0].App_permit_create;
    const hasPermission = await checkGroup(username, permitCreate);
    if (!hasPermission) {
      throw {
        message: "User does not have permission to create a task",
        MsgCode: ERROR_CODES.NOT_AUTHORIZED
      };
    }

    // Validate task name length (1 to 255 characters)
    if (taskName.length < 1 || taskName.length > 255) {
      throw {
        message: "Task_name must be between 1 and 255 characters",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
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
    const taskState = "doing";
    const taskCreator = username; // Use the username from request
    const taskOwner = username; // Assume taskOwner is also the creator
    const taskCreateDate = convertDateToInt(Date.now()); // Use current timestamp

    // Insert the new task with the generated Task ID and other data
    const result = await connection.query(
      `INSERT INTO task (
        Task_id, 
        Task_name, 
        Task_description, 
        Task_app_Acronym, 
        Task_state, 
        Task_creator, 
        Task_owner, 
        Task_notes,
        Task_createDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTaskID,
        taskName,
        description || "", // Optional
        appAcronym,
        taskState,
        taskCreator,
        taskOwner,
        taskNotes,
        taskCreateDate
      ]
    );

    // Fetch the newly inserted task
    const [tasks] = await connection.query(
      `SELECT * FROM task WHERE Task_id = ?`,
      [newTaskID]
    );

    const newTask = tasks[0]; // Assuming the task_id is unique and query returns one task

    // Commit the transaction
    await connection.commit();

    // Return success result
    res.status(200).json({
      result: newTask,
      MsgCode: ERROR_CODES.SUCCESS
    });
  } catch (error) {
    // Roll back the transaction in case of an error
    await connection.rollback();

    // Return the error response
    console.log(error)
    res.status(400).json({
      MsgCode: error.MsgCode || ERROR_CODES.INTERNAL_ERROR
    });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};



const GetTaskbyState = async (req, res) => {

  const { username, password, taskState, appAcronym } = req.body;
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const browserType = req.headers["user-agent"];
  const urlParams = req.query;
  const expectedKeys = ["username", "password", "taskState", "appAcronym"];
  const bodyKeys = Object.keys(req.body);

  try {
    // check URL params
    if (urlParams && Object.keys(urlParams).length != 0) {
      throw {
        message: "URL Params error",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    // Check if the body contains exactly the expected keys
    if (
      bodyKeys.length !== expectedKeys.length ||
      !bodyKeys.every(key => expectedKeys.includes(key))
    ) {
      throw {
        message: "Request body contains invalid or extra fields",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    // start login
    if (!username || !password || !appAcronym || !taskState) {
      throw {
        message: "Mandatory fields not filled up",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }
    const [user] = await db.query(
      `
      SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups 
      FROM accounts a 
      LEFT JOIN user_group ug ON a.username = ug.username 
      WHERE a.username = ? GROUP BY a.username`,
      [username]
    );

    if (user.length === 0) {
      throw {
        message: "Invalid credentials",
        MsgCode: ERROR_CODES.INVALID_CREDENTIALS
      };
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      throw {
        message: "Invalid credentials",
        MsgCode: ERROR_CODES.INVALID_CREDENTIALS
      };
    }

    // Generate JWT Token if needed
    const token = jwt.sign(
      {
        id: user[0].username,
        ip: ipAddress,
        browser: browserType
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const [app] = await db.query(
      "SELECT * FROM application WHERE App_Acronym = ?",
      [appAcronym]
    );

    if (app.length === 0) {
      throw {
        message: "Application not found for the given App_Acronym",
        MsgCode: ERROR_CODES.NOT_FOUND
      };
    }

    const [tasks] = await db.query(
      "SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?",
      [taskState, appAcronym]
    );

    // if (tasks.length === 0) {
    //   throw { message: "No tasks found in this state", MsgCode: ERROR_CODES.NOT_FOUND };
    // }

    return res.status(200).json({
      result: tasks,
      MsgCode: ERROR_CODES.SUCCESS
    });
  } catch (error) {
      console.log(error);
      res.status(400).json({
        MsgCode: error.MsgCode || ERROR_CODES.INTERNAL_ERROR
      });
    }
  };


  
const PromoteTask2Done = async (req, res) => {
  
  const { username, password, taskID, appAcronym } = req.body;
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const browserType = req.headers["user-agent"];
  const urlParams = req.query;
  const expectedKeys = ["username", "password", "taskID", "appAcronym"];
  const bodyKeys = Object.keys(req.body);

  const connection = await db.getConnection();

  if (urlParams && Object.keys(urlParams).length != 0) {
    throw {
      message: "URL Params error",
      MsgCode: ERROR_CODES.INVALID_INPUT
    };
  }

  try {
    // check URL params
    if (urlParams && Object.keys(urlParams).length != 0) {
      throw {
        message: "URL Params error",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    // Check if the body contains exactly the expected keys
    if (
      bodyKeys.length !== expectedKeys.length ||
      !bodyKeys.every(key => expectedKeys.includes(key))
    ) {
      throw {
        message: "Request body contains invalid or extra fields",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    if (!username || !password || !appAcronym || !taskID) {
      throw {
        message: "Mandatory fields not filled up",
        MsgCode: ERROR_CODES.INVALID_INPUT
      };
    }

    const [user] = await db.query(
      `
      SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups 
      FROM accounts a 
      LEFT JOIN user_group ug ON a.username = ug.username 
      WHERE a.username = ? GROUP BY a.username`,
      [username]
    );

    if (user.length === 0) {
      throw {
        message: "Invalid credentials",
        MsgCode: ERROR_CODES.INVALID_CREDENTIALS
      };
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      throw {
        message: "Invalid credentials",
        MsgCode: ERROR_CODES.INVALID_CREDENTIALS
      };
    }

    const token = jwt.sign(
      {
        id: user[0].username,
        ip: ipAddress,
        browser: browserType
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await connection.beginTransaction();

    const [app] = await connection.query(
      "SELECT App_permit_Doing FROM application WHERE App_Acronym = ? FOR UPDATE",
      [appAcronym]
    );

    if (app.length === 0) {
      throw {
        message: "Application not found for the given App_Acronym",
        MsgCode: ERROR_CODES.NOT_FOUND
      };
    }

    if (!app[0].App_permit_Doing) {
      throw {
        message: "App_permit_Doing Not created",
        MsgCode: ERROR_CODES.INVALID_STATE_CHANGE
      };
    }
    const permitDoing = app[0].App_permit_Doing;
    const hasPermission = await checkGroup(username, permitDoing);
    if (!hasPermission) {
      throw {
        message: "User does not have permission to create a task",
        MsgCode: ERROR_CODES.NOT_AUTHORIZED
      };
    }

    // Fetch current state with a lock
    const [task] = await connection.query(
      "SELECT Task_state FROM task WHERE Task_id = ? FOR UPDATE",
      [taskID]
    );
    if (task.length === 0 || task[0].Task_state !== "doing") {
      throw {
        message: "Task not found or not in the doing state",
        MsgCode: ERROR_CODES.INVALID_STATE_CHANGE
      };
    }

    await connection.query("UPDATE task SET Task_state = ? WHERE Task_id = ?", [
      "done",
      taskID
    ]);

    const result = await connection.query(
      "SELECT * from task WHERE Task_id = ?",
      [taskID]
    );

    await connection.commit();
    sendEmailToPLorPermitDone(appAcronym, taskID);
    res.status(200).json({
      result: result[0],
      MsgCode: ERROR_CODES.SUCCESS
    });
  } catch (error) {
    await connection.rollback();
    console.log(error);
    res.status(400).json({
      MsgCode: error.MsgCode || ERROR_CODES.INTERNAL_ERROR
    });
  } finally {
    connection.release();
  }
};


module.exports = {
  CreateTask,
  PromoteTask2Done,
  GetTaskbyState
};