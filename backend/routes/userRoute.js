const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken,verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

const router = express.Router();

// router.get("/verifyJWT", authenticateToken, userController.getResult);
router.get("/users", authenticateToken, userController.getAllUsers );
router.get("/allGroup", authenticateToken, userController.getAllGroup);
router.post(
  "/addNewGroup",
  verifyTokenWithIPAndBrowser("admin"),
  userController.insertNewGroup
);
router.put("/updateUser", verifyTokenWithIPAndBrowser('admin'), userController.updateUserController);
router.post('/login', userController.login);
router.post('/register', userController.register);
router.put("/updateUser", verifyTokenWithIPAndBrowser('admin'), userController.updateUserController);
router.delete("/userDelete/:id", userController.deletion);


// Protected Routes for frontend
router.get('/Application', authenticateToken, userController.getResult);

router.get('/UserManagement', verifyTokenWithIPAndBrowser('admin'), (req, res) => {
    res.status(200).json({ message: "admin" });
  }, userController.getResult);


module.exports = router;