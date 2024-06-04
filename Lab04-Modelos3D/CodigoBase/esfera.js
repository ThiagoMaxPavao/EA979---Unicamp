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

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = 
	rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene 	= new THREE.Scene();

	camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, -1.0, 1.0 );
	scene.add( camera );

	// luzes
	scene.add(new THREE.AmbientLight(0xaaaaaa))
	
	const dirLight = new THREE.DirectionalLight(0xaaaaaa)
	dirLight.position.set(5, 12, 8)
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

	const positions 	= [];
	const indices		= [];

	const r = 0.5
	const nTheta = 10;
	const nPhi   = 20;

	// positions.push(0,0,r);
	for(let iTheta = 0; iTheta <= nTheta; iTheta++) {
		for(let iPhi = 0; iPhi < nPhi; iPhi++) {
			let theta = iTheta * Math.PI / nTheta
			let phi = iPhi * 2 * Math.PI / nPhi
			
			positions.push(r*Math.cos(phi)*Math.sin(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(theta));
		}
	}
	// positions.push(0,0,-r);

	// for(let iPhi = 0; iPhi < nPhi-1; iPhi++) {
	// 	indices.push(iPhi, 0, iPhi+1);
	// }
	// indices.push(nPhi-1, 0, 1);

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

			indices.push(current, next, below);
			indices.push(next, next_below, below);
		}
	}

	// for(let iPhi = 0; iPhi < nPhi; iPhi++) {
	// 	indices.push(iPhi, positions.length-1, (iPhi+1)%nPhi);
	// }

	var geometry = new THREE.BufferGeometry(); 

	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

	const sphere = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )); 
	sphere.name = "esfera"

	scene.add( sphere );

	// var materials = 	[ 	new THREE.MeshBasicMaterial({color:0x0000FF}), 	// Front Face
	// 						new THREE.MeshBasicMaterial({color:0xFF00FF}), 	// Back Face
	// 						new THREE.MeshBasicMaterial({color:0x00FF00}), 	// Top Face
	// 						new THREE.MeshBasicMaterial({color:0x00FFFF}), 	// Bottom Face
	// 						new THREE.MeshBasicMaterial({color:0xFF0000}),	// Right Face 
	// 						new THREE.MeshBasicMaterial({color:0xFFFF00}) 	// Left Face
	// 					]; 
	
	// const widthSeg = 16;
	// const heightSeg = 6;
	// const geometry = new THREE.SphereGeometry( 0.5, widthSeg, heightSeg); 
	
	// const trianglesPerGroup = 4;
	// const totalGroups = 2*widthSeg*heightSeg / trianglesPerGroup;
	
	// geometry.clearGroups();
	// for(let i = 0; i < totalGroups; i++) {
	// 	geometry.addGroup(i*trianglesPerGroup*3, trianglesPerGroup*3, i % materials.length);
	// }

	// const sphere = new THREE.Mesh( geometry, materials );
	// sphere.name = "esfera"

	// scene.add( sphere );
}

/// ***************************************************************
/// ***************************************************************
/// ***************************************************************

main();
