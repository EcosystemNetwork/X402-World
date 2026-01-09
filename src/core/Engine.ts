import { GameLoop } from './GameLoop';
import { Simulation } from './Simulation';

import { InputManager } from './InputManager';
import { renderer } from '@/graphics/Renderer';
import { useGameStore } from '@/store';

export class Engine {
    public simulation: Simulation;
    public gameLoop: GameLoop;
    public inputManager: InputManager;

    constructor() {
        this.inputManager = new InputManager();
        this.simulation = new Simulation();
        this.gameLoop = new GameLoop(
            (deltaTime) => this.update(deltaTime),
            (alpha) => this.render(alpha)
        );
    }

    public init(canvas: HTMLCanvasElement) {
        this.inputManager.attach(canvas);
    }

    public start(): void {
        this.gameLoop.start();
    }

    public stop(): void {
        this.gameLoop.stop();
    }

    private update(deltaTime: number): void {
        this.handleInteraction();
        this.simulation.update(deltaTime);
    }

    private handleInteraction() {
        // 1. Zoom
        const zoom = this.inputManager.getZoomDelta();
        if (zoom !== 0) {
            renderer.updateZoom(zoom);
        }

        // 2. Pan (Keys + Drag)
        const keys = this.inputManager.getKeys();
        const panDelta = this.inputManager.getPanDelta();

        let moveX = -panDelta.x; // Invert drag 
        let moveY = -panDelta.y;

        if (keys.has('KeyW') || keys.has('ArrowUp')) moveY -= 10;
        if (keys.has('KeyS') || keys.has('ArrowDown')) moveY += 10;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 10;
        if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 10;

        if (moveX !== 0 || moveY !== 0) {
            renderer.panCamera(moveX, moveY);
        }

        // 3. Get Mouse Pos & Raycast
        const mousePos = this.inputManager.getMousePosition();

        // 2. Raycast via Renderer
        const tile = renderer.getTileAtScreenPos(mousePos.x, mousePos.y);

        // 3. Update Global Store (UI)
        useGameStore.getState().setHoveredTile(tile);

        // Update Ghost State
        const state = useGameStore.getState();
        if (tile && state.mode === 'BUILD' && state.selectedBuildingId) {
            const type = state.selectedBuildingId === 1 ? 1 : 2; // Simple map
            renderer.buildingRenderer?.updateGhost(tile.x, tile.y, type);
        } else {
            renderer.buildingRenderer?.updateGhost(0, 0, null);
        }

        // 4. Handle Clicks
        // Use a flag or check if 'just pressed' logic is needed.
        // For now, simple check.
        if (this.inputManager.getIsMouseDown() && tile) {
            // Primitive debounce/throttle to prevent 60fps placement
            // TODO: Move to 'JustPressed' in InputManager or handle here properly

            if (state.mode === 'BUILD' && state.selectedBuildingId) {
                // Only place if valid?
                this.simulation.handleInput({
                    type: 'PLACE_BUILDING',
                    payload: { x: tile.x, y: tile.y, buildingType: state.selectedBuildingId }
                });
            } else if (state.mode === 'SELECT') {
                this.simulation.handleInput({
                    type: 'INTERACT',
                    payload: { tile }
                });
            }
        }
    }



    private render(alpha: number): void {
        renderer.render(alpha, this.simulation.map);
    }
}

export const engine = new Engine();
