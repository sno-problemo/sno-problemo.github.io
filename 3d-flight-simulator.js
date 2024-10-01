let scene, camera, renderer, plane, terrain, runway;
let speed = 0, altitude = 0;
let canTakeOff = false, hasTakenOff = false;
const maxSpeed = 1;
const takeoffSpeed = 0.2;

// Initialize the scene
init();

function init() {
    // Scene setup
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
    cube.position.set(0, 1, 0);
    scene.add(cube);

    loadPlaneModel();

    terrain = createTerrain();
    scene.add(terrain);

    runway = createRunway();
    scene.add(runway);

    createOnScreenControls();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    animate();
}

function loadPlaneModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        'Assets/Plane/cessna-172.glb',
        function (gltf) {
            // Create a wrapper for the plane to allow easy adjustment
            const planeWrapper = new THREE.Object3D();
            plane = gltf.scene;
            
            // Add the plane to the wrapper and apply necessary transformations
            planeWrapper.add(plane);
            planeWrapper.position.set(0, 1, 0);
            planeWrapper.scale.set(1, 1, 1);

            // Corrective rotation to make the plane face the right direction
            plane.rotation.y = -Math.PI / 2;  // This might be necessary, depending on model orientation
            plane.rotation.x = 0;  // Ensure no tilt
            plane.rotation.z = 0;  // Ensure no unwanted rotation
            
            // Add wrapper to the scene
            scene.add(planeWrapper);

            // Assign the wrapper to control movements
            plane = planeWrapper;

            console.log('Cessna 172 model loaded successfully');
        },
        undefined,
        function (error) {
            console.error('An error occurred while loading the model:', error);
        }
    );
}


function createTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    terrainGeometry.rotateX(-Math.PI / 2);

    // Load textures for Grass and Rock
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('Assets/Terrain/grass.jpg'); // Ensure this path is correct
    const rockTexture = textureLoader.load('Assets/Terrain/rock.jpg');   // Ensure this path is correct

    // Set texture repeat for large ground
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(50, 50);

    rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
    rockTexture.repeat.set(50, 50);

    // Create the material using Grass texture
    const terrainMaterial = new THREE.MeshPhongMaterial({ map: grassTexture });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = -0.1;

    return terrainMesh;
}

function createRunway() {
    const runwayGeometry = new THREE.PlaneGeometry(100, 10);
    const runwayMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const runwayMesh = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayMesh.rotation.x = -Math.PI / 2;
    runwayMesh.position.y = 0;
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
        // Apply controls to move and rotate the plane
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

        // Update the camera to follow the plane
        camera.position.set(plane.position.x, plane.position.y + 5, plane.position.z + 20);
        camera.lookAt(plane.position);
    }

    document.getElementById('speed').textContent = speed.toFixed(2);
    document.getElementById('altitude').textContent = altitude.toFixed(2);

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
                if (hasTakenOff) {
                    plane.rotation.x -= 0.02; // Tilt up
                }
                break;
            case 'ArrowDown':
                if (hasTakenOff) {
                    plane.rotation.x += 0.02; // Tilt down
                }
                break;
            case 'ArrowLeft':
                plane.rotation.y += 0.02; // Turn left
                break;
            case 'ArrowRight':
                plane.rotation.y -= 0.02; // Turn right
                break;
            case 'KeyW':
                canTakeOff = true; // Increase throttle
                break;
            case 'KeyS':
                speed -= 0.02; // Decrease throttle
                if (speed < 0) speed = 0;
                break;
        }
    }
}

function handleKeyUp(event) {
    if (event.code === 'KeyW') {
        canTakeOff = false; // Stop increasing throttle
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (plane) {
        // Move the plane based on user input
        if (!hasTakenOff) {
            if (canTakeOff && speed < takeoffSpeed) {
                speed += 0.001;
            }
            plane.translateZ(-speed); // Move forward along the negative Z-axis

            if (speed >= takeoffSpeed) {
                hasTakenOff = true;
            }
        } else {
            // Move forward and adjust altitude based on pitch
            plane.translateZ(-speed); // Move forward
            plane.translateY(Math.sin(plane.rotation.x) * speed); // Adjust altitude based on pitch
        }

        // Camera follow logic
        const relativeCameraOffset = new THREE.Vector3(0, 5, -20); // Offset: 5 units up, 20 units behind the plane
        const cameraOffset = relativeCameraOffset.applyMatrix4(plane.matrixWorld); // Convert to world coordinates

        // Set camera position and make it look at the plane
        camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
        camera.lookAt(plane.position);
    }

    document.getElementById('speed').textContent = speed.toFixed(2);
    document.getElementById('altitude').textContent = plane.position.y.toFixed(2);

    renderer.render(scene, camera);
}

