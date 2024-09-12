const db = require('../config/database');

const checkGroupWithUserId = async (username, group) => {
  const [rows] = await db.query(`
    SELECT COUNT(*) as count
    FROM user_group ug
    JOIN accounts a ON a.username = ug.username
    WHERE a.username = ? AND ug.usergroup = ?`,
    [username, group]
  );

  return rows[0].count > 0;
};

const getAllUsers = async () => {
  const [rows, fields] = await db.query('SELECT * FROM accounts')
  return rows;
  };


const getUserByUsername = async(username) => {
  //const rows = await db.query('SELECT * from accounts WHERE username = ?', [username])
  const rows = await db.query(`
    SELECT a.*, GROUP_CONCAT(ug.usergroup) AS usergroups 
    FROM accounts a 
    LEFT JOIN user_group ug ON a.username = ug.username 
    WHERE a.username = ? GROUP BY a.id`, [username])
  
  return rows[0];
}


const addUser = async user => {
  const { username, email, password } = user;
  const [result] = await db.query(
    "INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  
  return result;
};


// to be scrape off at the end of the day
const deleteUserById = async id => {
  const [result] = await db.query("DELETE FROM accounts WHERE id = ?", [id]);
  return result.affectedRows;  
};

const getGroup = async username => {
  const [rows] = await db.query(`
    SELECT ug.usergroup 
    FROM user_group ug
    JOIN accounts a ON a.username = ug.username
    WHERE a.username = ?`,
    [username]
  );

  return rows.map(row => row.usergroup);
};

  module.exports = {
    checkGroupWithUserId,
    getAllUsers,
    getUserByUsername,
    addUser,
    deleteUserById,
    getGroup
  };