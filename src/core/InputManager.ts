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

    private isLeftClickConsidered: boolean = false;
    private isRightClickConsidered: boolean = false;

    constructor() {
        // No auto setup
    }

    public attach(target: HTMLElement): void {
        Log.info(`InputManager attaching to ${target.tagName}#${target.id}`);
        this.setupListeners(target);
    }

    public detach(): void {
        // TODO: cleanup
    }

    private setupListeners(target: HTMLElement): void {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Mouse events on TARGET only
        // Window spy to check if events are reaching the browser at all
        window.addEventListener('mousedown', (e) => {
            const targetEl = e.target as HTMLElement;
            Log.info(`Global Click: ${e.button} on ${targetEl.tagName}#${targetEl.id}`);
            console.log(`[InputManager] Global Click target:`, targetEl);
        });

        target.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };

            if (this.isRightMouseDown && this.lastMousePosition) {
                this.panDelta.x += (e.clientX - this.lastMousePosition.x);
                this.panDelta.y += (e.clientY - this.lastMousePosition.y);
            }
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
        }, { capture: true }); // Capture to ensure we get it

        target.addEventListener('mousedown', (e) => {
            console.log(`[InputManager] Mouse Down: ${e.button}`);
            Log.info(`Mouse Down: ${e.button} at ${e.clientX},${e.clientY}`);
            if (e.button === 0) {
                this.isMouseDown = true; // Left
                this.isLeftClickConsidered = false; // Reset on fresh press
            }
            if (e.button === 2) {
                this.isRightMouseDown = true; // Right
                this.isRightClickConsidered = false; // Reset on fresh press
            }
        }, { capture: true }); // Capture to ensure we get it before propagation stops

        // MouseUp on window to catch drags ending outside
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.isMouseDown = false;
            if (e.button === 2) this.isRightMouseDown = false;
        });

        // Disable context menu on target
        target.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        }, { capture: true });

        target.addEventListener('wheel', (e) => {
            this.zoomDelta += e.deltaY;
        }, { passive: true, capture: true });
    }

    public getMousePosition() {
        return this.mousePosition;
    }

    public getIsMouseDown() {
        return this.isMouseDown;
    }

    /**
     * Returns true ONLY if the left button is currently down AND hasn't been consumed yet.
     * Consumes the click so subsequent calls return false until the next press.
     */
    public consumeLeftClick(): boolean {
        if (this.isMouseDown && !this.isLeftClickConsidered) {
            this.isLeftClickConsidered = true;
            return true;
        }
        return false;
    }

    /**
     * Returns true ONLY if the right button is currently down AND hasn't been consumed yet.
     * Consumes the click so subsequent calls return false until the next press.
     */
    public consumeRightClick(): boolean {
        if (this.isRightMouseDown && !this.isRightClickConsidered) {
            this.isRightClickConsidered = true;
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
