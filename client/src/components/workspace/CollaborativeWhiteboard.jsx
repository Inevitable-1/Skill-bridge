import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Eraser, Square, Circle, Minus, Type, StickyNote, Trash2,
  Download, Undo2, Redo2, Palette, GripVertical, X, Triangle,
  ArrowRight, Highlighter, Eraser as EraserIcon,
} from 'lucide-react';

const TOOLS = [
  { id: 'pencil', icon: Pencil, label: 'Pencil' },
  { id: 'marker', icon: Highlighter, label: 'Marker' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'stickyNote', icon: StickyNote, label: 'Sticky Note' },
];

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
  '#00FFFF', '#FF5722', '#9C27B0', '#4CAF50', '#2196F3', '#FF9800',
  '#795548', '#607D8B', '#E91E63', '#00BCD4',
];

const STICKY_COLORS = ['#FFEB3B', '#FF9800', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#00BCD4', '#FF5722'];

const MIN_LINE_WIDTH = 1;
const MAX_LINE_WIDTH = 30;
const DEFAULT_LINE_WIDTH = 3;

let stickyIdCounter = 0;

export default function CollaborativeWhiteboard({ roomId, socket }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [currentTool, setCurrentTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [actions, setActions] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const drawingStateRef = useRef({
    isDrawing: false, startX: 0, startY: 0, lastX: 0, lastY: 0, currentPoints: [],
  });

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const drawArrowHead = useCallback((ctx, fromX, fromY, toX, toY, size = 12) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }, []);

  const drawTriangle = useCallback((ctx, startX, startY, endX, endY) => {
    const midX = (startX + endX) / 2;
    ctx.beginPath();
    ctx.moveTo(midX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(startX, endY);
    ctx.closePath();
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback((actionList) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    actionList.forEach((action) => {
      ctx.save();
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      }

      switch (action.tool) {
        case 'pencil':
        case 'marker':
          if (action.tool === 'marker') { ctx.globalAlpha = 0.4; ctx.lineWidth = action.lineWidth * 3; }
          if (action.points && action.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(action.points[0].x, action.points[0].y);
            for (let i = 1; i < action.points.length; i++) ctx.lineTo(action.points[i].x, action.points[i].y);
            ctx.stroke();
          }
          break;
        case 'eraser':
          if (action.points && action.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(action.points[0].x, action.points[0].y);
            for (let i = 1; i < action.points.length; i++) ctx.lineTo(action.points[i].x, action.points[i].y);
            ctx.stroke();
          }
          break;
        case 'rectangle':
          ctx.strokeRect(action.startX, action.startY, action.endX - action.startX, action.endY - action.startY);
          break;
        case 'circle': {
          const cx = (action.startX + action.endX) / 2;
          const cy = (action.startY + action.endY) / 2;
          const rx = Math.abs(action.endX - action.startX) / 2;
          const ry = Math.abs(action.endY - action.startY) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'triangle': {
          const midX = (action.startX + action.endX) / 2;
          ctx.beginPath();
          ctx.moveTo(midX, action.startY);
          ctx.lineTo(action.endX, action.endY);
          ctx.lineTo(action.startX, action.endY);
          ctx.closePath();
          ctx.stroke();
          break;
        }
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(action.startX, action.startY);
          ctx.lineTo(action.endX, action.endY);
          ctx.stroke();
          drawArrowHead(ctx, action.startX, action.startY, action.endX, action.endY, Math.max(10, action.lineWidth * 3));
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(action.startX, action.startY);
          ctx.lineTo(action.endX, action.endY);
          ctx.stroke();
          break;
        case 'text':
          ctx.font = `${action.fontSize || 16}px sans-serif`;
          ctx.fillStyle = action.color;
          ctx.fillText(action.text, action.x, action.y);
          break;
        default: break;
      }
      ctx.restore();
    });
  }, [drawArrowHead]);

  const emitUpdate = useCallback((newActions) => {
    if (socket && roomId) socket.emit('whiteboard_update', { roomId, actions: newActions });
  }, [socket, roomId]);

  useEffect(() => {
    if (socket) {
      const handleRemoteUpdate = (data) => {
        if (data.roomId === roomId && data.actions) { setActions(data.actions); setRedoStack([]); }
      };
      socket.on('whiteboard_update', handleRemoteUpdate);
      return () => socket.off('whiteboard_update', handleRemoteUpdate);
    }
  }, [socket, roomId]);

  useEffect(() => { redrawCanvas(actions); }, [actions, redrawCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
        canvas.width = width;
        canvas.height = height;
        redrawCanvas(actions);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [actions, redrawCanvas]);

  const handlePointerDown = useCallback((e) => {
    if (currentTool === 'stickyNote') return;
    const point = getCanvasPoint(e);
    const state = drawingStateRef.current;
    state.isDrawing = true;
    state.startX = point.x; state.startY = point.y;
    state.lastX = point.x; state.lastY = point.y;
    state.currentPoints = [{ x: point.x, y: point.y }];
    setIsDrawing(true);

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text && text.trim()) {
        const newAction = { id: Date.now(), tool: 'text', color: currentColor, lineWidth, text: text.trim(), x: point.x, y: point.y, fontSize: Math.max(14, lineWidth * 4) };
        const newActions = [...actions, newAction];
        setActions(newActions); setRedoStack([]); emitUpdate(newActions);
      }
      state.isDrawing = false; setIsDrawing(false); return;
    }
    const canvas = canvasRef.current;
    if (canvas) canvas.setPointerCapture(e.pointerId);
  }, [currentTool, currentColor, lineWidth, actions, getCanvasPoint, emitUpdate]);

  const handlePointerMove = useCallback((e) => {
    const state = drawingStateRef.current;
    if (!state.isDrawing) return;
    const point = getCanvasPoint(e);
    state.currentPoints.push({ x: point.x, y: point.y });

    if (['pencil', 'marker', 'eraser'].includes(currentTool)) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
      ctx.lineWidth = currentTool === 'marker' ? lineWidth * 3 : lineWidth;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (currentTool === 'marker') ctx.globalAlpha = 0.4;
      if (currentTool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.moveTo(state.lastX, state.lastY); ctx.lineTo(point.x, point.y); ctx.stroke();
      ctx.restore();
    } else if (['rectangle', 'circle', 'triangle', 'line', 'arrow'].includes(currentTool)) {
      redrawCanvas(actions);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.strokeStyle = currentColor; ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      if (currentTool === 'rectangle') {
        ctx.strokeRect(state.startX, state.startY, point.x - state.startX, point.y - state.startY);
      } else if (currentTool === 'circle') {
        const rx = Math.abs(point.x - state.startX) / 2;
        const ry = Math.abs(point.y - state.startY) / 2;
        const cx = (state.startX + point.x) / 2;
        const cy = (state.startY + point.y) / 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (currentTool === 'triangle') {
        const midX = (state.startX + point.x) / 2;
        ctx.beginPath(); ctx.moveTo(midX, state.startY); ctx.lineTo(point.x, point.y); ctx.lineTo(state.startX, point.y); ctx.closePath(); ctx.stroke();
      } else if (currentTool === 'line') {
        ctx.beginPath(); ctx.moveTo(state.startX, state.startY); ctx.lineTo(point.x, point.y); ctx.stroke();
      } else if (currentTool === 'arrow') {
        ctx.beginPath(); ctx.moveTo(state.startX, state.startY); ctx.lineTo(point.x, point.y); ctx.stroke();
        drawArrowHead(ctx, state.startX, state.startY, point.x, point.y, Math.max(10, lineWidth * 3));
      }
      ctx.restore();
    }
    state.lastX = point.x; state.lastY = point.y;
  }, [currentTool, currentColor, lineWidth, actions, getCanvasPoint, redrawCanvas, drawArrowHead]);

  const handlePointerUp = useCallback((e) => {
    const state = drawingStateRef.current;
    if (!state.isDrawing) return;
    state.isDrawing = false; setIsDrawing(false);
    const point = getCanvasPoint(e);
    let newAction = null;

    if (['pencil', 'marker', 'eraser'].includes(currentTool)) {
      if (state.currentPoints.length > 1) {
        newAction = { id: Date.now(), tool: currentTool, color: currentTool === 'eraser' ? '#000000' : currentColor, lineWidth, points: [...state.currentPoints] };
      }
    } else if (['rectangle', 'circle', 'triangle', 'line', 'arrow'].includes(currentTool)) {
      newAction = { id: Date.now(), tool: currentTool, color: currentColor, lineWidth, startX: state.startX, startY: state.startY, endX: point.x, endY: point.y };
    }

    if (newAction) {
      const newActions = [...actions, newAction];
      setActions(newActions); setRedoStack([]); emitUpdate(newActions);
    }
    state.currentPoints = [];
  }, [currentTool, currentColor, lineWidth, actions, getCanvasPoint, emitUpdate]);

  const handleUndo = useCallback(() => {
    if (actions.length === 0) return;
    const lastAction = actions[actions.length - 1];
    const newActions = actions.slice(0, -1);
    setActions(newActions); setRedoStack((prev) => [...prev, lastAction]); emitUpdate(newActions);
  }, [actions, emitUpdate]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const lastRedo = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newActions = [...actions, lastRedo];
    setActions(newActions); setRedoStack(newRedo); emitUpdate(newActions);
  }, [redoStack, actions, emitUpdate]);

  const handleClear = useCallback(() => {
    if (actions.length === 0 && stickyNotes.length === 0) return;
    if (!window.confirm('Clear the entire whiteboard?')) return;
    setActions([]); setRedoStack([]); setStickyNotes([]); emitUpdate([]);
  }, [actions, stickyNotes, emitUpdate]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#FFFFFF'; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId || 'session'}-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png'); link.click();
  }, [roomId]);

  const handleAddStickyNote = useCallback(() => {
    const note = { id: `sticky-${++stickyIdCounter}`, text: '', x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)] };
    setStickyNotes((prev) => [...prev, note]);
  }, []);

  const handleUpdateStickyNote = useCallback((id, updates) => {
    setStickyNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const handleDeleteStickyNote = useCallback((id) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleDragStickyNote = useCallback((id, e) => {
    e.preventDefault();
    const startX = e.clientX; const startY = e.clientY;
    const note = stickyNotes.find((n) => n.id === id);
    if (!note) return;
    const origX = note.x; const origY = note.y;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX; const dy = moveEvent.clientY - startY;
      setStickyNotes((prev) => prev.map((n) => n.id === id ? { ...n, x: origX + dx, y: origY + dy } : n));
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [stickyNotes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? handleRedo() : handleUndo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const cursorStyle = currentTool === 'eraser' ? 'crosshair' : currentTool === 'text' ? 'text' : currentTool === 'stickyNote' ? 'pointer' : 'crosshair';

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden rounded-lg border border-gray-200">
      <div className="flex flex-col items-center w-12 bg-white border-r border-gray-200 py-2 gap-0.5 shrink-0">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;
          return (
            <motion.button key={tool.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentTool(tool.id); if (tool.id === 'stickyNote') handleAddStickyNote(); }}
              className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${isActive ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              title={tool.label}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <motion.div layoutId="wb-active-tool" className="absolute inset-0 rounded-lg border-2 border-blue-500" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            </motion.button>
          );
        })}
        <div className="w-7 h-px bg-gray-200 my-1.5" />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleUndo} disabled={actions.length === 0} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Undo (Ctrl+Z)"><Undo2 size={16} /></motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleRedo} disabled={redoStack.length === 0} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Redo (Ctrl+Shift+Z)"><Redo2 size={16} /></motion.button>
        <div className="w-7 h-px bg-gray-200 my-1.5" />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleClear} disabled={actions.length === 0 && stickyNotes.length === 0} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Clear Canvas"><Trash2 size={16} /></motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleExport} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all" title="Export as PNG"><Download size={16} /></motion.button>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-white border-b border-gray-200 shrink-0">
          <div className="relative">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-all" title="Pick Color">
              <div className="w-4 h-4 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: currentColor }} />
              <Palette size={12} className="text-gray-500" />
            </motion.button>
            <AnimatePresence>
              {showColorPicker && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="grid grid-cols-8 gap-1.5">
                    {COLORS.map((color) => (
                      <motion.button key={color} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { setCurrentColor(color); setShowColorPicker(false); }}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${currentColor === color ? 'border-blue-500 ring-2 ring-blue-200 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                        style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-gray-500 uppercase">Size</span>
            <input type="range" min={MIN_LINE_WIDTH} max={MAX_LINE_WIDTH} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500" />
            <span className="text-xs font-semibold text-gray-700 w-5 text-center tabular-nums">{lineWidth}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="px-1 py-0.5 bg-gray-100 rounded font-mono">Ctrl+Z</span>Undo
            <span className="mx-0.5">/</span>
            <span className="px-1 py-0.5 bg-gray-100 rounded font-mono">Ctrl+Shift+Z</span>Redo
          </div>
        </div>
        <div ref={containerRef} className="relative flex-1 overflow-hidden bg-white" style={{ cursor: cursorStyle }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} />
          <AnimatePresence>
            {stickyNotes.map((note) => (
              <motion.div key={note.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="absolute group" style={{ left: note.x, top: note.y, zIndex: 10 }}>
                <div className="w-44 min-h-[100px] rounded-lg shadow-md border border-black/10 flex flex-col overflow-hidden" style={{ backgroundColor: note.color }}>
                  <div className="flex items-center justify-between px-2 py-1 cursor-move bg-black/5" onMouseDown={(e) => handleDragStickyNote(note.id, e)}>
                    <GripVertical size={10} className="text-black/30" />
                    <div className="flex items-center gap-0.5">
                      {STICKY_COLORS.slice(0, 6).map((c) => (
                        <button key={c} onClick={(e) => { e.stopPropagation(); handleUpdateStickyNote(note.id, { color: c }); }} className="w-2.5 h-2.5 rounded-full border border-black/20 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteStickyNote(note.id); }} className="ml-0.5 p-0.5 rounded hover:bg-black/10 transition-colors"><X size={8} className="text-black/50" /></button>
                    </div>
                  </div>
                  <textarea value={note.text} onChange={(e) => handleUpdateStickyNote(note.id, { text: e.target.value })} placeholder="Type here..." className="flex-1 px-2 py-1 text-xs bg-transparent resize-none focus:outline-none placeholder-black/30" rows={3} onMouseDown={(e) => e.stopPropagation()} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {showColorPicker && <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />}
    </div>
  );
}
