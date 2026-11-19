import React, { useCallback, useEffect, useRef, useState } from 'react';

const CAT_WIDTH = 112;
const WALK_SPEED = 70; // px per second
const MIN_WALK = 140;

// Idle behaviours the cat picks between walks, with weights and duration ranges (ms).
const IDLE_ACTIONS = [
  { name: 'sit', weight: 3, min: 3000, max: 6000 },
  { name: 'groom', weight: 2, min: 3500, max: 5500 },
  { name: 'sleep', weight: 2, min: 7000, max: 12000 },
  { name: 'stretch', weight: 2, min: 2400, max: 2400 },
];

const COLORS = {
  fur: '#FB923C',
  furShade: '#EA7A2A',
  stripe: '#C2410C',
  ear: '#F9A8D4',
  nose: '#F472B6',
};

const randomBetween = (min, max) => min + Math.random() * (max - min);

const pickIdleAction = () => {
  const total = IDLE_ACTIONS.reduce((sum, a) => sum + a.weight, 0);
  let roll = Math.random() * total;
  for (const action of IDLE_ACTIONS) {
    roll -= action.weight;
    if (roll <= 0) return action;
  }
  return IDLE_ACTIONS[0];
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const trackWidth = () => Math.max(window.innerWidth - CAT_WIDTH - 16, 0);

const Head = ({ x, y, sleeping = false }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className="cat-head">
    {/* Ears */}
    <path d="M-13 -9 L-10 -27 L0 -15 Z" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M2 -15 L12 -27 L14 -8 Z" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M-10 -12 L-9 -21 L-4 -15 Z" fill={COLORS.ear} />
    <path d="M5 -15 L10 -21 L11 -12 Z" fill={COLORS.ear} />
    {/* Face */}
    <circle r="16" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
    <path d="M-4 -15 Q-2 -9 -4 -5 M1 -16 Q2 -10 1 -6" stroke={COLORS.stripe} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="10" cy="7" r="3.5" fill={COLORS.ear} opacity="0.8" />
    {sleeping ? (
      <path d="M2 0 Q6 4 10 0" stroke="#111" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    ) : (
      <g className="cat-eye">
        <ellipse cx="7" cy="-1" rx="2.6" ry="3.6" fill="#111" />
        <circle cx="8" cy="-2.4" r="0.9" fill="#fff" />
      </g>
    )}
    <path d="M15 3 L18.5 1.5 L17.5 5 Z" fill={COLORS.nose} stroke="#111" strokeWidth="1" strokeLinejoin="round" />
    <path d="M17 6 Q15 9 12 8" stroke="#111" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M14 7 L28 4 M14 9 L28 10" stroke="#111" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </g>
  </g>
);

const StandingCat = ({ stretching }) => (
  <g className={stretching ? 'cat-stretch' : 'cat-walk'}>
    {/* Tail */}
    <g className="cat-tail">
      <path d="M34 46 C18 44 12 30 18 14" stroke="currentColor" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M34 46 C18 44 12 30 18 14" stroke={COLORS.fur} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
    {/* Far legs */}
    <rect className="cat-leg cat-leg-b" x="40" y="54" width="10" height="30" rx="5" fill={COLORS.furShade} stroke="currentColor" strokeWidth="3" />
    <rect className="cat-leg cat-leg-a" x="84" y="54" width="10" height="30" rx="5" fill={COLORS.furShade} stroke="currentColor" strokeWidth="3" />
    {/* Body */}
    <g className="cat-body">
      <ellipse cx="66" cy="50" rx="35" ry="17" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
      <path d="M52 35 Q55 44 51 52 M64 33 Q67 43 63 51 M76 34 Q79 43 75 50" stroke={COLORS.stripe} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
    {/* Near legs */}
    <rect className="cat-leg cat-leg-a" x="48" y="56" width="10" height="29" rx="5" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
    <rect className="cat-leg cat-leg-b" x="91" y="56" width="10" height="29" rx="5" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
    <Head x={104} y={34} />
  </g>
);

const SittingCat = ({ grooming }) => (
  <g className={grooming ? 'cat-groom' : 'cat-sit'}>
    <g className="cat-tail-curl">
      <path d="M46 82 C26 86 16 76 26 66" stroke="currentColor" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M46 82 C26 86 16 76 26 66" stroke={COLORS.fur} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
    <path
      d="M48 84 C38 84 38 60 50 47 C60 36 82 38 88 52 C92 64 90 84 78 84 Z"
      fill={COLORS.fur}
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M58 46 Q62 54 58 60 M70 44 Q74 52 70 58" stroke={COLORS.stripe} strokeWidth="3" strokeLinecap="round" fill="none" />
    <ellipse cx="58" cy="72" rx="15" ry="13" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
    <rect x="78" y="58" width="10" height="27" rx="5" fill={COLORS.furShade} stroke="currentColor" strokeWidth="3" />
    <rect className="cat-paw" x="84" y="58" width="10" height="27" rx="5" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
    <Head x={86} y={32} />
  </g>
);

const SleepingCat = () => (
  <g className="cat-sleep">
    <g className="cat-breathe">
      <ellipse cx="64" cy="70" rx="38" ry="15" fill={COLORS.fur} stroke="currentColor" strokeWidth="3" />
      <path d="M48 57 Q51 65 47 72 M62 56 Q65 64 61 71 M76 57 Q79 65 75 71" stroke={COLORS.stripe} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
    <path d="M28 72 C26 90 92 92 104 82" stroke="currentColor" strokeWidth="13" strokeLinecap="round" fill="none" />
    <path d="M28 72 C26 90 92 92 104 82" stroke={COLORS.fur} strokeWidth="7" strokeLinecap="round" fill="none" />
    <Head x={98} y={66} sleeping />
  </g>
);

const WalkingCat = () => {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [x, setX] = useState(() => (reducedMotion ? trackWidth() : Math.random() * trackWidth()));
  const [direction, setDirection] = useState(1);
  const [action, setAction] = useState('sit');
  const [walkDuration, setWalkDuration] = useState(0);
  const [bubble, setBubble] = useState(null);
  const [jumping, setJumping] = useState(false);
  const xRef = useRef(x);
  const bubbleTimer = useRef(null);

  const walkSomewhere = useCallback(() => {
    const width = trackWidth();
    if (width < MIN_WALK) {
      setAction('sit');
      return;
    }
    let target = Math.random() * width;
    if (Math.abs(target - xRef.current) < MIN_WALK) {
      target = xRef.current > width / 2 ? xRef.current - MIN_WALK : xRef.current + MIN_WALK;
    }
    target = Math.min(Math.max(target, 0), width);
    if (Math.abs(target - xRef.current) < 1) {
      setAction(pickIdleAction().name);
      return;
    }
    setDirection(target >= xRef.current ? 1 : -1);
    setWalkDuration(Math.abs(target - xRef.current) / WALK_SPEED);
    xRef.current = target;
    setX(target);
    setAction('walk');
  }, []);

  // After each idle behaviour finishes, wander to a new spot.
  useEffect(() => {
    if (reducedMotion || action === 'walk') return undefined;
    const config = IDLE_ACTIONS.find((a) => a.name === action) ?? IDLE_ACTIONS[0];
    const timer = setTimeout(walkSomewhere, randomBetween(config.min, config.max));
    return () => clearTimeout(timer);
  }, [action, reducedMotion, walkSomewhere]);

  // Keep the cat on screen when the viewport shrinks.
  useEffect(() => {
    const onResize = () => {
      const width = trackWidth();
      if (xRef.current > width) {
        xRef.current = width;
        setWalkDuration(0);
        setX(width);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => () => clearTimeout(bubbleTimer.current), []);

  const handleArrived = (event) => {
    if (event.target !== event.currentTarget || action !== 'walk') return;
    setAction(pickIdleAction().name);
  };

  const handlePet = () => {
    const wasSleeping = action === 'sleep';
    setBubble(wasSleeping ? '!?' : ['meow!', 'mrrp?', 'purr~', 'nya!'][Math.floor(Math.random() * 4)]);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 1600);
    if (!reducedMotion) setJumping(true);
    if (wasSleeping) setAction('sit');
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-0 z-40 pointer-events-none print:hidden">
      <div
        className="absolute bottom-0 left-2"
        style={{
          transform: `translateX(${x}px)`,
          transition: action === 'walk' ? `transform ${walkDuration}s linear` : 'none',
        }}
        onTransitionEnd={handleArrived}
      >
        {bubble && (
          <span className="cat-bubble absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black brutal-border brutal-shadow-sm px-3 py-1 text-sm font-black uppercase">
            {bubble}
          </span>
        )}
        {action === 'sleep' && !bubble && (
          <span className="cat-zzz absolute -top-4 right-0 font-black text-black dark:text-white" aria-hidden="true">
            <span>z</span><span>z</span><span>Z</span>
          </span>
        )}
        <button
          type="button"
          onClick={handlePet}
          aria-label="Pet the cat"
          className={`pointer-events-auto block cursor-pointer text-black dark:text-white focus-visible:outline-[3px] focus-visible:outline-primary ${jumping ? 'cat-jump' : ''}`}
          onAnimationEnd={(e) => e.animationName === 'cat-jump' && setJumping(false)}
        >
          <svg
            viewBox="0 0 140 90"
            width={CAT_WIDTH}
            height={CAT_WIDTH * (90 / 140)}
            className="overflow-visible"
            style={{ transform: `scaleX(${direction})` }}
          >
            {action === 'walk' && <StandingCat />}
            {action === 'stretch' && <StandingCat stretching />}
            {(action === 'sit' || action === 'groom') && <SittingCat grooming={action === 'groom'} />}
            {action === 'sleep' && <SleepingCat />}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WalkingCat;
