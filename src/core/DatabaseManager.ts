import { Pool } from '@neondatabase/serverless';
import { Log } from './Logger';

export interface DBBuilding {
    id?: number;
    x: number;
    y: number;
    type: number;
}

export class DatabaseManager {
    private pool: Pool | null = null;
    private isConnected: boolean = false;

    constructor() {
        const connectionString = import.meta.env.VITE_DATABASE_URL;
        if (connectionString) {
            this.pool = new Pool({ connectionString });
            Log.info("DatabaseManager initialized with connection string.");
        } else {
            Log.warn("No VITE_DATABASE_URL found. Persistence disabled.");
        }
    }

    public async connect(): Promise<boolean> {
        if (!this.pool) return false;
        try {
            // Simple query to verify connection and init tables
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS buildings (
                    id SERIAL PRIMARY KEY,
                    x INTEGER NOT NULL,
                    y INTEGER NOT NULL,
                    type INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            this.isConnected = true;
            Log.info("Connected to Neon Database and verified schema.");
            return true;
        } catch (err: any) {
            Log.error(`Database connection failed: ${err}`);
            console.error("Full Database Error Object:", err);

            if (err instanceof Event && err.type === 'error') {
                Log.error("Connection Failed: WebSocket error. This usually means the connection string is invalid or blocked.");
                Log.error("Ensure your URL starts with 'postgres://' or 'postgresql://' and is a valid Neon URL.");
            } else if (err.message) {
                Log.error(`Error Message: ${err.message}`);
            }
            return false;
        }
    }

    public async saveBuilding(x: number, y: number, type: number): Promise<void> {
        if (!this.isConnected || !this.pool) return;
        try {
            await this.pool.query('INSERT INTO buildings (x, y, type) VALUES ($1, $2, $3)', [x, y, type]);
            Log.info(`Saved building to DB at ${x},${y}`);
        } catch (err) {
            Log.error(`Failed to save building: ${err}`);
        }
    }

    public async loadBuildings(): Promise<DBBuilding[]> {
        if (!this.isConnected || !this.pool) return [];
        try {
            const result = await this.pool.query('SELECT x, y, type FROM buildings');
            Log.info(`Loaded ${result.rows.length} buildings from DB.`);
            return result.rows.map(row => ({
                x: row.x,
                y: row.y,
                type: row.type
            }));
        } catch (err) {
            Log.error(`Failed to load buildings: ${err}`);
            return [];
        }
    }
}
