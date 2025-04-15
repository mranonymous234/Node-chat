const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const cors = require('cors');

// Initialize Supabase
const supabase = createClient('https://qbwmwolxdaykhicyqjoy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFid213b2x4ZGF5a2hpY3lxam95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjcyODYsImV4cCI6MjA2MDMwMzI4Nn0.IkXDUfGGOTj2Jm_h3R7xK7fNmISM5Qt_CtzRq8bCK9k');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static'))); // Serve static files (CSS, JS, etc.)
app.use(cors()); // Enable CORS

// Routes
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'register.html'));
});

app.get('/chat', async (req, res) => {
    // Fetch users from Supabase for the chat page
    const { data: users, error } = await supabase
        .from('users')
        .select('id, username')
        .neq('id', 1); // Replace 1 with the logged-in user ID
    
    if (error) {
        return res.status(400).send('Error fetching users');
    }

    res.render('chat.html', { users });
});

// API for user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    // Insert user into Supabase
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        return res.status(400).send(error.message);
    }

    await supabase
        .from('users')
        .insert([{ username, email, user_id: data.user.id }]);

    res.redirect('/login');
});

// API for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signIn({
        email,
        password,
    });

    if (error) {
        return res.status(400).send(error.message);
    }

    // Session can be handled with a token or cookie
    res.redirect('/chat');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
