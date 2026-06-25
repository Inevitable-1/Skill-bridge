import { Link } from 'react-router-dom';

const LOGO_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="sb-grad" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1"/>
        <stop offset="100%" stopColor="#8B5CF6"/>
      </linearGradient>
      <filter id="sb-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
        <feColorMatrix in="blur" type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="sb-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
        <feOffset in="blur" dx="0" dy="1.5" result="offsetBlur"/>
        <feColorMatrix in="offsetBlur" type="matrix"
          values="0 0 0 0 0.39  0 0 0 0 0.4  0 0 0 0 0.95  0 0 0 0.35 0" result="shadow"/>
        <feMerge>
          <feMergeNode in="shadow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M 8 44 C 16 44 20 20 32 20 C 44 20 48 44 56 44"
          stroke="url(#sb-grad)" strokeWidth="2.8" fill="none"
          strokeLinecap="round" filter="url(#sb-shadow)"/>
    <circle cx="8" cy="44" r="5" fill="url(#sb-grad)" filter="url(#sb-glow)"/>
    <circle cx="8" cy="44" r="2.2" fill="white" opacity="0.85"/>
    <circle cx="32" cy="20" r="5" fill="url(#sb-grad)" filter="url(#sb-glow)"/>
    <circle cx="32" cy="20" r="2.2" fill="white" opacity="0.85"/>
    <circle cx="56" cy="44" r="5" fill="url(#sb-grad)" filter="url(#sb-glow)"/>
    <circle cx="56" cy="44" r="2.2" fill="white" opacity="0.85"/>
  </svg>
);

export default function Logo({ size = 'default', linked = true, className = '' }) {
  const sizes = {
    small: { icon: 'w-6 h-6', word: 'text-base' },
    default: { icon: 'w-7 h-7', word: 'text-xl' },
    large: { icon: 'w-10 h-10', word: 'text-2xl' },
    intro: { icon: 'w-14 h-14', word: 'text-3xl' },
  };

  const s = sizes[size] || sizes.default;

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${s.icon} flex-shrink-0`}>
        {LOGO_SVG}
      </div>
      <span className={`${s.word} font-bold text-gray-900 dark:text-white tracking-tight`}>
        Skill<span className="text-primary-600">Bridge</span>
      </span>
    </div>
  );

  if (linked) {
    return <Link to="/">{content}</Link>;
  }

  return content;
}

export function LogoIcon({ className = '' }) {
  return (
    <div className={`w-8 h-8 flex-shrink-0 ${className}`}>
      {LOGO_SVG}
    </div>
  );
}
