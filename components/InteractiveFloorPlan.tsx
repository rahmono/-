
import React, { useState, useRef } from 'react';
import { Apartment, ApartmentStatus, UserRole, Point } from '../types';
import { Lock, MessageCircle, Upload, FileText, CheckCircle, XCircle, List } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/i18n';

interface InteractiveFloorPlanProps {
  imageUrl: string;
  apartments: Apartment[];
  onReserve: (apartmentId: string, proofImage?: string) => void; // Modified to accept proof
  onStatusUpdate?: (apartmentId: string, status: ApartmentStatus) => void; // For builder
  onContact: () => void;
  lang: Language;
  role?: UserRole | null;
}

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({ imageUrl, apartments, onReserve, onStatusUpdate, onContact, lang, role }) => {
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  const pointsToString = (points: any[]) => points.map(p => `${p.x},${p.y}`).join(' ');

  // Helper to find center of polygon for text placement
  const getPolygonCenter = (points: Point[]): Point => {
    if (points.length === 0) return { x: 0, y: 0 };
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  };

  const getStatusColor = (status: ApartmentStatus) => {
    switch (status) {
      case ApartmentStatus.AVAILABLE: return 'rgba(34, 197, 94, 0.4)'; // Green
      case ApartmentStatus.RESERVED: return 'rgba(234, 179, 8, 0.4)'; // Yellow
      case ApartmentStatus.SOLD: return 'rgba(100, 116, 139, 0.6)'; // Grey
      case ApartmentStatus.PENDING: return 'rgba(249, 115, 22, 0.4)'; // Orange
      default: return 'rgba(0,0,0,0.1)';
    }
  };

  const getStrokeColor = (status: ApartmentStatus) => {
    switch (status) {
      case ApartmentStatus.AVAILABLE: return '#16a34a';
      case ApartmentStatus.RESERVED: return '#ca8a04';
      case ApartmentStatus.SOLD: return '#475569';
      case ApartmentStatus.PENDING: return '#ea580c';
      default: return '#000';
    }
  };

  const getStatusText = (status: ApartmentStatus) => {
      switch (status) {
          case ApartmentStatus.AVAILABLE: return t.available;
          case ApartmentStatus.RESERVED: return t.reserved;
          case ApartmentStatus.SOLD: return t.sold;
          case ApartmentStatus.PENDING: return t.pending;
          default: return status;
      }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitClaim = () => {
      if (selectedApt && proofImage) {
          onReserve(selectedApt.id, proofImage);
          setShowUploadModal(false);
          setProofImage(null);
          setSelectedApt(null);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 relative">
      {/* Legend */}
      <div className="flex gap-4 justify-center p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs font-medium dark:text-slate-300">{t.available}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs font-medium dark:text-slate-300">{t.reserved}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-xs font-medium dark:text-slate-300">{t.pending}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-500"></div><span className="text-xs font-medium dark:text-slate-300">{t.sold}</span></div>
      </div>

      <div className="flex-grow overflow-auto p-2 pb-20">
        <div className="relative w-full shadow-sm bg-white dark:bg-slate-900 mb-6">
          <img 
            src={imageUrl} 
            alt="Floor Plan" 
            className="w-full h-auto block pointer-events-none select-none"
            style={{ display: 'block' }}
          />
          <svg 
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {apartments.map(apt => {
              const center = getPolygonCenter(apt.shape);
              return (
                <g key={apt.id} onClick={() => setSelectedApt(apt)} className="cursor-pointer group">
                  <polygon
                    points={pointsToString(apt.shape)}
                    fill={getStatusColor(apt.status)}
                    stroke={getStrokeColor(apt.status)}
                    strokeWidth="0.3"
                    className={`transition-all duration-300 ${apt.status === ApartmentStatus.AVAILABLE ? 'hover:fill-green-400/60' : ''}`}
                  />
                  
                  {/* Unit Number Label */}
                  <text
                    x={center.x}
                    y={apt.status !== ApartmentStatus.AVAILABLE ? center.y - 3 : center.y} // Shift up slightly if lock icon is present
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3"
                    fill="white"
                    stroke="black"
                    strokeWidth="0.1"
                    fontWeight="bold"
                    pointerEvents="none"
                    style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.8)' }}
                  >
                    {apt.unitNumber}
                  </text>

                  {/* Center Icon for Sold/Reserved */}
                  {apt.status !== ApartmentStatus.AVAILABLE && (
                    <foreignObject 
                      x={center.x - 2} 
                      y={center.y - 1} 
                      width="4" 
                      height="4"
                      pointerEvents="none"
                    >
                      <div className="w-full h-full flex items-center justify-center text-slate-700 dark:text-slate-900 opacity-70">
                        <Lock size={10} strokeWidth={3} />
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Apartment List Table for Buyers */}
        <div className="max-w-4xl mx-auto px-1">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                 <List size={20} className="text-indigo-600 dark:text-indigo-400" />
                 {t.apartmentList}
             </h3>
             
             <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                 {apartments.length === 0 ? (
                     <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                         {t.noProperties}
                     </div>
                 ) : (
                     <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                     <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.unitNum}</th>
                                     <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.rooms}</th>
                                     <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.area}</th>
                                     <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.price}</th>
                                     <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                 {apartments.map(apt => (
                                     <tr 
                                      key={apt.id} 
                                      onClick={() => setSelectedApt(apt)}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                                     >
                                         <td className="p-3 font-medium text-slate-900 dark:text-white">{apt.unitNumber}</td>
                                         <td className="p-3 text-slate-600 dark:text-slate-300">{apt.rooms}</td>
                                         <td className="p-3 text-slate-600 dark:text-slate-300">{apt.areaSqFt}</td>
                                         <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{formatPrice(apt.price)}</td>
                                         <td className="p-3">
                                             <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                apt.status === ApartmentStatus.AVAILABLE ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                apt.status === ApartmentStatus.SOLD ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                                                apt.status === ApartmentStatus.RESERVED ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                             }`}>
                                                 {getStatusText(apt.status)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 animate-in slide-in-from-bottom duration-300">
                 <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t.uploadCertificate}</h3>
                 <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.uploadDesc}</p>
                 
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition mb-6"
                 >
                     {proofImage ? (
                         <div className="relative w-full h-48">
                             <img src={proofImage} className="w-full h-full object-contain rounded-lg" alt="Proof" />
                             <button onClick={(e) => { e.stopPropagation(); setProofImage(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><XCircle size={20}/></button>
                         </div>
                     ) : (
                         <>
                             <Upload size={32} className="text-indigo-500 mb-2"/>
                             <span className="text-slate-600 dark:text-slate-300 font-medium">{t.changePhoto}</span>
                         </>
                     )}
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </div>

                 <div className="flex gap-3">
                     <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium">{t.cancel}</button>
                     <button 
                        onClick={submitClaim} 
                        disabled={!proofImage}
                        className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                         {t.submitRequest}
                     </button>
                 </div>
             </div>
        </div>
      )}

      {/* Selected Apartment Sheet */}
      {selectedApt && !showUploadModal && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-2xl p-6 z-20 animate-in slide-in-from-bottom duration-300 border-t border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.unit} {selectedApt.unitNumber}</h3>
               <p className="text-slate-500 dark:text-slate-400">{selectedApt.rooms} {t.rooms} • {selectedApt.areaSqFt} sq ft</p>
             </div>
             <button onClick={() => setSelectedApt(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white transition">
               <XCircle size={24} />
             </button>
           </div>
           
           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.price}</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(selectedApt.price)}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                selectedApt.status === ApartmentStatus.AVAILABLE ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                selectedApt.status === ApartmentStatus.RESERVED ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                selectedApt.status === ApartmentStatus.PENDING ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {getStatusText(selectedApt.status)}
              </div>
           </div>

           {/* Builder Admin Actions */}
           {role === UserRole.BUILDER && selectedApt.status === ApartmentStatus.PENDING && (
               <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 mb-4">
                   <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">{t.pending}</h4>
                   {selectedApt.proofImageUrl && (
                       <div className="mb-4">
                           <p className="text-xs text-orange-600 dark:text-orange-300 mb-1">{t.viewProof}</p>
                           <img src={selectedApt.proofImageUrl} alt="Proof" className="h-32 rounded border border-orange-200 dark:border-orange-800 object-cover" />
                       </div>
                   )}
                   <div className="flex gap-3">
                       <button 
                         onClick={() => onStatusUpdate && onStatusUpdate(selectedApt.id, ApartmentStatus.SOLD)}
                         className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                       >
                           <CheckCircle size={16} /> {t.approve}
                       </button>
                       <button 
                         onClick={() => onStatusUpdate && onStatusUpdate(selectedApt.id, ApartmentStatus.AVAILABLE)}
                         className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-700"
                       >
                           <XCircle size={16} /> {t.reject}
                       </button>
                   </div>
               </div>
           )}

           <div className="flex gap-3">
               {/* Contact Builder Button */}
               <button 
                onClick={onContact}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-bold py-4 rounded-xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
               >
                 <MessageCircle size={20} />
                 {t.contactBuilder}
               </button>

               {/* Claim / Reserve Button */}
               {selectedApt.status === ApartmentStatus.AVAILABLE ? (
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                    <CheckCircle size={20} />
                    {t.thisIsMyHome}
                    </button>
                ) : (
                    <button disabled className="flex-[2] bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold py-4 rounded-xl cursor-not-allowed">
                    {t.notAvailable}
                    </button>
                )}
           </div>
        </div>
      )}
    </div>
  );
};
