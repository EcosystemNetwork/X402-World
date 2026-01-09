import { useGameStore } from '@/store';
import { engine } from '@/core/Engine';
import { useEffect, useState } from 'react';

export function DebugPanel() {
    const { hoveredTile } = useGameStore();
    const [fps, setFps] = useState(0);
    const [entityCount, setEntityCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (engine.gameLoop) {
                // We don't have FPS in gameLoop logic exposed yet, use Babylon's
                setFps(Math.round(engine.simulation.world ? 60 : 0)); // Mock or get from engine
            }
            if (engine.simulation) {
                // Count entities
                setEntityCount(engine.simulation.buildings.getAllBuildings().length);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    if (!hoveredTile) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#0f0',
            padding: '10px',
            fontFamily: 'monospace',
            borderRadius: '5px',
            pointerEvents: 'none',
            border: '1px solid #0f0'
        }}>
            <h3>Debug Info</h3>
            <div>FPS: {fps}</div>
            <div>Entities: {entityCount}</div>
            <div style={{ marginTop: '10px', borderTop: '1px solid #555', paddingTop: '5px' }}>
                <strong>Cursor:</strong><br />
                X: {hoveredTile.x}<br />
                Y: {hoveredTile.y}
            </div>
        </div>
    );
}
