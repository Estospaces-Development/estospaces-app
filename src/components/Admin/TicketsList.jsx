import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Ticket, Clock, AlertCircle } from 'lucide-react';

const TicketsList = ({ tickets, onSelectTicket }) => {
    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Ticket size={48} className="mb-4" />
                <p className="text-center">No tickets yet</p>
                <p className="text-sm text-center mt-2">Tickets will appear here when created from conversations</p>
            </div>
        );
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        return status === 'open'
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'bg-gray-100 text-gray-600 border-gray-200';
    };

    return (
        <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
                <button
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-primary to-orange-600 p-2 rounded-full flex-shrink-0">
                            <Ticket size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {ticket.title}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            {ticket.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {ticket.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    ID: {ticket.id.substring(0, 8)}
                                </span>
                            </div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default TicketsList;
