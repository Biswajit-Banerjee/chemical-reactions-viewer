import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { updateLabels } from './graphCreation.js';

let scene, camera, renderer, controls;
const graphContainer = document.getElementById('graph-container');

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, graphContainer.clientWidth / graphContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(graphContainer.clientWidth, graphContainer.clientHeight);
    renderer.setClearColor(0xf0e6d2, 1);

    graphContainer.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 50);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0x8b7d70);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd4a7, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = graphContainer.clientWidth / graphContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(graphContainer.clientWidth, graphContainer.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateLabels();
    renderer.render(scene, camera);
}

function addWatercolorEffect() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const loader = new THREE.TextureLoader();
    
    loader.load('path/to/watercolor-texture.png', (texture) => {
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.z = -10;
        scene.add(plane);
    });
}

export { initScene, onWindowResize, animate, addWatercolorEffect, scene, camera };