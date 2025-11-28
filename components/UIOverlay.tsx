import React from 'react';
import { ParticleConfig, ShapeType } from '../types';
import { Palette, Maximize, Minimize, Hand, Info, Zap } from 'lucide-react';

interface UIOverlayProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  description: string;
  isGestureActive: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ config, setConfig, description, isGestureActive }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleShapeChange = (shape: ShapeType) => {
    setConfig(prev => ({ ...prev, shape }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, color: e.target.value }));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, speed: parseFloat(e.target.value) }));
  };

  return (
    <>
      {/* Top Left: Header & Description */}
      <div className="fixed top-6 left-6 z-40 max-w-sm">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-2">
          Flux Particles
        </h1>
        <p className="text-sm text-gray-400 backdrop-blur-sm bg-black/30 p-3 rounded-lg border border-white/5">
            {description}
        </p>
      </div>

      {/* Top Right: Status */}
      <div className="fixed top-6 right-6 z-40 flex flex-col items-end space-y-2">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${isGestureActive ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400/70'} backdrop-blur-md transition-colors duration-300`}>
            <Hand size={14} />
            <span className="text-xs font-semibold tracking-wider uppercase">
                {isGestureActive ? 'Hand Detected' : 'No Hand'}
            </span>
        </div>
        <button 
            onClick={toggleFullscreen}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/80"
        >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Bottom Center: Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center space-y-4 w-full max-w-2xl px-4">
        
        {/* Shape Selectors */}
        <div className="flex flex-wrap justify-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            {Object.values(ShapeType).map((shape) => (
                <button
                    key={shape}
                    onClick={() => handleShapeChange(shape)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        config.shape === shape
                            ? 'bg-white text-black shadow-lg scale-105'
                            : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {shape}
                </button>
            ))}
        </div>

        {/* Color Picker, Speed & Info */}
        <div className="flex items-center space-x-4">
             {/* Color */}
             <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10">
                <Palette size={16} className="text-white/70" />
                <input 
                    type="color" 
                    value={config.color} 
                    onChange={handleColorChange}
                    className="w-6 h-6 rounded-full overflow-hidden border-none outline-none cursor-pointer bg-transparent"
                    style={{ WebkitAppearance: 'none' }}
                />
             </div>

             {/* Speed */}
             <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10">
                <Zap size={16} className="text-white/70" />
                <input 
                    type="range" 
                    min="0.1" 
                    max="3.0" 
                    step="0.1" 
                    value={config.speed} 
                    onChange={handleSpeedChange}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
             </div>
             
             <div className="hidden md:flex items-center space-x-2 text-xs text-white/40 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
                <Info size={12} />
                <span>Pinch to Scale • Move to Rotate</span>
             </div>
        </div>
      </div>
    </>
  );
};

export default UIOverlay;