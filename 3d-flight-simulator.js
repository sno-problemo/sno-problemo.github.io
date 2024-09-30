let scene, camera, renderer, plane, terrain, runway, speed = 0, altitude = 0;
let canTakeOff = false, hasTakenOff = false;
const maxSpeed = 1;
const takeoffSpeed = 0.2;

// Ensure Three.js is loaded
if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded. Please include the Three.js library.');
}

// Check if required loaders are available
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
if (!gltfLoader) {
    console.error('GLTFLoader is not available. Make sure you have included it in your project.');
}

init();

function init() {
    try {
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

        // Add a simple cube to test rendering
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        console.log('Basic scene setup complete');

        loadCessnaModel();
        terrain = createTexturedTerrain();
        scene.add(terrain);

        runway = createRunway();
        scene.add(runway);

        createOnScreenControls();

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        console.log('Initialization complete, starting animation');
        animate();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

function createTexturedTerrain() {
    try {
        const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 200, 200);
        terrainGeometry.rotateX(-Math.PI / 2);

        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i] / 100;
            const y = vertices[i + 1] / 100;
            vertices[i + 2] = Math.sin(x) * Math.cos(y) * 10; // Simplified terrain generation
        }

        terrainGeometry.computeVertexNormals();

        const terrainMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a9d23, // Green color for terrain
            roughness: 0.8,
        });

        const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrainMesh.position.y = -5; // Lower the terrain a bit

        console.log('Terrain created successfully');
        return terrainMesh;
    } catch (error) {
        console.error('Error creating terrain:', error);
        return null;
    }
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
    `;
    document.body.appendChild(controlsDiv);

    document.getElementById('throttle-up').addEventListener('mousedown', () => { canTakeOff = true; });
    document.getElementById('throttle-up').addEventListener('mouseup', () => { canTakeOff = false; });
    document.getElementById('throttle-down').addEventListener('click', () => { speed -= 0.02; if (speed < 0) speed = 0; });
}

function animate() {
    requestAnimationFrame(animate);

    try {
        if (plane) {
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
        }

        document.getElementById('speed').textContent = speed.toFixed(2);
        document.getElementById('altitude').textContent = altitude.toFixed(2);

        renderer.render(scene, camera);
    } catch (error) {
        console.error('Error during animation:', error);
    }
}

function loadCessnaModel() {
    if (gltfLoader) {
        gltfLoader.load(
            'Assets/Plane/Cessna-172-2.glb',
            (gltf) => {
                plane = gltf.scene;
                plane.position.set(0, 0.2, 0);
                plane.rotation.set(0, Math.PI, 0);
                plane.scale.set(0.5, 0.5, 0.5);
                scene.add(plane);
                console.log('Cessna model loaded successfully');
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error occurred while loading the model:', error);
            }
        );
    } else {
        console.error('GLTFLoader is not available. Unable to load Cessna model.');
    }
}

function createRunway() {
    const runwayGeometry = new THREE.PlaneGeometry(100, 10);
    const runwayMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 }); // Dark gray color for runway
    const runwayMesh = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayMesh.rotation.x = -Math.PI / 2;
    console.log('Runway created successfully');
    return runwayMesh;
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function handleKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
            if (hasTakenOff && plane) plane.rotation.x -= 0.01;
            break;
        case 'ArrowDown':
            if (hasTakenOff && plane) plane.rotation.x += 0.01;
            break;
        case 'ArrowLeft':
            if (plane) plane.rotation.z += 0.01;
            break;
        case 'ArrowRight':
            if (plane) plane.rotation.z -= 0.01;
            break;
        case 'KeyW':
            if (!hasTakenOff) {
                canTakeOff = true;
            } else {
                speed += 0.02;
                if (speed > maxSpeed) speed = maxSpeed;
            }
            break;
        case 'KeyS':
            speed -= 0.02;
            if (speed < 0) speed = 0;
            break;
    }
}

function handleKeyUp(event) {
    if (event.code === 'KeyW') {
        canTakeOff = false;
    }
}