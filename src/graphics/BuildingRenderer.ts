import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { BuildingManager, type Building } from '@/core/BuildingManager';

export class BuildingRenderer {
    private buildings: Map<number, Mesh> = new Map();
    private scene: Scene;
    private buildingManager: BuildingManager;
    private ghostMesh: Mesh | null = null;

    constructor(scene: Scene, buildingManager: BuildingManager) {
        this.scene = scene;
        this.buildingManager = buildingManager;
    }

    public update() {
        const buildings = this.buildingManager.getAllBuildings();
        const currentIds = new Set<number>();

        buildings.forEach(b => {
            currentIds.add(b.id);
            if (!this.buildings.has(b.id)) {
                this.createBuildingMesh(b);
            }
        });

        this.buildings.forEach((mesh, id) => {
            if (!currentIds.has(id)) {
                mesh.dispose();
                this.buildings.delete(id);
            }
        });
    }

    public updateGhost(x: number, y: number, type: number | null) {
        if (!this.ghostMesh && type) {
            // Create ghost
            this.ghostMesh = MeshBuilder.CreateBox("ghost", { size: 0.8 }, this.scene);
            const mat = new StandardMaterial("ghostMat", this.scene);
            mat.alpha = 0.5;
            mat.diffuseColor = new Color3(0, 1, 0); // Valid Green
            this.ghostMesh.material = mat;
            this.ghostMesh.isPickable = false;
        }

        if (this.ghostMesh) {
            if (type) {
                this.ghostMesh.setEnabled(true);
                this.ghostMesh.position.x = x;
                this.ghostMesh.position.z = y;
                this.ghostMesh.position.y = 0.5; // House height

                // Change ghost shape if needed?
                // For now, Green Box is fine.
                // Could change to Red if invalid? NOT implemented yet in renderer args.
            } else {
                this.ghostMesh.setEnabled(false);
            }
        }
    }

    private createBuildingMesh(b: Building) {
        let mesh: Mesh;
        if (b.type === 1) { // House
            mesh = MeshBuilder.CreateBox(`b_${b.id}`, { size: 0.8 }, this.scene);
            const mat = new StandardMaterial(`bmat_${b.id}`, this.scene);
            mat.diffuseColor = new Color3(0.6, 0.4, 0.2); // Brown
            mesh.material = mat;
            mesh.position.y = 0.5; // On top of ground
        } else { // Wall
            mesh = MeshBuilder.CreateCylinder(`b_${b.id}`, { height: 1.0, diameter: 0.3 }, this.scene);
            const mat = new StandardMaterial(`bmat_${b.id}`, this.scene);
            mat.diffuseColor = new Color3(0.5, 0.5, 0.5); // Grey
            mesh.material = mat;
            mesh.position.y = 0.5;
        }

        mesh.position.x = b.x;
        mesh.position.z = b.y;
        this.buildings.set(b.id, mesh);
    }
}
