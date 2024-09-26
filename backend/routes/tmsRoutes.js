const express = require("express");
const tmsController = require("../controllers/tmsController");
const {
  authenticateToken,
  verifyTokenWithIPAndBrowser
} = require("../middleware/authMiddleware");


const router = express.Router();

// router.get("/verifyJWT", authenticateToken, userController.getResult);
router.get("/getApplicationByUsername", authenticateToken, tmsController.getAllApplicationByUsername);
router.post("/InsertApplications", authenticateToken, tmsController.insertApplicationController);
router.put('/updateApplication', authenticateToken, tmsController.updateApplicationController);

router.get( "/plans", authenticateToken, tmsController.getAllPlansByAppAcronymController);
router.post("/insertPlan", authenticateToken, tmsController.insertPlanController);
router.put("/editTaskPlan", tmsController.updateTaskPlanController);

router.post("/insertTask", authenticateToken, tmsController.insertTaskController);
router.get("/getAllTask", authenticateToken, tmsController.getKanbanBoardController);
router.put("/updateTaskState", authenticateToken,  tmsController.updateTaskStateController);
router.put("/UpdateTask", authenticateToken, tmsController.updateTask);
router.post("/getUserPermits", authenticateToken, tmsController.getUserPermitsController);
router.post("/notifyUsers", authenticateToken, tmsController.notifyUsers);


module.exports = router;
