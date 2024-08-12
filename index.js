const playerStats = {
  creditScore: parseInt(localStorage.getItem('creditScore')) || 600,
  creditLimit: 5000,
  currentLoan: 1000,
  cash: parseInt(localStorage.getItem('cash')) || 200,
  waterLevel: 5,
};

const messages = {
  rent: "Go pay the rent within 2 minutes or your credit score will go down.",
  waterWarning: "Water level is low. Go to villager 1 to buy water.",
  gameOver: "You ran out of water. Game Over!",
};

function showMessage(message, duration = 5000) {
  const messageBox = document.getElementById('messageBox');
  const messageText = document.getElementById('messageText');
  messageText.innerText = message;
  messageBox.style.display = 'block';
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, duration);
}

function updateStatusBox() {
  document.getElementById('creditScore').innerText = playerStats.creditScore;
  document.getElementById('creditLimit').innerText = playerStats.creditLimit;
  document.getElementById('currentLoan').innerText = playerStats.currentLoan;
  document.getElementById('cash').innerText = playerStats.cash;
  document.getElementById('waterLevel').innerText = playerStats.waterLevel;
}

// Check if rent was paid after returning from the maze
window.onload = function() {
  if (localStorage.getItem('rentPaid') === 'true') {
    localStorage.removeItem('rentPaid');
    playerStats.cash -= 30;
    localStorage.setItem('cash', playerStats.cash);
    showMessage("Rent paid. $30 has been deducted from your cash.");
  }

  updateStatusBox();
};

// Decrease water level every 2 minutes
setInterval(() => {
  if (playerStats.waterLevel > 0) {
    playerStats.waterLevel--;
    updateStatusBox();
    if (playerStats.waterLevel === 2) {
      showMessage(messages.waterWarning);
    }
    if (playerStats.waterLevel === 0) {
      showMessage(messages.gameOver);
      // Implement game over logic here
    }
  }
}, 120000); // 2 minutes in milliseconds

// Initialize the timer for rent payment
let rentTimeRemaining = 120; // 2 minutes
const rentTimerElement = document.getElementById('timer');
const rentTimerInterval = setInterval(() => {
  rentTimeRemaining--;
  rentTimerElement.innerText = rentTimeRemaining;
  if (rentTimeRemaining <= 0) {
    clearInterval(rentTimerInterval);
    if (!rentPaid) {
      playerStats.creditScore -= 50;
      localStorage.setItem('creditScore', playerStats.creditScore);
      updateStatusBox();
      showMessage("You missed the rent payment. Credit score decreased.");
    }
  }
}, 1000); // 1 second

// Initialize the game with the message to pay rent
showMessage(messages.rent);

let rentPaid = false;

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const charactersMap = [];
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i));
}

const boundaries = [];
const offset = {
  x: -735,
  y: -650
};

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
  });
});

const battleZones = [];
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
  });
});

const characters = [];
const villagerImg = new Image();
villagerImg.src = './img/villager/Idle.png';

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1026) {
      characters.push(
        new Character({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: villagerImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3,
          animate: true,
          dialogue: [
            "Do you want to buy water? Pay with credit or cash?",
            "Credit will affect your credit score.",
          ],
          onInteract: () => {
            // Logic for buying water
            const paymentMethod = prompt("Buy water with credit or cash? (type 'credit' or 'cash')");
            if (paymentMethod === 'credit') {
              playerStats.creditScore -= 10;
              localStorage.setItem('creditScore', playerStats.creditScore);
              updateStatusBox();
            } else if (paymentMethod === 'cash') {
              playerStats.cash -= 20;
              localStorage.setItem('cash', playerStats.cash);
              updateStatusBox();
            }
            playerStats.waterLevel = 5;
            updateStatusBox();
          },
        })
      );
    }

    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
    }
  });
});

const image = new Image();
image.src = './img/Pellet Town.png';

const foregroundImage = new Image();
foregroundImage.src = './img/foregroundObjects.png';

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';
const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';
const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';
const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
});

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  space: { pressed: false }
};

const movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters
];
const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground
];

const battle = {
  initiated: false
};

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  renderables.forEach((renderable) => {
    renderable.draw();
  });

  let moving = true;
  player.animate = false;

  if (battle.initiated) return;

  // Check for character collision
  const interactingCharacter = checkForCharacterCollision({
    characters,
    player,
    characterOffset: { x: 0, y: 0 }
  });

  // Trigger interaction if a character is near
  if (interactingCharacter) {
    interactingCharacter.interact();
  }

  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y));
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        // deactivate current animation loop
        window.cancelAnimationFrame(animationId);

        audio.Map.stop();
        audio.initBattle.play();
        audio.battle.play();

        battle.initiated = true;
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                // activate a new animation loop
                initBattle();
                animateBattle();
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4
                });
              }
            });
          }
        });
        break;
      }
    }
  }

  if (keys.w.pressed && lastKey === 'ArrowUp') {
    player.animate = true;
    player.image = player.sprites.up;

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: 3 }
    });

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += 3;
      });
  } else if (keys.a.pressed && lastKey === 'ArrowLeft') {
    player.animate = true;
    player.image = player.sprites.left;

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 3, y: 0 }
    });

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3;
      });
  } else if (keys.s.pressed && lastKey === 'ArrowDown') {
    player.animate = true;
    player.image = player.sprites.down;

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: 0 }
    });
    if (interactingCharacter) {
      // Draw the rectangles to visualize collision
      c.strokeStyle = 'red';
      c.strokeRect(player.position.x, player.position.y, player.width, player.height);
      c.strokeStyle = 'blue';
      c.strokeRect(
        interactingCharacter.position.x,
        interactingCharacter.position.y,
        interactingCharacter.width,
        interactingCharacter.height
      );
  
      interactingCharacter.interact();
    }

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3;
      });
  } else if (keys.d.pressed && lastKey === 'ArrowRight') {
    player.animate = true;
    player.image = player.sprites.right;

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: -3, y: 0 }
    });

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3;
      });
  }
}
animate();

function checkForCharacterCollision({ characters, player, characterOffset }) {
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...character,
          position: {
            x: character.position.x + characterOffset.x,
            y: character.position.y + characterOffset.y
          }
        }
      })
    ) {
      console.log("Collision detected with character:", character); // Debugging line
      return character;
    }
  }
  return null;
}

let lastKey = '';
window.addEventListener('keydown', (e) => {
  if (player.isInteracting) {
    switch (e.key) {
      case ' ':
        player.interactionAsset.dialogueIndex++;

        const { dialogueIndex, dialogue } = player.interactionAsset;
        if (dialogueIndex <= dialogue.length - 1) {
          document.querySelector('#characterDialogueBox').innerHTML =
            player.interactionAsset.dialogue[dialogueIndex];
          return;
        }

        // finish conversation
        player.isInteracting = false;
        player.interactionAsset.dialogueIndex = 0;
        document.querySelector('#characterDialogueBox').style.display = 'none';

        break;
    }
    return;
  }

  switch (e.key) {
    case 'ArrowUp':
      keys.w.pressed = true;
      lastKey = 'ArrowUp';
      break;
    case 'ArrowLeft':
      keys.a.pressed = true;
      lastKey = 'ArrowLeft';
      break;
    case 'ArrowDown':
      keys.s.pressed = true;
      lastKey = 'ArrowDown';
      break;
    case 'ArrowRight':
      keys.d.pressed = true;
      lastKey = 'ArrowRight';
      break;
    case 'p':
      // Check if player is near Villager 2 and "P" is pressed
      const interactingCharacter = checkForCharacterCollision({
        characters,
        player,
        characterOffset: { x: 0, y: 0 }
      });

      if (interactingCharacter && interactingCharacter === characters[1]) { // Assuming Villager 2 is the second character
        interactingCharacter.interact();
      }
      break;
    case ' ':
      keys.space.pressed = true;
      break;
  }
});

// Update the keyup event listener
window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      keys.w.pressed = false;
      break;
    case 'ArrowLeft':
      keys.a.pressed = false;
      break;
    case 'ArrowDown':
      keys.s.pressed = false;
      break;
    case 'ArrowRight':
      keys.d.pressed = false;
      break;
    case ' ':
      keys.space.pressed = false;
      break;
  }
});

let clicked = false;
addEventListener('click', () => {
  if (!clicked) {
    audio.Map.play();
    clicked = true;
  }
});
