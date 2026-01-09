import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { UnitManager, type Unit } from '@/core/UnitManager';

export class UnitRenderer {
    private units: Map<number, Mesh> = new Map();
    private scene: Scene;
    private unitManager: UnitManager;

    constructor(scene: Scene, unitManager: UnitManager) {
        this.scene = scene;
        this.unitManager = unitManager;
    }

    public update() {
        const allUnits = this.unitManager.getAllUnits();
        const currentIds = new Set<number>();

        allUnits.forEach(u => {
            currentIds.add(u.id);
            if (!this.units.has(u.id)) {
                this.createUnitMesh(u);
            }
            this.updateUnitMesh(u);
        });

        this.units.forEach((mesh, id) => {
            if (!currentIds.has(id)) {
                mesh.dispose();
                this.units.delete(id);
            }
        });
    }

    private createUnitMesh(u: Unit) {
        const mesh = MeshBuilder.CreateCylinder(`u_${u.id}`, { height: 1.5, diameter: 0.5 }, this.scene);
        const mat = new StandardMaterial(`umat_${u.id}`, this.scene);
        mat.diffuseColor = new Color3(0.2, 0.6, 1.0); // Blue
        mesh.material = mat;
        this.units.set(u.id, mesh);
    }

    private updateUnitMesh(u: Unit) {
        const mesh = this.units.get(u.id);
        if (mesh) {
            // Interpolate? Sim updates discrete often, but we are in render loop.
            // For now, direct position set.
            // Unit x/y are world coords.
            mesh.position.x = u.x;
            mesh.position.z = u.y;
            mesh.position.y = 0.75; // Half height
        }
    }
}
