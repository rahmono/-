

import { Project, Building, FloorPlan, Apartment, ApartmentStatus, ChatMessage, ChatSession, BuilderCompany, IdVerificationRequest, BuilderApplication, VerificationStatus, Manager, ManagerPermissions, SystemStats, AdminUserView, UserRole } from '../types';

// Mock Builder Companies
const MOCK_BUILDERS: BuilderCompany[] = [
    {
        id: 'c1',
        name: 'Golden State Construction',
        description: 'Building dreams since 1995. We specialize in luxury high-rise apartments and sustainable living environments. Winner of "Best Developer" 2023.',
        logoUrl: 'https://ui-avatars.com/api/?name=Golden+State&background=fbbf24&color=fff&size=200',
        foundedYear: 1995,
        finishedProjectsCount: 42,
        underConstructionCount: 5,
        address: '123 Market St, San Francisco, CA',
        phone: '+1 (555) 123-4567',
        email: 'info@goldenstate.com'
    },
    {
        id: 'c2',
        name: 'Urban Future Ltd',
        description: 'Modern architecture for modern people. Transforming city skylines with innovative designs and smart home technology.',
        logoUrl: 'https://ui-avatars.com/api/?name=Urban+Future&background=4f46e5&color=fff&size=200',
        foundedYear: 2008,
        finishedProjectsCount: 18,
        underConstructionCount: 3,
        address: '456 Broadway, New York, NY',
        phone: '+1 (555) 987-6543',
        email: 'sales@urbanfuture.com'
    }
];

// Initial Mock Data
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Sunset Heights',
    description: 'Luxury living by the bay with stunning sunset views. Features state-of-the-art amenities including a rooftop pool, gym, and 24/7 security.',
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    thumbnailUrl: 'https://picsum.photos/800/600?random=1',
    images: [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=13'
    ],
    builderId: 'c1'
  },
  {
    id: 'p2',
    name: 'Urban Loft Central',
    description: 'Modern industrial lofts in the heart of downtown. Open concept living spaces with high ceilings and exposed brick walls.',
    location: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    thumbnailUrl: 'https://picsum.photos/800/600?random=2',
    images: [
        'https://picsum.photos/800/600?random=2',
        'https://picsum.photos/800/600?random=21',
        'https://picsum.photos/800/600?random=22'
    ],
    builderId: 'c2'
  }
];

const MOCK_BUILDINGS: Building[] = [
  { id: 'b1', projectId: 'p1', name: 'Tower A', totalFloors: 10 },
  { id: 'b2', projectId: 'p1', name: 'Tower B', totalFloors: 8 },
  { id: 'b3', projectId: 'p2', name: 'Main Brick', totalFloors: 5 },
];

const MOCK_FLOOR_PLANS: FloorPlan[] = [
  {
    id: 'fp1',
    buildingId: 'b1',
    floorLevel: 1,
    imageUrl: 'https://picsum.photos/1000/800?random=10', // Placeholder for a floor plan
    apartments: []
  }
];

// Mock Users for Search Simulation and Admin View
// Added 'status' field to mock users for admin management
const MOCK_USERS = [
    { id: 'u_mgr1', name: 'Alice Manager', phone: '+992999999999', verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=a', role: UserRole.MANAGER, status: 'ACTIVE' },
    { id: 'u_mgr2', name: 'Bob Sales', phone: '+992888888888', verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=b', role: UserRole.MANAGER, status: 'ACTIVE' },
    { id: 'u_user3', name: 'Charlie New', phone: '+992777777777', verified: false, avatarUrl: 'https://i.pravatar.cc/150?u=c', role: UserRole.BUYER, status: 'ACTIVE' },
    { id: 'u_mod1', name: 'System Moderator', phone: '+992100100100', verified: true, avatarUrl: 'https://i.pravatar.cc/150?u=m', role: UserRole.MODERATOR, status: 'ACTIVE' },
    { id: 'c1', name: 'Golden State Rep', phone: '+992555123456', verified: true, avatarUrl: 'https://ui-avatars.com/api/?name=Golden+State&background=fbbf24', role: UserRole.BUILDER, status: 'ACTIVE' },
    { id: 'c2', name: 'Urban Future Rep', phone: '+992555987654', verified: true, avatarUrl: 'https://ui-avatars.com/api/?name=Urban+Future&background=4f46e5', role: UserRole.BUILDER, status: 'ACTIVE' }
];

// In-memory storage simulation
let projects = [...MOCK_PROJECTS];
let buildings = [...MOCK_BUILDINGS];
let floorPlans = [...MOCK_FLOOR_PLANS];
let managers: Manager[] = [];
// This needs to be mutable to support registration
let users = [...MOCK_USERS]; 

// Mock Messages Store: { chatId: ChatMessage[] }
let messages: Record<string, ChatMessage[]> = {
    'p1': [
        { id: 'm1', chatId: 'p1', senderId: 'system', senderName: 'System', text: 'Welcome to the Sunset Heights community chat!', timestamp: Date.now() - 100000, type: 'text' },
        { id: 'm2', chatId: 'p1', senderId: 'other1', senderName: 'Alice (Tower A, 102)', text: 'Hi everyone, excited to move in!', timestamp: Date.now() - 50000, type: 'text' }
    ]
};
// Track active support chats: Set<chatId>
const activeSupportChats = new Set<string>();

// Moderator Storage
let verificationRequests: IdVerificationRequest[] = [];
let builderApplications: BuilderApplication[] = [];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Observer pattern for real-time updates simulation
type Listener = () => void;
const listeners: Set<Listener> = new Set();
const notifyListeners = () => listeners.forEach(l => l());

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const api = {
  // --- AUTH API ---
  loginOrRegister: async (phone: string): Promise<{user: any, isNew: boolean}> => {
      await delay(800);
      const existingUser = users.find(u => u.phone === phone);
      
      if (existingUser) {
          return { user: existingUser, isNew: false };
      } else {
          // Register new user
          const newUser = {
              id: 'u_' + Math.random().toString(36).substr(2, 9),
              name: '', // Empty name as requested, set later by verify or profile
              phone: phone,
              verified: false,
              avatarUrl: `https://ui-avatars.com/api/?name=User&background=random`,
              role: UserRole.BUYER,
              status: 'ACTIVE'
          };
          users.push(newUser);
          notifyListeners();
          return { user: newUser, isNew: true };
      }
  },

  getProjects: async (): Promise<Project[]> => {
    await delay(300);
    return projects;
  },

  createProject: async (project: Omit<Project, 'id' | 'thumbnailUrl'>): Promise<Project> => {
    await delay(300);
    const newProject: Project = { 
        ...project, 
        id: Math.random().toString(36).substr(2, 9),
        thumbnailUrl: project.images.length > 0 ? project.images[0] : 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 1000)
    };
    projects = [...projects, newProject];
    notifyListeners();
    return newProject;
  },

  // Builder API
  getBuilder: async (builderId: string): Promise<BuilderCompany | undefined> => {
      await delay(200);
      return MOCK_BUILDERS.find(b => b.id === builderId);
  },

  getBuilderProjects: async (builderId: string): Promise<Project[]> => {
      await delay(200);
      
      // Check if this ID is a manager
      const manager = managers.find(m => m.userId === builderId);
      const targetId = manager ? manager.builderId : builderId;

      return projects.filter(p => p.builderId === targetId);
  },

  getBuildings: async (projectId: string): Promise<Building[]> => {
    await delay(200);
    return buildings.filter(b => b.projectId === projectId);
  },

  getAllBuildings: async (): Promise<Building[]> => {
    await delay(200);
    return buildings;
  },

  createBuilding: async (
    building: Omit<Building, 'id'>, 
    templateData?: { imageUrl: string; apartments: Apartment[] }
  ): Promise<Building> => {
    await delay(500);
    const newBuilding = { ...building, id: Math.random().toString(36).substr(2, 9) };
    buildings = [...buildings, newBuilding];

    // If a template is provided, generate floor plans for all floors
    if (templateData) {
        const newFloorPlans: FloorPlan[] = [];
        
        for (let i = 1; i <= building.totalFloors; i++) {
            const floorId = Math.random().toString(36).substr(2, 9);
            
            // Replicate apartments
            const floorApartments: Apartment[] = templateData.apartments.map(apt => ({
                ...apt,
                id: Math.random().toString(36).substr(2, 9),
                floorPlanId: floorId,
                // Auto-generate unit number: Floor 5 + Unit 01 = 501
                unitNumber: `${i}${apt.unitNumber}`, 
                status: ApartmentStatus.AVAILABLE,
                ownerId: null
            }));

            newFloorPlans.push({
                id: floorId,
                buildingId: newBuilding.id,
                floorLevel: i,
                imageUrl: templateData.imageUrl,
                apartments: floorApartments
            });
        }
        
        floorPlans = [...floorPlans, ...newFloorPlans];
    }

    notifyListeners();
    return newBuilding;
  },

  getFloorPlan: async (buildingId: string, floorLevel: number): Promise<FloorPlan | undefined> => {
    await delay(200);
    return floorPlans.find(fp => fp.buildingId === buildingId && fp.floorLevel === floorLevel);
  },

  saveFloorPlan: async (floorPlan: Omit<FloorPlan, 'id'> | FloorPlan): Promise<FloorPlan> => {
    await delay(400);
    const existingIndex = floorPlans.findIndex(fp => fp.buildingId === floorPlan.buildingId && fp.floorLevel === floorPlan.floorLevel);
    
    let saved: FloorPlan;
    if (existingIndex >= 0) {
      // Update existing, preserving ID if passed, or using existing
      const existing = floorPlans[existingIndex];
      saved = { ...existing, ...floorPlan, id: existing.id };
      floorPlans[existingIndex] = saved;
    } else {
      // Create new
      saved = { 
        ...floorPlan, 
        id: 'id' in floorPlan ? floorPlan.id : Math.random().toString(36).substr(2, 9),
        apartments: floorPlan.apartments || []
      };
      floorPlans = [...floorPlans, saved];
    }
    notifyListeners();
    return saved;
  },

  deleteFloorPlan: async (floorPlanId: string) => {
      await delay(300);
      floorPlans = floorPlans.filter(fp => fp.id !== floorPlanId);
      notifyListeners();
  },

  updateApartmentStatus: async (floorPlanId: string, apartmentId: string, status: ApartmentStatus, ownerId?: string, proofImageUrl?: string) => {
    await delay(200);
    const fpIndex = floorPlans.findIndex(fp => fp.id === floorPlanId);
    if (fpIndex === -1) return;

    const fp = floorPlans[fpIndex];
    const aptIndex = fp.apartments.findIndex(a => a.id === apartmentId);
    if (aptIndex === -1) return;

    const updatedApartments = [...fp.apartments];
    updatedApartments[aptIndex] = { 
        ...updatedApartments[aptIndex], 
        status,
        ownerId: ownerId !== undefined ? ownerId : updatedApartments[aptIndex].ownerId,
        proofImageUrl: proofImageUrl || updatedApartments[aptIndex].proofImageUrl
    };
    
    floorPlans[fpIndex] = { ...fp, apartments: updatedApartments };
    notifyListeners();
  },

  getUserApartments: async (userId: string) => {
    await delay(200);
    const owned: {
        apartment: Apartment;
        floorPlan: FloorPlan;
        building: Building;
        project: Project;
    }[] = [];

    for (const fp of floorPlans) {
        // Include PENDING so user can see what they are waiting on
        const userApts = fp.apartments.filter(a => a.ownerId === userId && (a.status === ApartmentStatus.SOLD || a.status === ApartmentStatus.RESERVED || a.status === ApartmentStatus.PENDING));
        if (userApts.length > 0) {
            const building = buildings.find(b => b.id === fp.buildingId);
            const project = projects.find(p => p.id === building?.projectId);
            if (building && project) {
                userApts.forEach(apt => {
                    owned.push({
                        apartment: apt,
                        floorPlan: fp,
                        building,
                        project
                    });
                });
            }
        }
    }
    return owned;
  },

  // Get all PENDING claims for a builder (aggregating across all their projects)
  getBuilderPendingClaims: async (builderId: string) => {
      await delay(300);
      // 1. Get all projects by this builder
      const builderProjects = projects.filter(p => p.builderId === builderId);
      const builderProjectIds = builderProjects.map(p => p.id);

      // 2. Get all buildings in these projects
      const builderBuildings = buildings.filter(b => builderProjectIds.includes(b.projectId));
      const builderBuildingIds = builderBuildings.map(b => b.id);

      // 3. Find floorplans for these buildings
      const builderFloorPlans = floorPlans.filter(fp => builderBuildingIds.includes(fp.buildingId));

      const claims: {
          apartment: Apartment;
          floorPlanId: string;
          buildingName: string;
          projectName: string;
          user: { name: string, phone: string, avatarUrl: string } | null;
      }[] = [];

      for (const fp of builderFloorPlans) {
          const pendingApts = fp.apartments.filter(a => a.status === ApartmentStatus.PENDING);
          
          if (pendingApts.length > 0) {
              const building = builderBuildings.find(b => b.id === fp.buildingId);
              const project = builderProjects.find(p => p.id === building?.projectId);
              
              if (building && project) {
                  for (const apt of pendingApts) {
                      // Simulate fetching user details
                      const user = users.find(u => u.id === apt.ownerId);
                      claims.push({
                          apartment: apt,
                          floorPlanId: fp.id,
                          buildingName: building.name,
                          projectName: project.name,
                          user: user ? { name: user.name, phone: user.phone, avatarUrl: user.avatarUrl } : null
                      });
                  }
              }
          }
      }
      return claims;
  },

  // --- Manager API ---

  // Check if a user is a manager for any builder
  getManagerProfile: async (userId: string): Promise<Manager | undefined> => {
      await delay(200);
      return managers.find(m => m.userId === userId);
  },

  // Simulate searching a user database
  searchUserByPhone: async (phone: string) => {
      await delay(300);
      return users.find(u => u.phone === phone);
  },

  addManager: async (builderId: string, userId: string, userInfo: {name: string, avatarUrl: string, phone: string}, permissions: ManagerPermissions) => {
      await delay(300);
      const newManager: Manager = {
          id: Math.random().toString(36).substr(2, 9),
          builderId,
          userId,
          name: userInfo.name,
          avatarUrl: userInfo.avatarUrl,
          phone: userInfo.phone,
          permissions
      };
      managers = [...managers, newManager];
      
      // Upgrade user role
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx !== -1) {
          users[userIdx] = { ...users[userIdx], role: UserRole.MANAGER };
      }

      notifyListeners();
      return newManager;
  },

  getBuilderManagers: async (builderId: string): Promise<Manager[]> => {
      await delay(200);
      return managers.filter(m => m.builderId === builderId);
  },

  removeManager: async (managerId: string) => {
      await delay(200);
      const mgr = managers.find(m => m.id === managerId);
      if (mgr) {
          const userIdx = users.findIndex(u => u.id === mgr.userId);
          if (userIdx !== -1) {
              // Revert to buyer
              users[userIdx] = { ...users[userIdx], role: UserRole.BUYER };
          }
      }
      managers = managers.filter(m => m.id !== managerId);
      notifyListeners();
  },

  // --- Chat API ---

  // Get list of chats relevant to the user (or builder/manager)
  getUserChats: async (userId: string): Promise<ChatSession[]> => {
      await delay(200);
      const chatSessions: ChatSession[] = [];
      
      // Check if user is actually a builder (by checking if they own projects)
      const ownedProjects = projects.filter(p => p.builderId === userId);
      const isBuilder = ownedProjects.length > 0;
      
      // Check if user is a manager
      const manager = managers.find(m => m.userId === userId);

      if (isBuilder) {
          // BUILDER LOGIC
          
          // 1. Community Chats for their projects
          ownedProjects.forEach(p => {
              chatSessions.push({
                  id: p.id,
                  type: 'COMMUNITY',
                  name: p.name,
                  subtext: 'Community Chat (Owner)',
                  projectId: p.id
              });
          });

          // 2. Support chats for their projects
          activeSupportChats.forEach(chatId => {
              // format: support_projectId_userId
              const parts = chatId.split('_');
              if (parts.length === 3) {
                  const projectId = parts[1];
                  // If this chat belongs to a project owned by this builder
                  const project = ownedProjects.find(p => p.id === projectId);
                  if (project) {
                      chatSessions.push({
                          id: chatId,
                          type: 'SUPPORT',
                          name: `Support: ${project.name}`,
                          subtext: 'Buyer Inquiry',
                          projectId: projectId
                      });
                  }
              }
          });

      } else if (manager) {
          // MANAGER LOGIC

          const employerProjects = projects.filter(p => p.builderId === manager.builderId);

          // 1. Community Chats for employer projects (if manager has permission)
          // Even if they don't have write permission, they might see it? 
          // Requirement says "Write in chats" permission. We'll show them to all managers, but restrict writing in UI.
          employerProjects.forEach(p => {
             chatSessions.push({
                  id: p.id,
                  type: 'COMMUNITY',
                  name: p.name,
                  subtext: manager.permissions.canChatCommunity ? 'Manager Access' : 'Read Only',
                  projectId: p.id
              }); 
          });

          // 2. Support Chats (if manager has permission)
          if (manager.permissions.canSupportChat) {
              activeSupportChats.forEach(chatId => {
                  const parts = chatId.split('_');
                  if (parts.length === 3) {
                      const projectId = parts[1];
                      const project = employerProjects.find(p => p.id === projectId);
                      if (project) {
                          chatSessions.push({
                              id: chatId,
                              type: 'SUPPORT',
                              name: `Support: ${project.name}`,
                              subtext: 'Buyer Inquiry (Manager)',
                              projectId: projectId
                          });
                      }
                  }
              });
          }

      } else {
          // BUYER LOGIC

          // 1. Find Community Chats (Projects where user owns an apartment)
          for (const p of projects) {
              const isMember = await api.checkProjectAccess(p.id, userId);
              if (isMember) {
                  chatSessions.push({
                      id: p.id,
                      type: 'COMMUNITY',
                      name: p.name,
                      subtext: 'Community Chat',
                      projectId: p.id
                  });
              }
          }

          // 2. Find Support Chats (e.g., support_projectId_userId)
          const suffix = `_${userId}`;
          activeSupportChats.forEach(chatId => {
              if (chatId.endsWith(suffix)) {
                  // Extract project ID from middle of string: support_p1_user1
                  const parts = chatId.split('_');
                  if (parts.length === 3) {
                      const projectId = parts[1];
                      const project = projects.find(p => p.id === projectId);
                      if (project) {
                          chatSessions.push({
                              id: chatId,
                              type: 'SUPPORT',
                              name: `${project.name} (Support)`,
                              subtext: 'Direct with Builder',
                              projectId: projectId
                          });
                      }
                  }
              }
          });
      }

      return chatSessions;
  },

  startSupportChat: async (projectId: string, userId: string): Promise<string> => {
      await delay(200);
      const chatId = `support_${projectId}_${userId}`;
      
      if (!activeSupportChats.has(chatId)) {
          activeSupportChats.add(chatId);
          // Seed with welcome message if empty
          if (!messages[chatId]) {
              messages[chatId] = [{
                  id: Math.random().toString(36).substr(2, 9),
                  chatId: chatId,
                  senderId: 'system',
                  senderName: 'Support Bot',
                  text: 'Hello! How can we help you with this project?',
                  timestamp: Date.now(),
                  type: 'text'
              }];
          }
          notifyListeners();
      }
      return chatId;
  },

  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
      await delay(100);
      return messages[chatId] || [];
  },

  sendMessage: async (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      await delay(100);
      const newMessage: ChatMessage = {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
      };
      
      if (!messages[chatId]) messages[chatId] = [];
      messages[chatId] = [...messages[chatId], newMessage];
      notifyListeners();
      return newMessage;
  },

  checkProjectAccess: async (projectId: string, userId: string): Promise<boolean> => {
      // Returns true if user has RESERVED or SOLD apartment in ANY building of the project
      await delay(100);
      
      // Builder always has access to their own project
      const project = projects.find(p => p.id === projectId);
      if (project && project.builderId === userId) return true;

      const projectBuildingIds = buildings.filter(b => b.projectId === projectId).map(b => b.id);
      
      // Filter floor plans that belong to any building in this project
      const projectFloorPlans = floorPlans.filter(fp => projectBuildingIds.includes(fp.buildingId));
      
      for (const fp of projectFloorPlans) {
          // PENDING does not grant access yet! Only SOLD or RESERVED (approved)
          const hasApartment = fp.apartments.some(a => a.ownerId === userId && (a.status === ApartmentStatus.RESERVED || a.status === ApartmentStatus.SOLD));
          if (hasApartment) return true;
      }
      return false;
  },

  // --- MODERATOR API ---

  // User submits ID verification
  submitIdVerification: async (request: Omit<IdVerificationRequest, 'id' | 'status' | 'timestamp'>) => {
      await delay(200);
      verificationRequests.push({
          ...request,
          id: Math.random().toString(36).substr(2, 9),
          status: 'PENDING',
          timestamp: Date.now()
      });
      notifyListeners();
  },

  // User submits Builder application
  submitBuilderApplication: async (app: Omit<BuilderApplication, 'id' | 'status' | 'timestamp'>) => {
      await delay(200);
      builderApplications.push({
          ...app,
          id: Math.random().toString(36).substr(2, 9),
          status: 'PENDING',
          timestamp: Date.now()
      });
      notifyListeners();
  },

  // Moderator gets pending verifications
  getPendingVerifications: async (): Promise<IdVerificationRequest[]> => {
      await delay(200);
      return verificationRequests.filter(r => r.status === 'PENDING');
  },

  // Moderator gets pending builder applications
  getPendingBuilderApplications: async (): Promise<BuilderApplication[]> => {
      await delay(200);
      return builderApplications.filter(a => a.status === 'PENDING');
  },

  // Moderator Actions
  reviewIdVerification: async (id: string, approved: boolean) => {
      await delay(200);
      const idx = verificationRequests.findIndex(r => r.id === id);
      if (idx !== -1) {
          verificationRequests[idx].status = approved ? 'APPROVED' : 'REJECTED';
          // Also update user's verified status in local store
          if (approved) {
              const uIdx = users.findIndex(u => u.id === verificationRequests[idx].userId);
              if (uIdx !== -1) users[uIdx].verified = true;
          }
          notifyListeners();
      }
  },

  reviewBuilderApplication: async (id: string, approved: boolean) => {
      await delay(200);
      const idx = builderApplications.findIndex(a => a.id === id);
      if (idx !== -1) {
          builderApplications[idx].status = approved ? 'APPROVED' : 'REJECTED';
           // Also update user's role if approved
           if (approved) {
               const uIdx = users.findIndex(u => u.id === builderApplications[idx].userId);
               if (uIdx !== -1) users[uIdx].role = UserRole.BUILDER;
           }
          notifyListeners();
      }
  },

  // Check user status (polling helper)
  getUserStatus: async (userId: string): Promise<{ 
      verification: VerificationStatus, 
      builderApp: 'NONE' | 'PENDING' | 'APPROVED' 
  }> => {
      await delay(100);
      
      // Check ID Verification
      const idReq = verificationRequests.find(r => r.userId === userId);
      let verification: VerificationStatus = 'BASIC';
      
      // Also check user's direct object in case they were verified before or via moderator action
      const user = users.find(u => u.id === userId);
      if (user?.verified) verification = 'VERIFIED';
      else if (idReq) {
          if (idReq.status === 'APPROVED') verification = 'VERIFIED';
          else if (idReq.status === 'PENDING') verification = 'PENDING';
      }

      // Check Builder App
      const buildApp = builderApplications.find(a => a.userId === userId);
      let builderApp: 'NONE' | 'PENDING' | 'APPROVED' = 'NONE';
      if (buildApp) {
          if (buildApp.status === 'REJECTED') {
              builderApp = 'NONE';
          } else {
              builderApp = buildApp.status;
          }
      } else if (user?.role === UserRole.BUILDER) {
          builderApp = 'APPROVED';
      }

      return { verification, builderApp };
  },

  // --- ADMIN API ---

  getSystemStats: async (): Promise<SystemStats> => {
      await delay(300);
      
      // Calculate active verified users
      const verifiedUsers = users.filter(u => u.verified).length + verificationRequests.filter(r => r.status === 'APPROVED').length;
      const builders = MOCK_BUILDERS.length + builderApplications.filter(a => a.status === 'APPROVED').length;

      return {
          totalUsers: users.length, 
          totalBuilders: builders,
          totalProjects: projects.length,
          totalBuildings: buildings.length,
          activeUsersOnline: Math.floor(Math.random() * 50) + 10,
          verifiedUsersCount: verifiedUsers,
          pendingVerifications: verificationRequests.filter(r => r.status === 'PENDING').length
      };
  },

  getAdminUserList: async (): Promise<AdminUserView[]> => {
      await delay(300);
      // Combine mock users with simulated generic users
      const userList: AdminUserView[] = users.map(u => ({
          id: u.id,
          name: u.name || 'User (No Name)',
          role: u.role,
          phone: u.phone,
          status: (u.status as 'ACTIVE' | 'BLOCKED') || 'ACTIVE',
          isVerified: u.verified,
          joinedDate: Date.now() - Math.floor(Math.random() * 10000000000)
      }));

      return userList;
  },

  // Admin Update User Method
  updateUser: async (userId: string, updates: Partial<any>): Promise<void> => {
    await delay(300);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        notifyListeners();
    }
  }
};
