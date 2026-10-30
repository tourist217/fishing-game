import React from 'react';

interface BoardHeaderProps {
  title: string;
  subtitle?: string;
  titleFontSize?: number;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ title, subtitle, titleFontSize }) => {
  const dynamicFontSize = titleFontSize ?? (title.length > 15 ? 21 : title.length > 12 ? 23 : 25);
  const strokeWidth = dynamicFontSize <= 21 ? 2.3 : 2.6;
  const shadowStrokeWidth = dynamicFontSize <= 21 ? 3.8 : 4.2;

  return (
    <div
      style={{
        position: 'absolute',
        left: '10%',
        right: '10%',
        top: '3.0%',
        height: '9.4%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <svg viewBox="0 0 340 40" style={{ width: '100%', height: '35px', overflow: 'visible' }}>
        <defs>
          <linearGradient id="boardHeaderGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff59d" />
            <stop offset="60%" stopColor="#fbc02d" />
            <stop offset="90%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        {/* 3D фаска/тень */}
        <text
          x="50%"
          y="28"
          textAnchor="middle"
          fill="#2b1407"
          stroke="#2b1407"
          strokeWidth={shadowStrokeWidth}
          strokeLinejoin="round"
          style={{
            fontSize: `${dynamicFontSize}px`,
            fontWeight: 900,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.4px',
            paintOrder: 'stroke fill',
          }}
        >
          {title}
        </text>
        {/* Основной золотой текст с контуром */}
        <text
          x="50%"
          y="26"
          textAnchor="middle"
          fill="url(#boardHeaderGoldGrad)"
          stroke="#3d1b06"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          style={{
            fontSize: `${dynamicFontSize}px`,
            fontWeight: 900,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.4px',
            paintOrder: 'stroke fill',
          }}
        >
          {title}
        </text>
      </svg>
      {subtitle && (
        <div
          style={{
            color: '#fef08a',
            fontSize: 'clamp(10px, 2.3vw, 11.5px)',
            fontWeight: 700,
            marginTop: '-3px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(0, 0, 0, 0.85)',
            letterSpacing: '0.2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
