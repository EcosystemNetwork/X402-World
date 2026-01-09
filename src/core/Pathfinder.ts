import { MapManager, TileType } from './MapManager';
import { BuildingManager } from './BuildingManager';

interface Point {
    x: number;
    y: number;
}

interface Node {
    x: number;
    y: number;
    f: number;
    g: number;
    h: number;
    parent: Node | null;
}

export class Pathfinder {
    private map: MapManager;
    private buildings: BuildingManager;

    constructor(map: MapManager, buildings: BuildingManager) {
        this.map = map;
        this.buildings = buildings;
    }

    public findPath(startX: number, startY: number, endX: number, endY: number): Point[] {
        // 1. Validate Start/End
        if (!this.isWalkable(endX, endY) && !this.isBuilding(endX, endY)) {
            return [];
        }

        const openList: Node[] = [];
        const closedList: Set<string> = new Set();

        const startNode: Node = { x: startX, y: startY, f: 0, g: 0, h: 0, parent: null };
        openList.push(startNode);

        while (openList.length > 0) {
            // Sort by f score (lowest first)
            openList.sort((a, b) => a.f - b.f);
            const currentNode = openList.shift()!;

            // Check if reached end
            if (currentNode.x === endX && currentNode.y === endY) {
                return this.reconstructPath(currentNode);
            }

            const key = `${currentNode.x},${currentNode.y}`;
            closedList.add(key);

            // Init neighbors (4-direction)
            const neighbors = [
                { x: currentNode.x + 1, y: currentNode.y },
                { x: currentNode.x - 1, y: currentNode.y },
                { x: currentNode.x, y: currentNode.y + 1 },
                { x: currentNode.x, y: currentNode.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const nKey = `${neighbor.x},${neighbor.y}`;
                if (closedList.has(nKey)) continue;

                // Walkable check
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                // Calculate scores
                const gScore = currentNode.g + 1; // Unweighted graph mostly
                const hScore = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
                const fScore = gScore + hScore;

                // Check if already in open list with better G
                const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (existingNode) {
                    if (gScore < existingNode.g) {
                        existingNode.g = gScore;
                        existingNode.f = fScore;
                        existingNode.parent = currentNode;
                    }
                } else {
                    openList.push({ x: neighbor.x, y: neighbor.y, f: fScore, g: gScore, h: hScore, parent: currentNode });
                }
            }
        }

        return []; // No path
    }

    private reconstructPath(node: Node): Point[] {
        const path: Point[] = [];
        let current: Node | null = node;
        while (current) {
            path.push({ x: current.x, y: current.y });
            current = current.parent;
        }
        return path.reverse();
    }

    public isWalkable(x: number, y: number): boolean {
        // const chunkX = Math.floor(x / 16); 
        // const chunkY = Math.floor(y / 16);

        if (x < 0 || y < 0) return false;

        const chunk = this.map.getChunk(0, 0); // Hack: Assume single chunk 0,0 for prototype

        if (x >= 16 || y >= 16) return false; // Bounds check for prototype

        const tile = chunk.getTile(x, y);
        if (tile === TileType.WATER || tile === TileType.MOUNTAIN) return false;

        if (this.buildings.getBuilding(x, y)) return false;

        return true;
    }

    private isBuilding(x: number, y: number): boolean {
        return !!this.buildings.getBuilding(x, y);
    }
}
