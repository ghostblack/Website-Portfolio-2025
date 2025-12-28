
import React from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from './MagneticButton';

interface NavbarProps {
  onHover?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onHover }) => {
  const navItems = ['Home', 'About', 'Works'];

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-20 py-8 md:py-12 flex justify-between items-center pointer-events-none"
    >
      <div className="flex items-center gap-4 flex-1 pointer-events-auto">
        <MagneticButton onMouseEnter={onHover}>
          <motion.div 
            layoutId="logo-ae"
            className="text-xl md:text-2xl font-bold tracking-tight text-[#101010]"
            transition={{ 
              duration: 1.2, 
              ease: [0.76, 0, 0.24, 1],
              layout: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
            }}
          >
            AE.
          </motion.div>
        </MagneticButton>
        
        <div className="hidden lg:flex flex-1 mx-16 items-center">
          <div className="h-[1px] bg-[#2c2c2c] flex-1 relative opacity-20">
            <div className="absolute left-0 -top-[2px] w-[5px] h-[5px] bg-[#2c2c2c] rounded-full"></div>
            <div className="absolute right-0 -top-[2px] w-[5px] h-[5px] bg-[#2c2c2c] rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 sm:gap-8 md:gap-12 pointer-events-auto">
        {navItems.map((item) => (
          <MagneticButton key={item} onMouseEnter={onHover}>
            <motion.div 
              className="relative overflow-hidden cursor-pointer"
              initial="initial"
              whileHover="hovered"
            >
              <motion.span
                variants={{
                  initial: { y: 0, opacity: 1 },
                  hovered: { y: "-110%", opacity: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="block text-base md:text-lg font-medium text-[#2c2c2c]"
              >
                {item}
              </motion.span>
              <motion.span
                variants={{
                  initial: { y: "110%", opacity: 0 },
                  hovered: { y: 0, opacity: 1 },
                }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="absolute inset-0 block text-base md:text-lg font-medium text-[#101010]"
              >
                {item}
              </motion.span>
            </motion.div>
          </MagneticButton>
        ))}
      </div>
    </motion.nav>
  );
};
