
import { DatabaseManager } from './DatabaseManager';

export interface Building {
    id: number;
    type: number;
    x: number;
    y: number;
}

export class BuildingManager {
    private buildings: Map<string, Building> = new Map();
    private nextId: number = 1;
    private db: DatabaseManager;

    constructor(db: DatabaseManager) {
        this.db = db;
    }

    public async loadFromDb() {
        const dbBuildings = await this.db.loadBuildings();
        this.buildings.clear();
        let maxId = 0;
        dbBuildings.forEach(b => {
            // Use DB id if available, else simple increment
            const id = b.id || this.nextId++;
            if (id > maxId) maxId = id;

            const building: Building = {
                id,
                type: b.type,
                x: b.x,
                y: b.y
            };
            this.buildings.set(`${b.x},${b.y}`, building);
        });
        this.nextId = maxId + 1;
    }

    public placeBuilding(x: number, y: number, type: number): boolean {
        const key = `${x},${y}`;
        if (this.buildings.has(key)) return false; // Occupied

        const building: Building = {
            id: this.nextId++,
            type,
            x,
            y
        };

        this.buildings.set(key, building);

        // Persist
        this.db.saveBuilding(x, y, type);

        console.log(`Placed building ${type} at ${x},${y}`);
        return true;
    }

    public getBuilding(x: number, y: number): Building | undefined {
        return this.buildings.get(`${x},${y}`);
    }

    public getAllBuildings(): Building[] {
        return Array.from(this.buildings.values());
    }
}
