import { useState } from 'react';
import { Twitter, Heart, Repeat, Wallet, ArrowRight, ArrowLeft, Check, Loader2, Share2, ExternalLink } from 'lucide-react';
import { ProjectSettings } from '../types';

interface WhitelistFlowProps {
  settings: ProjectSettings;
  onClose: () => void;
}

export default function WhitelistFlow({ settings, onClose }: WhitelistFlowProps) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [likedAndReposted, setLikedAndReposted] = useState(false);
  const [wallet, setWallet] = useState('');
  const [walletError, setWalletError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Step 1: Follow HoodLings
  const handleNextStep1 = () => {
    if (!username.trim()) return;
    setStep(2);
  };

  // Step 2: Like & Repost
  const handleNextStep2 = () => {
    if (!likedAndReposted) return;
    setStep(3);
  };

  // Step 3: Wallet
  const handleNextStep3 = () => {
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmRegex.test(wallet)) {
      setWalletError('Invalid EVM wallet format. Must start with 0x and be 40 hex characters.');
      return;
    }
    setWalletError('');
    setStep(4);
  };

  // Step 4: Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim().replace('@', ''),
          wallet: wallet.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application.');
      }

      setStep(5);
    } catch (err: any) {
      setSubmissionError(err.message || 'Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: X Share helper
  const handleShareOnX = () => {
    const defaultUrl = window.location.origin;
    const shareUrl = settings.shareWebsiteUrl || defaultUrl;
    const text = `Just applied for the @hoodlingsHQ Whitelist! 🟢 Join the Hood and secure your spot before it's too late! 🚀\n👉 ${shareUrl}\n#HoodLings #RobinHood #NFT`;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  // Total Steps
  const totalSteps = 5;
  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 z-10">
      
      {/* Background Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-neon-lime/5 blur-[100px] pointer-events-none -z-10" />

      {/* Main Flow Card */}
      <div className="w-full max-w-lg bg-zinc-950/75 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle accent border at top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-neon-lime to-transparent" />

        {/* Back to Home Button (Except Success step) */}
        {step < 5 && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors duration-200 text-xs font-mono"
          >
            ESC / Cancel
          </button>
        )}

        {/* Progress Bar Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-500 mb-2">
            <span className="uppercase tracking-widest text-neon-lime">APPLICATION IN PROGRESS</span>
            <span>STEP {step} OF {totalSteps}</span>
          </div>

          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-neon-lime transition-all duration-500 ease-out shadow-[0_0_8px_rgba(208,233,76,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Step circles */}
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] border transition-all duration-300 ${
                  s < step
                    ? 'bg-neon-lime border-neon-lime text-black'
                    : s === step
                    ? 'bg-black border-neon-lime text-neon-lime shadow-[0_0_8px_rgba(208,233,76,0.4)] font-bold'
                    : 'bg-black border-white/10 text-zinc-600'
                }`}
              >
                {s < step ? <Check size={10} strokeWidth={3} /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Follow HoodLings */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-neon-lime/10 border border-neon-lime/20 text-neon-lime rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Twitter size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">Follow HoodLings</h2>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                Join our official HoodLings community on X/Twitter to stay updated with mint announcements.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={settings.followXLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-neon-lime/30 rounded-2xl flex items-center justify-between text-sm transition-all duration-300 group font-mono cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#1DA1F2]/10 rounded-lg flex items-center justify-center text-[#1DA1F2]">
                    <Twitter size={16} />
                  </div>
                  <span className="text-white font-medium">Follow @hoodlingsHQ</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-neon-lime">
                  <span>Open Twitter</span>
                  <ExternalLink size={12} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Your X / Twitter Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-neon-lime focus:outline-none rounded-2xl py-3.5 pl-9 pr-4 text-white placeholder-zinc-600 font-mono text-sm transition-all duration-300"
                    id="x-username-input"
                  />
                </div>
              </div>

              <button
                disabled={!username.trim()}
                onClick={handleNextStep1}
                className="w-full py-4 px-6 bg-neon-lime hover:bg-neon-lime-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-display font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer"
                id="step-1-next"
              >
                <span>CONTINUE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Like & Repost */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-neon-lime/10 border border-neon-lime/20 text-neon-lime rounded-2xl flex items-center justify-center mx-auto mb-3">
                <div className="flex space-x-0.5">
                  <Heart size={16} className="text-red-500" />
                  <Repeat size={16} className="text-green-500" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">Like & Repost</h2>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                Support the official HoodLings launch post. Open the post, drop a like and repost.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={settings.likeRepostLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-neon-lime/30 rounded-2xl flex items-center justify-between text-sm transition-all duration-300 group font-mono cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neon-lime/10 rounded-lg flex items-center justify-center text-neon-lime">
                    <Repeat size={14} />
                  </div>
                  <span className="text-white font-medium">Open Whitelist Post</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-neon-lime">
                  <span>Go to Post</span>
                  <ExternalLink size={12} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>

              {/* Confirmation Checker Card */}
              <button
                onClick={() => setLikedAndReposted(!likedAndReposted)}
                className={`w-full py-4 px-4 border rounded-2xl flex items-center justify-between text-sm transition-all duration-300 font-mono cursor-pointer text-left ${
                  likedAndReposted
                    ? 'bg-neon-lime/10 border-neon-lime text-neon-lime'
                    : 'bg-zinc-950 border-white/10 hover:border-white/20 text-zinc-400'
                }`}
                id="confirm-action-btn"
              >
                <span>I have Liked & Reposted the tweet</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  likedAndReposted ? 'bg-neon-lime border-neon-lime text-black' : 'border-white/20'
                }`}>
                  {likedAndReposted && <Check size={14} strokeWidth={3} />}
                </div>
              </button>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center space-x-1 font-mono transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  <span>BACK</span>
                </button>
                <button
                  disabled={!likedAndReposted}
                  onClick={handleNextStep2}
                  className="w-2/3 py-4 bg-neon-lime hover:bg-neon-lime-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-display font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer animate-pulse-once"
                  id="step-2-next"
                >
                  <span>CONTINUE</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Wallet */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-neon-lime/10 border border-neon-lime/20 text-neon-lime rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wallet size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">EVM Wallet Address</h2>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                Submit an Ethereum/EVM compatible address (Metamask, Rabby, Coinbase Wallet etc.) where you wish to receive whitelist privileges.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Your EVM Wallet Address (0x...)
                </label>
                <input
                  type="text"
                  placeholder="0x0000000000000000000000000000000000000000"
                  value={wallet}
                  onChange={(e) => {
                    setWallet(e.target.value);
                    if (walletError) setWalletError('');
                  }}
                  className="w-full bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-neon-lime focus:outline-none rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 font-mono text-xs md:text-sm transition-all duration-300"
                  id="wallet-address-input"
                />
                {walletError && (
                  <p className="text-red-400 text-[11px] font-mono mt-1">{walletError}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-4 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center space-x-1 font-mono transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  <span>BACK</span>
                </button>
                <button
                  disabled={!wallet.trim()}
                  onClick={handleNextStep3}
                  className="w-2/3 py-4 bg-neon-lime hover:bg-neon-lime-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-display font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer"
                  id="step-3-next"
                >
                  <span>CONTINUE</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review Details */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl font-bold text-white">Review Application</h2>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                Double check your inputs before casting your whitelist bid. Applications are final.
              </p>
            </div>

            <div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-5 space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-zinc-500 uppercase">Clan</span>
                <span className="text-white font-bold">HoodLings</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-zinc-500 uppercase">X / Twitter</span>
                <span className="text-neon-lime font-bold">@{username.replace('@', '')}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-zinc-500 uppercase">EVM Wallet</span>
                <span className="text-zinc-300 break-all bg-black/40 p-2.5 rounded border border-white/5 font-bold">
                  {wallet}
                </span>
              </div>
            </div>

            {submissionError && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3.5 rounded-2xl font-mono text-xs text-center">
                {submissionError}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setStep(3)}
                className="w-1/3 py-4 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center space-x-1 font-mono transition-all duration-200 disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                <span>BACK</span>
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-2/3 py-4 bg-neon-lime hover:bg-neon-lime-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-display font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer"
                id="submit-whitelist-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>CASTING BID...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT APPLICATION</span>
                    <Check size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success & Share on X */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-neon-lime text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(208,233,76,0.6)] animate-bounce">
                <Check size={36} strokeWidth={3} />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold text-neon-lime neon-glow-text">Application Cast!</h2>
                <p className="text-zinc-300 text-sm font-medium">
                  Your bid for HoodLings whitelist is secured!
                </p>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                  Verification is running. To cement your position in the hood, spread the word on X/Twitter.
                </p>
              </div>
            </div>

            {/* Glowing Big Share on X Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleShareOnX}
                className="w-full group py-4 px-6 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-display font-bold rounded-2xl flex items-center justify-center space-x-2.5 transition-all duration-300 shadow-lg shadow-[#1DA1F2]/20 cursor-pointer"
                id="share-on-x-btn"
              >
                <Twitter size={18} fill="currentColor" />
                <span>SHARE ON X / TWITTER</span>
                <Share2 size={16} className="transform group-hover:scale-110 transition-transform" />
              </button>
              
              <p className="text-center text-[10px] font-mono text-zinc-500">
                You can return and finish your application after sharing!
              </p>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200 mt-4 cursor-pointer"
                id="success-done-btn"
              >
                COMPLETE & RETURN HOME
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
