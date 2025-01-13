const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';

app.use(bodyParser.json());

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  

  try {
    // Fetch users from Mockend
    const response = await axios.get('https://mockend.com/api/Bakemono-san/mockservertest/auth');
    const users = response.data;

    // Find the user
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Validate the password
    const isMatch = password == user.password;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate Access Token
    const token = jwt.sign({ id: user.id,email: user.username,profile: user.cover }, SECRET_KEY);
    console.log(token);
    
    res.json({ token_key: token,user: user });
  } catch (error) {
    res.status(500).json({ message: 'Error validating user', error: error.message });
  }
});

// Middleware to Verify Token
const authenticate = (req, res, next) => {
  
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Proxy to Mockend
app.get('/:endpoint', authenticate, async (req, res) => {
  const endpoint = req.params.endpoint;
  

  try {
    const response = await axios.get(`https://mockend.com/api/Bakemono-san/mockservertest/${endpoint}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from Mockend', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
