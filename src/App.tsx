import { useEffect, useRef } from 'react';
import { engine } from '@/core/Engine';
import { renderer } from '@/graphics/Renderer';
import { HUD } from '@/ui/HUD';
import { DebugPanel } from '@/ui/DebugPanel';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Reset engine state (clears old simulation, detaches old inputs)
      engine.reset();

      // Initialize engine input
      console.log('App: Initializing Engine with canvas', canvasRef.current);
      // We can't use Log.info here easily unless we import it, let's rely on Console or import Log if needed. 
      // Actually, InputManager attach logs now, so that's enough coverage.
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
      engine.inputManager.detach();
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
