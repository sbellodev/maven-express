const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/users', (req, res) => {
  // Your route handling code using userController.createUser
});

// Update a user
router.put('/users/:id', (req, res) => {
  // Your route handling code using userController.updateUser
});

// Get a user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10); // Convert the ID parameter to an integer
    const user = await userController.getUser(userId);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
