
const express = require('express');
const multer = require('multer');
const path = require('path');
const Forum = require('../models/Forum');
const authenticateUser = require('../middleware/authenticateUser');  // Adjust the path as necessary

const router = express.Router();

// Existing multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// router.post('/', upload.array('images', 5), authenticateUser, async (req, res) => {
//   try {
//     const { title } = req.body;
//     const { note } = req.body;
//     const images = req.files.map((file) => file.path);

//     // Ensure that user is set properly
//     const userId = req.user ? req.user._id : null;  // The user is set by authenticateUser middleware

//     // If user is not authenticated, return an error
//     if (!userId) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     const newForum = new Forum({
//       title,
//       note,
//       images,
//       user: userId,  // Assign the authenticated user's ID here
//     });

//     await newForum.save();

//     res.status(201).json({ message: 'Forum submitted successfully!' });
//   } catch (error) {
//     console.error('Error during forum submission:', error);
//     res.status(500).json({ message: 'Error submitting forum', error: error.message });
//   }
// });


router.post('/', upload.array('images', 5), authenticateUser, async (req, res) => {
  try {
    const { title, note } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    // Ensure that user is set properly
    const userId = req.user ? req.user._id : null;  // The user is set by authenticateUser middleware

    // If user is not authenticated, return an error
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Handle multiple forum posts
    const forumsData = Array.isArray(title) ? title.map((_, index) => ({
      title: title[index],
      note: note[index],
      images: images.slice(index * 5, (index + 1) * 5), // Handling images in batches
      user: userId,
    })) : [{
      title,
      note,
      images,
      user: userId,
    }];

    // Create forum posts
    const newForums = await Forum.insertMany(forumsData);

    res.status(201).json({
      message: 'Forum submitted successfully!',
      forums: newForums,
    });
  } catch (error) {
    console.error('Error during forum submission:', error);  // Detailed log
    res.status(500).json({
      message: 'Error submitting forum',
      error: error.message,
    });
  }
});



// Route to update a forum post
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
      const { title } = req.body;
      const { note } = req.body;
      const images = req.files ? req.files.map((file) => file.path) : []; // If new images are uploaded
  
      // Find the forum post by ID and update it
      const updatedForum = await Forum.findByIdAndUpdate(
        req.params.id,
        { title, note, images },
        { new: true } // Return the updated document
      );
  
      if (!updatedForum) {
        return res.status(404).json({ message: 'Forum post not found' });
      }
  
      res.status(200).json({ message: 'Forum updated successfully', updatedForum });
    } catch (error) {
      console.error('Error updating forum:', error);
      res.status(500).json({ message: 'Error updating forum', error: error.message });
    }
  });

// Route to get all forums
router.get('/', async (req, res) => {
  try {
    const forums = await Forum.find(); // Fetch all forums from MongoDB
    res.status(200).json(forums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ message: 'Error fetching forums', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const forumPost = await Forum.findByIdAndDelete(req.params.id);
    if (!forumPost) {
      return res.status(404).json({ message: 'Forum post not found' });
    }
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting forum post' });
  }
});

module.exports = router;