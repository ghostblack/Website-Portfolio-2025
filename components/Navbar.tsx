
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import { MagneticButton } from './MagneticButton';
import { X } from 'lucide-react';

interface NavbarProps {
  onHover?: () => void;
  isDark: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onHover, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const headerY = useTransform(scrollY, [0, 100], [0, -15]);

  const burgerOpacity = useTransform(scrollY, [150, 250], [0, 1]);
  const burgerScale = useTransform(scrollY, [150, 250], [0.8, 1]);

  const navItems = ['Home', 'About', 'Works', 'Lab', 'Contact'];

  const menuVariants: Variants = {
    closed: { x: "100%", transition: { duration: 0.6, ease: [0.2, 0, 0, 1] } },
    open: { x: "0%", transition: { duration: 0.6, ease: [0.2, 0, 0, 1] } }
  };

  return (
    <>
      <motion.nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-20 py-6 md:py-10 flex items-center justify-between pointer-events-none">
        
        {/* DESKTOP HEADER */}
        <motion.div 
          style={{ opacity: headerOpacity, y: headerY }}
          className="flex items-center justify-between w-full pointer-events-auto"
        >
          <MagneticButton onMouseEnter={onHover}>
            <motion.div 
              layoutId="ae-logo" 
              className="text-2xl font-bold tracking-tighter"
            >
              AE.
            </motion.div>
          </MagneticButton>

          <div className="flex-1 mx-16 h-[1px] bg-current opacity-10 hidden md:block" />

          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-10">
              {['Home', 'About', 'Works'].map((item) => (
                <button key={item} className="text-sm font-medium tracking-tight hover:opacity-50 transition-opacity">
                  {item}
                </button>
              ))}
            </div>
            <MagneticButton onClick={() => setIsOpen(true)} onMouseEnter={onHover}>
              <div className={`w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2 rounded-full border border-current/20 flex items-center justify-center md:gap-3 bg-current/5 backdrop-blur-sm hover:bg-current/10 transition-all`}>
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Menu</span>
                <div className="flex flex-col gap-1 w-4">
                  <div className="h-[1.5px] w-full bg-current" />
                  <div className="h-[1.5px] w-full bg-current" />
                </div>
              </div>
            </MagneticButton>
          </div>
        </motion.div>

        {/* COMPACT BURGER (SCROLL) */}
        <motion.div 
          style={{ opacity: burgerOpacity, scale: burgerScale }}
          className="absolute right-6 md:right-20 pointer-events-auto"
        >
          <MagneticButton onMouseEnter={onHover} onClick={() => setIsOpen(true)}>
            <div className={`w-14 h-14 md:w-auto md:px-6 md:py-3 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center md:gap-4 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Menu</span>
              <div className="flex flex-col gap-1.5 w-5">
                <div className="h-[1.2px] w-full bg-current" />
                <div className="h-[1.2px] w-full bg-current" />
              </div>
            </div>
          </MagneticButton>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
            <motion.div variants={menuVariants} initial="closed" animate="open" exit="closed" className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-[#0a0a0a] text-white z-[160] p-12 flex flex-col justify-center shadow-2xl">
              <button onClick={() => setIsOpen(false)} className="absolute top-12 right-12 opacity-50 hover:opacity-100 transition-opacity"><X size={32} /></button>
              <div className="space-y-6">
                {navItems.map((item, i) => (
                  <motion.div 
                    key={item} 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 * i }}
                  >
                    <a href="#" className="text-5xl font-bold hover:opacity-50 transition-opacity tracking-tighter">{item}</a>
                  </motion.div>
                ))}
              </div>
              <div className="mt-20 pt-10 border-t border-white/10 flex gap-6 text-sm opacity-40">
                 <a href="#" className="hover:opacity-100 transition-opacity">LinkedIn</a>
                 <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
                 <a href="#" className="hover:opacity-100 transition-opacity">Email</a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
