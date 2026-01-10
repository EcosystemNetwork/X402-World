import { Pathfinder } from './Pathfinder';

export interface Unit {
    id: number;
    x: number; // Current world X (float)
    y: number; // Current world Y (float)
    path: { x: number, y: number }[] | null;
    target: { x: number, y: number } | null;
    state: 'IDLE' | 'MOVING' | 'WORKING';
}

export class UnitManager {
    private units: Map<number, Unit> = new Map();
    private nextId = 1;
    private pathfinder: Pathfinder;

    constructor(pathfinder: Pathfinder) {
        this.pathfinder = pathfinder;

        // Spawn a test unit
        // this.spawnUnit(5, 5);
    }

    public spawnUnit(x: number, y: number) {
        const unit: Unit = {
            id: this.nextId++,
            x,
            y,
            path: null,
            target: null,
            state: 'IDLE'
        };
        this.units.set(unit.id, unit);
    }

    public getAllUnits(): Unit[] {
        return Array.from(this.units.values());
    }

    public getUnit(id: number): Unit | undefined {
        return this.units.get(id);
    }

    public moveUnitTo(unitId: number, targetX: number, targetY: number) {
        const unit = this.units.get(unitId);
        if (!unit) return;

        const startX = Math.round(unit.x);
        const startY = Math.round(unit.y);

        const path = this.pathfinder.findPath(startX, startY, targetX, targetY);
        if (path.length > 0) {
            unit.path = path;
            unit.target = { x: targetX, y: targetY };
            unit.state = 'MOVING';
        }
    }

    public update(deltaTime: number) {
        const speed = 2.0 * deltaTime; // Tile per second

        this.units.forEach(unit => {
            if (unit.state === 'MOVING' && unit.path && unit.path.length > 0) {
                const nextNode = unit.path[0];
                const dx = nextNode.x - unit.x;
                const dy = nextNode.y - unit.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < speed) {
                    // Arrived at node
                    unit.x = nextNode.x;
                    unit.y = nextNode.y;
                    unit.path.shift(); // Remove reached node

                    if (unit.path.length === 0) {
                        unit.state = 'IDLE';
                        unit.target = null;
                    }
                } else {
                    // Move towards
                    unit.x += (dx / dist) * speed;
                    unit.y += (dy / dist) * speed;
                }
            }
        });
    }
}
