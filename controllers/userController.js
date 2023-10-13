const db = require('../db'); // Import your database connection
const User = require('../models/user');

async function createUser(user) {
  // Your code to create a user in the database
}

async function updateUser(user) {
  // Your code to update a user in the database
}

async function getUser(userId) {
    try {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await db.oneOrNone(query, userId);
    
        if (result) {
          return result;
        } else {
          return null; // User not found
        }
      } catch (error) {
        throw error;
      }
}

module.exports = {
  createUser,
  updateUser,
  getUser,
};
