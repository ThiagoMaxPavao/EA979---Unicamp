import * as THREE from 'three';

import { GUI } from '../Assets/scripts/three.js/examples/jsm/libs/lil-gui.module.min.js';
import { TWEEN } from '../Assets/scripts/three.js/examples/jsm/libs/tween.module.min.js';
import { OrbitControls } from '../Assets/scripts/three.js/examples/jsm/controls/OrbitControls.js';

const 	gui 		= new GUI();
const 	clock 		= new THREE.Clock();

const texturePath = "./textures/"

var 	controls, 
		scene,
		sunLight,
		camera,
		camControl,
		renderer;

var timeScale, spaceScale;
var sunRotationEnabled;

const timeConst = 2 * Math.PI / 3600;

const loader = new THREE.TextureLoader();

var focusObj;
var vec3 = new THREE.Vector3();

const sunInfo = {
	name: "Sun",
	colorMap: "sun_map.jpg",
	tilt: 7.25,
	radius: 696340,
	rotationPeriod: 648,
}

const moonInfo = {
	name: "Moon",
	colorMap: "moon_map.jpg",
	// bumpMap: "moon_bump.jpg",
	bumpScale: 0.003,
	tilt: 6.7,
	radius: 1737.5,
	earthDistance: 384400,
	rotationPeriod: 655.2,
	orbitColor: 0xC0C0C0
}

const planetsInfo = [
	{
		name: "Mercury",
		colorMap: "mercury_map.jpg",
		bumpMap: "mercury_bump.jpg",
		bumpScale: 0.002,
		tilt: 0.034,
		radius: 2439.5,
		sunDistance: 57.9e6,
		rotationPeriod: 1407.6,
		revolutionPeriod: 2112,
		orbitColor: 0x909090
	},
	{
		name: "Venus",
		colorMap: "venus_map.jpg",
		bumpMap: "venus_bump.jpg",
		bumpScale: 0.01,
		tilt: 177.4,
		radius: 6052,
		sunDistance: 108.2e6,
		rotationPeriod: -5832.5,
		revolutionPeriod: 5392.8,
		orbitColor: 0xE3CF57
	},
	{
		name: "Earth",
		colorMap: "earth_map.jpg",
		specularMap: "earth_spec.jpg",
		bumpMap: "earth_bump.jpg",
		bumpScale: 0.1,
		tilt: 23.4,
		radius: 6378,
		sunDistance: 149.6e6,
		rotationPeriod: 23.9,
		revolutionPeriod: 8764.8,
		orbitColor: 0x2A52BE
	},
	{
		name: "Mars",
		colorMap: "mars_map.jpg",
		normalMap: "mars_normal.jpg",
		normalScale: new THREE.Vector2(1, 1),
		tilt: 25.2,
		radius: 3396,
		sunDistance: 228.0e6,
		rotationPeriod: 24.6,
		revolutionPeriod: 16488,
		orbitColor: 0xB22222,
		reducedShininess: true
	},
	{
		name: "Jupiter",
		colorMap: "jupiter_map.jpg",
		tilt: 3.1,
		radius: 71492,
		sunDistance: 778.5e6,
		rotationPeriod: 9.9,
		revolutionPeriod: 103944,
		orbitColor: 0xD4AF37
	},
	{
		name: "Saturn",
		colorMap: "saturn_map.jpg",
		hasRing: true,
		ringColor: "saturn_ring_color.jpg",
		ringPattern: "saturn_ring_pattern.gif",
		ringInnerRadius: 1.237,
		ringOuterRadius: 2.27,
		tilt: 26.7,
		radius: 60268,
		sunDistance: 1432.0e6,
		rotationPeriod: 10.7,
		revolutionPeriod: 257928,
		orbitColor: 0xD2B48C
	},
	{
		name: "Uranus",
		colorMap: "uranus_map.jpg",
		hasRing: true,
		ringColor: "uranus_ring_color.jpg",
		ringPattern: "uranus_ring_pattern.gif",
		ringInnerRadius: 1.637,
		ringOuterRadius: 2.006,
		tilt: 97.8,
		radius: 25559,
		sunDistance: 2867.0e6,
		rotationPeriod: -17.2,
		revolutionPeriod: 734136,
		orbitColor: 0xAFEEEE
	},
	{
		name: "Neptune",
		colorMap: "neptune_map.jpg",
		tilt: 28.3,
		radius: 24764,
		sunDistance: 4515.0e6,
		rotationPeriod: 16.1,
		revolutionPeriod: 1435200,
		orbitColor: 0x2C75FF
	}
]

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function main() {
	// scale down distance/radius numbers
	const scaleDownFactor = 6378;

	sunInfo.radius /= scaleDownFactor;
	moonInfo.radius /= scaleDownFactor;
	moonInfo.earthDistance /= scaleDownFactor;

	planetsInfo.forEach((info, index) => {
		info.radius /= scaleDownFactor;
		info.sunDistance /= scaleDownFactor;
	});

	// create renderer
	renderer = new THREE.WebGLRenderer({antialiasing: true});
    renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	renderer.shadowMap.enabled = true;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.getElementById('threejs-canvas').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    scene = new THREE.Scene();

	initGUI();

	// add camera
	camera = new THREE.PerspectiveCamera( 70.0, window.innerWidth / window.innerHeight, 0.01, 10000000.0 );
	camera.position.x = 600000;
	camera.position.z = 600000;
	camera.position.y = 200000;
	camera.updateProjectionMatrix();

	camControl = new OrbitControls(camera, renderer.domElement);
	camControl.enableDamping = true;

	camControl.minDistance = 0;
	camControl.maxDistance = planetsInfo[7].sunDistance * 1.5;

	// add ambient light
	scene.add(new THREE.AmbientLight(0x101010))

	// Create a point light to simulate the light of the sun
	sunLight = new THREE.PointLight(0xffffff, 1, 0); // (color, intensity, distance)
	sunLight.position.set(0, 0, 0);
	sunLight.castShadow = false;
	scene.add(sunLight);

	// add objects

	// add sun
	createSun();

	// add planets
	
	planetsInfo.forEach((info, index) => {

		const [group, planet] = createBody(
			info.colorMap,
			info.specularMap,
			info.bumpMap,
			info.bumpScale,
			info.normalMap,
			info.normalScale,
			info.tilt,
			info.radius,
			info.hasRing,
			info.ringColor,
			info.ringPattern,
			info.ringInnerRadius,
			info.ringOuterRadius,
			info.reducedShininess
		)
		info.groupMesh  = group;
		info.bodyMesh = planet;

		// initialize with random angles
		info.revolutionAngle = Math.random() * 2 * Math.PI;
		info.rotationAngle   = Math.random() * 2 * Math.PI;

		let orbit = createCircumference(64, info.orbitColor);
		info.orbit = orbit;
		
		info.groupMesh.name = info.name;
    	scene.add(orbit);
		scene.add(info.groupMesh)
	});

	// add moon
	createMoon();

	// add stars
	const starfield = getStarfield();
	scene.add(starfield);

	focusObj = sunInfo.bodyMesh;

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function initGUI() {
	let planetNames = []
	planetsInfo.forEach(planet => planetNames.push(planet.name));
    planetNames.unshift('Moon');
    planetNames.unshift('Sun');

    var controls = {
        timeScaleExponent: 0,
        spaceScaleExponent: 0,
        focus: 'Sun',
        sunRotation: true 
    };

	timeScale = Math.pow(10, controls.timeScaleExponent);
	spaceScale = Math.pow(10, controls.spaceScaleExponent);
	sunRotationEnabled = controls.sunRotation;

    // Create a slider for timeScale exponent
    gui.add(controls, 'timeScaleExponent', 0, 8).step(0.01).name('Time Scale').onChange(function(value) {
        timeScale = Math.pow(10, value);
    });

    // Create a slider for spaceScale exponent
    const spaceScaleSlider = gui.add(controls, 'spaceScaleExponent', -3.5, 0).step(0.01).name('Space Scale').onChange(function(value) {
        const targetSpaceScale = Math.pow(10, value);
		tweenSpaceScale(spaceScale, targetSpaceScale);
		
		// cast shadow if objects are close
		sunLight.castShadow = value < -3;
    });

	// Add a dropdown menu for focus object selection
	gui.add(controls, 'focus', planetNames).name('Focus').onChange(function(value) {
		const newObj = scene.getObjectByName(value);
		if(newObj) focusObj = newObj;
		else console.error("Focused object not found by name");

		let newCamPos;
		
		if (value === "Sun") {
			const sunRadius = sunInfo.radius;
			newCamPos = new THREE.Vector3(2 * sunRadius, 2 * sunRadius, 2 * sunRadius);
			camControl.minDistance = 0;
		} else if (value === "Moon") {
			const moonPos = focusObj.position;
			const moonRadius = moonInfo.radius;
			newCamPos = moonPos.clone().add(new THREE.Vector3(2 * moonRadius, 2 * moonRadius, 2 * moonRadius));
			camControl.minDistance = moonRadius*2;
		} else {
			const planetPos = focusObj.position;
			const planetIndex = planetNames.findIndex(v => v === value) - 2; // 2 = Sun and Moon
			const planetRadius = planetsInfo[planetIndex].radius;
			newCamPos = planetPos.clone().add(new THREE.Vector3(2 * planetRadius, 2 * planetRadius, 2 * planetRadius));
			camControl.minDistance = planetRadius*2;
		}
		
		if (newCamPos) camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z);
	});

    // Add a checkbox for Sun rotation
    gui.add(controls, 'sunRotation').name('Sun rotation').onChange(function(value) {
        // Toggle sun rotation based on checkbox state
        sunRotationEnabled = value;
    }).setValue(controls.sunRotation); // Initialize checkbox state

	// Function to update slider value from current spaceScale
    function updateSliderFromSpaceScale(value) {
        spaceScaleSlider.setValue(value);
        tweenSpaceScale(spaceScale, Math.pow(10, value));
    }

    // Add buttons for special spaceScale values
    const buttons = {
        "Normal scale": 0,
        "Earth & Moon scale": -1.5,
        "Close to Sun scale": -1.85,
        "Planets comparison scale": -3.5
    };

    for (const buttonLabel in buttons) {
        const scaleValue = buttons[buttonLabel];
        gui.add({ setScale: function() { updateSliderFromSpaceScale(scaleValue); } }, 'setScale').name(buttonLabel);
    }

    // Open the GUI by default
    gui.open();
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function anime() {
    TWEEN.update();

	const delta = clock.getDelta();

	let pos = focusObj.position;
	vec3.subVectors(camera.position, pos);
	
	// update sun
	if(sunRotationEnabled) sunInfo.rotationAngle += timeConst * delta * timeScale / sunInfo.rotationPeriod;
	const exp = -Math.log10(spaceScale);
	const aux = exp < 1 ? 1 : (2 - exp)
	sunInfo.bodyMesh.material.opacity = Math.max(aux, 0.03);
	sunInfo.bodyMesh.rotation.y = sunInfo.rotationAngle;

	// update planets
	planetsInfo.forEach(info => {
		info.rotationAngle   += timeConst * delta * timeScale / info.rotationPeriod;
		info.revolutionAngle += timeConst * delta * timeScale / info.revolutionPeriod;
		
		info.groupMesh.position.set(
			spaceScale * info.sunDistance*Math.sin(info.revolutionAngle),
			0,
			spaceScale * info.sunDistance*Math.cos(info.revolutionAngle)
		);
		
		info.bodyMesh.rotation.y = info.rotationAngle;

		// update orbit
		info.orbit.scale.setScalar(spaceScale * info.sunDistance);
		info.orbit.rotation.z = -info.revolutionAngle;
	})

	// update moon
	moonInfo.rotationAngle += timeConst * delta * timeScale / moonInfo.rotationPeriod;
	moonInfo.groupMesh.position.set(
		moonInfo.earthPositionRef.x + spaceScale * moonInfo.earthDistance*Math.sin(moonInfo.rotationAngle),
		moonInfo.earthPositionRef.y,
		moonInfo.earthPositionRef.z + spaceScale * moonInfo.earthDistance*Math.cos(moonInfo.rotationAngle)
	);
	moonInfo.groupMesh.rotation.y = moonInfo.rotationAngle;

	// moon orbit
	moonInfo.orbit.position.set(moonInfo.earthPositionRef.x, moonInfo.earthPositionRef.y, moonInfo.earthPositionRef.z);
	moonInfo.orbit.scale.setScalar(spaceScale * moonInfo.earthDistance);
	moonInfo.orbit.rotation.z = -moonInfo.rotationAngle;
	
	const aux2 = exp < 1.55 ? 1 : (1 - 10 * (exp-1.55))
	moonInfo.bodyMesh.material.opacity = Math.max(aux2, 0.1);

	pos = focusObj.position;
	camControl.object.position.copy(pos).add(vec3);
	camControl.target.copy(pos);
	camControl.update();

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
const sphereSharedGeometry = new THREE.SphereGeometry(1, 40, 40);

function createBody(colorMap, specularMap, bumpMap, bumpScale, normalMap, normalScale, tilt, size, hasRing, ringColor, ringPattern, ringInnerRadius, ringOuterRadius, reducedShininess) {
	const group = new THREE.Group();
	group.rotation.z = tilt * Math.PI / 180;

	const materialParams = {
		transparent: true,
		opacity: 1
	};

	if(bumpScale)   materialParams.bumpScale = bumpScale;
	if(normalScale) materialParams.normalScale = normalScale;
	if(colorMap)    materialParams.map = loader.load(texturePath + colorMap);
	if(specularMap) materialParams.specularMap = loader.load(texturePath + specularMap);
	if(bumpMap)     materialParams.bumpMap = loader.load(texturePath + bumpMap);
	if(normalMap) {
		materialParams.normalMap = loader.load(texturePath + normalMap);
		materialParams.normalMapType = THREE.TangentSpaceNormalMap;
	}
	if(reducedShininess) materialParams.shininess = 10;

	const material = new THREE.MeshPhongMaterial(materialParams);

	const bodyMesh = new THREE.Mesh(sphereSharedGeometry, material);
	bodyMesh.scale.setScalar(size);
	bodyMesh.updateMatrix();
	group.add(bodyMesh);

	if(hasRing) {
		const material = new THREE.MeshPhongMaterial({
			map: loader.load(texturePath + ringColor),
			alphaMap: loader.load(texturePath + ringPattern),
			transparent: true,
			side: THREE.DoubleSide
		});

		const innerRadius = size * ringInnerRadius;
		const outerRadius = size * ringOuterRadius;
		const geometry = new THREE.RingBufferGeometry(innerRadius, outerRadius, 100, 10);

		var pos = geometry.attributes.position;
		var v3 = new THREE.Vector3();

		for (let i = 0; i < pos.count; i++){
			v3.fromBufferAttribute(pos, i);
			let radius = v3.length();
			// Normalize radius to [0, 1]
			let u = (radius - innerRadius) / (outerRadius - innerRadius);
			geometry.attributes.uv.setXY(i, 1-u, 1);
		}

		const ringMesh = new THREE.Mesh(geometry, material);
		ringMesh.rotateX(Math.PI/2);
		ringMesh.updateMatrix();
		
		bodyMesh.castShadow    = true;
		ringMesh.receiveShadow = true;

		group.add(ringMesh);
	}

	return [group, bodyMesh];
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function createSun() {
	const group = new THREE.Group();
	group.rotation.z = sunInfo.tilt * Math.PI / 180;
	
	const sun = new THREE.Mesh(sphereSharedGeometry, new THREE.MeshBasicMaterial({
		map: loader.load(texturePath + sunInfo.colorMap),
		transparent: true,
		opacity: 1,
		side: THREE.DoubleSide
	}));
	sun.scale.setScalar(sunInfo.radius);
	sun.updateMatrix();
	sun.renderOrder = 1;
	sun.name = sunInfo.name;
	group.add(sun);
	
	sunInfo.rotationAngle = Math.random() * 2 * Math.PI;
	sunInfo.groupMesh  = group;
	sunInfo.bodyMesh = sun;
	scene.add(group);
	
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
	const material = new THREE.PointsMaterial({color: 0xffffff, size: 3, sizeAttenuation: false});
	const dot = new THREE.Points(geometry, material);
	scene.add(dot);
}
// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function createMoon() {
	const info = moonInfo;
	const [group, moon] = createBody(
		info.colorMap,
		info.specularMap,
		info.bumpMap,
		info.bumpScale,
		info.normalMap,
		info.normalScale,
		info.tilt,
		info.radius,
		info.hasRing,
		info.ringColor,
		info.ringPattern,
		info.ringInnerRadius,
		info.ringOuterRadius
	)
	info.groupMesh  = group;
	info.bodyMesh = moon;

	info.earthPositionRef = scene.getObjectByName("Earth").position;

	info.rotationAngle = Math.random() * 2 * Math.PI;
	group.name = info.name;
	scene.add(group);

	let orbit = createCircumference(128, info.orbitColor);
	info.orbit = orbit;

	scene.add(orbit);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function createCircumference(segments, color) {
    const circleGeometry = new THREE.CircleGeometry(1, segments);
    const edgesGeometry = new THREE.EdgesGeometry(circleGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
    const circleOutline = new THREE.LineSegments(edgesGeometry, lineMaterial);

	circleOutline.rotateX(Math.PI/2);
	return circleOutline;
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function tweenSpaceScale(start, end) { // function to ease transitions in changes to space scale
    new TWEEN.Tween({ scale: start })
        .to({ scale: end }, 1000) // Duration in milliseconds
        .easing(TWEEN.Easing.Quintic.Out) // Easing function
        .onUpdate(function (obj) {
            spaceScale = obj.scale;
        })
        .start();
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function getStarfield({ numStars = 2000 } = {}) {
	function randomSpherePoint() {
		const radius = Math.random() * 5000000 + 10000000;
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		let x = radius * Math.sin(phi) * Math.cos(theta);
		let y = radius * Math.sin(phi) * Math.sin(theta);
		let z = radius * Math.cos(phi);

		return {
		pos: new THREE.Vector3(x, y, z),
		hue: 0.6,
		minDist: radius,
		};
	}
	const verts = [];
	const colors = [];
	const positions = [];
	let col;
	for (let i = 0; i < numStars; i += 1) {
		let p = randomSpherePoint();
		const { pos, hue } = p;
		positions.push(p);
		col = new THREE.Color().setHSL(hue, 0.2, Math.random());
		verts.push(pos.x, pos.y, pos.z);
		colors.push(col.r, col.g, col.b);
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
	geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
	const mat = new THREE.PointsMaterial({
		size: 0.2,
		vertexColors: true,
		map: new THREE.TextureLoader().load(
		texturePath + "circle.png"
		),
	});
	const points = new THREE.Points(geo, mat);
	return points;
}

// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //

main();
