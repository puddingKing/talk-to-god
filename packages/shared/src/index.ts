export interface RepresentativeWork {
  title: string;
  year?: number;
  intro?: string;
}

export interface Philosopher {
  philosopherId: string;
  name: string;
  nameEn?: string;
  avatarUrl?: string;
  birthYear?: number;
  deathYear?: number;
  school: string[];
  era?: string;
  region?: string;
  tagline?: string;
  bio?: string;
  keyConcepts: string[];
  representativeWorks: RepresentativeWork[];
  openingLine?: string;
}

export interface PhilosopherDetail extends Philosopher {
  personaPrompt?: string;
}

export interface PhilosopherInput {
  id: string;
  name: string;
  nameEn?: string;
  avatarUrl?: string;
  birthYear?: number;
  deathYear?: number;
  school: string[];
  era?: string;
  region?: string;
  tagline?: string;
  bio?: string;
  keyConcepts: string[];
  representativeWorks: RepresentativeWork[];
  personaPrompt: string;
  openingLine?: string;
}

export type PhilosopherAdmin = PhilosopherInput;

export interface Conversation {
  id: string;
  philosopherId: string;
  philosopherName: string;
  philosopherAvatar?: string;
  title?: string;
  lastMessage?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatStreamEvent {
  type: "token" | "done" | "error";
  content?: string;
  messageId?: string;
}

export interface AuthUser {
  id: string;
  phone?: string;
  nickname?: string;
  isGuest: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface GuestQuota {
  isGuest: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export interface UserAdmin {
  id: string;
  phone?: string;
  nickname?: string;
  guestId?: string;
  isGuest: boolean;
  lastIp?: string;
  region?: string;
  lastSeenAt?: string;
  createdAt: string;
  conversationCount: number;
}

export interface UserAdminUpdate {
  nickname?: string;
  password?: string;
}
