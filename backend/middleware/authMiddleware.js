const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userService = require('../services/userService');

dotenv.config();



const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentIp = req.ip || req.connection.remoteAddress;
    const currentBrowser = req.headers['user-agent'];  
    
    // Check if the token's IP address and browser type match the current ones
    if (decoded.ip !== currentIp || decoded.browser !== currentBrowser) {
        return res.status(401).send('Invalid token: IP or browser mismatch');
    }

    //const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user information to the request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};


// Middleware to protect routes and check user roles
const verifyTokenWithIPAndBrowser =  (requiredRoles) => async(req, res, next) => {
  const token = req.cookies.token;  // Assume token is stored in cookies
  
  if (!token) {
    res.clearCookie('token');
    return res.status(403).send('token Forbidden: No token received ');;  // Redirect to login if no token is provided
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    console.log(decoded.id)
    console.log(req.ip)
    console.log(req.headers['user-agent'])
    console.log(requiredRoles)
    // console.log(userChecked)

    const currentIp = req.ip || req.connection.remoteAddress;
    const currentBrowser = req.headers['user-agent'];  
    const userChecked = await userService.checkGroup(decoded.id,requiredRoles)
    console.log(userChecked)

    // Compare decoded token IP and browser with the current request
    if (decoded.ip == currentIp && decoded.browser == currentBrowser && userChecked) {
      next();
    }
    else{
      res.clearCookie('token');  // Clear token cookie if IP or browser don't match
      return res.status(403).send('Forbidden: You do not have access to this resource');
    }

   

  } catch (error) {
    res.clearCookie('token');
    return res.status(403).send('Forbidden: token is invalid');
  }
};




module.exports = {
  authenticateToken,
  verifyTokenWithIPAndBrowser
};
