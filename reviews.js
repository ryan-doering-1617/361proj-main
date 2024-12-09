const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5005; // Port for the Reviews Microservice
const JWT_SECRET = 'privacy_key'; // Replace with an environment variable in production
const MONGO_URI = 'mongodb+srv://doerinry:NdxpUM5NQZprqk4F@cluster0.uzyexde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // MongoDB connection URI

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB for Reviews Service'))
    .catch(error => console.error('Failed to connect to MongoDB:', error));

// Review Schema
const reviewSchema = new mongoose.Schema({
    movieTitle: { type: String, required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);




app.post('/reviews', async (req, res) => {
    console.log('Processing request for /reviews');
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header

    if (!token) {
        console.error('Unauthorized: Missing token');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Decode the token
        const { username } = decoded; // Extract username from decoded token
        console.log('Decoded username:', username);

        const { movieTitle, rating, reviewText } = req.body;
        console.log('Received data:', { movieTitle, rating, reviewText });

        if (!movieTitle || !rating) {
            console.error('Validation error: Movie title and rating are required.');
            return res.status(400).json({ error: 'Movie title and rating are required.' });
        }

        // Create and save the new review
        const newReview = new Review({
            movieTitle,
            username, // Use username from decoded token
            rating,
            reviewText,
        });

        await newReview.save();
        console.log('Review added successfully:', newReview);
        res.status(201).json({ message: 'Review added successfully!' });
    } catch (error) {
        console.error('Error adding review:', error.message);
        res.status(500).json({ error: 'Failed to add review.' });
    }
});



// Get Reviews by Movie Title
app.get('/movie/:movieTitle', async (req, res) => {
    const { movieTitle } = req.params;

    try {
        const reviews = await Review.find({ movieTitle }).sort({ createdAt: -1 }); // Sort by latest
        if (reviews.length === 0) {
            return res.status(404).json({ error: 'No reviews found for this movie' });
        }

        res.json(reviews.map(review => ({
            movieTitle: review.movieTitle,
            username: review.username || 'Anonymous',
            rating: review.rating,
            reviewText: review.reviewText,
            createdAt: review.createdAt,
        })));
    } catch (error) {
        console.error('Error fetching reviews by movie:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.get('/user', async (req, res) => {
    console.log('Processing request for /user');
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Decode the token
        const reviews = await Review.find({ username: decoded.username }).sort({ createdAt: -1 }); // Fetch reviews by username

        if (reviews.length === 0) {
            return res.status(404).json({ error: 'No reviews found for this user' });
        }

        console.log('Fetched Reviews:', reviews);
        res.json(reviews); // Return reviews
    } catch (error) {
        console.error('Error fetching reviews by user:', error.message);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});


// Start the Register Service
app.listen(PORT, () => {
    console.log(`Register Service running on http://localhost:${PORT}`);
});