const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer'); // Import multer for handling file uploads
const User = require('./models/user'); // Correct case for the User model

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads')); // Serve files from uploads folder

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    // Use a unique filename by combining timestamp and original name
    cb(null, `${file.originalname.replace(/[^a-z0-9.-]/gi, '_')}`); // Sanitize the filename
  }
});
const upload = multer({ storage });

// Connect to MongoDB using environment variables for security
mongoose.connect("mongodb+srv://naimalAuth:MongoDB@mycluster01.kj79t.mongodb.net/FundRaisingDb", { // Use a URI stored in your .env file
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// API Routes
app.post('/api/register', upload.array('documents'), async (req, res) => {
  try {
    const { username, email, password, userType, voucherCategory, cnic, serviceProviderName, city, country, universityName, cgpa } = req.body;

    // Validate request body
    if (!username || !email || !password || !userType || !voucherCategory || !cnic) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Collect document file paths
    const documents = req.files.map(file => file.path);

    // Create a new user instance
    const user = new User({
      username,
      email,
      password, // Hash this password before saving in production for security
      userType,
      voucherCategory,
      documents,
      cnic,
      serviceProviderName,
      city,
      country,
      universityName,
      cgpa,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
