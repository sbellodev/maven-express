const db = require('../db'); // Import your database connection
const User = require('../models/user');
const UserAnimalData = require('../models/userAnimal'); // Import your model if needed
const UserSettings = require('../models/userSettings')

async function saveFile(user_id, file) {
  try {
    const { name, data, mimetype } = file;
    const imageBuffer = Buffer.from(data);
    const img_encoded = imageBuffer.toString('base64');

    const query = `
      INSERT INTO animalimage (user_id, img_name, img_encoded, img_type)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [user_id, name, img_encoded, mimetype];

    await db.query(query, values);

    return { success: true, message: 'File added' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'File upload failed' };
  }
}

async function deleteImage(id, userId) {
  try {
    // Implement your logic to delete the image here
    // For example, you can run a DELETE query to remove the image from the database
    const deleteQuery = 'DELETE FROM animalimage WHERE id = $1 AND user_id = $2';
    const result = await db.query(deleteQuery, [id, userId]);

    if (result.rowCount > 0) {
      // If the image was successfully deleted
      return { success: true, message: 'Image deleted successfully' };
    } else {
      // If the image was not found or deletion was not successful
      return { success: false, message: 'Image not found or deletion failed' };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function addUser(user) {
  try {
    // Check if the email already exists in the database
    const emailExistsQuery = 'SELECT id FROM users WHERE email = $1';
    const emailExistsResult = await db.query(emailExistsQuery, [user.email]);

    if (emailExistsResult.rows.length > 0) {
      return { success: false, message: 'Email already exists' };
    }

    // If the email doesn't exist, insert the new user into the database
    const insertUserQuery = `
      INSERT INTO users (name, city_id, email, password, animal_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [user.name, user.cityId, user.email, user.password, user.animalName];
    const insertResult = await db.query(insertUserQuery, values);

    // Check if the user was successfully inserted
    if (insertResult.rows.length > 0) {
      const userId = insertResult.rows[0].id;
      return { success: true, message: 'User added successfully', userId };
    } else {
      return { success: false, message: 'User insertion failed' };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUserChatPreviews(userId) {
  try {
    // Your code to query the database to fetch chat previews for the user
    const query = `
    WITH LatestAnimalImages AS (
        SELECT
            ai1.user_id,
            ai1.img_encoded,
            ai1.img_type
        FROM animalimage ai1
        WHERE
            ai1.id = (
                SELECT MAX(ai2.id) 
                FROM animalimage ai2
                WHERE ai2.user_id = ai1.user_id
            )
    )
    
    , ChatPreviews AS (
        SELECT
            cr.id AS chat_id,
            u.id AS other_user_id,
            u.name AS other_user_name,
            cl.message AS last_message,
            cl.created_at AS last_message_timestamp
        FROM chatroom AS cr
        JOIN chatlogs AS cl ON cr.id = cl.chatroom_id
        JOIN users AS u ON (cr.user1_id = u.id OR cr.user2_id = u.id)
        WHERE
            (cr.user1_id = $1 OR cr.user2_id = $1)
            AND cl.created_at = (
                SELECT MAX(cl2.created_at) 
                FROM chatlogs cl2
                WHERE cl2.chatroom_id = cr.id
            )
    )
    
    SELECT
        cp.chat_id,
        cp.other_user_id,
        cp.other_user_name,
        cp.last_message,
        cp.last_message_timestamp,
        lai.img_encoded,
        lai.img_type 
    FROM ChatPreviews cp
    LEFT JOIN LatestAnimalImages lai ON lai.user_id = cp.other_user_id
    ORDER BY cp.last_message_timestamp DESC;
    
      `; 
    const result = await db.query(query, [userId]);

    return result.rows; // Return the chat previews as an array
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getChatByUserId(chatId) {
  try {
    // Execute the SQL query with userId as a parameter
    const query = ` 
      SELECT
        cl.id AS message_id,
        u.id AS user_id,
        u.name,
        cl.message,
        cl.created_at,
        ai.img_encoded,
        ai.img_type 
      FROM chatlogs cl
      JOIN users u ON cl.user_id = u.id
        LEFT JOIN animalimage ai ON cl.user_id = ai.user_id
      WHERE cl.chatroom_id = $1
      ORDER BY cl.created_at`;

    const result = await db.query(query, [chatId]);

    // Process the result as needed
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUserSettings(userId) {
  try {
    // Define your SQL query
    const query = `
      SELECT u.id, u.name, u.animal_name, ai.img_encoded, ai.img_type, c.id as city_id, c.name AS city_name
      FROM users u
      INNER JOIN (
        SELECT user_id, img_encoded, img_type
        FROM animalimage
        WHERE user_id = $1
        ORDER BY id DESC
        LIMIT 1
      ) ai ON ai.user_id = u.id
      LEFT JOIN City c ON c.id = u.city_id
      WHERE u.id = $1
    `;

    // Execute the query and return the result
    const result = await db.query(query, [userId]);

    if (result && result.rows && result.rows.length > 0) {
      // Process the result and map it to your model, if needed
      const userSettings = new UserSettings(
        result.rows[0].id,
        result.rows[0].name,
        result.rows[0].animal_name,
        result.rows[0].img_encoded,
        result.rows[0].img_type,
        result.rows[0].city_id,
        result.rows[0].city_name
      );

      return userSettings;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

async function addUserLike(likerId, likedId) {
  try {
    // Check if a user like already exists
    const existingLike = await db.query(
      'SELECT * FROM userlike WHERE liker_id = $1 AND liked_id = $2',
      [likerId, likedId]
    );

    if (existingLike.rows.length === 0) {
      // If the like doesn't exist, insert it into the UserLike table
      await db.query(
        'INSERT INTO userlike (liker_id, liked_id, created_at) VALUES ($1, $2, NOW())',
        [likerId, likedId]
      );
    }

    return true; // Indicate that the like was added successfully
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getChatRoomByUsersId(user1Id, user2Id){
  try {
    const chatRoom = await db.query(
      'SELECT id FROM chatroom WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
      [user1Id, user2Id]
    );

    if(chatRoom?.rows[0]?.id){
      return chatRoom.rows[0].id
    }
    return null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createChatRoom(user1Id, user2Id) {
  try {
    const chatRoom = await db.query(
      'SELECT * FROM chatroom WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
      [user1Id, user2Id]
    );

    if (chatRoom.rows.length === 0) {
      await db.query(
        'INSERT INTO chatroom (user1_id, user2_id, created_at) VALUES ($1, $2, NOW())',
        [user1Id, user2Id]
      );
    }
    
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createInitialChatLog(roomId, senderId, message) {
  try {
    // Create an initial chat log for the match
    await db.query(
      'INSERT INTO chatlog (chatroom_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW())',
      [roomId, senderId, message]
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateUserSettings(userId, newSettings) {
  try {
    // Define your SQL update query
    const query = `
      UPDATE users
      SET
        name = CASE WHEN $1 <> '' THEN $1 ELSE name END,
        animal_name = CASE WHEN $2 <> '' THEN $2 ELSE animal_name END,
        city_id = CASE WHEN $3 <> 0 THEN $3 ELSE city_id END
      WHERE id = $4
    `;
  

    // Extract the new settings
    const { name, animalName, cityId } = newSettings;

    // Execute the update query
    const result = await db.query(query, [name, animalName, cityId, userId]);

    // Check if the update was successful
    if (result.rowCount > 0) {
      return { success: true, message: 'User settings updated successfully' };
    } else {
      return { success: false, message: 'User not found or no changes made' };
    }
  } catch (error) {
    throw error;
  }
}

async function getNearUsers(cityId) {
  try {
    // TODO: Use CityId
    const query = `
      SELECT u.id, u.name, a.animal_name, ai.img_array, ai.img_type, 0 as distance
      FROM (
        SELECT user_id, array_to_string(array_agg(img_encoded), ',') AS img_array,
        array_to_string(array_agg(img_type), ',') AS img_type
        FROM animalimage
        GROUP BY user_id
      ) ai
      INNER JOIN animal a ON (a.user_id = ai.user_id)
      INNER JOIN users u ON (u.id = ai.user_id)
      WHERE u.id > 1
    `;

    // Execute the query and return the result
    const result = await db.query(query);

    // Process the result as needed, e.g., map it to your model
    if(result && result.rows && result.rows[0]){
      const nearUsers = result.rows.map(row => {
        return new UserAnimalData(
          row.id,
          row.name,
          row.animal_name,
          row.img_array,
          row.img_type,
          row.distance
        );
      });
      return nearUsers;
    }
    return [];
  } catch (error) {
    throw error;
  }
}

async function checkUserLogin(email, password) {
  try {
    // Your logic to check if a user with the given email and password exists in the database
    // You would typically execute a query to check the user's credentials and return the user ID
    // For security reasons, consider using password hashing and comparing hashed passwords

    const query = 'SELECT email FROM users WHERE email = $1 AND password = $2';
    const result = await db.query(query, [email, password]);

    if (result && result.rows && result.rows.length > 0) {
      return true
    } else {
      return false; // User not found
    }
  } catch (error) {
    throw error;
  }
}

async function getUserProfile(userId) {
  try {
    const query = `
      SELECT
        ai.img_encoded as img_encoded,
        ai.img_type,
        ai.id,
        u.animal_name 
      FROM users u
      LEFT JOIN animalimage ai ON u.id = ai.user_id
      WHERE u.id = $1;
    `;

    const result = await db.query(query, [userId]);
    if (result.rows.length > 0) {
      return result.rows;
    } else {
      return null; // User not found or no animal image exists
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUserIdByEmail(email, password){
  try {
    const query = 'SELECT id FROM users WHERE email = $1 AND password = $2';
    const result = await db.query(query, [email, password]);

    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null; // User not found
    }
  } catch (error) {
    throw error;
  }
}

async function getUser(userId) {
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [userId]);

    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0]; // Assuming you want to return the first user
    } else {
      return null; // User not found
    }
  } catch (error) {
    throw error;
  }
}

async function getNumImagesById(userId) {
  try {
    const query = 'SELECT COUNT(*) FROM animalimage WHERE user_id = $1';
    const values = [userId];

    const result = await db.query(query, values);

    // The result.rows[0] will contain the count
    const count = result?.rows[0]?.count;
    return count;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  getUser,
  saveFile,
  addUser, 
  addUserLike,
  deleteImage,
  getNearUsers,
  getUserProfile,
  createChatRoom,
  checkUserLogin,
  getUserSettings,
  getChatByUserId,
  getUserIdByEmail,
  updateUserSettings,
  getUserChatPreviews,
  createInitialChatLog,
  getChatRoomByUsersId,
  getNumImagesById
};
