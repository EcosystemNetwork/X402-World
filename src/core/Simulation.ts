import { World } from './ecs';
import { MapManager } from './MapManager';
import { BuildingManager } from './BuildingManager';
import { UnitManager } from './UnitManager';
import { Pathfinder } from './Pathfinder';

export class Simulation {
    public world: World;
    public map: MapManager;
    public buildings: BuildingManager;
    public units: UnitManager;
    public pathfinder: Pathfinder;

    private time: number = 0;

    constructor() {
        this.world = new World();
        this.map = new MapManager();
        this.buildings = new BuildingManager();
        this.pathfinder = new Pathfinder(this.map, this.buildings);
        this.units = new UnitManager(this.pathfinder);

        // Create a test entity
        // const eid = this.world.createEntity();
        // this.world.position.add(eid, { x: 0, y: 0, z: 0 });
        // this.world.velocity.add(eid, { x: 0.1, y: 0, z: 0 });
    }

    public update(deltaTime: number): void {
        this.time += deltaTime;
        this.units.update(deltaTime);
    }

    public handleInput(action: any) {
        if (action.type === 'INTERACT' && action.payload.tile) {
            const { x, y } = action.payload.tile;
            const unit = this.units.getAllUnits()[0]; // Test unit
            if (unit) {
                this.units.moveUnitTo(unit.id, x, y);
            }
        }

        if (action.type === 'PLACE_BUILDING') {
            const { x, y, buildingType } = action.payload;
            this.buildings.placeBuilding(x, y, buildingType);
        }
    }
}
