// Desenhando objetos gráficos 3D do Three.JS

import * as THREE from 'three';

import { GUI } from '../../Assets/scripts/three.js/examples/jsm/libs/lil-gui.module.min.js';

const 	gui 		= new GUI();
const 	rendSize 	= new THREE.Vector2();
const 	clock 		= new THREE.Clock();
const   pointer 	= new THREE.Vector2();

var mX, mY, mP;
var 	controls,
		scene,
		camera,
		renderer,
		curObj = null;

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

	scene 	= new THREE.Scene();

	initGUI();

	window.addEventListener ( 'resize', onWindowResize 	);

	document.addEventListener	( 'pointerdown', 	onPointerDown 	);
	document.addEventListener	( 'pointerup', 		onPointerUp 	);
	document.addEventListener	( 'pointermove', 	onPointerMove 	);

	camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, -1.0, 1.0 );

	scene.add(new THREE.AmbientLight(0x333333))
	
	const dirLight = new THREE.DirectionalLight(0xaaaaaa)
	dirLight.position.set(5, 12, 8)
	dirLight.castShadow = true
	scene.add(dirLight)

	var objMesh = new THREE.Mesh 	( 	new THREE.TorusKnotGeometry(0.5, 0.2, 600, 3), 
										new THREE.MeshLambertMaterial( { color: 0xff00ff } )
									); 
	objMesh.name 	= "TorusKnot";
	objMesh.visible = true;
	objMesh.rotateY(60.0 * Math.PI / 180.0);
	objMesh.updateMatrix();
	scene.add( objMesh );

	curObj = objMesh;
	
	objMesh = new THREE.Mesh 	( 	new THREE.TorusGeometry(0.5, 0.3, 30, 30), 
									new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:false })
								); 
	objMesh.name 	= "toro";
	objMesh.visible = false;
	scene.add( objMesh );
	
	var objMesh = new THREE.Mesh 	( 	new THREE.TetrahedronGeometry(), 
										new THREE.MeshBasicMaterial({color:0xff0000, wireframe:true })
									); 
	objMesh.name 	= "tetraedro";
	objMesh.visible = false;
	scene.add( objMesh );

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function initGUI() {

	var controls = 	{	Forma3D : "TorusKnot",mousePressed 	: false,
						mousePressed 	: false,
						mousePosX  		: 0,
						mousePosY  		: 0,
						
					};

	gui.add( controls, 'Forma3D', [ 	"Tetraedro", 
										"Toro", 
										"TorusKnot" ] ).onChange(changeObj);
	
	
	
	mP = gui.add( controls, 'mousePressed');
	mP.disable(true);

	mX = gui.add( controls, 'mousePosX', -1.0, 1.0);
	mX.disable(true);

	mY = gui.add( controls, 'mousePosY', -1.0, 1.0);
	mY.disable(true);

	gui.open();
};

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function changeObj(val) { 

	switch (val) {
		case "Tetraedro"	: 	curObj = scene.getObjectByName("tetraedro");
								curObj.visible							 	= true;
								scene.getObjectByName("toro").visible 		= false;
								scene.getObjectByName("TorusKnot").visible 	= false;
								break;
		case "Toro"			:  	curObj = scene.getObjectByName("toro");
								curObj.visible							 	= true;
								scene.getObjectByName("tetraedro").visible 	= false;
								scene.getObjectByName("TorusKnot").visible 	= false;
								break;
		case "TorusKnot"	:  	curObj = scene.getObjectByName("TorusKnot");
								curObj.visible							 	= true;
								scene.getObjectByName("tetraedro").visible 	= false;
								scene.getObjectByName("toro").visible 		= false;
								break;
		}

	renderer.clear();
	renderer.render(scene, camera);
}

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
// ******************************************************************** //
// ******************************************************************** //

function anime() {
	
	const delta = clock.getDelta();

	if (mP.getValue()) {
		curObj.rotateY((pointer.x*3) * Math.PI / 180.0);
		curObj.rotateZ((pointer.y*3) * Math.PI / 180.0);
	}
	else {
		curObj.rotateY((delta*50) * Math.PI / 180.0);
		curObj.rotateZ((delta*30) * Math.PI / 180.0);
	}
	
	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onPointerDown( event ) {
	mP.setValue(true);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onPointerUp(event) {
	mP.setValue(false);
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onPointerMove( event ) {
	if (mP.getValue()) {
		renderer.getSize(rendSize);
		pointer.x 	= 	( event.clientX / rendSize.x  ) * 2 - 1;
		pointer.y 	=  -( event.clientY / rendSize.y ) * 2 + 1;
	}
}

main();
