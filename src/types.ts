export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  plan?: 'free_trial' | 'starter' | 'pro';
  planStartDate?: string;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  artistName: string;
  bio: string;
  genres: string[];
  targetTone: string; // e.g. "Professional & Humble", "Energetic & Bold", "Artistic & Deep"
  defaultSignature?: string;
  createdAt: string;
  customToneInstruction?: string;
  defaultLength?: 'small' | 'medium' | 'larger';
}

export interface Demo {
  id: string;
  userId: string;
  title: string;
  link: string; // soundcloud, dropbox, drive, etc.
  description: string;
  mood: string;
  genre: string;
  createdAt: string;
}

export interface Target {
  id: string;
  userId: string;
  name: string;
  email: string;
  type: 'label' | 'playlist' | 'blog' | 'curator';
  details: string; // custom context about this curator
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  email: string;
  website: string;
  instagram?: string;
  genre: 'Afro House' | 'Minimal / Deep Tech' | 'Tech House' | 'House' | 'Deep House' | 'Melodic House' | 'Disco House' | 'Latin House' | 'Electronic / Other' | string;
  region: string; // e.g. "Germany", "United Kingdom", "United States", "Brazil", "Netherlands", "Ibiza / Spain"
  notes: string;
  bestFitDescription: string;
  status: 'Open' | 'Closed' | 'Under Review';
  verificationStatus?: 'verified' | 'unverified' | 'needs_review';
  lastContactedAt?: string;
  isFavorite?: boolean;
}

export interface Outreach {
  id: string;
  userId: string;
  demoId: string;
  targetId: string; // Can be target_ prefixed or label_ prefixed
  targetName?: string;
  targetEmail?: string;
  status: 'draft' | 'approved' | 'sent';
  emailSubject: string;
  emailBody: string;
  gmailDraftId?: string;
  sentAt?: string;
  createdAt: string;
  responseStatus?: 'no_reply' | 'replied_interested' | 'replied_passed';
  responseBody?: string;
  respondedAt?: string;
}

export interface DashboardStats {
  totalOutreach: number;
  draftsCount: number;
  sentCount: number;
  outreachToday: number;
  plan: 'free_trial' | 'starter' | 'pro';
  planDaysRemaining: number;
  dailyPitchLimit: number;
}
