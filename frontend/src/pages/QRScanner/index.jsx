import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';
import Button from '../../components/buttons/Button';
import { useGetMyAllocationQuery } from '../../slices/hostelApiSlice';
import { useGetMyHistoryQuery, useCheckoutMutation, useReturnCheckinMutation } from '../../slices/checkInApiSlice';

const SCANNER_ELEMENT_ID = 'qr-reader-container';

const QRScanner = () => {
  const navigate = useNavigate();
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  // ─── State ────────────────────────────────────────────────────
  // view: 'idle' | 'scanning' | 'success' | 'error'
  const [view, setView] = useState('idle');
  const [scanMode, setScanMode] = useState(null); // 'check-in' or 'check-out'
  const [scanMessage, setScanMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  // ─── API Hooks ────────────────────────────────────────────────
  const { data: allocationData, isLoading: allocLoading } = useGetMyAllocationQuery();
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useGetMyHistoryQuery(undefined, {
    skip: !allocationData?.data,
  });
  const [checkout] = useCheckoutMutation();
  const [returnCheckin] = useReturnCheckinMutation();

  // ─── Derived state ────────────────────────────────────────────
  const allocatedBunk = allocationData?.data;
  const checkInHistory = historyData?.data || [];
  const latestRecord = checkInHistory.length > 0 ? checkInHistory[0] : null;
  const isInside = allocatedBunk ? (latestRecord ? !!latestRecord.returnTime : true) : null;

  // ─── QR scan success/error callbacks ───────────────────────────
  const onScanSuccess = useCallback(
    async (decodedText, mode) => {
      // Prevent multiple simultaneous triggers from consecutive decoded frames
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsProcessing(true);

      // Pause decoding immediately so we don't keep firing while the request is in flight
      try {
        html5QrCodeRef.current?.pause(true);
      } catch (e) {
        // ignore
      }

      try {
        let result;
        if (mode === 'check-in') {
          result = await returnCheckin().unwrap();
        } else if (mode === 'check-out') {
          const expectedReturn = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
          result = await checkout({ expectedReturnTime: expectedReturn }).unwrap();
        } else {
          throw new Error('Invalid scan mode');
        }

        if (result && result.success) {
          await stopCamera();
          setScanMessage(result.message || 'Action completed successfully.');
          setView('success');
          refetchHistory();
        } else {
          throw new Error(result?.message || 'Action failed');
        }
      } catch (error) {
        await stopCamera();
        setScanMessage(error?.data?.message || error.message || 'Action failed. Please try again.');
        setView('error');
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [checkout, returnCheckin, refetchHistory]
  );

  const onScanError = () => {
    // Fired continuously while no QR code is in frame — safe to ignore.
  };

  // ─── Camera lifecycle ───────────────────────────────────────────
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState?.();
        // Only call stop if the scanner is actually running/paused
        if (state === 2 || state === 3) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        // ignore - already stopped
      }
      try {
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
  };

  const startCamera = useCallback(async (mode) => {
    setCameraError('');
    setIsInitializing(true);

    try {
      // Clean up any previous instance first
      await stopCamera();

      const container = document.getElementById(SCANNER_ELEMENT_ID);
      if (!container) {
        throw new Error('Scanner container not found. Please try again.');
      }

      const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => onScanSuccess(decodedText, mode),
        onScanError
      );

      setIsInitializing(false);
    } catch (err) {
      console.error('Scanner start error:', err);
      let message = 'Unable to start camera. Please check permissions and try again.';
      if (err?.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access in your browser/app settings.';
      } else if (err?.name === 'NotFoundError') {
        message = 'No camera found on this device.';
      } else if (err?.message) {
        message = err.message;
      }
      setCameraError(message);
      setIsInitializing(false);
    }
  }, [onScanSuccess]);

  // Start the camera only once we're in 'scanning' view, i.e. once the
  // container div has actually been committed to the DOM.
  useEffect(() => {
    if (view === 'scanning' && scanMode) {
      startCamera(scanMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, scanMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear?.();
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────
  const handleScanAction = (mode) => {
    if (!allocatedBunk) {
      setScanMessage('You have no bunk allocation. Please select a hostel first.');
      setView('error');
      return;
    }
    setScanMode(mode);
    setScanMessage('');
    setCameraError('');
    setView('scanning'); // triggers useEffect above once the div is mounted
  };

  const handleRetryCamera = () => {
    startCamera(scanMode);
  };

  const handleRetryScan = () => {
    setScanMessage('');
    setView('scanning');
  };

  const handleClose = async () => {
    await stopCamera();
    setScanMode(null);
    setScanMessage('');
    setView('idle');
  };

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

        {view === 'scanning' && (
          <div className="px-6">
            <div className="relative bg-black rounded-[24px] overflow-hidden shadow-lg mb-4">
              {/* Camera container - always the same DOM node, id used by html5-qrcode */}
              <div id={SCANNER_ELEMENT_ID} className="w-full h-[400px] bg-black" />

              {isInitializing && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-white" />
                    <p className="text-white mt-2">Initializing camera...</p>
                  </div>
                </div>
              )}

              {cameraError && !isInitializing && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <XCircle size={48} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white text-sm mb-4">{cameraError}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={handleRetryCamera}
                        className="px-6 py-3 bg-white text-[#0E2F76] rounded-full text-sm font-medium"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-transparent text-white border border-white rounded-full text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && !cameraError && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-white" />
                    <p className="text-white mt-2">Processing...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-2">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="px-6 py-3 bg-white rounded-[16px] text-[#0E2F76] font-medium shadow-sm border disabled:opacity-50"
              >
                Cancel
              </button>
              <div className="text-center">
                <p className="text-xs text-[#0E2F76]/50">{scanMode === 'check-in' ? 'Check In' : 'Check Out'}</p>
                <div className={`w-3 h-3 rounded-full mx-auto ${scanMode === 'check-in' ? 'bg-green-500' : 'bg-orange-500'}`} />
              </div>
              <div className="w-16" />
            </div>
          </div>
        )}

        {view === 'success' && (
          <div className="px-6">
            <div className="bg-white rounded-[24px] p-8 shadow-sm border text-center">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#0E2F76]">
                {scanMode === 'check-in' ? 'Checked In!' : 'Checked Out!'}
              </h3>
              <p className="text-[#0E2F76]/60 text-sm mb-6">{scanMessage}</p>
              <button
                onClick={() => navigate('/home')}
                className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {view === 'error' && (
          <div className="px-6">
            <div className="bg-white rounded-[24px] p-8 shadow-sm border text-center">
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#0E2F76]">Scan Failed</h3>
              <p className="text-[#0E2F76]/60 text-sm mb-6">{scanMessage}</p>
              <button
                onClick={handleRetryScan}
                className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Try Again
              </button>
            </div>
          </div>
        )}

        {view === 'idle' && (
          <div className="px-6">
            <div className={`rounded-[24px] p-6 shadow-sm border mb-6 ${isInside ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-4">
                <MapPin size={28} className={isInside ? 'text-green-600' : 'text-orange-600'} />
                <div>
                  <h3 className={`text-lg font-semibold ${isInside ? 'text-green-700' : 'text-orange-700'}`}>
                    {isInside ? 'Currently Inside Hostel' : 'Currently Outside Hostel'}
                  </h3>
                  <p className="text-[#0E2F76]/50 text-sm">
                    {latestRecord
                      ? isInside
                        ? `Returned ${new Date(latestRecord.returnTime).toLocaleString()}`
                        : `Left ${new Date(latestRecord.checkoutTime).toLocaleString()}`
                      : 'No recent check-in'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {isInside ? (
                <button
                  onClick={() => handleScanAction('check-out')}
                  className="w-full py-5 bg-orange-500 text-white rounded-[20px] font-semibold shadow-lg flex items-center justify-center gap-3"
                >
                  <LogOut size={22} /> Check Out
                </button>
              ) : (
                <button
                  onClick={() => handleScanAction('check-in')}
                  className="w-full py-5 bg-green-500 text-white rounded-[20px] font-semibold shadow-lg flex items-center justify-center gap-3"
                >
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