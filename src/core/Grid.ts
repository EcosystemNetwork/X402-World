export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 16; // Isometric ratio 2:1

export interface Point {
    x: number;
    y: number;
}

export class Grid {
    // Convert map coordinates (grid x,y) to screen/world pixel coordinates
    public static isoToScreen(x: number, y: number): Point {
        return {
            x: (x - y) * TILE_WIDTH,
            y: (x + y) * TILE_HEIGHT
        };
    }

    // Convert screen coordinates to map coordinates
    public static screenToIso(x: number, y: number): Point {
        const mapX = (x / TILE_WIDTH + y / TILE_HEIGHT) / 2;
        const mapY = (y / TILE_HEIGHT - x / TILE_WIDTH) / 2;
        return {
            x: Math.floor(mapX),
            y: Math.floor(mapY)
        };
    }

    // Chunk helpers
    public static getChunkId(x: number, y: number): string {
        const chunkX = Math.floor(x / 16);
        const chunkY = Math.floor(y / 16);
        return `${chunkX},${chunkY}`;
    }
}
