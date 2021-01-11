const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 700;

const modal = document.getElementById("modal");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const modalScore = document.getElementById("modal-score");
const lifeEl = document.getElementById("life");
const lifeWhole = document.getElementById("life-whole")
const muteBtn = document.getElementById("mute");
const pointsEl = document.getElementsByClassName("points");
let modalContent = document.getElementById("modal-content");
let instructionEl = document.getElementsByClassName("instruction");
let superBtn = document.getElementById("super");

let themeAudio = document.getElementById("theme-audio");
themeAudio.src = "audio/theme_song.mp3";
themeAudio.volume = 0.4;

var sprite = new Image();
sprite.src = "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";

var explosion = new Image();
explosion.src = "https://attack-js.s3-us-west-1.amazonaws.com/explosion.png";

// reset values on restart
let score = 0;
let mute = false;
let life = 10;
let firingSpeed = 6;
let spawnCounter = 2000;
let asteroidSpeed = 2;
let playing = false;
let superMode = false;

let animationId;

if (!playing) {
  startBtn.innerHTML = "Start Game"
  for(let i = 0; i < pointsEl.length; i++) {
    pointsEl[i].classList.add("hide")
  }
  modalContent.classList.add("justify")
}



function changeMode() {
  let prevFiringSpeed = 6;
  let prevAsteroidSpeed = 2;

  if (superMode) {
    prevFiringSpeed = firingSpeed;
    prevAsteroidSpeed = asteroidSpeed;
    firingSpeed = 20;
    asteroidSpeed = 5;
  } else {
    firingSpeed = prevFiringSpeed;
    asteroidSpeed = prevAsteroidSpeed;
    
  }
}

function playSound(sound) {
  if (mute) {
    return new Audio();
  }
  switch (sound) {
    case "missile":
      return new Audio("audio/missile.mp3");
    case "explosion":
      return new Audio("audio/explosion.mp3");
    case "game_over":
      return new Audio("audio/explosion.mp3");
    case "theme":
      return new Audio("audio/theme_song.mp3");
    case "hit":
      return new Audio("audio/hit2.mp3");
    default:
      return new Audio();
  }
}

class Player {
  constructor(x, y) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
  }

  draw() {
    ctx.drawImage(sprite, 7, 5, 31, 38, this.x, this.y, 31, 38);
  }
}

let player = new Player(500, 660);
let asteroids = [];
let projectiles = [];

// START GAME
function init() {
  player = new Player(500, 660);
  playing = true;
  asteroids = [];
  projectiles = [];
  score = 0;
  life = 10;
  firingSpeed = 6;
  spawnCounter = 2000;
  asteroidSpeed = 1;
  lifeWhole.classList.remove("blinking");
  lifeEl.innerHTML = life;
  scoreEl.innerHTML = score;
  modalScore.innerHTML = score;
  if (!mute) {
    themeAudio.src = "audio/theme_song.mp3";
    themeAudio.volume = 0.4;
    themeAudio.play();
  }
}

class Projectile {
  constructor(x, y, velocity, width, height) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = velocity;
    let radians = Math.atan2(this.velocity.y, this.velocity.x);
    this.angle = (180 * radians) / Math.PI;

    if (-this.angle > 90) {
      this.topX = this.x;
      this.topY = this.y;
      this.cornerX = this.x - this.height;
      this.cornerY = this.y + this.height;
    } else {
      this.topX = this.x - this.height;
      this.topY = this.y - this.height;
      this.cornerX = this.x;
      this.cornerY = this.y;
    }

    var sprite = new Image();
    sprite.src =
      "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
  }

  draw() {
    ctx.translate(this.x, this.y); // Sets center pivot point of image by moving entire matrix
    ctx.rotate((Math.PI / 180) * (this.angle + 180)); // rotates around center point
    ctx.translate(-this.x, -this.y); //revert translation
    ctx.drawImage(
      sprite,
      58,
      18,
      this.width,
      this.height,
      this.x,
      this.y - 22,
      46,
      14
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets matrix to original position

    // UNCOMMENT TO TEST COLLISION HIT BOX
    // ctx.translate(this.x, this.y); // Sets center pivot point of image by moving entire matrix
    // ctx.rotate(Math.PI / 180 * (this.angle + 180)); // rotates around center point

    // ctx.translate(-this.x, -this.y); //revert translation
    // ctx.beginPath();
    // ctx.fillRect(this.x, this.y, 46, 14);
    // ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets matrix to original position
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Asteroid {
  constructor(x, y, velocity, width, height) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = velocity;

    var sprite = new Image();
    sprite.src =
      "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
  }

  draw() {
    ctx.drawImage(
      sprite,
      193,
      37,
      this.width,
      this.height,
      this.x,
      this.y,
      60, // multiply to increase size
      51
    );

    // Uncomment to test collision
    // ctx.beginPath()
    // ctx.fillRect(this.x, this.y, 60, 51)
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Explosion {
  constructor(x, y, width, height) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
    this.width = width;
    this.height = height;
    this.frameX = 1;
    this.frameY = 1;
  }

  draw() {
    ctx.drawImage(
      explosion,
      this.width * this.frameX,
      this.height * this.frameY,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.frameX < 8) {
      this.frameX++;
    } else if (this.frameX === 8) {
      this.frameX = 1;
      this.frameY++;
    } else {
      this.frameX = 1;
    }
  }

}

// Set Asteroid Speed
window.setInterval(()=>{
  asteroidSpeed ++
}, 40000)

function spawnEnemies() {
  if (spawnCounter > 1000 ) {
    spawnCounter -= 20;
  } 
  setTimeout(() => {
    let randX = Math.random() * (900 - 100) + 100; // Make asteroids hit bottom of screen

    const x = Math.random() * canvas.width;
    const y = 0 - 51;
    const angle = Math.atan2(660 - y, randX - x);
    const velocity = {
      x: Math.cos(angle) * asteroidSpeed,
      y: Math.sin(angle) * asteroidSpeed,
    };

    asteroids.push(new Asteroid(x, y, velocity, 60, 51, 30));
  }, spawnCounter)
  
  setTimeout(spawnEnemies, spawnCounter)
}

function reset() {
  modal.style.display = "flex";
  modalScore.innerHTML = score;
  playing = false;
  startBtn.innerHTML = "Restart Game";
  asteroidSpeed = 2;
  firingSpeed = 6;

  for (let i = 0; i < pointsEl.length; i++) {
    pointsEl[i].classList.remove("hide");
  }

  for (let i = 0; i < instructionEl.length; i++) {
    instructionEl[i].classList.add("hide");
  }

  modalContent.classList.remove("justify");
  themeAudio.pause();
  themeAudio.src = "audio/game_over.mp3";
  themeAudio.volume = 0.3;
  themeAudio.play();
  life = 10;
}

// END GAME 
function subtractLife() {
  life -= 1;
  if (life < 6) {
    lifeWhole.classList.add("blinking")
  }

  lifeEl.innerHTML = life;
  let audio = playSound("hit");
  audio.play();

  if (life === 0) {
    cancelAnimationFrame(animationId); // end game by pausing all animation
    reset()
   
  }
}



function animate() {
  changeMode();
  animationId = requestAnimationFrame(animate); // set animationId for every frame, cancel to end animation.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
  projectiles.forEach((projectile, i) => {
    projectile.update();
    if (
      projectile.x >= 1000 ||
      projectile.y <= 0 - 61 ||
      projectile.x <= 0 - 61
    ) {
      // remove projectile if out of bounds
      setTimeout(() => {
        projectiles.splice(i, 1);
      }, 0);
    }
  });

  asteroids.forEach((asteroid, i) => {
    asteroid.update();
    if (asteroid.y >= canvas.height) {
      // Collision for asteroid hitting bottom screen
      setTimeout(() => {
        asteroids.splice(i, 1);
      });
      subtractLife();
    }

    projectiles.forEach((projectile, j) => {
      //  collision detection between missile and asteroid : Must REFACTOR
      let xCenter = (asteroid.x + (asteroid.x + asteroid.width)) / 2;
      let yCenter = (asteroid.y + (asteroid.y + asteroid.height)) / 2;
      const dist = Math.hypot(projectile.x - xCenter, projectile.y - yCenter); // Calculate the distance between two points

      if (dist - 10 <= 30) {
        setTimeout(() => {
          // removes frame flash when asteroid hit
          asteroids.splice(i, 1);
          projectiles.splice(j, 1);
        }, 0);
        exp = new Explosion(xCenter- 100, yCenter - 100, 256, 256)
        exp.draw()
        
        
        let audio = playSound("explosion");
        audio.volume = 0.5;
        audio.play();
        score += 1;
        scoreEl.innerHTML = score;
      }
    });
  });
}


let canFire = true;
// set firing delay
window.setInterval(() => {
  canFire = true
}, 750)
// set firing speed
window.setInterval(() => {
  firingSpeed++
},20000)



// Fire missile
canvas.addEventListener("click", (event) => {
  
  if(playing) {
    if (canFire) {
      const audio = playSound("missile");
      audio.volume = 0.5;
      audio.play();
      
    
      const angle = Math.atan2(event.offsetY - 660, event.offsetX - 500); // modify to change endpoint
      const velocity = {
        x: Math.cos(angle) * firingSpeed, // Increase speed by multiplying x and y. Refactor to have increasing speed on click to max
        y: Math.sin(angle) * firingSpeed,
      };
    
      projectiles.push(new Projectile(500, 660, velocity, 46, 14));
      setTimeout(() => {
        canFire = false
      }, 0)
    }
  }
});

startBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  modal.style.display = "none";
});

muteBtn.addEventListener("click", () => {
  if (!mute) {
    mute = true;
    muteBtn.innerHTML = "Unmute"
    themeAudio.pause()
  } else {
    mute = false
    muteBtn.innerHTML = "Mute"
    themeAudio.play()
  }
})

superBtn.addEventListener("click", ()=>{

  if (!superMode) {
    superMode = true;
    superBtn.innerHTML = "Normal Mode"
    
  } else {
    superMode = false;
    superBtn.innerHTML = "Super Mode"
  }

})
