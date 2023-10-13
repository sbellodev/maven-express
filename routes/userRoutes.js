const userController = require('../controllers/userController');
const fileUpload = require('express-fileupload');
const express = require('express');
const router = express.Router();
router.use(fileUpload());

router.get('/usersettings/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10); 
    const userSettings = await userController.getUserSettings(userId)
    
    res.status(200).json(userSettings)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addmessage', async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming you send the userId in the request body
    const chatId = req.body.chatId; // Assuming you send the chatId in the request body
    const message = req.body.message; // Assuming you send the message in the request body

    const result = await userController.addMessage(userId, chatId, message);

    if (result) {
      res.status(201).json({ message: result.message }); // Respond with the newly added message
    } else {
      res.status(404).json({ message: 'Message not added' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/adduser', async (req, res) => {
  try {
    const user = req.body; // Assuming the user data is sent in the request body

    const result = await userController.addUser(user);

    if (result.success) {
      res.status(201).json({ message: result.message, userId: result.userId });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/updateusersettings/', async (req, res) => {
  try {
    const { id } = req.body;
    const rawUserId = id || null
    const userId = parseInt(rawUserId, 10); // Convert the ID parameter to an integer
    const newSettings = req.body; // Assuming the new settings are sent in the request body
    const result = await userController.updateUserSettings(userId, newSettings);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/userlogin/:email/:password', async (req, res) => {
  try {
    const email = req.params.email;
    const password = req.params.password;

    // Call the userController to check if a user with the given email and password exists
    const userExists = await userController.checkUserLogin(email, password);
    if (userExists !== null) {
      const userId = await userController.getUserIdByEmail(email, password)
      res.status(200).json(userId);
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/deleteimage', async (req, res) => {
  try {
    const { id, userId } = req.body;
    if(!id || !userId) return;
    // Call the userController to delete the image
    const result = await userController.deleteImage(id, userId);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/usertimeline/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10); // Convert the ID parameter to an integer
    const user = await userController.getUser(userId);
    const userCityId = user?.city_id;
    const nearUsers = await userController.getNearUsers(userCityId)

    if (user && userCityId && nearUsers) {
      res.json(nearUsers);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/adduserlike', async (req, res) => {
  try {
    const likerId = parseInt(req.body.likerId, 10); // ID of the user who liked
    const likedId = parseInt(req.body.likedId, 10); // ID of the user being liked
    const success = await userController.addUserLike(likerId, likedId);

    if (success) {
      await userController.createChatRoom(likerId, likedId);
      const chatRoomId = await userController.getChatRoomByUsersId(likerId, likedId)
      if(!chatRoomId) res.status(400).json({ message: 'User like already exists' });
      await userController.createInitialChatLog(chatRoomId, likerId, 'Hi, I like you!'); // You can customize the initial message
      
    } else {
      console.error("Error: User Like Add Failure.");
    }

  } catch (error) {
    console.error(error);
  }
});

router.get('/userchats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10); // Convert the user ID parameter to an integer
    const chatPreviews = await userController.getUserChatPreviews(userId);

    if (chatPreviews) {
      res.json(chatPreviews);
    } else {
      res.status(404).json({ message: 'No chat previews found for the user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chat/:chatId', async (req, res) => {
  try {
    const chatId = parseInt(req.params.chatId, 10); // Convert the user ID parameter to an integer
    const userChat = await userController.getChatByUserId(chatId);

    // Send the user's chat data as a JSON response
    res.status(200).json(userChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addprofileimage/', async (req, res) => {
  try {
    const { id } = req.body;
    const rawUserId = id[0] || null
    if(!rawUserId) return res.status(500).json({ error: 'Internal server error' });

    const userId = parseInt(rawUserId, 10) 

    // Check the number of existing profile images
    const numImages = await userController.getNumImagesById(userId);

    if (numImages >= 4) {
      return res.status(400).json({ error: "You can't upload more than 4 images" });
    }

    // Handle file uploads
    if (req.files) {
      // Assuming you have named the file input field "file"
      const file = req.files.files;

      if (file) {
        const result = await userController.saveFile(userId, file);

        if (result.success) {
          res.status(200).json({ message: 'File added' });
        } else {
          res.status(400).json({ error: 'File upload failed' });
        }
      } else {
        res.status(400).json({ error: 'File was empty' });
      }
    } else {
      res.status(400).json({ error: 'No files were uploaded' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/userprofile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10); // Convert the ID parameter to an integer

    // Call the userController to get user profile information
    const userProfile = await userController.getUserProfile(userId);

    if (userProfile) {
      res.status(200).json(userProfile);
    } else {
      res.status(404).json({ message: 'User not found or no animal image exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
