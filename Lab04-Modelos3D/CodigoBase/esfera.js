// Criando uma malha poligonal de um cubo com faces coloridas em Three.js

import * as THREE from 'three';

const 	rendSize 	= new THREE.Vector2();

var scene, 
	renderer, 
	camera;

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function main() {

	renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = 
	rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, -1.0, 1.0 );
	scene.add( camera );
	
	// luzes
	scene.add(new THREE.AmbientLight(0x555555))
	
	const dirLight = new THREE.DirectionalLight(0x777777)
	dirLight.position.set(5, 9, 10)
	dirLight.castShadow = true
	scene.add(dirLight)

	buildScene();

	requestAnimationFrame(animate);		

};

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function animate(time) {

	var cube = scene.getObjectByName("esfera");

	cube.rotation.x = time * 0.00001;
	cube.rotation.y = time * 0.0001;
	cube.rotation.z = time * 0.0005;

	renderer.clear();
	renderer.render(scene, camera);

	requestAnimationFrame(animate);		
}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function buildScene() {

	const axis = new THREE.AxesHelper();
	scene.add(axis);
	
    const terreno	= new THREE.Mesh 	(	new THREE.PlaneGeometry( 100, 100, 30, 30 ), 
    										new THREE.MeshStandardMaterial(	{ color:0xFFFFFF })
										); 
	terreno.rotateX(-60.0 * Math.PI / 180.0);
	terreno.position.z = -1
    terreno.name 	= "terreno";
	terreno.receiveShadow = true;
	scene.add( terreno );

	const positions 	= [];
	const indices		= [];

	const r = 0.5
	const nTheta = 10;
	const nPhi   = 20;

	for(let iTheta = 0; iTheta <= nTheta; iTheta++) {
		for(let iPhi = 0; iPhi < nPhi; iPhi++) {
			let theta = iTheta * Math.PI / nTheta
			let phi = iPhi * 2 * Math.PI / nPhi
			
			positions.push(r*Math.cos(phi)*Math.sin(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(theta));
		}
	}
	
	for(let iTheta = 0; iTheta < nTheta; iTheta++) {
		for(let iPhi = 0; iPhi < nPhi; iPhi++) {
			let current = iTheta * nPhi + iPhi;
			let next = current + 1;
			let below = current + nPhi;
			let next_below = below + 1;
			
			if(iPhi == nPhi - 1) {
				next -= nPhi;
				next_below -= nPhi;
			}

			indices.push(next, current, below);
			indices.push(next_below, next, below);
		}
	}

	var geometry = new THREE.BufferGeometry(); 

	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	geometry.computeVertexNormals();

	const sphere = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color:0xff00ff})); 
	sphere.name = "esfera"
	sphere.castShadow = true;

	scene.add( sphere );
}

/// ***************************************************************
/// ***************************************************************
/// ***************************************************************

main();
