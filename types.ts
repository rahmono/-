

export enum UserRole {
  BUILDER = 'BUILDER',
  BUYER = 'BUYER',
  MANAGER = 'MANAGER', // New Distinct Role
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export enum ApartmentStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD'
}

export type VerificationStatus = 'BASIC' | 'PENDING' | 'VERIFIED';

export interface Point {
  x: number;
  y: number;
}

export interface Apartment {
  id: string;
  floorPlanId: string;
  unitNumber: string;
  rooms: number;
  areaSqFt: number;
  price: number;
  status: ApartmentStatus;
  shape: Point[]; // Array of coordinates in percentage (0-100)
  ownerId?: string | null; // ID of the user who reserved/bought this unit
  proofImageUrl?: string; // URL of the uploaded certificate
}

export interface FloorPlan {
  id: string;
  buildingId: string;
  floorLevel: number;
  imageUrl: string;
  apartments: Apartment[];
}

export interface Building {
  id: string;
  projectId: string;
  name: string;
  totalFloors: number;
}

export interface BuilderCompany {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    foundedYear: number;
    finishedProjectsCount: number;
    underConstructionCount: number;
    address: string;
    phone: string;
    email: string;
}

export interface ManagerPermissions {
    canChatCommunity: boolean; // Write in project chats
    canProcessClaims: boolean; // Approve/Reject PENDING sales
    canSupportChat: boolean;   // Answer support inquiries
    canManageInventory: boolean; // Add/Edit apartments
}

export interface Manager {
    id: string;
    builderId: string;
    userId: string;
    name: string;
    avatarUrl: string;
    phone: string;
    permissions: ManagerPermissions;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string; // Kept for backward compatibility/list view
  images: string[]; // New: Array of images for slider
  location: string;
  latitude?: number;
  longitude?: number;
  builderId: string; // Link to the construction company
}

export interface ChatMessage {
  id: string;
  chatId: string; // Changed from projectId to generic chatId
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  type: 'text' | 'image';
}

export interface ChatSession {
    id: string;
    type: 'COMMUNITY' | 'SUPPORT';
    name: string;
    subtext: string;
    projectId: string; // Reference to the parent project
}

export interface IdVerificationRequest {
    id: string;
    userId: string;
    userName: string;
    idFrontUrl: string;
    idBackUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp: number;
}

export interface BuilderApplication {
    id: string;
    userId: string;
    companyName: string;
    address: string;
    licenseUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp: number;
}

// Admin Specific Types
export interface SystemStats {
    totalUsers: number;
    totalBuilders: number;
    totalProjects: number;
    totalBuildings: number;
    activeUsersOnline: number;
    verifiedUsersCount: number;
    pendingVerifications: number;
}

export interface AdminUserView {
    id: string;
    name: string;
    role: UserRole;
    phone: string;
    status: 'ACTIVE' | 'BLOCKED';
    isVerified: boolean;
    joinedDate: number;
}

// Navigation types
export type ScreenName = 
  | 'HOME'
  | 'BUILDER_DASHBOARD'
  | 'BUILDER_PROJECT_CREATE'
  | 'BUILDER_PROJECT_DETAIL'
  | 'BUILDER_MY_PROJECTS'
  | 'BUILDER_BUILDING_CREATE'
  | 'BUILDER_BUILDING_DETAIL'
  | 'BUILDER_FLOOR_EDIT'
  | 'BUILDER_MANAGERS'
  | 'BUYER_PROJECT_LIST'
  | 'BUYER_PROJECT_DETAIL'
  | 'BUYER_BUILDING_DETAIL'
  | 'BUYER_FLOOR_VIEW'
  | 'BUYER_CHAT_LIST'
  | 'BUYER_CHAT_ROOM'
  | 'BUYER_MY_HOME'
  | 'BUYER_PROFILE'
  | 'BUYER_ID_VERIFICATION'
  | 'BUYER_BECOME_BUILDER'
  | 'BUYER_BUILDER_PROFILE'
  | 'MODERATOR_DASHBOARD'
  | 'ADMIN_DASHBOARD';