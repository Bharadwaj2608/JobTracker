import { useState, useRef, useEffect } from 'react';
import { streamChat } from '../utils/aiApi';
import { useAuth } from '../context/AuthContext';
import { PaperAirplaneIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  "How is my job search going?",
  "Which application should I follow up on?",
  "How do I prepare for a software engineering interview?",
  "What's my application success rate?",
  "Give me tips to improve my job search strategy",
  "How should I negotiate salary?",
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold
        ${isUser
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'}`}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm shadow-sm'}`}>
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
        ))}
        {msg.streaming && (
          <span className="inline-flex gap-0.5 ml-1 align-middle">
            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  );
}

export default function AiCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI career coach. I have access to all your job applications and I'm here to help you land your dream role.\n\nWhat would you like to know?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content: messageText };
    const assistantMsg = { role: 'assistant', content: '', streaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      await streamChat(
        messageText,
        history,
        (chunk) => {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.streaming) last.content += chunk;
            return updated;
          });
        },
        () => {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].streaming = false;
            return updated;
          });
          setLoading(false);
        }
      );
    } catch {
      toast.error('Failed to get response');
      setMessages(prev => prev.slice(0, -1));
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! How can I help you with your job search today? 🚀`,
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-base">AI Career Coach</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-grayald-400 dark:text-gray-500 text-gray-400">Powered by Claude · Knows your applications</p>
            </div>
          </div>
        </div>
        <button onClick={clearChat}
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                text-xs text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700
                hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-3">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask your career coach anything..."
            className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100
              border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:outline-none
              placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none transition-all"
            style={{ minHeight: '46px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center
              disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex-shrink-0"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <PaperAirplaneIcon className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 px-1">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}