
import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundDots: React.FC = () => {
  const dots = Array.from({ length: 600 });

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto flex items-center justify-center p-10 md:p-20 overflow-hidden">
      <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))] gap-x-12 gap-y-10 w-full h-full max-w-[1400px]">
        {dots.map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <motion.div
              className="w-[1.5px] h-[1.5px] bg-[#2c2c2c] rounded-full transition-all duration-300 ease-out hover:bg-[#101010] hover:scale-[3] cursor-crosshair"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              transition={{ delay: i * 0.0005, duration: 0.8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};