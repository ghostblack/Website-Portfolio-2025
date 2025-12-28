
/**
 * PROJECT DOCUMENTATION - ADHIKNA ENGGAR PORTFOLIO
 * -----------------------------------------------
 * Riwayat Perubahan & Arsitektur:
 * 1. FIXED: Audio System. Switched to a high-reliability lo-fi track and improved interaction recovery.
 * 2. REFINED: Autoplay Policy. Start muted then unmute on first gesture to avoid browser blocks.
 * 3. TRIGGER: Added 'scroll' as an activation trigger for audio as requested.
 * 4. LOGO HANDOVER: AE. logo now slides and sticks to navbar during transition.
 * 5. AUDIO: Default state is ON. Handles browser autoplay restrictions via silent-start + unmute on scroll/click.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Linkedin, MessageCircle, Mail, Send, X, Loader2, Sparkles } from 'lucide-react';
import ReactPlayer from 'react-player';
import { GoogleGenAI } from "@google/genai";
import { Navbar } from './components/Navbar';
import { BackgroundDots } from './components/BackgroundDots';
import { TextReveal } from './components/TextReveal';
import { MagneticButton } from './components/MagneticButton';

type LoadingState = 'welcome' | 'box' | 'logo' | 'complete';

// Using a very stable, highly-available sample track
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  const [loadingPhase, setLoadingPhase] = useState<LoadingState>('welcome');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow autoplay
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: "Hii! Saya asisten virtual Adhikna. Ada yang bisa saya bantu?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setLoadingPhase('box');
      await new Promise(r => setTimeout(r, 1200));
      setLoadingPhase('logo');
      await new Promise(r => setTimeout(r, 1200));
      setLoadingPhase('complete');
    };
    sequence();

    // Browser Policy Bypass & User Specific Trigger:
    // We start playing while MUTED. On the first interaction (scroll/click/touch), we unmute.
    const handleFirstInteraction = () => {
      setIsMuted(false);
      setIsPlaying(true);
      
      // Cleanup all listeners after first successful interaction
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('wheel', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });
    window.addEventListener('wheel', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('wheel', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleMusic = () => {
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
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Anda adalah asisten virtual dari Adhikna Enggar.
          PROFIL: Adhikna adalah World-Class UI/UX Designer & "Vibe Coder". Spesialisasi: High-end minimalist interfaces, cinematic animations, premium digital experiences.
          ATURAN KETAT:
          1. Hanya jawab pertanyaan yang berkaitan dengan profil Adhikna sebagai desainer.
          2. Gunakan gaya bicara yang "cool", minimalist, dan cerdas.
          3. Jika ditanya hal di luar desain, arahkan user untuk kembali ke topik kreativitas Adhikna.`,
        }
      });

      const botText = response.text || "Maaf, vibe saya sedang terganggu. Bisa diulangi?";
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: botText }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "Terjadi kesalahan pada sistem neural saya." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-[#101010] selection:bg-[#101010] selection:text-white antialiased overflow-hidden">
      
      {/* BACKGROUND AUDIO PLAYER */}
      <div className="fixed -top-10 -left-10 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
        <ReactPlayer
          url={AUDIO_URL}
          playing={isPlaying}
          muted={isMuted}
          loop={true}
          volume={0.2}
          onReady={() => {
            setIsReady(true);
            setHasError(false);
          }}
          onError={(e) => {
            console.warn("Audio Context handled gracefully. State:", e);
          }}
          playsinline
          config={{
            file: {
              forceAudio: true,
              attributes: {
                preload: 'auto'
              }
            }
          }}
        />
      </div>

      {/* REFINED LOADER SYSTEM */}
      <AnimatePresence>
        {loadingPhase !== 'complete' && (
          <motion.div
            key="loader-container"
            exit={{ 
              transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none"
          >
            <motion.div
              key="loader-curtain"
              initial={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0 bg-[#101010] z-0 pointer-events-auto"
            />
            
            <div className="relative z-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {loadingPhase === 'welcome' && (
                  <motion.div
                    key="welcome-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-white text-3xl md:text-5xl font-light tracking-tight"
                  >
                    Hello Welcome
                  </motion.div>
                )}
                {loadingPhase === 'box' && (
                  <motion.div
                    key="box-animation"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-16 h-16 border-2 border-white/20 relative"
                  >
                    <motion.div 
                      animate={{ height: ["0%", "100%", "100%", "0%"], top: ["0%", "0%", "100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-x-0 bg-white"
                    />
                  </motion.div>
                )}
                {loadingPhase === 'logo' && (
                  <motion.div
                    key="logo-center"
                    layoutId="logo-ae"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 1 }}
                    className="text-white text-4xl md:text-6xl font-bold tracking-tighter"
                  >
                    AE.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: loadingPhase === 'complete' ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {loadingPhase === 'complete' && <Navbar />}

        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 sm:px-10 md:px-20">
          <BackgroundDots />

          <div className="w-full max-w-[1400px] relative pointer-events-none">
            <div className="flex justify-between items-end mb-4 px-2">
              <TextReveal text="Hii! i Am" className="text-base sm:text-lg md:text-xl font-medium text-[#2c2c2c]" delay={1.4} />
              <TextReveal text="UI/UX Designer • Vibe Coder" className="text-base sm:text-lg md:text-xl font-medium text-[#2c2c2c]" delay={1.6} />
            </div>
            <div className="relative overflow-visible mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
                className="text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[8.5vw] leading-[1] font-medium tracking-tight text-center md:text-left text-[#101010]"
              >
                Adhikna Enggar.
              </motion.h1>
            </div>
            <div className="flex items-center justify-center md:justify-start px-2 pointer-events-auto">
              <MagneticButton>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 2 }}
                  className="flex items-stretch group h-14 md:h-16 shadow-sm overflow-hidden rounded-sm border border-[#101010]/5 transition-all duration-500 hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="bg-[#101010] text-white px-8 md:px-10 flex items-center text-lg md:text-xl font-medium tracking-tight">Contact</div>
                  <div className="bg-[#101010] px-4 md:px-5 flex items-center border-l border-white/10 group-hover:bg-[#2c2c2c] transition-colors duration-300">
                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-white transform group-hover:rotate-45 transition-transform duration-500 ease-out" />
                  </div>
                </motion.div>
              </MagneticButton>
            </div>
          </div>

          {/* DESKTOP SIDEBAR */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: loadingPhase === 'complete' ? 1 : 0, 
              x: isChatOpen ? 150 : 0 
            }}
            transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center z-[60] pointer-events-auto cursor-pointer"
            onClick={() => setIsChatOpen(true)}
          >
            <div className="bg-[#101010] px-6 py-10 border-b-[4px] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] mr-[-1px] group transition-all duration-500 hover:pr-14">
               <div className="flex flex-col gap-1 items-center">
                  <span className="text-xl font-bold tracking-[0.2em] uppercase writing-vertical-lr transform rotate-180 text-white">Say</span>
                  <span className="text-xl font-bold tracking-[0.2em] uppercase writing-vertical-lr transform rotate-180 text-white">Hi!</span>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </motion.div>
               </div>
            </div>
          </motion.div>

          {/* CHAT WINDOW */}
          <AnimatePresence>
            {isChatOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsChatOpen(false)}
                  className="fixed inset-0 bg-black/10 backdrop-blur-[4px] z-[70]"
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 100, x: 20, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 100, x: 20, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[420px] h-[75vh] sm:h-[600px] sm:max-h-[85vh] z-[80] flex flex-col pointer-events-auto"
                >
                  <div className="flex-1 bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-white/50">
                    <div className="px-6 sm:px-8 py-6 flex justify-between items-center border-b border-black/5 bg-white/40">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#101010] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#101010]">Adhikna AI</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Neural Live</p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChatOpen(false)} 
                        className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all active:scale-90"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                      <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
                          <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, scale: 0.8, y: 15, originX: msg.role === 'user' ? 1 : 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`group relative max-w-[85%] p-4 text-sm md:text-base leading-relaxed transition-all ${
                              msg.role === 'user' 
                              ? 'bg-[#101010] text-white rounded-[1.2rem] rounded-tr-[0.2rem] shadow-lg shadow-black/5' 
                              : 'bg-white border border-black/5 text-[#101010] rounded-[1.2rem] rounded-tl-[0.2rem] shadow-sm'
                            }`}>
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/80 border border-black/5 px-4 py-3 rounded-[1.2rem] rounded-tl-[0.2rem] flex gap-1.5 items-center">
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 bg-black/40 rounded-full" />
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1 h-1 bg-black/40 rounded-full" />
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1 h-1 bg-black/40 rounded-full" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="px-6 pb-8 pt-2 bg-white/40">
                      <div className="relative flex items-center group">
                        <input 
                          type="text" 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Bertanya sesuatu..."
                          className="w-full bg-white border border-black/5 rounded-xl py-4 pl-5 pr-14 focus:ring-4 focus:ring-[#101010]/5 focus:border-[#101010]/10 outline-none text-[#101010] transition-all shadow-sm placeholder:text-black/30 text-sm"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isTyping}
                          className="absolute right-2.5 w-10 h-10 bg-[#101010] rounded-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg"
                        >
                          {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* BOTTOM BAR */}
          <div className="fixed bottom-10 sm:bottom-12 left-0 right-0 px-6 sm:px-10 md:px-20 flex items-center justify-between pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 2.4 }} 
              className="text-xl sm:text-2xl md:text-3xl font-medium text-[#2c2c2c] whitespace-nowrap"
            >
              Scroll Down
            </motion.div>
            
            <div className="flex-1 mx-8 sm:mx-12 md:mx-20 h-[1px] bg-[#2c2c2c] relative hidden md:block opacity-20">
              <div className="absolute left-0 -top-[2px] w-[5px] h-[5px] bg-[#2c2c2c] rounded-full"></div>
              <div className="absolute right-0 -top-[2px] w-[5px] h-[5px] bg-[#2c2c2c] rounded-full"></div>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.4 }} className="flex items-center gap-3 sm:gap-6 pointer-events-auto">
              <MagneticButton onClick={toggleMusic} className="mr-0 sm:mr-2">
                <div className={`flex items-center gap-2 sm:gap-3 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border ${hasError ? 'border-red-400/30' : 'border-[#2c2c2c]/10'} hover:border-[#2c2c2c]/30 transition-all duration-300`}>
                  <div className="flex items-end gap-[2px] h-3 w-4">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div key={i} animate={isPlaying && !isMuted ? { height: [4, 12, 6, 12, 4] } : { height: 4 }} transition={{ repeat: Infinity, duration: 0.6 + (i * 0.1) }} className={`w-[2px] ${hasError ? 'bg-red-400' : 'bg-[#101010]'} rounded-full`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline ${hasError ? 'text-red-400' : 'text-[#101010]'}`}>{hasError ? 'Error' : (isPlaying && !isMuted) ? 'On' : 'Off'}</span>
                </div>
              </MagneticButton>
              
              <div className="h-6 w-[1px] bg-[#2c2c2c]/20 mx-1 sm:mx-2" />
              
              <div className="flex gap-4 items-center">
                <MagneticButton><Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-[#2c2c2c] hover:text-[#101010]" /></MagneticButton>
                <MagneticButton><Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#2c2c2c] hover:text-[#101010]" /></MagneticButton>
                
                <div className="md:hidden flex">
                  <MagneticButton onClick={() => setIsChatOpen(true)}>
                    <div className="w-10 h-10 bg-[#101010] rounded-full flex items-center justify-center relative shadow-lg shadow-black/10 hover:shadow-black/20 transition-all group">
                      <Sparkles className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-full bg-white"
                      />
                    </div>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </motion.div>

      <style>{`
        .writing-vertical-lr { writing-mode: vertical-lr; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
