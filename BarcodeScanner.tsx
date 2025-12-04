import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser';
import { X, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onCancel: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;

    // Use environment (back) camera
    const constraints = {
      video: {
        facingMode: { exact: 'environment' }
      }
    };

    // Fallback constraints if exact environment fails (common on desktops)
    const fallbackConstraints = {
      video: {
        facingMode: 'environment'
      }
    };

    const startScanning = async () => {
      try {
        // Try precise environment camera first
        try {
          controlsRef.current = await codeReader.decodeFromConstraints(
            constraints,
            videoRef.current!,
            (result, err) => {
              if (!isMounted) return;
              if (result) {
                // Play a beep or haptic feedback if possible could go here
                onDetected(result.getText());
              }
            }
          );
        } catch (e) {
          // Fallback for desktop or devices where 'exact' fails
          controlsRef.current = await codeReader.decodeFromConstraints(
            fallbackConstraints,
            videoRef.current!,
            (result, err) => {
              if (!isMounted) return;
              if (result) {
                onDetected(result.getText());
              }
            }
          );
        }
        if (isMounted) setLoading(false);
      } catch (err) {
        console.error(err);
        if (isMounted) {
            setError("Could not access the camera. Please ensure permissions are granted.");
            setLoading(false);
        }
      }
    };

    startScanning();

    return () => {
      isMounted = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onDetected]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
         <p className="text-white text-lg mb-6 text-center">{error}</p>
         <button 
            onClick={onCancel} 
            className="bg-white text-black px-8 py-3 rounded-full font-bold"
         >
            Close
         </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         {loading && (
             <div className="absolute inset-0 flex items-center justify-center z-10">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
             </div>
         )}
         
         <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            style={{ maxHeight: '100vh', maxWidth: '100vw' }}
         />
         
         {/* Visual Guide Overlay */}
         <div className="absolute inset-0 border-2 border-transparent flex items-center justify-center pointer-events-none z-20">
            <div className="w-72 h-48 border-2 border-green-400 rounded-lg relative bg-transparent shadow-[0_0_0_999px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-green-400 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-green-400 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-green-400 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-green-400 -mb-1 -mr-1"></div>
            </div>
         </div>
      </div>
      
      {/* Controls */}
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 bg-black/40 text-white p-3 rounded-full hover:bg-black/60 backdrop-blur-md z-30"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="absolute bottom-12 left-0 right-0 text-center z-30 pointer-events-none">
        <p className="text-white bg-black/60 inline-block px-6 py-2 rounded-full backdrop-blur-md font-medium">
          Scan a barcode
        </p>
      </div>
    </div>
  );
};
