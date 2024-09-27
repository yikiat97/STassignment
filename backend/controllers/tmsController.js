const tmsService = require("../services/tmsService");

const getAllApplicationByUsername = async (req, res) => {
  const {username} = req.body;
  
  try {
    const users = await tmsService.getAllApplicationByUsername(username);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const insertApplicationController = async (req, res) => {
  try {
    // Extract application data from the request body
    const appData = req.body;

    // Call the service to insert the application
    const result = await tmsService.insertApplication(appData);

    // Return success response
    res.status(201).json({
      message: "Application created successfully",
      data: result
    });
  } catch (error) {
    // Handle errors, including duplicate App_Acronym
    if (
      error.message == "App Name already exists, please use a unique App Name"
    ) {
      return res.status(409).json({ message: error.message }); // Conflict status for duplicate entry
    }
    res.status(500).json({ message: error.message }); // General server error
  }
};


const updateApplicationController = async (req, res) => {
  try {
    const appData = req.body; // Get the updated application data from the request body

    // Call the service function to update the application
    const result = await tmsService.updateApplication(appData);

    // Check if the update was successful
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Application updated successfully' });
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
};


const getAllPlansByAppAcronymController = async (req, res) => {
  try {
  
    const {appAcronym} = req.body;
    // Call the service to get all plans for the given App_Acronym
    const plans = await tmsService.getAllPlansByAppAcronym(appAcronym);

    res.status(200).json(plans); // Send the plans as the response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const insertPlanController = async (req, res) => {
  try {
    const planData = req.body; // Get plan data from the request body

    // Call the service to insert the plan
    const result = await tmsService.insertPlan(planData);

    res.status(200).json({ message: "Plan inserted successfully", result });
  } catch (error) {
    // Handle errors and send appropriate response
    if (
      error.message.includes("mandatory fields") ||
      error.message.includes("already exists") ||
      error.message.includes("does not exist")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "An error occurred while inserting the plan",
        details: error.message
      });
    }
  }
};



const updateTaskPlanController = async (req, res) => {
  try {
   
    const { task_id, newTaskPlan } = req.body; // Get the new task plan from the request body

    // Validate if newTaskPlan is provided
    if (!newTaskPlan || newTaskPlan.trim() === "") {
      return res.status(400).json({ error: "New task plan is required" });
    }

    // Call the service function to update the task plan
    const result = await tmsService.updateTaskPlan(task_id, newTaskPlan);

    res.status(200).json(result); // Send success response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const insertTaskController = async (req, res) => {
  try {
    const { taskData, username, appAcronym } = req.body; // Get App_Acronym from request body
    //const taskData = req.body; // Assume the task data is also in the body
    //const currentUser = req.user.username; // Assuming you have the current user available in req.user

    // Call the service to insert the task with a unique Task ID and the specified values
    const result = await tmsService.insertTaskWithGeneratedTaskID(
      appAcronym,
      username,
      taskData,
      //currentUser
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getKanbanBoardController = async (req, res) => {
  try {
    const {appAcronym} = req.body;
    //console.log(appAcronym)
    // Fetch the Kanban board structure
    const kanbanBoard = await tmsService.getKanbanBoardByAppAcronym(appAcronym);

    res.status(200).json(kanbanBoard); // Send the Kanban board as the response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateTaskStateController = async (req, res) => {
  try {
 
    const { task_id, newState, username } = req.body; // Get the new state from the request body

    // Validate if newState is provided
    if (!newState || newState.trim() === "") {
      return res.status(400).json({ error: "New state is required" });
    }

    // Call the service function to update the task state
    const result = await tmsService.updateTaskState(
      task_id,
      newState,
      username
    );

    res.status(200).json(result); // Send success response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateTask = async (req, res) => {
  const { taskData, username, NewState } = req.body;
  console.log(NewState);

  try {

    // Call the updateTask service to handle the update
    const result = await tmsService.updateTask(taskData, username, NewState);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserPermitsController = async (req, res) => {
  const { username,appAcronym } = req.body;

  try {
    const userPermissions = await tmsService.getUserPermits(username,appAcronym);

    // if (userPermissions.length === 0) {
    //   return res.status(404).json({ message: "No permissions found for user" });
    // }

    res.status(200).json({
      message: "Permissions retrieved successfully",
      permissions: userPermissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const notifyUsers = async (req, res) => {
  const { App_Acronym } = req.body; // Assuming the application acronym is passed in the body

  try {
    const result = await tmsService.sendEmailToPLorPermitDone(App_Acronym);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = {
  getAllApplicationByUsername,
  insertApplicationController,
  updateApplicationController,
  getAllPlansByAppAcronymController,
  insertPlanController,
  updateTaskPlanController,
  insertTaskController,
  getKanbanBoardController,
  updateTaskStateController,
  updateTask,
  getUserPermitsController,
  notifyUsers
};
