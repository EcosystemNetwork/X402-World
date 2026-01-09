import { createNoise2D } from 'simplex-noise';

export const CHUNK_SIZE = 16;

export const TileType = {
    EMPTY: 0,
    GRASS: 1,
    WATER: 2,
    MOUNTAIN: 3
} as const;

export class Chunk {
    public x: number;
    public y: number;
    public tiles: Uint8Array; // Tile IDs

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.tiles = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
    }

    public setTile(localX: number, localY: number, type: number) {
        if (localX >= 0 && localX < CHUNK_SIZE && localY >= 0 && localY < CHUNK_SIZE) {
            this.tiles[localY * CHUNK_SIZE + localX] = type;
        }
    }

    public getTile(localX: number, localY: number): number {
        if (localX >= 0 && localX < CHUNK_SIZE && localY >= 0 && localY < CHUNK_SIZE) {
            return this.tiles[localY * CHUNK_SIZE + localX];
        }
        return 0;
    }
}

export class MapManager {
    private chunks = new Map<string, Chunk>();
    private noise2D = createNoise2D();

    public getChunk(chunkX: number, chunkY: number): Chunk {
        const key = `${chunkX},${chunkY}`;
        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generateChunk(chunkX, chunkY));
        }
        return this.chunks.get(key)!;
    }

    private generateChunk(cX: number, cY: number): Chunk {
        const chunk = new Chunk(cX, cY);
        for (let y = 0; y < CHUNK_SIZE; y++) {
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const worldX = cX * CHUNK_SIZE + x;
                const worldY = cY * CHUNK_SIZE + y;

                // Simple terrain generation
                const value = this.noise2D(worldX * 0.1, worldY * 0.1);

                let tileType: number = TileType.GRASS;
                if (value < -0.2) tileType = TileType.WATER;
                if (value > 0.6) tileType = TileType.MOUNTAIN;

                chunk.setTile(x, y, tileType);
            }
        }
        return chunk;
    }
}
