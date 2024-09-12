const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllGroup = async (req, res) => {
  try {
    const users = await userService.getAllGroupByDistinct();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const insertNewGroup = async (req, res) => {
  const {groupName} = req.body;

  try {
    console.log(groupName);
    const users = await userService.insertNewGroupName(groupName);
 
    res.status(200).json({ message: "Group Updated"});
  } catch (error) {
     
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
  
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const browserType = req.headers["user-agent"];
    const { token, user } = await userService.userLogin(
      username,
      password,
      ipAddress,
      browserType
    );

    res.cookie("token", token, {
      httpOnly: true, // Makes sure the cookie is only accessible by the web server
      sameSite: "Strict", // Helps protect against CSRF attacks
      maxAge: 3600000 // 1 hour (same as token expiration)
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }
};

const register = async (req, res) => {
  const { email, password, username, group, active } = req.body;
  try {
    const user = await userService.userRegister(
      username,
      email,
      password,
      active,
      group
    );
    res.status(200).json({ message: "Register successful", user });
  } catch (error) {
    if (error.message === "username is already in use") {
      res.status(404).json({ message: error.message });
    } else if (error.message === "password missing") {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }
};


const updateUserController = async (req, res) => {
  const { username, email, password, accountStatus, usergroups } = req.body;
console.log(username);
  try {
    // Call the service to update the user
    const result = await userService.updateUser(
      username,
      email,
      password,
      accountStatus,
      usergroups
    );
    
    // Send success response
    return res.status(200).json(result);
  } catch (error) {
    // Catch any errors thrown from the service and send error response
    return res.status(400).json({ error: error.message });
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
  try {
    const result = await userService.getUserGroup(req.user.id);
    req.result = result; // Store the result in the request object
    res.status(200).json({ result: req.result, username: req.user.id });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
  // res.status(200).json("verified", req);
};

module.exports = {
  getAllUsers,
  getAllGroup,
  insertNewGroup,
  login,
  register,
  updateUserController,
  deletion,
  getResult
};
