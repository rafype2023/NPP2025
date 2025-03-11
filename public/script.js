let bracket = {
  west: { 'w1': 'Lakers', 'w2': 'Rockets', 'w3': 'Nuggets', 'w4': 'Clippers', 'w5': '', 'w6': '', 'w7': '' },
  east: { 'e1': 'Bucks', 'e2': 'Pacers', 'e3': 'Celtics', 'e4': 'Raptors', 'e5': '', 'e6': '', 'e7': '' },
  finals: ''
};

function updateBracket() {
  // Get Play-In selections
  const west7 = document.getElementById('west7').value;
  const west8 = document.getElementById('west8').value;
  const east7 = document.getElementById('east7').value;
  const east8 = document.getElementById('east8').value;

  // Validate unique selections within each conference
  if ((west7 && west8 && west7 === west8) || (east7 && east8 && east7 === east8)) {
    alert('7th and 8th positions must be different teams in each conference!');
    document.getElementById('west7').value = '';
    document.getElementById('west8').value = '';
    document.getElementById('east7').value = '';
    document.getElementById('east8').value = '';
    return;
  }

  // Assign Play-In teams to bracket opponents
  document.getElementById('w1opp').textContent = west8 || '';
  document.getElementById('w2opp').textContent = west7 || '';
  document.getElementById('e1opp').textContent = east8 || '';
  document.getElementById('e2opp').textContent = east7 || '';

  // Update bracket with initial seeded teams
  bracket.west.w1 = 'Lakers';
  bracket.west.w2 = 'Rockets';
  bracket.west.w3 = 'Nuggets';
  bracket.west.w4 = 'Clippers';
  bracket.east.e1 = 'Bucks';
  bracket.east.e2 = 'Pacers';
  bracket.east.e3 = 'Celtics';
  bracket.east.e4 = 'Raptors';

  // Update subsequent rounds based on selections
  // First round opponents are set by Play-In
  bracket.west.w5 = document.getElementById('w5').value || (bracket.west.w1 > document.getElementById('w1opp').textContent ? bracket.west.w1 : document.getElementById('w1opp').textContent);
  bracket.west.w6 = document.getElementById('w6').value || (bracket.west.w2 > document.getElementById('w2opp').textContent ? bracket.west.w2 : document.getElementById('w2opp').textContent);
  bracket.west.w7 = document.getElementById('w7').value || (bracket.west.w5 > bracket.west.w6 ? bracket.west.w5 : bracket.west.w6);
  bracket.east.e5 = document.getElementById('e5').value || (bracket.east.e1 > document.getElementById('e1opp').textContent ? bracket.east.e1 : document.getElementById('e1opp').textContent);
  bracket.east.e6 = document.getElementById('e6').value || (bracket.east.e2 > document.getElementById('e2opp').textContent ? bracket.east.e2 : document.getElementById('e2opp').textContent);
  bracket.east.e7 = document.getElementById('e7').value || (bracket.east.e5 > bracket.east.e6 ? bracket.east.e5 : bracket.east.e6);

  // Update Finals
  bracket.finals = document.getElementById('w7').value && document.getElementById('e7').value ? (bracket.west.w7 > bracket.east.e7 ? bracket.west.w7 : bracket.east.e7) : '';
  document.getElementById('champion').innerHTML = `<option value="${bracket.finals}">${bracket.finals}</option><option value="">Select</option>`;

  // Reset subsequent rounds if earlier picks change
  if (document.getElementById('west7').value || document.getElementById('west8').value || document.getElementById('east7').value || document.getElementById('east8').value) {
    document.getElementById('w5').value = '';
    document.getElementById('w6').value = '';
    document.getElementById('w7').value = '';
    document.getElementById('e5').value = '';
    document.getElementById('e6').value = '';
    document.getElementById('e7').value = '';
    document.getElementById('champion').value = '';
  }

  console.log('Bracket updated:', bracket);
}

function submitPrediction() {
  const picks = {
    bracketPicks: Object.values(bracket.west).concat(Object.values(bracket.east)),
    seriesLengths: [
      document.getElementById('w1len').value,
      document.getElementById('w2len').value,
      document.getElementById('w3len').value,
      document.getElementById('w4len').value,
      document.getElementById('w5len').value,
      document.getElementById('w6len').value,
      document.getElementById('w7len').value,
      document.getElementById('e1len').value,
      document.getElementById('e2len').value,
      document.getElementById('e3len').value,
      document.getElementById('e4len').value,
      document.getElementById('e5len').value,
      document.getElementById('e6len').value,
      document.getElementById('e7len').value,
      document.getElementById('finalLen').value
    ].map(Number),
    champion: document.getElementById('champion').value,
    mvp: document.getElementById('mvp').value,
    lastGameScore: [
      Number(document.getElementById('score1').value) || 0,
      Number(document.getElementById('score2').value) || 0
    ],
    paymentMethod: document.getElementById('paymentMethod').value,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    comments: document.getElementById('comments').value
  };

  // Validation
  if (picks.bracketPicks.some(pick => pick === '') || picks.seriesLengths.some(length => isNaN(length)) || !picks.champion || !picks.mvp || picks.lastGameScore.some(score => isNaN(score)) || !picks.paymentMethod) {
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

  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(picks)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      document.getElementById('summary').innerText = `Summary: ${JSON.stringify(picks, null, 2)}`;
      alert('Prediction submitted successfully!');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while submitting your prediction.');
  });
}

// Add event listeners for dropdown changes to update bracket
document.querySelectorAll('select[id^="west"], select[id^="east"], select[id^="w"], select[id^="e"]').forEach(el => {
  el.addEventListener('change', updateBracket);
});

// Initial call to set up the bracket
updateBracket();