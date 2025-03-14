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
  .catch(err => console.error('MongoDB connection error:', err));

// Prediction Schema
const predictionSchema = new mongoose.Schema({
  westPlayIn7: String, // Western Conference No. 7 Seed
  westPlayIn8: String, // Western Conference No. 8 Seed
  eastPlayIn7: String, // Eastern Conference No. 7 Seed
  eastPlayIn8: String, // Eastern Conference No. 8 Seed
  seriesResults: [String], // Combined winner and series length (e.g., "1. Lakers -6")
  champion: String,
  mvp: String,
  lastGameScore: [Number],
  paymentMethod: String,
  name: String,
  phone: String,
  comments: String,
  email: String,
  timestamp: { type: Date, default: Date.now },
  formattedSummary: String
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
  try {
    const { westPlayIn7, westPlayIn8, eastPlayIn7, eastPlayIn8, seriesResults, champion, mvp, lastGameScore, paymentMethod, name, phone, comments, email } = req.body;

    // Validation
    if (!seriesResults || seriesResults.some(result => !result || result.includes(' -undefined')) || !champion || !mvp || !lastGameScore || !paymentMethod || !name || !phone || !email) {
      return res.status(400).json({ error: 'All required fields are required' });
    }
    if (lastGameScore[0] <= lastGameScore[1]) {
      return res.status(400).json({ error: 'Winning score must be higher than losing score' });
    }
    // Extract series lengths from seriesResults (e.g., "1. Lakers -6" -> 6) for validation
    const seriesLengths = seriesResults.map(result => {
      const match = result.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : NaN;
    });
    if (!seriesLengths.every(length => [4, 5, 6, 7].includes(length))) {
      return res.status(400).json({ error: 'Series length must be between 4 and 7 games' });
    }

    // Format the summary (same as email body)
    const formattedSummary = `
Email: ${email}
Phone: ${phone || 'N/A'}
Comments: ${comments || 'N/A'}
Payment Method: ${paymentMethod} - Envie Pago al ${phone}

Play-In Selections:

Eastern Conference:
No. 7 Seed: ${eastPlayIn7 || 'N/A'}
No. 8 Seed: ${eastPlayIn8 || 'N/A'}
Western Conference:
No. 7 Seed: ${westPlayIn7 || 'N/A'}
No. 8 Seed: ${westPlayIn8 || 'N/A'}

Eastern Conference:
First Round:
${seriesResults[7] || 'N/A'}
${seriesResults[8] || 'N/A'}
${seriesResults[9] || 'N/A'}
${seriesResults[10] || 'N/A'}
Semifinals:
${seriesResults[11] || 'N/A'}
${seriesResults[12] || 'N/A'}
Conference Final:
${seriesResults[13] || 'N/A'}

Western Conference:
First Round:
${seriesResults[0] || 'N/A'}
${seriesResults[1] || 'N/A'}
${seriesResults[2] || 'N/A'}
${seriesResults[3] || 'N/A'}
Semifinals:
${seriesResults[4] || 'N/A'}
${seriesResults[5] || 'N/A'}
Conference Final:
${seriesResults[6] || 'N/A'}

Finals:
${champion || 'N/A'} vs ${seriesResults[13]} vs ${seriesResults[6]}

Winner: ${champion} (${seriesResults[14] || 'N/A'})
MVP: ${mvp}
Last Game Score: ${lastGameScore.join(' - ') || 'N/A'}
Thanks for participating in the NBA Playoff Pool 2025!
    `.trim();

    const prediction = new Prediction({
      westPlayIn7,
      westPlayIn8,
      eastPlayIn7,
      eastPlayIn8,
      seriesResults,
      champion,
      mvp,
      lastGameScore,
      paymentMethod,
      name,
      phone,
      comments,
      email,
      formattedSummary
    });
    await prediction.save();

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'NPP2025 Prediction Summary',
      text: formattedSummary
    };
    await transporter.sendMail(mailOptions);
    console.log('Email sent to:', email);

    res.json({ message: 'Prediction saved and email sent', prediction });
  } catch (error) {
    console.error('Error submitting prediction:', error);
    res.status(500).json({ error: 'Failed to submit prediction' });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));