const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const login = async (req, res) => {
  const { username, password} = req.body;

  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const browserType = req.headers['user-agent'];
    const { token, user } = await userService.userLogin(username, password, ipAddress, browserType);

    res.cookie("token", token, {
      httpOnly: true, // Makes sure the cookie is only accessible by the web server
      //secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent over HTTPS in production
      sameSite: "Strict", // Helps protect against CSRF attacks
      maxAge: 3600000 // 1 hour (same as token expiration)
    });

    res.status(200).json({ message: "Login successful", user, token });
    
  } catch (error) {
    
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
    } else if (error.message === 'Invalid credentials') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  }
};


const register = async (req, res) => {
  const {email, password, username} = req.body;
  try {
    const { token, user } = await userService.userRegister(email, password, username);
    res.status(200).json({ message: "Register successful", token, user });
    
  } catch (error) {
    console.log(error.message);
  }
};


const deletion = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await userService.deleteUser(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getResult = async (req, res) => {
  res.status(200).json("verified");
}

module.exports = {
  getAllUsers,
  login,
  register,
  deletion,
  getResult
};