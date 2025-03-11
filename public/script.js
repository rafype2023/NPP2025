let bracket = {
  west: { 'w1': '', 'w2': '', 'w3': '', 'w4': '' },
  east: { 'e1': '', 'e2': '', 'e3': '', 'e4': '' },
  finals: ''
};

function updateBracket() {
  // Update next rounds based on current picks
  // Simplified for brevity; expand with full logic
  bracket.west.w1 = document.getElementById('w1').value;
  bracket.west.w2 = document.getElementById('w2').value;
  // Reset subsequent rounds if earlier pick changes
  document.getElementById('w3').value = '';
  document.getElementById('w4').value = '';
}

function submitPrediction() {
  const picks = {
    bracketPicks: Object.values(bracket.west).concat(Object.values(bracket.east)),
    seriesLengths: [
      document.getElementById('w1len').value,
      document.getElementById('w2len').value,
      document.getElementById('w3len').value,
      document.getElementById('w4len').value,
      document.getElementById('e1len').value,
      document.getElementById('e2len').value,
      document.getElementById('e3len').value,
      document.getElementById('e4len').value,
      document.getElementById('finalLen').value
    ].map(Number),
    champion: document.getElementById('champion').value,
    mvp: document.getElementById('mvp').value,
    lastGameScore: [
      Number(document.getElementById('score1').value),
      Number(document.getElementById('score2').value)
    ],
    paymentMethod: document.getElementById('paymentMethod').value
  };

  // Validation
  if (picks.bracketPicks.includes('') || picks.seriesLengths.includes(NaN) || !picks.champion || !picks.mvp || picks.lastGameScore.includes(NaN) || !picks.paymentMethod) {
    alert('Please complete all selections');
    return;
  }
  if (picks.lastGameScore[0] <= picks.lastGameScore[1]) {
    alert('Winning score must be higher than losing score');
    return;
  }
  if (!picks.seriesLengths.every(length => [4, 5, 6, 7].includes(length))) {
    alert('Series length must be between 4 and 7 games');
    return;
  }

  // Champion validation (simplified)
  const finalists = [/* logic to determine finalists from bracket */];
  if (!finalists.includes(picks.champion)) {
    alert('Champion must match bracket selections');
    return;
  }

  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(picks)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) alert(data.error);
    else {
      document.getElementById('summary').innerText = `Summary: ${JSON.stringify(picks)}`;
    }
  })
  .catch(error => console.error('Error:', error));
}

// Add event listeners for dropdown changes to update bracket
document.querySelectorAll('select[id^="w"], select[id^="e"]').forEach(el => {
  el.addEventListener('change', updateBracket);
});
