import { useEffect, useRef } from 'react';
import { engine } from '@/core/Engine';
import { renderer } from '@/graphics/Renderer';
import { HUD } from '@/ui/HUD';
import { DebugPanel } from '@/ui/DebugPanel';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize engine input
      engine.init(canvasRef.current);

      // Initialize renderer with all managers
      renderer.init(
        canvasRef.current,
        engine.simulation.buildings,
        engine.simulation.units
      ).then(() => {
        engine.start();
      });
    }

    return () => {
      engine.stop();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Canvas for Babylon.js */}
      <canvas ref={canvasRef} id="renderCanvas" style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }} />

      {/* UI Layers */}
      <HUD />
      <DebugPanel />
    </div>
  );
}

export default App;
