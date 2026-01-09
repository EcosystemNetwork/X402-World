import { useGameStore, InteractionMode } from '@/store';

export function HUD() {
    const { mode, setMode, selectedBuildingId, setSelectedBuildingId, hoveredTile } = useGameStore();

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
            {/* Top Bar */}
            <div style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px', color: 'white', display: 'flex', gap: '20px' }}>
                <span>Mode: {mode}</span>
                <span>Tile: {hoveredTile ? `${hoveredTile.x}, ${hoveredTile.y}` : 'None'}</span>
                <button onClick={() => setMode(InteractionMode.SELECT)}>Select</button>
                <button onClick={() => setMode(InteractionMode.BUILD)}>Build</button>
            </div>

            {/* Buildings Panel */}
            {mode === InteractionMode.BUILD && (
                <div style={{ pointerEvents: 'auto', position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                    <button style={{ border: selectedBuildingId === 1 ? '2px solid gold' : '1px solid grey', padding: '10px' }} onClick={(e) => { e.stopPropagation(); setSelectedBuildingId(1); }}>House</button>
                    <button style={{ border: selectedBuildingId === 2 ? '2px solid gold' : '1px solid grey', padding: '10px' }} onClick={(e) => { e.stopPropagation(); setSelectedBuildingId(2); }}>Wall</button>
                </div>
            )}
        </div>
    );
}
