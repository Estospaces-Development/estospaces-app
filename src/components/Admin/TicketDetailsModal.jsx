import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const TicketDetailsModal = ({ ticket, isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState(ticket?.title || '');
    const [description, setDescription] = useState(ticket?.description || '');
    const [priority, setPriority] = useState(ticket?.priority || 'medium');
    const [status, setStatus] = useState(ticket?.status || 'open');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !ticket) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(ticket.id, { title, description, priority, status });
            onClose();
        } catch (error) {
            console.error('Failed to save ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">Ticket Details</h3>
                        <p className="text-sm text-gray-500">ID: {ticket.id.substring(0, 8)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Created:</span>
                                <p className="font-medium text-gray-900">
                                    {new Date(ticket.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Updated:</span>
                                <p className="font-medium text-gray-900">
                                    {new Date(ticket.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketDetailsModal;
