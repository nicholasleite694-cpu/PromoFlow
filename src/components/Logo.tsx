import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export default function Logo({ className = '', size = '100%', strokeWidth = 14 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={size}
      height={size}
      className={`text-white fill-none stroke-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      id="promo_flow_logo"
    >
      {/* Outer rounded rectangle container (Squircle visual) */}
      <rect
        x="60"
        y="60"
        width="480"
        height="480"
        rx="124"
        ry="124"
        className="stroke-current"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Internal interactive waveform terminating in an energetic scale arrow */}
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <path
          d="M 140 300 H 205 L 235 250 L 265 355 L 310 170 L 360 410 L 432 254"
          className="stroke-current"
        />
        {/* Solid elegant arrowhead pointing up and right at ~63.4 degrees */}
        <polygon
          points="464,196 397,238 449,282"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={strokeWidth / 2}
        />
      </g>
    </svg>
  );
}
