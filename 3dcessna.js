import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a more detailed Cessna model
function createCessna() {
    const airplane = new THREE.Group();

    // Fuselage
    const fuselage = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 4, 8),
        new THREE.MeshPhongMaterial({ color: 0xcccccc })
    );
    fuselage.rotation.z = Math.PI / 2;
    airplane.add(fuselage);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.1, 3, 1);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    
    const mainWing = new THREE.Mesh(wingGeometry, wingMaterial);
    mainWing.position.set(0, 0.3, 0);
    airplane.add(mainWing);

    const tailWing = new THREE.Mesh(wingGeometry, wingMaterial);
    tailWing.position.set(-1.8, 0.3, 0);
    tailWing.scale.set(0.5, 0.5, 0.5);
    airplane.add(tailWing);

    // Vertical Stabilizer
    const stabilizer = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.1),
        wingMaterial
    );
    stabilizer.position.set(-1.8, 0.6, 0);
    airplane.add(stabilizer);

    // Propeller
    const propeller = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.8, 0.1),
        new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    propeller.position.set(2, 0, 0);
    airplane.add(propeller);

    return airplane;
}

// Create a more detailed Zero fighter model
function createZero() {
    const zero = new THREE.Group();

    // Fuselage
    const fuselage = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.2, 3, 8),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    fuselage.rotation.z = Math.PI / 2;
    zero.add(fuselage);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.1, 2.5, 0.8);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    const mainWing = new THREE.Mesh(wingGeometry, wingMaterial);
    mainWing.position.set(0.3, 0, 0);
    zero.add(mainWing);

    // Tail
    const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 1, 8),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    tail.position.set(-1.5, 0, 0);
    tail.rotation.z = -Math.PI / 2;
    zero.add(tail);

    return zero;
}

const airplane = createCessna();
scene.add(airplane);

// Add some enemy planes
const enemies = [];
for (let i = 0; i < 5; i++) {
    const enemy = createZero();
    enemy.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        -(Math.random() * 20 + 10)
    );
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

    // Rotate propeller
    airplane.children[4].rotation.x += 0.5;

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