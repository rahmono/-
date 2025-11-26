
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

  // Convert mouse/touch event to percentage coordinates (0-100)
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
      floorPlanId: '', // Assigned by parent
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

  // Helper to find center of polygon for text placement
  const getPolygonCenter = (points: Point[]): Point => {
    if (points.length === 0) return { x: 0, y: 0 };
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 shadow-sm z-10 sticky top-0 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          {!isDrawing && !showForm && (
            <button 
              onClick={() => setIsDrawing(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition"
            >
              <Plus size={18} /> {t.drawApt}
            </button>
          )}
          {isDrawing && (
            <div className="flex gap-2">
              <button 
                onClick={handleFinishShape}
                disabled={currentPoints.length < 3}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                <Check size={18} /> {t.finish}
              </button>
              <button 
                onClick={cancelDrawing}
                className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                <X size={18} /> {t.cancel}
              </button>
            </div>
          )}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          {isDrawing ? t.tapPoints : t.selectArea}
        </div>
      </div>

      {/* Editor Canvas - Scrollable Area */}
      <div className="flex-grow overflow-auto p-2 sm:p-4">
        {/* Container that hugs the image size naturally */}
        <div className="relative w-full shadow-lg bg-white dark:bg-slate-800">
          <img 
            src={imageUrl} 
            alt="Floor Plan" 
            className="w-full h-auto block pointer-events-none select-none"
            style={{ display: 'block' }}
          />
          
          {/* SVG Overlay matches image dimensions exactly via absolute positioning on the relative wrapper */}
          <svg 
            ref={svgRef}
            className={`absolute top-0 left-0 w-full h-full ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onClick={handleSvgClick}
          >
            {/* Existing Apartments */}
            {apartments.map(apt => {
              const center = getPolygonCenter(apt.shape);
              return (
                <g key={apt.id}>
                  <polygon
                    points={pointsToString(apt.shape)}
                    fill={selectedApartmentId === apt.id ? 'rgba(79, 70, 229, 0.5)' : 'rgba(79, 70, 229, 0.2)'}
                    stroke="#4338ca"
                    strokeWidth="0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDrawing) setSelectedApartmentId(apt.id);
                    }}
                    className="hover:fill-indigo-400/50 transition-colors"
                  />
                  {/* Unit Number Label */}
                  <text
                    x={center.x}
                    y={center.y}
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
                </g>
              );
            })}

            {/* Current Drawing Line */}
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

      {/* Apartment Details Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{t.aptDetails}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.unitNum}</label>
                <input 
                  type="text" 
                  value={formData.unitNumber}
                  onChange={e => setFormData({...formData, unitNumber: e.target.value})}
                  className="mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 01"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.rooms}</label>
                  <input 
                    type="number" 
                    value={formData.rooms}
                    onChange={e => setFormData({...formData, rooms: parseInt(e.target.value)})}
                    className="mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.area}</label>
                  <input 
                    type="number" 
                    value={formData.areaSqFt}
                    onChange={e => setFormData({...formData, areaSqFt: parseInt(e.target.value)})}
                    className="mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.price} ($)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                  className="mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveNewApartment} className="flex-1 bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">{t.saveApt}</button>
              <button onClick={cancelDrawing} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-md font-medium hover:bg-slate-300 dark:hover:bg-slate-600">{t.discard}</button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Apartment Actions */}
      {selectedApartmentId && !isDrawing && !showForm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-xl flex items-center gap-6 z-40 border border-slate-100 dark:border-slate-700">
           <div>
             <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.selectedUnit}</div>
             <div className="font-bold text-lg text-slate-900 dark:text-white">
               {apartments.find(a => a.id === selectedApartmentId)?.unitNumber}
             </div>
           </div>
           <button 
             onClick={() => deleteApartment(selectedApartmentId)}
             className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition"
           >
             <Trash2 size={24} />
           </button>
           <button 
             onClick={() => setSelectedApartmentId(null)}
             className="text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-full"
           >
             <X size={24} />
           </button>
        </div>
      )}
    </div>
  );
};
