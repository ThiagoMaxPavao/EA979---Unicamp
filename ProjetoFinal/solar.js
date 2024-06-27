import * as THREE from 'three';

import { GUI } from '../Assets/scripts/three.js/examples/jsm/libs/lil-gui.module.min.js';
import { TWEEN } from '../Assets/scripts/three.js/examples/jsm/libs/tween.module.min.js';
import { OrbitControls } from '../Assets/scripts/three.js/examples/jsm/controls/OrbitControls.js';
import { sunInfo, moonInfo, planetsInfo } from './info.js';

const 	gui 		= new GUI();
const 	clock 		= new THREE.Clock();

const texturePath = "./textures/"

var 	scene,
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
	camera.position.set(planetsInfo[7].sunDistance * 1.3, planetsInfo[7].sunDistance * 0.3, 0); // initial cam
	camera.updateProjectionMatrix();

	camControl = new OrbitControls(camera, renderer.domElement);
	camControl.enableDamping = true;

	camControl.minDistance = 0;
	camControl.maxDistance = planetsInfo[7].sunDistance * 1.5;

	// add ambient light
	scene.add(new THREE.AmbientLight(0x101010))

	// Create a point light to simulate the light of the sun
	sunLight = new THREE.PointLight(0xffffff, 1, 0);
	sunLight.position.set(0, 0, 0);
	sunLight.castShadow = false; // only cast when planets are close
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

	// initial focus = sun
	focusObj = sunInfo.bodyMesh;

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

    let controls = {
        timeScaleExponent: 0,
        spaceScaleExponent: 0,
        focus: 'Sun',
        sunRotation: true 
    };

	// initial values
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
	gui.add(controls, 'focus', planetNames).name('Focus').onChange(focusOnBody);

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
function focusOnBody(value) {
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
		const planetRadius = planetsInfo.find(planet => planet.name === value).radius;
		newCamPos = planetPos.clone().add(new THREE.Vector3(2 * planetRadius, 2 * planetRadius, 2 * planetRadius));
		camControl.minDistance = planetRadius*2;
	}

	if (newCamPos) camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z);
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

	// save camera offset to planet
	let pos = focusObj.position;
	vec3.subVectors(camera.position, pos);
	
	// update sun
	if(sunRotationEnabled) sunInfo.rotationAngle += timeConst * delta * timeScale / sunInfo.rotationPeriod;
	const exp = -Math.log10(spaceScale);
	const aux = exp < 1 ? 1 : (2 - exp)
	sunInfo.bodyMesh.material.opacity = Math.max(aux, 0.1);
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

	// restore camera realtive position to focus planet, after movement
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
// Credits to https://www.youtube.com/watch?v=FntV9iEJ0tU, https://github.com/bobbyroe/threejs-earth/tree/main
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
		map: loader.load(texturePath + "circle.png")
	});
	const points = new THREE.Points(geo, mat);
	return points;
}

// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //

main();
