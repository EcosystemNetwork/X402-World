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

      const boot = async () => {
        if (!canvasRef.current) return;
        await engine.init(canvasRef.current);

        await renderer.init(
          canvasRef.current,
          engine.simulation.buildings,
          engine.simulation.units
        );

        engine.start();
      };

      boot();
    }

    return () => {
      engine.stop();
      engine.inputManager.detach();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Canvas for Babylon.js */}
      <canvas
        ref={canvasRef}
        id="renderCanvas"
        style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }}
        onClick={(e) => console.log('[App] Canvas onClick fired at', e.clientX, e.clientY)}
      />

      {/* UI Layers */}
      <HUD />
      <DebugPanel />
    </div>
  );
}

export default App;
