import React, { useState } from 'react';

const WelcomeForm = ({ onSubmit, loading, error }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name: name.trim(), email: email.trim() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Start Chat</h4>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={loading}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={loading}
                    required
                />
            </div>
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !name.trim() || !email.trim()}
            >
                {loading ? 'Starting Chat...' : 'Start Chat'}
            </button>
        </form>
    );
};

export default WelcomeForm;
