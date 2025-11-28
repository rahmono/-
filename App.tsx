import React, { useState, useEffect, useRef } from 'react';
import { UserRole, ScreenName, Project, Building, FloorPlan, ApartmentStatus, Apartment, ChatSession, VerificationStatus, BuilderCompany, IdVerificationRequest, BuilderApplication, Manager, ManagerPermissions, SystemStats, AdminUserView } from './types';
import { api, subscribe } from './services/api';
import { TRANSLATIONS, Language } from './utils/i18n';

// Icons
import { Briefcase, User, ArrowLeft, Plus, Map, Building as BuildingIcon, Layers, Check, ChevronRight, Search, Filter, X, MessageCircle, Home, Settings, LogOut, Camera, Moon, Sun, Edit2, Globe, MessagesSquare, HelpCircle, Shield, ShieldCheck, FileText, CreditCard, UserCheck, Upload, FileBadge, Phone, Mail, MapPin, Calendar, HardHat, ChevronLeft, Maximize2, ShieldAlert, Users, Trash2, Image as ImageIcon, List, Map as MapIcon, BarChart3, PieChart, Activity, LogIn, Lock, Unlock, Inbox, XCircle, CheckCircle, Menu } from 'lucide-react';

// Components
import { FloorPlanEditor } from './components/FloorPlanEditor';
import { InteractiveFloorPlan } from './components/InteractiveFloorPlan';
import { ChatRoom } from './components/ChatRoom';

// --- Sub-Components (Extracted for cleaner file) ---

// 1. Identification Screen
interface IdentificationScreenProps {
  t: any;
  userId: string;
  verificationStatus: VerificationStatus;
  setVerificationStatus: (status: VerificationStatus) => void;
  idFront: string | null;
  setIdFront: (val: string | null) => void;
  idBack: string | null;
  setIdBack: (val: string | null) => void;
  onBack: () => void;
}

const IdentificationScreen: React.FC<IdentificationScreenProps> = ({ 
    t, 
    userId,
    verificationStatus, 
    setVerificationStatus, 
    idFront, 
    setIdFront, 
    idBack, 
    setIdBack, 
    onBack 
}) => {
    const [tab, setTab] = useState<'BASIC' | 'VERIFIED'>('BASIC');
    const idFrontRef = useRef<HTMLInputElement>(null);
    const idBackRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (verificationStatus === 'VERIFIED' || verificationStatus === 'PENDING') {
            setTab('VERIFIED');
        }
    }, [verificationStatus]);

    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (side === 'front') setIdFront(reader.result as string);
                else setIdBack(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitVerification = async () => {
        if (!idFront || !idBack) return;
        setVerificationStatus('PENDING');
        await api.submitIdVerification({
            userId,
            userName: 'Current User',
            idFrontUrl: idFront,
            idBackUrl: idBack
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black dark:text-slate-100">
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                    <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
                </button>
                <h2 className="font-bold text-lg">{t.idPageTitle}</h2>
            </div>
            
            <div className="p-4 max-w-2xl mx-auto w-full">
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-6">
                    <button 
                        onClick={() => setTab('BASIC')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === 'BASIC' ? 'bg-white dark:bg-black shadow-sm text-black dark:text-white' : 'text-slate-500'}`}
                    >
                        {t.levelBasic}
                    </button>
                    <button 
                        onClick={() => setTab('VERIFIED')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === 'VERIFIED' ? 'bg-white dark:bg-black shadow-sm text-black dark:text-white' : 'text-slate-500'}`}
                    >
                        {t.levelVerified}
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tab === 'BASIC' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-green-100 dark:bg-green-900/20'}`}>
                            {tab === 'BASIC' ? <User size={24} className="text-slate-500"/> : <ShieldCheck size={24} className="text-green-600 dark:text-green-400"/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{tab === 'BASIC' ? t.levelBasic : t.levelVerified}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {tab === 'BASIC' 
                                    ? t.currentLevel 
                                    : (verificationStatus === 'VERIFIED' ? t.verificationSuccess : (verificationStatus === 'PENDING' ? t.verificationPendingDesc : t.passVerification))}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        <h4 className="font-semibold text-sm uppercase text-slate-400 tracking-wider">{t.benefits}</h4>
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle size={16} className={tab === 'BASIC' || tab === 'VERIFIED' ? "text-slate-900 dark:text-white" : "text-slate-300"} />
                            <span>{t.benefitView}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle size={16} className={tab === 'BASIC' || tab === 'VERIFIED' ? "text-slate-900 dark:text-white" : "text-slate-300"} />
                            <span>{t.benefitChat}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle size={16} className={tab === 'VERIFIED' ? "text-slate-900 dark:text-white" : "text-slate-300"} />
                            <span className={tab === 'VERIFIED' ? "" : "text-slate-400"}>{t.benefitBook}</span>
                        </div>
                    </div>

                    {tab === 'VERIFIED' && verificationStatus === 'BASIC' && (
                        <div className="space-y-4">
                            <div onClick={() => idFrontRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                                {idFront ? (
                                    <div className="text-green-600 font-bold flex items-center justify-center gap-2"><Check size={16}/> {t.uploadIdFront}</div>
                                ) : (
                                    <>
                                        <Camera size={24} className="mx-auto text-slate-400 mb-2 group-hover:text-slate-600"/>
                                        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.uploadIdFront}</div>
                                    </>
                                )}
                                <input type="file" ref={idFrontRef} className="hidden" onChange={(e) => handleIdUpload(e, 'front')}/>
                            </div>
                            <div onClick={() => idBackRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                                {idBack ? (
                                    <div className="text-green-600 font-bold flex items-center justify-center gap-2"><Check size={16}/> {t.uploadIdBack}</div>
                                ) : (
                                    <>
                                        <Camera size={24} className="mx-auto text-slate-400 mb-2 group-hover:text-slate-600"/>
                                        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.uploadIdBack}</div>
                                    </>
                                )}
                                <input type="file" ref={idBackRef} className="hidden" onChange={(e) => handleIdUpload(e, 'back')}/>
                            </div>
                            <button 
                                onClick={submitVerification} 
                                disabled={!idFront || !idBack}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {t.submitVerification}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 2. Become Builder Screen
const BecomeBuilderScreen: React.FC<any> = ({ t, userId, onBack, appStatus, setAppStatus }) => {
     return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
             <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><ArrowLeft size={20}/></button>
                <h2 className="font-bold text-lg">{t.becomeBuilder}</h2>
            </div>
            <div className="p-6 max-w-2xl mx-auto w-full">
                <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-3xl mb-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                            <HardHat size={32} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{t.becomeBuilderTitle}</h3>
                        <p className="opacity-80 leading-relaxed mb-6">{t.builderFreeInfo}</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-medium opacity-90">
                                <CheckCircle size={16} className="text-green-400"/> {t.bb1}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium opacity-90">
                                <CheckCircle size={16} className="text-green-400"/> {t.bb2}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium opacity-90">
                                <CheckCircle size={16} className="text-green-400"/> {t.bb3}
                            </div>
                        </div>
                    </div>
                    {/* Abstract Decoration */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>

                {appStatus === 'NONE' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-4">{t.companyDetails}</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t.companyName}</label>
                                <input className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t.companyAddress}</label>
                                <input className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition"/>
                            </div>
                            
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition mt-2">
                                <Upload size={24} className="mx-auto text-slate-400 mb-2"/>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.uploadLicense}</span>
                            </div>

                            <button 
                                onClick={async () => {
                                    setAppStatus('PENDING');
                                    await api.submitBuilderApplication({
                                        userId,
                                        companyName: 'My Construction Co.',
                                        address: 'Dushanbe',
                                        licenseUrl: 'placeholder'
                                    });
                                }} 
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold shadow-md hover:opacity-90 transition mt-4"
                            >
                                {t.submitApplication}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-6 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity size={24} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">{t.applicationPending}</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 opacity-80">{t.applicationPendingDesc}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// 3. Manager Management Screen
const ManagerManagementScreen: React.FC<any> = ({ t, builderId, onBack }) => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getBuilderManagers(builderId).then(data => {
            setManagers(data);
            setLoading(false);
        });
    }, [builderId]);

     return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
             <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><ArrowLeft size={20}/></button>
                <h2 className="font-bold text-lg">{t.managers}</h2>
            </div>
             <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">{t.managers}</h3>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Plus size={16}/> {t.addManager}
                    </button>
                </div>
                
                {loading ? (
                    <div className="text-center py-10 text-slate-500">{t.loading}</div>
                ) : managers.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={24} className="text-slate-400"/>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noManagers}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {managers.map(m => (
                            <div key={m.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-black overflow-hidden">
                                        <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover"/>
                                    </div>
                                    <div>
                                        <div className="font-bold">{m.name}</div>
                                        <div className="text-xs text-slate-500">{m.phone}</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-medium">{t.active}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// 4. Project Creation Screen
const ProjectCreationScreen: React.FC<any> = ({ t, userId, onBack, onCreated }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loc, setLoc] = useState('');
    const [lat, setLat] = useState<number | undefined>();
    const [lng, setLng] = useState<number | undefined>();
    
    // Map Picker State
    const [showMap, setShowMap] = useState(false);

    const handleCreate = async () => {
        if (!name || !loc) return;
        await api.createProject({
            name,
            description: desc,
            location: loc,
            images: [],
            builderId: userId,
            latitude: lat,
            longitude: lng
        });
        onCreated();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
             <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><ArrowLeft size={20}/></button>
                <h2 className="font-bold text-lg">{t.createProject}</h2>
            </div>
             <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
                 <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t.projectName}</label>
                     <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition" />
                 </div>
                 
                 <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t.projDesc}</label>
                     <textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition" />
                 </div>
                 
                 <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t.projAddr}</label>
                     <div className="flex gap-2">
                        <input value={loc} onChange={e => setLoc(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition" />
                        <button onClick={() => setShowMap(true)} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300">
                            <MapPin size={20} />
                        </button>
                     </div>
                 </div>

                 {lat && lng && (
                     <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                         <Check size={16} className="text-green-500" />
                         {t.coords}: {lat.toFixed(4)}, {lng.toFixed(4)}
                     </div>
                 )}

                 <div className="pt-4">
                    <button onClick={handleCreate} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold shadow-md hover:opacity-90 transition">{t.createProjBtn}</button>
                 </div>
             </div>

             {/* Map Picker Modal */}
             {showMap && (
                 <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                     <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                         <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                             <h3 className="font-bold text-lg">{t.pickOnMap}</h3>
                             <button onClick={() => setShowMap(false)}><X size={24}/></button>
                         </div>
                         <div className="relative h-96 bg-slate-200 cursor-crosshair" onClick={(e) => {
                             // Mock coordinate picking
                             const rect = e.currentTarget.getBoundingClientRect();
                             const x = e.clientX - rect.left;
                             const y = e.clientY - rect.top;
                             // Dushanbe approx bounds
                             const latVal = 38.5 + (1 - y/rect.height) * 0.2;
                             const lngVal = 68.7 + (x/rect.width) * 0.2;
                             setLat(latVal);
                             setLng(lngVal);
                             setLoc("Selected Location");
                             setShowMap(false);
                         }}>
                             <img src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/68.78,38.55,12,0/800x600?access_token=placeholder" alt="Map" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://picsum.photos/800/600?blur=2'} />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none">
                                 {t.tapMapInstruction}
                             </div>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    )
}

// --- Main App Component ---

export default function App() {
  // State
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [currentUserId, setCurrentUserId] = useState(''); 
  const [loginPhone, setLoginPhone] = useState('+992');
  
  const [userProfile, setUserProfile] = useState({ name: '', avatarUrl: '', language: 'ru' as Language });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('BASIC');
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [builderAppStatus, setBuilderAppStatus] = useState<'NONE' | 'PENDING' | 'APPROVED'>('NONE');

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<number>(1);
  const [currentFloorPlan, setCurrentFloorPlan] = useState<FloorPlan | null>(null);
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderCompany | null>(null);
  
  const [myChats, setMyChats] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [myApartments, setMyApartments] = useState<any[]>([]);
  const [myCreatedProjects, setMyCreatedProjects] = useState<Project[]>([]);
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);

  // Admin/Mod Data
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [adminUserList, setAdminUserList] = useState<AdminUserView[]>([]);
  const [modVerificationQueue, setModVerificationQueue] = useState<IdVerificationRequest[]>([]);
  const [modAppQueue, setModAppQueue] = useState<BuilderApplication[]>([]);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Manager State
  const [currentManagerProfile, setCurrentManagerProfile] = useState<Manager | null>(null);

  const t = TRANSLATIONS[userProfile.language];
  const canManageInventory = role === UserRole.BUILDER || (role === UserRole.MANAGER && (currentManagerProfile?.permissions.canManageInventory ?? false));
  const canManageSales = role === UserRole.BUILDER || (role === UserRole.MANAGER && (currentManagerProfile?.permissions.canProcessClaims ?? false));
  const effectiveBuilderId = currentManagerProfile ? currentManagerProfile.builderId : currentUserId;

  // Effects
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = subscribe(async () => {
      if (!currentUserId) return;
      
      // Real-time updates based on role
      if (role === UserRole.ADMIN && currentScreen === 'ADMIN_DASHBOARD') loadAdminData();
      if (role === UserRole.MODERATOR && currentScreen === 'MODERATOR_DASHBOARD') loadModeratorData();
      
      if ((role === UserRole.BUYER && currentScreen === 'BUYER_PROJECT_LIST') || (role === UserRole.BUILDER && currentScreen === 'BUILDER_DASHBOARD')) loadProjects();
      
      if (currentScreen.includes('PROJECT_DETAIL') && selectedProject) {
          loadBuildings(selectedProject.id);
          if (selectedProject.builderId) loadBuilderInfo(selectedProject.builderId);
      }
      
      if (currentFloorPlan && currentScreen.includes('FLOOR')) loadFloorPlan(currentFloorPlan.buildingId, currentFloorPlan.floorLevel);
      if (currentScreen === 'BUYER_CHAT_LIST') loadUserChats();
      if (currentScreen === 'BUYER_MY_HOME') loadMyApartments();
      if (currentScreen === 'BUILDER_MY_PROJECTS') loadMyCreatedProjects();
      
      // Update Manager Profile Permissions
      if (role === UserRole.MANAGER) {
          const profile = await api.getManagerProfile(currentUserId);
          if (profile) setCurrentManagerProfile(profile);
      }
    });
    return () => { unsubscribe(); };
  }, [role, currentScreen, currentFloorPlan, selectedProject, selectedBuilding, currentUserId]);

  // Data Loading Functions
  const handlePhoneLogin = async () => {
      // Enforce +992
      let phone = loginPhone;
      if (!phone.startsWith('+992')) {
          // If user erased it, put it back or validation error
          if (phone.length === 0) phone = '+992'; 
          else return; // Basic validation
      }
      if (phone.length < 9) return;

      setAuthLoading(true);
      const result = await api.loginOrRegister(phone);
      setAuthLoading(false);
      
      const user = result.user;
      setCurrentUserId(user.id);
      setRole(user.role);
      setUserProfile({ name: user.name, avatarUrl: user.avatarUrl, language: 'ru' });
      setVerificationStatus(user.verified ? 'VERIFIED' : 'BASIC');
      
      // Check Manager
      const managerProfile = await api.getManagerProfile(user.id);
      if (managerProfile) setCurrentManagerProfile(managerProfile);
      
      // Route based on role
      if (user.role === UserRole.ADMIN) setCurrentScreen('ADMIN_DASHBOARD');
      else if (user.role === UserRole.MODERATOR) setCurrentScreen('MODERATOR_DASHBOARD');
      else if (user.role === UserRole.BUILDER) {
          loadProjects();
          setCurrentScreen('BUILDER_DASHBOARD');
      } else if (user.role === UserRole.MANAGER) {
          loadMyCreatedProjects();
          setCurrentScreen('BUILDER_MY_PROJECTS');
      } else {
          loadProjects();
          setCurrentScreen('BUYER_PROJECT_LIST');
      }
  };

  const loadProjects = async () => {
    setLoading(true);
    const data = await api.getProjects();
    setProjects(data);
    setLoading(false);
  };
  
  const loadBuildings = async (projectId: string) => {
    const data = await api.getBuildings(projectId);
    setBuildings(data);
  };

  const loadBuilderInfo = async (builderId: string) => {
      const builder = await api.getBuilder(builderId);
      if (builder) setSelectedBuilder(builder);
  };

  const loadFloorPlan = async (buildingId: string, level: number) => {
    setLoading(true);
    const fp = await api.getFloorPlan(buildingId, level);
    if (!fp && canManageInventory) {
        setCurrentFloorPlan({
            id: 'new',
            buildingId,
            floorLevel: level,
            imageUrl: 'https://picsum.photos/1000/800?random=' + level,
            apartments: []
        });
    } else {
        setCurrentFloorPlan(fp || null);
    }
    setLoading(false);
  };

  const loadMyApartments = async () => {
      setLoading(true);
      const data = await api.getUserApartments(currentUserId);
      setMyApartments(data);
      setLoading(false);
  };

  const loadMyCreatedProjects = async () => {
      setLoading(true);
      const data = await api.getBuilderProjects(effectiveBuilderId);
      setMyCreatedProjects(data);
      if (canManageSales) {
          const claims = await api.getBuilderPendingClaims(effectiveBuilderId);
          setPendingClaims(claims);
      }
      setLoading(false);
  }

  const loadUserChats = async () => {
      setLoading(true);
      const chats = await api.getUserChats(currentUserId);
      setMyChats(chats);
      setLoading(false);
  }

  const loadAdminData = async () => {
      setLoading(true);
      const stats = await api.getSystemStats();
      const users = await api.getAdminUserList();
      setSystemStats(stats);
      setAdminUserList(users);
      setLoading(false);
  }

  const loadModeratorData = async () => {
      setLoading(true);
      const verifications = await api.getPendingVerifications();
      const apps = await api.getPendingBuilderApplications();
      setModVerificationQueue(verifications);
      setModAppQueue(apps);
      setLoading(false);
  }

  // Actions
  const goHome = () => {
    setRole(null);
    setCurrentUserId('');
    setLoginPhone('+992');
    setCurrentScreen('HOME');
    setShowAdminLogin(false);
  };

  const openProject = async (p: Project) => {
    setSelectedProject(p);
    await loadBuildings(p.id);
    if (p.builderId) await loadBuilderInfo(p.builderId);
    setCurrentScreen(role === UserRole.BUYER ? 'BUYER_PROJECT_DETAIL' : 'BUILDER_PROJECT_DETAIL');
  };

  const openBuilding = (b: Building) => {
      setSelectedBuilding(b);
      setCurrentScreen(role === UserRole.BUYER ? 'BUYER_BUILDING_DETAIL' : 'BUILDER_BUILDING_DETAIL');
  };

  const openFloor = async (b: Building, level: number) => {
    setSelectedBuilding(b);
    setSelectedFloorLevel(level);
    await loadFloorPlan(b.id, level);
    if (role === UserRole.BUILDER || (currentManagerProfile && canManageInventory)) {
        setCurrentScreen('BUILDER_FLOOR_EDIT');
    } else {
        setCurrentScreen('BUYER_FLOOR_VIEW');
    }
  };

  const openProjectChat = async (p: Project) => {
      // Check if user is owner of an apartment or it is a public chat?
      // For now, assume community chat is open if they have access
      setActiveChatSession({
          id: p.id,
          type: 'COMMUNITY',
          name: p.name,
          subtext: t.communityChat,
          projectId: p.id
      });
      setCurrentScreen('BUYER_CHAT_ROOM');
  };

  const contactBuilder = async () => {
     // Start a support chat
     if (selectedProject) {
         const chatId = await api.startSupportChat(selectedProject.id, currentUserId);
         setActiveChatSession({
             id: chatId,
             type: 'SUPPORT',
             name: selectedProject.name,
             subtext: t.supportChat,
             projectId: selectedProject.id
         });
         setCurrentScreen('BUYER_CHAT_ROOM');
     }
  }

  // --- Render Functions ---

  const renderHeader = () => {
      // Logic: Only show generic header on specific detail screens for "Back" functionality
      // Main screens (Dashboard, Lists) have their own internal headers or sidebars
      const showOnScreens = [
          'BUILDER_PROJECT_DETAIL', 'BUYER_PROJECT_DETAIL', 
          'BUILDER_BUILDING_DETAIL', 'BUYER_BUILDING_DETAIL', 
          'BUILDER_FLOOR_EDIT', 'BUYER_FLOOR_VIEW'
      ];

      if (!role || !showOnScreens.includes(currentScreen)) return null;

      const handleBack = () => {
         if (currentScreen.includes('FLOOR')) {
             setCurrentScreen(role === UserRole.BUYER ? 'BUYER_BUILDING_DETAIL' : 'BUILDER_BUILDING_DETAIL');
         } else if (currentScreen.includes('BUILDING')) {
             setCurrentScreen(role === UserRole.BUYER ? 'BUYER_PROJECT_DETAIL' : 'BUILDER_PROJECT_DETAIL');
         } else {
             // Back to list
             if (role === UserRole.BUILDER) setCurrentScreen('BUILDER_DASHBOARD');
             else if (role === UserRole.MANAGER) setCurrentScreen('BUILDER_MY_PROJECTS');
             else setCurrentScreen('BUYER_PROJECT_LIST');
         }
      };

      const title = currentScreen.includes('FLOOR') ? `${t.level} ${currentFloorPlan?.floorLevel}` : 
                    currentScreen.includes('BUILDING') ? selectedBuilding?.name : 
                    selectedProject?.name;

      return (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-[60px] px-4 flex items-center sticky top-0 z-20 shrink-0">
              <button onClick={handleBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                  <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
              </button>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white ml-2 line-clamp-1">{title}</h1>
          </div>
      );
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-black p-6 text-slate-900 dark:text-white relative">
      <div className="w-20 h-20 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
        <BuildingIcon size={40} className="text-white dark:text-black" />
      </div>
      
      <div className="w-full max-w-sm z-10">
          <h1 className="text-3xl font-bold mb-2 text-center tracking-tight">{t.welcomeBack}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-10">{t.loginTitle}</p>
          
          <div className="space-y-6">
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.enterPhone}</label>
                  <div className="relative">
                      <input 
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('+992')) setLoginPhone(val);
                            else if (val.length < 4) setLoginPhone('+992');
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-lg font-medium outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
                        placeholder="+992..."
                      />
                  </div>
              </div>
              
              <button 
                onClick={handlePhoneLogin}
                disabled={authLoading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 shadow-lg"
              >
                  {authLoading ? t.loading : t.loginBtn}
              </button>
          </div>
      </div>
      
      {/* Admin Login Button Hidden at bottom */}
      <button onClick={() => { setLoginPhone('+992100100100'); handlePhoneLogin(); }} className="absolute bottom-8 text-xs text-slate-300 dark:text-slate-700 font-medium hover:text-slate-500 transition">
          Admin Access
      </button>
    </div>
  );

  const renderAdminDashboard = () => (
      <div className="p-6 pb-24 text-slate-900 dark:text-white">
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight">{t.adminDashboard}</h1>
              <button onClick={goHome} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><LogOut size={20}/></button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.totalUsers}</div>
                  <div className="text-3xl font-bold">{systemStats?.totalUsers}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.totalBuilders}</div>
                  <div className="text-3xl font-bold">{systemStats?.totalBuilders}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.totalProjects}</div>
                  <div className="text-3xl font-bold">{systemStats?.totalProjects}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.activeOnline}</div>
                  <div className="text-3xl font-bold text-green-500">{systemStats?.activeUsersOnline}</div>
              </div>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg">{t.userList}</h3>
                  <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><Filter size={20}/></button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><Search size={20}/></button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <tr>
                              <th className="p-4">{t.displayName}</th>
                              <th className="p-4">{t.phoneNum}</th>
                              <th className="p-4">{t.role}</th>
                              <th className="p-4">{t.status}</th>
                              <th className="p-4">{t.actions}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                          {adminUserList.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                  <td className="p-4 font-bold">{u.name}</td>
                                  <td className="p-4 text-slate-500">{u.phone}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                          u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                                          u.role === UserRole.BUILDER ? 'bg-blue-100 text-blue-700' :
                                          u.role === UserRole.MODERATOR ? 'bg-orange-100 text-orange-700' :
                                          'bg-slate-100 text-slate-600'
                                      }`}>{u.role}</span>
                                  </td>
                                  <td className="p-4">
                                      <span className={`flex items-center gap-1.5 ${u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                          <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                          {u.status}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <button 
                                        onClick={() => api.updateUser(u.id, { status: u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' }).then(loadAdminData)}
                                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                      >
                                          <Edit2 size={16}/>
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );

  const renderModeratorDashboard = () => (
      <div className="p-6 pb-24 text-slate-900 dark:text-white">
           <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight">{t.modDashboard}</h1>
              <button onClick={goHome} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><LogOut size={20}/></button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
              {/* ID Verifications */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Shield size={20}/> {t.pendingIds}
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{modVerificationQueue.length}</span>
                  </h3>
                  {modVerificationQueue.length === 0 ? (
                      <div className="text-slate-400 text-center py-10 text-sm">{t.noPendingRequests}</div>
                  ) : (
                      <div className="space-y-4">
                          {modVerificationQueue.map(req => (
                              <div key={req.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                                  <div className="font-bold mb-2">{req.userName}</div>
                                  <div className="flex gap-2 mb-4">
                                      <div className="h-20 w-32 bg-slate-100 rounded-lg overflow-hidden"><img src={req.idFrontUrl} className="w-full h-full object-cover"/></div>
                                      <div className="h-20 w-32 bg-slate-100 rounded-lg overflow-hidden"><img src={req.idBackUrl} className="w-full h-full object-cover"/></div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => api.reviewIdVerification(req.id, true).then(loadModeratorData)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-bold">{t.accept}</button>
                                      <button onClick={() => api.reviewIdVerification(req.id, false).then(loadModeratorData)} className="flex-1 bg-slate-100 text-slate-900 py-2 rounded-lg text-sm font-bold">{t.decline}</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Builder Applications */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Briefcase size={20}/> {t.pendingBuilders}
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{modAppQueue.length}</span>
                  </h3>
                  {modAppQueue.length === 0 ? (
                      <div className="text-slate-400 text-center py-10 text-sm">{t.noPendingRequests}</div>
                  ) : (
                      <div className="space-y-4">
                          {modAppQueue.map(app => (
                              <div key={app.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                                  <div className="font-bold mb-1">{app.companyName}</div>
                                  <div className="text-xs text-slate-500 mb-3">{app.address}</div>
                                  <div className="flex gap-2">
                                      <button onClick={() => api.reviewBuilderApplication(app.id, true).then(loadModeratorData)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-bold">{t.accept}</button>
                                      <button onClick={() => api.reviewBuilderApplication(app.id, false).then(loadModeratorData)} className="flex-1 bg-slate-100 text-slate-900 py-2 rounded-lg text-sm font-bold">{t.decline}</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderProjectList = () => (
    <div className="p-4 sm:p-6 pb-24 md:pb-0">
      <div className="flex justify-between items-end mb-6">
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.exploreProjects}</h2>
      </div>
      
      <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-slate-400 transition shadow-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>

      <div className="space-y-6">
        {projects.map(p => (
          <div key={p.id} onClick={() => openProject(p)} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer active:scale-[0.98] transition duration-200 group">
            <div className="h-56 overflow-hidden relative">
                <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                    <MapPin size={12} /> {p.location}
                </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-xl mb-1 text-slate-900 dark:text-white">{p.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{p.description}</p>
            </div>
          </div>
        ))}
        {projects.length === 0 && !loading && (
            <div className="text-center py-20 text-slate-400">{t.noProjects}</div>
        )}
      </div>
    </div>
  );

  const renderMyHome = () => (
      <div className="p-6 pb-24">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.myProperties}</h2>
          
          {/* Pending claims */}
          {myApartments.filter(a => a.apartment.status === ApartmentStatus.PENDING).length > 0 && (
              <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">{t.pending}</h3>
                  <div className="space-y-4">
                      {myApartments.filter(a => a.apartment.status === ApartmentStatus.PENDING).map((item, i) => (
                           <div key={i} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-5 rounded-2xl flex items-center justify-between">
                               <div>
                                   <div className="font-bold text-orange-900 dark:text-orange-100">{item.project.name}</div>
                                   <div className="text-sm text-orange-800 dark:text-orange-200 opacity-80">{t.unit} {item.apartment.unitNumber} • {item.building.name}</div>
                               </div>
                               <div className="text-xs font-bold bg-white/50 px-3 py-1 rounded-full text-orange-800 uppercase">{t.waitingApproval}</div>
                           </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Owned */}
          <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">{t.levelVerified}</h3>
          {myApartments.filter(a => a.apartment.status !== ApartmentStatus.PENDING).length === 0 ? (
               <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                       <Home size={24} className="text-slate-300"/>
                   </div>
                   <p className="text-slate-400 text-sm">{t.noProperties}</p>
                   <button onClick={() => setCurrentScreen('BUYER_PROJECT_LIST')} className="mt-4 text-slate-900 dark:text-white font-bold text-sm underline">{t.browseProjects}</button>
               </div>
          ) : (
               <div className="space-y-4">
                   {myApartments.filter(a => a.apartment.status !== ApartmentStatus.PENDING).map((item, i) => (
                       <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h3 className="font-bold text-lg">{item.project.name}</h3>
                                   <p className="text-slate-500 text-sm">{item.building.name}</p>
                               </div>
                               <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{t.sold}</div>
                           </div>
                           <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                               <div>
                                   <div className="text-xs text-slate-400 font-bold uppercase">{t.unit}</div>
                                   <div className="font-bold">{item.apartment.unitNumber}</div>
                               </div>
                               <div>
                                   <div className="text-xs text-slate-400 font-bold uppercase">{t.area}</div>
                                   <div className="font-bold">{item.apartment.areaSqFt} m²</div>
                               </div>
                               <div className="ml-auto">
                                    <button onClick={() => openProjectChat(item.project)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition">
                                        <MessageCircle size={20}/>
                                    </button>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
          )}
      </div>
  );

  const renderChatList = () => (
      <div className="p-6 pb-24">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.navChats}</h2>
          
          <div className="space-y-2">
              {myChats.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-sm">
                      <p>{t.noActiveChats}</p>
                      <p className="mt-2 text-xs opacity-70 max-w-xs mx-auto">{t.noActiveChatsDesc}</p>
                  </div>
              ) : (
                  myChats.map(chat => (
                      <div 
                        key={chat.id} 
                        onClick={() => { setActiveChatSession(chat); setCurrentScreen('BUYER_CHAT_ROOM'); }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${chat.type === 'COMMUNITY' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                              {chat.type === 'COMMUNITY' ? <Users size={20}/> : <Headphones size={20}/>}
                          </div>
                          <div className="flex-1">
                              <h3 className="font-bold text-slate-900 dark:text-white">{chat.name}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{chat.subtext}</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300"/>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  const renderMyCreatedProjects = () => (
      <div className="p-6 pb-24">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{role === UserRole.MANAGER ? t.navCompanyProjects : t.myProjects}</h2>
              {role === UserRole.BUILDER && (
                  <button onClick={() => setCurrentScreen('BUILDER_PROJECT_CREATE')} className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition shadow-sm">
                      <Plus size={16}/> {t.createProject}
                  </button>
              )}
          </div>

          {/* Incoming Claims for Builder/Manager */}
          {canManageSales && pendingClaims.length > 0 && (
              <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
                      <Inbox size={16}/> {t.incomingClaims}
                      <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingClaims.length}</span>
                  </h3>
                  <div className="space-y-3">
                      {pendingClaims.map((claim, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                              <div className="flex justify-between mb-3">
                                  <div>
                                      <div className="font-bold">{claim.user?.name || 'Unknown User'}</div>
                                      <div className="text-xs text-slate-500">{claim.projectName} • {claim.buildingName} • {t.unit} {claim.apartment.unitNumber}</div>
                                  </div>
                                  <div className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded h-fit">{t.waitingApproval}</div>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => api.updateApartmentStatus(claim.floorPlanId, claim.apartment.id, ApartmentStatus.SOLD, claim.apartment.ownerId).then(loadMyCreatedProjects)} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-bold">{t.approveClaim}</button>
                                  <button onClick={() => api.updateApartmentStatus(claim.floorPlanId, claim.apartment.id, ApartmentStatus.AVAILABLE, undefined).then(loadMyCreatedProjects)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-2 rounded-lg text-sm font-bold">{t.rejectClaim}</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="space-y-4">
              {myCreatedProjects.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400 text-sm mb-4">{t.noProjects}</p>
                      {role === UserRole.BUILDER && (
                          <button onClick={() => setCurrentScreen('BUILDER_PROJECT_CREATE')} className="text-slate-900 dark:text-white font-bold text-sm underline">{t.createProject}</button>
                      )}
                  </div>
              ) : (
                  myCreatedProjects.map(p => (
                      <div key={p.id} onClick={() => openProject(p)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              <img src={p.thumbnailUrl} className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex-1">
                              <h3 className="font-bold text-lg">{p.name}</h3>
                              <p className="text-xs text-slate-500">{p.location}</p>
                          </div>
                          <ChevronRight size={20} className="text-slate-300"/>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  const renderProfile = () => (
      <div className="p-6 pb-24">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.profileHeader}</h2>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-6 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden shrink-0">
                  <img src={userProfile.avatarUrl} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">{userProfile.name || t.displayName}</div>
                  <div className="text-slate-500 text-sm truncate">{loginPhone}</div>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{role}</span>
                      {verificationStatus === 'VERIFIED' && <ShieldCheck size={14} className="text-green-500"/>}
                  </div>
              </div>
          </div>
          
          <div className="space-y-3">
              {/* Theme Toggle */}
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                  <span className="font-medium flex items-center gap-3 text-sm"><Moon size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition"/> {t.darkMode}</span>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : ''}`}></div>
                  </div>
              </button>

              {/* Language Toggle */}
              <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                  <button onClick={() => setUserProfile({...userProfile, language: 'ru'})} className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${userProfile.language === 'ru' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400'}`}>Русский</button>
                  <button onClick={() => setUserProfile({...userProfile, language: 'tj'})} className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${userProfile.language === 'tj' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400'}`}>Тоҷикӣ</button>
              </div>

              {/* Identification */}
              <button onClick={() => setCurrentScreen('BUYER_ID_VERIFICATION')} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                  <span className="font-medium flex items-center gap-3 text-sm"><ShieldCheck size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition"/> {t.identification}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {verificationStatus === 'VERIFIED' ? t.idStatusVerified : t.idStatusBasic}
                  </span>
              </button>
              
              {/* Become Builder */}
              {role === UserRole.BUYER && (
                   <button onClick={() => setCurrentScreen('BUYER_BECOME_BUILDER')} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                      <span className="font-medium flex items-center gap-3 text-sm"><Briefcase size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition"/> {t.accountStatus}</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">{t.statusBuyer}</span>
                  </button>
              )}
              
              {/* Builder Managers */}
              {role === UserRole.BUILDER && (
                  <button onClick={() => setCurrentScreen('BUILDER_MANAGERS')} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                      <span className="font-medium flex items-center gap-3 text-sm"><Users size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition"/> {t.managers}</span>
                      <ChevronRight size={16} className="text-slate-300"/>
                  </button>
              )}

              <button onClick={goHome} className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 p-4 rounded-xl font-bold flex justify-center gap-2 mt-8 text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition">
                  <LogOut size={18}/> {t.logout}
              </button>
          </div>
      </div>
  );

  // Bottom Navigation Helper
  const NavButton = ({ icon: Icon, label, active, onClick }: any) => (
      <button onClick={onClick} className={`flex flex-col items-center gap-1 transition ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          <Icon size={24} strokeWidth={active ? 2.5 : 2} />
          <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </button>
  );

  const shouldShowNav = (role === UserRole.BUYER || role === UserRole.BUILDER || role === UserRole.MANAGER) && !['FLOOR', 'CHAT_ROOM', 'ID_VERIFICATION', 'BECOME_BUILDER', 'PROJECT_CREATE', 'MANAGERS'].some(s => currentScreen.includes(s));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex transition-colors duration-200 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar (Desktop) */}
      {role && role !== UserRole.ADMIN && (
          <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-black border-r border-slate-200 dark:border-slate-800 shrink-0 h-screen sticky top-0 z-30">
             <div className="p-8 pb-6">
                 <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                     <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                         <BuildingIcon size={16} className="text-white dark:text-black" />
                     </div>
                     Constructio
                 </h1>
             </div>
             <div className="flex-grow px-4 space-y-1">
                {(role === UserRole.BUILDER || role === UserRole.MANAGER) ? (
                    <button onClick={() => setCurrentScreen('BUILDER_MY_PROJECTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${currentScreen === 'BUILDER_MY_PROJECTS' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                        <Briefcase size={20}/> {role === UserRole.MANAGER ? t.navCompanyProjects : t.myProjects}
                    </button>
                ) : (
                    <>
                        <button onClick={() => setCurrentScreen('BUYER_PROJECT_LIST')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${currentScreen === 'BUYER_PROJECT_LIST' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                            <Map size={20}/> {t.navProjects}
                        </button>
                        <button onClick={() => setCurrentScreen('BUYER_MY_HOME')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${currentScreen === 'BUYER_MY_HOME' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                            <Home size={20}/> {t.navMyHome}
                        </button>
                    </>
                )}
                
                <button onClick={() => setCurrentScreen('BUYER_CHAT_LIST')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${currentScreen === 'BUYER_CHAT_LIST' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <MessageCircle size={20}/> {t.navChats}
                </button>
                 <button onClick={() => setCurrentScreen('BUYER_PROFILE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${currentScreen === 'BUYER_PROFILE' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <User size={20}/> {t.navProfile}
                </button>
             </div>
             <div className="p-4 border-t border-slate-100 dark:border-slate-900">
                 <div className="flex items-center gap-3 p-2">
                     <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={userProfile.avatarUrl} className="w-full h-full object-cover"/></div>
                     <div className="text-sm font-bold truncate max-w-[120px]">{userProfile.name}</div>
                     <button onClick={goHome} className="ml-auto text-slate-400 hover:text-red-500"><LogOut size={16}/></button>
                 </div>
             </div>
          </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-black">
          {renderHeader()}
          
          <main className="flex-grow overflow-y-auto overflow-x-hidden relative">
            {currentScreen === 'HOME' && renderHome()}
            
            {/* Dashboards */}
            {currentScreen === 'ADMIN_DASHBOARD' && renderAdminDashboard()}
            {currentScreen === 'MODERATOR_DASHBOARD' && renderModeratorDashboard()}
            
            {/* Builder/Manager Views */}
            {(currentScreen === 'BUILDER_DASHBOARD' || currentScreen === 'BUILDER_MY_PROJECTS') && renderMyCreatedProjects()}
            {currentScreen === 'BUILDER_PROJECT_CREATE' && (
                <ProjectCreationScreen 
                    t={t} 
                    userId={effectiveBuilderId} 
                    onBack={() => setCurrentScreen('BUILDER_MY_PROJECTS')} 
                    onCreated={() => { loadMyCreatedProjects(); setCurrentScreen('BUILDER_MY_PROJECTS'); }}
                />
            )}
            {currentScreen === 'BUILDER_MANAGERS' && (
                <ManagerManagementScreen t={t} builderId={currentUserId} onBack={() => setCurrentScreen('BUYER_PROFILE')} />
            )}
            
            {/* Buyer Views */}
            {currentScreen === 'BUYER_PROJECT_LIST' && renderProjectList()}
            {currentScreen === 'BUYER_MY_HOME' && renderMyHome()}
            
            {/* Shared Views */}
            {currentScreen === 'BUYER_CHAT_LIST' && renderChatList()}
            {currentScreen === 'BUYER_PROFILE' && renderProfile()}
            {currentScreen === 'BUYER_ID_VERIFICATION' && (
                <IdentificationScreen 
                    t={t} userId={currentUserId} verificationStatus={verificationStatus} setVerificationStatus={setVerificationStatus}
                    idFront={idFront} setIdFront={setIdFront} idBack={idBack} setIdBack={setIdBack}
                    onBack={() => setCurrentScreen('BUYER_PROFILE')}
                />
            )}
            {currentScreen === 'BUYER_BECOME_BUILDER' && (
                <BecomeBuilderScreen 
                    t={t} userId={currentUserId} appStatus={builderAppStatus} setAppStatus={setBuilderAppStatus}
                    onBack={() => setCurrentScreen('BUYER_PROFILE')}
                />
            )}
            
            {/* Detail Views */}
            {currentScreen === 'BUYER_CHAT_ROOM' && activeChatSession && (
                <ChatRoom 
                    chatId={activeChatSession.id}
                    chatName={activeChatSession.name}
                    userId={currentUserId}
                    isOwner={true} 
                    isSupportChat={activeChatSession.type === 'SUPPORT'}
                    onClose={() => setCurrentScreen('BUYER_CHAT_LIST')}
                    lang={userProfile.language}
                />
            )}
            
            {(currentScreen === 'BUILDER_PROJECT_DETAIL' || currentScreen === 'BUYER_PROJECT_DETAIL') && selectedProject && (
                <div className="pb-24">
                     {/* Detail Header */}
                     <div className="h-64 relative bg-slate-900">
                         <img src={selectedProject.thumbnailUrl} className="w-full h-full object-cover opacity-60"/>
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                         <div className="absolute bottom-6 left-6 text-white max-w-lg">
                             <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-xs font-bold mb-3 flex items-center gap-1">
                                 <MapPin size={12}/> {selectedProject.location}
                             </div>
                             <h1 className="text-3xl font-bold mb-2 tracking-tight">{selectedProject.name}</h1>
                             <p className="text-sm opacity-90 line-clamp-2">{selectedProject.description}</p>
                         </div>
                     </div>
                     
                     {/* Content */}
                     <div className="p-6 max-w-5xl mx-auto">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl flex items-center gap-2"><BuildingIcon size={20}/> {t.buildings}</h3>
                            {canManageInventory && (
                                <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <Plus size={16}/> {t.addBuilding}
                                </button>
                            )}
                         </div>
                         
                         {buildings.length === 0 ? (
                             <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No buildings yet</div>
                         ) : (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {buildings.map(b => (
                                     <div key={b.id} onClick={() => openBuilding(b)} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition group">
                                         <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                                 <BuildingIcon size={24} className="text-slate-900 dark:text-white"/>
                                             </div>
                                             <div>
                                                 <div className="font-bold">{b.name}</div>
                                                 <div className="text-xs text-slate-500">{b.totalFloors} {t.floorsCount}</div>
                                             </div>
                                         </div>
                                         <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition"/>
                                     </div>
                                 ))}
                             </div>
                         )}

                         {/* Builder Info */}
                         {selectedBuilder && (
                             <div className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800">
                                 <h3 className="font-bold text-lg mb-4">{t.aboutDeveloper}</h3>
                                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start">
                                     <img src={selectedBuilder.logoUrl} className="w-20 h-20 rounded-full bg-slate-100 object-cover"/>
                                     <div>
                                         <h4 className="font-bold text-xl mb-2">{selectedBuilder.name}</h4>
                                         <p className="text-sm text-slate-500 mb-4 leading-relaxed">{selectedBuilder.description}</p>
                                         <div className="flex gap-4 text-sm font-medium">
                                             <div className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400"/> {t.founded}: {selectedBuilder.foundedYear}</div>
                                             <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-slate-400"/> {t.completedProjects}: {selectedBuilder.finishedProjectsCount}</div>
                                         </div>
                                         <button onClick={() => contactBuilder()} className="mt-4 text-slate-900 dark:text-white font-bold text-sm underline">{t.contactBuilder}</button>
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>
                </div>
            )}

            {(currentScreen === 'BUILDER_BUILDING_DETAIL' || currentScreen === 'BUYER_BUILDING_DETAIL') && selectedBuilding && (
                 <div className="p-6 pb-24 max-w-5xl mx-auto">
                     <div className="mb-6">
                         <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedBuilding.name}</h2>
                         <p className="text-slate-500">{t.selectFloor}</p>
                     </div>
                     
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {Array.from({ length: selectedBuilding.totalFloors }).map((_, i) => (
                            <button key={i} onClick={() => openFloor(selectedBuilding, i + 1)} className="aspect-square bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm group">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition">{i + 1}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.level}</div>
                            </button>
                        ))}
                     </div>
                 </div>
            )}
            
            {currentScreen === 'BUYER_FLOOR_VIEW' && currentFloorPlan && (
                <InteractiveFloorPlan 
                    imageUrl={currentFloorPlan.imageUrl}
                    apartments={currentFloorPlan.apartments}
                    role={role}
                    canManageSales={canManageSales}
                    onReserve={(id, proof) => {
                         // Optimistic Update
                         const newApts = currentFloorPlan.apartments.map(a => a.id === id ? {...a, status: ApartmentStatus.PENDING, proofImageUrl: proof} : a);
                         setCurrentFloorPlan({...currentFloorPlan, apartments: newApts});
                         api.updateApartmentStatus(currentFloorPlan.id, id, ApartmentStatus.PENDING, currentUserId, proof);
                    }} 
                    onContact={contactBuilder}
                    lang={userProfile.language}
                />
            )}
            
            {currentScreen === 'BUILDER_FLOOR_EDIT' && currentFloorPlan && (
                <div className="h-full flex flex-col">
                    <div className="flex-grow">
                         <FloorPlanEditor 
                            imageUrl={currentFloorPlan.imageUrl}
                            apartments={currentFloorPlan.apartments}
                            onSave={(apts) => {
                                // Local State update
                                setCurrentFloorPlan({...currentFloorPlan, apartments: apts});
                                // API Sync
                                api.saveFloorPlan({...currentFloorPlan, apartments: apts});
                            }}
                            lang={userProfile.language}
                         />
                    </div>
                </div>
            )}

          </main>
      </div>

      {/* Mobile Navigation */}
      {shouldShowNav && (
        <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-black border-t border-slate-100 dark:border-slate-900 flex justify-around py-3 pb-safe z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            {(role === UserRole.BUILDER || role === UserRole.MANAGER) ? (
                <NavButton 
                    icon={Briefcase} 
                    label={role === UserRole.MANAGER ? t.navCompanyProjects : t.myProjects} 
                    active={currentScreen === 'BUILDER_MY_PROJECTS'} 
                    onClick={() => setCurrentScreen('BUILDER_MY_PROJECTS')}
                />
            ) : (
                <>
                    <NavButton 
                        icon={Map} 
                        label={t.navProjects} 
                        active={currentScreen === 'BUYER_PROJECT_LIST'} 
                        onClick={() => setCurrentScreen('BUYER_PROJECT_LIST')}
                    />
                    <NavButton 
                        icon={Home} 
                        label={t.navMyHome} 
                        active={currentScreen === 'BUYER_MY_HOME'} 
                        onClick={() => setCurrentScreen('BUYER_MY_HOME')}
                    />
                </>
            )}
            
            <NavButton 
                icon={MessageCircle} 
                label={t.navChats} 
                active={currentScreen === 'BUYER_CHAT_LIST'} 
                onClick={() => setCurrentScreen('BUYER_CHAT_LIST')}
            />
            <NavButton 
                icon={User} 
                label={t.navProfile} 
                active={currentScreen === 'BUYER_PROFILE'} 
                onClick={() => setCurrentScreen('BUYER_PROFILE')}
            />
        </div>
      )}
    </div>
  );
}