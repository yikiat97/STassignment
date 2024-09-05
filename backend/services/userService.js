const userRepository = require('../repos/userRepo');
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

dotenv.config();

const checkGroup = async(userId,requiredRoles) => {
  // console.log(userRepository.checkGroupWithUserId(userId,requiredRoles))
  return await userRepository.checkGroupWithUserId(userId,requiredRoles);
};

const getAllUsers = async () => {
    return await userRepository.getAllUsers();
  };

const userLogin = async (username , password ,ipAddress, browserType ) => {
  try {
  
    const user = await userRepository.getUserByUsername(username);
    //console.log("userid: ",user)
    
    if (user.length === 0){
      throw new Error("Invalid credentials")
    }
    const passwordMatch = await bcrypt.compare(password, user[0].password);
   
      if (passwordMatch) {

        const token = jwt.sign(
          { id: user[0].id,           
            ip: ipAddress,          // Include IP address in the JWT
            browser: browserType  
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        ); //
        return { token, user };
      }
      throw new Error('Invalid credentials');
    
  } catch(error){
    throw new Error(error.message)
  }
}


const userRegister = async (email, password, username) => {
  try {
      const existingUser = await userRepository.getUserByUsername(email);
      if (existingUser[0]) {
        throw new Error('Email is already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10); // 

      const newUser = {
      username,
      email,
      password: hashedPassword,
    };

    const savedUser = await userRepository.addUser(newUser);

    const token = jwt.sign(
      { id: savedUser.id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, user: savedUser };

  } catch (error) {
    throw new Error(error.message);
  }
}


const deleteUser = async id => {
  try {
    // Optionally, you could check if the user exists before deletion
    const affectedRows = await userRepository.deleteUserById(id);
    if (affectedRows === 0) {
      throw new Error("User not found");
    }
    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

  module.exports = {
    getAllUsers,
    userLogin,
    userRegister,
    deleteUser,
    checkGroup
  };