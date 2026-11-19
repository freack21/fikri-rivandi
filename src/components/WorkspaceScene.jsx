import React, { useEffect, useRef, useState } from 'react';

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

// Mounts the three.js workspace illustration. three is loaded lazily so it stays out of the main bundle.
const WorkspaceScene = ({ className = '' }) => {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    if (!supportsWebGL()) {
      setStatus('unsupported');
      return undefined;
    }

    let workspace = null;
    let observer = null;
    let cancelled = false;
    let inView = false;

    const syncActive = () => workspace?.setActive(inView && document.visibilityState === 'visible');

    import('../three/workspace.js')
      .then(({ createWorkspace }) => {
        if (cancelled) return;
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        workspace = createWorkspace(container, { reducedMotion });
        setStatus('ready');
        observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          syncActive();
        });
        observer.observe(container);
      })
      .catch(() => {
        if (!cancelled) setStatus('unsupported');
      });

    document.addEventListener('visibilitychange', syncActive);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', syncActive);
      observer?.disconnect();
      workspace?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="3D illustration of a developer desk: a laptop showing code, a monitor previewing the website in development, and a phone on a stand"
    >
      {status === 'loading' && (
        <span className="absolute inset-0 flex items-center justify-center font-black uppercase tracking-widest text-sm text-black">
          Booting workspace…
        </span>
      )}
      {status === 'unsupported' && (
        <span className="absolute inset-0 flex items-center justify-center p-6 text-center font-black uppercase text-black">
          My desk: laptop full of code, monitor with the web, phone for testing.
        </span>
      )}
    </div>
  );
};

export default WorkspaceScene;
