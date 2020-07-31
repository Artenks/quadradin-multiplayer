export function setupScreen(game) {
  const {
    screen: { width, height },
  } = game.state;
  width = width;
  height = height;
}

export default function renderScreen(
  gameCanvas,
  game,
  requestAnimationFrame,
  currentPlayerId,
  scoreTable
) {
  const {
    screen: { width, height },
  } = game.state;
  const context = gameCanvas.getContext("2d");
  context.clearRect(0, 0, width, height);

  for (const fruitId in game.state.fruits) {
    const fruit = game.state.fruits[fruitId];
    context.fillStyle = "orange";
    context.fillRect(fruit.x, fruit.y, 1, 1);
  }
  for (const playerId in game.state.players) {
    const player = game.state.players[playerId];
    context.fillStyle = "#A068FF ";
    context.fillRect(player.x, player.y, 1, 1);
  }

  const currentPlayer = game.state.players[currentPlayerId];

  if (currentPlayer) {
    context.fillStyle = "#4FC68F";
    context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1);
  }

  updateScoreTable(scoreTable, game, currentPlayerId);

  requestAnimationFrame(() => {
    renderScreen(
      gameCanvas,
      game,
      requestAnimationFrame,
      currentPlayerId,
      scoreTable
    );
  });

  function updateScoreTable(scoreTable, game, currentPlayerId) {
    const maxResults = 5;

    let scoreTableInnerHTML = `
      <tr class="header">
          <td>Top 5 Jogadores</td>
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
          <tr ${
            player.playerId === currentPlayerId ? 'class="current-player"' : ""
          }>
              <td>${player.playerId}</td>
              <td>${player.score}</td>
          </tr>
      `
      );
    }, scoreTableInnerHTML);

    const currentPlayerFromTopScore = topScorePlayers[currentPlayerId];

    if (currentPlayerFromTopScore) {
      scoreTableInnerHTML += `
          <tr class="current-player bottom">
              <td class="socket-id">${currentPlayerFromTopScore.id} * </td>
              <td class="score-value">${currentPlayerFromTopScore.score}</td>
          </tr>
      `;
    }

    //a maldita linha que deu problema undefined [105]

    scoreTableInnerHTML += `
  <tr class="footer">
      <td>Total de jogadores</td>
      <td align="center">${game.state.players.length}</td> 
  </tr>
`;

    scoreTable.innerHTML = scoreTableInnerHTML;
  }
}
