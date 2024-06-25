import * as THREE from 'three';

import { GUI } from '../Assets/scripts/three.js/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../Assets/scripts/three.js/examples/jsm/controls/OrbitControls.js';

const 	gui 		= new GUI();
const 	clock 		= new THREE.Clock();
const 	rendSize 	= new THREE.Vector2();

var 	controls, 
		scene,
		camera,
		camControl,
		renderer;

var timeScale, spaceScale;

const timeConst = 2 * Math.PI / 3600;

const loader = new THREE.TextureLoader();

const planetsInfo = [
	{
		name: "mercury",
		colorMap: "mercury_map.jpg",
		bumpMap: "mercury_bump.jpg",
		bumpScale: 0.007,
		tilt: 0.034,
		radius: 2439.5,
		sunDistance: 57.9e6,
		rotationPeriod: 1407.6,
		revolutionPeriod: 2112
	},
	{
		name: "venus",
		colorMap: "venus_map.jpg",
		bumpMap: "venus_bump.jpg",
		bumpScale: 0.03,
		tilt: 177.4,
		radius: 6052,
		sunDistance: 108.2e6,
		rotationPeriod: -5832.5,
		revolutionPeriod: 5392.8
	},
	{
		name: "earth",
		colorMap: "earth_map.jpg",
		specularMap: "earth_spec.jpg",
		bumpMap: "earth_bump.jpg",
		bumpScale: 0.3,
		tilt: 23.4,
		radius: 6378,
		sunDistance: 149.6e6,
		rotationPeriod: 23.9,
		revolutionPeriod: 8764.8
	},
	{
		name: "mars",
		colorMap: "mars_map.jpg",
		normalMap: "mars_normal.jpg",
		normalScale: new THREE.Vector2(1, 1),
		tilt: 25.2,
		radius: 3396,
		sunDistance: 228.0e6,
		rotationPeriod: 24.6,
		revolutionPeriod: 16488
	},
	{
		name: "jupiter",
		colorMap: "jupiter_map.jpg",
		tilt: 3.1,
		radius: 71492,
		sunDistance: 778.5e6,
		rotationPeriod: 9.9,
		revolutionPeriod: 103944
	},
	{
		name: "saturn",
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
		revolutionPeriod: 257928
	},
	{
		name: "uranus",
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
		revolutionPeriod: 734136
	},
	{
		name: "neptune",
		colorMap: "neptune_map.jpg",
		tilt: 28.3,
		radius: 24764,
		sunDistance: 4515.0e6,
		rotationPeriod: 16.1,
		revolutionPeriod: 1435200
	}
]

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function main() {
	renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.getElementById('threejs-canvas').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    scene = new THREE.Scene();

	initGUI();

	// add camera
	camera = new THREE.PerspectiveCamera( 70.0, window.innerWidth / window.innerHeight, 0.01, 10000.0 );
	camera.position.z = 2.0;
	camera.updateProjectionMatrix();

	camControl = new OrbitControls(camera, renderer.domElement);

	// add ambient light
	scene.add(new THREE.AmbientLight(0x101010))

	// Create a point light to simulate the light of the sun
	const pointLight = new THREE.PointLight(0xffffff, 1, 0); // (color, intensity, distance)
	pointLight.position.set(0, 0, 0);
	pointLight.castShadow = true;
	scene.add(pointLight);

	// add objects
	var axis = new THREE.AxesHelper(0.8);
    axis.name = "eixos";
    scene.add(axis);

	planetsInfo.forEach((info, index) => {
		info.radius /= 1e7;
		info.sunDistance /= 1e7;

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
			info.ringOuterRadius
		)
		info.meshGroup  = group;
		info.planetMesh = planet;

		// initialize with random angles
		info.revolutionAngle = Math.random() * 2 * Math.PI;
		info.rotationAngle   = Math.random() * 2 * Math.PI;
	});

	planetsInfo.forEach(info => {
		scene.add(info.meshGroup)
	});

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function initGUI() {
    var controls = {
        timeScaleExponent: 5,
        spaceScaleExponent: 3
    };

	timeScale = Math.pow(10, controls.timeScaleExponent);
	spaceScale = Math.pow(10, controls.spaceScaleExponent);

    // Create a slider for timeScale exponent
    gui.add(controls, 'timeScaleExponent', 0, 8).step(0.1).name('Time Scale').onChange(function(value) {
        timeScale = Math.pow(10, value);
        updateDisplay();
    });

    // Create a slider for spaceScale exponent
    gui.add(controls, 'spaceScaleExponent', 0, 4).step(0.1).name('Space Scale').onChange(function(value) {
        spaceScale = Math.pow(10, value);
        updateDisplay();
    });

    // Update the display to show the current values of timeScale and spaceScale
    function updateDisplay() {
        console.log('Time Scale:', timeScale);
        console.log('Space Scale:', spaceScale);
    }

    // Open the GUI by default
    gui.open();

    // Initial display update
    updateDisplay();
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

	const delta = clock.getDelta();

	planetsInfo.forEach(info => {
		info.rotationAngle   += timeConst * delta * timeScale / info.rotationPeriod;
		info.revolutionAngle += timeConst * delta * timeScale / info.revolutionPeriod;
		
		info.meshGroup.position.set(
			info.sunDistance*Math.sin(info.revolutionAngle),
			0,
			info.sunDistance*Math.cos(info.revolutionAngle)
		);
		info.meshGroup.scale.setScalar(spaceScale);
		
		info.planetMesh.rotation.y = info.rotationAngle;
	})

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
const sphereSharedGeometry = new THREE.SphereGeometry(1, 40, 40);

function createBody(colorMap, specularMap, bumpMap, bumpScale, normalMap, normalScale, tilt, size, hasRing, ringColor, ringPattern, ringInnerRadius, ringOuterRadius) {
	const group = new THREE.Group();
	group.rotation.z = tilt * Math.PI / 180;

	const path = "./textures/";

	const materialParams = {};

	if(bumpScale)   materialParams.bumpScale = bumpScale;
	if(normalScale) materialParams.normalScale = normalScale;
	if(colorMap)    materialParams.map = loader.load(path + colorMap);
	if(specularMap) materialParams.specularMap = loader.load(path + specularMap);
	if(bumpMap)     materialParams.bumpMap = loader.load(path + bumpMap);
	if(normalMap) {
		materialParams.normalMap = loader.load(path + normalMap);
		materialParams.normalMapType = THREE.TangentSpaceNormalMap;
	}

	console.log(materialParams);

	const material = new THREE.MeshPhongMaterial(materialParams);

	const planetMesh = new THREE.Mesh(sphereSharedGeometry, material);
	planetMesh.scale.setScalar(size);
	if(hasRing) planetMesh.castShadow = true;
	planetMesh.updateMatrix();
	group.add(planetMesh);

	if(hasRing) {
		console.log("Criando anel")
		const material = new THREE.MeshPhongMaterial({
			map: loader.load(path + ringColor),
			alphaMap: loader.load(path + ringPattern),
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
		ringMesh.receiveShadow = true;
		ringMesh.updateMatrix();

		group.add(ringMesh);
	}

	return [group, planetMesh];
}

// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //



main();
