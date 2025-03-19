//  1. Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//  2. Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(20, 50, 450); // Adjust x-position to center better
camera.lookAt(0, 0, 0); 
controls.target.set(-40, 0, 0);
controls.update();


//  3. Create Sun (Properly Scaled)
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, emissive: 0xffcc00 });
const sun = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 64), sunMaterial);
scene.add(sun);

//  4. Add Lighting
const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
scene.add(new THREE.AmbientLight(0x222222));

//  5. Planet Data (Scaled Sizes and Distances)
const planetsData = [
    { name: "Mercury", size: 1.6, distance: 50, speed: 0.02, color: 0xaaaaaa },
    { name: "Venus", size: 4, distance: 80, speed: 0.015, color: 0xffa500 },
    { name: "Earth", size: 4.2, distance: 110, speed: 0.01, color: 0x0033cc, hasMoon: true },
    { name: "Mars", size: 2.5, distance: 150, speed: 0.008, color: 0xff4500 },
    { name: "Jupiter", size: 20, distance: 200, speed: 0.005, color: 0xd2691e },
    { name: "Saturn", size: 16, distance: 250, speed: 0.004, color: 0xffd700 },
    { name: "Uranus", size: 10, distance: 300, speed: 0.003, color: 0x40e0d0 },
    { name: "Neptune", size: 10, distance: 350, speed: 0.002, color: 0x00008b }
];

//  6. Create Planets
const planets = [];
planetsData.forEach(data => {
    const material = new THREE.MeshStandardMaterial({ color: data.color });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(data.size, 32, 32), material);
    scene.add(planet);
    planets.push({ ...data, mesh: planet, angle: Math.random() * Math.PI * 2 });

    //  Add Moon to Earth
    if (data.hasMoon) {
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xbbbbbb });
        const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), moonMaterial);
        planet.add(moon);
        moon.position.set(7, 0, 0);
    }
});

//  7. Add Background Stars
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        starsVertices.push((Math.random() - 0.5) * 4000);
        starsVertices.push((Math.random() - 0.5) * 4000);
        starsVertices.push((Math.random() - 0.5) * 4000);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}
createStars();

//  8. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate Sun
    sun.rotation.y += 0.002;
    
    // Move Planets in Orbit
    planets.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
        planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
        
        // Rotate Planet on its Axis
        planet.mesh.rotation.y += 0.01;
    });

    controls.update();
    renderer.render(scene, camera);
}
animate();

//  9. Resize Handling
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
