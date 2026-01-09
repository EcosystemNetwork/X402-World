import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Matrix, Quaternion, Vector3 } from '@babylonjs/core';
import { MapManager, CHUNK_SIZE, TileType } from '@/core/MapManager';

export class TileManager {
    private meshes: Map<number, Mesh> = new Map();
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initBaseMeshes();
    }

    private initBaseMeshes() {
        this.createBaseMesh(TileType.GRASS, new Color3(0.4, 0.8, 0.4));
        this.createBaseMesh(TileType.WATER, new Color3(0.2, 0.4, 0.9));
        this.createBaseMesh(TileType.MOUNTAIN, new Color3(0.5, 0.5, 0.5));
    }

    private createBaseMesh(type: number, color: Color3) {
        const mesh = MeshBuilder.CreateBox(`tile_${type}`, { width: 1, height: 0.1, depth: 1 }, this.scene);
        const material = new StandardMaterial(`mat_${type}`, this.scene);
        material.diffuseColor = color;
        material.specularColor = new Color3(0, 0, 0); // No shine
        mesh.material = material;
        mesh.isVisible = false;
        this.meshes.set(type, mesh);
    }

    public updateChunks(mapManager: MapManager, centerChunkX: number, centerChunkY: number) {
        // Collect matrices for each type
        const matricesByType = new Map<number, Float32Array>();
        const offsetsByType = new Map<number, number>();

        // Render 5x5 chunks around center
        const RADIUS = 2;
        const CHUNKS_TO_RENDER = (RADIUS * 2 + 1) ** 2;
        const TILES_PER_CHUNK = CHUNK_SIZE * CHUNK_SIZE;
        const TOTAL_TILES = CHUNKS_TO_RENDER * TILES_PER_CHUNK;

        // Initialize buffers
        this.meshes.forEach((_, type) => {
            // buffer size: total tiles * 16 floats per matrix
            matricesByType.set(type, new Float32Array(TOTAL_TILES * 16));
            offsetsByType.set(type, 0);
        });

        for (let cy = centerChunkY - RADIUS; cy <= centerChunkY + RADIUS; cy++) {
            for (let cx = centerChunkX - RADIUS; cx <= centerChunkX + RADIUS; cx++) {
                const chunk = mapManager.getChunk(cx, cy);

                for (let y = 0; y < CHUNK_SIZE; y++) {
                    for (let x = 0; x < CHUNK_SIZE; x++) {
                        const tileType = chunk.getTile(x, y);
                        if (!matricesByType.has(tileType)) continue;

                        const worldX = (chunk.x * CHUNK_SIZE + x);
                        const worldZ = (chunk.y * CHUNK_SIZE + y);

                        // Height variation
                        let height = 0;
                        if (tileType === TileType.WATER) height = -0.2;
                        if (tileType === TileType.MOUNTAIN) height = 0.5;

                        const matrix = Matrix.Compose(
                            new Vector3(1, 1, 1),
                            Quaternion.Identity(),
                            new Vector3(worldX, height, worldZ)
                        );

                        const buffer = matricesByType.get(tileType)!;
                        const offset = offsetsByType.get(tileType)!;

                        matrix.copyToArray(buffer, offset * 16);
                        offsetsByType.set(tileType, offset + 1);
                    }
                }
            }
        }

        // Apply to meshes
        this.meshes.forEach((mesh, type) => {
            const buffer = matricesByType.get(type)!;
            const count = offsetsByType.get(type)!;

            if (count > 0) {
                mesh.thinInstanceSetBuffer("matrix", buffer.subarray(0, count * 16), 16, true);
            } else {
                mesh.thinInstanceSetBuffer("matrix", null, 16, true);
            }
        });
    }
}
