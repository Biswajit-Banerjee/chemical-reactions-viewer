import * as THREE from 'three';

function positionNodesIndividual(nodeOrder, nodes, sampleNodes) {
    const totalNodes = nodeOrder.length;
    const baseSpacing = 2;
    const spacingFactor = Math.max(0.5, 1 - Math.log10(totalNodes) / 10);
    const spacing = baseSpacing * spacingFactor;

    let leftCount = 0;
    let rightCount = 0;
    let sampleCount = 0;

    nodeOrder.forEach((element, index) => {
        let x, y, z;

        if (element.startsWith('Sample_node')) {
            // Position sample nodes in the middle
            x = (Math.random() - 0.5) * spacing;
            y = sampleCount * spacing - (totalNodes / 3 - 1) * spacing / 2;
            z = (Math.random() - 0.5) * spacing;
            sampleCount++;
        } else {
            // Randomly decide if this node should be on the left or right
            const isLeft = Math.random() < 0.5;
            
            if (isLeft) {
                x = -totalNodes * spacing / 4 + (Math.random() - 0.5) * spacing;
                y = leftCount * spacing - (totalNodes / 3 - 1) * spacing / 2;
                leftCount++;
            } else {
                x = totalNodes * spacing / 4 + (Math.random() - 0.5) * spacing;
                y = rightCount * spacing - (totalNodes / 3 - 1) * spacing / 2;
                rightCount++;
            }
            z = (Math.random() - 0.5) * spacing;
        }

        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.set(x, y, z);
        } else {
            nodes.get(element).position.set(x, y, z);
        }
    });
}

function positionNodesSpiral(nodeOrder, nodes, sampleNodes) {
    const a = 1.5; // Controls how tightly wound the spiral is
    const b = 1.0; // Controls the vertical spacing
    const c = 0.2; // Controls the outward expansion rate

    let angle = 0;
    let height = 0;
    let sampleIndex = 0;

    nodeOrder.forEach((element, index) => {
        let x, y, z;

        if (element.startsWith('Sample_node')) {
            // Position sample nodes along the central axis with increased spacing
            x = 0;
            y = sampleIndex * b * 3; // Increased vertical spacing for sample nodes
            z = 0;
            sampleIndex++;
        } else {
            // Create a spiral for other nodes with increased spacing
            const radius = c * angle;
            x = radius * Math.cos(angle);
            z = radius * Math.sin(angle);
            y = height;

            // Increment angle and height for next node
            angle += a;
            height += b;
        }

        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.set(x, y, z);
        } else {
            nodes.get(element).position.set(x, y, z);
        }
    });

    // Center the spiral vertically
    const centerY = height / 2;
    nodeOrder.forEach((element) => {
        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.y -= centerY;
        } else {
            nodes.get(element).position.y -= centerY;
        }
    });

    // Scale the entire layout to increase overall spacing
    const scaleFactor = 1.5;
    nodeOrder.forEach((element) => {
        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.multiplyScalar(scaleFactor);
        } else {
            nodes.get(element).position.multiplyScalar(scaleFactor);
        }
    });
}

function positionNodesForceDirected(nodeOrder, nodes, sampleNodes) {
    // Simple force-directed layout
    const iterations = 50;
    const repulsionForce = 1;
    const attractionForce = 0.01;

    // Initialize positions
    nodeOrder.forEach((element, index) => {
        let x, y, z;
        if (element.startsWith('Sample_node')) {
            x = 0;
            y = (Math.random() - 0.5) * 10;
            z = (Math.random() - 0.5) * 10;
        } else {
            x = (index % 2 === 0 ? -1 : 1) * (5 + Math.random() * 5);
            y = (Math.random() - 0.5) * 10;
            z = (Math.random() - 0.5) * 10;
        }
        
        if (element.startsWith('Sample_node')) {
            const sNode = sampleNodes.find(n => n.element === element);
            sNode.position.set(x, y, z);
        } else {
            nodes.get(element).position.set(x, y, z);
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

            // Add a force to keep sample nodes near the center
            if (element1.startsWith('Sample_node')) {
                force.sub(node1.position.clone().multiplyScalar(0.1));
            } else {
                // Add a force to separate reactants and products
                force.add(new THREE.Vector3(node1.position.x > 0 ? 0.1 : -0.1, 0, 0));
            }

            node1.position.add(force);
        });
    }
}

function positionNodes2DGrid(nodeOrder, nodes, sampleNodes) {
    const spacing = 2;
    const gridSize = Math.ceil(Math.sqrt(nodeOrder.length));

    let leftCount = 0;
    let rightCount = 0;
    let sampleCount = 0;

    nodeOrder.forEach((element, index) => {
        let x, y, z;

        if (element.startsWith('Sample_node')) {
            // Position sample nodes in the middle column
            x = 0;
            y = (sampleCount - gridSize / 2) * spacing;
            z = 0;
            sampleCount++;
        } else {
            // Alternate between left and right sides
            const isLeft = (index % 2 === 0);
            
            if (isLeft) {
                x = -spacing * 2;
                y = (leftCount - gridSize / 2) * spacing;
                leftCount++;
            } else {
                x = spacing * 2;
                y = (rightCount - gridSize / 2) * spacing;
                rightCount++;
            }
            z = 0;
        }

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