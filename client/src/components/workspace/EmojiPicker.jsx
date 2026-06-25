import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  },
  {
    name: 'Gestures',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '💪', '🦾'],
  },
  {
    name: 'Objects',
    emojis: ['💻', '🖥️', '📱', '📞', '⌨️', '🖱️', '💡', '🔦', '📚', '📖', '📝', '✏️', '📌', '📎', '🔑', '🗂️', '📁', '📊', '📈', '📉', '🗑️', '🔧', '🔨', '⚙️', '🧲', '🧪', '🔬', '🔭', '📡', '🎯'],
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌', '⭐', '🌟', '💫', '✨', '🔥', '💯', '🎉', '🎊', '🏆'],
  },
  {
    name: 'Reactions',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '🔥', '💯', '⭐', '✅', '❌', '👀', '🧠', '💡', '🚀', '⏰', '⏳', '🎯', '🏆', '📊', '💬', '📣', '🔔', '🫡', '🤔', '😮', '😢', '🥺', '😤'],
  },
];

const FREQUENT_EMOJIS = ['👍', '❤️', '😂', '🔥', '💯', '✅', '⭐', '👀', '🤔', '🚀', '👏', '💪', '🎉', '💡', '🧠', '😮', '😢', '🙌', '🏆', '📊'];

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const filteredEmojis = search
    ? EMOJI_CATEGORIES.flatMap((cat) => cat.emojis).filter((e) => e.includes(search))
    : EMOJI_CATEGORIES[activeCategory]?.emojis || [];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 mb-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-2 border-b border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-700 overflow-x-auto">
        <button onClick={() => { setActiveCategory(0); setSearch(''); }} className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === 0 && !search ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          Frequent
        </button>
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button key={cat.name} onClick={() => { setActiveCategory(idx); setSearch(''); }} className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === idx && !search ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-8 gap-0.5">
          {(search ? filteredEmojis : (activeCategory === 0 ? FREQUENT_EMOJIS : EMOJI_CATEGORIES[activeCategory]?.emojis || [])).map((emoji, idx) => (
            <motion.button
              key={`${emoji}-${idx}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { onSelect?.(emoji); onClose?.(); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        {search && filteredEmojis.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">No emojis found</div>
        )}
      </div>
    </motion.div>
  );
}
