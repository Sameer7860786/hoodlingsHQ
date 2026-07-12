import React, { useState, useEffect } from 'react';
import { 
  Lock, Settings, Users, Download, Eye, Trash2, CheckCircle2, 
  XCircle, ToggleLeft, ToggleRight, Upload, Globe, Link2, 
  LogOut, ShieldAlert, ArrowLeft, Search, Check, RefreshCw
} from 'lucide-react';
import { ProjectSettings, WhitelistApp } from '../types';

interface AdminPanelProps {
  settings: ProjectSettings;
  onUpdateSettings: (newSettings: Partial<ProjectSettings>) => Promise<boolean>;
  onClose: () => void;
}

export default function AdminPanel({ settings, onUpdateSettings, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard states
  const [submissions, setSubmissions] = useState<WhitelistApp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing Project Details states
  const [editChain, setEditChain] = useState(settings.chain);
  const [editSupply, setEditSupply] = useState(settings.supply);
  const [editMintDate, setEditMintDate] = useState(settings.mintDate);
  const [editMintPrice, setEditMintPrice] = useState(settings.mintPrice);
  const [editCountdown, setEditCountdown] = useState(settings.countdown);
  const [editFollowX, setEditFollowX] = useState(settings.followXLink);
  const [editLikeRepost, setEditLikeRepost] = useState(settings.likeRepostLink);
  const [editShareUrl, setEditShareUrl] = useState(settings.shareWebsiteUrl);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(settings.isWhitelistOpen);
  const [timerTimeLeft, setTimerTimeLeft] = useState<string>('');
  
  // Mint/Launch Timer State
  const [mintTimerHours, setMintTimerHours] = useState<string>('24');
  const [mintTimerTimeLeft, setMintTimerTimeLeft] = useState<string>('');

  // Synchronize state when settings prop updates
  useEffect(() => {
    setEditChain(settings.chain);
    setEditSupply(settings.supply);
    setEditMintDate(settings.mintDate);
    setEditMintPrice(settings.mintPrice);
    setEditCountdown(settings.countdown);
    setEditFollowX(settings.followXLink);
    setEditLikeRepost(settings.likeRepostLink);
    setEditShareUrl(settings.shareWebsiteUrl);
    setIsWhitelistOpen(settings.isWhitelistOpen);
  }, [settings]);

  // Live calculation of Mint/Launch timer in admin panel
  useEffect(() => {
    if (!settings.countdown || settings.countdown.toUpperCase() === 'TBA' || settings.countdown.toUpperCase() === 'SOON') {
      setMintTimerTimeLeft('');
      return;
    }

    const targetDate = new Date(settings.countdown);
    if (isNaN(targetDate.getTime())) {
      setMintTimerTimeLeft('');
      return;
    }

    const updateMintTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setMintTimerTimeLeft('EXPIRED');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      setMintTimerTimeLeft(parts.join(' '));
    };

    updateMintTimer();
    const interval = setInterval(updateMintTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.countdown]);

  // Live calculation of 72h timer in admin panel
  useEffect(() => {
    if (!settings.whitelistTimerTarget) {
      setTimerTimeLeft('');
      return;
    }

    const targetDate = new Date(settings.whitelistTimerTarget);
    if (isNaN(targetDate.getTime())) {
      setTimerTimeLeft('');
      return;
    }

    const updateAdminTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setTimerTimeLeft('EXPIRED');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      setTimerTimeLeft(parts.join(' '));
    };

    updateAdminTimer();
    const interval = setInterval(updateAdminTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.whitelistTimerTarget]);

  // Load submissions
  const loadSubmissions = async (pwd = password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/submissions?password=${encodeURIComponent(pwd)}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate Admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        loadSubmissions(password);
      } else {
        setLoginError(data.error || 'Incorrect password.');
      }
    } catch (err) {
      setLoginError('Error connecting to server.');
    }
  };

  // Quick show message feedback
  const triggerFeedback = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Update details
  const handleSaveDetails = async () => {
    const updated = {
      chain: editChain,
      supply: editSupply,
      mintDate: editMintDate,
      mintPrice: editMintPrice,
      countdown: editCountdown,
      followXLink: editFollowX,
      likeRepostLink: editLikeRepost,
      shareWebsiteUrl: editShareUrl,
      isWhitelistOpen,
    };

    const success = await onUpdateSettings(updated);
    if (success) {
      triggerFeedback('success', 'Project details saved successfully!');
    } else {
      triggerFeedback('error', 'Failed to update settings.');
    }
  };

  // Toggle whitelist open status directly
  const handleToggleWhitelist = async () => {
    const nextStatus = !isWhitelistOpen;
    setIsWhitelistOpen(nextStatus);
    const success = await onUpdateSettings({ isWhitelistOpen: nextStatus });
    if (success) {
      triggerFeedback('success', `Whitelist registration is now ${nextStatus ? 'OPEN' : 'CLOSED'}`);
    } else {
      setIsWhitelistOpen(!nextStatus); // Revert
      triggerFeedback('error', 'Failed to toggle status.');
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this submission?')) return;

    try {
      const response = await fetch('/api/submissions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id }),
      });
      if (response.ok) {
        setSubmissions(submissions.filter((s) => s.id !== id));
        triggerFeedback('success', 'Submission deleted.');
      } else {
        triggerFeedback('error', 'Failed to delete submission.');
      }
    } catch (err) {
      triggerFeedback('error', 'Error communication with server.');
    }
  };

  // Asset upload helper
  const handleAssetUpload = async (assetType: 'logo' | 'mascot' | 'banner' | 'background' | 'favicon', file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            assetType,
            base64Data,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          triggerFeedback('success', `${assetType.toUpperCase()} asset updated successfully!`);
          // reload window or refresh settings so main display updates
          setTimeout(() => window.location.reload(), 1500);
        } else {
          triggerFeedback('error', data.error || 'Failed to upload asset.');
        }
      } catch (err) {
        triggerFeedback('error', 'Connection error uploading asset.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const search = searchTerm.toLowerCase();
    return (
      sub.username.toLowerCase().includes(search) ||
      sub.wallet.toLowerCase().includes(search) ||
      sub.id.toLowerCase().includes(search)
    );
  });

  // --- Downloads / Exporters ---

  const handleDownloadCSV = () => {
    let csv = "ID,X Username,Wallet Address,Status,Applied At\n";
    filteredSubmissions.forEach((sub) => {
      csv += `${sub.id},@${sub.username},${sub.wallet},${sub.status},${sub.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `hoodlings_whitelist_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(filteredSubmissions, null, 2)], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `hoodlings_whitelist_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Submissions</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #D0E94C; color: #000000; font-family: monospace; font-size: 13px; font-weight: bold; padding: 6px; }
          td { font-family: sans-serif; font-size: 12px; padding: 4px; border: 0.5px solid #E5E7EB; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>X Username</th>
              <th>Wallet Address</th>
              <th>Status</th>
              <th>Applied At</th>
            </tr>
          </thead>
          <tbody>
    `;
    filteredSubmissions.forEach((sub) => {
      html += `
        <tr>
          <td>${sub.id}</td>
          <td>@${sub.username}</td>
          <td>${sub.wallet}</td>
          <td>${sub.status}</td>
          <td>${sub.createdAt}</td>
        </tr>
      `;
    });
    html += "</tbody></table></body></html>";

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `hoodlings_whitelist_export_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Admin login view
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 z-10">
        <div className="absolute w-80 h-80 rounded-full bg-neon-lime/5 blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative text-center">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-5 left-5 text-zinc-500 hover:text-white transition-colors flex items-center space-x-1 font-mono text-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>HOME</span>
          </button>

          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-2">Gatekeepers Lounge</h2>
          <p className="text-zinc-500 text-xs font-mono mb-6 uppercase tracking-wider">
            Protected Admin Access Point
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Enter Admin Key
              </label>
              <input
                type="password"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-2xl py-3 px-4 text-white placeholder-zinc-700 text-center font-mono text-sm transition-all"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-xs font-mono">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-neon-lime hover:bg-neon-lime-hover text-black font-display font-bold rounded-2xl transition-all shadow-lg cursor-pointer text-sm tracking-wider"
            >
              AUTHENTICATE ACCESS
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto z-10 flex flex-col">
      
      {/* Toast Feedbacks */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-green-500/90 backdrop-blur-md text-black font-mono text-xs font-bold py-3 px-5 rounded-xl shadow-2xl border border-green-400 flex items-center space-x-2">
          <Check size={16} strokeWidth={3} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-5 right-5 z-50 bg-red-500/90 backdrop-blur-md text-white font-mono text-xs font-bold py-3 px-5 rounded-xl shadow-2xl border border-red-400 flex items-center space-x-2">
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-neon-lime uppercase tracking-widest mb-1">
            <Lock size={12} />
            <span>CONTROL CENTER</span>
            <span>•</span>
            <span className="text-white bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 text-[10px]">AUTH GRANTED</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            HoodLings Whitelist Admin
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => loadSubmissions()}
            className="p-3 bg-zinc-900 border border-white/5 hover:border-neon-lime/30 hover:bg-zinc-800 text-gray-400 hover:text-neon-lime rounded-2xl transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={onClose}
            className="p-3 bg-zinc-900 border border-white/5 hover:border-white/20 text-gray-400 hover:text-white rounded-2xl transition-all flex items-center space-x-1.5 font-mono text-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>LEAVE LOUNGE</span>
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
            }}
            className="p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black text-red-400 rounded-2xl transition-all flex items-center space-x-1.5 font-mono text-xs cursor-pointer ml-auto md:ml-0"
          >
            <LogOut size={14} />
            <span>LOCK</span>
          </button>
        </div>
      </header>

      {/* Top Cards (Metrics / Action triggers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Total Submissions</span>
            <span className="text-3xl font-mono font-bold text-white">{submissions.length}</span>
          </div>
          <div className="w-10 h-10 bg-neon-lime/10 border border-neon-lime/20 text-neon-lime rounded-xl flex items-center justify-center">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Whitelist Status</span>
            <span className={`text-sm font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isWhitelistOpen ? 'text-green-400' : 'text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isWhitelistOpen ? 'bg-green-400 animate-ping' : 'bg-red-400'}`} />
              {isWhitelistOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <button
            onClick={handleToggleWhitelist}
            className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all border cursor-pointer ${
              isWhitelistOpen 
                ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black' 
                : 'bg-green-500/10 border-green-500/20 hover:bg-green-500 text-green-400 hover:text-black'
            }`}
          >
            {isWhitelistOpen ? 'CLOSE' : 'OPEN'}
          </button>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Ecosystem Chain</span>
            <span className="text-lg font-mono font-bold text-neon-lime">{settings.chain}</span>
          </div>
          <div className="w-10 h-10 bg-zinc-900 border border-white/10 text-zinc-400 rounded-xl flex items-center justify-center text-xs font-mono font-bold">
            RH
          </div>
        </div>

        {/* 72-Hour Timer Control Card */}
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block truncate">72H Whitelist Timer</span>
            <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${
              settings.whitelistTimerTarget && timerTimeLeft !== 'EXPIRED' ? 'text-neon-lime' : 'text-zinc-500'
            }`}>
              {settings.whitelistTimerTarget && timerTimeLeft !== 'EXPIRED' ? `${timerTimeLeft}` : 'INACTIVE'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {settings.whitelistTimerTarget ? (
              <>
                <button
                  onClick={async () => {
                    const targetTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
                    const success = await onUpdateSettings({ 
                      whitelistTimerTarget: targetTime,
                      isWhitelistOpen: true // Auto open whitelist when timer begins
                    });
                    if (success) {
                      setIsWhitelistOpen(true);
                      triggerFeedback('success', '72-Hour Whitelist Timer RESTARTED!');
                    } else {
                      triggerFeedback('error', 'Failed to restart timer.');
                    }
                  }}
                  className="px-2 py-1 bg-neon-lime/10 border border-neon-lime/30 hover:bg-neon-lime text-neon-lime hover:text-black rounded-lg font-mono text-[9px] font-bold transition-all cursor-pointer uppercase tracking-wider text-center"
                >
                  Restart
                </button>
                <button
                  onClick={async () => {
                    const success = await onUpdateSettings({ whitelistTimerTarget: "" });
                    if (success) {
                      triggerFeedback('success', '72-Hour Whitelist timer cancelled.');
                    } else {
                      triggerFeedback('error', 'Failed to cancel timer.');
                    }
                  }}
                  className="px-2 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black rounded-lg font-mono text-[9px] font-bold transition-all cursor-pointer uppercase tracking-wider text-center"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  const targetTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
                  const success = await onUpdateSettings({ 
                    whitelistTimerTarget: targetTime,
                    isWhitelistOpen: true // Auto open whitelist when timer begins
                  });
                  if (success) {
                    setIsWhitelistOpen(true);
                    triggerFeedback('success', '72-Hour Whitelist Timer STARTED!');
                  } else {
                    triggerFeedback('error', 'Failed to start timer.');
                  }
                }}
                className="px-2.5 py-1.5 bg-neon-lime/10 border border-neon-lime/30 hover:bg-neon-lime text-neon-lime hover:text-black rounded-xl font-mono text-[9px] font-bold transition-all cursor-pointer uppercase tracking-wider text-center"
              >
                Start 72h
              </button>
            )}
          </div>
        </div>

        {/* Mint / Launch Timer Control Card */}
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block truncate">Mint/Launch Timer</span>
              <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                settings.countdown && mintTimerTimeLeft && mintTimerTimeLeft !== 'EXPIRED' ? 'text-neon-lime' : 'text-zinc-500'
              }`}>
                {settings.countdown && mintTimerTimeLeft && mintTimerTimeLeft !== 'EXPIRED' ? `${mintTimerTimeLeft}` : 'INACTIVE'}
              </span>
            </div>
            {settings.countdown && settings.countdown !== 'TBA' && settings.countdown !== 'SOON' && (
              <button
                onClick={async () => {
                  const success = await onUpdateSettings({ countdown: "TBA" });
                  if (success) {
                    setEditCountdown("TBA");
                    triggerFeedback('success', 'Mint timer cleared/reset to TBA.');
                  } else {
                    triggerFeedback('error', 'Failed to reset timer.');
                  }
                }}
                className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black rounded-md font-mono text-[8px] font-bold transition-all cursor-pointer uppercase"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex gap-1 items-center">
            <div className="relative flex-grow">
              <input
                type="number"
                value={mintTimerHours}
                onChange={(e) => setMintTimerHours(e.target.value)}
                placeholder="Hrs"
                className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-lg py-1 px-1.5 text-white text-[10px] font-mono"
                min="1"
              />
            </div>
            <button
              onClick={async () => {
                const hours = parseFloat(mintTimerHours);
                if (isNaN(hours) || hours <= 0) {
                  triggerFeedback('error', 'Please enter a valid number of hours.');
                  return;
                }
                const targetTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
                const success = await onUpdateSettings({ countdown: targetTime });
                if (success) {
                  setEditCountdown(targetTime);
                  triggerFeedback('success', `Mint Timer set for ${hours} hours!`);
                } else {
                  triggerFeedback('error', 'Failed to start mint timer.');
                }
              }}
              className="px-2 py-1.5 bg-neon-lime text-black rounded-lg font-mono text-[9px] font-bold transition-all cursor-pointer uppercase tracking-wider font-extrabold shrink-0"
            >
              Start
            </button>
          </div>
        </div>

      </div>

      {/* Main Configuration Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left Side (8 cols): Submissions database */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-lg text-white">Submissions Database</h3>
                <p className="text-xs text-zinc-500">Monitor, filter, and export applications</p>
              </div>

              {/* Downloader buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 bg-zinc-900 border border-white/10 hover:border-neon-lime/30 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-300 hover:text-neon-lime rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download size={12} />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="px-3 py-1.5 bg-zinc-900 border border-white/10 hover:border-neon-lime/30 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-300 hover:text-neon-lime rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download size={12} />
                  <span>EXCEL</span>
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="px-3 py-1.5 bg-zinc-900 border border-white/10 hover:border-neon-lime/30 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-300 hover:text-neon-lime rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download size={12} />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search by X username or wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/60 border border-white/5 focus:border-neon-lime focus:outline-none rounded-2xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-600 font-mono text-xs transition-all"
              />
            </div>

            {/* Submissions table/list */}
            <div className="overflow-x-auto rounded-xl border border-white/5 max-h-[460px] overflow-y-auto">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-2">
                  <RefreshCw size={24} className="animate-spin text-neon-lime" />
                  <span>Synchronizing database files...</span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="py-20 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                  No applications found
                </div>
              ) : (
                <table className="w-full text-left font-mono text-[11px] md:text-xs">
                  <thead>
                    <tr className="bg-zinc-900/80 border-b border-white/10 text-zinc-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-semibold">User</th>
                      <th className="py-3.5 px-4 font-semibold">Wallet Address</th>
                      <th className="py-3.5 px-4 font-semibold">Applied At</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[2%] transition-all">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-neon-lime font-bold">@{sub.username}</span>
                            <span className="text-[9px] text-zinc-600">ID: {sub.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 break-all select-all font-medium font-mono text-[10px] md:text-xs">
                          {sub.wallet}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-[10px]">
                          {new Date(sub.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5">
              <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
              <span>All exports generate instant clean formats</span>
            </div>

          </div>
        </div>

        {/* Right Side (4 cols): Configuration Options */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section 1: Project Details Form */}
          <div className="bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-lg text-white border-b border-white/10 pb-3 flex items-center space-x-2">
              <Settings size={16} className="text-neon-lime" />
              <span>Project Meta Config</span>
            </h3>

            <div className="space-y-3 font-mono text-[11px] md:text-xs">
              
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Blockchain network</label>
                <input
                  type="text"
                  value={editChain}
                  onChange={(e) => setEditChain(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Supply Size</label>
                <input
                  type="text"
                  value={editSupply}
                  onChange={(e) => setEditSupply(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Mint Date</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editMintDate}
                    onChange={(e) => setEditMintDate(e.target.value)}
                    className="flex-grow bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                  />
                  <button
                    onClick={async () => {
                      const success = await onUpdateSettings({ mintDate: editMintDate });
                      if (success) triggerFeedback('success', 'Mint Date updated on website!');
                      else triggerFeedback('error', 'Failed to update Mint Date.');
                    }}
                    className="px-3 bg-neon-lime hover:bg-neon-lime-hover text-black font-bold text-[10px] rounded-xl font-mono uppercase tracking-wider cursor-pointer font-extrabold"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Mint Price</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editMintPrice}
                    onChange={(e) => setEditMintPrice(e.target.value)}
                    className="flex-grow bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                  />
                  <button
                    onClick={async () => {
                      const success = await onUpdateSettings({ mintPrice: editMintPrice });
                      if (success) triggerFeedback('success', 'Mint Price updated on website!');
                      else triggerFeedback('error', 'Failed to update Mint Price.');
                    }}
                    className="px-3 bg-neon-lime hover:bg-neon-lime-hover text-black font-bold text-[10px] rounded-xl font-mono uppercase tracking-wider cursor-pointer font-extrabold"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Countdown / TBA (ISO Date or Text)</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-08-15T00:00:00 or TBA"
                  value={editCountdown}
                  onChange={(e) => setEditCountdown(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">X Follow Link (Step 1)</label>
                <input
                  type="text"
                  value={editFollowX}
                  onChange={(e) => setEditFollowX(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Post Repost/Like Link (Step 2)</label>
                <input
                  type="text"
                  value={editLikeRepost}
                  onChange={(e) => setEditLikeRepost(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-wide">Pre-filled Website URL (X Share)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editShareUrl}
                  onChange={(e) => setEditShareUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

            </div>

            <button
              onClick={handleSaveDetails}
              className="w-full py-2.5 mt-2 bg-neon-lime hover:bg-neon-lime-hover text-black font-display font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider"
              id="save-settings-btn"
            >
              SAVE META CONFIG
            </button>
          </div>

          {/* Section 2: Uploads / Replacer Panel */}
          <div className="bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-lg text-white border-b border-white/10 pb-3 flex items-center space-x-2">
              <Upload size={16} className="text-neon-lime" />
              <span>Asset File Replacer</span>
            </h3>
            
            <p className="text-[10px] font-mono text-zinc-500">
              Drag-select or tap on buttons below to overwrite project images on server instantly:
            </p>

            <div className="space-y-3 text-xs font-mono">
              {[
                { label: 'Project Logo', type: 'logo' as const },
                { label: 'Hero Mascot', type: 'mascot' as const },
                { label: 'Project Banner', type: 'banner' as const },
                { label: 'Site Background', type: 'background' as const },
                { label: 'Browser Favicon', type: 'favicon' as const },
              ].map((asset) => (
                <div key={asset.type} className="flex items-center justify-between bg-zinc-900/50 p-2.5 rounded-xl border border-white/5 hover:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-zinc-300 font-bold text-[11px]">{asset.label}</span>
                    <span className="text-[9px] text-zinc-600">/assets/{asset.type}.png</span>
                  </div>
                  <label className="p-2 bg-zinc-800 hover:bg-neon-lime hover:text-black text-gray-300 rounded-lg border border-white/10 hover:border-transparent transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1">
                    <Upload size={10} />
                    <span>REPLACE</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAssetUpload(asset.type, file);
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
