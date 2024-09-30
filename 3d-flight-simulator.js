let scene, camera, renderer, plane, terrain, runway;
let speed = 0, altitude = 0;
let canTakeOff = false, hasTakenOff = false;
const maxSpeed = 1;
const takeoffSpeed = 0.2;

init();

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

    loadPlaneModel();

    terrain = createTerrain();
    scene.add(terrain);

    runway = createRunway();
    scene.add(runway);

    createOnScreenControls();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    console.log('Initialization complete');
}

function loadPlaneModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        'Assets/Plane/cessna-172-2.glb',
        function (gltf) {
            plane = gltf.scene;
            plane.position.set(0, 0.1, 0); // Adjust the Y position to place it on the runway
            plane.scale.set(0.01, 0.01, 0.01); // Adjust scale as needed
            plane.rotation.y = Math.PI; // Rotate to face forward
            scene.add(plane);
            console.log('Cessna 172 model loaded successfully');
            animate(); // Start animation after the model is loaded
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error occurred while loading the model:', error);
        }
    );
}

function createTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    terrainGeometry.rotateX(-Math.PI / 2);

    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 2; i < vertices.length; i += 3) {
        vertices[i] = Math.sin(vertices[i - 2] / 10) * Math.cos(vertices[i - 1] / 10) * 5;
    }

    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshPhongMaterial({ color: 0x3a9d23 });
    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = -0.1; // Adjust to be just below the runway

    return terrainMesh;
}

function createRunway() {
    const runwayGeometry = new THREE.PlaneGeometry(100, 10);
    const runwayMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const runwayMesh = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayMesh.rotation.x = -Math.PI / 2;
    runwayMesh.position.y = 0; // At ground level
    return runwayMesh;
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
    document.getElementById('throttle-down').addEventListener('click', () => { 
        speed -= 0.02; 
        if (speed < 0) speed = 0;
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (plane) {
        if (!hasTakenOff) {
            if (canTakeOff && speed < takeoffSpeed) {
                speed += 0.001;
            }
            plane.translateZ(-speed);

            if (speed >= takeoffSpeed) {
                hasTakenOff = true;
            }
        } else {
            plane.translateZ(-speed);
            altitude += 0.01;
            plane.position.y = altitude;
        }

        camera.position.set(plane.position.x, plane.position.y + 5, plane.position.z + 20);
        camera.lookAt(plane.position);

        document.getElementById('speed').textContent = speed.toFixed(2);
        document.getElementById('altitude').textContent = altitude.toFixed(2);
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function handleKeyDown(event) {
    if (plane) {
        switch (event.code) {
            case 'ArrowUp':
                if (hasTakenOff) plane.rotation.x -= 0.05;
                break;
            case 'ArrowDown':
                if (hasTakenOff) plane.rotation.x += 0.05;
                break;
            case 'ArrowLeft':
                plane.rotation.y += 0.05;
                break;
            case 'ArrowRight':
                plane.rotation.y -= 0.05;
                break;
            case 'KeyW':
                canTakeOff = true;
                break;
            case 'KeyS':
                speed -= 0.02;
                if (speed < 0) speed = 0;
                break;
        }
    }
}

function handleKeyUp(event) {
    if (event.code === 'KeyW') {
        canTakeOff = false;
    }
}