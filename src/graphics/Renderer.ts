import { Engine, Scene, Vector3, Color4, DirectionalLight, HemisphericLight, TargetCamera, Matrix } from '@babylonjs/core';

import { TileManager } from './TileManager';
import { MapManager } from '@/core/MapManager';
import { BuildingManager } from '@/core/BuildingManager';
import { UnitManager } from '@/core/UnitManager';
import { BuildingRenderer } from './BuildingRenderer';
import { UnitRenderer } from './UnitRenderer';

export class Renderer {
    public engine: Engine | null = null;
    public scene: Scene | null = null;
    public camera: TargetCamera | null = null;
    public tileManager: TileManager | null = null;
    public buildingRenderer: BuildingRenderer | null = null;
    public unitRenderer: UnitRenderer | null = null;

    public async init(
        canvas: HTMLCanvasElement,
        buildingManager: BuildingManager,
        unitManager: UnitManager
    ): Promise<void> {
        if (this.engine) {
            this.engine.dispose();
        }
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.53, 0.81, 0.92, 1.0); // Sky Blue

        // Setup Isometric Camera (Orthographic)
        const size = 10;
        this.camera = new TargetCamera("isoCamera", new Vector3(-20, 20, -20), this.scene);
        this.camera.mode = TargetCamera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoLeft = -size;
        this.camera.orthoRight = size;
        this.camera.orthoTop = size;
        this.camera.orthoBottom = -size;

        // CENTER MAP
        this.camera.setTarget(new Vector3(8, 0, 8));

        // Limits
        this.camera.minZ = 0.1;
        this.camera.maxZ = 1000;

        // Lighting
        new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
        const dir = new DirectionalLight("dir", new Vector3(-1, -2, -1), this.scene);
        dir.position = new Vector3(20, 40, 20);

        // Resize handling
        window.addEventListener('resize', () => {
            this.engine?.resize();
        });

        this.tileManager = new TileManager(this.scene);
        this.buildingRenderer = new BuildingRenderer(this.scene, buildingManager);
        this.unitRenderer = new UnitRenderer(this.scene, unitManager);
    }

    public updateZoom(delta: number) {
        if (!this.camera || !this.engine) return;

        const zoomSpeed = 0.01;
        const currentSize = this.camera.orthoTop || 10;
        let newSize = currentSize + (delta * zoomSpeed);

        newSize = Math.max(2, Math.min(newSize, 30));

        const aspect = this.engine.getAspectRatio(this.camera);
        this.camera.orthoTop = newSize;
        this.camera.orthoBottom = -newSize;
        this.camera.orthoLeft = -newSize * aspect;
        this.camera.orthoRight = newSize * aspect;
    }

    public panCamera(deltaX: number, deltaY: number) {
        if (!this.camera) return;

        const speed = 0.05 * (this.camera.orthoTop || 10) * 0.2;

        // Iso 45 degree mapping
        // Forward (Screen Up): x+1, z+1
        // Right (Screen Right): x+1, z-1

        const forward = new Vector3(1, 0, 1).normalize();
        const right = new Vector3(1, 0, -1).normalize();

        const move = forward.scale(-deltaY * speed).add(right.scale(deltaX * speed));

        this.camera.position.addInPlace(move);
        const currentTarget = this.camera.getTarget();
        this.camera.setTarget(currentTarget.add(move));
    }

    public render(_alpha: number, map: MapManager): void {
        if (this.scene && this.engine && this.camera) {
            if (this.tileManager) {
                // Determine center chunk from camera target
                const target = this.camera.getTarget();
                // 16 is CHUNK_SIZE
                const cx = Math.floor(target.x / 16);
                const cy = Math.floor(target.z / 16);

                this.tileManager.updateChunks(map, cx, cy);
            }
            if (this.buildingRenderer) {
                this.buildingRenderer.update();
            }
            if (this.unitRenderer) {
                this.unitRenderer.update();
            }
            this.scene.render();
        }
    }

    public getTileAtScreenPos(screenX: number, screenY: number): { x: number, y: number } | null {
        if (!this.scene || !this.camera) return null;

        const ray = this.scene.createPickingRay(screenX, screenY, Matrix.Identity(), this.camera);
        const t = -ray.origin.y / ray.direction.y;

        if (t > 0) {
            const hitPoint = ray.origin.add(ray.direction.scale(t));
            return {
                x: Math.round(hitPoint.x),
                y: Math.round(hitPoint.z)
            };
        }

        return null;
    }
}

export const renderer = new Renderer();
