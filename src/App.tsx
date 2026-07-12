import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ProjectSettings } from './types';
import LandingPage from './components/LandingPage';
import WhitelistFlow from './components/WhitelistFlow';
import AdminPanel from './components/AdminPanel';
import PixelParticles from './components/PixelParticles';

export default function App() {
  const [route, setRoute] = useState<'home' | 'apply' | 'admin'>('home');
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [adminPassword, setAdminPassword] = useState<string>('Sameer@786');

  // Load project settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Error loading settings from API:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    loadSettings();

    // Direct routing if visiting /admin path
    if (window.location.pathname === '/admin') {
      setRoute('admin');
    }
  }, []);

  // Update settings on server (Admin only)
  const handleUpdateSettings = async (updatedFields: Partial<ProjectSettings>): Promise<boolean> => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: adminPassword, // Dynamic admin password from state
          settings: updatedFields,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSettings(result.settings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving settings to API:', err);
      return false;
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono text-xs gap-3">
        <Loader2 size={24} className="animate-spin text-[#D0E94C]" />
        <span className="uppercase tracking-widest text-[#D0E94C]">ENTERING THE HOOD...</span>
      </div>
    );
  }

  // Fallback in case settings fetch returned null
  const currentSettings = settings || {
    followXLink: 'https://x.com/hoodlingsHQ',
    likeRepostLink: 'https://x.com/i/status/2075618743426928856',
    isWhitelistOpen: true,
    chain: 'RobinHood',
    supply: '8000',
    mintDate: 'TBA',
    mintPrice: 'TBA',
    countdown: 'TBA',
    logoUrl: '/assets/logo.png',
    mascotUrl: '/assets/mascot.png',
    bannerUrl: '/assets/banner.png',
    backgroundUrl: '/assets/background.png',
    faviconUrl: '/assets/favicon.png',
    shareWebsiteUrl: window.location.origin,
  };

  return (
    <div 
      className="min-h-screen text-zinc-100 relative overflow-x-hidden"
      style={{
        backgroundColor: '#000000',
        backgroundImage: currentSettings.backgroundUrl ? `url(${currentSettings.backgroundUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      
      {/* Background Overlay to ensure dark, high contrast interface */}
      <div className="absolute inset-0 bg-black/92 -z-20" />
      
      {/* Floating subtle grid background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(208, 233, 76, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(208, 233, 76, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Retro scanlines effect */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px]" />

      {/* Floating pixel particles */}
      <PixelParticles />

      {/* State Router */}
      <div className="transition-all duration-300">
        {route === 'home' && (
          <LandingPage 
            settings={currentSettings}
            onApply={() => setRoute('apply')}
            onNavigateAdmin={() => {
              window.history.pushState({}, '', '/admin');
              setRoute('admin');
            }}
          />
        )}

        {route === 'apply' && (
          <WhitelistFlow 
            settings={currentSettings}
            onClose={() => setRoute('home')}
          />
        )}

        {route === 'admin' && (
          <AdminPanel 
            settings={currentSettings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => {
              window.history.pushState({}, '', '/');
              setRoute('home');
            }}
            onAuthenticated={(pwd) => setAdminPassword(pwd)}
          />
        )}
      </div>

    </div>
  );
}
