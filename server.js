const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Microservice Base URLs
const REGISTER_SERVICE_URL = 'http://localhost:5002/register';
const LOGIN_SERVICE_URL = 'http://localhost:5003/login';
const PROFILE_SERVICE_URL = 'http://localhost:5004/profile';
const REVIEWS_SERVICE_URL = 'http://localhost:5005';
const RANDOM_MOVIE_SERVICE_URL = 'http://localhost:5006/random-movie';

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Forward Register Requests
app.post('/register', async (req, res) => {
    try {
        const response = await axios.post(REGISTER_SERVICE_URL, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Register Service:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to register user' });
    }
});

// Forward Login Requests
app.post('/login', async (req, res) => {
    try {
        const response = await axios.post(LOGIN_SERVICE_URL, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Login Service:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to log in' });
    }
});

// Forward Profile Requests
app.get('/profile', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const response = await axios.get(PROFILE_SERVICE_URL, {
            headers: { Authorization: token },
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Profile Service:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/reviews', async (req, res) => {
    console.log('Forwarding /reviews request with Authorization header');
    const token = req.headers.authorization;

    if (!token) {
        console.error('Unauthorized: Missing token');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Forward the request to the Reviews Microservice
        const response = await axios.post(`${REVIEWS_SERVICE_URL}/reviews`, req.body, {
            headers: { Authorization: token },
        });

        console.log('Response from Reviews Service:', response.data);
        res.status(response.status).json(response.data); // Forward the response back to the client
    } catch (error) {
        console.error(
            'Error forwarding to Reviews Service (add review):',
            error.response?.data || error.message
        );
        res.status(error.response?.status || 500).json({ error: 'Failed to add review' });
    }
});


// Forward Reviews by Movie Title
app.get('/reviews/movie/:movieTitle', async (req, res) => {
    try {
        const response = await axios.get(`${REVIEWS_SERVICE_URL}/movie/${req.params.movieTitle}`);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Reviews Service (movie):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch reviews by movie' });
    }
});

app.get('/reviews/user', async (req, res) => {
    console.log('Forwarding /reviews/user request with Authorization header');
    const token = req.headers.authorization; // Pass Authorization header as is

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const response = await axios.get(`${REVIEWS_SERVICE_URL}/user`, {
            headers: { Authorization: token }, // Forward the token
        });

        console.log('Response from Reviews Service:', response.data);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Reviews Service (user):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch reviews by user' });
    }
});

app.get('/random-movie', async (req, res) => {
    try {
        const response = await axios.get(RANDOM_MOVIE_SERVICE_URL);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Random Movie Service:', error.message);
        res.status(500).json({ error: 'Failed to fetch random movie' });
    }
});
// Start the Main Server
app.listen(PORT, () => {
    console.log(`Main Server running on http://localhost:${PORT}`);
});