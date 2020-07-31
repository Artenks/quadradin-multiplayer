import { mod } from "./utils.js";

export default function createGame() {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 20,
      height: 20,
    },
  };

  const observers = [];
  const frequency = 2000;

  function start() {
    setInterval(addFruit, frequency);
  }

  function subscribe(observerFunction) {
    observers.push(observerFunction);
  }
  function notifyAll(command) {
    for (const observerFunction of observers) {
      observerFunction(command);
    }
  }

  function setState(newState) {
    Object.assign(state, newState);
  }

  function addPlayer(command) {
    const playerId = command.playerId;
    const playerX =
      "playerX" in command
        ? command.playerX
        : Math.floor(Math.random() * state.screen.width);
    const playerY =
      "playerY" in command
        ? command.playerY
        : Math.floor(Math.random() * state.screen.height);

    state.players[playerId] = {
      x: playerX,
      y: playerY,
      score: 0,
    };

    notifyAll({
      type: "add-player",
      playerId: playerId,
      playerX: playerX,
      playerY: playerY,
      score: 0,
    });
  }
  function removePlayer(command) {
    const playerId = command.playerId;

    delete state.players[playerId];

    notifyAll({
      type: "remove-player",
      playerId: playerId,
    });
  }

  function addFruit(command) {
    const fruitId = command
      ? command.fruitId
      : Math.floor(Math.random() * 10000000);
    const fruitX = command
      ? command.fruitX
      : Math.floor(Math.random() * state.screen.width);
    const fruitY = command
      ? command.fruitY
      : Math.floor(Math.random() * state.screen.height);

    /** update quantity */
    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY,
    };

    //new fruit dispatch sound for who is around
    notifyAll({
      type: "play-audio",
      audio: "newFruit",
    });

    notifyAll({
      type: "add-fruit",
      fruitId: fruitId,
      fruitX: fruitX,
      fruitY: fruitY,
    });
  }

  function removeFruit(command) {
    const fruitId = command.fruitId;

    delete state.fruits[fruitId];

    //make sound for who ate the fruit
    notifyAll({
      type: "play-audio",
      audio: "drinkPot",
    });

    notifyAll({
      type: "remove-fruit",
      fruitId: fruitId,
    });
  }

  function movePlayer(command) {
    notifyAll(command);

    const acceptedMoves = {
      ArrowUp(player) {
        player.y = mod(state.screen.height, player.y - 1);
      },
      ArrowRight(player) {
        player.x = mod(state.screen.width, player.x + 1);
      },
      ArrowDown(player) {
        player.y = mod(state.screen.height, player.y + 1);
      },
      ArrowLeft(player) {
        player.x = mod(state.screen.width, player.x - 1);
      },
      w(player) {
        player.y = mod(state.screen.height, player.y - 1);
      },
      d(player) {
        player.x = mod(state.screen.width, player.x + 1);
      },
      s(player) {
        player.y = mod(state.screen.height, player.y + 1);
      },
      a(player) {
        player.x = mod(state.screen.width, player.x - 1);
      },
    };

    function sound(src) {
      this.sound = document.createElement("audio");
      this.sound.src = src;
      this.sound.setAttribute("preload", "auto");
      this.sound.setAttribute("controls", "none");
      this.sound.style.display = "none";
      document.body.appendChild(this.sound);
      this.play = function () {
        this.sound.play();
      };
      this.stop = function () {
        this.sound.pause();
      };
    }

    const audios = {
      //playerCollision: new sound("./sounds/bubble_hit.mp3"),
      //newFruit: new sound("./sounds/fruit_drop.mp3"),
      //wallCollision: new sound("./sounds/wall_energy_shock.mp3"),
      //eatFruit: new sound("./sounds/eat_fruit_apple.mp3"),
      //drinkPot: new sound("./sounds/human_swallowing_loud.mp3"),
    };

    const keyPressed = command.keyPressed;
    const playerId = command.playerId;
    const player = state.players[command.playerId];
    const moveFunction = acceptedMoves[keyPressed];

    if (player && moveFunction) {
      moveFunction(player);
      checkForFruitCollision(playerId);
    }
  }
  function checkForFruitCollision(playerId) {
    const player = state.players[playerId];

    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId];
      //console.log(`Checking ${playerId} and ${fruitId}`);

      if (player.x === fruit.x && player.y === fruit.y) {
        //console.log(`Collison between ${playerId} and ${fruitId}`);
        player.score = player.score + 10;
        removeFruit({ fruitId: fruitId });
      }
    }
  }

  return {
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    movePlayer,
    state,
    setState,
    subscribe,
    start,
  };
}
