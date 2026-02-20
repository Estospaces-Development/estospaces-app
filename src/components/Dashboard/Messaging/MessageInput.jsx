import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText, Smile } from 'lucide-react';
import { useMessages } from '../../../contexts/MessagesContext';

const MessageInput = ({ conversationId, onSend }) => {
  const { quickReplyTemplates } = useMessages();
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  const handleSend = (e) => {
    e?.preventDefault();
    if ((messageText.trim() || attachments.length > 0) && conversationId) {
      onSend(conversationId, messageText.trim(), attachments);
      setMessageText('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const newAttachments = validFiles.map((file) => ({
      name: file.name,
      type: file.type,
      file: file,
      size: file.size,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickReply = (template) => {
    setMessageText(template);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <ImageIcon size={16} />;
    } else if (type === 'application/pdf') {
      return <FileText size={16} />;
    }
    return <FileText size={16} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!conversationId) {
    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 flex-shrink-0 z-10 sticky bottom-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
      {/* Quick Reply Templates */}
      {showQuickReplies && (
        <div className="mb-3 animate-slideUp">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Quick Replies</p>
            <button
              onClick={() => setShowQuickReplies(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickReplyTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(template)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800 text-gray-700 dark:text-gray-300 transition-all"
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 px-1">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="group relative flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl"
              >
                <div className="text-orange-500 dark:text-orange-400">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border border-transparent focus-within:border-orange-200 dark:focus-within:border-orange-900/50 focus-within:ring-2 focus-within:ring-orange-100 dark:focus-within:ring-orange-900/20 transition-all">

          <div className="flex gap-1 pb-1">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Quick Reply Button */}
            <button
              type="button"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`p-2 rounded-xl transition-colors ${showQuickReplies
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                }`}
              title="Quick replies"
            >
              <Smile size={20} />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-2 py-2.5 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none overflow-hidden max-h-32 text-sm leading-relaxed"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageText.trim() && attachments.length === 0}
            className="p-2.5 mb-0.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
            title="Send message"
          >
            <Send size={18} className={messageText.trim() ? "translate-x-0.5" : ""} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;

