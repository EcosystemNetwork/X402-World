import { Log } from './Logger';

export const ActionType = {
    MoveCamera: 0,
    SelectTile: 1,
    PlaceBuilding: 2
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

export interface GameAction {
    type: ActionType;
    payload: any;
}

export class InputManager {
    private actionQueue: GameAction[] = [];
    private mousePosition: { x: number, y: number } = { x: 0, y: 0 };
    private isMouseDown: boolean = false;
    private isRightMouseDown: boolean = false;
    private zoomDelta: number = 0;
    private keys: Set<string> = new Set();
    private panDelta: { x: number, y: number } = { x: 0, y: 0 };
    private lastMousePosition: { x: number, y: number } | null = null;
    private pendingLeftClick: boolean = false;
    private pendingRightClick: boolean = false;

    private handleKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
    private handleKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
    private handleGlobalMouseDown = (_e: MouseEvent) => {
        // Debug logging disabled - uncomment to trace clicks
        // const targetEl = _e.target as HTMLElement;
        // Log.info(`Global Click: ${_e.button} on ${targetEl.tagName}#${targetEl.id}`);
    };
    private handleGlobalMouseUp = (e: MouseEvent) => {
        if (e.button === 0) this.isMouseDown = false;
        if (e.button === 2) this.isRightMouseDown = false;
    };

    // Target specific handlers
    private handleMouseMove: ((e: MouseEvent) => void) | null = null;
    private handleMouseDown: ((e: MouseEvent) => void) | null = null;
    private handleContextMenu: ((e: MouseEvent) => void) | null = null;
    private handleWheel: ((e: WheelEvent) => void) | null = null;

    private target: HTMLElement | null = null;

    constructor() {
        // No auto setup
    }

    public attach(target: HTMLElement): void {
        if (this.target) {
            this.detach();
        }
        this.target = target;
        Log.info(`InputManager attaching to ${target.tagName}#${target.id}`);
        this.setupListeners(target);
    }

    public detach(): void {
        if (!this.target) return;

        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousedown', this.handleGlobalMouseDown);
        window.removeEventListener('mouseup', this.handleGlobalMouseUp);

        if (this.handleMouseMove) this.target.removeEventListener('mousemove', this.handleMouseMove, { capture: true });
        if (this.handleMouseDown) this.target.removeEventListener('mousedown', this.handleMouseDown, { capture: true });
        if (this.handleContextMenu) this.target.removeEventListener('contextmenu', this.handleContextMenu, { capture: true });
        if (this.handleWheel) this.target.removeEventListener('wheel', this.handleWheel, { capture: true });

        this.target = null;
        this.handleMouseMove = null;
        this.handleMouseDown = null;
        this.handleContextMenu = null;
        this.handleWheel = null;

        // Reset state
        this.keys.clear();
        this.isMouseDown = false;
        this.isRightMouseDown = false;
    }

    private setupListeners(target: HTMLElement): void {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousedown', this.handleGlobalMouseDown);
        window.addEventListener('mouseup', this.handleGlobalMouseUp);

        // Target handlers
        this.handleMouseMove = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            this.mousePosition = { x, y };

            if (this.isRightMouseDown && this.lastMousePosition) {
                this.panDelta.x += (x - this.lastMousePosition.x);
                this.panDelta.y += (y - this.lastMousePosition.y);
            }
            this.lastMousePosition = { x, y };
        };

        this.handleMouseDown = (e: MouseEvent) => {
            // Update position on click too, just in case
            this.mousePosition = { x: e.offsetX, y: e.offsetY };
            console.log(`[InputManager] Canvas Click: button=${e.button} at ${e.offsetX},${e.offsetY}`);
            if (e.button === 0) {
                this.isMouseDown = true; // Left
                this.pendingLeftClick = true; // Latch for game loop
            }
            if (e.button === 2) {
                this.isRightMouseDown = true; // Right
                this.pendingRightClick = true; // Latch for game loop
            }
        };

        this.handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        this.handleWheel = (e: WheelEvent) => {
            this.zoomDelta += e.deltaY;
        };

        target.addEventListener('mousemove', this.handleMouseMove, { capture: true });
        target.addEventListener('mousedown', this.handleMouseDown, { capture: true });
        target.addEventListener('contextmenu', this.handleContextMenu, { capture: true });
        target.addEventListener('wheel', this.handleWheel, { passive: true, capture: true });
    }

    public getMousePosition() {
        return this.mousePosition;
    }

    public getIsMouseDown() {
        return this.isMouseDown;
    }

    /**
     * Returns true ONLY if the left button was pressed since the last check.
     * Consumes the click.
     */
    public consumeLeftClick(): boolean {
        // Use pending latch to catch fast clicks
        if (this.pendingLeftClick) {
            this.pendingLeftClick = false;
            return true;
        }
        return false;
    }

    /**
     * Returns true ONLY if the right button was pressed since the last check.
     * Consumes the click.
     */
    public consumeRightClick(): boolean {
        // Use pending latch to catch fast clicks
        if (this.pendingRightClick) {
            this.pendingRightClick = false;
            return true;
        }
        return false;
    }

    public getZoomDelta() {
        const delta = this.zoomDelta;
        this.zoomDelta = 0;
        return delta;
    }

    public getPanDelta() {
        const delta = { ...this.panDelta };
        this.panDelta = { x: 0, y: 0 };
        return delta;
    }

    public getKeys() {
        return this.keys;
    }

    public getActions(): GameAction[] {
        const actions = [...this.actionQueue];
        this.actionQueue = [];
        return actions;
    }
}
