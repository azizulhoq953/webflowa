const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const forumRoutes = require('./routes/forumRoutes');
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const path = require('path');
const authenticateUser = require('./middleware/authenticateUser'); 
const Forum = require('./models/Forum');  // Make sure this import is at the top
const verifyAdmin = require('./middleware/verifyAdmin'); 
const User = require('./models/User');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

app.get('/api/forums', async (req, res) => {
  try {
    const forums = await Forum.find().populate('user', 'username'); // Populate user data with the 'username' field
    res.json(forums);
  } catch (err) {
    console.error('Error fetching forums:', err);
    res.status(500).json({ message: 'Error fetching forums' });
  }
});
app.post('/api/signing', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate the JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the response with the token and isAdmin field
    res.json({
      message: 'Login successful',
      token,
      isAdmin: user.isAdmin, // Include isAdmin here
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.delete('/api/forums/:id', authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const forumPost = await Forum.findByIdAndDelete(req.params.id);
    if (!forumPost) {
      return res.status(404).json({ message: 'Forum post not found' });
    }
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ message: 'Error deleting forum post' });
  }
});
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use routes for forum and auth
app.use('/api/forums', forumRoutes);
app.use('/api/auth', authRoutes); // Use authRoutes for authentication
// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

