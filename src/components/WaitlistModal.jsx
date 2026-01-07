import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Home, Building, Mail, Phone, MapPin, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useWaitlist } from '../hooks/useWaitlist';
import Toast from './ui/Toast';

const WaitlistModal = ({ isOpen, onClose }) => {
    const { submitToWaitlist, loading, error, success } = useWaitlist();

    const [formData, setFormData] = useState({
        userType: '',
        name: '',
        email: '',
        phone: '',
        location: '',
        lookingFor: '',
    });

    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const userTypes = [
        { value: 'buyer', label: 'Buyer', icon: Home, description: 'Looking to buy a property' },
        { value: 'renter', label: 'Renter', icon: User, description: 'Looking to rent a property' },
        { value: 'seller', label: 'Seller', icon: Building, description: 'Want to list a property' },
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.userType) newErrors.userType = 'Please select a user type';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.lookingFor.trim()) newErrors.lookingFor = 'Please tell us what you\'re looking for';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await submitToWaitlist(formData);

        if (result.success) {
            // Show success toast
            showToast('🎉 Welcome to Estospaces! You\'ve successfully joined our waitlist.', 'success');
            
            // Reset form and close modal after 2 seconds
            setTimeout(() => {
                setFormData({
                    userType: '',
                    name: '',
                    email: '',
                    phone: '',
                    location: '',
                    lookingFor: '',
                });
                setErrors({});
                onClose();
            }, 2000);
        } else if (result.error) {
            // Show error toast
            showToast(result.error, 'error');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <>
            {/* Toast Notification - Always rendered */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={5000}
            />

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                        className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>

                        {/* Content with hidden scrollbar */}
                        <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh] scrollbar-hide" style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-3 font-serif">
                                    Join the <span className="text-primary">Waitlist</span>
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Be among the first to experience the future of real estate
                                </p>
                            </div>

                            {/* Success State */}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-4 p-6 bg-green-50 border border-green-200 rounded-xl text-center"
                                >
                                    <CheckCircle className="text-green-600 mx-auto mb-2" size={28} />
                                    <p className="text-green-700 font-medium">Success! Closing...</p>
                                </motion.div>
                            )}

                            {/* Error State */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
                                >
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                                    <div>
                                        <h3 className="font-bold text-red-900 mb-1">Oops!</h3>
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* User Type Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        I am a... <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {userTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => handleChange('userType', type.value)}
                                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${formData.userType === type.value
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon className={`mb-2 ${formData.userType === type.value ? 'text-primary' : 'text-gray-400'}`} size={28} />
                                                    <div className="font-bold text-secondary mb-1">{type.label}</div>
                                                    <div className="text-xs text-gray-500">{type.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.userType && <p className="mt-2 text-sm text-red-600">{errors.userType}</p>}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                                                }`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                                                }`}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Phone (Optional) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary transition-colors bg-white text-gray-900 placeholder-gray-400"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Location/City <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => handleChange('location', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${errors.location ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                                                }`}
                                            placeholder="New York, NY"
                                        />
                                    </div>
                                    {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                                </div>

                                {/* Looking For */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        What are you looking for? <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 text-gray-400 pointer-events-none" size={20} />
                                        <textarea
                                            value={formData.lookingFor}
                                            onChange={(e) => handleChange('lookingFor', e.target.value)}
                                            rows={4}
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors resize-none bg-white text-gray-900 placeholder-gray-400 ${errors.lookingFor ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                                                }`}
                                            placeholder="Tell us about your ideal property, budget, preferences, etc."
                                        />
                                    </div>
                                    {errors.lookingFor && <p className="mt-2 text-sm text-red-600">{errors.lookingFor}</p>}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${loading || success
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-orange-600 text-white hover:shadow-xl transform hover:scale-[1.02]'
                                        }`}
                                >
                                    {loading ? 'Joining...' : success ? 'Joined!' : 'Reserve Your Spot'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
};

export default WaitlistModal;
