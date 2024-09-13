const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userService = require('../services/userService');

dotenv.config();



const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentIp = req.ip || req.connection.remoteAddress;
    const currentBrowser = req.headers["user-agent"];
    const checkUserStatus = await userService.checkUserStatus(decoded.id);

    if (
      decoded.ip == currentIp &&
      decoded.browser == currentBrowser &&
      checkUserStatus
    ) {
      req.user = decoded; 

      next();
    } else {
      return res.status(401).send({ message: "Access denied" });
    }

 
  } catch (error) {
    res.status(403).json({ message: "Access denied" });
  }
};


// Middleware to protect routes and check user roles
const verifyTokenWithIPAndBrowser =  (requiredRoles) => async(req, res, next) => {
  const token = req.cookies.token;  // Assume token is stored in cookies
  
  if (!token) {
    res.clearCookie('token');
    return res.status(403).send({ message: "Access denied" });;  // Redirect to login if no token is provided
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    // console.log(decoded.id)
    // console.log(req.ip)
    // console.log(req.headers['user-agent'])
    // console.log(requiredRoles)
    // console.log(userChecked)

    const currentIp = req.ip || req.connection.remoteAddress;
    const currentBrowser = req.headers['user-agent'];  
    const checkUserStatus = await userService.checkUserStatus(decoded.id);
    const userChecked = await userService.checkGroup(decoded.id,requiredRoles)
    req.user = decoded;
    //console.log(userChecked)

    // Compare decoded token IP and browser with the current request
    if (
      decoded.ip == currentIp &&
      decoded.browser == currentBrowser &&
      userChecked &&
      checkUserStatus
    ) {
      next();
    } else {
      res.clearCookie("token"); // Clear token cookie if IP or browser don't match
      return res.status(404).json({ message: "Access denied" });
    }

   

  } catch (error) {
    res.clearCookie('token');
    return res.status(403).send({ message: 'Access denied' });
  }
};




module.exports = {
  authenticateToken,
  verifyTokenWithIPAndBrowser
};
