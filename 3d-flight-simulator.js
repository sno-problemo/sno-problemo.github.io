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

    // Add a simple cube to test rendering
   // const geometry = new THREE.BoxGeometry(1, 1, 1);
   // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
   // const cube = new THREE.Mesh(geometry, material);
   // cube.position.set(0, 1, 0);
    //scene.add(cube);

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

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function loadPlaneModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        'Assets/Plane/cessna-172.glb',
        function (gltf) {
            // Create a wrapper object to handle rotation and positioning
            plane = new THREE.Object3D(); // New empty object to hold the plane model
            const loadedPlane = gltf.scene;

			// Step 1: Start by resetting all rotations to their default (zero)
            loadedPlane.rotation.set(0, 0, 0);

            // Adjust the loaded plane's orientation to match the environment
            //loadedPlane.rotation.x = Math.PI; // Rotate around X to face forward (-Z direction in Three.js)
            //loadedPlane.rotation.z = Math.PI / 2; // This rotation might be necessary depending on the original model orientation
			//loadedPlane.rotation.y = -Math.PI / 2; // Plane faces camera
			loadedPlane.rotation.y = Math.PI / 2; // Plane faces forward logically but moves towards camera
			loadedPlane.rotation.y += Math.PI; // This additional 180-degree rotation ensures that the red axis (X-axis) points towards the right wing, and swaps the left and right wings.

            // Add the loaded plane to the wrapper
            plane.add(loadedPlane);

            // Position the wrapper so the plane sits on the runway properly
            plane.position.set(0, 1, 0); // Adjust Y value if necessary to match the ground level

            // Use an AxesHelper to debug the plane's current orientation
            const axisHelper = new THREE.AxesHelper(5);
            plane.add(axisHelper);

            // Add the plane to the scene
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
    runwayMesh.rotation.x = 0;
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

//const GRAVITY = 0.005; // Gravity pulling the plane down
//const LIFT_FACTOR = 0.05; // Factor to determine lift based on pitch and speed

function animate() {{
    requestAnimationFrame(animate);

	// Ensure the plane is loaded and defined before running transformations
    if (plane && plane instanceof THREE.Object3D) {
    	// Move plane based on user input
    	if (!hasTakenOff) {
        	// Thrust: Increase speed with throttle (limited by max speed)
        	if (canTakeOff && speed < maxSpeed) {
            	speed += 0.002; // Gradually increase speed
        	}	
        
        	plane.translateZ(speed); // Move forward along the Z-axis (add a - symbol in fornt of speed if plane moves towards camera)

			if (speed >= takeoffSpeed) {
				hasTakenOff = true; // Allow takeoff once speed is sufficient
			}
		} else {
			// Manage speed, ensuring it doesn't exceed maxSpeed
        	if (canTakeOff && speed < maxSpeed) {
        		speed += 0.002; // Increase throttle incrementally if W key is held down
        	}	else if (!canTakeOff && speed > 0) {
           	 		speed -= 0.0005; // Gradually decrease speed when not throttling
            		if (speed < 0) speed = 0; // Ensure speed doesn't go negative
        	}

        // Forward Movement: Move in the local -Z direction to go forward
        plane.translateZ(speed); // Negative Z makes the plane move forward in its local space

        // Lift: If enough speed is achieved, the plane starts gaining altitude
        let liftForce = 0;
        if (speed >= takeoffSpeed) {
            liftForce = Math.max(Math.sin(plane.rotation.x) * speed * LIFT_FACTOR, 0); // Calculate lift
        }
        
        altitude -= GRAVITY; // Apply GRAVITY
        altitude += liftForce; // Add lift to counteract gravity

		// Prevent plane from going below ground level
		if (altitude < 0.1) {
			altitude = 0.1; // Keep the plane on the ground if altitude drops
			if (speed === 0) {
				hasTakenOff = false; // Plane is grounded if altitude drops and speed is zero
			}
		} else {
			hasTakenOff = true; // Mark as taken off if above ground  level
		}
		
		//
		plane.position.y = altitude

//        if (hasTakenOff) {
//            // Apply lift based on pitch
//            const liftForce = Math.sin(plane.rotation.x) * speed * 0.05; // Simplified lift logic
//            altitude += liftForce;
//            plane.position.y = Math.max(altitude, 0.1); // Ensure the plane stays above the ground
//        }
		if (plane) {
        // Camera Follow Logic
        	const relativeCameraOffset = new THREE.Vector3(0, 5, -20);
        	const cameraPosition = plane.localToWorld(relativeCameraOffset.clone());

        	// Set camera position and ensure it looks at the plane
        	camera.position.copy(cameraPosition);
        	camera.lookAt(plane.position);
			}
        // Update UI elements for speed and altitude
        document.getElementById('speed').textContent = speed.toFixed(2);
        document.getElementById('altitude').textContent = plane.position.y.toFixed(2);
    	}
    }

    // Render the scene
    If (renderer) 
    	renderer.render(scene, camera);
    
}

let pitchUp = false, pitchDown = false;

function handleKeyDown(event) {
    if (plane) {
        switch (event.code) {
            case 'ArrowUp':
                pitchUp = true; // Tilt nose up
                break;
            case 'ArrowDown':
                pitchDown = true; // Tilt nose down
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
            case 'KeyW':
                canTakeOff = false; // Stop throttle increase
                break;
        }
    }
}

//function handleKeyUp(event) {
//    if (event.code === 'KeyW') {
//        canTakeOff = false; // Stop increasing throttle
//    }
//}


//function animate() {
//    requestAnimationFrame(animate);

//    if (plane) {
        // Increase speed gradually if W key is pressed and speed hasn't reached maxSpeed
//        if (canTakeOff && speed < maxSpeed) {
//            speed += 0.002; // Increase throttle incrementally
//        } else if (!canTakeOff && speed > 0) {
//            speed -= 0.001; // Gradual deceleration if no throttle input
//            if (speed < 0) speed = 0; // Ensure speed does not go negative
//        }

            // Move forward along the negative Z-axis
//            plane.translateZ(-speed);

            // Calculate lift
//        let liftForce = 0;
//        if (speed >= takeoffSpeed) {
            // Generate lift based on speed and pitch
//            liftForce = Math.max(Math.sin(plane.rotation.x) * speed * LIFT_FACTOR, 0);
//        }


//            altitude -= GRAVITY; // Gravity always pulls the plane down
//            altitude += liftForce; // Lift counteracts gravity when present
//
            // Prevent plane from falling through the ground
//            if (altitude < 0.1) {
//                altitude = 0.1;
//                speed = 0; // If the plane hits the ground, reset speed
//                hasTakenOff = false; // Plane is grounded
//            }

            // Set the plane's altitude
//            plane.position.y = altitude;
//
            // Apply pitch changes
//            if (pitchUp) {
//                plane.rotation.x -= 0.01; // Tilt nose up
//            } else if (pitchDown) {
//                plane.rotation.x += 0.01; // Tilt nose down
//            }
//        }
//
        // Camera follow logic
//        const relativeCameraOffset = new THREE.Vector3(0, 5, 20); // Offset behind and above the plane
//        const cameraPosition = plane.localToWorld(relativeCameraOffset.clone()); // Convert to world coordinates
//
        // Set camera position and make it look at the plane
//        camera.position.copy(cameraPosition);
//        camera.lookAt(plane.position);
//    }
//
//    if (renderer) {
//        renderer.render(scene, camera);
//    }
//
    // Update UI
//    if (plane) {
//        document.getElementById('speed').textContent = speed.toFixed(2);
//        document.getElementById('altitude').textContent = plane.position.y.toFixed(2);
//        
}