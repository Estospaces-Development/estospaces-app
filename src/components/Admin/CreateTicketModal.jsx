import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const CreateTicketModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, description, priority });
        setTitle('');
        setDescription('');
        setPriority('medium');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-900">Create Support Ticket</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ticket Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Login Issue"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Details about the issue..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <div className="flex gap-4">
                            {['low', 'medium', 'high'].map((p) => (
                                <label key={p} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={p}
                                        checked={priority === p}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="sr-only peer"
                                    />
                                    <div className={`
                                        px-3 py-1 rounded-full text-sm capitalize border transition-all
                                        peer-checked:font-medium
                                        ${p === 'low' ? 'peer-checked:bg-green-100 peer-checked:text-green-700 peer-checked:border-green-200' : ''}
                                        ${p === 'medium' ? 'peer-checked:bg-yellow-100 peer-checked:text-yellow-700 peer-checked:border-yellow-200' : ''}
                                        ${p === 'high' ? 'peer-checked:bg-red-100 peer-checked:text-red-700 peer-checked:border-red-200' : ''}
                                        ${priority !== p ? 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100' : ''}
                                    `}>
                                        {p}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
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
                            Create Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
