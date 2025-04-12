let bracket = {
  west: { playIn7: '', playIn8: '', w1: '', w2: '', w3: '', w4: '', w5: '', w6: '', w7: '' },
  east: { playIn7: '', playIn8: '', e1: '', e2: '', e3: '', e4: '', e5: '', e6: '', e7: '' },
  finals: ''
};

// Object to store user selections, including finals
let winners = {
  west: { winnerW1: '', winnerW2: '', winnerW3: '', winnerW4: '', winnerW5: '', winnerW6: '', winnerW7: '' },
  east: { winnerE1: '', winnerE2: '', winnerE3: '', winnerE4: '', winnerE5: '', winnerE6: '', winnerE7: '' },
  finals: ''
};

// Track previous selections to avoid unnecessary updates
let previousPlayInSelections = {
  west7: '',
  west8: '',
  east7: '',
  east8: ''
};

let previousFirstRoundWinners = {
  w1: '',
  w2: '',
  w3: '',
  w4: '',
  e1: '',
  e2: '',
  e3: '',
  e4: ''
};

let previousSemifinalsWinners = {
  w5: '',
  w6: '',
  e5: '',
  e6: ''
};

let previousConferenceFinalsWinners = {
  w7: '',
  e7: ''
};

// Ensure DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initial call to populate the bracket
  updateBracket();

  // Event listeners for real-time updates with debugging
  document.querySelectorAll('select[id^="west"], select[id^="east"], select[id^="w"], select[id^="e"], #champion').forEach(el => {
    el.addEventListener('click', function() {
      console.log('Click event triggered for:', this.id);
    });
    el.addEventListener('change', function() {
      console.log('Change event triggered for:', this.id, 'Value:', this.value);
      updateBracket();
    });
  });
});

function updateBracket() {
  try {
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

    // Update bracket state with Play-In selections
    bracket.west.playIn7 = west7;
    bracket.west.playIn8 = west8;
    bracket.east.playIn7 = east7;
    bracket.east.playIn8 = east8;

    // Check if Play-In selections have changed
    const playInChanged =
      west7 !== previousPlayInSelections.west7 ||
      west8 !== previousPlayInSelections.west8 ||
      east7 !== previousPlayInSelections.east7 ||
      east8 !== previousPlayInSelections.east8;

    // Store current Play-In selections for the next update
    previousPlayInSelections.west7 = west7;
    previousPlayInSelections.west8 = west8;
    previousPlayInSelections.east7 = east7;
    previousPlayInSelections.east8 = east8;

    // Populate First Round matchups and winner dropdowns only if Play-In selections changed
    if (playInChanged) {
      // Western Conference First Round
      const w1Matchup = document.getElementById('w1Matchup');
      w1Matchup.textContent = west8 ? `1. Thunder vs ${west8}` : '1. Thunder vs Select 8th';
      const w1Select = document.getElementById('w1');
      w1Select.innerHTML = '';
      const w1Options = [
        new Option('Select Winner', '', true, true),
        new Option('1. Thunder', '1. Thunder'),
        ...(west8 ? [new Option(west8, west8)] : [])
      ];
      w1Options.forEach(option => w1Select.add(option));

      const w2Matchup = document.getElementById('w2Matchup');
      w2Matchup.textContent = west7 ? `2. Houston vs ${west7}` : '2. Houston vs Select 7th';
      const w2Select = document.getElementById('w2');
      w2Select.innerHTML = '';
      const w2Options = [
        new Option('Select Winner', '', true, true),
        new Option('2. Houston', '2. Houston'),
        ...(west7 ? [new Option(west7, west7)] : [])
      ];
      w2Options.forEach(option => w2Select.add(option));

      const w3Matchup = document.getElementById('w3Matchup');
      w3Matchup.textContent = '3. Nuggets vs 6. Warriors';
      const w3Select = document.getElementById('w3');
      w3Select.innerHTML = '';
      const w3Options = [
        new Option('Select Winner', '', true, true),
        new Option('3. Nuggets', '3. Nuggets'),
        new Option('6. Warriors', '6. Warriors')
      ];
      w3Options.forEach(option => w3Select.add(option));

      const w4Matchup = document.getElementById('w4Matchup');
      w4Matchup.textContent = '4. Memphis vs 5. Lakers';
      const w4Select = document.getElementById('w4');
      w4Select.innerHTML = '';
      const w4Options = [
        new Option('Select Winner', '', true, true),
        new Option('4. Memphis', '4. Memphis'),
        new Option('5. Lakers', '5. Lakers')
      ];
      w4Options.forEach(option => w4Select.add(option));

      // Eastern Conference First Round
      const e1Matchup = document.getElementById('e1Matchup');
      e1Matchup.textContent = east8 ? `1. Cavaliers vs ${east8}` : '1. Cavaliers vs Select 8th';
      const e1Select = document.getElementById('e1');
      e1Select.innerHTML = '';
      const e1Options = [
        new Option('Select Winner', '', true, true),
        new Option('1. Cavaliers', '1. Cavaliers'),
        ...(east8 ? [new Option(east8, east8)] : [])
      ];
      e1Options.forEach(option => e1Select.add(option));

      const e2Matchup = document.getElementById('e2Matchup');
      e2Matchup.textContent = east7 ? `2. Celtics vs ${east7}` : '2. Celtics vs Select 7th';
      const e2Select = document.getElementById('e2');
      e2Select.innerHTML = '';
      const e2Options = [
        new Option('Select Winner', '', true, true),
        new Option('2. Celtics', '2. Celtics'),
        ...(east7 ? [new Option(east7, east7)] : [])
      ];
      e2Options.forEach(option => e2Select.add(option));

      const e3Matchup = document.getElementById('e3Matchup');
      e3Matchup.textContent = '3. Knicks vs 6. Pistons';
      const e3Select = document.getElementById('e3');
      e3Select.innerHTML = '';
      const e3Options = [
        new Option('Select Winner', '', true, true),
        new Option('3. Knicks', '3. Knicks'),
        new Option('6. Pistons', '6. Pistons')
      ];
      e3Options.forEach(option => e3Select.add(option));

      const e4Matchup = document.getElementById('e4Matchup');
      e4Matchup.textContent = '4. Pacers vs 5. Bucks';
      const e4Select = document.getElementById('e4');
      e4Select.innerHTML = '';
      const e4Options = [
        new Option('Select Winner', '', true, true),
        new Option('4. Pacers', '4. Pacers'),
        new Option('5. Bucks', '5. Bucks')
      ];
      e4Options.forEach(option => e4Select.add(option));
    }

    // Update winners object with current First Round selections
    winners.west.winnerW1 = document.getElementById('w1').value;
    winners.west.winnerW2 = document.getElementById('w2').value;
    winners.west.winnerW3 = document.getElementById('w3').value;
    winners.west.winnerW4 = document.getElementById('w4').value;
    winners.east.winnerE1 = document.getElementById('e1').value;
    winners.east.winnerE2 = document.getElementById('e2').value;
    winners.east.winnerE3 = document.getElementById('e3').value;
    winners.east.winnerE4 = document.getElementById('e4').value;

    // Update First Round selection displays
    const w1Selection = document.getElementById('w1Selection');
    w1Selection.textContent = `1 vs 8: ${winners.west.winnerW1 || ''}`;
    const w2Selection = document.getElementById('w2Selection');
    w2Selection.textContent = `2 vs 7: ${winners.west.winnerW2 || ''}`;
    const w3Selection = document.getElementById('w3Selection');
    w3Selection.textContent = `3 vs 6: ${winners.west.winnerW3 || ''}`;
    const w4Selection = document.getElementById('w4Selection');
    w4Selection.textContent = `4 vs 5: ${winners.west.winnerW4 || ''}`;
    const e1Selection = document.getElementById('e1Selection');
    e1Selection.textContent = `1 vs 8: ${winners.east.winnerE1 || ''}`;
    const e2Selection = document.getElementById('e2Selection');
    e2Selection.textContent = `2 vs 7: ${winners.east.winnerE2 || ''}`;
    const e3Selection = document.getElementById('e3Selection');
    e3Selection.textContent = `3 vs 6: ${winners.east.winnerE3 || ''}`;
    const e4Selection = document.getElementById('e4Selection');
    e4Selection.textContent = `4 vs 5: ${winners.east.winnerE4 || ''}`;

    // Check if First Round winners have changed
    const firstRoundChanged =
      winners.west.winnerW1 !== previousFirstRoundWinners.w1 ||
      winners.west.winnerW2 !== previousFirstRoundWinners.w2 ||
      winners.west.winnerW3 !== previousFirstRoundWinners.w3 ||
      winners.west.winnerW4 !== previousFirstRoundWinners.w4 ||
      winners.east.winnerE1 !== previousFirstRoundWinners.e1 ||
      winners.east.winnerE2 !== previousFirstRoundWinners.e2 ||
      winners.east.winnerE3 !== previousFirstRoundWinners.e3 ||
      winners.east.winnerE4 !== previousFirstRoundWinners.e4;

    // Store current First Round winners for the next update
    previousFirstRoundWinners.w1 = winners.west.winnerW1;
    previousFirstRoundWinners.w2 = winners.west.winnerW2;
    previousFirstRoundWinners.w3 = winners.west.winnerW3;
    previousFirstRoundWinners.w4 = winners.west.winnerW4;
    previousFirstRoundWinners.e1 = winners.east.winnerE1;
    previousFirstRoundWinners.e2 = winners.east.winnerE2;
    previousFirstRoundWinners.e3 = winners.east.winnerE3;
    previousFirstRoundWinners.e4 = winners.east.winnerE4;

    // Populate Semifinals matchups and winner dropdowns only if First Round winners changed
    if (firstRoundChanged) {
      const w5Matchup = document.getElementById('w5Matchup');
      w5Matchup.textContent = (winners.west.winnerW1 && winners.west.winnerW4 && winners.west.winnerW1 !== '' && winners.west.winnerW4 !== '') ? 
        `${winners.west.winnerW1} vs ${winners.west.winnerW4}` : '';
      const w5Select = document.getElementById('w5');
      w5Select.innerHTML = '';
      const w5Options = (winners.west.winnerW1 && winners.west.winnerW4 && winners.west.winnerW1 !== '' && winners.west.winnerW4 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.west.winnerW1, winners.west.winnerW1),
        new Option(winners.west.winnerW4, winners.west.winnerW4)
      ] : [new Option('Select First Round Winners', '', true, true)];
      w5Options.forEach(option => w5Select.add(option));

      const w6Matchup = document.getElementById('w6Matchup');
      w6Matchup.textContent = (winners.west.winnerW2 && winners.west.winnerW3 && winners.west.winnerW2 !== '' && winners.west.winnerW3 !== '') ? 
        `${winners.west.winnerW2} vs ${winners.west.winnerW3}` : '';
      const w6Select = document.getElementById('w6');
      w6Select.innerHTML = '';
      const w6Options = (winners.west.winnerW2 && winners.west.winnerW3 && winners.west.winnerW2 !== '' && winners.west.winnerW3 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.west.winnerW2, winners.west.winnerW2),
        new Option(winners.west.winnerW3, winners.west.winnerW3)
      ] : [new Option('Select First Round Winners', '', true, true)];
      w6Options.forEach(option => w6Select.add(option));

      const e5Matchup = document.getElementById('e5Matchup');
      e5Matchup.textContent = (winners.east.winnerE1 && winners.east.winnerE4 && winners.east.winnerE1 !== '' && winners.east.winnerE4 !== '') ? 
        `${winners.east.winnerE1} vs ${winners.east.winnerE4}` : '';
      const e5Select = document.getElementById('e5');
      e5Select.innerHTML = '';
      const e5Options = (winners.east.winnerE1 && winners.east.winnerE4 && winners.east.winnerE1 !== '' && winners.east.winnerE4 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.east.winnerE1, winners.east.winnerE1),
        new Option(winners.east.winnerE4, winners.east.winnerE4)
      ] : [new Option('Select First Round Winners', '', true, true)];
      e5Options.forEach(option => e5Select.add(option));

      const e6Matchup = document.getElementById('e6Matchup');
      e6Matchup.textContent = (winners.east.winnerE2 && winners.east.winnerE3 && winners.east.winnerE2 !== '' && winners.east.winnerE3 !== '') ? 
        `${winners.east.winnerE2} vs ${winners.east.winnerE3}` : '';
      const e6Select = document.getElementById('e6');
      e6Select.innerHTML = '';
      const e6Options = (winners.east.winnerE2 && winners.east.winnerE3 && winners.east.winnerE2 !== '' && winners.east.winnerE3 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.east.winnerE2, winners.east.winnerE2),
        new Option(winners.east.winnerE3, winners.east.winnerE3)
      ] : [new Option('Select First Round Winners', '', true, true)];
      e6Options.forEach(option => e6Select.add(option));
    }

    // Update Semifinals winners and selections
    winners.west.winnerW5 = document.getElementById('w5').value;
    winners.west.winnerW6 = document.getElementById('w6').value;
    winners.east.winnerE5 = document.getElementById('e5').value;
    winners.east.winnerE6 = document.getElementById('e6').value;

    const w5Selection = document.getElementById('w5Selection');
    w5Selection.textContent = (winners.west.winnerW1 && winners.west.winnerW4) ? `Winner: ${winners.west.winnerW5 || ''}` : 'Winner';
    const w6Selection = document.getElementById('w6Selection');
    w6Selection.textContent = (winners.west.winnerW2 && winners.west.winnerW3) ? `Winner: ${winners.west.winnerW6 || ''}` : 'Winner';
    const e5Selection = document.getElementById('e5Selection');
    e5Selection.textContent = (winners.east.winnerE1 && winners.east.winnerE4) ? `Winner: ${winners.east.winnerE5 || ''}` : 'Winner';
    const e6Selection = document.getElementById('e6Selection');
    e6Selection.textContent = (winners.east.winnerE2 && winners.east.winnerE3) ? `Winner: ${winners.east.winnerE6 || ''}` : 'Winner';

    // Check if Semifinals winners have changed
    const semifinalsChanged =
      winners.west.winnerW5 !== previousSemifinalsWinners.w5 ||
      winners.west.winnerW6 !== previousSemifinalsWinners.w6 ||
      winners.east.winnerE5 !== previousSemifinalsWinners.e5 ||
      winners.east.winnerE6 !== previousSemifinalsWinners.e6;

    // Store current Semifinals winners for the next update
    previousSemifinalsWinners.w5 = winners.west.winnerW5;
    previousSemifinalsWinners.w6 = winners.west.winnerW6;
    previousSemifinalsWinners.e5 = winners.east.winnerE5;
    previousSemifinalsWinners.e6 = winners.east.winnerE6;

    // Populate Conference Finals matchups and winner dropdowns only if Semifinals winners changed
    if (semifinalsChanged) {
      const w7Matchup = document.getElementById('w7Matchup');
      w7Matchup.textContent = (winners.west.winnerW5 && winners.west.winnerW6 && winners.west.winnerW5 !== '' && winners.west.winnerW6 !== '') ? 
        `${winners.west.winnerW5} vs ${winners.west.winnerW6}` : '';
      const w7Select = document.getElementById('w7');
      w7Select.innerHTML = '';
      const w7Options = (winners.west.winnerW5 && winners.west.winnerW6 && winners.west.winnerW5 !== '' && winners.west.winnerW6 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.west.winnerW5, winners.west.winnerW5),
        new Option(winners.west.winnerW6, winners.west.winnerW6)
      ] : [new Option('Select Semifinals Winners', '', true, true)];
      w7Options.forEach(option => w7Select.add(option));

      const e7Matchup = document.getElementById('e7Matchup');
      e7Matchup.textContent = (winners.east.winnerE5 && winners.east.winnerE6 && winners.east.winnerE5 !== '' && winners.east.winnerE6 !== '') ? 
        `${winners.east.winnerE5} vs ${winners.east.winnerE6}` : '';
      const e7Select = document.getElementById('e7');
      e7Select.innerHTML = '';
      const e7Options = (winners.east.winnerE5 && winners.east.winnerE6 && winners.east.winnerE5 !== '' && winners.east.winnerE6 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.east.winnerE5, winners.east.winnerE5),
        new Option(winners.east.winnerE6, winners.east.winnerE6)
      ] : [new Option('Select Semifinals Winners', '', true, true)];
      e7Options.forEach(option => e7Select.add(option));
    }

    // Update Conference Finals winners and selections
    winners.west.winnerW7 = document.getElementById('w7').value;
    winners.east.winnerE7 = document.getElementById('e7').value;

    const w7Selection = document.getElementById('w7Selection');
    w7Selection.textContent = (winners.west.winnerW5 && winners.west.winnerW6) ? `Winner: ${winners.west.winnerW7 || ''}` : 'Winner';
    const e7Selection = document.getElementById('e7Selection');
    e7Selection.textContent = (winners.east.winnerE5 && winners.east.winnerE6) ? `Winner: ${winners.east.winnerE7 || ''}` : 'Winner';

    // Check if Conference Finals winners have changed
    const conferenceFinalsChanged =
      winners.west.winnerW7 !== previousConferenceFinalsWinners.w7 ||
      winners.east.winnerE7 !== previousConferenceFinalsWinners.e7;

    // Store current Conference Finals winners for the next update
    previousConferenceFinalsWinners.w7 = winners.west.winnerW7;
    previousConferenceFinalsWinners.e7 = winners.east.winnerE7;

    // Populate Finals matchups and winner dropdowns only if Conference Finals winners changed
    if (conferenceFinalsChanged) {
      const championMatchup = document.getElementById('championMatchup');
      championMatchup.textContent = (winners.west.winnerW7 && winners.east.winnerE7 && winners.west.winnerW7 !== '' && winners.east.winnerE7 !== '') ? 
        `${winners.west.winnerW7} vs ${winners.east.winnerE7}` : '';
      const championSelect = document.getElementById('champion');
      championSelect.innerHTML = '';
      const championOptions = (winners.west.winnerW7 && winners.east.winnerE7 && winners.west.winnerW7 !== '' && winners.east.winnerE7 !== '') ? [
        new Option('Select Winner', '', true, true),
        new Option(winners.west.winnerW7, winners.west.winnerW7),
        new Option(winners.east.winnerE7, winners.east.winnerE7)
      ] : [new Option('Select Conference Winners', '', true, true)];
      championOptions.forEach(option => championSelect.add(option));
    }

    // Update Finals winner and selection
    winners.finals = document.getElementById('champion').value;
    const championSelection = document.getElementById('championSelection');
    championSelection.textContent = (winners.west.winnerW7 && winners.east.winnerE7) ? `Winner: ${winners.finals || ''}` : 'Winner';
    bracket.finals = document.getElementById('champion').value;

    // Update bracket object with final selections
    bracket.west.w1 = winners.west.winnerW1;
    bracket.west.w2 = winners.west.winnerW2;
    bracket.west.w3 = winners.west.winnerW3;
    bracket.west.w4 = winners.west.winnerW4;
    bracket.west.w5 = winners.west.winnerW5;
    bracket.west.w6 = winners.west.winnerW6;
    bracket.west.w7 = winners.west.winnerW7;
    bracket.east.e1 = winners.east.winnerE1;
    bracket.east.e2 = winners.east.winnerE2;
    bracket.east.e3 = winners.east.winnerE3;
    bracket.east.e4 = winners.east.winnerE4;
    bracket.east.e5 = winners.east.winnerE5;
    bracket.east.e6 = winners.east.winnerE6;
    bracket.east.e7 = winners.east.winnerE7;

    console.log('Bracket updated:', bracket);
    console.log('Winners updated:', winners);
  } catch (error) {
    console.error('Error in updateBracket:', error);
  }
}

// Helper function to format the summary in the same format as the email
function formatSummary(picks) {
  return `
Email: ${picks.email}
Phone: ${picks.phone || 'N/A'}
Comments: ${picks.comments || 'N/A'}
Payment Method: ${picks.paymentMethod} - Envie Pago al ${picks.phone}

Play-In Selections:

Eastern Conference:
No. 7 Seed: ${picks.eastPlayIn7 || 'N/A'}
No. 8 Seed: ${picks.eastPlayIn8 || 'N/A'}
Western Conference:
No. 7 Seed: ${picks.westPlayIn7 || 'N/A'}
No. 8 Seed: ${picks.westPlayIn8 || 'N/A'}

Eastern Conference:
First Round:
${picks.seriesResults[7] || 'N/A'}
${picks.seriesResults[8] || 'N/A'}
${picks.seriesResults[9] || 'N/A'}
${picks.seriesResults[10] || 'N/A'}
Semifinals:
${picks.seriesResults[11] || 'N/A'}
${picks.seriesResults[12] || 'N/A'}
Conference Final:
${picks.seriesResults[13] || 'N/A'}

Western Conference:
First Round:
${picks.seriesResults[0] || 'N/A'}
${picks.seriesResults[1] || 'N/A'}
${picks.seriesResults[2] || 'N/A'}
${picks.seriesResults[3] || 'N/A'}
Semifinals:
${picks.seriesResults[4] || 'N/A'}
${picks.seriesResults[5] || 'N/A'}
Conference Final:
${picks.seriesResults[6] || 'N/A'}

Finals:
${picks.champion || 'N/A'} vs ${picks.seriesResults[13]} vs ${picks.seriesResults[6]}

Winner: ${picks.champion} (${picks.seriesResults[14] || 'N/A'})
MVP: ${picks.mvp}
Last Game Score: ${picks.lastGameScore.join(' - ') || 'N/A'}
Thanks for participating in the NBA Playoff Pool 2025!
  `.trim();
}

// Function to reset the application and start over
function startOver() {
  // Reset all select elements to their default values
  document.querySelectorAll('select').forEach(select => {
    select.value = select.options[0].value; // Set to the first option (usually "Select" or default)
  });

  // Clear the summary
  document.getElementById('summary').innerText = '';

  // Reset bracket, winners, and previous selections
  bracket = {
    west: { playIn7: '', playIn8: '', w1: '', w2: '', w3: '', w4: '', w5: '', w6: '', w7: '' },
    east: { playIn7: '', playIn8: '', e1: '', e2: '', e3: '', e4: '', e5: '', e6: '', e7: '' },
    finals: ''
  };

  winners = {
    west: { winnerW1: '', winnerW2: '', winnerW3: '', winnerW4: '', winnerW5: '', winnerW6: '', winnerW7: '' },
    east: { winnerE1: '', winnerE2: '', winnerE3: '', winnerE4: '', winnerE5: '', winnerE6: '', winnerE7: '' },
    finals: ''
  };

  previousPlayInSelections = { west7: '', west8: '', east7: '', east8: '' };
  previousFirstRoundWinners = { w1: '', w2: '', w3: '', w4: '', e1: '', e2: '', e3: '', e4: '' };
  previousSemifinalsWinners = { w5: '', w6: '', e5: '', e6: '' };
  previousConferenceFinalsWinners = { w7: '', e7: '' };

  // Hide the Start Over button
  document.getElementById('startOver').style.display = 'none';

  // Re-initialize the bracket
  updateBracket();
}

// Function to submit prediction with validation
function submitPrediction() {
  // Capture Play-In selections
  const westPlayIn7 = document.getElementById('west7').value;
  const westPlayIn8 = document.getElementById('west8').value;
  const eastPlayIn7 = document.getElementById('east7').value;
  const eastPlayIn8 = document.getElementById('east8').value;

  // Capture winners and series lengths for each round, including Finals
  const winnersList = [
    document.getElementById('w1').value, document.getElementById('w2').value, document.getElementById('w3').value,
    document.getElementById('w4').value, document.getElementById('w5').value, document.getElementById('w6').value,
    document.getElementById('w7').value, document.getElementById('e1').value, document.getElementById('e2').value,
    document.getElementById('e3').value, document.getElementById('e4').value, document.getElementById('e5').value,
    document.getElementById('e6').value, document.getElementById('e7').value, document.getElementById('champion').value
  ];

  const seriesLengths = [
    document.getElementById('w1len').value, document.getElementById('w2len').value, document.getElementById('w3len').value,
    document.getElementById('w4len').value, document.getElementById('w5len').value, document.getElementById('w6len').value,
    document.getElementById('w7len').value, document.getElementById('e1len').value, document.getElementById('e2len').value,
    document.getElementById('e3len').value, document.getElementById('e4len').value, document.getElementById('e5len').value,
    document.getElementById('e6len').value, document.getElementById('e7len').value, document.getElementById('finalLen').value
  ].map(Number);

  // Combine winners and series lengths into a single array
  const seriesResults = winnersList.map((winner, index) => {
    return `${winner} -${seriesLengths[index]}`;
  });

  const picks = {
    westPlayIn7,
    westPlayIn8,
    eastPlayIn7,
    eastPlayIn8,
    seriesResults,
    champion: document.getElementById('champion').value,
    mvp: document.getElementById('mvp').value,
    lastGameScore: [
      Number(document.getElementById('score1').value) || 0,
      Number(document.getElementById('score2').value) || 0
    ],
    paymentMethod: document.getElementById('paymentMethod').value,
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    comments: document.getElementById('comments').value.trim(),
    email: document.getElementById('email').value.trim()
  };

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/; // Allow letters, spaces, hyphens, and apostrophes
    return nameRegex.test(name) && name.length > 0 && !/^\s*$/.test(name) && !/[^a-zA-Z\s'-]/.test(name);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format: name@domain.com
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/; // Format: 123-456-7890
    return phoneRegex.test(phone);
  };

  const validateComments = (comments) => {
    const commentsRegex = /^[a-zA-Z0-9\s.,!?'-]+$/; // Allow alphanumeric, spaces, and common punctuation
    return commentsRegex.test(comments) || comments === '';
  };

  // Validation checks
  if (!validateName(picks.name)) {
    alert('Invalid name! Use only letters, spaces, hyphens, or apostrophes (e.g., "John Doe").');
    return;
  }
  if (!validateEmail(picks.email)) {
    alert('Invalid email! Use a valid format (e.g., "name@domain.com").');
    return;
  }
  if (!validatePhone(picks.phone)) {
    alert('Invalid phone! Use the format "123-456-7890".');
    return;
  }
  if (!validateComments(picks.comments)) {
    alert('Invalid comments! Use only letters, numbers, spaces, or common punctuation (e.g., periods, commas).');
    return;
  }

  // Additional validation
  if (picks.seriesResults.some(result => !result || result.includes(' -undefined')) || !picks.champion || !picks.mvp || picks.lastGameScore.some(score => isNaN(score)) || !picks.paymentMethod) {
    alert('Please complete all selections');
    return;
  }
  if (picks.lastGameScore[0] <= picks.lastGameScore[1]) {
    alert('Winning score must be higher than losing score');
    return;
  }
  if (!seriesLengths.every(length => [4, 5, 6, 7].includes(length))) {
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
      document.getElementById('summary').innerText = formatSummary(picks);
      alert('Prediction submitted successfully!');
      // Show the Start Over button
      document.getElementById('startOver').style.display = 'block';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while submitting your prediction.');
  });
}