import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

export default function CountdownTimer({ duration = 25, onComplete, isRunning = true, label = 'Emergency Session' }) {
  const [totalSeconds, setTotalSeconds] = useState(duration * 60);
  const [running, setRunning] = useState(isRunning);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setTotalSeconds(duration * 60);
    setCompleted(false);
    setRunning(isRunning);
  }, [duration, isRunning]);

  useEffect(() => {
    let interval = null;
    if (running && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setRunning(false);
            setCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, totalSeconds, onComplete]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = ((duration * 60 - totalSeconds) / (duration * 60)) * 100;
  const isUrgent = totalSeconds <= 300; // Last 5 minutes
  const isCritical = totalSeconds <= 60; // Last minute

  const reset = () => {
    setTotalSeconds(duration * 60);
    setRunning(false);
    setCompleted(false);
  };

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`card p-6 ${isUrgent && !completed ? 'border-2 border-red-500 dark:border-red-400' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isCritical && !completed ? (
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          ) : (
            <Clock className="w-5 h-5 text-primary-500" />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
        </div>
        <div className="flex items-center gap-2">
          {!completed && (
            <>
              <button
                onClick={() => setRunning(!running)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={running ? 'Pause' : 'Resume'}
              >
                {running ? (
                  <Pause className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={reset}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Circular Progress */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={`transition-all duration-1000 ${
                isCritical
                  ? 'text-red-500'
                  : isUrgent
                  ? 'text-orange-500'
                  : 'text-primary-500'
              }`}
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.span
                key={totalSeconds}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className={`text-3xl font-bold ${
                  isCritical
                    ? 'text-red-500'
                    : isUrgent
                    ? 'text-orange-500'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        {completed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400"
          >
            <Play className="w-4 h-4" />
            <span className="font-medium">Session Complete!</span>
          </motion.div>
        ) : isCritical ? (
          <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Less than 1 minute remaining!</span>
          </div>
        ) : isUrgent ? (
          <div className="flex items-center justify-center gap-2 text-orange-500">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Time running low - wrap up your session</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Session in progress</span>
          </div>
        )}
      </div>

      {/* Linear Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              isCritical
                ? 'bg-red-500'
                : isUrgent
                ? 'bg-orange-500'
                : 'bg-primary-500'
            }`}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{Math.floor(progress)}% elapsed</span>
          <span>{duration} min total</span>
        </div>
      </div>
    </div>
  );
}
