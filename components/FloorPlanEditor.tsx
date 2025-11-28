import React, { useState, useRef } from 'react';
import { Point, Apartment, ApartmentStatus } from '../types';
import { Trash2, Check, Plus, X } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/i18n';

interface FloorPlanEditorProps {
  imageUrl: string;
  apartments: Apartment[];
  onSave: (apartments: Apartment[]) => void;
  lang: Language;
}

export const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({ imageUrl, apartments: initialApartments, onSave, lang }) => {
  const [apartments, setApartments] = useState<Apartment[]>(initialApartments);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang];

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ unitNumber: '', rooms: 1, areaSqFt: 500, price: 100000 });

  const svgRef = useRef<SVGSVGElement>(null);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const point = getCoordinates(e);
    setCurrentPoints([...currentPoints, point]);
  };

  const handleFinishShape = () => {
    if (currentPoints.length < 3) return;
    setIsDrawing(false);
    setShowForm(true);
  };

  const saveNewApartment = () => {
    const newApt: Apartment = {
      id: Math.random().toString(36).substr(2, 9),
      floorPlanId: '',
      unitNumber: formData.unitNumber,
      rooms: formData.rooms,
      areaSqFt: formData.areaSqFt,
      price: formData.price,
      status: ApartmentStatus.AVAILABLE,
      shape: currentPoints
    };
    const newApartments = [...apartments, newApt];
    setApartments(newApartments);
    onSave(newApartments);
    setCurrentPoints([]);
    setShowForm(false);
    setFormData({ unitNumber: '', rooms: 1, areaSqFt: 500, price: 100000 });
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
    setShowForm(false);
  };

  const deleteApartment = (id: string) => {
    const newApartments = apartments.filter(a => a.id !== id);
    setApartments(newApartments);
    onSave(newApartments);
    setSelectedApartmentId(null);
  };

  const pointsToString = (points: Point[]) => points.map(p => `${p.x},${p.y}`).join(' ');

  const getPolygonCenter = (points: Point[]): Point => {
    if (points.length === 0) return { x: 0, y: 0 };
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 shadow-sm z-10 sticky top-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          {!isDrawing && !showForm && (
            <button 
              onClick={() => setIsDrawing(true)}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
            >
              <Plus size={16} /> {t.drawApt}
            </button>
          )}
          {isDrawing && (
            <div className="flex gap-2">
              <button 
                onClick={handleFinishShape}
                disabled={currentPoints.length < 3}
                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition text-sm"
              >
                <Check size={16} /> {t.finish}
              </button>
              <button 
                onClick={cancelDrawing}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm"
              >
                <X size={16} /> {t.cancel}
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          {isDrawing ? t.tapPoints : t.selectArea}
        </div>
      </div>

      <div className="flex-grow overflow-auto p-4 bg-slate-100 dark:bg-black">
        <div className="relative w-full shadow-sm bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
          <img 
            src={imageUrl} 
            alt="Floor Plan" 
            className="w-full h-auto block pointer-events-none select-none"
            style={{ display: 'block' }}
          />
          
          <svg 
            ref={svgRef}
            className={`absolute top-0 left-0 w-full h-full ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onClick={handleSvgClick}
          >
            {apartments.map(apt => {
              const center = getPolygonCenter(apt.shape);
              return (
                <g key={apt.id}>
                  <polygon
                    points={pointsToString(apt.shape)}
                    fill={selectedApartmentId === apt.id ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.3)'}
                    stroke="#1e293b"
                    strokeWidth="0.3"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDrawing) setSelectedApartmentId(apt.id);
                    }}
                    className="hover:fill-slate-600/50 transition-colors"
                  />
                  <text
                    x={center.x}
                    y={center.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3"
                    fill="white"
                    stroke="black"
                    strokeWidth="0.05"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {apt.unitNumber}
                  </text>
                </g>
              );
            })}

            {currentPoints.length > 0 && (
              <>
                <polyline
                  points={pointsToString(currentPoints)}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="0.5"
                  strokeDasharray="1 1"
                />
                {currentPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1" fill="#ef4444" />
                ))}
              </>
            )}
          </svg>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{t.aptDetails}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.unitNum}</label>
                <input 
                  type="text" 
                  value={formData.unitNumber}
                  onChange={e => setFormData({...formData, unitNumber: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-black dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition text-sm"
                  placeholder="e.g. 01"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.rooms}</label>
                  <input 
                    type="number" 
                    value={formData.rooms}
                    onChange={e => setFormData({...formData, rooms: parseInt(e.target.value)})}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-black dark:text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.area}</label>
                  <input 
                    type="number" 
                    value={formData.areaSqFt}
                    onChange={e => setFormData({...formData, areaSqFt: parseInt(e.target.value)})}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-black dark:text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.price} ($)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-black dark:text-white rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveNewApartment} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-black py-2.5 rounded-lg font-semibold hover:opacity-90 transition text-sm">{t.saveApt}</button>
              <button onClick={cancelDrawing} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm">{t.discard}</button>
            </div>
          </div>
        </div>
      )}

      {selectedApartmentId && !isDrawing && !showForm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-6 py-4 rounded-full shadow-xl flex items-center gap-6 z-40 border border-slate-200 dark:border-slate-800">
           <div>
             <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{t.selectedUnit}</div>
             <div className="font-bold text-lg text-slate-900 dark:text-white leading-none">
               {apartments.find(a => a.id === selectedApartmentId)?.unitNumber}
             </div>
           </div>
           <button 
             onClick={() => deleteApartment(selectedApartmentId)}
             className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition"
           >
             <Trash2 size={20} />
           </button>
           <button 
             onClick={() => setSelectedApartmentId(null)}
             className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition"
           >
             <X size={20} />
           </button>
        </div>
      )}
    </div>
  );
};