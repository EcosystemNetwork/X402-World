

export interface Building {
    id: number;
    type: number;
    x: number;
    y: number;
}

export class BuildingManager {
    private buildings: Map<string, Building> = new Map();
    private nextId: number = 1;

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
