import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

let scene, cssScene, camera, renderer, cssRenderer, controls;
const graphContainer = document.getElementById('graph-container');

function initScene() {
    scene = new THREE.Scene();
    cssScene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, graphContainer.clientWidth / graphContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    cssRenderer = new CSS3DRenderer();

    renderer.setSize(graphContainer.clientWidth, graphContainer.clientHeight);
    renderer.setClearColor(0x1a1a2e, 1);
    cssRenderer.setSize(graphContainer.clientWidth, graphContainer.clientHeight);

    renderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.position = 'absolute';
    graphContainer.appendChild(renderer.domElement);
    graphContainer.appendChild(cssRenderer.domElement);

    controls = new OrbitControls(camera, cssRenderer.domElement);
    camera.position.set(0, 0, 50);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = graphContainer.clientWidth / graphContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(graphContainer.clientWidth, graphContainer.clientHeight);
    cssRenderer.setSize(graphContainer.clientWidth, graphContainer.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
}

export { initScene, onWindowResize, animate, scene, cssScene, camera };