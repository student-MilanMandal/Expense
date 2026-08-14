import React, { useEffect, useRef } from 'react';

/**
 * Ultra-High Performance Animated Counter
 * Uses direct DOM manipulation via RAF ref to eliminate 60-120fps React re-render cycles.
 */
const AnimatedCounter = ({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 0.6,
  className = '',
}) => {
  const spanRef = useRef(null);
  let target = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
  if (isNaN(target)) target = 0;

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    // If user prefers reduced motion, set final value immediately
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const formatted = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toLocaleString('en-IN');
      el.textContent = `${prefix}${formatted}${suffix}`;
      return;
    }

    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOut;

      const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString('en-IN');
      el.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, prefix, suffix, decimals]);

  const initialFormatted = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toLocaleString('en-IN');

  return (
    <span ref={spanRef} className={`tabular-nums ${className}`}>
      {prefix}{initialFormatted}{suffix}
    </span>
  );
};

export default React.memo(AnimatedCounter);
