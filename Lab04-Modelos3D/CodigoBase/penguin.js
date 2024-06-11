// Carregando uma malha de triangulos em Three.js

import * as THREE from 'three';

import { OBJLoader } from '../../Assets/scripts/three.js/examples/jsm/loaders/OBJLoader.js';

const 	rendSize = new THREE.Vector2();

var scene, 
	renderer, 
	camera;

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function main() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = 
	rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene 	= new THREE.Scene();

	camera = new THREE.OrthographicCamera( -100.0, 100.0, 100.0, -100.0, -100.0, 100.0 );
	
	scene.add( camera );
	
	// luzes
	scene.add(new THREE.AmbientLight(0x555555))
	
	const dirLight = new THREE.DirectionalLight(0x777777)
	dirLight.position.set(5, 9, 10)
	scene.add(dirLight)

	// Load Mesh
	const loader = new OBJLoader();
	loader.load('../../Assets/Models/OBJ/penguin.obj', loadMesh);

	requestAnimationFrame(animate);
	}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function loadMesh(loadedMesh) {
	var material = new THREE.MeshStandardMaterial(	{	color  		: 0xffffff, 
													wireframe  	: false
												} );

	
	loadedMesh.children.forEach(function (child) {
		child.material = material;
		});

	loadedMesh.name = "malha";
	scene.add(loadedMesh);

	const axis = new THREE.AxesHelper(100.0);
	loadedMesh.add(axis);	
	};

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function animate(time) {

	var obj = scene.getObjectByName("malha");

	if (obj) {
		obj.rotation.x = time * 0.00001;
		obj.rotation.y = time * 0.0001;
		obj.rotation.z = time * 0.0005;
		}

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(animate);		
}


/// ***************************************************************
/// ***************************************************************
/// ***************************************************************

main();
