import * as THREE from 'three';

function positionNodesIndividual(nodeOrder, nodes, sampleNodes) {
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

function positionNodesSpiral(nodeOrder, nodes, sampleNodes) {
    const a = 0.5; // Controls how tightly wound the spiral is
    const b = 0.2; // Controls the distance between spiral arms

    nodeOrder.forEach((element, index) => {
        const theta = Math.sqrt(index) * 2 * Math.PI; // Angle
        const radius = a * theta;

        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        const z = b * index; // Slight elevation to prevent overlap

        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.set(x, y, z);
        } else {
            nodes.get(element).position.set(x, y, z);
        }
    });
}

function positionNodesForceDirected(nodeOrder, nodes, sampleNodes) {
    // Simple force-directed layout
    const iterations = 50;
    const repulsionForce = 1;
    const attractionForce = 0.01;

    // Initialize random positions
    nodeOrder.forEach((element) => {
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.copy(position);
        } else {
            nodes.get(element).position.copy(position);
        }
    });

    // Perform force-directed algorithm
    for (let i = 0; i < iterations; i++) {
        nodeOrder.forEach((element1, index1) => {
            const node1 = element1.startsWith('Sample_node') 
                ? sampleNodes.find(n => n.element === element1)
                : nodes.get(element1);

            let force = new THREE.Vector3(0, 0, 0);

            nodeOrder.forEach((element2, index2) => {
                if (index1 !== index2) {
                    const node2 = element2.startsWith('Sample_node')
                        ? sampleNodes.find(n => n.element === element2)
                        : nodes.get(element2);

                    let diff = new THREE.Vector3().subVectors(node1.position, node2.position);
                    let distance = diff.length();

                    // Repulsion
                    force.add(diff.normalize().multiplyScalar(repulsionForce / (distance * distance)));

                    // Attraction (only for connected nodes)
                    if (Math.abs(index1 - index2) === 1) {
                        force.sub(diff.normalize().multiplyScalar(attractionForce * distance));
                    }
                }
            });

            node1.position.add(force);
        });
    }
}

function positionNodes2DGrid(nodeOrder, nodes, sampleNodes) {
    const spacing = 2;
    const gridSize = Math.ceil(Math.sqrt(nodeOrder.length));

    nodeOrder.forEach((element, index) => {
        const x = (index % gridSize - gridSize / 2) * spacing;
        const y = (Math.floor(index / gridSize) - gridSize / 2) * spacing;
        const z = 0;

        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.set(x, y, z);
        } else {
            nodes.get(element).position.set(x, y, z);
        }
    });
}

function positionNodesInOrder(nodeOrder, nodes, sampleNodes, layoutType) {
    switch (layoutType) {
        case 'individual':
            positionNodesIndividual(nodeOrder, nodes, sampleNodes);
            break;
        case 'spiral':
            positionNodesSpiral(nodeOrder, nodes, sampleNodes);
            break;
        case 'force-directed':
            positionNodesForceDirected(nodeOrder, nodes, sampleNodes);
            break;
        case '2d-grid':
            positionNodes2DGrid(nodeOrder, nodes, sampleNodes);
            break;
        default:
            positionNodesIndividual(nodeOrder, nodes, sampleNodes);
    }
}

export { positionNodesInOrder };