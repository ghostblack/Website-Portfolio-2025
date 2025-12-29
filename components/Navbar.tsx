
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants, useScroll, useTransform, MotionValue } from 'framer-motion';
import { MagneticButton } from './MagneticButton.tsx';
import { X } from 'lucide-react';

interface NavbarProps {
  onHover?: () => void;
  aboutProgress?: MotionValue<number>;
}

export const Navbar: React.FC<NavbarProps> = ({ onHover, aboutProgress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // Fade out main header
  const headerOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const headerY = useTransform(scrollY, [0, 150], [0, -20]);
  const headerPointerEvents = useTransform(scrollY, [0, 150], ["auto", "none"] as any);

  // Fade in minimized burger
  const burgerOpacity = useTransform(scrollY, [150, 300], [0, 1]);
  const burgerScale = useTransform(scrollY, [150, 300], [0.8, 1]);
  const burgerPointerEvents = useTransform(scrollY, [0, 200], ["none", "auto"] as any);

  // --- REFINED COLOR TRANSITIONS for BURGER ---
  const flipRange = [0.38, 0.48];
  
  const defaultProgress = useScroll().scrollYProgress;
  const targetProgress = aboutProgress || defaultProgress;

  const burgerBg = useTransform(targetProgress, flipRange, ["rgba(255, 255, 255, 0.85)", "rgba(20, 20, 20, 0.85)"]);
  const burgerText = useTransform(targetProgress, flipRange, ["#101010", "#ffffff"]);
  const burgerBorder = useTransform(targetProgress, flipRange, ["rgba(0,0,0,0.05)", "rgba(255,255,255,0.1)"]);

  const navItems = ['Home', 'About', 'Works', 'Lab', 'Contact'];

  const menuVariants: Variants = {
    closed: { x: "100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
    open: { x: "0%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
  };

  const itemVariants: Variants = {
    closed: { y: 80, opacity: 0 },
    open: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.3 + (i * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <>
      <motion.nav className="fixed top-0 left-0 right-0 z-[100] px-6 sm:px-10 md:px-20 py-8 md:py-12 flex items-center justify-between pointer-events-none">
        
        {/* MAIN HEADER */}
        <motion.div 
          style={{ opacity: headerOpacity, y: headerY, pointerEvents: headerPointerEvents }}
          className="flex items-center justify-between w-full text-current"
        >
          <div className="pointer-events-auto">
            <MagneticButton onMouseEnter={onHover}>
              <motion.div 
                layoutId="logo-ae"
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                className="text-xl md:text-2xl font-bold tracking-tight text-current"
              >
                AE.
              </motion.div>
            </MagneticButton>
          </div>

          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.2, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="flex-1 mx-8 md:mx-16 flex items-center gap-0 hidden sm:flex origin-center text-current"
          >
             <div className="w-1 h-1 bg-current rotate-45" />
             <div className="flex-1 h-[1px] bg-current" />
             <div className="w-1 h-1 bg-current rotate-45" />
          </motion.div>

          <div className="flex items-center gap-10 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="hidden lg:flex items-center gap-10"
            >
              {['Home', 'About', 'Works'].map((item) => (
                <MagneticButton key={item} onMouseEnter={onHover}>
                  <span className="text-sm font-medium tracking-tight text-current hover:opacity-50 transition-opacity">
                    {item}
                  </span>
                </MagneticButton>
              ))}
            </motion.div>

            <motion.div className="lg:hidden">
              <MagneticButton onClick={() => setIsOpen(true)} onMouseEnter={onHover}>
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-black/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-current">Menu</span>
                  <div className="flex flex-col gap-1 w-4">
                    <div className="h-[1.5px] w-full bg-current" />
                    <div className="h-[1.5px] w-2/3 bg-current ml-auto" />
                  </div>
                </div>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        {/* MINIMIZED BURGER */}
        <motion.div 
          style={{ opacity: burgerOpacity, scale: burgerScale, pointerEvents: burgerPointerEvents }}
          className="absolute right-6 sm:right-10 md:right-20 pointer-events-auto"
        >
          <MagneticButton onMouseEnter={onHover} onClick={() => setIsOpen(true)}>
            <motion.div 
              style={{ backgroundColor: burgerBg, color: burgerText, borderColor: burgerBorder }}
              className="flex items-center gap-4 backdrop-blur-xl px-6 py-3.5 rounded-full border transition-all shadow-xl group"
            >
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">Menu</span>
              <div className="flex flex-col gap-1.5 w-5">
                <div className="h-[1.5px] w-full bg-current rounded-full origin-right transition-transform group-hover:scale-x-75" />
                <div className="h-[1.5px] w-full bg-current rounded-full" />
              </div>
            </motion.div>
          </MagneticButton>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)} 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" 
            />
            <motion.div 
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#101010] z-[120] p-10 flex flex-col justify-center shadow-[-20px_0_50px_rgba(0,0,0,0.3)]"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-12 right-12 text-white/50 hover:text-white transition-colors p-2">
                <X size={40} />
              </button>
              <div className="flex flex-col gap-6">
                {navItems.map((item, i) => (
                  <motion.div key={item} custom={i} variants={itemVariants} className="overflow-hidden">
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsOpen(false); }} className="text-5xl md:text-7xl font-bold text-white hover:text-white/50 transition-colors tracking-tighter block">{item}</a>
                  </motion.div>
                ))}
              </div>
              <div className="mt-20 border-t border-white/10 pt-10">
                <p className="text-white/30 uppercase text-[10px] tracking-widest mb-4">Socials</p>
                <div className="flex gap-6 text-white/60 text-sm">
                   <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                   <a href="#" className="hover:text-white transition-colors">Instagram</a>
                   <a href="#" className="hover:text-white transition-colors">Email</a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};