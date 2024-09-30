let scene, camera, renderer, plane, terrain, runway, speed = 0, altitude = 0;
let canTakeOff = false, hasTakenOff = false;
const maxSpeed = 1;
const takeoffSpeed = 0.2;

init();
animate();

function init() {
    scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create a detailed Cessna plane (simplified for demo purposes)
    plane = createCessnaModel();
    plane.position.set(0, 0.2, 0);
    scene.add(plane);

    // Create randomized terrain
    terrain = createTerrain();
    scene.add(terrain);

    // Create runway
    runway = createRunway();
    scene.add(runway);

    window.addEventListener('resize', onWindowResize, false);
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
        case 'ArrowUp':
            if (hasTakenOff) plane.rotation.x -= 0.01;
            break;
        case 'ArrowDown':
            if (hasTakenOff) plane.rotation.x += 0.01;
            break;
        case 'ArrowLeft':
            plane.rotation.z += 0.01;
            break;
        case 'ArrowRight':
            plane.rotation.z -= 0.01;
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

function animate() {
    requestAnimationFrame(animate);

    if (!hasTakenOff) {
        // On the runway, increase speed to take off
        if (canTakeOff && speed < takeoffSpeed) {
            speed += 0.001;
        }
        plane.translateZ(speed);

        // If speed reaches takeoff speed, lift off
        if (speed >= takeoffSpeed) {
            altitude += 0.01;
            plane.position.y += altitude;
            hasTakenOff = true;
        }
    } else {
        // Once airborne, control the plane
        plane.translateZ(speed);
    }

    camera.position.set(plane.position.x - 10, plane.position.y + 5, plane.position.z + 10);
    camera.lookAt(plane.position);

    renderer.render(scene, camera);
}

function createCessnaModel() {
    const planeGroup = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    planeGroup.add(body);

    const wingGeometry = new THREE.BoxGeometry(8, 0.2, 1);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.y = 0.3;
    planeGroup.add(wing);

    const tailWingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
    tailWing.position.set(0, 0.3, -2.5);
    planeGroup.add(tailWing);

    const tailFinGeometry = new THREE.BoxGeometry(0.1, 1, 0.5);
    const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
    tailFin.position.set(0, 1, -2.5);
    planeGroup.add(tailFin);

    return planeGroup;
}

function createRunway() {
    const runwayGeometry = new THREE.PlaneGeometry(100, 10);
    const runwayMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const runwayMesh = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayMesh.rotation.x = -Math.PI / 2;
    return runwayMesh;
}

function createTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    terrainGeometry.rotateX(-Math.PI / 2);

    // Randomize the terrain using simplex noise (or Perlin)
    const simplex = new SimplexNoise();
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = simplex.noise2D(vertices[i], vertices[i + 1]) * 5;  // Random elevation
    }

    const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22, wireframe: false });
    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = -0.1;

    return terrainMesh;
}
