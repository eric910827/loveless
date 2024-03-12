var canvas;
let particles = [];
const num = 1000;
let lines  = [];
let keywordsData;

const noiseScale = 0.01 / 2;

function preload() {
  // Load your keyword data
  keywordsData = [
    { "關鍵字": "親密", "出現次數": 8 },
    { "關鍵字": "愛無能", "出現次數": 6 },
    { "關鍵字": "逃避", "出現次數": 22 },
    { "關鍵字": "冷漠", "出現次數": 1 },
    { "關鍵字": "包容", "出現次數": 3 },
    { "關鍵字": "保護", "出現次數": 6 },
    { "關鍵字": "速食愛情", "出現次數": 2 },
    { "關鍵字": "壓力", "出現次數": 1 },
    { "關鍵字": "孤獨", "出現次數": 6 },
  ];
}
function windowResized() {
  //console.log('resized');
  resizeCanvas(windowWidth, windowHeight);
}
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
 
  background(200);

  for (let i = 0; i < 1000; i++) {
    particles.push(createVector(random(width), random(height)));
  }

  stroke(120);
  // For a cool effect try uncommenting this line
  // And comment out the background() line in draw
  // stroke(255, 50);
  clear();
 
  setInterval(changeNoiseSeed, 4500);
}

function draw() {
  for (let i = 0; i < lines.length; i++) {
    lines[i].update();
    lines[i].display();
  }
  


  
  background(0, 10);
  for (let i = 0; i < keywordsData.length+400; i++) {
    
    for (let j = 0; j < 5; j++) {
      let p = particles[i];
      point(p.x, p.y);
      let n = noise(p.x * noiseScale*2, p.y* noiseScale, frameCount * noiseScale * noiseScale+3);
      let a = TAU * n;
      // Move particles upwards
      p.y += sin(a);
      //p.y -= cos(a);
     
      
      if (!onScreen(p)) {
        p.x = random(width);
        p.y =random( 100000); // Reset to bottom when off-screen
      }
    }
  }
  for (let i = 0; i < keywordsData.length+100; i++) {
    for (let j = 0; j < 3; j++) {
      let p = particles[i];
      point(p.x, p.y);
      let n = noise(p.x * noiseScale, p.y * noiseScale, frameCount * noiseScale * noiseScale);
      let a = TAU * n;
     p.x = sin(a);
      p.y += cos(a);
    
      if(!onScreen(p)) {
        p.x = random(width);
        p.y = random(height);
      }

    }
  }

  
}
/*
function mouseReleased() {
  // Set a target position as the mouse position
  let target = createVector(mouseX, mouseY);

  // Iterate through all particles and move them towards the target position
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    // Calculate the vector pointing from the particle to the target
    let force = p5.Vector.sub(target, particle);
    // Set a magnitude for the force (you can adjust this value)
    force.mult(0.05);
    // Apply the force to the particle
    particle.add(force);
  }

  // Change the noise seed to add some randomness to the movement
  noiseSeed(millis());
}
*/
function onScreen(v) {
  return v.x >= 0 && v.x <= width && v.y >= 0 && v.y <= height;
}


function changeNoiseSeed() {
  // 每秒執行一次的動作
  noiseSeed(millis());
}
