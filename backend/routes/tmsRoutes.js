const express = require("express");
const tmsController = require("../controllers/tmsController");
const {
  authenticateToken,
  verifyTokenWithIPAndBrowser
} = require("../middleware/authMiddleware");


const router = express.Router();

// router.get("/verifyJWT", authenticateToken, userController.getResult);
router.get(
  "/getApplicationByUsername",
  authenticateToken,
  tmsController.getAllApplicationByUsername
);

router.post("/InsertApplications", tmsController.insertApplicationController);

router.put('/updateApplication', tmsController.updateApplicationController);



module.exports = router;
