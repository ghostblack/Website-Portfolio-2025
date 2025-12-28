
/**
 * PROJECT DOCUMENTATION - ADHIKNA ENGGAR PORTFOLIO
 * -----------------------------------------------
 * Riwayat Perubahan & Arsitektur:
 * 1. REPEL DOTS: Background dots now act as positive magnets, repelling the cursor.
 * 2. LIQUID TYPOGRAPHY: Interactive letters with spring physics.
 * 3. CRISPY SFX: Added mechanical keyboard hover sounds for tactile feedback.
 * 4. PERFORMANCE: Optimized grid density and character mapping for 60fps experience.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { ArrowUpRight, Linkedin, MessageCircle, Mail, Send, X, Sparkles } from 'lucide-react';
import ReactPlayer from 'react-player';
import { GoogleGenAI } from "@google/genai";
import { Navbar } from './components/Navbar';
import { BackgroundDots } from './components/BackgroundDots';
import { TextReveal } from './components/TextReveal';
import { MagneticButton } from './components/MagneticButton';

type LoadingState = 'welcome' | 'box' | 'logo' | 'complete';

const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
// Crispy keyboard click SFX URL
const HOVER_SFX_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  const [loadingPhase, setLoadingPhase] = useState<LoadingState>('welcome');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: "Hii! Saya asisten virtual Adhikna. Ada yang bisa saya bantu?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // SFX Logic
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    hoverSoundRef.current = new Audio(HOVER_SFX_URL);
    hoverSoundRef.current.volume = 0.15;
    // Preload sound
    hoverSoundRef.current.load();
  }, []);

  const playHoverSound = useCallback(() => {
    if (!hoverSoundRef.current) return;
    // Clone and play to allow overlapping sounds (crispy effect)
    const sound = hoverSoundRef.current.cloneNode() as HTMLAudioElement;
    sound.volume = 0.15;
    sound.play().catch(() => {
      // Ignore autoplay restriction errors - they vanish after first click
    });
  }, []);

  // --- CURSOR LOGIC ---
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover'>('default');
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 30, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    const target = e.target as HTMLElement;
    const isHoverable = target.closest('button, a, .cursor-pointer, input, textarea, .hover-char');
    setCursorVariant(isHoverable ? 'hover' : 'default');
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 800));
      setLoadingPhase('box');
      await new Promise(r => setTimeout(r, 1000));
      setLoadingPhase('logo');
      await new Promise(r => setTimeout(r, 1000));
      setLoadingPhase('complete');
    };
    sequence();

    const handleActivation = () => {
      setIsMuted(false);
      setIsPlaying(true);
      window.removeEventListener('click', handleActivation);
      window.removeEventListener('touchstart', handleActivation);
      window.removeEventListener('scroll', handleActivation);
    };

    window.addEventListener('click', handleActivation);
    window.addEventListener('touchstart', handleActivation);
    window.addEventListener('scroll', handleActivation, { passive: true });

    return () => {
      window.removeEventListener('click', handleActivation);
      window.removeEventListener('touchstart', handleActivation);
      window.removeEventListener('scroll', handleActivation);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasError) return;
    if (isMuted) {
      setIsMuted(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: { systemInstruction: `Anda adalah asisten virtual Adhikna Enggar. Bicara minimalist.` }
      });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: response.text || "Offline." }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "Error connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Improved liquid character rendering
  const name = "Adhikna Enggar.";
  const renderInteractiveName = () => {
    return name.split("").map((char, index) => (
      <motion.span
        key={index}
        onMouseEnter={playHoverSound}
        className="inline-block hover-char cursor-none"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ 
          y: -12, 
          scale: 1.15,
          color: "#4a4a4a",
          transition: { type: "spring", stiffness: 500, damping: 15 } 
        }}
        transition={{ 
          duration: 1, 
          ease: [0.16, 1, 0.3, 1], 
          delay: 1.2 + (index * 0.04) 
        }}
        style={{ display: char === " " ? "inline" : "inline-block", minWidth: char === " " ? "1.5vw" : "auto" }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-[#101010] selection:bg-[#101010] selection:text-white antialiased overflow-hidden custom-cursor-none">
      
      {/* CUSTOM CURSOR (Spring Smoothed) */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[999]">
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="absolute -translate-x-1/2 -translate-y-1/2 border border-[#101010] flex items-center justify-center"
          animate={{
            width: cursorVariant === 'hover' ? 70 : 36,
            height: cursorVariant === 'hover' ? 70 : 36,
            rotate: cursorVariant === 'hover' ? 45 : 0,
            borderWidth: cursorVariant === 'hover' ? 2 : 1.5,
            borderRadius: cursorVariant === 'hover' ? "50%" : "2px"
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.6 }}
        />
        <motion.div
          style={{ x: mouseX, y: mouseY }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#101010]"
          animate={{ scale: cursorVariant === 'hover' ? 0 : 1 }}
        />
      </div>

      <div className="fixed -top-10 -left-10 w-1 h-1 opacity-0 pointer-events-none">
        <ReactPlayer url={AUDIO_URL} playing={isPlaying} muted={isMuted} loop={true} volume={0.2} onReady={() => setIsReady(true)} onError={() => setHasError(true)} playsinline />
      </div>

      <AnimatePresence>
        {loadingPhase !== 'complete' && (
          <motion.div key="loader" exit={{ transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
            <motion.div initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }} className="absolute inset-0 bg-[#101010] z-0 pointer-events-auto" />
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {loadingPhase === 'welcome' && <motion.div key="w" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-white text-3xl font-light">Welcome</motion.div>}
                {loadingPhase === 'box' && <motion.div key="b" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-16 h-16 border-2 border-white/20 relative"><motion.div animate={{ height: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-x-0 bottom-0 bg-white" /></motion.div>}
                {loadingPhase === 'logo' && <motion.div key="l" layoutId="logo-ae" className="text-white text-5xl font-bold tracking-tighter">AE.</motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: loadingPhase === 'complete' ? 1 : 0 }} transition={{ duration: 1 }}>
        {loadingPhase === 'complete' && <Navbar onHover={playHoverSound} />}

        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 sm:px-10 md:px-20 pt-10">
          <BackgroundDots />

          <div className="w-full max-w-[1400px] relative pointer-events-none flex flex-col">
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end mb-4 md:mb-6 px-2 gap-2 md:gap-0">
              <TextReveal text="Hii! i Am" className="text-lg md:text-xl font-medium text-[#2c2c2c] justify-center md:justify-start" delay={1} />
              <TextReveal text="UI/UX Designer • Vibe Coder" className="text-base md:text-xl font-medium text-[#2c2c2c] tracking-[0.1em] md:tracking-normal justify-center md:justify-end" delay={1.2} />
            </div>
            
            <div className="relative overflow-visible mb-8 md:mb-12 flex justify-center md:justify-start">
              <h1 className="text-[14vw] sm:text-[12vw] md:text-[8.5vw] lg:text-[8vw] leading-[1] font-medium tracking-tight text-[#101010] text-center md:text-left md:whitespace-nowrap pointer-events-auto">
                {renderInteractiveName()}
              </h1>
            </div>

            <div className="flex pointer-events-auto justify-center md:justify-start px-2 mt-4 md:mt-0">
              <MagneticButton onMouseEnter={playHoverSound}>
                <div className="flex items-stretch group h-14 md:h-16 shadow-sm rounded-sm border border-[#101010]/5 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-black/5">
                  <div className="bg-[#101010] text-white px-8 md:px-10 flex items-center text-lg md:text-xl font-medium tracking-tight">Contact</div>
                  <div className="bg-[#101010] px-4 md:px-5 flex items-center border-l border-white/10 group-hover:bg-[#2c2c2c] transition-colors">
                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-45 transition-transform duration-500" />
                  </div>
                </div>
              </MagneticButton>
            </div>
          </div>

          {/* SIDE CHAT TRIGGER */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: isChatOpen ? 150 : 0 }} transition={{ duration: 0.8, delay: 2 }} className="fixed right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center z-[60] pointer-events-auto cursor-pointer" onClick={() => setIsChatOpen(true)} onMouseEnter={playHoverSound}>
            <div className="bg-[#101010] px-6 py-10 border-b-[4px] border-white/10 shadow-2xl transition-all duration-500 hover:pr-14">
               <div className="flex flex-col gap-1 items-center">
                  <span className="text-xl font-bold tracking-[0.2em] uppercase writing-vertical-lr transform rotate-180 text-white">Let's Talk</span>
                  <MessageCircle className="w-6 h-6 text-white mt-4" />
               </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isChatOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/10 backdrop-blur-[4px] z-[70]" />
                <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="fixed right-4 bottom-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[420px] h-[70vh] sm:h-[600px] z-[80] flex flex-col pointer-events-auto">
                  <div className="flex-1 bg-white/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-white/50">
                    <div className="px-6 py-5 flex justify-between items-center border-b border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#101010] rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                        <h3 className="text-base font-bold text-[#101010]">Adhikna AI</h3>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} onMouseEnter={playHoverSound} className="w-8 h-8 hover:bg-black/5 rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-[#101010] text-white' : 'bg-white border border-black/5 text-[#101010]'}`}>{msg.text}</div>
                        </div>
                      ))}
                      {isTyping && <div className="text-xs text-black/30 italic">Typing...</div>}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-6">
                      <div className="relative flex items-center">
                        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Tanyakan apapun..." className="w-full bg-white border border-black/5 rounded-xl py-4 px-5 outline-none text-sm" />
                        <button onClick={handleSendMessage} onMouseEnter={playHoverSound} className="absolute right-2 w-10 h-10 bg-[#101010] rounded-lg text-white flex items-center justify-center transition-transform active:scale-90"><Send className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="fixed bottom-10 left-0 right-0 px-6 sm:px-10 md:px-20 flex items-center justify-between pointer-events-none">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2 }} className="text-xl md:text-3xl font-medium text-[#2c2c2c]">Explore</motion.div>
            <div className="flex-1 mx-6 md:mx-20 h-[1px] bg-[#2c2c2c] relative hidden sm:block opacity-20" />
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2 }} className="flex items-center gap-4 md:gap-6 pointer-events-auto">
              <MagneticButton onClick={toggleMusic} onMouseEnter={playHoverSound}>
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#2c2c2c]/10 hover:border-[#2c2c2c]/30 transition-all">
                  <div className="flex items-end gap-[2px] h-3 w-4">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div key={i} animate={(!isMuted && isPlaying) ? { height: [4, 12, 6, 12, 4] } : { height: 4 }} transition={{ repeat: Infinity, duration: 0.6 + (i * 0.1) }} className={`w-[2px] ${hasError ? 'bg-red-400' : 'bg-[#101010]'} rounded-full`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#101010] hidden xs:inline">{(!isMuted && isPlaying) ? 'Music On' : 'Muted'}</span>
                </div>
              </MagneticButton>
              <div className="flex gap-4 items-center">
                <MagneticButton onMouseEnter={playHoverSound}><Linkedin className="w-5 h-5 md:w-6 md:h-6 text-[#2c2c2c] hover:text-[#101010]" /></MagneticButton>
                <MagneticButton onMouseEnter={playHoverSound}><Mail className="w-5 h-5 md:w-6 md:h-6 text-[#2c2c2c] hover:text-[#101010]" /></MagneticButton>
              </div>
            </motion.div>
          </div>
        </main>
      </motion.div>

      <style>{`
        .writing-vertical-lr { writing-mode: vertical-lr; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .custom-cursor-none { cursor: none !important; }
          .custom-cursor-none * { cursor: none !important; }
        }
        @media (max-width: 480px) { .xs\:inline { display: inline; } }
      `}</style>
    </div>
  );
};

export default App;
