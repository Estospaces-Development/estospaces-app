import { formatDistanceToNow } from 'date-fns';
import { User, Mail } from 'lucide-react';

const ConversationList = ({ conversations, selectedConversation, onSelect }) => {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <User size={48} className="mb-4" />
                <p className="text-center">No conversations yet</p>
                <p className="text-sm text-center mt-2">Conversations will appear here when visitors start chatting</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
                <button
                    key={conversation.id}
                    onClick={() => onSelect(conversation)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-orange-50 border-l-4 border-primary' : ''
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-primary to-orange-600 p-2 rounded-full flex-shrink-0">
                            <User size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {conversation.visitor_name || 'Anonymous'}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                                </span>
                            </div>
                            {conversation.visitor_email && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                    <Mail size={12} />
                                    <span className="truncate">{conversation.visitor_email}</span>
                                </div>
                            )}
                            <p className="text-sm text-gray-500">
                                Visitor ID: {conversation.visitor_id.substring(0, 8)}...
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ConversationList;
