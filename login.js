const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5003; // Port for the Login Microservice
const JWT_SECRET = 'privacy_key'; // Replace with an environment variable in production
const MONGO_URI = 'mongodb+srv://doerinry:NdxpUM5NQZprqk4F@cluster0.uzyexde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // MongoDB connection URI

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB for Login Service'))
    .catch(error => console.error('Failed to connect to MongoDB:', error));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Start the Login Service
app.listen(PORT, () => {
    console.log(`Login Service running on http://localhost:${PORT}`);
});