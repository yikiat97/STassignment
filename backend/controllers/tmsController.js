const tmsService = require("../services/tmsService");

const getAllApplicationByUsername = async (req, res) => {
  const username = req.query.username;
  try {
    const users = await tmsService.getAllApplicationByUsername(username);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getAllApplicationByUsername,
};
