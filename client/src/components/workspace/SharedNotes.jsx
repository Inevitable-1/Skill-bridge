import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Check, Users } from 'lucide-react';

export default function SharedNotes({ roomId, socket, participants = [] }) {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [remoteEditors, setRemoteEditors] = useState([]);
  const saveTimerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleNotesUpdate = (data) => {
      if (data.roomId === roomId && data.content !== undefined) {
        setContent(data.content);
      }
    };

    const handleRemoteCursor = (data) => {
      if (data.roomId === roomId) {
        setRemoteEditors((prev) => {
          const exists = prev.find((e) => e.id === data.userId);
          if (exists) {
            return prev.map((e) => (e.id === data.userId ? { ...e, position: data.position, name: data.userName } : e));
          }
          return [...prev, { id: data.userId, name: data.userName, position: data.position }];
        });
      }
    };

    socket.on('shared_notes_update', handleNotesUpdate);
    socket.on('shared_notes_cursor', handleRemoteCursor);

    return () => {
      socket.off('shared_notes_update', handleNotesUpdate);
      socket.off('shared_notes_cursor', handleRemoteCursor);
    };
  }, [socket, roomId]);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setContent(value);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaving(true);
      if (socket && roomId) {
        socket.emit('shared_notes_update', { roomId, content: value });
      }
      setTimeout(() => { setSaving(false); setLastSaved(new Date()); }, 500);
    }, 800);
  }, [socket, roomId]);

  const handleCursorMove = useCallback(() => {
    if (socket && roomId && textareaRef.current) {
      const pos = textareaRef.current.selectionStart;
      socket.emit('shared_notes_cursor', { roomId, position: pos });
    }
  }, [socket, roomId]);

  const handleManualSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    if (socket && roomId) {
      socket.emit('shared_notes_update', { roomId, content });
    }
    setTimeout(() => { setSaving(false); setLastSaved(new Date()); }, 500);
  }, [socket, roomId, content]);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Shared Notes</span>
          <span className="text-[10px] text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">Collaborative</span>
        </div>
        <div className="flex items-center gap-2">
          {participants.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              <span>{participants.length} editing</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {saving ? (
              <><Save className="w-3 h-3 animate-pulse text-amber-400" /><span className="text-amber-400">Saving...</span></>
            ) : lastSaved ? (
              <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Saved {lastSaved.toLocaleTimeString()}</span></>
            ) : null}
          </div>
          <button onClick={handleManualSave} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors" title="Save now">
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          placeholder="Start typing collaborative notes here...&#10;&#10;Everyone in the meeting can see and edit these notes in real-time."
          className="w-full h-full bg-transparent text-gray-200 text-sm leading-relaxed p-4 resize-none focus:outline-none placeholder-gray-600 font-mono"
          spellCheck={false}
        />
        {remoteEditors.length > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {remoteEditors.slice(0, 5).map((editor) => (
              <motion.div key={editor.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-[9px] font-bold text-indigo-300" title={editor.name}>
                {editor.name?.[0]?.toUpperCase() || '?'}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
