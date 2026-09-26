import React, { useState } from 'react';
import { CanineKennelBay, DogProfile } from '../../types';
import { Home, Shield, AlertTriangle, CheckCircle2, User, Printer, Plus, Edit2, Sparkles, RefreshCw } from 'lucide-react';
import { generateKennelPlacardPdf } from './KennelPlacardGenerator';
import { toIsoDate } from '../../utils/dateHelper';

interface KennelBaysMapProps {
  dogs: DogProfile[];
  onUpdateDogKennel?: (dogId: string, kennelNo: string) => void;
}

const DEFAULT_BAYS: CanineKennelBay[] = [
  {
    id: 'bay-a1',
    name: 'Kennel A-01',
    block: 'Block A (Patrol)',
    status: 'Occupied',
    currentDogName: 'Major',
    lastSanitizedDate: '2024-09-24',
    dimensions: '4m × 3m with Outdoor Run',
    notes: 'Reinforced dual-latch door, shaded resting shelf'
  },
  {
    id: 'bay-a2',
    name: 'Kennel A-02',
    block: 'Block A (Patrol)',
    status: 'Occupied',
    currentDogName: 'Shadow',
    lastSanitizedDate: '2024-09-24',
    dimensions: '4m × 3m with Outdoor Run',
    notes: 'Tactical gate sentry bay, quick-release mechanism'
  },
  {
    id: 'bay-a3',
    name: 'Kennel A-03',
    block: 'Block A (Patrol)',
    status: 'Vacant & Clean',
    lastSanitizedDate: '2024-09-25',
    dimensions: '4m × 3m with Outdoor Run',
    notes: 'Power-washed with Virkon-S, dry fresh cedar bedding'
  },
  {
    id: 'bay-a4',
    name: 'Kennel A-04',
    block: 'Block A (Patrol)',
    status: 'Vacant & Clean',
    lastSanitizedDate: '2024-09-23',
    dimensions: '4m × 3m with Outdoor Run',
    notes: 'Available for visiting security dogs or rotation'
  },
  {
    id: 'bay-b1',
    name: 'Kennel B-01',
    block: 'Block B (Heavy Guard)',
    status: 'Occupied',
    currentDogName: 'Rex',
    lastSanitizedDate: '2024-09-24',
    dimensions: '5m × 3.5m Heavy Duty',
    notes: 'Double galvanized steel mesh for high-weight working dog'
  },
  {
    id: 'bay-b2',
    name: 'Kennel B-02',
    block: 'Block B (Heavy Guard)',
    status: 'Occupied',
    currentDogName: 'Simba',
    lastSanitizedDate: '2024-09-23',
    dimensions: '5m × 3.5m Heavy Duty',
    notes: 'Direct proximity to dairy barn perimeter'
  },
  {
    id: 'bay-m1',
    name: 'Maternity M-01',
    block: 'Maternity Bay',
    status: 'Occupied',
    currentDogName: 'Bella',
    lastSanitizedDate: '2024-09-23',
    dimensions: '6m × 4m Temperature Controlled',
    notes: 'Equipped with infrared heat lamp, draft-free whelping box'
  },
  {
    id: 'bay-q1',
    name: 'Quarantine Q-01',
    block: 'Quarantine Unit',
    status: 'Vacant & Clean',
    lastSanitizedDate: '2024-09-20',
    dimensions: '4m × 3m Isolated Run',
    notes: 'Footbath biosecurity station at entrance, isolated drainage'
  }
];

export function KennelBaysMap({ dogs, onUpdateDogKennel }: KennelBaysMapProps) {
  const [bays, setBays] = useState<CanineKennelBay[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_kennel_bays');
      return stored ? JSON.parse(stored) : DEFAULT_BAYS;
    } catch {
      return DEFAULT_BAYS;
    }
  });

  const [selectedBay, setSelectedBay] = useState<CanineKennelBay | null>(null);
  const [selectedDogIdToAssign, setSelectedDogIdToAssign] = useState<string>('');

  const saveBays = (newBays: CanineKennelBay[]) => {
    setBays(newBays);
    localStorage.setItem('jr_farm_kennel_bays', JSON.stringify(newBays));
  };

  const handleAssignDogToBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBay) return;

    if (!selectedDogIdToAssign) {
      // Mark as Vacant
      const updated = bays.map(b => b.id === selectedBay.id ? {
        ...b,
        status: 'Vacant & Clean' as const,
        currentDogId: undefined,
        currentDogName: undefined
      } : b);
      saveBays(updated);
      setSelectedBay(null);
      return;
    }

    const foundDog = dogs.find(d => d.id === selectedDogIdToAssign);
    if (!foundDog) return;

    const updated = bays.map(b => b.id === selectedBay.id ? {
      ...b,
      status: 'Occupied' as const,
      currentDogId: foundDog.id,
      currentDogName: foundDog.name
    } : b);

    saveBays(updated);
    if (onUpdateDogKennel) {
      onUpdateDogKennel(foundDog.id, selectedBay.name);
    }
    setSelectedBay(null);
  };

  const handleMarkCleaned = (bayId: string) => {
    const updated = bays.map(b => b.id === bayId ? {
      ...b,
      lastSanitizedDate: toIsoDate(new Date()),
      status: b.status === 'Cleaning in Progress' ? 'Vacant & Clean' as const : b.status
    } : b);
    saveBays(updated);
  };

  const occupiedCount = bays.filter(b => b.status === 'Occupied').length;
  const vacantCount = bays.filter(b => b.status === 'Vacant & Clean').length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Interactive Kennel Housing & Live Bay Occupancy Map</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {occupiedCount} Occupied / {vacantCount} Vacant
            </span>
          </div>
          <p className="text-xs text-gray-500">Live housing status, outdoor run dimensions, sanitization dates, and door placards.</p>
        </div>

        <button
          onClick={() => {
            // Print all placards for occupied bays
            bays.filter(b => b.status === 'Occupied' && b.currentDogName).forEach(b => {
              const matchedDog = dogs.find(d => d.name === b.currentDogName);
              if (matchedDog) generateKennelPlacardPdf(matchedDog);
            });
          }}
          type="button"
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Printer size={14} />
          <span>Print All Door Placards</span>
        </button>
      </div>

      {/* Grid of Kennel Bays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bays.map(bay => {
          const matchedDog = dogs.find(d => d.name === bay.currentDogName || d.id === bay.currentDogId);
          const isOccupied = bay.status === 'Occupied';
          const isQuarantine = bay.block === 'Quarantine Unit';
          const isMaternity = bay.block === 'Maternity Bay';

          return (
            <div
              key={bay.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between relative overflow-hidden bg-white ${
                isOccupied
                  ? 'border-emerald-200 shadow-xs hover:border-emerald-400'
                  : 'border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50'
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                isQuarantine
                  ? 'bg-amber-500'
                  : isMaternity
                  ? 'bg-purple-500'
                  : isOccupied
                  ? 'bg-emerald-600'
                  : 'bg-gray-300'
              }`} />

              <div>
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{bay.block}</span>
                    <h4 className="text-base font-black text-gray-900">{bay.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      bay.status === 'Occupied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bay.status === 'Vacant & Clean'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bay.status}
                  </span>
                </div>

                {isOccupied && matchedDog ? (
                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1.5 my-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-emerald-900">{matchedDog.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {matchedDog.dutyRole}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">{matchedDog.breed}</p>
                    <div className="text-[11px] text-gray-600 flex items-center gap-1 pt-1">
                      <User size={12} className="text-gray-400" />
                      <span>{matchedDog.handlerName || 'Estate Security'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl my-2">
                    <Home size={22} className="mx-auto mb-1 text-gray-300" />
                    <span>Bay Currently Vacant</span>
                  </div>
                )}

                <div className="space-y-1 text-xs text-gray-500 pt-1">
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="font-medium text-gray-800">{bay.dimensions || 'Standard Run'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sanitized:</span>
                    <span className="font-mono text-gray-700">{bay.lastSanitizedDate || 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => {
                    setSelectedBay(bay);
                    setSelectedDogIdToAssign(matchedDog?.id || '');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit2 size={12} />
                  <span>{isOccupied ? 'Change Dog' : 'Assign Dog'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMarkCleaned(bay.id)}
                    className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Mark Disinfected (Virkon-S)"
                  >
                    <Sparkles size={14} />
                  </button>

                  {matchedDog && (
                    <button
                      onClick={() => generateKennelPlacardPdf(matchedDog)}
                      className="p-1.5 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Print Gate Door Placard (A5)"
                    >
                      <Printer size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {selectedBay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">
              Assign Canine to {selectedBay.name}
            </h3>
            <p className="text-xs text-gray-500">
              Select which registered working dog is housed in this kennel bay, or choose "Leave Vacant".
            </p>

            <form onSubmit={handleAssignDogToBay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Canine:</label>
                <select
                  value={selectedDogIdToAssign}
                  onChange={e => setSelectedDogIdToAssign(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="">-- [Vacant / Unoccupied Bay] --</option>
                  {dogs.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.breed}) - {d.dutyRole}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedBay(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Bay Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
