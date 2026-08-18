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
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';
import Button from '../../components/buttons/Button';
// ─── Correct imports ──────────────────────────────────────
import { useGetMyAllocationQuery } from '../../slices/hostelApiSlice';
import { useGetMyHistoryQuery, useCheckoutMutation, useReturnCheckinMutation } from '../../slices/checkInApiSlice';

const QRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // ─── State ────────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'check-in' or 'check-out'
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // ─── API Hooks ────────────────────────────────────────────────
  const { data: allocationData, isLoading: allocLoading } = useGetMyAllocationQuery();
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useGetMyHistoryQuery(undefined, {
    skip: !allocationData?.data,
  });
  const [checkout, { isLoading: checkoutLoading }] = useCheckoutMutation();
  const [returnCheckin, { isLoading: returnLoading }] = useReturnCheckinMutation();

  // ─── Derived state ────────────────────────────────────────────
  const allocatedBunk = allocationData?.data;
  const checkInHistory = historyData?.data || [];
  const latestRecord = checkInHistory.length > 0 ? checkInHistory[0] : null;
  const isInside = allocatedBunk ? (latestRecord ? !!latestRecord.returnTime : true) : null;

  // ─── Camera Functions ────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      setIsCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => setIsCameraReady(true);
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
    setScanMode(null);
    setIsCameraReady(false);
  }, []);

  // ─── QR Scanning ──────────────────────────────────────────────
  const captureAndScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Simulate QR processing – in production use a library like jsQR
    processQR();
  }, [isCameraReady]);

  const processQR = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // simulate scanning
    try {
      let result;
      if (scanMode === 'check-in') {
        result = await returnCheckin().unwrap();
      } else if (scanMode === 'check-out') {
        // expected return time: now + 2 hours
        const expectedReturn = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        result = await checkout({ expectedReturnTime: expectedReturn }).unwrap();
      }
      if (result.success) {
        setScanResult('success');
        setScanMessage(result.message);
        await refetchHistory();
      } else {
        throw new Error(result.message || 'Action failed');
      }
    } catch (error) {
      setScanResult('error');
      setScanMessage(error?.data?.message || error.message || 'Scan failed');
    } finally {
      setIsProcessing(false);
      stopCamera();
    }
  };

  // ─── Handlers ────────────────────────────────────────────────
  const handleScanAction = async (mode) => {
    if (!allocatedBunk) {
      setScanResult('error');
      setScanMessage('You have no bunk allocation. Please select a hostel first.');
      return;
    }
    setScanMode(mode);
    setScanResult(null);
    setScanMessage('');
    setIsScanning(true);
    await startCamera();
  };

  const handleScanNow = () => {
    if (isProcessing || !isCameraReady || cameraError) return;
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

  // ─── Cleanup ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  // ─── Loading / Error ─────────────────────────────────────────
  if (allocLoading || historyLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#0E2F76]" />
          <p className="text-[#0E2F76]/60 text-sm font-inter mt-4">Loading scanner...</p>
        </div>
      </MainLayout>
    );
  }

  if (!allocatedBunk) {
    return (
      <MainLayout>
        <div className="relative z-10 px-6 pt-8">
          <div className="bg-white rounded-[24px] p-8 shadow-sm border text-center">
            <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0E2F76] mb-2">No Hostel Allocation</h3>
            <p className="text-[#0E2F76]/60 text-sm mb-6">
              You need to select a hostel and bunk before you can check in or out.
            </p>
            <Button variant="primary" onClick={() => navigate('/home')} fullWidth>
              Go to Home to Select Hostel
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <MainLayout>
      <FloatingShapes />
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-[#0E2F76]">QR Scanner</h1>
          <p className="text-[#0E2F76]/50 text-sm">Scan QR code at hostel entrance</p>
        </div>

        {isScanning ? (
          // Scanning view (camera)
          <div className="px-6">
            <div className="relative bg-black rounded-[24px] overflow-hidden shadow-lg mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-[400px] object-cover" />
              {isCameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-[20px] relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0E2F76] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0E2F76] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0E2F76] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0E2F76] rounded-br-lg" />
                  </div>
                </div>
              )}
              {isCameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-0.5 bg-[#0E2F76] animate-[scanLine_2s_ease-in-out_infinite]" />
                </div>
              )}
              {!isCameraReady && !cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <Loader2 size={40} className="animate-spin text-white" />
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
                  <div className="text-center">
                    <XCircle size={48} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white text-sm mb-4">{cameraError}</p>
                    <button onClick={startCamera} className="px-6 py-3 bg-white text-[#0E2F76] rounded-full text-sm font-medium">Try Again</button>
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 size={40} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex items-center justify-between px-2">
              <button onClick={handleClose} className="px-6 py-3 bg-white rounded-[16px] text-[#0E2F76] font-medium shadow-sm border">Cancel</button>
              <div className="text-center">
                <p className="text-xs text-[#0E2F76]/50">{scanMode === 'check-in' ? 'Check In' : 'Check Out'}</p>
                <div className={`w-3 h-3 rounded-full mx-auto ${scanMode === 'check-in' ? 'bg-green-500' : 'bg-orange-500'}`} />
              </div>
              <button
                onClick={handleScanNow}
                disabled={isProcessing || !isCameraReady || !!cameraError}
                className="w-16 h-16 bg-[#0E2F76] rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
              >
                <Camera size={28} className="text-white" />
              </button>
            </div>
          </div>
        ) : scanResult ? (
          // Result view
          <div className="px-6">
            <div className="bg-white rounded-[24px] p-8 shadow-sm border text-center">
              {scanResult === 'success' ? (
                <>
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#0E2F76]">{scanMode === 'check-in' ? 'Checked In!' : 'Checked Out!'}</h3>
                  <p className="text-[#0E2F76]/60 text-sm mb-6">{scanMessage}</p>
                  <button onClick={() => navigate('/home')} className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold">Back to Home</button>
                </>
              ) : (
                <>
                  <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#0E2F76]">Scan Failed</h3>
                  <p className="text-[#0E2F76]/60 text-sm mb-6">{scanMessage}</p>
                  <button onClick={handleRetry} className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold flex items-center justify-center gap-2">
                    <RotateCcw size={18} /> Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          // Initial action buttons
          <div className="px-6">
            <div className={`rounded-[24px] p-6 shadow-sm border mb-6 ${isInside ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-4">
                <MapPin size={28} className={isInside ? 'text-green-600' : 'text-orange-600'} />
                <div>
                  <h3 className={`text-lg font-semibold ${isInside ? 'text-green-700' : 'text-orange-700'}`}>
                    {isInside ? 'Currently Inside Hostel' : 'Currently Outside Hostel'}
                  </h3>
                  <p className="text-[#0E2F76]/50 text-sm">
                    {latestRecord ? (isInside ? `Returned ${new Date(latestRecord.returnTime).toLocaleString()}` : `Left ${new Date(latestRecord.checkoutTime).toLocaleString()}`) : 'No recent check-in'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {isInside ? (
                <button onClick={() => handleScanAction('check-out')} className="w-full py-5 bg-orange-500 text-white rounded-[20px] font-semibold shadow-lg flex items-center justify-center gap-3">
                  <LogOut size={22} /> Check Out
                </button>
              ) : (
                <button onClick={() => handleScanAction('check-in')} className="w-full py-5 bg-green-500 text-white rounded-[20px] font-semibold shadow-lg flex items-center justify-center gap-3">
                  <LogIn size={22} /> Check In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default QRScanner;