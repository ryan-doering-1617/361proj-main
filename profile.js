const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5004; // Port for the Profile Microservice
const JWT_SECRET = 'privacy_key'; // Replace with an environment variable in production
const MONGO_URI = 'mongodb+srv://doerinry:NdxpUM5NQZprqk4F@cluster0.uzyexde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // MongoDB connection URI

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB for Profile Service'))
    .catch(error => console.error('Failed to connect to MongoDB:', error));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

// Profile Endpoint
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ username: user.username, email: user.email });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Start the Profile Service
app.listen(PORT, () => {
    console.log(`Profile Service running on http://localhost:${PORT}`);
});