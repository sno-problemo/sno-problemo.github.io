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
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Directional light to simulate sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Load realistic Cessna 3D model
    loadCessnaModel();

    // Create randomized terrain with realistic textures
    terrain = createTexturedTerrain();
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

    renderer.render(scene, camera);
}

function loadCessnaModel() {
    gltfLoader.load('path/to/cessna-model.glb', (gltf) => {
        plane = gltf.scene;
        plane.position.set(0, 0.2, 0);
        plane.rotation.set(0, Math.PI, 0); // Correct orientation
        plane.scale.set(0.5, 0.5, 0.5);    // Scale down
        scene.add(plane);
    }, undefined, (error) => {
        console.error('An error occurred while loading the model:', error);
    });
}

function createRunway() {
    const runwayGeometry = new THREE.PlaneGeometry(100, 10);
    const runwayTexture = textureLoader.load('path/to/runway-texture.jpg');
    const runwayMaterial = new THREE.MeshLambertMaterial({ map: runwayTexture });
    const runwayMesh = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayMesh.rotation.x = -Math.PI / 2;
    return runwayMesh;
}

function createTexturedTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    terrainGeometry.rotateX(-Math.PI / 2);

    const simplex = new SimplexNoise();
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = simplex.noise2D(vertices[i], vertices[i + 1]) * 10; // Random height
    }

    terrainGeometry.attributes.position.needsUpdate = true;

    const grassTexture = textureLoader.load('path/to/grass-texture.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping; 
    grassTexture.repeat.set(100, 100);

    const terrainMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = -0.1;

    return terrainMesh;
}
