import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';

const MessageBubble = ({ message, isVisitor }) => {
    const isUser = message.sender_type === 'visitor';

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {isUser ? <User size={16} /> : <MessageCircle size={16} />}
                </div>

                {/* Message */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl text-sm ${isUser ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                        {message.message}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                        {message.created_at && formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
