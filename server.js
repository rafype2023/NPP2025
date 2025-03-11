const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Prediction Schema (Updated with Payment Method)
const predictionSchema = new mongoose.Schema({
  bracketPicks: [String],
  seriesLengths: [Number],
  champion: String,
  mvp: String,
  lastGameScore: [Number],
  paymentMethod: String,
  timestamp: { type: Date, default: Date.now }
});
const Prediction = mongoose.model('Prediction', predictionSchema);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// API to Save Prediction
app.post('/api/submit', async (req, res) => {
  const { bracketPicks, seriesLengths, champion, mvp, lastGameScore, paymentMethod } = req.body;

  // Validation
  if (!bracketPicks || !seriesLengths || !champion || !mvp || !lastGameScore || !paymentMethod) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (lastGameScore[0] <= lastGameScore[1]) {
    return res.status(400).json({ error: 'Winning score must be higher than losing score' });
  }
  if (!seriesLengths.every(length => [4, 5, 6, 7].includes(length))) {
    return res.status(400).json({ error: 'Series length must be between 4 and 7 games' });
  }

  const prediction = new Prediction({ bracketPicks, seriesLengths, champion, mvp, lastGameScore, paymentMethod });
  await prediction.save();

  // Send Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'user-email@example.com', // Replace with dynamic email if needed
    subject: 'NPP2025 Prediction Summary',
    text: `Your Prediction Summary:\n\nBracket: ${bracketPicks.join(', ')}\nSeries Lengths: ${seriesLengths.join(', ')}\nChampion: ${champion}\nMVP: ${mvp}\nLast Game Score: ${lastGameScore.join('-')}\nPayment Method: ${paymentMethod}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else console.log('Email sent: ' + info.response);
  });

  res.json({ message: 'Prediction saved and email sent', prediction });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
