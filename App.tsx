
/**
 * PROJECT DOCUMENTATION - ADHIKNA ENGGAR PORTFOLIO
 * -----------------------------------------------
 * Transition Refinement:
 * - Dual-Phase Reveal: Section 2 muncul lebih awal (opacity 0 -> 1) saat background masih terang (teks hitam).
 * - Background Flip: Background bertransisi ke hitam hanya saat Section 2 sudah mendekati pusat viewport.
 * - Button Consistency: Menyamakan desain tombol Section 2 dengan Section 1 (rounded-sm, border-current).
 * - Precise Arrow Animation: Menggunakan ArrowUpRight yang berotasi +45 derajat (ke kanan) saat di-hover.
 * - Chatbot Logic: Diperbarui dengan systemInstruction yang lebih spesifik mengenai data pribadi dan fallback kontak.
 * - Chatbot UI: Responsive trigger (Tab di Desktop, Bubble di Mobile standar di pojok kanan bawah).
 * - Audio Feedback: Premium "Thocky" Mechanical Keyboard Sound (Dual-layer Sine/Triangle).
 * - Loading: Rectangular Progress Bar (Minimalist) transforming into AE. logo.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, LayoutGroup } from 'framer-motion';
import { ArrowUpRight, Linkedin, Mail, Send, X, Sparkles, Instagram, ChevronDown } from 'lucide-react';
import ReactPlayer from 'react-player';
import { GoogleGenAI } from "@google/genai";
import { Navbar } from './components/Navbar';
import { BackgroundDots } from './components/BackgroundDots';
import { TextReveal } from './components/TextReveal';
import { MagneticButton } from './components/MagneticButton';

type LoadingState = 'welcome' | 'progress' | 'logo' | 'complete';

const AUDIO_URL = "https://soundcloud.com/sweet-medicine/sweet-medicine-mell-o-feelin";

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export default function App() {
  const [loadingPhase, setLoadingPhase] = useState<LoadingState>('welcome');
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: "Hello! I'm Adhikna's digital assistant. How can I help you explore his work today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutSectionRef,
    offset: ["start end", "end start"]
  });

  useMotionValueEvent(aboutProgress, "change", (latest) => {
    if (latest > 0.48) {
      if (!isDark) setIsDark(true);
    } else {
      if (isDark) setIsDark(false);
    }
  });

  const heroOpacity = useTransform(aboutProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(aboutProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(aboutProgress, [0, 0.5], [0, -100]);

  const aboutContentY = useTransform(aboutProgress, [0.15, 0.45], [100, 0]);
  const aboutContentOpacity = useTransform(aboutProgress, [0.1, 0.35], [0, 1]);
  const aboutScale = useTransform(aboutProgress, [0.2, 0.5], [0.98, 1]);

  const hudOpacity = useTransform(aboutProgress, [0, 0.15], [1, 0]);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioCtx();
  }, []);

  const playHoverSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // LAYER 1: THE "THOCK"
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(440, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
    bodyGain.gain.setValueAtTime(0.12, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    // LAYER 2: THE "CRISP"
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
    clickGain.gain.setValueAtTime(0.04, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.05);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
  }, []);

  const toggleMusic = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (isMuted) setIsMuted(false);
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isMuted]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputValue,
        config: { 
          systemInstruction: `You are Adhikna Enggar's professional digital assistant. 
          Adhikna Enggar is a UI/UX Designer with 3 years of experience crafting fast, functional, and immersive digital products.
          He bridges the gap between static design and reality to build usable solutions that solve real problems.
          
          GUIDELINES:
          1. Answer questions about his background, skills, and work based on the info above.
          2. Be brief, elegant, and professional in your responses.
          3. If you don't know the answer or if the question is very specific/complex, respond with: "Untuk pertanyaan tersebut, kamu bisa langsung chat Adhikna melalui Instagram atau kirimkan Email agar dijawab langsung oleh beliau."
          4. Never break character. You are his assistant.` 
        }
      });
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: response.text || "Connection lost." };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: "Maaf, sepertinya ada gangguan koneksi. Silakan coba lagi atau hubungi Adhikna via IG/Email." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 800));
      setLoadingPhase('progress');
      
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 8;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            setLoadingPhase('logo');
            setTimeout(() => {
              setLoadingPhase('complete');
            }, 1800);
          }, 600);
        } else {
          setProgress(Math.floor(currentProgress));
        }
      }, 80);

    };
    sequence();
    const handleActivation = () => {
      setIsMuted(false);
      setIsPlaying(true);
      window.removeEventListener('click', handleActivation);
    };
    window.addEventListener('click', handleActivation);
    return () => window.removeEventListener('click', handleActivation);
  }, []);

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const Player = ReactPlayer as any;

  return (
    <LayoutGroup>
      <div 
        className={`relative min-h-screen transition-colors duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col bg-grain ${isDark ? 'bg-[#121212]' : 'bg-[#f8f8f8]'}`}
      >
        <div className="fixed -top-10 -left-10 w-1 h-1 opacity-0 pointer-events-none">
          <Player url={AUDIO_URL} playing={isPlaying} muted={isMuted} loop={true} volume={0.15} playsInline />
        </div>

        <AnimatePresence>
          {loadingPhase !== 'complete' && (
            <motion.div 
              key="loader" 
              exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }} 
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#101010]"
            >
              <div className="relative z-10 flex flex-col items-center w-full max-w-[300px]">
                <AnimatePresence mode="wait">
                  {loadingPhase === 'welcome' && (
                    <motion.div key="w" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-white text-3xl font-light tracking-tight text-center">Welcome</motion.div>
                  )}
                  {loadingPhase === 'progress' && (
                    <motion.div 
                      key="p" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="w-full h-[2px] bg-white/10 relative overflow-hidden mb-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="absolute inset-y-0 left-0 bg-white"
                          transition={{ ease: "easeOut", duration: 0.2 }}
                        />
                      </div>
                      <div className="flex justify-between w-full">
                        <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Loading Data</span>
                        <span className="text-white text-[10px] font-bold tabular-nums">{progress}%</span>
                      </div>
                    </motion.div>
                  )}
                  {loadingPhase === 'logo' && (
                    <motion.div 
                      key="l" 
                      layoutId="ae-logo"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-white text-7xl font-bold tracking-tighter"
                    >
                      AE.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className={`flex-1 flex flex-col transition-colors duration-700 ${isDark ? 'text-white' : 'text-[#101010]'}`}
          initial={{ opacity: 0 }} 
          animate={{ opacity: loadingPhase === 'complete' ? 1 : 0 }} 
          transition={{ duration: 1 }}
        >
          {loadingPhase === 'complete' && <Navbar onHover={playHoverSound} isDark={isDark} />}

          {/* SECTION 1: HERO */}
          <motion.section 
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
            className={`relative min-h-screen flex flex-col items-center justify-center px-6 md:px-20 scroll-snap-align-start will-change-transform z-10 ${isDark ? 'pointer-events-none invisible' : 'pointer-events-auto visible'}`}
          >
            <BackgroundDots />
            <div className="w-full max-w-[1400px] relative pointer-events-none flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-4 px-2">
                <TextReveal text="Hii! i Am" className="text-lg font-medium opacity-70" delay={0.5} />
                <TextReveal text="UI/UX Designer • Creative Technologist" className="text-lg font-medium opacity-70" delay={0.7} />
              </div>
              
              <div className="relative mb-12 overflow-visible">
                <h1 className="text-[14vw] md:text-[8vw] leading-[1] font-medium tracking-tight text-center md:text-left pointer-events-auto">
                  {"Adhikna Enggar.".split("").map((char, i) => (
                    <motion.span 
                      key={i} 
                      className="inline-block hover:text-[#4a4a4a] transition-colors cursor-default"
                      initial={{ y: 80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      whileHover={{ y: -10, scale: 1.1, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
                      transition={{ delay: 1.4 + (i * 0.04), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      onMouseEnter={playHoverSound}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </h1>
              </div>

              <div className="flex justify-center md:justify-start px-2">
                <button 
                  onClick={scrollToAbout} 
                  onMouseEnter={playHoverSound} 
                  className="pointer-events-auto group"
                >
                  <div className={`flex items-stretch h-14 md:h-16 rounded-sm border border-current overflow-hidden transition-all duration-500 hover:bg-black hover:text-white`}>
                    <div className="px-10 flex items-center text-lg font-medium">Contact</div>
                    <div className="px-5 flex items-center border-l border-current/20">
                      <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.section>

          {/* SECTION 2: ABOUT */}
          <section 
            ref={aboutSectionRef}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden scroll-snap-align-start z-20"
          >
            <div className="w-full h-full relative flex flex-col items-center justify-center px-8 md:px-20 z-10">
              <motion.div 
                style={{ y: aboutContentY, opacity: aboutContentOpacity, scale: aboutScale }}
                className={`max-w-4xl w-full text-center space-y-8 will-change-transform flex flex-col items-center`}
              >
                {/* Section Header AE. */}
                <span className="text-xl font-medium tracking-tighter mb-4">AE.</span>

                {/* Main Heading */}
                <h2 className="text-3xl md:text-[2.6rem] font-medium leading-[1.2] tracking-tight max-w-3xl">
                  I’m Adhikna Enggar — A UI/UX Designer crafting fast, functional, and immersive digital products
                </h2>
                
                {/* Paragraph */}
                <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light opacity-80">
                  With 3 years of experience, I bridge the gap between static design and reality. I build usable solutions that solve real problems
                </p>

                {/* Button consistent with Section 1 but specific hover arrow behavior */}
                <div className="flex justify-center pt-8">
                  <button 
                    onMouseEnter={playHoverSound}
                    className="group"
                  >
                    <div className={`flex items-stretch h-14 md:h-16 rounded-sm border overflow-hidden transition-all duration-300 ${isDark ? 'bg-white text-black border-white hover:bg-transparent hover:text-white' : 'bg-[#101010] text-white border-[#101010] hover:bg-transparent hover:text-black'}`}>
                      <div className="px-10 flex items-center text-base font-medium">About Me</div>
                      <div className={`px-5 flex items-center border-l ${isDark ? 'border-black/10' : 'border-white/10'}`}>
                        <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Scroll Down Indicator */}
                <div className="pt-20 flex flex-col items-center gap-2 opacity-50">
                  <span className="text-xs font-medium uppercase tracking-widest">Scroll Down</span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* HUD ELEMENTS */}
          <div className="fixed inset-0 pointer-events-none z-[110]">
            <motion.div 
              style={{ opacity: hudOpacity }}
              className="absolute bottom-6 md:bottom-10 left-0 right-0 px-6 md:px-20 flex items-center justify-between"
            >
              <div className="text-[10px] md:text-sm font-medium opacity-50">AE. Designer</div>
              <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
                 <button onClick={toggleMusic} className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-end gap-[2px] h-3">
                      {[1, 2, 3].map(i => <motion.div key={i} animate={isPlaying ? { height: [4, 12, 4] } : { height: 4 }} transition={{ repeat: Infinity, duration: 0.5 + i * 0.1 }} className="w-[1px] md:w-[1.5px] bg-current" />)}
                    </div>
                    <span className="hidden sm:inline">{isPlaying ? 'Pulse' : 'Static'}</span>
                 </button>
                 <div className="flex gap-4">
                    <MagneticButton onMouseEnter={playHoverSound}><Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4 hover:opacity-50 transition-opacity" /></MagneticButton>
                    <MagneticButton onMouseEnter={playHoverSound}><Instagram className="w-3.5 h-3.5 md:w-4 md:h-4 hover:opacity-50 transition-opacity" /></MagneticButton>
                    <MagneticButton onMouseEnter={playHoverSound}><Mail className="w-3.5 h-3.5 md:w-4 md:h-4 hover:opacity-50 transition-opacity" /></MagneticButton>
                 </div>
              </div>
            </motion.div>

            {/* DESKTOP ASSISTANT TRIGGER (SIDE TAB) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ 
                opacity: (loadingPhase === 'complete' && !isChatOpen) ? 1 : 0, 
                x: isChatOpen ? 150 : 0 
              }} 
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-[120]" 
              onClick={() => setIsChatOpen(true)}
            >
              <div className={`px-4 py-8 rounded-l-2xl shadow-xl transition-all duration-500 flex flex-col items-center gap-2 ${isDark ? 'bg-white text-black' : 'bg-[#101010] text-white'}`}>
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase writing-vertical-lr transform rotate-180">Assistant</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </motion.div>

            {/* MOBILE ASSISTANT TRIGGER (FLOATING BUBBLE) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ 
                opacity: (loadingPhase === 'complete' && !isChatOpen) ? 1 : 0, 
                scale: (loadingPhase === 'complete' && !isChatOpen) ? 1 : 0.8 
              }} 
              className="md:hidden fixed bottom-16 right-6 pointer-events-auto z-[120]"
              onClick={() => setIsChatOpen(true)}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border border-current/10 transition-all duration-500 ${isDark ? 'bg-white text-black' : 'bg-[#101010] text-white'}`}>
                <Sparkles className="w-6 h-6" />
              </div>
            </motion.div>
          </div>

          {/* AI CHAT */}
          <AnimatePresence>
            {isChatOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => setIsChatOpen(false)} 
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" 
                />
                <motion.div 
                  initial={{ y: 50, opacity: 0, scale: 0.95 }} 
                  animate={{ y: 0, opacity: 1, scale: 1 }} 
                  exit={{ y: 50, opacity: 0, scale: 0.95 }} 
                  transition={{ type: "spring", damping: 25, stiffness: 300 }} 
                  className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] h-[600px] max-h-[85vh] bg-[#0a0a0a] border border-white/10 text-white z-[160] flex flex-col shadow-2xl rounded-3xl overflow-hidden"
                >
                  <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-white/80" />
                      <div>
                        <h3 className="font-bold text-sm">Adhikna AI</h3>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Assistant</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsChatOpen(false)} 
                      className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-50 hover:opacity-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="p-4 rounded-2xl bg-white/5 rounded-tl-none flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="p-6 border-t border-white/5">
                    <div className="relative flex items-center">
                      <input 
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask anything..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none text-sm focus:border-white/30 focus:bg-white/10 transition-all pr-12" 
                      />
                      <button 
                        onClick={handleSendMessage} 
                        className="absolute right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        <style>{`
          html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
          .scroll-snap-align-start { scroll-snap-align: start; }
          .writing-vertical-lr { writing-mode: vertical-lr; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </LayoutGroup>
  );
}
