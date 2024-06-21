import * as THREE from 'three';

import { GUI } from '../Assets/scripts/three.js/examples/jsm/libs/lil-gui.module.min.js';

const 	gui 		= new GUI();
const 	clock 		= new THREE.Clock();
const 	rendSize 	= new THREE.Vector2();

var 	controls, 
		scene,
		camera,
		renderer;

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function main() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = 
	rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize);

	scene = new THREE.Scene();

	initGUI();

	// add camera
	camera = new THREE.PerspectiveCamera( 70.0, rendSize.x / rendSize.y, 0.01, 1000.0 );
	camera.position.y = 0.0;
	camera.position.z = 2.0;
	camera.updateProjectionMatrix();

	// add light
	const dirLight = new THREE.DirectionalLight(0xffffff)
	dirLight.position.set(7, 12, 8)
	// dirLight.castShadow = true
	scene.add(dirLight)

	// add objects
	var axis = new THREE.AxesHelper(0.8);
    axis.name = "eixos";
    scene.add(axis);

	var material = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		wireframe: false,
		map: new THREE.TextureLoader().load("./textures/earth_texture.jpg"),
		// displacementMap: new THREE.TextureLoader().load("./textures/earth_normal.tif"),
		// normalMapType: THREE.TangentSpaceNormalMap,
		displacementMap: new THREE.TextureLoader().load("./textures/earth_bump_low_2.png"),
		displacementScale: .1
	});

	var objMesh = new THREE.Mesh 	( 	new THREE.SphereGeometry(1, 50, 50), 
										material
									);

	objMesh.name 	= "esfera";
	objMesh.visible = true;
	objMesh.updateMatrix();
	scene.add( objMesh );

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function initGUI() {

	var controls = {};

	// gui.add
	// gui.open();
};

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onWindowResize() {

	let minDim = Math.min(window.innerWidth, window.innerHeight);

	renderer.setSize(minDim*0.8, minDim*0.8);

	renderer.clear();
	renderer.render(scene, camera);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function anime() {

	const delta = clock.getDelta();

	let obj = scene.getObjectByName("esfera");
	obj.rotateY(delta/10);

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);
}
// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //

main();
