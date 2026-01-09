export class GameLoop {
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly timeStep: number;
    private isRunning: boolean = false;
    private frameId: number = 0;

    private update: (deltaTime: number) => void;
    private render: (alpha: number) => void;

    constructor(
        update: (deltaTime: number) => void,
        render: (alpha: number) => void,
        tps: number = 20
    ) {
        this.update = update;
        this.render = render;
        this.timeStep = 1000 / tps;
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this.loop);
    }

    public stop(): void {
        this.isRunning = false;
        cancelAnimationFrame(this.frameId);
    }

    private loop = (currentTime: number): void => {
        if (!this.isRunning) return;

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Prevent spiral of death if lag occurs
        if (deltaTime > 1000) deltaTime = 1000;

        this.accumulator += deltaTime;

        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        const alpha = this.accumulator / this.timeStep;
        this.render(alpha);

        this.frameId = requestAnimationFrame(this.loop);
    };
}
