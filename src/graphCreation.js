import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { scene, cssScene } from './sceneSetup.js';

let labels = [];

function createGraph(reactions) {
    
    scene.clear();
    cssScene.clear();
    labels = [];

    const nodes = new Map();
    const sampleNodes = [];
    const edges = [];
    const dashedLines = [];

    reactions.forEach((reaction, index) => {
        [...reaction.reactants, ...reaction.products].forEach(item => {
            if (!nodes.has(item.element)) {
                nodes.set(item.element, { element: item.element, position: new THREE.Vector3() });
            }
        });
        
        sampleNodes.push({ element: `S${index * 2 + 1}`, position: new THREE.Vector3() });
        sampleNodes.push({ element: `S${index * 2 + 2}`, position: new THREE.Vector3() });
    });

    const allNodes = [...Array.from(nodes.values()), ...sampleNodes];
    const gridSize = Math.ceil(Math.sqrt(allNodes.length));
    const spacing = 10;

    allNodes.forEach((node, index) => {
        const x = (index % gridSize) * spacing - (gridSize * spacing / 2);
        const y = -Math.floor(index / gridSize) * spacing + (gridSize * spacing / 2);
        const z = 0;
        node.position.set(x, y, z);
    });

    reactions.forEach((reaction, index) => {
        const s1 = sampleNodes[index * 2];
        const s2 = sampleNodes[index * 2 + 1];

        reaction.reactants.forEach(reactant => {
            edges.push({
                start: nodes.get(reactant.element).position,
                end: s1.position,
                coefficient: reactant.coefficient,
                color: 0xe94560
            });
        });

        reaction.products.forEach(product => {
            edges.push({
                start: s2.position,
                end: nodes.get(product.element).position,
                coefficient: product.coefficient,
                color: 0x0f3460
            });
        });

        dashedLines.push({
            start: s1.position,
            end: s2.position
        });
    });

    const nodeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const nodeMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });  // Light blue for regular nodes
    const sNodeMaterial = new THREE.MeshPhongMaterial({ color: 0xffcccb, transparent: true, opacity: 0.6 });  // Faded red for sample nodes

    allNodes.forEach(node => {
        const isSNode = node.element.startsWith('S');
        const material = isSNode ? sNodeMaterial : nodeMaterial;
        const mesh = new THREE.Mesh(nodeGeometry, material);
        mesh.position.copy(node.position);
        scene.add(mesh);
        
        if (!isSNode) {
            addLabel(node.position, node.element);
        }
    });

    edges.forEach(edge => createCurvedEdge(edge.start, edge.end, edge.coefficient, edge.color));
    dashedLines.forEach(line => createDashedLine(line.start, line.end));
}

function createCurvedEdge(start, end, weight, color) {
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(end, start);
    const perpendicular = new THREE.Vector3(-direction.y, direction.x, direction.z).normalize();
    const curveHeight = direction.length() * 0.2;
    midPoint.add(perpendicular.multiplyScalar(curveHeight));

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const curvedLine = new THREE.Line(geometry, material);
    scene.add(curvedLine);

    // Create arrowhead
    const arrowGeometry = new THREE.ConeGeometry(0.2, 0.6, 32);
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: color });
    const arrowhead = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrowhead.position.copy(end);
    const arrowDirection = new THREE.Vector3().subVectors(end, curve.getPoint(0.9)).normalize();
    arrowhead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDirection);
    scene.add(arrowhead);

    if (weight > 1) {
        addLabel(midPoint, weight.toString(), 0.5);
    }
}

function createDashedLine(start, end) {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        dashSize: 0.5,
        gapSize: 0.3,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    scene.add(line);
}

function addLabel(position, text, scale = 1) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.backgroundColor = 'rgba(15, 52, 96, 0.7)';
    div.style.color = 'white';
    div.style.padding = '2px 5px';
    div.style.borderRadius = '3px';
    div.style.fontSize = '14px';
    div.style.fontWeight = 'bold';
    div.style.fontFamily = 'Arial, sans-serif';

    const label = new CSS3DObject(div);
    label.position.copy(position);
    label.position.y += 0.7 * scale;
    label.scale.set(0.1 * scale, 0.1 * scale, 1);
    cssScene.add(label);
    labels.push(label);
}

function toggleLabels() {
    const showLabels = document.getElementById('show-labels').checked;
    labels.forEach(label => {
        label.visible = showLabels;
    });
}

function updateReactionsShown(reactions) {
    const count = parseInt(document.getElementById('reaction-seeker').value);
    const reactionsToShow = reactions.slice(0, count);
    createGraph(reactionsToShow);
    toggleLabels();
    document.getElementById('reactions-count').textContent = count;
}

export { createGraph, toggleLabels, updateReactionsShown };