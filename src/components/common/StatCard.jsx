import React, { memo } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { colorVariants, iconBgVariants, badgeVariants } from '../../data/data';

const StatCard = memo(({
  title = '',
  value = 0,
  subtitle = '',
  icon: Icon = null,
  color = 'indigo',
  currency = '₹',
  badge = null,
}) => {
  const cardStyle = colorVariants[color] || colorVariants.indigo;
  const iconStyle = iconBgVariants[color] || iconBgVariants.indigo;
  const badgeStyle = badgeVariants[color] || badgeVariants.default;

  const isNumeric = typeof value === 'number' && !Number.isNaN(value);
  const numValue = isNumeric ? value : 0;
  const isNegative = numValue < 0;

  return (
    <div
      aria-label={title || 'Statistic Card'}
      className={`relative overflow-hidden rounded-3xl p-5 ${cardStyle} border shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[118px]`}
    >
      <div className="flex items-start justify-between gap-3 h-full">
        {/* Left Column: Title, Main Value, Subtitle */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate whitespace-nowrap">
            {title}
          </p>

          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 truncate">
            {isNumeric ? (
              <AnimatedCounter
                value={Math.abs(numValue)}
                prefix={isNegative ? `-${currency}` : currency}
                duration={0.8}
              />
            ) : (
              value
            )}
          </h3>

          {subtitle && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate whitespace-nowrap">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Column: Badge (above icon) & Action Icon */}
        <div className="flex flex-col items-end justify-between shrink-0 self-stretch min-h-[70px]">
          {badge ? (
            <span className={`px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-full border ${badgeStyle} shadow-xs`}>
              {badge}
            </span>
          ) : (
            <div className="h-4" />
          )}

          {Icon && (
            <div className={`p-3 rounded-2xl ${iconStyle} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
