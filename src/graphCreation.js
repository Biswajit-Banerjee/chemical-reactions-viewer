import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { scene, camera } from './sceneSetup.js';

let font;
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(loadedFont) {
    font = loadedFont;
    createGraph(currentReactions); // Recreate the graph once the font is loaded
});

const nodeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x91D9AA });  // green
const sNodeMaterial = new THREE.MeshBasicMaterial({ color: 0xF29979 }); // Cherry red
const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black for labels
const nodeSize = 10
let currentReactions = [];

function createGraph(reactions) {
    currentReactions = reactions;
    if (!font) {
        return; // If font isn't loaded yet, exit and wait for font to load
    }

    scene.clear();
    
    const { nodes, sampleNodes, nodeOrder } = createNodesInOrder(reactions);
    positionNodesInOrder(nodeOrder, nodes, sampleNodes);
    
    const useDynamicSize = document.getElementById('dynamic-node-size').checked;
    renderNodes(nodes, sampleNodes, useDynamicSize);
    
    const edges = createEdges(reactions, nodes, sampleNodes);
    renderEdges(edges);
    
    const dashedLines = createDashedLines(reactions, sampleNodes);
    renderDashedLines(dashedLines);
    
    updateCameraPosition(nodeOrder, nodes, sampleNodes);
}

function createNodesInOrder(reactions) {
    const nodes = new Map();
    const sampleNodes = [];
    const nodeOrder = [];

    reactions.forEach((reaction, index) => {
        reaction.reactants.forEach(reactant => {
            if (!nodes.has(reactant.element)) {
                nodes.set(reactant.element, { element: reactant.element, position: new THREE.Vector3(), degree: 0 });
                nodeOrder.push(reactant.element);
            }
            nodes.get(reactant.element).degree++;
        });

        const s1 = `Sample_node${index * 2 + 1}`;
        const s2 = `Sample_node${index * 2 + 2}`;
        sampleNodes.push({ element: s1, position: new THREE.Vector3(), degree: 1 });
        sampleNodes.push({ element: s2, position: new THREE.Vector3(), degree: 1 });
        nodeOrder.push(s1, s2);

        reaction.products.forEach(product => {
            if (!nodes.has(product.element)) {
                nodes.set(product.element, { element: product.element, position: new THREE.Vector3(), degree: 0 });
                nodeOrder.push(product.element);
            }
            nodes.get(product.element).degree++;
        });
    });

    return { nodes, sampleNodes, nodeOrder };
}


function positionNodesInOrder(nodeOrder, nodes, sampleNodes) {
    const totalNodes = nodeOrder.length;
    const baseSpacing = 2;
    const spacingFactor = Math.max(0.5, 1 - Math.log10(totalNodes) / 10);
    const spacing = baseSpacing * spacingFactor;

    nodeOrder.forEach((element, index) => {
        const x = index * spacing - (totalNodes - 1) * spacing / 2;
        const y = (Math.random() - 0.5) * spacing;
        const z = (Math.random() - 0.5) * spacing;

        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.set(x, y, z);
        } else {
            nodes.get(element).position.set(x, y, z);
        }
    });
}

function renderNodes(nodes, sampleNodes, useDynamicSize) {
    const allNodes = [...nodes.values(), ...sampleNodes];
    const maxDegree = Math.max(...allNodes.map(node => node.degree));

    allNodes.forEach(node => {
        const isSNode = node.element.startsWith('Sample_node');
        const material = isSNode ? sNodeMaterial : nodeMaterial;
        
        let size = 0.5;
        if (useDynamicSize && !isSNode) {
            const minSize = 0.3;
            const maxSize = 1.0;
            size = minSize + (maxSize - minSize) * (node.degree / maxDegree);
        }
        
        const geometry = new THREE.SphereGeometry(size, nodeSize, nodeSize);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(node.position);
        scene.add(mesh);
        
        if (!isSNode) {
            addLabel(node.position, node.element, size * 2);
        }
    });
}

function createEdges(reactions, nodes, sampleNodes) {
    const edges = [];

    reactions.forEach((reaction, index) => {
        const s1 = sampleNodes[index * 2];
        const s2 = sampleNodes[index * 2 + 1];

        reaction.reactants.forEach(reactant => {
            edges.push({
                start: nodes.get(reactant.element).position,
                end: s1.position,
                coefficient: reactant.coefficient,
                color: 0x8C686B // Pink for reactants
            });
        });

        reaction.products.forEach(product => {
            edges.push({
                start: s2.position,
                end: nodes.get(product.element).position,
                coefficient: product.coefficient,
                color: 0x8FA690 // Green for products
            });
        });
    });

    return edges;
}


function renderEdges(edges) {
    edges.forEach(edge => createCurvedEdge(edge.start, edge.end, edge.coefficient, edge.color));
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

    // addArrowhead(end, curve.getPoint(0.9), color);

    if (weight > 1) {
        const labelPosition = curve.getPoint(0.5); 
        addLabel(labelPosition, weight.toString(), 0.4);
    }
}


function addArrowhead(position, lookAt, color) {
    const arrowGeometry = new THREE.ConeGeometry(0.2, 0.6, 32);
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: color });
    const arrowhead = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrowhead.position.copy(position);
    const arrowDirection = new THREE.Vector3().subVectors(position, lookAt).normalize();
    arrowhead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDirection);
    scene.add(arrowhead);
}


function addLabel(position, text, scale = 0.6) {
    const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.3,
        depth: 0.02,
    });
    const label = new THREE.Mesh(textGeometry, labelMaterial);
    label.position.copy(position);
    label.position.y += scale; 
    scene.add(label);
}

function createDashedLines(reactions, sampleNodes) {
    return reactions.map((_, index) => ({
        start: sampleNodes[index * 2].position,
        end: sampleNodes[index * 2 + 1].position
    }));
}

function renderDashedLines(dashedLines) {
    dashedLines.forEach(line => createDashedLine(line.start, line.end));
}

function createDashedLine(start, end) {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: 0x757575,
        dashSize: 0.2,
        gapSize: 0.2,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    scene.add(line);
}


function updateLabels() {
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof TextGeometry) {
            object.quaternion.copy(camera.quaternion);
        }
        if (object instanceof THREE.Sprite) {
            object.material.rotation = -camera.rotation.z;
        }
    });
}

function toggleLabels() {
    const showLabels = document.getElementById('show-labels').checked;
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof TextGeometry) {
            object.visible = showLabels;
        }
        if (object instanceof THREE.Sprite) {
            object.visible = showLabels;
        }
    });
}

function updateReactionsShown(reactions) {
    const count = parseInt(document.getElementById('reaction-seeker').value);
    const reactionsToShow = reactions.slice(0, count);
    createGraph(reactionsToShow);
    document.getElementById('reactions-count').textContent = count;
}

function updateCameraPosition(nodeOrder, nodes, sampleNodes) {
    const positions = [...nodes.values(), ...sampleNodes].map(node => node.position);
    const bbox = new THREE.Box3().setFromPoints(positions);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // Adjust for some padding
    cameraZ *= 1.5;

    camera.position.set(center.x, center.y, center.z + cameraZ);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
}

export { createGraph, toggleLabels, updateReactionsShown, updateLabels };