import React, { useState, useRef } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

const SignatureModal = ({ contract, onClose, onSign }) => {
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [hasSigned, setHasSigned] = useState(false);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleStartDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handleDraw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleStopDrawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      // Check if canvas has content (not just white/transparent)
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((channel, index) => {
        return index % 4 !== 3 && channel !== 255 && channel !== 0;
      });
      if (hasContent) {
        setSignature(dataURL);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleAcceptAndSign = () => {
    if (!signature) {
      alert('Please provide your signature');
      return;
    }
    
    // Store signed status
    const signedContracts = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    signedContracts.push({
      contractId: contract.id,
      signedAt: new Date().toISOString(),
      signature: signature,
    });
    localStorage.setItem('signedContracts', JSON.stringify(signedContracts));
    
    setHasSigned(true);
    
    // Call the callback after a short delay to show confirmation
    setTimeout(() => {
      onSign(contract.id, signature);
      onClose();
    }, 1500);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sign Contract</h2>
            <p className="text-sm text-gray-600 mt-1">{contract?.name || contract?.property}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {hasSigned ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contract Signed!</h3>
              <p className="text-gray-600 text-center">
                Your signature has been recorded and the contract is now active.
              </p>
            </div>
          ) : (
            <>
              {/* Terms Checkbox */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    required
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      I agree to the terms and conditions of this contract
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      By signing, I acknowledge that I have read and understood all the terms.
                    </p>
                  </div>
                </label>
              </div>

              {/* Signature Canvas */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Signature
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-48 bg-white rounded border border-gray-200 cursor-crosshair touch-none"
                    onMouseDown={handleStartDrawing}
                    onMouseMove={handleDraw}
                    onMouseUp={handleStopDrawing}
                    onMouseLeave={handleStopDrawing}
                    onTouchStart={handleStartDrawing}
                    onTouchMove={handleDraw}
                    onTouchEnd={handleStopDrawing}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Draw your signature above
                    </p>
                    <button
                      onClick={clearSignature}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <RotateCcw size={16} />
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative: Type Signature */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Type Your Name
                </label>
                <input
                  type="text"
                  placeholder="Type your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => {
                    if (e.target.value) {
                      clearSignature();
                      setSignature(e.target.value);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!hasSigned && (
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAcceptAndSign}
              disabled={!signature}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Accept & Sign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureModal;

