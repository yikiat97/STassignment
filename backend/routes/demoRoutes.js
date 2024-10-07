const express = require("express");
const tmsController = require("../controllers/demoController");

const router = express.Router();

router.post("/CreateTask", tmsController.CreateTask);
// Route to get tasks by state
router.post("/GetTaskbyState", tmsController.GetTaskbyState);

// Route to promote task from "doing" to "done"
router.post("/PromoteTask2Done", tmsController.PromoteTask2Done);

module.exports = router;
