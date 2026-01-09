import { useLogger, Log } from '@/core/Logger';
import { useGameStore } from '@/store';
import { engine } from '@/core/Engine';
import { useEffect, useState } from 'react';

export function DebugPanel() {
    const { hoveredTile } = useGameStore();
    const { logs } = useLogger();
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
            border: '1px solid #0f0',
            maxWidth: '300px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3>Debug Info</h3>
            <div>FPS: {fps}</div>
            <div>Entities: {entityCount}</div>
            <div style={{ marginTop: '10px', borderTop: '1px solid #555', paddingTop: '5px' }}>
                <strong>Cursor:</strong><br />
                X: {hoveredTile.x}<br />
                Y: {hoveredTile.y}
            </div>

            <div style={{ marginTop: '10px', borderTop: '1px solid #555', paddingTop: '5px', flex: 1, overflowY: 'auto', pointerEvents: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Console:</strong>
                    <button onClick={() => Log.info('Test Log')} style={{ fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}>Test</button>
                </div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    {logs.map(log => (
                        <div key={log.id} style={{
                            color: log.type === 'error' ? '#ff5555' : log.type === 'warn' ? '#ffb86c' : '#f8f8f2',
                            marginBottom: '2px'
                        }}>
                            <span style={{ opacity: 0.5 }}>[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span> {log.message}
                        </div>
                    ))}
                    {logs.length === 0 && <span style={{ opacity: 0.5 }}>- No logs -</span>}
                </div>
            </div>
        </div>
    );
}
