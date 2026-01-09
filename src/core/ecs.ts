export type Entity = number;

export abstract class Component<T> {
    protected data: Map<Entity, T> = new Map();

    public add(entity: Entity, value: T): void {
        this.data.set(entity, value);
    }

    public get(entity: Entity): T | undefined {
        return this.data.get(entity);
    }

    public has(entity: Entity): boolean {
        return this.data.has(entity);
    }

    public remove(entity: Entity): void {
        this.data.delete(entity);
    }
}

export class PositionComponent extends Component<{ x: number, y: number, z: number }> { }
export class VelocityComponent extends Component<{ x: number, y: number, z: number }> { }

export class World {
    private nextEntityId: number = 0;
    private entities: Set<Entity> = new Set();

    // Components
    public position = new PositionComponent();
    public velocity = new VelocityComponent();

    public createEntity(): Entity {
        const id = ++this.nextEntityId;
        this.entities.add(id);
        return id;
    }

    public destroyEntity(entity: Entity): void {
        this.entities.delete(entity);
        this.position.remove(entity);
        this.velocity.remove(entity);
    }
}
