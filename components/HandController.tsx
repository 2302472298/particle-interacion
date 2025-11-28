import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandGestureState } from '../types';
import { Camera, RefreshCw } from 'lucide-react';

interface HandControllerProps {
  onUpdate: (state: HandGestureState) => void;
}

const HandController: React.FC<HandControllerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>();
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        startWebcam();
      } catch (err) {
        console.error(err);
        setError("Failed to load hand tracking AI.");
        setLoading(false);
      }
    };

    initHandLandmarker();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(requestRef.current!);
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Camera permission denied.");
      setLoading(false);
    }
  };

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    let startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        // Use the first detected hand
        const landmarks = results.landmarks[0];
        
        // Thumb tip is index 4, Index finger tip is index 8
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const wrist = landmarks[0];

        // Calculate distance between thumb and index for "Pinch" (0 to 1 approx)
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dz = thumbTip.z - indexTip.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Normalize: distance usually roughly 0.02 (closed) to 0.2 (open)
        // We map this to 0 -> 1
        const normalizedPinch = Math.min(Math.max((distance - 0.02) / 0.15, 0), 1);

        // Map X/Y for position (inverted X because webcam is mirrored usually)
        const posX = (1 - wrist.x) * 2 - 1; // -1 to 1
        const posY = -(wrist.y * 2 - 1);    // -1 to 1

        onUpdate({
          detected: true,
          pinchDistance: normalizedPinch,
          handPosition: { x: posX, y: posY }
        });
      } else {
        onUpdate({
          detected: false,
          pinchDistance: 0.5, // Default idle
          handPosition: { x: 0, y: 0 }
        });
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-32 h-24 bg-black/50 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs p-2 text-center">
          {error}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 ${loading ? 'opacity-0' : 'opacity-80'}`}
      />
      <div className="absolute top-1 left-1">
        <Camera className="w-3 h-3 text-white/70" />
      </div>
    </div>
  );
};

export default HandController;
