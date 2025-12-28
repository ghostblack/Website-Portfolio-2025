
import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const Dot = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // High-performance spring for organic movement
  const x = useSpring(0, { stiffness: 180, damping: 25 });
  const y = useSpring(0, { stiffness: 180, damping: 25 });
  const scale = useSpring(1, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const handleUpdate = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mouseX.get() - centerX;
      const dy = mouseY.get() - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const radius = 100; // Slightly smaller interaction radius for subtler effect

      if (distance < radius) {
        // Calculate repel force
        const force = (radius - distance) / radius;
        const repelX = (dx / distance) * -30 * force;
        const repelY = (dy / distance) * -30 * force;
        
        x.set(repelX);
        y.set(repelY);
        scale.set(1 - (0.3 * force)); 
      } else {
        x.set(0);
        y.set(0);
        scale.set(1);
      }
    };

    const unsubscribeX = mouseX.on("change", handleUpdate);
    const unsubscribeY = mouseY.on("change", handleUpdate);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, x, y, scale]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <motion.div
        ref={ref}
        style={{ x, y, scale }}
        className="w-[2px] h-[2px] bg-[#101010] rounded-full opacity-40"
      />
    </div>
  );
};

export const BackgroundDots: React.FC = () => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [gridSize, setGridSize] = useState({ cols: 28, rows: 16 });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Fewer dots on mobile to increase spacing and prevent "line" look
        setGridSize({ cols: 12, rows: 22 });
      } else {
        setGridSize({ cols: 28, rows: 16 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [mouseX, mouseY]);

  const dotsCount = gridSize.cols * gridSize.rows;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <div 
        className="grid w-full h-full opacity-[0.12] px-6 py-10 md:px-10 md:py-10"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
        }}
      >
        {Array.from({ length: dotsCount }).map((_, i) => (
          <Dot key={i} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>
    </div>
  );
};
