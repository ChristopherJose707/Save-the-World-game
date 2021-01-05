const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 700;

var sprite = new Image();
sprite.src = "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
const asteroids = [];
const projectiles = [];
const life = 10;

class Player {
  constructor(x, y) {
    this.x = x; // coordinates on canvas
    this.y = y;
  }

  draw(){
    ctx.drawImage(sprite, 7, 5, 31, 38, this.x, this.y, 31, 38);
  }
}

class Projectile {
  constructor(x, y, velocity, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = velocity;

    var sprite = new Image();
    sprite.src = "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
  }

  draw() {
    ctx.drawImage(sprite, 58, 18, this.width, this.height, this.x, this.y, 46, 14 )
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Asteroid {
  constructor(x, y, velocity, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height
    this.velocity = velocity;

    var sprite = new Image();
    sprite.src =
      "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
  }

  draw() {
    ctx.drawImage(sprite, 193, 37, this.width, this.height, this.x, this.y, 60, 51);
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}


function spawnEnemies() {
  setInterval(()=>{
    let randX = Math.random() * (900 - 100) + 100 // Make asteroids hit bottom of screen
    
    const x = (Math.random() * canvas.width)
    const y = 0 - 51
    const angle = Math.atan2(660 - y, randX - x); 
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    asteroids.push(new Asteroid(x, y, velocity, 60, 51))
  }, 1000)
}


const player = new Player(500, 660);

function subtractLife() {
  life -= 1;
  
}

function animate() {
  requestAnimationFrame(animate)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  player.draw();
  projectiles.forEach(projectile => {
    projectile.update()
  })

  asteroids.forEach((asteroid, i) => {
    asteroid.update()
    if (asteroid.y >= canvas.height) { // Collision for asteroid hitting bottom screen
      setTimeout(() => {
        asteroids.splice(i, 1)
      })
      // subtractLife()
      
    }

    projectiles.forEach((projectile, j) => {
     
     
     // collision detection
     if (projectile.x < asteroid.x + asteroid.width && 
        projectile.x + projectile.width > asteroid.x &&
        projectile.y < asteroid.y + asteroid.height && 
        projectile.y + projectile.height > asteroid.y ) {
          setTimeout(()=> { // removes frame flash when asteroid hit 
            asteroids.splice(i, 1)
            projectiles.splice(j, 1)
          }, 0)
     } 
    })
  })
}

window.addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - 660, event.clientX - 500)
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  }
  projectiles.push(new Projectile(500, 660, velocity, 46, 14));
})
  
animate();
spawnEnemies();