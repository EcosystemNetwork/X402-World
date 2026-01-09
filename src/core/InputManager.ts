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

    constructor() {
        // No auto setup
    }

    public attach(target: HTMLElement): void {
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
        target.addEventListener('mousemove', (e) => {
            // e.clientX is global, but for canvas we might need offset?
            // InputManager stores Global mouse. Renderer raycasts using global usually works if canvas is full screen?
            // Actually babylon scene.pick uses local coordinates usually? 
            // scene.createPickingRay uses (x,y, matrix, camera).
            // Usually expects canvas-relative coordinates if viewport is involved?
            // Let's stick to clientX/Y for now as it seemed to work, 
            // BUT we should verify if we need rect.left/top subtraction.
            // For now, simple attach.
            this.mousePosition = { x: e.clientX, y: e.clientY };

            if (this.isRightMouseDown && this.lastMousePosition) {
                this.panDelta.x += (e.clientX - this.lastMousePosition.x);
                this.panDelta.y += (e.clientY - this.lastMousePosition.y);
            }
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
        });

        target.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.isMouseDown = true; // Left
            if (e.button === 2) this.isRightMouseDown = true; // Right
        });

        // MouseUp on window to catch drags ending outside
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.isMouseDown = false;
            if (e.button === 2) this.isRightMouseDown = false;
        });

        // Disable context menu on target
        target.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        target.addEventListener('wheel', (e) => {
            this.zoomDelta += e.deltaY;
        }, { passive: true });
    }

    public getMousePosition() {
        return this.mousePosition;
    }

    public getIsMouseDown() {
        return this.isMouseDown;
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
