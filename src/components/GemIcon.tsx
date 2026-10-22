import React from 'react';

interface GemIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const GemIcon: React.FC<GemIconProps> = ({ size = 16, className, style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        filter: 'drop-shadow(0 1px 3px rgba(14, 165, 233, 0.5))',
        ...style,
      }}
    >
      <defs>
        <linearGradient id="gemGradTop" x1="6" y1="3" x2="18" y2="9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bae6fd" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="gemGradCenter" x1="12" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="gemGradLeft" x1="2" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="gemGradRight" x1="22" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* Верхняя площадка (table) */}
      <polygon points="6,3 18,3 15,9 9,9" fill="#e0f2fe" opacity="0.95" />

      {/* Верхняя левая грань */}
      <polygon points="6,3 9,9 2,9" fill="url(#gemGradTop)" />

      {/* Верхняя правая грань */}
      <polygon points="18,3 22,9 15,9" fill="#38bdf8" />

      {/* Центральный нижний павильон */}
      <polygon points="9,9 15,9 12,21" fill="url(#gemGradCenter)" />

      {/* Левый нижний павильон */}
      <polygon points="2,9 9,9 12,21" fill="url(#gemGradLeft)" />

      {/* Правый нижний павильон */}
      <polygon points="15,9 22,9 12,21" fill="url(#gemGradRight)" />

      {/* Белый искрящийся блик на грани */}
      <polygon points="8,4 11,4 10,7 7,7" fill="#ffffff" opacity="0.9" />
    </svg>
  );
};
