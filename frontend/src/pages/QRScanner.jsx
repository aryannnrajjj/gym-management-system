import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, XCircle } from 'lucide-react';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const startScanning = async () => {
    setScanning(true);
    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    try {
      await codeReader.decodeFromVideoDevice(null, videoRef.current, async (result, error) => {
        if (result) {
          const qrData = result.getText();
          
          // QR data backend ko bhejo
          try {
            const response = await API.post('/attendance/checkin', { qr_data: qrData });
            setLastResult({ success: true, message: response.data.message });
            toast.success(response.data.message);
          } catch (err) {
            setLastResult({ success: false, message: err.response?.data?.detail || 'Error!' });
            toast.error(err.response?.data?.detail || 'Check-in failed!');
          }
        }
      });
    } catch (err) {
      toast.error('Camera access denied!');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">QR Code Scanner 📷</h1>

      <div className="bg-gym-card rounded-2xl p-6 border border-gray-700">
        
        {/* Camera View */}
        <div className="relative bg-black rounded-xl overflow-hidden mb-6 aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" />
          
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera size={64} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Camera not started</p>
              </div>
            </div>
          )}

          {/* Scanning Overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-orange-500 w-48 h-48 rounded-xl opacity-70">
                <div className="border-t-4 border-orange-500 animate-pulse w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          {!scanning ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Start Scanning
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Stop Scanning
            </button>
          )}
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className={`flex items-center gap-3 p-4 rounded-xl ${
            lastResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {lastResult.success 
              ? <CheckCircle className="text-green-400" size={24} />
              : <XCircle className="text-red-400" size={24} />
            }
            <p className={lastResult.success ? 'text-green-300' : 'text-red-300'}>
              {lastResult.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
