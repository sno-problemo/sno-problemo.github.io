import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a simple airplane model
const airplane = new THREE.Group();
const fuselage = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.5, 4, 8),
  new THREE.MeshPhongMaterial({ color: 0x0000ff })
);
fuselage.rotation.z = Math.PI / 2;
airplane.add(fuselage);

const wing = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 3, 1),
  new THREE.MeshPhongMaterial({ color: 0x0000ff })
);
wing.position.y = 0.5;
airplane.add(wing);

scene.add(airplane);

// Add some enemy planes
const enemies = [];
for (let i = 0; i < 5; i++) {
  const enemy = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 2, 8),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
  );
  enemy.position.set(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    -(Math.random() * 20 + 10)
  );
  enemy.rotation.x = Math.PI / 2;
  scene.add(enemy);
  enemies.push(enemy);
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Set up camera
camera.position.z = 5;

// Game state
let gameOver = false;
let score = 0;

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Game loop
function animate() {
  if (gameOver) return;
  
  requestAnimationFrame(animate);

  // Move airplane based on keyboard input
  if (keys['ArrowUp'] && airplane.position.y < 3) airplane.position.y += 0.1;
  if (keys['ArrowDown'] && airplane.position.y > -3) airplane.position.y -= 0.1;
  if (keys['ArrowLeft'] && airplane.position.x > -3) airplane.position.x -= 0.1;
  if (keys['ArrowRight'] && airplane.position.x < 3) airplane.position.x += 0.1;

  // Move enemies
  enemies.forEach((enemy, index) => {
    enemy.position.z += 0.1;
    if (enemy.position.z > 5) {
      enemy.position.z = -(Math.random() * 20 + 10);
      enemy.position.x = Math.random() * 10 - 5;
      enemy.position.y = Math.random() * 10 - 5;
      score++;
    }

    // Check for collisions
    if (enemy.position.distanceTo(airplane.position) < 1) {
      gameOver = true;
      alert(`Game Over! Your score: ${score}`);
    }
  });

  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});