import React, { useEffect, useState } from 'react';

const AnimatedCounter = ({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 0.8, // 0.8s smooth rolling count-up animation matching Analytics
  className = '',
}) => {
  let target = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
  if (isNaN(target)) target = 0;

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

      // Smooth fast cubic ease-out for realistic rolling count up from 0
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  const formattedNumber = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span className={className}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
