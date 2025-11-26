

import React, { useState, useEffect, useRef } from 'react';
import { UserRole, ScreenName, Project, Building, FloorPlan, ApartmentStatus, Apartment, ChatSession, VerificationStatus, BuilderCompany, IdVerificationRequest, BuilderApplication, Manager, ManagerPermissions } from './types';
import { api, subscribe } from './services/api';
import { TRANSLATIONS, Language } from './utils/i18n';

// Icons
import { Briefcase, User, ArrowLeft, Plus, Map, Building as BuildingIcon, Layers, Check, ChevronRight, Search, Filter, X, MessageCircle, Home, Settings, LogOut, Camera, Moon, Sun, Edit2, Globe, MessagesSquare, HelpCircle, Shield, ShieldCheck, FileText, CreditCard, UserCheck, Upload, FileBadge, Phone, Mail, MapPin, Calendar, HardHat, ChevronLeft, Maximize2, ShieldAlert, Users, Trash2, Image as ImageIcon, List, Map as MapIcon } from 'lucide-react';

// Components
import { FloorPlanEditor } from './components/FloorPlanEditor';
import { InteractiveFloorPlan } from './components/InteractiveFloorPlan';
import { ChatRoom } from './components/ChatRoom';

// --- Extracted Components to fix Hook Rules ---

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
    
    // Automatically switch tab if already verified
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
            userName: 'Current User', // In real app, from profile
            idFrontUrl: idFront,
            idBackUrl: idBack
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h2 className="font-bold text-lg">{t.idPageTitle}</h2>
            </div>

            {/* Tabs */}
            <div className="p-4 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setTab('BASIC')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${tab === 'BASIC' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        {t.levelBasic}
                    </button>
                    <button 
                        onClick={() => setTab('VERIFIED')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${tab === 'VERIFIED' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        {t.levelVerified}
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${tab === 'VERIFIED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {tab === 'VERIFIED' ? <ShieldCheck size={32} /> : <Shield size={32} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{tab === 'VERIFIED' ? t.levelVerified : t.levelBasic}</h3>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{t.currentLevel}: {
                                    verificationStatus === 'BASIC' && tab === 'BASIC' ? t.idStatusBasic : 
                                    verificationStatus === 'VERIFIED' && tab === 'VERIFIED' ? t.idStatusVerified :
                                    verificationStatus === 'PENDING' && tab === 'VERIFIED' ? t.idStatusPending :
                                    tab === 'BASIC' ? t.idStatusBasic : 'Locked'
                                }</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">{t.benefits}</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 mt-0.5" />
                                <span className="text-sm font-medium">{t.benefitView}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 mt-0.5" />
                                <span className="text-sm font-medium">{t.benefitChat}</span>
                            </li>
                            {tab === 'VERIFIED' && (
                                <li className="flex items-start gap-3">
                                    <Check size={18} className="text-green-500 mt-0.5" />
                                    <span className="text-sm font-medium">{t.benefitBook}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {tab === 'VERIFIED' && (
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                            {verificationStatus === 'VERIFIED' ? (
                                <div className="text-center py-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <ShieldCheck size={48} className="mx-auto text-green-500 mb-2" />
                                    <p className="font-bold text-green-800 dark:text-green-300">{t.verificationSuccess}</p>
                                </div>
                            ) : verificationStatus === 'PENDING' ? (
                                <div className="text-center py-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                    <FileText size={48} className="mx-auto text-orange-500 mb-2" />
                                    <p className="font-bold text-orange-800 dark:text-orange-300">{t.idStatusPending}</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 px-4">{t.verificationPendingDesc}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => idFrontRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition aspect-[4/3]"
                                        >
                                            {idFront ? (
                                                <img src={idFront} className="w-full h-full object-cover rounded" alt="Front ID"/>
                                            ) : (
                                                <>
                                                    <CreditCard size={24} className="text-slate-400 mb-2" />
                                                    <span className="text-xs text-center font-medium text-slate-500 dark:text-slate-400">{t.uploadIdFront}</span>
                                                </>
                                            )}
                                            <input type="file" ref={idFrontRef} className="hidden" accept="image/*" onChange={(e) => handleIdUpload(e, 'front')}/>
                                        </div>
                                        <div 
                                            onClick={() => idBackRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition aspect-[4/3]"
                                        >
                                            {idBack ? (
                                                <img src={idBack} className="w-full h-full object-cover rounded" alt="Back ID"/>
                                            ) : (
                                                <>
                                                    <CreditCard size={24} className="text-slate-400 mb-2" />
                                                    <span className="text-xs text-center font-medium text-slate-500 dark:text-slate-400">{t.uploadIdBack}</span>
                                                </>
                                            )}
                                            <input type="file" ref={idBackRef} className="hidden" accept="image/*" onChange={(e) => handleIdUpload(e, 'back')}/>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={submitVerification}
                                        disabled={!idFront || !idBack}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {t.submitVerification}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'BASIC' && verificationStatus === 'BASIC' && (
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-4">
                             <button 
                                onClick={() => setTab('VERIFIED')}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                             >
                                 {t.passVerification}
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface BecomeBuilderScreenProps {
    t: any;
    userId: string;
    onBack: () => void;
    appStatus: 'NONE' | 'PENDING' | 'APPROVED';
    setAppStatus: (s: 'NONE' | 'PENDING' | 'APPROVED') => void;
}

const BecomeBuilderScreen: React.FC<BecomeBuilderScreenProps> = ({ t, userId, onBack, appStatus, setAppStatus }) => {
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [licenseImg, setLicenseImg] = useState<string | null>(null);
    const licenseInputRef = useRef<HTMLInputElement>(null);

    const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLicenseImg(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitApplication = async () => {
        if (!companyName || !address || !licenseImg) return;
        setAppStatus('PENDING');
        await api.submitBuilderApplication({
            userId,
            companyName,
            address,
            licenseUrl: licenseImg
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h2 className="font-bold text-lg">{t.becomeBuilder}</h2>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                {appStatus === 'PENDING' ? (
                     <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                         <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                             <FileBadge size={40} />
                         </div>
                         <h3 className="text-2xl font-bold mb-2">{t.applicationPending}</h3>
                         <p className="text-slate-500 dark:text-slate-400 mb-8">{t.applicationPendingDesc}</p>
                         <button onClick={onBack} className="text-indigo-600 font-bold hover:underline">{t.back}</button>
                     </div>
                ) : (
                    <div className="space-y-6">
                        {/* Hero / Benefits */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">{t.becomeBuilderTitle}</h3>
                                <p className="text-indigo-100 mb-4 text-sm leading-relaxed">{t.builderFreeInfo}</p>
                                <div className="space-y-2">
                                    <div className="font-bold text-xs uppercase tracking-wider opacity-80 mb-2">{t.builderBenefits}</div>
                                    <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-green-300"/> {t.bb1}</div>
                                    <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-green-300"/> {t.bb2}</div>
                                    <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-green-300"/> {t.bb3}</div>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 opacity-20">
                                <Briefcase size={150} />
                            </div>
                        </div>

                        {/* Application Form */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h4 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                                <BuildingIcon size={20} className="text-slate-400" />
                                {t.companyDetails}
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.companyName}</label>
                                    <input 
                                        type="text" 
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.companyAddress}</label>
                                    <input 
                                        type="text" 
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.licenseDocs}</label>
                                    <div 
                                        onClick={() => licenseInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                    >
                                        {licenseImg ? (
                                            <div className="relative w-full">
                                                <img src={licenseImg} className="max-h-40 mx-auto rounded object-contain" alt="License"/>
                                                <div className="text-xs text-center mt-2 text-green-600 dark:text-green-400 font-bold">{t.finish}</div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-slate-400 mb-2" />
                                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t.uploadLicense}</span>
                                            </>
                                        )}
                                        <input type="file" ref={licenseInputRef} className="hidden" accept="image/*" onChange={handleLicenseUpload}/>
                                    </div>
                                </div>

                                <button 
                                    onClick={submitApplication}
                                    disabled={!companyName || !address || !licenseImg}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
                                >
                                    {t.submitApplication}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ManagerManagementScreenProps {
    t: any;
    builderId: string;
    onBack: () => void;
}

const ManagerManagementScreen: React.FC<ManagerManagementScreenProps> = ({ t, builderId, onBack }) => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [searchedUser, setSearchedUser] = useState<{id: string, name: string, avatarUrl: string, phone: string, verified: boolean} | null>(null);
    const [notFound, setNotFound] = useState(false);
    
    const [permissions, setPermissions] = useState<ManagerPermissions>({
        canChatCommunity: true,
        canProcessClaims: false,
        canSupportChat: true,
        canManageInventory: false
    });

    useEffect(() => {
        loadManagers();
    }, []);

    const loadManagers = async () => {
        const data = await api.getBuilderManagers(builderId);
        setManagers(data);
    };

    const handleSearch = async () => {
        if (!phoneInput) return;
        setNotFound(false);
        setSearchedUser(null);
        const user = await api.searchUserByPhone(phoneInput);
        if (user) {
            setSearchedUser(user);
        } else {
            setNotFound(true);
        }
    };

    const handleAddManager = async () => {
        if (!searchedUser || !searchedUser.verified) return;
        await api.addManager(builderId, searchedUser.id, {
            name: searchedUser.name,
            avatarUrl: searchedUser.avatarUrl,
            phone: searchedUser.phone
        }, permissions);
        setShowAddForm(false);
        setSearchedUser(null);
        setPhoneInput('');
        loadManagers();
    };

    const handleRemove = async (id: string) => {
        await api.removeManager(id);
        loadManagers();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
             {/* Header */}
             <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h2 className="font-bold text-lg">{t.managers}</h2>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                {showAddForm ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-lg mb-4">{t.addManager}</h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.phoneNum}</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    placeholder="e.g. 999999999"
                                    className="flex-grow border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                            {notFound && <p className="text-red-500 text-sm mt-2">{t.userNotFound}</p>}
                        </div>

                        {searchedUser && (
                            <div className="mb-6">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <img src={searchedUser.avatarUrl} alt={searchedUser.name} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <div className="font-bold dark:text-white">{searchedUser.name}</div>
                                        {searchedUser.verified ? (
                                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full w-fit mt-1">
                                                <ShieldCheck size={12} /> {t.idStatusVerified}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                <ShieldAlert size={12} /> {t.userNotVerified}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!searchedUser.verified && (
                                    <p className="text-sm text-slate-500 mt-2">{t.userNotVerifiedDesc}</p>
                                )}
                            </div>
                        )}

                        {searchedUser && searchedUser.verified && (
                            <div className="mb-6">
                                <h4 className="font-bold mb-3">{t.permissions}</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={permissions.canChatCommunity}
                                            onChange={(e) => setPermissions({...permissions, canChatCommunity: e.target.checked})}
                                            className="w-5 h-5 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium">{t.permChat}</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={permissions.canProcessClaims}
                                            onChange={(e) => setPermissions({...permissions, canProcessClaims: e.target.checked})}
                                            className="w-5 h-5 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium">{t.permSales}</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={permissions.canSupportChat}
                                            onChange={(e) => setPermissions({...permissions, canSupportChat: e.target.checked})}
                                            className="w-5 h-5 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium">{t.permSupport}</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={permissions.canManageInventory}
                                            onChange={(e) => setPermissions({...permissions, canManageInventory: e.target.checked})}
                                            className="w-5 h-5 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium">{t.permInventory}</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setShowAddForm(false); setSearchedUser(null); }}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                onClick={handleAddManager}
                                disabled={!searchedUser || !searchedUser.verified}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center justify-center gap-2 font-bold mb-6"
                        >
                            <Plus size={20} />
                            {t.addManager}
                        </button>

                        {managers.length === 0 ? (
                            <div className="text-center text-slate-400 py-8">{t.noManagers}</div>
                        ) : (
                            <div className="space-y-4">
                                {managers.map(mgr => (
                                    <div key={mgr.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <img src={mgr.avatarUrl} alt={mgr.name} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <div className="font-bold dark:text-white">{mgr.name}</div>
                                                    <div className="text-xs text-slate-500">{mgr.phone}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemove(mgr.id)}
                                                className="text-red-400 hover:bg-red-50 p-2 rounded-full"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {mgr.permissions.canChatCommunity && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-100">{t.permChat}</span>}
                                            {mgr.permissions.canProcessClaims && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold border border-green-100">{t.permSales}</span>}
                                            {mgr.permissions.canSupportChat && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-100">{t.permSupport}</span>}
                                            {mgr.permissions.canManageInventory && <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded font-bold border border-orange-100">{t.permInventory}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

interface ProjectCreationScreenProps {
    t: any;
    userId: string;
    onBack: () => void;
    onCreated: () => void;
}

const ProjectCreationScreen: React.FC<ProjectCreationScreenProps> = ({ t, userId, onBack, onCreated }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [location, setLocation] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Map Picker State
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [mapMarker, setMapMarker] = useState<{x: number, y: number} | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleMapClick = (e: React.MouseEvent) => {
        if (!mapRef.current) return;
        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update visual marker relative to container
        setMapMarker({ x, y });
    };

    const confirmMapSelection = () => {
        if (mapMarker && mapRef.current) {
            // Simulate lat/lng calculation relative to Dushanbe
            // Map Size assumes around 800x600 equivalent in visual scaling logic for demo
            // Center roughly 38.5598, 68.7870
            const width = mapRef.current.offsetWidth;
            const height = mapRef.current.offsetHeight;
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            // Arbitrary scale: 1 pixel = 0.0005 degrees
            const scale = 0.0005;
            
            const latDiff = (centerY - mapMarker.y) * scale;
            const lngDiff = (mapMarker.x - centerX) * scale;
            
            const newLat = (38.5598 + latDiff).toFixed(6);
            const newLng = (68.7870 + lngDiff).toFixed(6);
            
            setLat(newLat);
            setLng(newLng);
            setShowMapPicker(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !desc || !location) return;
        setLoading(true);
        await api.createProject({
            name,
            description: desc,
            location,
            builderId: userId,
            images,
            latitude: lat ? parseFloat(lat) : undefined,
            longitude: lng ? parseFloat(lng) : undefined
        });
        setLoading(false);
        onCreated();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
             <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h2 className="font-bold text-lg">{t.createProject}</h2>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.projectName}</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.projDesc}</label>
                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={3}
                            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="font-bold text-slate-800 dark:text-white border-b pb-2 dark:border-slate-700">{t.projectLocation}</div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.projAddr}</label>
                            <input 
                                type="text" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.coords}</label>
                             <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <input 
                                        type="number" 
                                        placeholder={t.lat}
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>
                                <div>
                                    <input 
                                        type="number" 
                                        placeholder={t.lng}
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>
                             </div>
                             <button 
                                onClick={() => setShowMapPicker(true)}
                                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-medium border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                             >
                                 <MapIcon size={18} /> {t.pickOnMap}
                             </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="font-bold text-slate-800 dark:text-white border-b pb-2 dark:border-slate-700">{t.projImages}</div>
                        <div className="grid grid-cols-3 gap-2">
                             {images.map((img, idx) => (
                                 <div key={idx} className="relative aspect-square">
                                     <img src={img} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                                     <button 
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md"
                                     >
                                         <X size={12} />
                                     </button>
                                 </div>
                             ))}
                             <button 
                                onClick={() => imageInputRef.current?.click()}
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                             >
                                 <Plus size={24} />
                                 <span className="text-xs font-medium">{t.addImage}</span>
                             </button>
                             <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={!name || !desc || !location || loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        {loading ? t.loading : t.createProjBtn}
                    </button>
                </div>
            </div>

            {/* Map Picker Modal */}
            {showMapPicker && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg dark:text-white">{t.pickOnMap}</h3>
                        <button onClick={() => setShowMapPicker(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <X size={20} className="dark:text-white" />
                        </button>
                    </div>
                    
                    <div className="flex-grow relative bg-slate-200 overflow-hidden cursor-crosshair">
                         {/* Simulated Map Container */}
                         <div 
                            ref={mapRef}
                            onClick={handleMapClick}
                            className="w-full h-full bg-cover bg-center relative"
                            style={{ 
                                backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=38.5598,68.7870&zoom=13&size=800x800&maptype=roadmap&style=feature:poi%7Cvisibility:off&key=YOUR_API_KEY_PLACEHOLDER')`, // Fallback visual
                                background: '#e5e7eb url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Dushanbe_map.png/600px-Dushanbe_map.png") no-repeat center center',
                                backgroundSize: 'cover'
                            }}
                         >
                             {/* Map Instructions Overlay */}
                             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/70 px-4 py-2 rounded-full shadow-lg text-sm font-medium backdrop-blur-sm pointer-events-none">
                                 {t.tapMapInstruction}
                             </div>

                             {/* Visual Pin Marker */}
                             {mapMarker && (
                                 <div 
                                    className="absolute -translate-x-1/2 -translate-y-full pointer-events-none drop-shadow-lg"
                                    style={{ left: mapMarker.x, top: mapMarker.y }}
                                 >
                                     <MapPin size={48} className="text-red-600 fill-red-600" />
                                 </div>
                             )}
                         </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800">
                         <button 
                            onClick={confirmMapSelection}
                            disabled={!mapMarker}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                         >
                             {t.confirmLocation}
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [currentUserId, setCurrentUserId] = useState(() => 'user-' + Math.random().toString(36).substr(2, 9)); // Stable ID for session
  
  // Profile State
  const [userProfile, setUserProfile] = useState({
      name: 'John Doe',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      language: 'ru' as Language
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Verification State
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('BASIC');
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  
  // Builder Application State
  const [builderAppStatus, setBuilderAppStatus] = useState<'NONE' | 'PENDING' | 'APPROVED'>('NONE');

  // Moderator Data State
  const [pendingVerifications, setPendingVerifications] = useState<IdVerificationRequest[]>([]);
  const [pendingBuilderApps, setPendingBuilderApps] = useState<BuilderApplication[]>([]);
  const [moderatorTab, setModeratorTab] = useState<'ID' | 'BUILDER'>('ID');

  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<number>(1);
  const [currentFloorPlan, setCurrentFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Builder Profile Data
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderCompany | null>(null);
  const [builderProjects, setBuilderProjects] = useState<Project[]>([]);
  const [myCreatedProjects, setMyCreatedProjects] = useState<Project[]>([]);

  // Chat State
  const [isProjectMember, setIsProjectMember] = useState(false); // For Community Chat Permissions
  const [myChats, setMyChats] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);

  const [myApartments, setMyApartments] = useState<any[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCityFilter, setShowCityFilter] = useState(false);

  // Creation State (Wizard)
  const [newBuildingData, setNewBuildingData] = useState({ name: '', totalFloors: 10, imageUrl: 'https://picsum.photos/1000/800?random=101' });
  const [templateApartments, setTemplateApartments] = useState<Apartment[]>([]);
  const [creationStep, setCreationStep] = useState<1 | 2>(1);
  
  // Lightbox State
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const floorImageInputRef = useRef<HTMLInputElement>(null);
  // idFrontRef and idBackRef moved to IdentificationScreen component

  // Translation Helper
  const t = TRANSLATIONS[userProfile.language];

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Subscribe to "Real-time" updates
  useEffect(() => {
    const unsubscribe = subscribe(async () => {
      // Refresh logic based on current view
      if ((role === UserRole.BUYER && currentScreen === 'BUYER_PROJECT_LIST') || (role === UserRole.BUILDER && currentScreen === 'BUILDER_DASHBOARD')) loadProjects();
      
      if (currentScreen.includes('PROJECT_DETAIL') && selectedProject) {
          loadBuildings(selectedProject.id);
          if (selectedProject.builderId) loadBuilderInfo(selectedProject.builderId);
      }
      if (currentFloorPlan && currentScreen.includes('FLOOR')) loadFloorPlan(currentFloorPlan.buildingId, currentFloorPlan.floorLevel);
      if (currentScreen === 'BUYER_CHAT_LIST') loadUserChats();
      if (currentScreen === 'BUYER_CHAT_ROOM' && selectedProject) checkProjectAccess(selectedProject.id);
      if (currentScreen === 'BUYER_MY_HOME') loadMyApartments();
      if (currentScreen === 'BUILDER_MY_PROJECTS') loadMyCreatedProjects();
      
      // Moderator Updates
      if (role === UserRole.MODERATOR) {
          loadModeratorData();
      }

      // Refresh User Status (For User Roles) to check if requests were approved
      if (role === UserRole.BUYER || role === UserRole.BUILDER) {
          const status = await api.getUserStatus(currentUserId);
          setVerificationStatus(status.verification);
          setBuilderAppStatus(status.builderApp);
      }
    });
    return () => { unsubscribe(); };
  }, [role, currentScreen, currentFloorPlan, selectedProject, selectedBuilding, currentUserId]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await api.getProjects();
    setProjects(data);
    setLoading(false);
  };

  const loadBuildings = async (projectId: string) => {
    setLoading(true);
    const data = await api.getBuildings(projectId);
    setBuildings(data);
    setLoading(false);
  };
  
  const loadBuilderInfo = async (builderId: string) => {
      const builder = await api.getBuilder(builderId);
      if (builder) setSelectedBuilder(builder);
  };

  const loadFloorPlan = async (buildingId: string, level: number) => {
    setLoading(true);
    const fp = await api.getFloorPlan(buildingId, level);
    // If no floor plan exists yet for builder, create a dummy one structure
    if (!fp && role === UserRole.BUILDER) {
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
      const data = await api.getBuilderProjects(currentUserId);
      setMyCreatedProjects(data);
      setLoading(false);
  }

  const loadUserChats = async () => {
      setLoading(true);
      const chats = await api.getUserChats(currentUserId);
      setMyChats(chats);
      setLoading(false);
  }

  const checkProjectAccess = async (projectId: string) => {
      const isMember = await api.checkProjectAccess(projectId, currentUserId);
      setIsProjectMember(isMember);
  };

  const loadModeratorData = async () => {
      const ids = await api.getPendingVerifications();
      setPendingVerifications(ids);
      const apps = await api.getPendingBuilderApplications();
      setPendingBuilderApps(apps);
  }

  // --- Navigation Handlers ---

  const goHome = () => {
    setRole(null);
    setCurrentScreen('HOME');
  };

  const startBuilder = () => {
    setRole(UserRole.BUILDER);
    // Mimic logging in as 'Golden State Construction' for demo purposes
    setCurrentUserId('c1'); 
    loadProjects();
    setCurrentScreen('BUILDER_DASHBOARD');
  };

  const startBuyer = () => {
    setRole(UserRole.BUYER);
    // Reset to random user ID if switching back from builder demo
    if (currentUserId === 'c1') setCurrentUserId('user-' + Math.random().toString(36).substr(2, 9));
    loadProjects();
    setCurrentScreen('BUYER_PROJECT_LIST');
  };

  const startModerator = () => {
      setRole(UserRole.MODERATOR);
      loadModeratorData();
      setCurrentScreen('MODERATOR_DASHBOARD');
  }

  const openProject = async (p: Project) => {
    setSelectedProject(p);
    await loadBuildings(p.id);
    if (p.builderId) await loadBuilderInfo(p.builderId);
    if (role === UserRole.BUILDER) setCurrentScreen('BUILDER_PROJECT_DETAIL');
    else setCurrentScreen('BUYER_PROJECT_DETAIL');
  };

  const openBuilding = (b: Building) => {
      setSelectedBuilding(b);
      if (role === UserRole.BUILDER) setCurrentScreen('BUILDER_BUILDING_DETAIL');
      else setCurrentScreen('BUYER_BUILDING_DETAIL');
  };

  const openFloor = async (b: Building, level: number) => {
    setSelectedBuilding(b);
    setSelectedFloorLevel(level);
    await loadFloorPlan(b.id, level);
    if (role === UserRole.BUILDER) setCurrentScreen('BUILDER_FLOOR_EDIT');
    else setCurrentScreen('BUYER_FLOOR_VIEW');
  };

  const openBuilderProfile = async (builder: BuilderCompany) => {
      setLoading(true);
      setSelectedBuilder(builder);
      const projs = await api.getBuilderProjects(builder.id);
      setBuilderProjects(projs);
      setLoading(false);
      setCurrentScreen('BUYER_BUILDER_PROFILE');
  }

  // Open Community Chat
  const openProjectChat = async (p: Project) => {
      setSelectedProject(p);
      await checkProjectAccess(p.id);
      setActiveChatSession({
          id: p.id,
          type: 'COMMUNITY',
          name: p.name,
          subtext: t.communityChat,
          projectId: p.id
      });
      setCurrentScreen('BUYER_CHAT_ROOM');
  };

  // Open Support Chat (Direct with Builder)
  const contactBuilder = async () => {
      if (!selectedProject) return;
      const chatId = await api.startSupportChat(selectedProject.id, currentUserId);
      
      setActiveChatSession({
          id: chatId,
          type: 'SUPPORT',
          name: `${selectedProject.name} (Support)`,
          subtext: t.supportChat,
          projectId: selectedProject.id
      });
      setCurrentScreen('BUYER_CHAT_ROOM');
  }

  // Open chat from list
  const openChatSession = async (chat: ChatSession) => {
      setActiveChatSession(chat);
      // Determine permissions
      if (chat.type === 'COMMUNITY') {
          await checkProjectAccess(chat.projectId);
      }
      setCurrentScreen('BUYER_CHAT_ROOM');
  }

  const openChatList = () => {
      loadUserChats();
      setCurrentScreen('BUYER_CHAT_LIST');
  };

  const openMyHome = () => {
      loadMyApartments();
      setCurrentScreen('BUYER_MY_HOME');
  };

  const openMyProjects = () => {
      loadMyCreatedProjects();
      setCurrentScreen('BUILDER_MY_PROJECTS');
  }

  const openProfile = () => {
      setCurrentScreen('BUYER_PROFILE');
  }
  
  const openIdentification = () => {
      setCurrentScreen('BUYER_ID_VERIFICATION');
  }
  
  const openBecomeBuilder = () => {
      setCurrentScreen('BUYER_BECOME_BUILDER');
  }

  const openManagers = () => {
      setCurrentScreen('BUILDER_MANAGERS');
  }

  const startCreateBuilding = () => {
    setNewBuildingData({ name: '', totalFloors: 10, imageUrl: 'https://picsum.photos/1000/800?random=' + Math.floor(Math.random() * 100) });
    setTemplateApartments([]);
    setCreationStep(1);
    setCurrentScreen('BUILDER_BUILDING_CREATE');
  };

  const finishCreateBuilding = async () => {
    if (!selectedProject) return;
    setLoading(true);
    await api.createBuilding(
        { 
            projectId: selectedProject.id, 
            name: newBuildingData.name, 
            totalFloors: newBuildingData.totalFloors 
        }, 
        {
            imageUrl: newBuildingData.imageUrl,
            apartments: templateApartments
        }
    );
    await loadBuildings(selectedProject.id);
    setLoading(false);
    setCurrentScreen('BUILDER_PROJECT_DETAIL');
  };
  
  const startCreateProject = () => {
      setCurrentScreen('BUILDER_PROJECT_CREATE');
  }

  // --- Lightbox Helpers ---
  const openLightbox = (index: number) => {
      setCurrentImageIndex(index);
      setShowLightbox(true);
  };
  
  const nextImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedProject) {
          const images = selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images : [selectedProject.thumbnailUrl];
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }
  };
  
  const prevImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedProject) {
          const images = selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images : [selectedProject.thumbnailUrl];
          setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
  };

  // --- Screens ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white">
      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
        <BuildingIcon size={32} className="text-indigo-400" />
      </div>
      <h1 className="text-4xl font-bold mb-2 tracking-tight">{t.appName}</h1>
      <p className="text-indigo-200 mb-12 text-center max-w-sm">{t.appDesc}</p>
      
      <div className="grid gap-4 w-full max-w-sm">
        <button onClick={startBuyer} className="flex items-center justify-center gap-3 bg-white text-indigo-900 py-4 px-6 rounded-xl font-bold hover:bg-indigo-50 transition active:scale-[0.98]">
          <User size={20} />
          {t.imBuyer}
        </button>
        <button onClick={startBuilder} className="flex items-center justify-center gap-3 bg-indigo-600/50 border border-indigo-500/30 py-4 px-6 rounded-xl font-bold text-white hover:bg-indigo-600/70 transition active:scale-[0.98]">
          <Briefcase size={20} />
          {t.imBuilder}
        </button>
        <button onClick={startModerator} className="flex items-center justify-center gap-3 bg-transparent border border-indigo-500/30 py-3 px-6 rounded-xl font-medium text-indigo-300 hover:text-white hover:bg-white/5 transition text-sm">
          <ShieldAlert size={16} />
          {t.imModerator}
        </button>
      </div>
    </div>
  );

  const renderModeratorDashboard = () => (
      <div className="flex flex-col h-full dark:text-slate-100 pb-safe">
          {/* Header */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
              <h1 className="font-bold text-lg">{t.modDashboard}</h1>
              <button onClick={goHome} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition">
                  <LogOut size={20} />
              </button>
          </div>

          {/* Tabs */}
          <div className="p-4 bg-white dark:bg-slate-900">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button 
                      onClick={() => setModeratorTab('ID')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${moderatorTab === 'ID' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t.pendingIds} <span className="ml-1 bg-slate-200 dark:bg-slate-900 px-1.5 rounded-full text-xs">{pendingVerifications.length}</span>
                  </button>
                  <button 
                      onClick={() => setModeratorTab('BUILDER')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${moderatorTab === 'BUILDER' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t.pendingBuilders} <span className="ml-1 bg-slate-200 dark:bg-slate-900 px-1.5 rounded-full text-xs">{pendingBuilderApps.length}</span>
                  </button>
              </div>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
              {moderatorTab === 'ID' && pendingVerifications.length === 0 && (
                  <div className="text-center py-12 text-slate-400">{t.noPendingRequests}</div>
              )}
              {moderatorTab === 'ID' && pendingVerifications.map(req => (
                  <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600">
                              <User size={20} />
                          </div>
                          <div>
                              <div className="font-bold">{req.userName}</div>
                              <div className="text-xs text-slate-500">ID: {req.userId}</div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                          <div>
                              <div className="text-xs text-slate-500 mb-1">Front</div>
                              <img src={req.idFrontUrl} className="w-full h-24 object-cover rounded border dark:border-slate-600" alt="Front ID" />
                          </div>
                          <div>
                              <div className="text-xs text-slate-500 mb-1">Back</div>
                              <img src={req.idBackUrl} className="w-full h-24 object-cover rounded border dark:border-slate-600" alt="Back ID" />
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => api.reviewIdVerification(req.id, true)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                          >
                              {t.accept}
                          </button>
                          <button 
                            onClick={() => api.reviewIdVerification(req.id, false)}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-100"
                          >
                              {t.decline}
                          </button>
                      </div>
                  </div>
              ))}

              {moderatorTab === 'BUILDER' && pendingBuilderApps.length === 0 && (
                  <div className="text-center py-12 text-slate-400">{t.noPendingRequests}</div>
              )}
              {moderatorTab === 'BUILDER' && pendingBuilderApps.map(app => (
                  <div key={app.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-full text-orange-600">
                              <Briefcase size={20} />
                          </div>
                          <div>
                              <div className="font-bold">{app.companyName}</div>
                              <div className="text-xs text-slate-500">{app.address}</div>
                          </div>
                      </div>
                      <div className="mb-4">
                          <div className="text-xs text-slate-500 mb-1">{t.docs}</div>
                          <img src={app.licenseUrl} className="w-full h-32 object-contain bg-slate-50 dark:bg-slate-900 rounded border dark:border-slate-600" alt="License" />
                      </div>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => api.reviewBuilderApplication(app.id, true)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                          >
                              {t.accept}
                          </button>
                          <button 
                            onClick={() => api.reviewBuilderApplication(app.id, false)}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-100"
                          >
                              {t.decline}
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderProjectList = () => {
    // Filter Logic
    const uniqueCities = Array.from(new Set(projects.map(p => p.location)));
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCity ? p.location === selectedCity : true;
        return matchesSearch && matchesCity;
    });

    return (
    <div className="p-4 sm:p-6 pb-24 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t.exploreProjects}</h2>
      
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm dark:text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setShowCityFilter(!showCityFilter)}
                className={`flex items-center gap-2 px-4 rounded-xl border font-medium transition ${showCityFilter || selectedCity ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
                <Filter size={20} />
                <span className="hidden sm:inline">{t.filter}</span>
            </button>
        </div>

        {/* City Chips */}
        {(showCityFilter || selectedCity) && (
            <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                <button
                    onClick={() => setSelectedCity(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${!selectedCity ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    {t.allCities}
                </button>
                {uniqueCities.map(city => (
                    <button
                        key={city}
                        onClick={() => setSelectedCity(city === selectedCity ? null : city)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1 ${city === selectedCity ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {city}
                        {city === selectedCity && <X size={14} className="ml-1" />}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(p => (
          <div key={p.id} onClick={() => openProject(p)} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition group">
            <div className="h-48 overflow-hidden relative">
                <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-1 text-xs font-medium bg-indigo-600/90 px-2 py-0.5 rounded w-fit mb-1">
                        <Map size={10} /> {p.location}
                    </div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                </div>
            </div>
            <div className="p-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{p.description}</p>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>{t.noProjects}</p>
            </div>
        )}
      </div>
    </div>
  )};

  const renderMyCreatedProjects = () => (
      <div className="p-4 sm:p-6 pb-24 dark:text-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.myProjects}</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCreatedProjects.map(p => (
              <div key={p.id} onClick={() => openProject(p)} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition group relative">
                 <div className="h-48 overflow-hidden relative">
                    <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-white font-bold text-lg">{p.name}</h3>
                    </div>
                 </div>
                 <div className="p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{p.location}</span>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-bold uppercase">Owner</span>
                 </div>
              </div>
            ))}
            
            <button 
                onClick={startCreateProject}
                className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:border-indigo-50 dark:hover:bg-indigo-900/20 transition group"
            >
                <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm mb-3 group-hover:scale-110 transition">
                    <Plus size={32} />
                </div>
                <span className="font-bold">{t.createProject}</span>
            </button>
          </div>
      </div>
  );

  const renderProjectDetail = () => {
      const projectImages = selectedProject?.images && selectedProject.images.length > 0 
          ? selectedProject.images 
          : selectedProject ? [selectedProject.thumbnailUrl] : [];
          
      return (
    <div className="pb-24 dark:text-slate-100 flex flex-col h-full overflow-y-auto">
       {/* Hero Image Slider */}
       <div className="relative h-64 sm:h-80 w-full shrink-0 group">
           <div className="w-full h-full overflow-x-auto snap-x snap-mandatory flex scrollbar-hide">
               {projectImages.map((img, idx) => (
                   <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                        <img 
                            src={img} 
                            alt={`${selectedProject?.name} ${idx + 1}`} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => openLightbox(idx)}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                   </div>
               ))}
           </div>
           
           {/* Image Counter Badge */}
           <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md pointer-events-none flex items-center gap-1">
               <Maximize2 size={12}/> {projectImages.length}
           </div>

           {/* Content Overlay */}
           <div className="absolute bottom-0 left-0 p-6 w-full pointer-events-none">
                <div className="flex items-center justify-between items-end">
                    <div>
                        <div className="flex items-center gap-1.5 text-indigo-300 mb-1 font-medium">
                            <MapPin size={16} /> {selectedProject?.location}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 shadow-sm">{selectedProject?.name}</h2>
                        <p className="text-slate-200 text-sm max-w-xl line-clamp-2">{selectedProject?.description}</p>
                    </div>
                     {/* Project Chat Button */}
                    {role === UserRole.BUYER && selectedProject && (
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openProjectChat(selectedProject); }}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition transform hover:-translate-y-1 pointer-events-auto"
                        >
                            <MessageCircle size={20} />
                            <span>{t.projectChat}</span>
                        </button>
                    )}
                </div>
           </div>
           
           {/* Back Button Overlay */}
           <div className="absolute top-4 left-4 z-20">
               <button 
                    onClick={() => {
                        if (role === UserRole.BUILDER) {
                            // If user is owner, go to My Projects, else Dashboard
                            if (selectedProject?.builderId === currentUserId) setCurrentScreen('BUILDER_MY_PROJECTS');
                            else setCurrentScreen('BUILDER_DASHBOARD');
                        } else {
                            setCurrentScreen('BUYER_PROJECT_LIST');
                        }
                    }}
                    className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full text-white shadow-lg transition"
               >
                    <ArrowLeft size={24} />
               </button>
           </div>
       </div>
       
       <div className="p-4 sm:p-6 space-y-8">
           {/* Buildings List */}
           <section>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                         <BuildingIcon className="text-indigo-500"/>
                         {t.buildings}
                     </h3>
                     {role === UserRole.BUILDER && selectedProject?.builderId === currentUserId && (
                        <button 
                            onClick={startCreateBuilding}
                            className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                        >
                            + {t.addBuilding}
                        </button>
                     )}
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                    {buildings.map(b => (
                        <div key={b.id} onClick={() => openBuilding(b)} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                                    <BuildingIcon size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{b.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{b.totalFloors} {t.floorsCount}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    ))}
                    {buildings.length === 0 && (
                        <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                            {t.loading}
                        </div>
                    )}
                </div>
           </section>

           {/* Builder Profile Card */}
           {selectedBuilder && (
               <section>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <HardHat className="text-indigo-500" />
                       {t.aboutDeveloper}
                   </h3>
                   <div 
                      onClick={() => openBuilderProfile(selectedBuilder)}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition cursor-pointer group relative overflow-hidden"
                   >
                       {/* Background Pattern */}
                       <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12">
                            <Briefcase size={120} />
                       </div>
                       
                       <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                           <img 
                              src={selectedBuilder.logoUrl} 
                              alt={selectedBuilder.name} 
                              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                           />
                           <div className="flex-1 text-center sm:text-left">
                               <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition">{selectedBuilder.name}</h4>
                               <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                                   <span className="flex items-center gap-1"><Calendar size={14} /> {t.founded}: {selectedBuilder.foundedYear}</span>
                                   <span className="flex items-center gap-1"><Check size={14} /> {t.completedProjects}: {selectedBuilder.finishedProjectsCount}</span>
                               </div>
                               <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">{selectedBuilder.description}</p>
                               <button className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center sm:justify-start gap-1 hover:underline">
                                   {t.viewProfile} <ChevronRight size={16} />
                                </button>
                           </div>
                       </div>
                   </div>
               </section>
           )}

            {/* Google Maps Section */}
            {(selectedProject?.location || (selectedProject?.latitude && selectedProject?.longitude)) && (
                <section>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="text-indigo-500" />
                        {t.locationMap}
                    </h3>
                    <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                         <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={
                                selectedProject.latitude && selectedProject.longitude
                                ? `https://maps.google.com/maps?q=${selectedProject.latitude},${selectedProject.longitude}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                                : `https://maps.google.com/maps?q=${encodeURIComponent(selectedProject.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                            }
                            title="Project Location"
                            className="w-full h-full"
                         ></iframe>
                    </div>
                </section>
            )}
       </div>
    </div>
  )};

  const renderBuilderProfile = () => (
      <div className="pb-24 dark:text-slate-100 overflow-y-auto h-full bg-slate-50 dark:bg-slate-950">
          {/* Cover Header */}
          <div className="h-48 bg-slate-900 relative">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
               <div className="absolute -bottom-12 left-6">
                    <img 
                        src={selectedBuilder?.logoUrl} 
                        alt="Logo" 
                        className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg bg-white object-contain"
                    />
               </div>
          </div>

          <div className="pt-14 px-6">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedBuilder?.name}</h2>
               <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        <MapPin size={14} /> {selectedBuilder?.address}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        <Calendar size={14} /> {t.founded} {selectedBuilder?.foundedYear}
                    </div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{selectedBuilder?.finishedProjectsCount}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.completedProjects}</div>
                   </div>
                   <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-3xl font-bold text-orange-500">{selectedBuilder?.underConstructionCount}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.underConstruction}</div>
                   </div>
               </div>

               {/* About Section */}
               <div className="mb-8">
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{t.aboutDeveloper}</h3>
                   <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                       {selectedBuilder?.description}
                   </p>
               </div>
               
               {/* Contact Info */}
               <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl mb-8">
                   <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3">{t.contactInfo}</h3>
                   <div className="space-y-2">
                       <div className="flex items-center gap-3 text-sm text-indigo-800 dark:text-indigo-300">
                           <Phone size={16} /> {selectedBuilder?.phone}
                       </div>
                       <div className="flex items-center gap-3 text-sm text-indigo-800 dark:text-indigo-300">
                           <Mail size={16} /> {selectedBuilder?.email}
                       </div>
                   </div>
               </div>

               {/* Projects List */}
               <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{t.moreFromBuilder}</h3>
               <div className="space-y-4">
                   {builderProjects.map(p => (
                       <div key={p.id} onClick={() => openProject(p)} className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-400 transition">
                           <img src={p.thumbnailUrl} className="w-20 h-20 rounded-lg object-cover" alt={p.name} />
                           <div className="py-1">
                               <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                               <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{p.location}</div>
                               <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">View Project</span>
                           </div>
                       </div>
                   ))}
               </div>
          </div>
      </div>
  );

  const renderFloorList = () => (
    <div className="p-4 sm:p-6 pb-24 dark:text-slate-100">
        <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBuilding?.name}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t.selectFloor}</p>
            </div>
            {/* Direct Chat Access from Floor View */}
            {role === UserRole.BUYER && selectedProject && (
                <button 
                    onClick={() => openProjectChat(selectedProject)} 
                    className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition"
                >
                    <MessageCircle size={16} /> {t.projectChat}
                </button>
            )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {selectedBuilding && Array.from({ length: selectedBuilding.totalFloors }).map((_, i) => {
                const floor = i + 1;
                return (
                    <button 
                    key={floor} 
                    onClick={() => openFloor(selectedBuilding, floor)}
                    className="p-4 flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition group"
                    >
                        <Layers size={24} className="mb-2 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"/>
                        <span className="font-bold text-lg dark:text-white">{t.level} {floor}</span>
                        <span className="text-xs text-slate-400">{t.viewPlan}</span>
                    </button>
                )
            })}
        </div>
    </div>
  );

  const renderChatList = () => (
      <div className="p-4 pb-24 h-full flex flex-col dark:text-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.communityChats}</h2>
          
          {loading ? <div className="text-center py-10 text-slate-400">{t.loading}</div> : null}

          {!loading && myChats.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                      <MessagesSquare size={32} className="opacity-40"/>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{t.noActiveChats}</h3>
                  <p className="max-w-xs">{t.noActiveChatsDesc}</p>
              </div>
          ) : (
            <div className="space-y-2 overflow-y-auto">
              {myChats.map(chat => (
                  <button 
                    key={chat.id} 
                    onClick={() => openChatSession(chat)}
                    className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition text-left group"
                  >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 ${chat.type === 'SUPPORT' ? 'bg-orange-500' : 'bg-gradient-to-tr from-indigo-500 to-purple-500'}`}>
                          {chat.type === 'SUPPORT' ? <HelpCircle size={24} /> : <MessageCircle size={24} />}
                      </div>
                      <div className="flex-grow">
                          <h3 className="font-bold text-slate-900 dark:text-white">{chat.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{chat.subtext}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                  </button>
              ))}
            </div>
          )}
      </div>
  );

  const renderMyHome = () => (
    <div className="p-4 sm:p-6 pb-24 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.myProperties}</h2>
      {loading ? (
        <div className="text-center py-12 text-slate-400">{t.loading}</div>
      ) : myApartments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
           <Home size={48} className="mx-auto mb-4 opacity-20" />
           <p>{t.noProperties}</p>
           <button onClick={() => setCurrentScreen('BUYER_PROJECT_LIST')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
             {t.browseProjects}
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myApartments.map((item, idx) => (
             <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => openFloor(item.building, item.floorPlan.floorLevel)}>
                <div className="h-32 overflow-hidden relative">
                   <img src={item.project.thumbnailUrl} className="w-full h-full object-cover" alt={item.project.name} />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <h3 className="text-white font-bold text-xl">{item.project.name}</h3>
                   </div>
                </div>
                <div className="p-4">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-lg">{item.building.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">{t.unit} {item.apartment.unitNumber} • {t.level} {item.floorPlan.floorLevel}</div>
                      </div>
                      <div className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                          item.apartment.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          item.apartment.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          item.apartment.status === 'PENDING' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {item.apartment.status === 'AVAILABLE' ? t.available : item.apartment.status === 'RESERVED' ? t.reserved : item.apartment.status === 'PENDING' ? t.pending : t.sold}
                      </div>
                   </div>
                   <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-300 mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                      <div className="flex items-center gap-1"><Layers size={14}/> {item.apartment.rooms} {t.rooms}</div>
                      <div className="flex items-center gap-1"> {item.apartment.areaSqFt} sq ft</div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => {
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
      <div className="p-4 pb-24 dark:text-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.profileHeader}</h2>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 flex flex-col items-center">
            <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={userProfile.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-900/20" />
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800">
                    <Edit2 size={12} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload}/>
            </div>
            <div className="text-xs text-slate-400 mb-2">{t.changePhoto}</div>
            
            <div className="w-full max-w-xs text-center">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">{t.displayName}</label>
                <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="text-xl font-bold text-center w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-900 dark:text-white pb-1 transition"
                />
            </div>
        </div>

        <div className="space-y-3">
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                 
                 {/* Account Status */}
                 <button 
                    onClick={openBecomeBuilder}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700/50"
                 >
                     <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                             <UserCheck size={20} />
                         </div>
                         <div className="text-left">
                            <span className="block font-medium dark:text-white">{t.accountStatus}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {role === UserRole.BUILDER ? t.statusBuilder : t.statusBuyer}
                            </span>
                         </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                 </button>

                 {/* Identification Menu Item */}
                 <button 
                    onClick={openIdentification}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700/50"
                 >
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                             <ShieldCheck size={20} />
                         </div>
                         <div className="text-left">
                            <span className="block font-medium dark:text-white">{t.identification}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {verificationStatus === 'BASIC' ? t.idStatusBasic : verificationStatus === 'PENDING' ? t.idStatusPending : t.idStatusVerified}
                            </span>
                         </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                 </button>

                 {/* Managers Menu Item (Builder Only) */}
                 {role === UserRole.BUILDER && (
                    <button 
                        onClick={openManagers}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Users size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-medium dark:text-white">{t.managers}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{t.managers}</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                    </button>
                 )}

                 {/* Theme Toggle */}
                 <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700/50"
                 >
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
                             {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                         </div>
                         <div className="text-left">
                            <span className="block font-medium dark:text-white">{t.theme}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? t.darkMode : t.lightMode}</span>
                         </div>
                     </div>
                     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                         <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </div>
                 </button>

                 {/* Language Selector */}
                 <div className="border-b border-slate-100 dark:border-slate-700/50">
                    <button 
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Globe size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-medium dark:text-white">{t.language}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {userProfile.language === 'ru' ? 'Русский' : 'Тоҷикӣ'}
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={18} className={`text-slate-300 dark:text-slate-600 transition-transform ${showLanguageMenu ? 'rotate-90' : ''}`} />
                    </button>
                    {showLanguageMenu && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1">
                            {[
                                { code: 'ru', label: 'Русский' },
                                { code: 'tj', label: 'Тоҷикӣ' }
                            ].map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setUserProfile({ ...userProfile, language: lang.code as Language });
                                        setShowLanguageMenu(false);
                                    }}
                                    className={`w-full text-left px-12 py-3 rounded-lg text-sm font-medium transition ${userProfile.language === lang.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
                 
                 <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-slate-600 dark:text-slate-300">
                     <Settings size={20} />
                     <span>{t.settings}</span>
                 </button>
             </div>

             <button 
                onClick={goHome}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 font-medium hover:bg-red-100 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 transition mt-6"
             >
                 <LogOut size={20} /> {t.logout}
             </button>
        </div>
      </div>
    );
  };

  const renderBuildingCreator = () => (
      <div className="flex flex-col h-full dark:text-slate-100">
          {/* Step Indicator */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${creationStep === 1 ? 'bg-indigo-600 text-white' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                    {creationStep > 1 ? <Check size={16}/> : '1'}
                  </div>
                  <div className={`h-1 w-16 rounded ${creationStep === 2 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${creationStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    2
                  </div>
              </div>
              <div className="text-center mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {creationStep === 1 ? t.step1 : t.step2}
              </div>
          </div>

          <div className="flex-grow bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            {creationStep === 1 ? (
                <div className="p-4">
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mt-6">
                        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{t.createBuilding}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.bName}</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="e.g. Block A"
                                    value={newBuildingData.name}
                                    onChange={e => setNewBuildingData({...newBuildingData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.totalFloors}</label>
                                <input 
                                    type="number" 
                                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newBuildingData.totalFloors}
                                    onChange={e => setNewBuildingData({...newBuildingData, totalFloors: parseInt(e.target.value)})}
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.layoutReplication}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.fpImageUrl}</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newBuildingData.imageUrl}
                                    onChange={e => setNewBuildingData({...newBuildingData, imageUrl: e.target.value})}
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.fpImageDesc}</p>
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                    onClick={() => setCreationStep(2)}
                                    disabled={!newBuildingData.name || !newBuildingData.totalFloors}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {t.nextStep} <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col p-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-4 text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                        <Layers size={18} className="shrink-0" />
                        {t.drawDesc}
                    </div>
                    <div className="flex-grow border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 relative">
                         <FloorPlanEditor 
                             imageUrl={newBuildingData.imageUrl}
                             apartments={templateApartments}
                             onSave={(apts) => setTemplateApartments(apts)}
                             lang={userProfile.language}
                         />
                    </div>
                    <div className="mt-4 flex gap-4 pb-4 px-2">
                        <button 
                            onClick={() => setCreationStep(1)}
                            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            {t.back}
                        </button>
                        <button 
                            onClick={finishCreateBuilding}
                            className="flex-grow bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            {loading ? t.loading : t.createAction}
                        </button>
                    </div>
                </div>
            )}
          </div>
      </div>
  );

  const renderHeader = () => {
    // Hide header for immersive screens like Builder Profile or when viewing floor
    if (currentScreen === 'HOME' || currentScreen === 'BUYER_CHAT_ROOM' || currentScreen === 'BUYER_BUILDER_PROFILE' || currentScreen === 'MODERATOR_DASHBOARD') return null;
    
    // Custom transparent header logic for Project Detail could go here, 
    // but for simplicity we keep the standard one and Project Detail uses its own internal hero.
    if (currentScreen === 'BUYER_PROJECT_DETAIL' || currentScreen === 'BUILDER_PROJECT_DETAIL') {
         // Return a simplified back button overlay? 
         // For now, let's keep the standard header but maybe make it transparent if we scrolled top? 
         // To stay safe and consistent, we'll use the standard header but set title to null so it doesn't duplicate the hero title.
         // Actually, let's just HIDE the standard header for Project Detail and let the renderProjectDetail handle its own back button if needed.
         // But the `renderProjectDetail` needs a back button. Let's add it there.
         return (
             <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentScreen(role === UserRole.BUILDER ? 'BUILDER_DASHBOARD' : 'BUYER_PROJECT_LIST')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <h1 className="font-bold text-slate-800 dark:text-white text-lg truncate max-w-[200px]">
                        {selectedProject?.name}
                    </h1>
                </div>
             </header>
         );
    }

    let title = '';
    if (currentScreen === 'BUILDER_DASHBOARD' || currentScreen === 'BUYER_PROJECT_LIST') title = t.appName;
    else if (currentScreen === 'BUYER_CHAT_LIST') title = t.navChats;
    else if (currentScreen === 'BUYER_MY_HOME') title = t.navMyHome;
    else if (currentScreen === 'BUILDER_MY_PROJECTS') title = t.navMyProjects;
    else if (currentScreen === 'BUYER_PROFILE') title = t.navProfile;
    else if (currentScreen === 'BUYER_ID_VERIFICATION') title = t.idPageTitle;
    else if (currentScreen === 'BUYER_BECOME_BUILDER') title = t.becomeBuilder;
    else if (currentScreen === 'BUILDER_MANAGERS') title = t.managers;
    else if (currentScreen === 'BUILDER_BUILDING_CREATE') title = t.createBuilding;
    else if (currentScreen === 'BUILDER_PROJECT_CREATE') title = t.createProject;
    else if (currentScreen.includes('FLOOR')) title = `${t.level} ${selectedFloorLevel}`;
    else if (currentScreen.includes('BUILDING_DETAIL')) title = selectedBuilding?.name || '';

    return (
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm dark:shadow-slate-900/50">
            <div className="flex items-center gap-3">
                {currentScreen !== 'BUILDER_DASHBOARD' && currentScreen !== 'BUYER_PROJECT_LIST' && currentScreen !== 'BUYER_CHAT_LIST' && currentScreen !== 'BUYER_MY_HOME' && currentScreen !== 'BUILDER_MY_PROJECTS' && currentScreen !== 'BUYER_PROFILE' && (
                    <button onClick={() => {
                        if (currentScreen === 'BUILDER_BUILDING_CREATE') {
                             if (creationStep === 2) setCreationStep(1);
                             else setCurrentScreen('BUILDER_PROJECT_DETAIL');
                        } else if (currentScreen === 'BUYER_ID_VERIFICATION' || currentScreen === 'BUYER_BECOME_BUILDER' || currentScreen === 'BUILDER_MANAGERS') {
                             setCurrentScreen('BUYER_PROFILE');
                        } else if (currentScreen === 'BUILDER_PROJECT_CREATE') {
                             setCurrentScreen('BUILDER_MY_PROJECTS');
                        } else if (currentScreen.includes('FLOOR')) {
                            setCurrentScreen(role === UserRole.BUILDER ? 'BUILDER_BUILDING_DETAIL' : 'BUYER_BUILDING_DETAIL');
                        } else if (currentScreen.includes('BUILDING_DETAIL')) {
                            setCurrentScreen(role === UserRole.BUILDER ? 'BUILDER_PROJECT_DETAIL' : 'BUYER_PROJECT_DETAIL');
                        } else {
                            setCurrentScreen(role === UserRole.BUILDER ? 'BUILDER_DASHBOARD' : 'BUYER_PROJECT_LIST');
                        }
                    }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                )}
                <h1 className="font-bold text-slate-800 dark:text-white text-lg truncate max-w-[200px]">
                    {title}
                </h1>
            </div>
        </header>
    );
  };
  
  // Custom Header for Builder Profile to allow going back
  const renderBuilderProfileHeader = () => (
       <div className="fixed top-4 left-4 z-40">
           <button 
                onClick={() => setCurrentScreen('BUYER_PROJECT_DETAIL')}
                className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full text-white shadow-lg transition"
           >
                <ArrowLeft size={24} />
           </button>
       </div>
  );
  
  // Lightbox Modal
  const renderLightbox = () => {
      if (!showLightbox || !selectedProject) return null;
      const images = selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images : [selectedProject.thumbnailUrl];
      
      return (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-in fade-in duration-300">
              <button 
                  onClick={() => setShowLightbox(false)}
                  className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-50"
              >
                  <X size={24} />
              </button>
              
              <div className="relative w-full h-full flex items-center justify-center">
                   {images.length > 1 && (
                       <button 
                           onClick={prevImage}
                           className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-40"
                       >
                           <ChevronLeft size={32} />
                       </button>
                   )}
                   
                   <img 
                      src={images[currentImageIndex]} 
                      alt="Full View" 
                      className="max-w-full max-h-full object-contain pointer-events-none sm:pointer-events-auto"
                   />
                   
                   {images.length > 1 && (
                       <button 
                           onClick={nextImage}
                           className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-40"
                       >
                           <ChevronRight size={32} />
                       </button>
                   )}
                   
                   <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                       {currentImageIndex + 1} / {images.length}
                   </div>
              </div>
          </div>
      );
  };

  // --- Main Render ---

  if (currentScreen === 'HOME') return renderHome();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {renderHeader()}
      {currentScreen === 'BUYER_BUILDER_PROFILE' && renderBuilderProfileHeader()}
      {renderLightbox()}
      
      <main className="flex-grow flex flex-col h-[calc(100vh-60px)]">
        {(currentScreen === 'BUILDER_DASHBOARD' || currentScreen === 'BUYER_PROJECT_LIST') && renderProjectList()}
        
        {/* Use the new enhanced Project Detail view */}
        {(currentScreen === 'BUILDER_PROJECT_DETAIL' || currentScreen === 'BUYER_PROJECT_DETAIL') && renderProjectDetail()}
        
        {(currentScreen === 'BUILDER_BUILDING_DETAIL' || currentScreen === 'BUYER_BUILDING_DETAIL') && renderFloorList()}
        
        {currentScreen === 'BUILDER_BUILDING_CREATE' && renderBuildingCreator()}

        {currentScreen === 'BUYER_CHAT_LIST' && renderChatList()}

        {currentScreen === 'BUYER_MY_HOME' && renderMyHome()}
        
        {currentScreen === 'BUILDER_MY_PROJECTS' && renderMyCreatedProjects()}

        {currentScreen === 'BUYER_PROFILE' && renderProfile()}
        
        {currentScreen === 'BUYER_BUILDER_PROFILE' && renderBuilderProfile()}
        
        {currentScreen === 'MODERATOR_DASHBOARD' && renderModeratorDashboard()}

        {currentScreen === 'BUILDER_MANAGERS' && (
            <ManagerManagementScreen 
                t={t} 
                builderId={currentUserId} 
                onBack={() => setCurrentScreen('BUYER_PROFILE')}
            />
        )}
        
        {/* Render Extracted IdentificationScreen Component */}
        {currentScreen === 'BUYER_ID_VERIFICATION' && (
            <IdentificationScreen 
                t={t}
                userId={currentUserId}
                verificationStatus={verificationStatus}
                setVerificationStatus={setVerificationStatus}
                idFront={idFront}
                setIdFront={setIdFront}
                idBack={idBack}
                setIdBack={setIdBack}
                onBack={() => setCurrentScreen('BUYER_PROFILE')}
            />
        )}
        
        {/* Render Extracted BecomeBuilderScreen Component */}
        {currentScreen === 'BUYER_BECOME_BUILDER' && (
            <BecomeBuilderScreen 
                t={t}
                userId={currentUserId}
                onBack={() => setCurrentScreen('BUYER_PROFILE')}
                appStatus={builderAppStatus}
                setAppStatus={setBuilderAppStatus}
            />
        )}

        {/* Render Extracted ProjectCreationScreen Component */}
        {currentScreen === 'BUILDER_PROJECT_CREATE' && (
            <ProjectCreationScreen
                t={t}
                userId={currentUserId}
                onBack={() => setCurrentScreen('BUILDER_MY_PROJECTS')}
                onCreated={() => {
                    loadMyCreatedProjects();
                    setCurrentScreen('BUILDER_MY_PROJECTS');
                }}
            />
        )}

        {currentScreen === 'BUYER_CHAT_ROOM' && activeChatSession && (
            <ChatRoom 
                chatId={activeChatSession.id}
                chatName={activeChatSession.name}
                userId={currentUserId}
                isOwner={isProjectMember} // This controls permission for community chats
                isSupportChat={activeChatSession.type === 'SUPPORT'} // This allows write access for support chats
                onClose={() => setCurrentScreen('BUYER_CHAT_LIST')}
                lang={userProfile.language}
            />
        )}

        {currentScreen === 'BUILDER_FLOOR_EDIT' && currentFloorPlan && (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                <input 
                    type="file" 
                    ref={floorImageInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                const newImage = reader.result as string;
                                const updated = { ...currentFloorPlan, imageUrl: newImage };
                                await api.saveFloorPlan(updated);
                                setCurrentFloorPlan(updated);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />

                {/* Builder Toolbar */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10 shrink-0">
                    <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                         <Edit2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                         <span>{t.level} {currentFloorPlan.floorLevel}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => floorImageInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition text-slate-700 dark:text-slate-200"
                        >
                            <ImageIcon size={16} /> {t.changeImage}
                        </button>
                        <button 
                            onClick={async () => {
                                if (window.confirm(t.confirmDeleteFloor)) {
                                    await api.deleteFloorPlan(currentFloorPlan.id);
                                    alert(t.floorDeleted);
                                    setCurrentScreen('BUILDER_BUILDING_DETAIL');
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition text-red-600 dark:text-red-400"
                        >
                            <Trash2 size={16} /> {t.deleteFloor}
                        </button>
                    </div>
                </div>

                {/* Editor Area (Fixed Height or Scaled) */}
                <div className="shrink-0 border-b border-slate-200 dark:border-slate-700 h-[60vh] bg-slate-100 dark:bg-slate-900">
                    <FloorPlanEditor 
                        imageUrl={currentFloorPlan.imageUrl}
                        apartments={currentFloorPlan.apartments}
                        onSave={async (apts) => {
                            if (!currentFloorPlan) return;
                            const updated = { ...currentFloorPlan, apartments: apts };
                            await api.saveFloorPlan(updated);
                            setCurrentFloorPlan(updated); 
                        }}
                        lang={userProfile.language}
                    />
                </div>

                {/* Apartment List */}
                <div className="p-4 sm:p-6 pb-24">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                         <List size={20} className="text-indigo-600 dark:text-indigo-400" />
                         {t.apartmentList}
                     </h3>
                     
                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                         {currentFloorPlan.apartments.length === 0 ? (
                             <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                 No apartments added yet. Use the tool above to draw them.
                             </div>
                         ) : (
                             <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse">
                                     <thead>
                                         <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                             <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.unitNum}</th>
                                             <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.rooms}</th>
                                             <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.area}</th>
                                             <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.price}</th>
                                             <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                         {currentFloorPlan.apartments.map(apt => (
                                             <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                                 <td className="p-3 font-medium text-slate-900 dark:text-white">{apt.unitNumber}</td>
                                                 <td className="p-3 text-slate-600 dark:text-slate-300">{apt.rooms}</td>
                                                 <td className="p-3 text-slate-600 dark:text-slate-300">{apt.areaSqFt}</td>
                                                 <td className="p-3 text-slate-600 dark:text-slate-300">${apt.price.toLocaleString()}</td>
                                                 <td className="p-3">
                                                     <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                                        apt.status === ApartmentStatus.AVAILABLE ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        apt.status === ApartmentStatus.SOLD ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                                                        apt.status === ApartmentStatus.RESERVED ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                     }`}>
                                                         {apt.status}
                                                     </span>
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        )}

        {(currentScreen === 'BUYER_FLOOR_VIEW') && currentFloorPlan && (
            <InteractiveFloorPlan 
                imageUrl={currentFloorPlan.imageUrl}
                apartments={currentFloorPlan.apartments}
                role={role}
                onContact={contactBuilder}
                onReserve={async (id, proofImage) => {
                   if (!currentFloorPlan) return;
                   
                   // Check verification status before allowing reservation
                   if (verificationStatus !== 'VERIFIED') {
                       if (window.confirm(t.needVerificationAlert)) {
                           setCurrentScreen('BUYER_ID_VERIFICATION');
                       }
                       return;
                   }

                   // Optimistic update
                   const updatedApts = currentFloorPlan.apartments.map(a => a.id === id ? { ...a, status: ApartmentStatus.PENDING, ownerId: currentUserId, proofImageUrl: proofImage } : a);
                   setCurrentFloorPlan({ ...currentFloorPlan, apartments: updatedApts });
                   
                   // API call
                   await api.updateApartmentStatus(currentFloorPlan.id, id, ApartmentStatus.PENDING, currentUserId, proofImage);
                   
                   alert(t.requestSentDesc);
                }}
                onStatusUpdate={async (id, status) => {
                    if (!currentFloorPlan) return;
                    const updatedApts = currentFloorPlan.apartments.map(a => a.id === id ? { ...a, status: status } : a);
                    setCurrentFloorPlan({ ...currentFloorPlan, apartments: updatedApts });
                    await api.updateApartmentStatus(currentFloorPlan.id, id, status);
                }}
                lang={userProfile.language}
            />
        )}
      </main>

      {/* Tab Bar for Buyer AND Builder */}
      {(role === UserRole.BUYER || role === UserRole.BUILDER) && !currentScreen.includes('FLOOR') && !currentScreen.includes('CHAT_ROOM') && !currentScreen.includes('ID_VERIFICATION') && !currentScreen.includes('BECOME_BUILDER') && !currentScreen.includes('BUILDER_PROFILE') && !currentScreen.includes('BUILDER_MANAGERS') && !currentScreen.includes('PROJECT_CREATE') && (
        <div className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 pb-safe z-30 transition-colors">
            <button 
                onClick={() => setCurrentScreen(role === UserRole.BUILDER ? 'BUILDER_DASHBOARD' : 'BUYER_PROJECT_LIST')}
                className={`flex flex-col items-center gap-1 ${(currentScreen === 'BUYER_PROJECT_LIST' || currentScreen === 'BUILDER_DASHBOARD' || currentScreen.includes('PROJECT')) && currentScreen !== 'BUILDER_MY_PROJECTS' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <Map size={24} />
                <span className="text-[10px] font-bold">{t.navProjects}</span>
            </button>
            
            {role === UserRole.BUYER ? (
                <button 
                    onClick={openMyHome}
                    className={`flex flex-col items-center gap-1 ${currentScreen === 'BUYER_MY_HOME' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <Home size={24} />
                    <span className="text-[10px] font-bold">{t.navMyHome}</span>
                </button>
            ) : (
                <button 
                    onClick={openMyProjects}
                    className={`flex flex-col items-center gap-1 ${currentScreen === 'BUILDER_MY_PROJECTS' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <BuildingIcon size={24} />
                    <span className="text-[10px] font-bold">{t.navMyProjects}</span>
                </button>
            )}

            <button 
                onClick={openChatList}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'BUYER_CHAT_LIST' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <MessageCircle size={24} />
                <span className="text-[10px] font-bold">{t.navChats}</span>
            </button>
            <button 
                onClick={openProfile}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'BUYER_PROFILE' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <User size={24} />
                <span className="text-[10px] font-bold">{t.navProfile}</span>
            </button>
        </div>
      )}
    </div>
  );
}
