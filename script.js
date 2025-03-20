// Three.js Solar System

// 1. Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 100, 500);
controls.update();

// 3. Add Sun with Texture & Flickering
const sunTexture = new THREE.TextureLoader().load('textures/sun.jpg');
const sunMaterial = new THREE.MeshStandardMaterial({
    emissiveMap: sunTexture,
    emissive: 0xffcc00,
    emissiveIntensity: 2.5,
    metalness: 0.5,
    roughness: 0.1
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 64), sunMaterial);
scene.add(sun);

// Sun light flickering effect
setInterval(() => {
    sunMaterial.emissiveIntensity = 2 + Math.random() * 0.5;
}, 200);

// 4. Lighting
const pointLight = new THREE.PointLight(0xffffff, 3, 2000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
scene.add(new THREE.AmbientLight(0x222222));

// 5. Create Planets with Atmospheres & Orbits
const planetsData = [
    { name: "Mercury", size: 1.6, distance: 50, speed: 0.02, color: 0xaaaaaa },
    { name: "Venus", size: 4, distance: 80, speed: 0.015, color: 0xffa500 },
    { name: "Earth", size: 4.2, distance: 110, speed: 0.01, color: 0x0033cc, hasMoon: true },
    { name: "Mars", size: 2.5, distance: 150, speed: 0.008, color: 0xff4500 },
    { name: "Jupiter", size: 20, distance: 200, speed: 0.005, color: 0xd2691e },
    { name: "Saturn", size: 16, distance: 250, speed: 0.004, color: 0xffd700, hasRings: true },
    { name: "Uranus", size: 10, distance: 300, speed: 0.003, color: 0x40e0d0, hasRings: true },
    { name: "Neptune", size: 10, distance: 350, speed: 0.002, color: 0x00008b }
];

const planets = [];
planetsData.forEach(data => {
    const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.5, metalness: 0.3 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(data.size, 32, 32), material);
    scene.add(planet);
    planets.push({ ...data, mesh: planet, angle: Math.random() * Math.PI * 2 });

    // Create orbit visualization
    const orbit = new THREE.RingGeometry(data.distance - 0.5, data.distance + 0.5, 100);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
    const orbitMesh = new THREE.Mesh(orbit, orbitMaterial);
    orbitMesh.rotation.x = Math.PI / 2;
    scene.add(orbitMesh);
    
    // Add glowing atmosphere
    const atmosphereMaterial = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.3 });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(data.size * 1.1, 32, 32), atmosphereMaterial);
    planet.add(atmosphere);
});

// 6. Starfield Background
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 15000; i++) {
        starsVertices.push((Math.random() - 0.5) * 5000);
        starsVertices.push((Math.random() - 0.5) * 5000);
        starsVertices.push((Math.random() - 0.5) * 5000);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}
createStars();

// 7. Floating Planet Info Panel
const infoPanel = document.createElement("div");
infoPanel.style.position = "absolute";
infoPanel.style.top = "20px";
infoPanel.style.left = "20px";
infoPanel.style.padding = "10px";
infoPanel.style.background = "rgba(0, 0, 0, 0.7)";
infoPanel.style.color = "white";
infoPanel.style.display = "none";
document.body.appendChild(infoPanel);

// 8. Click Event for Planet Info
document.addEventListener("click", (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
        const selectedPlanet = planets.find(p => p.mesh === intersects[0].object);
        infoPanel.innerHTML = `<h3>${selectedPlanet.name}</h3><p>Size: ${selectedPlanet.size} Earths</p><p>Distance: ${selectedPlanet.distance} Million Km</p>`;
        infoPanel.style.display = "block";
    } else {
        infoPanel.style.display = "none";
    }
});

// 9. Time Speed Control
let timeSpeed = 1;
document.addEventListener("keydown", (event) => {
    if (event.key === "+") timeSpeed += 0.5;
    if (event.key === "-") timeSpeed = Math.max(0.5, timeSpeed - 0.5);
});

// 10. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    sun.rotation.y += 0.002;
    planets.forEach(planet => {
        planet.angle += planet.speed * timeSpeed;
        planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
        planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
        planet.mesh.rotation.y += 0.01;
    });
    controls.update();
    renderer.render(scene, camera);
}
animate();
