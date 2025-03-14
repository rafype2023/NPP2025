const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
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
  westPlayIn7: String,
  westPlayIn8: String,
  eastPlayIn7: String,
  eastPlayIn8: String,
  seriesResults: [String],
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

    if (!seriesResults || seriesResults.some(result => !result || result.includes(' -undefined')) || !champion || !mvp || !lastGameScore || !paymentMethod || !name || !phone || !email) {
      return res.status(400).json({ error: 'All required fields are required' });
    }
    if (lastGameScore[0] <= lastGameScore[1]) {
      return res.status(400).json({ error: 'Winning score must be higher than losing score' });
    }
    const seriesLengths = seriesResults.map(result => {
      const match = result.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : NaN;
    });
    if (!seriesLengths.every(length => [4, 5, 6, 7].includes(length))) {
      return res.status(400).json({ error: 'Series length must be between 4 and 7 games' });
    }

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

// Route to display results
app.get('/results', async (req, res) => {
  try {
    // Fetch the "clave" record
    const claveRecord = await Prediction.findOne({
      name: "CLAVE",
      phone: "CLAVE",
      comments: "CLAVE"
    });

    if (!claveRecord) {
      return res.status(404).send('<h1>Error: Clave record not found</h1><p>Please ensure a record with name, phone, and comments set to "CLAVE" exists in the database.</p>');
    }

    // Fetch all predictions except the clave record
    const predictions = await Prediction.find({
      name: { $ne: "CLAVE" },
      phone: { $ne: "CLAVE" },
      comments: { $ne: "CLAVE" }
    });

    // Define possible teams and MVPs for Finals analysis
    const possibleTeams = [
      "Celtics", "Bucks", "Pacers", "Heat", "Knicks", "Cavaliers", "Magic", "Pistons", "Hawks", "Wizards",
      "Nuggets", "Suns", "Warriors", "Lakers", "Clippers", "Grizzlies", "Rockets", "Pelicans", "Spurs", "Timberwolves", "Thunder"
    ];
    const possibleMVPs = [
      "De Andre Hunter", "Ty Jerome", "Jaylen Brown", "Jayson Tatum", "Jalen Brunson", "Karl-Anthony Towns",
      "Giannis Antetokounmpo", "Damian Lillard", "Tyrese Haliburton", "Bennedict Mathurin", "Cade Cunningham",
      "Jaden Ivey", "Jimmy Butler", "Bam Adebayo", "Paolo Banchero", "Franz Wagner", "Shai Gilgeous-Alexander",
      "Josh Giddey", "LeBron James", "Luka Dončić", "Nikola Jokić", "Jamal Murray", "Ja Morant", "Jaren Jackson Jr.",
      "Jalen Green", "Jabari Smith Jr.", "Kawhi Leonard", "Paul George", "Stephen Curry", "J. Tatum"
    ];

    // Initialize Finals prediction analysis
    const finalsWinnerCounts = possibleTeams.reduce((acc, team) => ({ ...acc, [team]: 0 }), {});
    const finalsMVPCounts = possibleMVPs.reduce((acc, mvp) => ({ ...acc, [mvp]: 0 }), {});

    // Calculate scores for each prediction
    const scoredPredictions = predictions.map(prediction => {
      const scores = {
        firstRound: [],
        semifinals: [],
        conferenceFinals: [],
        finals: [],
        totalScore: 0
      };

      // First Round (Indices 0-3: West w1-w4, 7-10: East e1-e4)
      const firstRoundKeys = [
        { key: 'w1', index: 0 }, { key: 'w2', index: 1 }, { key: 'w3', index: 2 }, { key: 'w4', index: 3 },
        { key: 'e1', index: 7 }, { key: 'e2', index: 8 }, { key: 'e3', index: 9 }, { key: 'e4', index: 10 }
      ];
      firstRoundKeys.forEach(({ key, index }) => {
        const predResult = prediction.seriesResults[index] || '';
        const claveResult = claveRecord.seriesResults[index] || '';
        const predWinner = predResult.split(' -')[0] || '';
        const claveWinner = claveResult.split(' -')[0] || '';
        const predGames = parseInt(predResult.split(' -')[1]) || 0;
        const claveGames = parseInt(claveResult.split(' -')[1]) || 0;

        const winnerMatch = predWinner === claveWinner;
        const gamesMatch = predGames === claveGames;
        const points = (winnerMatch ? 1 : 0) + (gamesMatch ? 1 : 0);

        scores.firstRound.push({
          key,
          prediction: predResult,
          result: claveResult,
          winnerMatch: winnerMatch ? 'Yes' : 'No',
          gamesMatch: gamesMatch ? 'Yes' : 'No',
          points
        });
      });

      // Semifinals (Indices 4-5: West w5-w6, 11-12: East e5-e6)
      const semifinalsKeys = [
        { key: 'w5', index: 4 }, { key: 'w6', index: 5 },
        { key: 'e5', index: 11 }, { key: 'e6', index: 12 }
      ];
      semifinalsKeys.forEach(({ key, index }) => {
        const predResult = prediction.seriesResults[index] || '';
        const claveResult = claveRecord.seriesResults[index] || '';
        const predWinner = predResult.split(' -')[0] || '';
        const claveWinner = claveResult.split(' -')[0] || '';
        const predGames = parseInt(predResult.split(' -')[1]) || 0;
        const claveGames = parseInt(claveResult.split(' -')[1]) || 0;

        const winnerMatch = predWinner === claveWinner;
        const gamesMatch = predGames === claveGames;
        const points = (winnerMatch ? 2 : 0) + (gamesMatch ? 1 : 0);

        scores.semifinals.push({
          key,
          prediction: predResult,
          result: claveResult,
          winnerMatch: winnerMatch ? 'Yes' : 'No',
          gamesMatch: gamesMatch ? 'Yes' : 'No',
          points
        });
      });

      // Conference Finals (Indices 6: West w7, 13: East e7)
      const conferenceFinalsKeys = [
        { key: 'w7', index: 6 },
        { key: 'e7', index: 13 }
      ];
      conferenceFinalsKeys.forEach(({ key, index }) => {
        const predResult = prediction.seriesResults[index] || '';
        const claveResult = claveRecord.seriesResults[index] || '';
        const predWinner = predResult.split(' -')[0] || '';
        const claveWinner = claveResult.split(' -')[0] || '';
        const predGames = parseInt(predResult.split(' -')[1]) || 0;
        const claveGames = parseInt(claveResult.split(' -')[1]) || 0;

        const winnerMatch = predWinner === claveWinner;
        const gamesMatch = predGames === claveGames;
        const points = (winnerMatch ? 3 : 0) + (gamesMatch ? 1 : 0);

        scores.conferenceFinals.push({
          key,
          prediction: predResult,
          result: claveResult,
          winnerMatch: winnerMatch ? 'Yes' : 'No',
          gamesMatch: gamesMatch ? 'Yes' : 'No',
          points
        });
      });

      // Finals (Index 14 for series, champion, and mvp fields)
      const finalsKey = { key: 'finals', index: 14 };
      const predResult = prediction.seriesResults[finalsKey.index] || '';
      const claveResult = claveRecord.seriesResults[finalsKey.index] || '';
      const predWinner = prediction.champion || '';
      const claveWinner = claveRecord.champion || '';
      const predGames = parseInt(predResult.split(' -')[1]) || 0;
      const claveGames = parseInt(claveResult.split(' -')[1]) || 0;
      const predMVP = prediction.mvp || '';
      const claveMVP = claveRecord.mvp || '';

      const winnerMatch = predWinner === claveWinner;
      const gamesMatch = predGames === claveGames;
      const mvpMatch = predMVP === claveMVP;
      const points = (winnerMatch ? 4 : 0) + (gamesMatch ? 1 : 0) + (mvpMatch ? 1 : 0);

      scores.finals.push({
        key: finalsKey.key,
        prediction: `${predWinner} ${predResult.split(' -')[1] || ''}, ${predMVP}`,
        result: `${claveWinner} ${claveResult.split(' -')[1] || ''}, ${claveMVP}`,
        winnerMatch: winnerMatch ? 'Yes' : 'No',
        gamesMatch: gamesMatch ? 'Yes' : 'No',
        mvpMatch: mvpMatch ? 'Yes' : 'No',
        points
      });

      // Calculate total score
      scores.totalScore = 
        scores.firstRound.reduce((sum, match) => sum + match.points, 0) +
        scores.semifinals.reduce((sum, match) => sum + match.points, 0) +
        scores.conferenceFinals.reduce((sum, match) => sum + match.points, 0) +
        scores.finals.reduce((sum, match) => sum + match.points, 0);

      // Update Finals prediction counts
      if (prediction.champion) {
        const team = prediction.champion.replace(/^\d+\.\s*/, '');
        if (finalsWinnerCounts.hasOwnProperty(team)) {
          finalsWinnerCounts[team]++;
        }
      }
      if (prediction.mvp) {
        if (finalsMVPCounts.hasOwnProperty(prediction.mvp)) {
          finalsMVPCounts[prediction.mvp]++;
        }
      }

      return { prediction, scores };
    });

    // Sort predictions by total score for standings
    scoredPredictions.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

    // Generate HTML content for the report
    let reportContent = '';

    // Generate report for each user
    scoredPredictions.forEach(({ prediction, scores }) => {
      const userName = prediction.name || 'Unknown';
      reportContent += `
        <div class="section">
          <h2>${userName}: ${scores.totalScore} Points</h2>

          <h3>First Round (1 point for winner, 1 for games)</h3>
          <table>
            <tr>
              <th>Key</th>
              <th>Prediction</th>
              <th>Result</th>
              <th>Winner Match</th>
              <th>Games Match</th>
              <th>Points</th>
            </tr>
      `;
      scores.firstRound.forEach(match => {
        reportContent += `
            <tr>
              <td>${match.key}</td>
              <td>${match.prediction}</td>
              <td>${match.result}</td>
              <td>${match.winnerMatch}</td>
              <td>${match.gamesMatch}</td>
              <td>${match.points}</td>
            </tr>
        `;
      });
      const firstRoundWinners = scores.firstRound.filter(match => match.winnerMatch === 'Yes').length;
      const firstRoundGames = scores.firstRound.filter(match => match.gamesMatch === 'Yes').length;
      const firstRoundPoints = scores.firstRound.reduce((sum, match) => sum + match.points, 0);
      reportContent += `
            <tr>
              <td colspan="3"><strong>Total</strong></td>
              <td>${firstRoundWinners} winners</td>
              <td>${firstRoundGames} games</td>
              <td>${firstRoundPoints}</td>
            </tr>
          </table>

          <h3>Semifinals (2 points for winner, 1 for games)</h3>
          <table>
            <tr>
              <th>Key</th>
              <th>Prediction</th>
              <th>Result</th>
              <th>Winner Match</th>
              <th>Games Match</th>
              <th>Points</th>
            </tr>
      `;
      scores.semifinals.forEach(match => {
        reportContent += `
            <tr>
              <td>${match.key}</td>
              <td>${match.prediction}</td>
              <td>${match.result}</td>
              <td>${match.winnerMatch}</td>
              <td>${match.gamesMatch}</td>
              <td>${match.points}</td>
            </tr>
        `;
      });
      const semifinalsWinners = scores.semifinals.filter(match => match.winnerMatch === 'Yes').length;
      const semifinalsGames = scores.semifinals.filter(match => match.gamesMatch === 'Yes').length;
      const semifinalsPoints = scores.semifinals.reduce((sum, match) => sum + match.points, 0);
      reportContent += `
            <tr>
              <td colspan="3"><strong>Total</strong></td>
              <td>${semifinalsWinners} winners</td>
              <td>${semifinalsGames} games</td>
              <td>${semifinalsPoints}</td>
            </tr>
          </table>

          <h3>Conference Finals (3 points for winner, 1 for games)</h3>
          <table>
            <tr>
              <th>Key</th>
              <th>Prediction</th>
              <th>Result</th>
              <th>Winner Match</th>
              <th>Games Match</th>
              <th>Points</th>
            </tr>
      `;
      scores.conferenceFinals.forEach(match => {
        reportContent += `
            <tr>
              <td>${match.key}</td>
              <td>${match.prediction}</td>
              <td>${match.result}</td>
              <td>${match.winnerMatch}</td>
              <td>${match.gamesMatch}</td>
              <td>${match.points}</td>
            </tr>
        `;
      });
      const confFinalsWinners = scores.conferenceFinals.filter(match => match.winnerMatch === 'Yes').length;
      const confFinalsGames = scores.conferenceFinals.filter(match => match.gamesMatch === 'Yes').length;
      const confFinalsPoints = scores.conferenceFinals.reduce((sum, match) => sum + match.points, 0);
      reportContent += `
            <tr>
              <td colspan="3"><strong>Total</strong></td>
              <td>${confFinalsWinners} winners</td>
              <td>${confFinalsGames} games</td>
              <td>${confFinalsPoints}</td>
            </tr>
          </table>

          <h3>Finals (4 points for winner, 1 for games, 1 for MVP)</h3>
          <table>
            <tr>
              <th>Key</th>
              <th>Prediction</th>
              <th>Result</th>
              <th>Winner Match</th>
              <th>Games Match</th>
              <th>MVP Match</th>
              <th>Points</th>
            </tr>
      `;
      scores.finals.forEach(match => {
        reportContent += `
            <tr>
              <td>${match.key}</td>
              <td>${match.prediction}</td>
              <td>${match.result}</td>
              <td>${match.winnerMatch}</td>
              <td>${match.gamesMatch}</td>
              <td>${match.mvpMatch}</td>
              <td>${match.points}</td>
            </tr>
        `;
      });
      const finalsWinners = scores.finals.filter(match => match.winnerMatch === 'Yes').length;
      const finalsGames = scores.finals.filter(match => match.gamesMatch === 'Yes').length;
      const finalsMVPs = scores.finals.filter(match => match.mvpMatch === 'Yes').length;
      const finalsPoints = scores.finals.reduce((sum, match) => sum + match.points, 0);
      reportContent += `
            <tr>
              <td colspan="4"><strong>Total</strong></td>
              <td>${finalsWinners}</td>
              <td>${finalsGames}</td>
              <td>${finalsMVPs}</td>
              <td>${finalsPoints}</td>
            </tr>
          </table>

          <p><strong>Total Expected Score: ${scores.totalScore} points</strong></p>
        </div>
      `;
    });

    // Standings
    reportContent += `
      <div class="standings">
        <h2>Standings</h2>
    `;
    scoredPredictions.forEach(({ prediction, scores }) => {
      const userName = prediction.name || 'Unknown';
      reportContent += `<p>${userName}: ${scores.totalScore} points</p>`;
    });
    reportContent += `</div>`;

    // Finals Prediction Analysis
    reportContent += `
      <div class="prediction-analysis">
        <h2>Finals Prediction Analysis</h2>
        <h3>Finals Winner Predictions</h3>
    `;
    for (const [team, count] of Object.entries(finalsWinnerCounts)) {
      reportContent += `<p>${team}: ${count} users</p>`;
    }
    reportContent += `<h3>Finals MVP Predictions</h3>`;
    for (const [mvp, count] of Object.entries(finalsMVPCounts)) {
      reportContent += `<p>${mvp}: ${count} users</p>`;
    }
    reportContent += `</div>`;

    // Read the results.html template
    const templatePath = path.join(__dirname, 'public', 'results.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Inject the report content into the template
    template = template.replace('{{resultsContent}}', reportContent);

    // Send the rendered HTML
    res.send(template);
  } catch (error) {
    console.error('Error generating results:', error);
    res.status(500).send('<h1>Error generating results</h1><p>Please check the server logs for details.</p>');
  }
});

// Redirect root to results page
app.get('/', (req, res) => {
  res.redirect('/results');
});

// Start Server with dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});