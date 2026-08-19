import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
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
  AlertCircle,
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';
import Button from '../../components/buttons/Button';
import { useGetMyAllocationQuery } from '../../slices/hostelApiSlice';
import { useGetMyHistoryQuery, useCheckoutMutation, useReturnCheckinMutation } from '../../slices/checkInApiSlice';

const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // ─── State ────────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'check-in' or 'check-out'
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState('');

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

  // ─── Start / stop scanner ──────────────────────────────────────
  const startScanner = async (mode) => {
    if (!allocatedBunk) {
      setScanResult('error');
      setScanMessage('You have no bunk allocation. Please select a hostel first.');
      return;
    }

    setScanMode(mode);
    setScanResult(null);
    setScanMessage('');
    setIsScanning(true);
    setCameraError('');

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      setCameraError('Unable to access camera. Please allow camera access.');
      setIsScanning(false);
      console.error(err);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          setScanMode(null);
        })
        .catch((err) => console.error('Stop scanner error:', err));
    }
  };

  // ─── QR scan callbacks ────────────────────────────────────────
  const onScanSuccess = async (decodedText) => {
    // decodedText should be the QR token (JWT)
    setIsProcessing(true);
    try {
      // Call the appropriate API based on mode
      let result;
      if (scanMode === 'check-in') {
        // return (check-in) does not require expectedReturnTime
        result = await returnCheckin().unwrap();
      } else if (scanMode === 'check-out') {
        const expectedReturn = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        result = await checkout({ expectedReturnTime: expectedReturn }).unwrap();
      } else {
        throw new Error('Invalid scan mode');
      }

      // Check response
      if (result && result.success) {
        setScanResult('success');
        setScanMessage(result.message || 'Action completed successfully.');
        await refetchHistory();
        // Stop scanner after success
        stopScanner();
      } else {
        throw new Error(result?.message || 'Action failed');
      }
    } catch (error) {
      setScanResult('error');
      setScanMessage(error?.data?.message || error.message || 'Action failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onScanError = (err) => {
    // Ignore continuous scanning errors; they are normal during scanning.
    // Only log critical errors.
    if (err && err.message && !err.message.includes('No MultiFormat Readers')) {
      console.warn('QR scan error:', err);
    }
  };

  // ─── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────
  const handleScanAction = async (mode) => {
    await startScanner(mode);
  };

  const handleRetry = () => {
    setScanResult(null);
    setScanMessage('');
    startScanner(scanMode);
  };

  const handleClose = () => {
    stopScanner();
    setScanResult(null);
    setScanMessage('');
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

        {isScanning ? (
          // Scanner view
          <div className="px-6">
            <div className="relative bg-black rounded-[24px] overflow-hidden shadow-lg mb-4">
              {/* QR reader container */}
              <div id="qr-reader" className="w-full h-[400px]" />
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
                  <div className="text-center">
                    <XCircle size={48} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white text-sm mb-4">{cameraError}</p>
                    <button
                      onClick={() => startScanner(scanMode)}
                      className="px-6 py-3 bg-white text-[#0E2F76] rounded-full text-sm font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="ml-3 px-6 py-3 bg-transparent text-white border border-white rounded-full text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {isProcessing && (
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
                className="px-6 py-3 bg-white rounded-[16px] text-[#0E2F76] font-medium shadow-sm border"
              >
                Cancel
              </button>
              <div className="text-center">
                <p className="text-xs text-[#0E2F76]/50">{scanMode === 'check-in' ? 'Check In' : 'Check Out'}</p>
                <div className={`w-3 h-3 rounded-full mx-auto ${scanMode === 'check-in' ? 'bg-green-500' : 'bg-orange-500'}`} />
              </div>
              <div className="w-16" /> {/* placeholder for symmetry */}
            </div>
          </div>
        ) : scanResult ? (
          // Result view
          <div className="px-6">
            <div className="bg-white rounded-[24px] p-8 shadow-sm border text-center">
              {scanResult === 'success' ? (
                <>
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
                </>
              ) : (
                <>
                  <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#0E2F76]">Scan Failed</h3>
                  <p className="text-[#0E2F76]/60 text-sm mb-6">{scanMessage}</p>
                  <button
                    onClick={handleRetry}
                    className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold flex items-center justify-center gap-2"
                  >
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