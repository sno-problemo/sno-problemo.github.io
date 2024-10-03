// Declare necessary variables
let scene, camera, renderer, plane, terrain, runway;
let speed = 0;          // Initial speed of the plane
let altitude = 1;       // Initial altitude, starting slightly above ground (e.g., on a runway)
let canTakeOff = false; // Boolean to check if throttle is applied for takeoff
let hasTakenOff = false; // Boolean to determine if the plane has taken off

const maxSpeed = 1;     // Maximum speed
const takeoffSpeed = 0.2; // Speed required to take off
const GRAVITY = 0.005;  // Gravity constant pulling the plane down
const LIFT_FACTOR = 0.05; // Factor to determine lift based on pitch and speed

let pitchUp = false, pitchDown = false;
let yawLeft = false, yawRight = false;

function handleKeyDown(event) {
    if (plane) {
        switch (event.code) {
            case 'ArrowUp':
                pitchUp = true; // Tilt nose up
                break;
            case 'ArrowDown':
                pitchDown = true; // Tilt nose down
                break;
            case 'ArrowLeft':
                yawLeft = true; // Turn left
                break;
            case 'ArrowRight':
                yawRight = true; // Turn right
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
    if (plane) {
        switch (event.code) {
            case 'ArrowUp':
                pitchUp = false; // Stop tilting nose up
                break;
            case 'ArrowDown':
                pitchDown = false; // Stop tilting nose down
                break;
            case 'ArrowLeft':
                yawLeft = false; // Stop turning left
                break;
            case 'ArrowRight':
                yawRight = false; // Stop turning right
                break;
            case 'KeyW':
                canTakeOff = false; // Stop throttle increase
                break;
        }
    }
}


// Define the `onWindowResize` function
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Initialize the scene
init();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, -20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add a simple cube to test rendering (commented out if not needed)
    /*
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0);
    scene.add(cube);
    */

    loadPlaneModel();

    terrain = createTerrain();
    scene.add(terrain);

    runway = createRunway();
    scene.add(runway);

    createOnScreenControls();

    // Add event listeners
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
            plane = new THREE.Object3D(); // New empty object to hold the plane model
            const loadedPlane = gltf.scene;

            // Reset rotations
            loadedPlane.rotation.set(0, 0, 0);

            // Adjust the loaded plane's orientation
            loadedPlane.rotation.y = Math.PI / 2;
            loadedPlane.rotation.y += Math.PI; // Correct direction

            plane.add(loadedPlane);
            //plane.position.set(0, 1, 0);

            const axisHelper = new THREE.AxesHelper(5);
            plane.add(axisHelper);

            scene.add(plane);
            console.log('Cessna 172 model loaded and oriented successfully');
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

    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('Assets/Terrain/grass.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(50, 50);

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

    if (plane && plane instanceof THREE.Object3D) {
        // If the plane has not taken off yet
        if (!hasTakenOff) {
            if (canTakeOff && speed < maxSpeed) {
                speed += 0.002; // Gradually increase speed
            }

            plane.translateZ(speed);

            if (speed >= takeoffSpeed) {
                hasTakenOff = true;
            }
        } else {
            // If the plane has taken off
            if (canTakeOff && speed < maxSpeed) {
                speed += 0.002; // Increase throttle incrementally if W key is held down
            } else if (!canTakeOff && speed > 0) {
                speed -= 0.0005; // Gradually decrease speed when not throttling
                if (speed < 0) speed = 0; // Ensure speed doesn't go negative
            }

            // Move the plane forward
            plane.translateZ(speed);
            let liftForce = Math.max(Math.sin(plane.rotation.x) * speed * LIFT_FACTOR, 0);

            // Apply gravity and lift
            altitude -= GRAVITY;
            altitude += liftForce;

            // Ensure the plane doesn't go below ground level
            if (altitude < 0.1) {
                altitude = 0.1;
                if (speed === 0) {
                    hasTakenOff = false; // If plane hits the ground and speed is zero, it is grounded
                }
            } else {
                hasTakenOff = true; // Mark as taken off if above ground level
            }

            // Update the plane's altitude
            plane.position.y = altitude;

            // Adjust pitch based on user input
            if (pitchUp) {
                plane.rotation.x -= 0.01; // Tilt nose up
            } else if (pitchDown) {
                plane.rotation.x += 0.01; // Tilt nose down
            }
            
        	// Apply yaw changes (turn left or right)
            if (yawLeft) {
                plane.rotation.y += 0.01; // Turn left
            } else if (yawRight) {
                plane.rotation.y -= 0.01; // Turn right
            }


            // Camera follow logic
            const relativeCameraOffset = new THREE.Vector3(0, 5, -20);
            const cameraPosition = plane.localToWorld(relativeCameraOffset.clone());

            camera.position.copy(cameraPosition);
            camera.lookAt(plane.position);

            // Update UI elements for speed and altitude
            document.getElementById('speed').textContent = speed.toFixed(2);
            document.getElementById('altitude').textContent = plane.position.y.toFixed(2);
        }
    }

    // Render the scene
    if (renderer) {
        renderer.render(scene, camera);
    }
}
