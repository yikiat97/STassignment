const express = require("express");
const tmsController = require("../controllers/demoController");

const ERROR_CODES = {
  SUCCESS: "SUCC2001",
  INVALID_URL: "ERR3001",
  INVAILD_PARAMETER: "ERR3002",
  INVALID_INPUT: "ERR4002",
  INVALID_KEY: "ERR4001",
  INVALID_STATE_CHANGE: "ERR4003",
  NOT_FOUND: "ERR4004",
  INVALID_CREDENTIALS: "ERR4005",
  NOT_AUTHORIZED: "ERR4006",
  INTERNAL_ERROR: "ERR5001"
};

const router = express.Router();

router.use((req, res, next) => {
  console.log(`req.originalUrl: ${req.originalUrl}`);
  const validUrls = [
    "/api/demo/CreateTask",
    "/api/demo/GetTaskbyState",
    "/api/demo/PromoteTask2Done"
  ];
  const url = req.originalUrl.split("?")[0];
  console.log("incoming url:", url);

  let isValidUrl = false;

  for (const i of validUrls) {
    if (i.toLowerCase() === url.toLowerCase()) {
      isValidUrl = true;
      break;
    }
  }

  if (isValidUrl) {
    next();
    return;
  }

  res.status(400).json({ msgCode: ERROR_CODES.INVALID_URL });
  return;
});



    router.post("/CreateTask", tmsController.CreateTask);
    // Route to get tasks by state
    router.post("/GetTaskbyState", tmsController.GetTaskbyState);

    // Route to promote task from "doing" to "done"
    router.post("/PromoteTask2Done", tmsController.PromoteTask2Done);





module.exports = router;
