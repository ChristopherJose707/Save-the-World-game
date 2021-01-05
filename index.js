const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 700;

var sprite = new Image();
sprite.src = "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
const asteroids = [];
const projectiles = [];

let life = 10;
let animationId; 

class Player {
  constructor(x, y) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
  }

  draw(){
    ctx.drawImage(sprite, 7, 5, 31, 38, this.x, this.y, 31, 38);
  }
}
const player = new Player(500, 660);

class Projectile {
  constructor(x, y, velocity, width, height) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = velocity;
    let radians = Math.atan2(this.velocity.y, this.velocity.x);
    this.angle = 180 * radians / Math.PI;
   

    var sprite = new Image();
    sprite.src =
      "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
  }

  draw() {
    ctx.translate(this.x, this.y); // Sets center pivot point of image by moving entire matrix
    ctx.rotate(Math.PI / 180 * (this.angle + 180)); // rotates around center point
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


    // UNCOMMENT TO TEST COLLISIN HIT BOX
    // ctx.translate(this.x, this.y); // Sets center pivot point of image by moving entire matrix
    // ctx.rotate(Math.PI / 180 * (this.angle + 180)); // rotates around center point
    // ctx.translate(-this.x, -this.y); //revert translation
    //  ctx.beginPath();
    //  ctx.fillRect(this.x, this.y, 46, 14);
    // ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets matrix to original position

  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    // let radians = Math.atan2(this.velocity.y, this.velocity.x);
    // this.angle = 180 * radians / Math.PI
  }
}

class Asteroid {
  constructor(x, y, velocity, width, height, radius) {
    this.x = x; // coordinates on canvas (spawn point)
    this.y = y;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.velocity = velocity;

    var sprite = new Image();
    sprite.src =
      "https://attack-js.s3-us-west-1.amazonaws.com/spritesheet+(1).png";
  }

  draw() {
    ctx.drawImage(sprite, 193, 37, this.width, this.height, this.x, this.y, 60, 51);
    ctx.drawImage(
      sprite,
      193,
      37,
      this.width,
      this.height,
      this.x - this.radius,
      this.y - this.radius,
      60,  // multiply to increase size
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


function spawnEnemies() {
  setInterval(()=>{          //  max    min   min    === random range between 100 - 900
    let randX = Math.random() * (900 - 100) + 100 // Make asteroids hit bottom of screen
    
    const x = (Math.random() * canvas.width)
    const y = 0 - 51
    const angle = Math.atan2(660 - y, randX - x); 
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    asteroids.push(new Asteroid(x, y, velocity, 60, 51, 30))
  }, 1000)
}



function subtractLife() {
  life -= 1;
  if (life === 0) {
    cancelAnimationFrame(animationId) // end game by pausing all animation 
  }
}



function animate() {
  animationId = requestAnimationFrame(animate) // set animationId for every frame, cancel to end animation.
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  player.draw();
  projectiles.forEach((projectile, i) => {
    projectile.update()
    if (projectile.x >= 1000 || projectile.y <= (0 - 61) || projectile.x <= (0 - 61 )) {  // remove projectile if out of bounds
      setTimeout(() => {
        projectiles.splice(i, 1);
      }, 0);
      
    }

  })

  asteroids.forEach((asteroid, i) => {
    asteroid.update()
    if (asteroid.y >= canvas.height) { // Collision for asteroid hitting bottom screen
      setTimeout(() => {
        asteroids.splice(i, 1)
      })
      subtractLife()
    }

    projectiles.forEach((projectile, j) => {
     
     
     // collision detection between missile and asteroid : Must REFACTOR 
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

// Fire missile
window.addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - 660, event.clientX - 500) // modify to change endpoint
  const velocity = {
    x: Math.cos(angle) * 4,   // Increase speed by multiplying x and y. Refactor to have increasing speed on click to max
    y: Math.sin(angle) * 4
  }
  projectiles.push(new Projectile(500, 660, velocity, 46, 14));
})
  
animate();
spawnEnemies();