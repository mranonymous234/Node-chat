// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../supabaseClient');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into Supabase
  const { data, error } = await supabase.from('user').insert([
    {
      username,
      email,
      password_hash: hashedPassword,
      profile_pic: 'default.jpg',
      status: 'Hey there! I am using WhatsApp',
    },
  ]);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({ message: 'User registered successfully' });
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Fetch user from Supabase
  const { data: user } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  res.status(200).json({ message: 'Login successful', user });
});

module.exports = router;
