export default function renderScreen(
  screen,
  game,
  requestAnimationFrame,
  currentPlayerId,
  scoreTable
) {
  const context = screen.getContext("2d");
  context.fillStyle = "red";
  context.clearRect(0, 0, 25, 25);

  for (const playerId in game.state.players) {
    const player = game.state.players[playerId];
    context.fillStyle = "#A068FF ";
    context.fillRect(player.x, player.y, 1, 1);
  }
  for (const fruitId in game.state.fruits) {
    const fruit = game.state.fruits[fruitId];
    context.fillStyle = "orange";
    context.fillRect(fruit.x, fruit.y, 1, 1);
  }

  const currentPlayer = game.state.players[currentPlayerId];

  if (currentPlayer) {
    context.fillStyle = "#4FC68F";
    context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1);
  }

  updateScoreTable(scoreTable, game, currentPlayerId);

  requestAnimationFrame(() => {
    renderScreen(
      screen,
      game,
      requestAnimationFrame,
      currentPlayerId,
      scoreTable
    );
  });
}

function updateScoreTable(scoreTable, game, currentPlayerId) {
  const maxResults = 10;

  let scoreTableInnerHTML = `
      <tr class="header">
          <td>Top 10 Jogadores</td>
          <td>Pontos</td>
      </tr>
  `;

  const playersArray = [];

  for (let socketId in game.state.players) {
    const player = game.state.players[socketId];
    playersArray.push({
      playerId: socketId,
      x: player.x,
      y: player.y,
      score: player.score,
    });
  }

  const playersSortedByScore = playersArray.sort((first, second) => {
    if (first.score < second.score) {
      return 1;
    }

    if (first.score > second.score) {
      return -1;
    }

    return 0;
  });

  const topScorePlayers = playersSortedByScore.slice(0, maxResults);

  scoreTableInnerHTML = topScorePlayers.reduce((stringFormed, player) => {
    return (
      stringFormed +
      `
          <tr class="${
            player.playerId === currentPlayerId ? "current-player" : ""
          }">
          
              <td>${player.playerId}</td>
              <td>${player.score}</td>
          </tr>
      `
    );
  }, scoreTableInnerHTML);

  let playerInTop10 = false;
  for (const player of topScorePlayers) {
    if (player.playerId === currentPlayerId) {
      playerInTop10 = true;
      break;
    }
  }

  if (!playerInTop10) {
    const currentPlayerFromTopScore = game.state.players[currentPlayerId];

    if (!currentPlayerFromTopScore) {
      return;
    }

    scoreTableInnerHTML += `
          <tr class="current-player">
              <td>${currentPlayerId}</td>
              <td>${currentPlayerFromTopScore.score}</td>
          </tr>
      `;
  }

  scoreTable.innerHTML = scoreTableInnerHTML;
}
