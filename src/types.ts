export interface WhitelistApp {
  id: string;
  username: string;
  wallet: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ProjectSettings {
  followXLink: string;
  likeRepostLink: string;
  isWhitelistOpen: boolean;
  chain: string;
  supply: string;
  mintDate: string;
  mintPrice: string;
  countdown: string; // Target date for countdown (e.g. ISO string or 'TBA')
  logoUrl: string;
  mascotUrl: string;
  bannerUrl: string;
  backgroundUrl: string;
  faviconUrl: string;
  shareWebsiteUrl: string; // Configurable from admin panel!
  whitelistTimerTarget?: string; // ISO target timestamp for 72h timer, if active
}
