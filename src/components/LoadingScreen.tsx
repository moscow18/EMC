'use client';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const timer = setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = '';
    }, 2000);
    
    const removeTimer = setTimeout(() => setRemoved(true), 2500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (removed) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0A071E] transition-opacity duration-500 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawBeat {
          0% { stroke-dashoffset: 1000; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1000; }
        }
        .heartbeat-path {
          stroke-dasharray: 1000;
          animation: drawBeat 2s linear infinite;
        }
      `}} />
      
      <div className={`flex flex-col items-center transition-transform duration-500 ${hidden ? 'scale-110' : 'scale-100'}`}>
        
        {/* Heartbeat EKG Animation */}
        <div className="relative w-64 md:w-80 h-32 mb-8 flex justify-center items-center">
           <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full animate-pulse"></div>
           <svg viewBox="0 0 500 200" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
             <path 
               className="heartbeat-path"
               d="M 0 100 L 150 100 L 175 50 L 225 150 L 275 20 L 325 180 L 375 100 L 500 100" 
               stroke="#22d3ee" 
               strokeWidth="6" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               fill="none" 
             />
           </svg>
        </div>

        <h2 className="font-outfit text-3xl md:text-4xl font-bold text-white tracking-widest shadow-cyan-500/50 drop-shadow-xl animate-pulse">
          EMC
        </h2>
        <p className="text-cyan-200/70 text-sm md:text-base font-medium tracking-[0.3em] uppercase mt-3">
          Egyptian Medical Clinic
        </p>
      </div>
    </div>
  );
}
