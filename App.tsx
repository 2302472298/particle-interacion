import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import HandController from './components/HandController';
import UIOverlay from './components/UIOverlay';
import { ParticleConfig, ShapeType, HandGestureState } from './types';
import { getShapeDescription } from './services/geminiService';

const App: React.FC = () => {
  // Application State
  const [config, setConfig] = useState<ParticleConfig>({
    color: '#ff0080',
    shape: ShapeType.HEART,
    count: 8000,
    speed: 1.0
  });

  const [gestureState, setGestureState] = useState<HandGestureState>({
    detected: false,
    pinchDistance: 0.5,
    handPosition: { x: 0, y: 0 }
  });

  const [description, setDescription] = useState<string>("Initializing visualization...");

  // Update description when shape changes using Gemini
  useEffect(() => {
    let isMounted = true;
    const fetchDescription = async () => {
        setDescription("Consulting the cosmos...");
        const desc = await getShapeDescription(config.shape);
        if (isMounted) setDescription(desc);
    };
    fetchDescription();
    return () => { isMounted = false; };
  }, [config.shape]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene config={config} gesture={gestureState} />
      </div>

      {/* UI & Interaction Layer */}
      <UIOverlay 
        config={config} 
        setConfig={setConfig} 
        description={description}
        isGestureActive={gestureState.detected}
      />

      {/* Invisible/Mini Hand Controller Logic */}
      <HandController onUpdate={setGestureState} />

    </div>
  );
};

export default App;