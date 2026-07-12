import { useState, useEffect } from 'react';
import { Layers, Flame, Coins, Calendar, Users, ArrowRight, Lock, ExternalLink, Settings, Sparkles } from 'lucide-react';
import { ProjectSettings } from '../types';

interface LandingPageProps {
  settings: ProjectSettings;
  onApply: () => void;
  onNavigateAdmin: () => void;
}

export default function LandingPage({ settings, onApply, onNavigateAdmin }: LandingPageProps) {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isLiveDate, setIsLiveDate] = useState(false);

  // Whitelist Timer State
  const [whitelistTimeLeft, setWhitelistTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isWhitelistTimerActive, setIsWhitelistTimerActive] = useState(false);

  // Live calculation of 72h whitelist timer
  useEffect(() => {
    if (!settings.whitelistTimerTarget) {
      setIsWhitelistTimerActive(false);
      return;
    }

    const targetDate = new Date(settings.whitelistTimerTarget);
    if (isNaN(targetDate.getTime())) {
      setIsWhitelistTimerActive(false);
      return;
    }

    const updateWhitelistTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setIsWhitelistTimerActive(false);
        setWhitelistTimeLeft(null);
        return;
      }

      setIsWhitelistTimerActive(true);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setWhitelistTimeLeft({ days, hours, minutes, seconds });
    };

    updateWhitelistTimer();
    const interval = setInterval(updateWhitelistTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.whitelistTimerTarget]);

  useEffect(() => {
    if (!settings.countdown || settings.countdown.toUpperCase() === 'TBA' || settings.countdown.toUpperCase() === 'SOON') {
      setIsLiveDate(false);
      return;
    }

    const targetDate = new Date(settings.countdown);
    if (isNaN(targetDate.getTime())) {
      setIsLiveDate(false);
      return;
    }

    setIsLiveDate(true);

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.countdown]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-4 py-8 md:px-8 max-w-7xl mx-auto z-10">
      
      {/* Header */}
      <header className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center space-x-3 cursor-pointer">
          <img
            src={settings.logoUrl}
            alt="HoodLings Logo"
            className="w-10 h-10 object-contain rounded-lg border border-neon-lime/30 p-0.5 bg-black"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback if file doesn't exist yet
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/hoodlings/100/100';
            }}
          />
          <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
            HoodLings <span className="text-neon-lime">HQ</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href={settings.followXLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-neon-lime transition-colors duration-200 p-2 hover:bg-white/5 rounded-lg flex items-center space-x-1 text-sm font-mono border border-transparent hover:border-neon-lime/20"
          >
            <span>X / Twitter</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Main Hero & Details Container */}
      <main className="w-full flex-grow flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 my-8">
        
        {/* Left Side: Mascot Art Frame */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center text-center lg:text-left relative">
          
          {/* Animated Background Glow */}
          <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-neon-lime/10 blur-[80px] -z-10 animate-pulse pointer-events-none" />

          {/* Banner Asset Display */}
          <div className="w-full max-w-md h-24 mb-6 rounded-2xl overflow-hidden border border-white/5 relative bg-zinc-950">
            <img 
              src={settings.bannerUrl} 
              alt="HoodLings Banner" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/hoodlingsbanner/800/200';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <span className="absolute bottom-3 left-4 font-display font-semibold text-xs tracking-wider text-neon-lime uppercase bg-black/70 px-2.5 py-1 rounded border border-neon-lime/20 font-mono">
              RobinHood Chain Ecosystem
            </span>
          </div>

          {/* Mascot Container */}
          <div className="relative p-3 bg-zinc-950/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl max-w-xs md:max-w-sm animate-float">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 rounded-3xl bg-neon-lime/5 pointer-events-none" />
            
            {/* Pixel Art corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-neon-lime/60" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-neon-lime/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-neon-lime/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-neon-lime/60" />

            <img
              src={settings.mascotUrl}
              alt="HoodLings Mascot"
              className="w-full aspect-square object-cover rounded-2xl border border-white/5 bg-zinc-900"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/hoodlingsmascot/400/400';
              }}
            />
          </div>

          {/* Quick Mascot Description */}
          <div className="mt-6 flex items-center space-x-2 text-zinc-400 font-mono text-xs">
            <Sparkles size={14} className="text-neon-lime animate-spin-slow" />
            <span>Meet the HoodLings: Retro pixels, infinite hoods.</span>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          
          {/* Main Title Banner */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-neon-lime/10 border border-neon-lime/30 text-neon-lime px-3.5 py-1 rounded-full font-mono text-xs tracking-wider uppercase font-medium">
              <span>WHITELIST ENROLLMENT</span>
              <span className="w-2 h-2 rounded-full bg-neon-lime animate-ping" />
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Join the <br />
              <span className="text-neon-lime neon-glow-text">HoodLings Clan</span>
            </h1>
            
            <p className="text-zinc-400 max-w-md text-sm md:text-base font-normal">
              A premium, hand-crafted 8,000 piece pixel art collection dwelling on the RobinHood Chain. Secure your whitelist spot before public takeoff.
            </p>
          </div>

          {/* Countdown Display if Available */}
          {isLiveDate && timeLeft && (
            <div className="w-full max-w-md bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-lime/40 to-transparent" />
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest text-center lg:text-left flex items-center justify-center lg:justify-start gap-1.5">
                <Flame size={14} className="text-neon-lime" />
                <span>Countdown to Mint / Launch</span>
              </div>
              
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                  <div className="text-2xl md:text-3xl font-mono font-bold text-neon-lime">{timeLeft.days}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Days</div>
                </div>
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                  <div className="text-2xl md:text-3xl font-mono font-bold text-neon-lime">{timeLeft.hours}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Hours</div>
                </div>
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                  <div className="text-2xl md:text-3xl font-mono font-bold text-neon-lime">{timeLeft.minutes}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Mins</div>
                </div>
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                  <div className="text-2xl md:text-3xl font-mono font-bold text-neon-lime">{timeLeft.seconds}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Secs</div>
                </div>
              </div>
            </div>
          )}

          {/* Project Details Grid (Bento style) */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            
            <div className="pixel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider">Blockchain</span>
                <Layers size={14} className="text-neon-lime" />
              </div>
              <span className="font-mono text-base font-bold text-white tracking-wide">{settings.chain}</span>
            </div>

            <div className="pixel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider">Supply Size</span>
                <Users size={14} className="text-neon-lime" />
              </div>
              <span className="font-mono text-base font-bold text-white tracking-wide">{settings.supply}</span>
            </div>

            <div className="pixel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider">Mint Date</span>
                <Calendar size={14} className="text-neon-lime" />
              </div>
              <span className="font-mono text-base font-bold text-white tracking-wide">{settings.mintDate}</span>
            </div>

            <div className="pixel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider">Mint Price</span>
                <Coins size={14} className="text-neon-lime" />
              </div>
              <span className="font-mono text-base font-bold text-white tracking-wide">{settings.mintPrice}</span>
            </div>

          </div>

          {/* Whitelist Application Trigger */}
          <div className="w-full max-w-md pt-2 space-y-3">
            {isWhitelistTimerActive && whitelistTimeLeft && (
              <div className="bg-neon-lime/10 border border-neon-lime/30 rounded-2xl p-4 text-center space-y-1">
                <div className="text-[10px] font-mono text-neon-lime uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-ping" />
                  <span>72H WHITELIST CLOSING COUNTDOWN</span>
                </div>
                <div className="text-xl font-mono font-bold text-white tracking-wider">
                  {whitelistTimeLeft.days > 0 && `${whitelistTimeLeft.days}d `}
                  {String(whitelistTimeLeft.hours).padStart(2, '0')}h{' '}
                  {String(whitelistTimeLeft.minutes).padStart(2, '0')}m{' '}
                  {String(whitelistTimeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>
            )}

            {(settings.isWhitelistOpen && (!settings.whitelistTimerTarget || isWhitelistTimerActive)) ? (
              <button
                onClick={onApply}
                className="w-full group relative overflow-hidden bg-neon-lime text-black font-display font-bold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 neon-glow-btn cursor-pointer"
                id="apply-whitelist-btn"
              >
                {/* Button overlay */}
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                <span className="text-sm md:text-base tracking-wide font-extrabold">APPLY FOR WHITELIST</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            ) : (
              <div className="w-full bg-zinc-900/50 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center justify-center space-x-2 font-mono text-sm uppercase tracking-wider">
                <Lock size={16} />
                <span>Whitelist Applications are currently closed</span>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
        <span>© 2026 HoodLings. All rights reserved.</span>
        <div className="flex items-center space-x-4">
          <span>Powered by RobinHood Network</span>
          <span>•</span>
          <a
            href={settings.followXLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-lime transition-colors"
          >
            Official HQ X
          </a>
        </div>
      </footer>

    </div>
  );
}
