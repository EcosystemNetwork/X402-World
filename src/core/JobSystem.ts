import { UnitManager } from './UnitManager';
import { BuildingManager } from './BuildingManager';

export interface Job {
    id: number;
    type: 'BUILD' | 'MOVE';
    targetX: number;
    targetY: number;
    priority: number;
    assignedUnitId: number | null;
    buildingType?: number; // For BUILD jobs
}

export class JobSystem {
    private jobs: Job[] = [];
    private nextId = 1;
    private unitManager: UnitManager;
    private buildingManager: BuildingManager;

    constructor(unitManager: UnitManager, buildingManager: BuildingManager) {
        this.unitManager = unitManager;
        this.buildingManager = buildingManager;
    }

    public addJob(jobPoints: Partial<Job>) {
        const job: Job = {
            id: this.nextId++,
            type: jobPoints.type || 'MOVE',
            targetX: jobPoints.targetX || 0,
            targetY: jobPoints.targetY || 0,
            priority: jobPoints.priority || 1,
            assignedUnitId: null,
            buildingType: jobPoints.buildingType
        };
        this.jobs.push(job);
    }

    public update(_deltaTime: number) {
        // 1. Assign jobs to idle units
        const units = this.unitManager.getAllUnits();
        const idleUnits = units.filter(u => u.state === 'IDLE');
        const availableJobs = this.jobs.filter(j => j.assignedUnitId === null).sort((a, b) => b.priority - a.priority);

        // Simple scheduling: Highest priority job gets nearest idle unit? 
        // Or Idle unit picks best job.

        idleUnits.forEach(unit => {
            if (availableJobs.length === 0) return;

            // Find best job (Priority / Distance)
            let bestJobIndex = -1;
            let bestScore = -Infinity;

            availableJobs.forEach((job, index) => {
                const dist = Math.abs(job.targetX - unit.x) + Math.abs(job.targetY - unit.y);
                const score = job.priority * 10 - dist;
                if (score > bestScore) {
                    bestScore = score;
                    bestJobIndex = index;
                }
            });

            if (bestJobIndex !== -1) {
                const job = availableJobs[bestJobIndex];
                job.assignedUnitId = unit.id;

                // Remove from available for next unit in this loop
                availableJobs.splice(bestJobIndex, 1);

                // Assign task to Unit
                // We need a way to tell Unit "You have a job" logic.
                // For now, simple direct control:
                this.unitManager.moveUnitTo(unit.id, job.targetX, job.targetY);
                // Store job ref in unit? Or JobSystem tracks it?
                // Need to know when it arrives.
            }
        });

        // 2. Check Job Completion
        this.jobs.forEach((job, index) => {
            if (job.assignedUnitId !== null) {
                const unit = this.unitManager.getUnit(job.assignedUnitId);
                if (unit && unit.state === 'IDLE') {
                    // Unit arrived (or failed)
                    const dist = Math.abs(unit.x - job.targetX) + Math.abs(unit.y - job.targetY);
                    if (dist < 0.5) {
                        // Arrived!
                        if (job.type === 'BUILD' && job.buildingType) {
                            this.buildingManager.placeBuilding(job.targetX, job.targetY, job.buildingType);
                        }

                        // Complete
                        this.jobs.splice(index, 1);
                    } else {
                        // Unit idle but not at target? Stuck? Or just finished path?
                        // Retry? or Fail?
                        // For prototype: Re-queue or clear assignment
                        job.assignedUnitId = null;
                    }
                }
            }
        });
    }
}
