import { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Shield, Loader2, Lock, X } from 'lucide-react';
import { PropertyLocation, VerificationStatus, getStatusDisplayInfo, updateLocationVerification } from '../../mocks/locationMock';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationVerificationActionsProps {
    location: PropertyLocation;
    onStatusChange: (updatedLocation: PropertyLocation) => void;
    onToast: (message: string, type: 'success' | 'error') => void;
}

const LocationVerificationActions = ({ location, onStatusChange, onToast }: LocationVerificationActionsProps) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [note, setNote] = useState(location.notes || '');

    const isVerified = location.verificationStatus === 'verified';
    const statusInfo = getStatusDisplayInfo(location.verificationStatus);

    const handleVerify = async () => {
        setIsVerifying(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const updated = updateLocationVerification(location.propertyId, 'verified');
        if (updated) {
            onStatusChange(updated);
            onToast('Location verified successfully! This property now has a verified badge.', 'success');
        } else {
            onToast('Failed to verify location. Please try again.', 'error');
        }

        setIsVerifying(false);
    };

    const handleMarkForReview = async () => {
        setIsReviewing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));

        const updated = updateLocationVerification(location.propertyId, 'under_review');
        if (updated) {
            onStatusChange(updated);
            onToast('Location marked for review.', 'success');
        } else {
            onToast('Failed to update status. Please try again.', 'error');
        }

        setIsReviewing(false);
    };

    const handleSaveNote = async () => {
        const updated = updateLocationVerification(
            location.propertyId,
            location.verificationStatus,
            note
        );

        if (updated) {
            onStatusChange(updated);
            onToast('Note saved successfully.', 'success');
            setShowNoteModal(false);
        } else {
            onToast('Failed to save note. Please try again.', 'error');
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Verification Actions
                </h3>

                {/* Current Status */}
                <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Status</p>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                        {isVerified && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Read-only
                            </span>
                        )}
                    </div>

                    {/* Verification Info */}
                    {isVerified && location.verifiedAt && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Verified on {new Date(location.verifiedAt).toLocaleDateString()}
                                {location.verifiedBy && ` by ${location.verifiedBy}`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Verify Location Button */}
                    <button
                        onClick={handleVerify}
                        disabled={isVerified || isVerifying}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isVerified
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isVerifying ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5" />
                        )}
                        {isVerified ? 'Location Verified' : isVerifying ? 'Verifying...' : 'Verify Location'}
                    </button>

                    {/* Mark as Needs Review Button */}
                    <button
                        onClick={handleMarkForReview}
                        disabled={isVerified || isReviewing || location.verificationStatus === 'under_review'}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isVerified || location.verificationStatus === 'under_review'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            }`}
                    >
                        {isReviewing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                        {isReviewing ? 'Updating...' : 'Mark as Needs Review'}
                    </button>

                    {/* Add Location Note Button */}
                    <button
                        onClick={() => setShowNoteModal(true)}
                        disabled={isVerified}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isVerified
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        {location.notes ? 'Edit Location Note' : 'Add Location Note'}
                    </button>
                </div>

                {/* Existing Note Display */}
                {location.notes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Manager Note:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{location.notes}</p>
                    </div>
                )}

                {/* Verified Lock Notice */}
                {isVerified && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                        <Lock className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700 dark:text-green-300">
                            This location has been verified and is now in read-only mode.
                            Contact admin to make changes.
                        </p>
                    </div>
                )}
            </div>

            {/* Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Location Note
                                </h3>
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add notes about this location (road conditions, landmarks, accessibility, etc.)"
                                className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className="flex-1 py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Save Note
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LocationVerificationActions;
