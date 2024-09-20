const tmsService = require("../services/tmsService");

const getAllApplicationByUsername = async (req, res) => {
  const username = req.query.username;
  try {
    const users = await tmsService.getAllApplicationByUsername(username);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(409).json({ error: error.message }); // Conflict status for duplicate entry
    }
    res.status(500).json({ error: error.message }); // General server error
  }
};


module.exports = {
  getAllApplicationByUsername,
  insertApplicationController,
};
