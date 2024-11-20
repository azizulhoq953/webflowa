// const mongoose = require('mongoose');

// const forumSchema = new mongoose.Schema({
//   note: {
//     type: String,
//     required: true,
//   },
//   images: [{
//     type: String,
//     required: true,
//   }],
//   user: { 
//   type: mongoose.Schema.Types.ObjectId, ref: 'User' 
// },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Forum = mongoose.model('Forum', forumSchema);

// module.exports = Forum;


const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Ensure title is provided
    maxlength: 255 // Optional: max length for the title
  },
  note: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This should reference the 'User' model
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;
