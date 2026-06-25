import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleCanvas from './ParticleCanvas';
import Logo from '../ui/Logo';
import { useTheme } from '../../hooks/useTheme';

const SYMBOLS = [
  '{ }', '< >', '</ >', '( )', '[ ]', 'const', 'function()',
  'class', 'SELECT *', 'AI', 'ML', 'Git', 'React', 'Node',
  'Java', 'Python', 'SQL', 'CSS', 'HTML', 'API',
];

const TAGLINE_WORDS = ['Build Skills.', 'Connect with Experts.', 'Grow Your Career.'];

function SymbolItem({ symbol, index, phase }) {
  const angle = (index / SYMBOLS.length) * Math.PI * 2;
  const orbitRadius = 200 + (index % 3) * 40;
  const startX = Math.cos(angle) * orbitRadius;
  const startY = Math.sin(angle) * orbitRadius;

  const variants = {
    hidden: {
      opacity: 0,
      x: startX * 2.5,
      y: startY * 2.5,
      scale: 0.3,
      rotate: (index % 2 === 0 ? 1 : -1) * 30,
    },
    visible: {
      opacity: 0.7,
      x: startX,
      y: startY,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    converge: {
      opacity: 0,
      x: 0,
      y: 0,
      scale: 0,
      rotate: (index % 2 === 0 ? 1 : -1) * 180,
      transition: {
        duration: 1.0,
        delay: index * 0.03,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className="absolute font-mono font-bold pointer-events-none select-none"
      style={{
        left: '50%',
        top: '50%',
        color: '#818CF8',
        fontSize: `${13 + (index % 4) * 2}px`,
        textShadow: '0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.2)',
      }}
      variants={variants}
      initial="hidden"
      animate={phase === 'symbols' ? 'visible' : phase === 'converge' ? 'converge' : 'hidden'}
    >
      {symbol}
    </motion.div>
  );
}

export default function IntroAnimation() {
  useTheme();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('black');
  const [particlePhase, setParticlePhase] = useState('idle');
  const [convergeProgress, setConvergeProgress] = useState(0);
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [showEnergyWave, setShowEnergyWave] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => timersRef.current.forEach(clearTimeout);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Scene 1: Black → blue glow + particles
      await new Promise(r => { timersRef.current.push(setTimeout(r, 200)); });
      if (cancelled) return;
      setPhase('glow');
      setParticlePhase('float');

      // Scene 2: Programming symbols orbit into view
      await new Promise(r => { timersRef.current.push(setTimeout(r, 1000)); });
      if (cancelled) return;
      setPhase('symbols');

      // Scene 3: Symbols converge to center + particles converge
      await new Promise(r => { timersRef.current.push(setTimeout(r, 1800)); });
      if (cancelled) return;
      setPhase('converge');
      setParticlePhase('converge');

      const convergeDuration = 1200;
      const convergeStart = Date.now();
      const ci = setInterval(() => {
        if (cancelled) { clearInterval(ci); return; }
        const p = Math.min((Date.now() - convergeStart) / convergeDuration, 1);
        setConvergeProgress(p);
        if (p >= 1) clearInterval(ci);
      }, 16);

      await new Promise(r => { timersRef.current.push(setTimeout(r, convergeDuration)); });
      if (cancelled) return;

      // Scene 4: Logo appears with premium reveal
      setShowLogo(true);
      setParticlePhase('idle');

      // Scene 5: Tagline words appear
      await new Promise(r => { timersRef.current.push(setTimeout(r, 800)); });
      if (cancelled) return;
      setShowWords(true);

      // Scene 6: Energy wave + particle explosion
      await new Promise(r => { timersRef.current.push(setTimeout(r, 1500)); });
      if (cancelled) return;
      setParticlePhase('explode');
      setShowEnergyWave(true);

      const explodeDuration = 1000;
      const explodeStart = Date.now();
      const ei = setInterval(() => {
        if (cancelled) { clearInterval(ei); return; }
        const p = Math.min((Date.now() - explodeStart) / explodeDuration, 1);
        setExplodeProgress(p);
        if (p >= 1) clearInterval(ei);
      }, 16);

      await new Promise(r => { timersRef.current.push(setTimeout(r, explodeDuration)); });
      if (cancelled) return;

      // Scene 7: Hold, then fade out
      await new Promise(r => { timersRef.current.push(setTimeout(r, 400)); });
      if (cancelled) return;
      setFadeOut(true);

      await new Promise(r => { timersRef.current.push(setTimeout(r, 800)); });
      if (cancelled) return;
      setDone(true);
      navigate('/landing', { replace: true });
    };

    run();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: '#090B14' }}>
      {/* Particle canvas */}
      <ParticleCanvas phase={particlePhase} progress={convergeProgress || explodeProgress} />

      {/* Central glow — grows during converge */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '50%', top: '50%',
          width: '600px', height: '600px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: phase === 'black' ? 0 : 1,
          scale: phase === 'converge' ? 1.5 : 1,
        }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Floating symbols */}
      <AnimatePresence>
        {(phase === 'symbols' || phase === 'converge') && (
          <div className="absolute inset-0 flex items-center justify-center">
            {SYMBOLS.map((s, i) => (
              <SymbolItem key={s} symbol={s} index={i} phase={phase} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Logo + Tagline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Glow behind logo */}
              <div className="relative mb-6 flex justify-center">
                <div className="absolute inset-0 rounded-2xl" style={{
                  background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0.1) 40%, transparent 70%)',
                  filter: 'blur(25px)',
                  transform: 'scale(3)',
                }} />
                <div className="relative">
                  <Logo size="intro" linked={false} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <div className="mt-2 flex flex-col items-center gap-1">
          {TAGLINE_WORDS.map((word, i) => (
            <AnimatePresence key={word}>
              {showWords && (
                <motion.span
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-sm md:text-base font-light tracking-[0.25em] uppercase"
                  style={{ color: 'rgba(165,168,176,0.85)' }}
                >
                  {word}
                </motion.span>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Energy wave */}
      <AnimatePresence>
        {showEnergyWave && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              border: '2px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 60px rgba(99,102,241,0.15), inset 0 0 60px rgba(99,102,241,0.05)',
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: '250vmax', height: '250vmax', opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Fade out → dark overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: '#090B14' }}
        animate={{ opacity: fadeOut ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />

      {/* Skip button */}
      <button
        onClick={() => {
          clearTimers();
          setDone(true);
          navigate('/landing', { replace: true });
        }}
        className="fixed top-5 right-5 z-[10000] px-5 py-2 rounded-full
          bg-white/[0.06] backdrop-blur-md border border-white/[0.12]
          text-white/50 text-sm font-medium
          hover:bg-white/[0.12] hover:text-white/90 transition-all duration-300"
      >
        Skip →
      </button>
    </div>
  );
}
