const express = require("express");
const tmsController = require("../controllers/tmsController");
const {
  authenticateToken,
  verifyTokenWithIPAndBrowser
} = require("../middleware/authMiddleware");


const router = express.Router();

// router.get("/verifyJWT", authenticateToken, userController.getResult);
router.post("/getApplicationByUsername", authenticateToken, tmsController.getAllApplicationByUsername);
router.post( "/InsertApplications", verifyTokenWithIPAndBrowser("PL"), tmsController.insertApplicationController);//
router.put("/updateApplication", verifyTokenWithIPAndBrowser("PL"), tmsController.updateApplicationController);//

router.post( "/plans", authenticateToken, tmsController.getAllPlansByAppAcronymController);
router.post( "/insertPlan", verifyTokenWithIPAndBrowser("PM"), tmsController.insertPlanController);//
router.put("/editTaskPlan",authenticateToken , tmsController.updateTaskPlanController);

router.post("/insertTask", authenticateToken, tmsController.insertTaskController);//
router.post("/getAllTask", authenticateToken, tmsController.getKanbanBoardController);
router.put("/updateTaskState", authenticateToken,  tmsController.updateTaskStateController);//
router.put("/UpdateTask", authenticateToken, tmsController.updateTask);//

router.post("/getUserPermits", authenticateToken, tmsController.getUserPermitsController);//
router.post("/notifyUsers", authenticateToken, tmsController.notifyUsers);


module.exports = router;
