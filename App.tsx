
/**
 * PROJECT DOCUMENTATION - ADHIKNA ENGGAR PORTFOLIO
 * -----------------------------------------------
 * Final Precision Color Inversion & Enhanced Dark Mode:
 * - Reveal Phase [0.1 -> 0.3]: Section 2 text appears in BLACK while background is still LIGHT.
 * - The Flip Phase [0.38 -> 0.48]: Decisive transition from light to dark background. 
 * - Section 2 Dark Aesthetic: Deep black (#0a0a0a) with a subtle grain texture and radial depth glow.
 * - Navbar Sync: Passed aboutProgress to Navbar to ensure the MENU button inverts correctly.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Linkedin, MessageCircle, Mail, Send, X, Sparkles, Instagram, ChevronDown } from 'lucide-react';
import ReactPlayer from 'react-player';
import { GoogleGenAI } from "@google/genai";
import { Navbar } from './components/Navbar.tsx';
import { BackgroundDots } from './components/BackgroundDots.tsx';
import { TextReveal } from './components/TextReveal.tsx';
import { MagneticButton } from './components/MagneticButton.tsx';

type LoadingState = 'welcome' | 'box' | 'logo' | 'complete';

const AUDIO_URL = "https://soundcloud.com/sweet-medicine/sweet-medicine-mell-o-feelin";

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
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: "Hello! I'm Adhikna's digital assistant. How can I help you explore his work today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  
  // Section 2 scroll progress (0.5 is perfectly centered/snapped)
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutSectionRef,
    offset: ["start end", "end start"]
  });

  // --- REFINED COLOR TRANSITIONS ---
  const flipRange = [0.38, 0.48]; 
  
  const globalBgColor = useTransform(aboutProgress, flipRange, ["#f8f8f8", "#0a0a0a"]);
  const globalTextColor = useTransform(aboutProgress, flipRange, ["#101010", "#ffffff"]);
  const globalSubTextColor = useTransform(aboutProgress, flipRange, ["#444444", "rgba(255,255,255,0.5)"]);
  
  // Section 2 Button: Inverts with the background
  const aboutBtnBg = useTransform(aboutProgress, flipRange, ["#101010", "#ffffff"]);
  const aboutBtnText = useTransform(aboutProgress, flipRange, ["#ffffff", "#101010"]);

  // Assistant Trigger: Inverts with the background
  const assistantBg = useTransform(aboutProgress, flipRange, ["#101010", "#ffffff"]);
  const assistantText = useTransform(aboutProgress, flipRange, ["#ffffff", "#101010"]);

  // Section 2 Reveal: Text appears EARLY while background is still LIGHT
  const aboutContentY = useTransform(aboutProgress, [0.15, 0.45], [100, 0]);
  const aboutContentOpacity = useTransform(aboutProgress, [0.1, 0.3], [0, 1]);

  // Section 2 Decoration Opacity: Only visible when background is dark
  const darkDecorationOpacity = useTransform(aboutProgress, [0.4, 0.5], [0, 0.4]);

  // Hero Section Scaling & Fading
  const heroScale = useTransform(aboutProgress, [0, 0.45], [1, 0.9]);
  const heroOpacity = useTransform(aboutProgress, [0, 0.35], [1, 0]);

  // HUD Visibility (Socials and Footer) - Fades out as we transition into Section 2
  const hudOpacity = useTransform(aboutProgress, [0, 0.3], [1, 0]);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioCtx();
  }, []);

  const playHoverSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

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
        config: { systemInstruction: "You are Adhikna Enggar's AI assistant. Be brief and professional." }
      });
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: response.text || "Connection lost. Try again later." };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover'>('default');
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const cursorX = useSpring(mouseX, { damping: 30, stiffness: 250, mass: 0.5 });
  const cursorY = useSpring(mouseY, { damping: 30, stiffness: 250, mass: 0.5 });

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
      await new Promise(r => setTimeout(r, 1000));
      setLoadingPhase('box');
      await new Promise(r => setTimeout(r, 1200));
      setLoadingPhase('logo');
      await new Promise(r => setTimeout(r, 1500));
      setLoadingPhase('complete');
    };
    sequence();
    const handleActivation = () => {
      setIsMuted(false);
      setIsPlaying(true);
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      window.removeEventListener('click', handleActivation);
    };
    window.addEventListener('click', handleActivation);
    return () => window.removeEventListener('click', handleActivation);
  }, []);

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const name = "Adhikna Enggar.";
  const renderInteractiveName = () => {
    return name.split("").map((char, index) => (
      <motion.span
        key={index}
        onMouseEnter={playHoverSound}
        className="inline-block hover-char cursor-none"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -12, scale: 1.15, color: "#4a4a4a", transition: { type: "spring", stiffness: 500, damping: 15 } }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.5 + (index * 0.04) }}
        style={{ display: char === " " ? "inline" : "inline-block", minWidth: char === " " ? "1.5vw" : "auto" }}
      >
        {char}
      </motion.span>
    ));
  };

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) setIsMuted(false);
    else setIsPlaying(!isPlaying);
  };

  const Player = ReactPlayer as any;

  return (
    <motion.div 
      style={{ backgroundColor: globalBgColor, color: globalTextColor }}
      className="relative min-h-screen selection:bg-white selection:text-black antialiased custom-cursor-none flex flex-col transition-colors duration-100"
    >
      {/* Custom Cursor */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[150]">
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="absolute -translate-x-1/2 -translate-y-1/2 border border-current flex items-center justify-center"
          animate={{
            width: cursorVariant === 'hover' ? 70 : 36,
            height: cursorVariant === 'hover' ? 70 : 36,
            rotate: cursorVariant === 'hover' ? 45 : 0,
            borderWidth: cursorVariant === 'hover' ? 2 : 1.5,
            borderRadius: cursorVariant === 'hover' ? "50%" : "2px"
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.6 }}
        />
        <motion.div style={{ x: mouseX, y: mouseY }} className="absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-current" animate={{ scale: cursorVariant === 'hover' ? 0 : 1 }} />
      </div>

      <div className="fixed -top-10 -left-10 w-1 h-1 opacity-0 pointer-events-none">
        <Player url={AUDIO_URL} playing={isPlaying} muted={isMuted} loop={true} volume={0.2} onError={() => setHasError(true)} playsInline />
      </div>

      <AnimatePresence mode="wait">
        {loadingPhase !== 'complete' && (
          <motion.div 
            key="loader" 
            exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }} 
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden pointer-events-none"
          >
            <motion.div 
              initial={{ y: 0 }} 
              exit={{ y: '-100%' }} 
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }} 
              className="absolute inset-0 bg-[#101010] z-0 pointer-events-auto" 
            />
            <div className="relative z-10 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {loadingPhase === 'welcome' && <motion.div key="w" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-white text-3xl font-light">Welcome</motion.div>}
                {loadingPhase === 'box' && (
                  <motion.div key="b" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-16 h-16 border-2 border-white/20 relative">
                    <motion.div animate={{ height: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-x-0 bottom-0 bg-white" />
                  </motion.div>
                )}
                {loadingPhase === 'logo' && <motion.div key="l" layoutId="logo-ae" transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }} className="text-white text-6xl font-bold tracking-tighter">AE.</motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }} 
        animate={{ opacity: loadingPhase === 'complete' ? 1 : 0 }} 
        transition={{ duration: 1 }}
      >
        {loadingPhase === 'complete' && <Navbar onHover={playHoverSound} aboutProgress={aboutProgress} />}

        {/* SECTION 1: HERO */}
        <motion.section 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-10 md:px-20 scroll-snap-align-start"
        >
          <BackgroundDots />
          <div className="w-full max-w-[1400px] relative pointer-events-none flex flex-col">
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end mb-4 md:mb-6 px-2 gap-2 md:gap-0">
              <TextReveal text="Hii! i Am" className="text-lg md:text-xl font-medium text-current opacity-70 justify-center md:justify-start" delay={1.2} />
              <TextReveal text="UI/UX Designer • Creative Technologist" className="text-base md:text-xl font-medium text-current opacity-70 tracking-[0.1em] md:tracking-normal justify-center md:justify-end" delay={1.4} />
            </div>
            
            <div className="relative overflow-visible mb-8 md:mb-12 flex justify-center md:justify-start">
              <h1 className="text-[14vw] sm:text-[12vw] md:text-[8.5vw] lg:text-[8vw] leading-[1] font-medium tracking-tight text-current text-center md:text-left md:whitespace-nowrap pointer-events-auto">
                {renderInteractiveName()}
              </h1>
            </div>

            <div className="flex justify-center md:justify-start px-2 mt-4 md:mt-0">
              <MagneticButton onMouseEnter={playHoverSound} onClick={scrollToAbout} className="pointer-events-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 1 }}
                  whileHover={{ y: 5 }}
                  className="flex items-stretch group h-14 md:h-16 shadow-sm rounded-sm border border-current overflow-hidden transition-all duration-500 hover:shadow-xl"
                >
                  <div className="bg-[#101010] text-white px-8 md:px-10 flex items-center text-lg md:text-xl font-medium tracking-tight">Contact</div>
                  <div className="bg-[#101010] px-4 md:px-5 flex items-center border-l border-white/10 group-hover:bg-[#2c2c2c] transition-colors">
                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-45 transition-transform duration-500" />
                  </div>
                </motion.div>
              </MagneticButton>
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: ABOUT */}
        <section 
          ref={aboutSectionRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-snap-align-start"
        >
          {/* DARK TEXTURE & BACKGROUND DECORATION */}
          <motion.div 
            style={{ opacity: darkDecorationOpacity }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Soft Radial Depth Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.4)_0%,transparent_70%)]" />
            
            {/* Film Grain Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/p6.png')] contrast-150 brightness-150" />
            
            {/* Noise Layer for tactile feel */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
          </motion.div>

          <div className="w-full h-full relative flex flex-col items-center justify-center p-8 md:p-20 z-10">
            <motion.div 
              style={{ y: aboutContentY, opacity: aboutContentOpacity }}
              className="max-w-4xl w-full text-center space-y-8 md:space-y-12 relative z-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.3] tracking-tight">
                I’m Adhikna Enggar — A UI/UX Designer crafting fast, functional, and immersive digital products
              </h2>
              
              <motion.p 
                style={{ color: globalSubTextColor }}
                className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light transition-colors duration-300"
              >
                With 3 years of experience, I bridge the gap between static design and reality. I don't just draw interfaces; I build usable solutions that solve real problems.
              </motion.p>

              <div className="flex justify-center pt-6">
                <MagneticButton onMouseEnter={playHoverSound}>
                  <motion.div 
                    style={{ 
                      backgroundColor: aboutBtnBg,
                      color: aboutBtnText,
                    }}
                    whileHover={{ 
                      y: -5, 
                      scale: 1.02,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }}
                    className="flex items-stretch group h-14 md:h-16 shadow-2xl rounded-sm border border-transparent overflow-hidden transition-all duration-300"
                  >
                    <div className="px-8 md:px-12 flex items-center text-lg md:text-xl font-medium tracking-tight">About Me</div>
                    <div className="px-4 md:px-5 flex items-center border-l border-current/20">
                      <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                  </motion.div>
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HUD ELEMENTS - SYNC WITH GLOBAL COLOR */}
        <div className="fixed inset-0 pointer-events-none z-[110]">
          
          {/* SCROLL INDICATOR */}
          <motion.div 
            style={{ opacity: hudOpacity }}
            className="absolute bottom-28 left-6 sm:left-10 md:left-20 flex flex-col items-center gap-2"
          >
             <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
                <ChevronDown className="w-4 h-4 opacity-30 text-current" />
              </motion.div>
              <span className="text-[8px] uppercase font-bold tracking-[0.4em] vertical-text opacity-30 text-current">Scroll</span>
          </motion.div>

          {/* FOOTER HUD */}
          <motion.div 
            style={{ opacity: hudOpacity }}
            className="absolute bottom-10 left-0 right-0 px-6 sm:px-10 md:px-20 flex items-center justify-between"
          >
            <div className="text-sm md:text-base font-medium tracking-tight opacity-50 text-current">AE. Designer</div>
            <div className="flex items-center gap-4 md:gap-6 pointer-events-auto ml-auto">
              <MagneticButton onClick={toggleMusic} onMouseEnter={playHoverSound}>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-current/10">
                  <div className="flex items-end gap-[2px] h-3 w-4">
                    {[1, 2, 3, 4].map((i) => <motion.div key={i} animate={(!isMuted && isPlaying) ? { height: [4, 12, 6, 12, 4] } : { height: 4 }} transition={{ repeat: Infinity, duration: 0.6 + (i * 0.1) }} className={`w-[2px] bg-current rounded-full`} />)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-current hidden xs:inline">{(!isMuted && isPlaying) ? 'Pulse' : 'Static'}</span>
                </div>
              </MagneticButton>
              <div className="flex gap-4 md:gap-5 items-center">
                <MagneticButton onMouseEnter={playHoverSound}><Linkedin className="w-5 h-5 md:w-[22px] md:h-[22px] text-current hover:opacity-50" /></MagneticButton>
                <MagneticButton onMouseEnter={playHoverSound}><Instagram className="w-5 h-5 md:w-[22px] md:h-[22px] text-current hover:opacity-50" /></MagneticButton>
                <MagneticButton onMouseEnter={playHoverSound}><Mail className="w-5 h-5 md:w-[22px] md:h-[22px] text-current hover:opacity-50" /></MagneticButton>
              </div>
            </div>
          </motion.div>

          {/* AI CHAT TRIGGER */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ 
              opacity: 1, 
              x: isChatOpen ? 150 : 0,
            }} 
            transition={{ duration: 0.8, delay: 2.5 }} 
            className="absolute right-0 bottom-24 md:top-1/2 md:-translate-y-1/2 flex items-center pointer-events-auto cursor-pointer pr-6 md:pr-0" 
            onClick={() => setIsChatOpen(true)} 
            onMouseEnter={playHoverSound}
          >
            <motion.div 
              style={{ 
                backgroundColor: assistantBg,
                color: assistantText,
              }}
              className="hidden md:block px-4 py-8 rounded-l-2xl border border-current/10 shadow-2xl transition-all duration-500 hover:pr-8"
            >
               <div className="flex flex-col gap-2 items-center">
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase writing-vertical-lr transform rotate-180 pb-3">Assistant</span>
                  <Sparkles className="w-5 h-5" />
               </div>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} className="md:hidden w-14 h-14 bg-[#101010] rounded-full flex items-center justify-center shadow-xl border border-white/10">
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>

        {/* AI CHAT DRAWER */}
        <AnimatePresence>
          {isChatOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-[8px] z-[120]" />
              <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 220 }} className="fixed right-0 md:right-4 bottom-0 md:bottom-4 top-0 md:top-4 w-full md:max-w-[440px] bg-[#0d0d0d] text-white rounded-none md:rounded-[2.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] z-[130] flex flex-col overflow-hidden border border-white/10">
                <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.3)]"><Sparkles className="w-6 h-6 text-black" /></div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Adhikna AI</h3>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" /><span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Online</span></div>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} onMouseEnter={playHoverSound} className="w-11 h-11 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all"><X className="w-5 h-5 text-white/60" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl max-w-[88%] text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-white text-black font-medium rounded-tr-none' : 'bg-white/10 text-white/90 border border-white/5 rounded-tl-none'}`}>{msg.text}</motion.div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 p-4 rounded-2xl flex gap-1.5 border border-white/5">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-6 md:p-8 bg-white/5 border-t border-white/5">
                  <div className="relative flex items-center gap-3">
                    <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask me anything..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-5 px-6 outline-none text-sm text-white placeholder:text-white/20 transition-all focus:border-white/30 focus:bg-white/10 pr-16" />
                    <button onClick={handleSendMessage} className="absolute right-2 md:right-3 w-10 md:w-12 h-10 md:h-12 bg-white rounded-xl text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]"><Send className="w-5 h-5" /></button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </motion.div>

      <style>{`
        html {
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }
        .scroll-snap-align-start {
          scroll-snap-align: start;
        }
        .writing-vertical-lr { writing-mode: vertical-lr; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .custom-cursor-none { cursor: none !important; }
          .custom-cursor-none * { cursor: none !important; }
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </motion.div>
  );
};

export default App;