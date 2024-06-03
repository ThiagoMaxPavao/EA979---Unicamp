// Gerando um terreno plano baseado no objeto PlaneGeometru do Three.JS

import * as THREE from 'three';

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
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = window.innerWidth * 0.8;
	rendSize.y = window.innerHeight * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene 	= new THREE.Scene();

	scene.add(new THREE.AmbientLight(0x333333))

	// camera = new THREE.OrthographicCamera( -10.0, 10.0, 10.0, -10.0, -1.0, 1.0 );

	camera = new THREE.PerspectiveCamera( 70.0, rendSize.x / rendSize.y, 0.01, 1000.0 );
	camera.position.y = 4.0;
	camera.position.z = 13.0;
	camera.updateProjectionMatrix();

	geraTerreno();


	requestAnimationFrame(anime);

}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************
function anime(time) {

	var obj = scene.getObjectByName("terreno");

	obj.rotateZ(0.005);
	obj.updateMatrix();

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(anime);		
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function geraTerreno() {

    const terreno	= new THREE.Mesh 	(	new THREE.PlaneGeometry( 100, 100, 30, 30 ), 
    										new THREE.MeshStandardMaterial(	{ color:0xFFFFFF })
										); 
	terreno.rotateX(-90.0 * Math.PI / 180.0);
    terreno.name 	= "terreno";
	terreno.receiveShadow = true;
	scene.add( terreno );

	const cubo = new THREE.Mesh ( 	new THREE.BoxGeometry(3,3,3), 
									new THREE.MeshPhongMaterial( { color: 0xff0000 } )
								); 
	cubo.position.z = 1.5;
	cubo.castShadow = true;
	cubo.name = "cubo vermelho";

	terreno.add(cubo);

	const dirLight = new THREE.DirectionalLight(0xaaaaaa)
	dirLight.position.set(5, 12, 8)
	dirLight.castShadow = true
	
	terreno.add(dirLight)
}

// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //

main();
