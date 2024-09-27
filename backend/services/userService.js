const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database"); // Import the database connection

dotenv.config();

// Get all users from the database
const getAllUsers = async () => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups
      FROM accounts a
      LEFT JOIN user_group ug ON a.username = ug.username
      GROUP BY a.username
    `);
    // Map over rows to split usergroups and add them back to each element
    const filteredRows = rows.map(element => {
      return {
        ...element, // Keep other properties as they are
        usergroups: element.usergroups ? element.usergroups.split(",") : [] // Split usergroups into an array or set to empty array if null
      };
    });

    return filteredRows;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserByUsername = async username => {
  try {
    // Prepare the query, including the parameter placeholder
    const query = `
      SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups
      FROM accounts a
      LEFT JOIN user_group ug ON a.username = ug.username
      WHERE a.username = ?
      GROUP BY a.username
    `;

    // Execute the query, passing the username as a parameter
    const [rows] = await db.query(query, [username]);

    // Since username should be unique, expect either one result or none
    if (rows.length) {
      const user = rows[0];
      return {
        ...user,
        usergroups: user.usergroups ? user.usergroups.split(",") : []
      };
    } else {
      return null; // or throw new Error('User not found') if you expect to always find a user
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


const getAllGroupByDistinct = async () => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT usergroup
      FROM user_group
    `);

    // Return the distinct groups
    return rows.map(row => row.usergroup);
  } catch (error) {
    throw new Error(error.message);
  }
};

const insertNewGroupName = async (groupName) => {
  try {
    // Validate the group name
    if (!groupName || groupName.trim() === "") {
      const error = new Error("Group name is required");
      error.status = 400;
      throw error;
    }

    if (groupName.length > 50) {
      const error = new Error(
        "Group name cannot be longer than 50 characters"
      );
      error.status = 400;
      throw error;
    }

    const validGroupName = /^[a-zA-Z0-9_]+$/;
    if (!validGroupName.test(groupName)) {
      const error = new Error(
        "Group name can only contain letters, numbers, and underscores"
      );
      error.status = 400;
      throw error;
    }

    // Check if the group already exists and insert if it doesn't
    const [rows] = await db.query('SELECT * FROM user_group WHERE usergroup = ?', [groupName]);

    if (rows.length > 0) {
      const error = new Error("Group already exists");
      error.status = 400;
      throw error;
    }

    // Insert the new group
    const [result] = await db.query('INSERT INTO user_group (usergroup) VALUES (?)', [groupName]);

    return result; // Return result if needed, otherwise just acknowledge success
  } catch (error) {
    throw error; // Rethrow the error to be handled by the controller
  }
};


// Handle user login
const userLogin = async (username, password, ipAddress, browserType) => {
  try {
    const [user] = await db.query(
      `
      SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups 
      FROM accounts a 
      LEFT JOIN user_group ug ON a.username = ug.username 
      WHERE a.username = ? GROUP BY a.username`,
      [username]
    );

    if (user.length === 0) {
      throw new Error("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: user[0].username,
          ip: ipAddress,
          browser: browserType
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return { token, user: user[0] };
    }

    throw new Error("Invalid credentials");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Handle user registration
const userRegister = async (username, email, password, active, groups) => {
  try {
    // Check if the username already exists in the accounts table
    const [existingUser] = await db.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username]
    );

    if (email){
      if (!email.includes("@")){
        throw new Error("Please use proper email");
      }
    }

    if (existingUser.length > 0) {
      throw new Error("Username is already in use");
    }

    // Check if password is provided
    if (!password) {
      throw new Error("Password missing");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the accounts table
    const [result] = await db.query(
      "INSERT INTO accounts (username, email, password, accountStatus) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, active]
    );

    // Insert groups into the user_group table
    if (groups && groups.length > 0) {
      for (const group of groups) {
        // Check if the username and group combination already exists
        const [existingGroup] = await db.query(
          "SELECT * FROM user_group WHERE username = ? AND usergroup = ?",
          [username, group]
        );

        if (existingGroup.length > 0) {
          throw new Error(
            `Duplicate group assignment: User '${username}' is already assigned to group '${group}'`
          );
        }

        // Insert the group if no duplicate found
        await db.query(
          "INSERT INTO user_group (username, usergroup) VALUES (?, ?)",
          [username, group]
        );
      }
    }

    return { result: result, message: "User registered successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};


const updateUser = async (username, email, password, active, groups) => {
  if (username === "admin") {
    throw new Error("This is the root admin, cannot be changed.");
  }

  if (email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validEmail = regex.test(email);

    if(!validEmail){
      throw new Error("Please use a proper email.");
    }
    
  }

  try {
    // Check if the user exists
    const [existingUser] = await db.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username]
    );
    if (existingUser.length === 0) {
      throw new Error("Username does not exist.");
    }

    // Prepare the dynamic update query
    let query = "UPDATE accounts SET ";
    let params = [];
    let hasChanges = false;

    // Handle email update if provided
    if (email && email !== existingUser[0].email) {
      query += "email = ?, ";
      params.push(email);
      hasChanges = true;
    }

    // Handle password update if provided
    let hashedPassword;
    if (password && password !== existingUser[0].password) {
      if (password.length < 8 || password.length > 10) {
        throw new Error("Password must be between 8 and 10 characters long.");
      }

      const hasAlphabet = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[@$!%*?&]/.test(password);

      if (!hasAlphabet || !hasNumber || !hasSpecialChar) {
        throw new Error(
          "Password must contain at least one letter, one number, and one special character."
        );
      }

      hashedPassword = await bcrypt.hash(password, 10);
      query += "password = ?, ";
      params.push(hashedPassword);
      hasChanges = true;
    }

    // Handle account status (active) update if provided
    if (active !== undefined && active !== existingUser[0].accountStatus) {
      query += "accountStatus = ?, ";
      params.push(active);
      hasChanges = true;
    }

    // Remove trailing comma and space
    if (hasChanges) {
      query = query.slice(0, -2); // Remove the last comma and space
      query += " WHERE username = ?";
      params.push(username);

      // Execute the update query only if there are changes
      await db.query(query, params);
    }

    // Handle updating the groups for the user if provided
    if (groups) {
      // Fetch the current groups for the user
      const [existingGroups] = await db.query(
        "SELECT usergroup FROM user_group WHERE username = ?",
        [username]
      );
      const existingGroupList = existingGroups.map(group => group.usergroup);

      // Find groups that need to be deleted (present in the current groups but not in the new list)
      const groupsToDelete = existingGroupList.filter(
        group => !groups.includes(group)
      );

      // Find groups that need to be inserted (present in the new list but not in the current groups)
      const groupsToInsert = groups.filter(
        group => !existingGroupList.includes(group)
      );

      // Delete groups that are no longer valid
      if (groupsToDelete.length > 0) {
        await db.query(
          "DELETE FROM user_group WHERE username = ? AND usergroup IN (?)",
          [username, groupsToDelete]
        );
      }

      // Insert new groups, checking for duplicates
      for (const group of groupsToInsert) {
        await db.query(
          "INSERT INTO user_group (username, usergroup) VALUES (?, ?)",
          [username, group]
        );
      }
    }

    return { message: "User updated successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};


const updateProfile = async (username, email, password, active, groups) => {
  if (username == "admin") {
    throw new Error("This is root admin, cannot be changed");
  }

  if (email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validEmail = regex.test(email);

    if (!validEmail) {
      throw new Error("Please use a proper email.");
    }
  }

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username]
    );
    if (existingUser.length === 0) {
      throw new Error("Username does not exist");
    }
    let hashedPassword;
    if (password) {
      if (password != existingUser[0].password) {
        if (password.length < 8 || password.length > 10) {
          throw new Error("Password must be between 8 and 10 characters long.");
        }

        const hasAlphabet = /[A-Za-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);

        if (!hasAlphabet || !hasNumber || !hasSpecialChar) {
          throw new Error(
            "Password must contain at least one letter, one number, and one special character."
          );
        }
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Update user details in the accounts table
      const result = await db.query(
        "UPDATE accounts SET email = ?, password = ?, accountStatus = ? WHERE username = ?",
        [email, hashedPassword || existingUser[0].password, active, username]
      );
      // Handle updating the groups for the user
      if (groups) {
        // Fetch the current groups for the user
        const [existingGroups] = await db.query(
          "SELECT usergroup FROM user_group WHERE username = ?",
          [username]
        );
        const existingGroupList = existingGroups.map(group => group.usergroup);
        // Find groups that need to be deleted (present in the current groups but not in the new list)
        const groupsToDelete = existingGroupList.filter(
          group => !groups.includes(group)
        );

        // Find groups that need to be inserted (present in the new list but not in the current groups)
        const groupsToInsert = groups.filter(
          group => !existingGroupList.includes(group)
        );

        // Delete groups that are no longer valid
        if (groupsToDelete.length > 0) {
          await db.query(
            "DELETE FROM user_group WHERE username = ? AND usergroup IN (?)",
            [username, groupsToDelete]
          );
        }

        // Insert new groups, checking for duplicates
        for (const group of groupsToInsert) {
          const [existingGroup] = await db.query(
            "SELECT * FROM user_group WHERE username = ? AND usergroup = ?",
            [username, group]
          );

          if (existingGroup.length > 0) {
            throw new Error(
              `Duplicate group assignment: User '${username}' is already assigned to group '${group}'`
            );
          }

          // Insert the new group
          await db.query(
            "INSERT INTO user_group (username, usergroup) VALUES (?, ?)",
            [username, group]
          );
        }
      }
    } else {
      throw new Error("Password must not be empty.");
    }

    return { message: "User updated successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};



// Delete a user by ID
const deleteUser = async id => {
  try {
    const [result] = await db.query("DELETE FROM accounts WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get user's group 
const getUserGroup = async username => {
  try {
    const [rows] = await db.query(
      `
      SELECT ug.usergroup 
      FROM user_group ug
      JOIN accounts a ON a.username = ug.username
      WHERE a.username = ?`,
      [username]
    );
    return rows.map(row => row.usergroup);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Check user's group membership
const checkGroup = async (username, groupname) => {
  try {
    const [rows] = await db.query(
      `
      SELECT COUNT(*) as count
      FROM user_group ug
      JOIN accounts a ON a.username = ug.username
      WHERE a.username = ? AND ug.usergroup = ?`,
      [username, groupname]
    );
    return rows[0].count > 0;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Check if user's account status is active or inactive
const checkUserStatus = async (username) => {
  try {
    const [rows] = await db.query(
      `
      SELECT accountStatus 
      FROM accounts
      WHERE username = ?`,
      [username]
    );
    
    if (rows.length === 0) {
      throw new Error("User not found");
    }

    // Return true if the accountStatus is 'active', false if it is 'inactive'
    return rows[0].accountStatus === 'Active';
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = {
  getAllUsers,
  getUserByUsername,
  getAllGroupByDistinct,
  insertNewGroupName,
  userLogin,
  userRegister,
  updateUser,
  deleteUser,
  checkGroup,
  getUserGroup,
  checkUserStatus,
  updateProfile
};

// const userRepository = require('../repos/userRepo');
// const dotenv = require('dotenv')
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken');

// dotenv.config();

// const checkGroup = async(username,requiredRoles) => {
//   // console.log(userRepository.checkGroupWithUserId(userId,requiredRoles))
//   return await userRepository.checkGroupWithUserId(username, requiredRoles);
// };

// const getAllUsers = async () => {
//     return await userRepository.getAllUsers();
//   };

// const userLogin = async (username , password ,ipAddress, browserType ) => {
//   try {

//     const user = await userRepository.getUserByUsername(username);
//     //console.log("userid: ",user)

//     if (user.length === 0){
//       throw new Error("User not found");
//     }
//     const passwordMatch = await bcrypt.compare(password, user[0].password);

//       if (passwordMatch) {

//         const token = jwt.sign(
//           { id: user[0].username,
//             ip: ipAddress,          // Include IP address in the JWT
//             browser: browserType
//           },
//           process.env.JWT_SECRET,
//           { expiresIn: "1h" }
//         ); //
//         return { token, user };
//       }
//       throw new Error('Invalid credentials');

//   } catch(error){
//     throw new Error(error.message)
//   }
// }

// const userRegister = async (email, password, username) => {
//   try {
//       const existingUser = await userRepository.getUserByUsername(email);
//       if (existingUser[0]) {
//         throw new Error('Email is already in use');
//       }

//       const hashedPassword = await bcrypt.hash(password, 10); //

//       const newUser = {
//       username,
//       email,
//       password: hashedPassword,
//     };

//     const savedUser = await userRepository.addUser(newUser);

//     const token = jwt.sign(
//       { id: savedUser.id, email: savedUser.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return { token, user: savedUser };

//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

// const deleteUser = async id => {
//   try {
//     // Optionally, you could check if the user exists before deletion
//     const affectedRows = await userRepository.deleteUserById(id);
//     if (affectedRows === 0) {
//       throw new Error("User not found");
//     }
//     return { message: "User deleted successfully" };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const getUserGroup = async id => {
//   try {
//     const userRole = await userRepository.getGroup(id);
//     console.log(userRole);
//     return userRole
//   } catch (error){
//     throw new Error(error.message);
//   }
// };

//   module.exports = {
//     getAllUsers,
//     userLogin,
//     userRegister,
//     deleteUser,
//     checkGroup,
//     getUserGroup
//   };
