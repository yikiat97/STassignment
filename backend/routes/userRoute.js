const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken,verifyTokenWithIPAndBrowser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/verifyJWT", authenticateToken, userController.getResult);
router.get("/users", authenticateToken, userController.getAllUsers );
router.post('/login', userController.login);
router.post('/register', userController.register)
router.delete("/userDelete/:id", userController.deletion);


// Protected Routes
router.get('/Application', verifyTokenWithIPAndBrowser('users'), (req, res) => {
    res.status(200).json({ message: "users" });
  }, userController.getResult);
router.get('/UserManagement', verifyTokenWithIPAndBrowser('admin'), (req, res) => {
    res.status(200).json({ message: "admin" });
  }, userController.getResult);


module.exports = router;