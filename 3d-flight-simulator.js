let scene, camera, renderer, plane, controls, ground;

init();
animate();

function init() {
    // Create the scene and set the scene size
    scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create a camera, set its position, and point it to the center of the scene
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);  // Start behind the plane

    // Create a renderer and attach it to the document
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create a plane geometry (Cessna)
    const planeGeometry = new THREE.BoxGeometry(2, 1, 6);  // Simple shape for Cessna
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 5, 0);
    scene.add(plane);

    // Create the ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x008800 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Create skybox (simple blue color)
    const skyColor = 0x87CEEB;  // Light sky blue color
    scene.background = new THREE.Color(skyColor);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Keyboard controls
    controls = {
        roll: 0,
        pitch: 0,
        yaw: 0,
        speed: 0.1
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
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
        case 'ArrowUp':  // Pitch up
            controls.pitch = 0.02;
            break;
        case 'ArrowDown':  // Pitch down
            controls.pitch = -0.02;
            break;
        case 'ArrowLeft':  // Roll left
            controls.roll = 0.02;
            break;
        case 'ArrowRight':  // Roll right
            controls.roll = -0.02;
            break;
        case 'KeyW':  // Move forward
            controls.speed = 0.2;
            break;
        case 'KeyS':  // Slow down
            controls.speed = 0.05;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
            controls.pitch = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            controls.roll = 0;
            break;
        case 'KeyW':
        case 'KeyS':
            controls.speed = 0.1;
            break;
    }
}

function animate() {
    // Plane movement logic
    plane.rotation.x += controls.pitch;
    plane.rotation.z += controls.roll;
    plane.translateZ(controls.speed);

    // Update camera position (3rd person behind the plane)
    camera.position.set(
        plane.position.x - Math.sin(plane.rotation.y) * 10,
        plane.position.y + 5,
        plane.position.z - Math.cos(plane.rotation.y) * 10
    );
    camera.lookAt(plane.position);

    // Render the scene
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
