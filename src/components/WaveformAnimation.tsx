import React from 'react';
import { motion } from 'motion/react';

export default function WaveformAnimation({ active = true, speed = 1.2, heightClass = 'h-12' }) {
  const bars = Array.from({ length: 15 });

  return (
    <div className={`flex items-center justify-center gap-[3px] ${heightClass}`} id="waveform_container">
      {bars.map((_, i) => {
        // Different random heights for a natural audio/sound look
        const baseHeight = [10, 40, 20, 80, 50, 90, 30, 70, 45, 85, 25, 60, 15, 50, 20][i % 15];
        return (
          <motion.div
            key={i}
            id={`waveform_bar_${i}`}
            className="w-[3px] rounded-full bg-linear-to-t from-zinc-600 via-zinc-200 to-white"
            initial={{ height: `${baseHeight}%` }}
            animate={
              active
                ? {
                    height: [
                      `${baseHeight}%`,
                      `${Math.min(100, baseHeight * 1.5)}%`,
                      `${Math.max(15, baseHeight * 0.4)}%`,
                      `${baseHeight}%`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: speed + (i % 5) * 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}
