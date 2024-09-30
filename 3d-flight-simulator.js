let scene, camera, renderer, plane, terrain, runway, speed = 0, altitude = 0;
let canTakeOff = false, hasTakenOff = false;
const maxSpeed = 1;
const takeoffSpeed = 0.2;

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new THREE.GLTFLoader();

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    loadCessnaModel();
    terrain = createTexturedTerrain();
    scene.add(terrain);

    runway = createRunway();
    scene.add(runway);

    createOnScreenControls();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function createTexturedTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 200, 200);
    terrainGeometry.rotateX(-Math.PI / 2);

    const simplex = new SimplexNoise();
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i] / 100;
        const y = vertices[i + 1] / 100;
        vertices[i + 2] = (
            simplex.noise2D(x, y) * 10 +
            simplex.noise2D(x * 2, y * 2) * 5 +
            simplex.noise2D(x * 4, y * 4) * 2.5
        );
    }

    terrainGeometry.computeVertexNormals();

    const grassTexture = textureLoader.load('path/to/grass-texture.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(100, 100);

    const rockTexture = textureLoader.load('path/to/rock-texture.jpg');
    rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
    rockTexture.repeat.set(100, 100);

    const terrainMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture,
        displacementMap: rockTexture,
        displacementScale: 10,
        bumpMap: rockTexture,
        bumpScale: 1,
        roughness: 0.8,
    });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = -5; // Lower the terrain a bit

    return terrainMesh;
}

function createOnScreenControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.position = 'absolute';
    controlsDiv.style.bottom = '20px';
    controlsDiv.style.left = '20px';
    controlsDiv.style.color = 'white';
    controlsDiv.style.fontFamily = 'Arial, sans-serif';
    controlsDiv.style.fontSize = '14px';
    controlsDiv.innerHTML = `
        <div>Speed: <span id="speed">0</span></div>
        <div>Altitude: <span id="altitude">0</span></div>
        <div>
            <button id="throttle-up">Throttle Up (W)</button>
            <button id="throttle-down">Throttle Down (S)</button>
        </div>
        <div>
            <button id="pitch-up">Pitch Up (↑)</button>
            <button id="pitch-down">Pitch Down (↓)</button>
        </div>
        <div>
            <button id="roll-left">Roll Left (←)</button>
            <button id="roll-right">Roll Right (→)</button>
        </div>
    `;
    document.body.appendChild(controlsDiv);

    // Add event listeners for buttons
    document.getElementById('throttle-up').addEventListener('mousedown', () => { canTakeOff = true; });
    document.getElementById('throttle-up').addEventListener('mouseup', () => { canTakeOff = false; });
    document.getElementById('throttle-down').addEventListener('click', () => { speed -= 0.02; if (speed < 0) speed = 0; });
    document.getElementById('pitch-up').addEventListener('click', () => { if (hasTakenOff) plane.rotation.x -= 0.01; });
    document.getElementById('pitch-down').addEventListener('click', () => { if (hasTakenOff) plane.rotation.x += 0.01; });
    document.getElementById('roll-left').addEventListener('click', () => { plane.rotation.z += 0.01; });
    document.getElementById('roll-right').addEventListener('click', () => { plane.rotation.z -= 0.01; });
}

function animate() {
    requestAnimationFrame(animate);

    if (!hasTakenOff) {
        if (canTakeOff && speed < takeoffSpeed) {
            speed += 0.001;
        }
        plane.translateZ(speed);

        if (speed >= takeoffSpeed) {
            altitude += 0.01;
            plane.position.y += altitude;
            hasTakenOff = true;
        }
    } else {
        plane.translateZ(speed);
    }

    camera.position.set(plane.position.x - 10, plane.position.y + 5, plane.position.z + 10);
    camera.lookAt(plane.position);

    // Update on-screen controls
    document.getElementById('speed').textContent = speed.toFixed(2);
    document.getElementById('altitude').textContent = altitude.toFixed(2);

    renderer.render(scene, camera);
}

// The rest of the functions (onWindowResize, handleKeyDown, handleKeyUp, loadCessnaModel, createRunway) remain the same