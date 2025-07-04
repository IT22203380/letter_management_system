// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.model');
// const router = express.Router();

// // Register
// router.post('/register', async (req, res) => {
//   const { nic, username, password, role } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ nic, username, password: hashedPassword, role });
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     res.status(400).json({ message: 'Registration failed', error: err.message });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { nic, password } = req.body;
//   try {
//     const user = await User.findOne({ where: { nic } });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const accessToken = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' }
//     );
//     const refreshToken = jwt.sign(
//       { id: user.id },
//       process.env.JWT_REFRESH_SECRET,
//       { expiresIn: '7d' }
//     );
//     res.cookie('refreshToken', refreshToken, { httpOnly: true });
//     res.json({ accessToken });
//   } catch (err) {
//     res.status(500).json({ message: 'Login failed', error: err.message });
//   }
// });

// // Refresh token
// router.post('/refresh', (req, res) => {
//   const token = req.cookies.refreshToken;
//   if (!token) return res.sendStatus(401);
//   try {
//     const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//     const newAccessToken = jwt.sign(
//       { id: userData.id },
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' }
//     );
//     res.json({ accessToken: newAccessToken });
//   } catch (err) {
//     res.status(403).json({ message: 'Invalid refresh token' });
//   }
// });

// module.exports = router;