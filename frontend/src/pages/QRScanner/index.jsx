import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  LogIn, 
  LogOut,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MapPin,
  Clock
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';

const QRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'check-in' or 'check-out'
  const [scanResult, setScanResult] = useState(null); // 'success' or 'error'
  const [scanMessage, setScanMessage] = useState('');
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      setIsCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCamera(true);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setHasCamera(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application. Please close other apps and try again.');
      } else {
        setCameraError('Unable to access camera. Please check your camera permissions and try again.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setScanMode(null);
    setIsCameraReady(false);
  }, []);

  const captureAndScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // In a real app, this is where you'd process the QR code
    // For demo, we'll simulate QR code detection
    simulateQRDetection();
  }, [scanMode, isCameraReady]);

  const simulateQRDetection = () => {
    setIsProcessing(true);
    
    // Simulate QR code processing delay
    setTimeout(() => {
      // Simulate successful scan (90% success rate for demo)
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        const timestamp = new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        setScanResult('success');
        setScanMessage(
          scanMode === 'check-in' 
            ? `Successfully checked in at ${timestamp}`
            : `Successfully checked out at ${timestamp}`
        );
      } else {
        setScanResult('error');
        setScanMessage('Invalid QR code. Please try again.');
      }
      
      setIsProcessing(false);
      stopCamera();
    }, 2000);
  };

  const handleScanAction = async (mode) => {
    setScanMode(mode);
    setScanResult(null);
    setScanMessage('');
    setIsScanning(true);
    await startCamera();
  };

  const handleScanNow = () => {
    if (isProcessing || !isCameraReady) return;
    captureAndScan();
  };

  const handleRetry = async () => {
    setScanResult(null);
    setScanMessage('');
    setIsScanning(true);
    await startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setScanMessage('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <MainLayout>
      <FloatingShapes />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">
              QR Scanner
            </h1>
            <p className="text-[#0E2F76]/50 text-sm font-inter mt-1">
              Scan QR code at hostel entrance
            </p>
          </div>
        </div>

        {/* Camera View or Scan Result */}
        {isScanning ? (
          <div className="px-6">
            {/* Camera Container */}
            <div className="relative bg-black rounded-[24px] overflow-hidden shadow-lg mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[400px] object-cover"
              />
              
              {/* Scanner Overlay */}
              {isCameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-[20px] relative">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0E2F76] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0E2F76] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0E2F76] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0E2F76] rounded-br-lg" />
                  </div>
                </div>
              )}
              
              {/* Scanning line animation */}
              {isCameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-0.5 bg-[#0E2F76] animate-[scanLine_2s_ease-in-out_infinite]" />
                </div>
              )}

              {/* Camera Loading */}
              {!isCameraReady && !cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Starting camera...</p>
                  </div>
                </div>
              )}

              {/* Camera Error */}
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <XCircle size={48} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white text-sm mb-4">{cameraError}</p>
                    <div className="space-y-2">
                      <button
                        onClick={startCamera}
                        className="w-full px-6 py-3 bg-white text-[#0E2F76] rounded-full text-sm font-medium hover:bg-gray-100 transition-all duration-300"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="w-full px-6 py-3 bg-transparent text-white border border-white/30 rounded-full text-sm font-medium hover:bg-white/10 transition-all duration-300"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Processing QR Code...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-white rounded-[16px] text-[#0E2F76] font-medium text-sm shadow-sm border border-[#AAC0E1]/20 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              
              <div className="text-center">
                <p className="text-xs text-[#0E2F76]/50 mb-1">
                  {scanMode === 'check-in' ? 'Check In' : 'Check Out'}
                </p>
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  scanMode === 'check-in' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
              </div>
              
              <button
                onClick={handleScanNow}
                disabled={isProcessing || !isCameraReady || !!cameraError}
                className="w-16 h-16 bg-[#0E2F76] rounded-full flex items-center justify-center shadow-lg shadow-[#0E2F76]/20 hover:bg-[#0a2560] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera size={28} className="text-white" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : scanResult ? (
          /* Scan Result */
          <div className="px-6">
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#AAC0E1]/20 text-center">
              {scanResult === 'success' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-green-500" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0E2F76] mb-2">
                    {scanMode === 'check-in' ? 'Checked In!' : 'Checked Out!'}
                  </h3>
                  <p className="text-[#0E2F76]/60 text-sm mb-6">
                    {scanMessage}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <MapPin size={16} className="text-[#0E2F76]/40" />
                    <span className="text-xs text-[#0E2F76]/40">
                      Hostel A - Main Entrance
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <XCircle size={40} className="text-red-500" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0E2F76] mb-2">
                    Scan Failed
                  </h3>
                  <p className="text-[#0E2F76]/60 text-sm mb-6">
                    {scanMessage}
                  </p>
                </>
              )}
              
              <div className="space-y-3">
                {scanResult === 'success' ? (
                  <button
                    onClick={() => navigate('/home')}
                    className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold text-sm hover:bg-[#0a2560] transition-all duration-300"
                  >
                    Back to Home
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleRetry}
                      className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold text-sm hover:bg-[#0a2560] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Try Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full py-4 bg-white text-[#0E2F76] rounded-[16px] font-semibold text-sm border-2 border-[#AAC0E1] hover:bg-[#0E2F76]/5 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Initial State - Check In/Out Buttons */
          <div className="px-6">
            {/* Current Status */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#AAC0E1]/20 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <MapPin size={28} className="text-green-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0E2F76]">
                    Currently Inside Hostel
                  </h3>
                  <p className="text-[#0E2F76]/50 text-sm mt-0.5">
                    Last checked in at 08:30 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Scanner Instructions */}
            <div className="bg-[#AAC0E1]/10 rounded-[24px] p-6 mb-6 border border-[#AAC0E1]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center flex-shrink-0">
                  <QrCode size={20} className="text-[#0E2F76]" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0E2F76] mb-1">
                    How to Scan
                  </h4>
                  <ul className="text-xs text-[#0E2F76]/60 space-y-1">
                    <li>• Click Check In or Check Out</li>
                    <li>• Allow camera access when prompted</li>
                    <li>• Point camera at the QR code</li>
                    <li>• Hold steady and tap capture button</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleScanAction('check-out')}
                className="w-full py-5 bg-orange-500 text-white rounded-[20px] font-semibold text-base hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <LogOut size={22} strokeWidth={2} />
                Check Out
              </button>
              
              <button
                onClick={() => handleScanAction('check-in')}
                className="w-full py-5 bg-green-500 text-white rounded-[20px] font-semibold text-base hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <LogIn size={22} strokeWidth={2} />
                Check In
              </button>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20">
              <div className="flex items-center gap-3 mb-3">
                <Clock size={18} className="text-[#AAC0E1]" />
                <h4 className="text-sm font-semibold text-[#0E2F76]">
                  Recent Activity
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#0E2F76]/60">Check In</span>
                  <span className="text-[#0E2F76]/40">Today, 08:30 AM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#0E2F76]/60">Check Out</span>
                  <span className="text-[#0E2F76]/40">Yesterday, 10:15 PM</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default QRScanner;