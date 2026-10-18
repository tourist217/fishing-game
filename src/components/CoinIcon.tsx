import React from 'react';

interface CoinIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ size = 16, className, style }) => {
  return (
    <img
      src="/assets/icons/coin.png"
      alt="монета"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4))',
        flexShrink: 0,
        ...style,
      }}
    />
  );
};
