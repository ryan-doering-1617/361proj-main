// Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupMovieClickListeners();
    document.querySelector('.add-review form').addEventListener('submit', submitReview);
    document.querySelector('.register form').addEventListener('submit', registerUser);
    document.querySelector('.login form').addEventListener('submit', loginUser);
});

// Check login status and set UI
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }

    logoutLink.replaceWith(logoutLink.cloneNode(true));
    const updatedLogoutLink = document.getElementById('logout-link');
    updatedLogoutLink.addEventListener('click', () => {
        localStorage.removeItem('token');
        alert('Logged out successfully.');
        checkLoginStatus();
        location.reload();
    });
}

// User Registration
async function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
        alert('Registration successful! Please log in.');
        document.querySelector('.register').classList.remove('active');
        document.querySelector('.login').classList.add('active');
    } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
    }
}

// User Login
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5003/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        checkLoginStatus();
        location.reload();
    } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error}`);
    }
}

// Fetch and Display User Profile
async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('profile-info').textContent = 'You need to log in to view your profile.';
        return;
    }

    const profileResponse = await fetch('http://localhost:5001/profile', {
        headers: { Authorization: token },
    });

    if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        document.getElementById('profile-info').innerHTML = `
            <p>Username: ${profileData.username}</p>
            <p>Email: ${profileData.email}</p>
        `;
        await displayUserReviews();
    } else {
        alert('Failed to load profile. Please log in again.');
    }
}

// Fetch and Display User Reviews
async function displayUserReviews() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('user-reviews-container');
    container.innerHTML = '';

    if (!token) {
        container.innerHTML = '<p>You need to log in to view your reviews.</p>';
        return;
    }

    const response = await fetch('http://localhost:5005/reviews/user', {
        headers: { Authorization: token },
    });

    if (response.ok) {
        const reviews = await response.json();
        if (reviews.length === 0) {
            container.innerHTML = '<p>No reviews posted yet.</p>';
        } else {
            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.innerHTML = `
                    <h4>${review.movieTitle}</h4>
                    <p>${review.reviewText} - <strong>${review.rating}/5</strong></p>
                    <small>${new Date(review.createdAt).toLocaleDateString()}</small>
                `;
                container.appendChild(reviewElement);
            });
        }
    } else {
        container.innerHTML = '<p>Failed to load reviews.</p>';
    }
}

// Setup Movie Click Listeners
function setupMovieClickListeners() {
    const movieImages = document.querySelectorAll('.movie-image');
    movieImages.forEach(img => {
        img.addEventListener('click', () => {
            const movieTitle = img.dataset.movie;
            document.getElementById('movie-title').textContent = movieTitle;
            document.getElementById('movie-description').textContent = img.dataset.description;
            document.getElementById('movie-rating').textContent = `Rating: ${img.dataset.rating}/5`;
            document.getElementById('movie-poster').src = img.dataset.poster;
            displayReviews(movieTitle);
        });
    });
}

// Fetch and Display Reviews for a Movie
async function displayReviews(movieTitle) {
    const response = await fetch(`http://localhost:5005/reviews/movie/${movieTitle}`);
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';

    if (response.ok) {
        const reviews = await response.json();
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews for this movie yet.</p>';
        } else {
            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.innerHTML = `
                    <p>${review.username} rated ${review.rating}/5</p>
                    <p>${review.reviewText}</p>
                    <small>${new Date(review.createdAt).toLocaleDateString()}</small>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        }
    } else {
        reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
    }
}

// Submit Review
async function submitReview(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to log in to submit a review.');
        return;
    }

    const movieTitle = document.getElementById('movie').value;
    const rating = document.getElementById('rating').value;
    const reviewText = document.getElementById('review').value;

    const response = await fetch('http://localhost:5005/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ movieTitle, rating, reviewText }),
    });

    if (response.ok) {
        alert('Review submitted successfully!');
        displayReviews(movieTitle);
    } else {
        const errorData = await response.json();
        alert(`Failed to submit review: ${errorData.error}`);
    }
}

// Cancel Review
function cancelReview() {
    document.querySelector('.add-review').classList.remove('active');
    document.querySelector('.movie-info').classList.add('active');
}
