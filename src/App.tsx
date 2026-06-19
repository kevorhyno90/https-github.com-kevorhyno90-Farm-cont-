/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Truck,
  Activity,
  Heart,
  Leaf,
  Sprout,
  Coins,
  Warehouse,
  FileText,
  Clock,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  Printer,
  Download,
  FileDown
} from 'lucide-react';

// Modular Subcomponents
import { Dashboard } from './components/Dashboard';
import { Roster } from './components/Roster';
import { FeedFormulator } from './components/FeedFormulator';
import { TmrMixing } from './components/TmrMixing';
import { DairyBreeding } from './components/DairyBreeding';
import { Horticulture } from './components/Horticulture';
import { SprayLog } from './components/SprayLog';
import { Financials } from './components/Financials';
import { OtherSections } from './components/OtherSections';

// Master Types
import {
  MilkingRecord,
  AIRecord,
  TeaRecord,
  AvocadoRecord,
  FinancialRecord,
  SprayRecord,
  Todo,
  Ingredient,
  StaffMember,
  LivestockRecord,
  FieldRecord,
  InventoryItem,
  StaffOffRecord,
  Cow,
  VetRecord,
  GoatRecord,
  CalfRecord,
  BsfRecord,
  CropOpRecord,
  CropSaleRecord
} from './types';

// Mock Primers
import {
  INITIAL_STAFF,
  INITIAL_INGREDIENTS,
  INITIAL_MILK_RECORDS,
  INITIAL_AI_RECORDS,
  INITIAL_TEA_RECORDS,
  INITIAL_AVOCADO_RECORDS,
  INITIAL_FINICAL_RECORDS,
  INITIAL_SPRAY_RECORDS,
  INITIAL_TODOS,
  INITIAL_LIVESTOCK,
  INITIAL_FIELDS,
  INITIAL_INVENTORY,
  INITIAL_STAFF_OFF_RECORDS,
  INITIAL_COWS,
  INITIAL_VET_RECORDS,
  INITIAL_GOAT_RECORDS,
  INITIAL_CALF_RECORDS,
  INITIAL_BSF_RECORDS,
  INITIAL_CROP_OP_RECORDS,
  INITIAL_CROP_SALES
} from './initialData';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dash');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [liveTime, setLiveTime] = useState<string>('');

  // Main Persistent States loaded from localStorage
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('jr_farm_staff');
    let parsed: StaffMember[] = saved ? JSON.parse(saved) : INITIAL_STAFF;
    
    // Filter out Victor Ogomba / Victor
    parsed = parsed.filter((s) => !s.name.toLowerCase().includes('victor'));

    const hasDevin = parsed.some((s) => s.name.includes('Devin') || s.role === 'Overall Farm Manager');
    if (!hasDevin) {
      parsed = [INITIAL_STAFF[0], ...parsed];
    } else {
      parsed = parsed.map((s) => {
        if (s.role === 'Overall Farm Manager' || s.name.includes('Devin')) {
          return {
            ...s,
            id: 'st-0',
            name: 'Dr. Devin Omwenga',
            role: 'Overall Farm Manager',
            unit: 'General'
          };
        }
        return s;
      });
    }
    return parsed;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('jr_farm_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [milkRecords, setMilkRecords] = useState<MilkingRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_milk');
    return saved ? JSON.parse(saved) : INITIAL_MILK_RECORDS;
  });

  const [aiRecords, setAiRecords] = useState<AIRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_ai');
    return saved ? JSON.parse(saved) : INITIAL_AI_RECORDS;
  });

  const [teaRecords, setTeaRecords] = useState<TeaRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_tea');
    return saved ? JSON.parse(saved) : INITIAL_TEA_RECORDS;
  });

  const [avoRecords, setAvoRecords] = useState<AvocadoRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_avo');
    return saved ? JSON.parse(saved) : INITIAL_AVOCADO_RECORDS;
  });

  const [financials, setFinancials] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_financials');
    return saved ? JSON.parse(saved) : INITIAL_FINICAL_RECORDS;
  });

  const [sprayRecords, setSprayRecords] = useState<SprayRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_sprays');
    return saved ? JSON.parse(saved) : INITIAL_SPRAY_RECORDS;
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('jr_farm_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [fields, setFields] = useState<FieldRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_fields');
    return saved ? JSON.parse(saved) : INITIAL_FIELDS;
  });

  const [livestock, setLivestock] = useState<LivestockRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_livestock');
    return saved ? JSON.parse(saved) : INITIAL_LIVESTOCK;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('jr_farm_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [staffOffRecords, setStaffOffRecords] = useState<StaffOffRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_staff_off');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_OFF_RECORDS;
  });

  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem('jr_farm_cows');
    return saved ? JSON.parse(saved) : INITIAL_COWS;
  });

  const [vetRecords, setVetRecords] = useState<VetRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_vets');
    return saved ? JSON.parse(saved) : INITIAL_VET_RECORDS;
  });

  const [goatRecords, setGoatRecords] = useState<GoatRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_goats');
    return saved ? JSON.parse(saved) : INITIAL_GOAT_RECORDS;
  });

  const [calfRecords, setCalfRecords] = useState<CalfRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_calves');
    return saved ? JSON.parse(saved) : INITIAL_CALF_RECORDS;
  });

  const [bsfRecords, setBsfRecords] = useState<BsfRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_bsfs');
    return saved ? JSON.parse(saved) : INITIAL_BSF_RECORDS;
  });

  const [cropOps, setCropOps] = useState<CropOpRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_crop_ops');
    return saved ? JSON.parse(saved) : INITIAL_CROP_OP_RECORDS;
  });

  const [cropSales, setCropSales] = useState<CropSaleRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_crop_sales');
    return saved ? JSON.parse(saved) : INITIAL_CROP_SALES;
  });

  // Report modal state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showPdfGuide, setShowPdfGuide] = useState<boolean>(false);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    staff: true,
    milk: true,
    ai: true,
    tea: true,
    avo: true,
    cropSales: true,
    financials: true,
    spray: true,
    fields: true,
    livestock: true,
    goats: true,
    calves: true,
    bsf: true,
    inventory: true,
    vet: true
  });

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('jr_farm_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('jr_farm_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('jr_farm_milk', JSON.stringify(milkRecords));
  }, [milkRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_ai', JSON.stringify(aiRecords));
  }, [aiRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_tea', JSON.stringify(teaRecords));
  }, [teaRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_avo', JSON.stringify(avoRecords));
  }, [avoRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_financials', JSON.stringify(financials));
  }, [financials]);

  useEffect(() => {
    localStorage.setItem('jr_farm_sprays', JSON.stringify(sprayRecords));
  }, [sprayRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('jr_farm_fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem('jr_farm_livestock', JSON.stringify(livestock));
  }, [livestock]);

  useEffect(() => {
    localStorage.setItem('jr_farm_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('jr_farm_staff_off', JSON.stringify(staffOffRecords));
  }, [staffOffRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_cows', JSON.stringify(cows));
  }, [cows]);

  useEffect(() => {
    localStorage.setItem('jr_farm_vets', JSON.stringify(vetRecords));
  }, [vetRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_goats', JSON.stringify(goatRecords));
  }, [goatRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_calves', JSON.stringify(calfRecords));
  }, [calfRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_bsfs', JSON.stringify(bsfRecords));
  }, [bsfRecords]);

  useEffect(() => {
    localStorage.setItem('jr_farm_crop_ops', JSON.stringify(cropOps));
  }, [cropOps]);

  useEffect(() => {
    localStorage.setItem('jr_farm_crop_sales', JSON.stringify(cropSales));
  }, [cropSales]);

  // Live timer effect
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setLiveTime(new Date().toLocaleTimeString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live calculated variables
  const totalIncome = financials
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financials
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netPl = totalIncome - totalExpense;

  const totalTeaQty = teaRecords.reduce((sum, r) => sum + r.qty, 0);

  const activeAlarmsCount = aiRecords.filter(
    (cycle) => cycle.status === 'Confirmed Pregnant' || cycle.status === 'Pending'
  ).length;

  // Compute upcoming due pregnancy
  const getUpcomingDueAlarm = (): string => {
    const active = aiRecords.filter((cycle) => cycle.status === 'Confirmed Pregnant');
    if (!active.length) return '-- No Pending Births --';
    // Sort by due date relative to today
    const sorted = [...active].sort((a, b) => a.due.localeCompare(b.due));
    const next = sorted[0];
    const daysLeft = Math.ceil(
      (new Date(next.due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return `${next.cowId}: Overdue!`;
    return `${next.cowId}: Due in ${daysLeft} days`;
  };

  const upcomingDueAlarm = getUpcomingDueAlarm();

  // state updates handlers
  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTodo = (text: string, assigneeName?: string) => {
    const newTodoItem: Todo = {
      id: `todo-${Date.now()}`,
      text,
      completed: false,
      date: new Date().toISOString().split('T')[0],
      assigneeName
    };
    setTodos([...todos, newTodoItem]);
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };


  const handleUpdateStaffStatus = (id: string, status: 'Present' | 'Off' | 'On Leave') => {
    setStaffList(
      staffList.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleAddStaff = (member: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: `st-${Date.now()}`
    };
    setStaffList([...staffList, newStaff]);
  };

  const handleAddIngredientLib = (ing: Ingredient) => {
    setIngredients([...ingredients, ing]);
  };

  const handleAddMilkRecord = (rec: MilkingRecord) => {
    setMilkRecords([rec, ...milkRecords]);
    if (rec.pricePerLiter && rec.pricePerLiter > 0) {
      const yieldVol = rec.am + rec.pm;
      const calcSales = rec.totalSales ?? (yieldVol * rec.pricePerLiter);
      const buyerName = rec.buyer ?? 'Brookside Dairy Ltd';
      const autoIncome: FinancialRecord = {
        id: `f-auto-${Date.now()}`,
        type: 'income',
        amount: calcSales,
        category: 'Milk Sale',
        description: `Milk sale payout for Cow ${rec.id} to (${buyerName}) - ${yieldVol.toFixed(1)} Liters @ Ksh ${rec.pricePerLiter}/L`,
        date: rec.date
      };
      setFinancials((prev) => [autoIncome, ...prev]);
    }
  };

  const handleAddAIRecord = (rec: AIRecord) => {
    setAiRecords([rec, ...aiRecords]);
  };

  const handleUpdateAIStatus = (cowId: string, date: string, status: AIRecord['status']) => {
    setAiRecords(
      aiRecords.map((cycle) => {
        if (cycle.cowId === cowId && cycle.date === date) {
          // If status changes to Calved or Failed we can update, let's keep estimated due
          return { ...cycle, status };
        }
        return cycle;
      })
    );
  };

  const handleAddTea = (rec: TeaRecord) => {
    setTeaRecords([rec, ...teaRecords]);
    const teaPrice = rec.pricePerKg ?? 58;
    const finalSales = rec.totalSales ?? (rec.qty * teaPrice);
    const buyerName = rec.buyer ?? 'Chinga KTDA Factory';
    const autoIncome: FinancialRecord = {
      id: `f-auto-${Date.now()}`,
      type: 'income',
      amount: finalSales,
      category: 'Tea Sale',
      description: `Tea sale payout for Ref ${rec.ref} to (${buyerName}) - ${rec.qty} KG @ Ksh ${teaPrice}/KG`,
      date: rec.date
    };
    setFinancials((prev) => [autoIncome, ...prev]);
  };

  const handleAddAvo = (rec: AvocadoRecord) => {
    setAvoRecords([rec, ...avoRecords]);
    const pA = rec.priceGradeA ?? 1500;
    const pB = rec.priceGradeB ?? 850;
    const pR = rec.priceReject ?? 38;
    const finalSales = rec.totalSales ?? ((rec.gradeA * pA) + (rec.gradeB * pB) + (rec.reject * pR));
    const buyerName = rec.buyer ?? 'Kakuzi Agribusiness Exporters';
    const autoIncome: FinancialRecord = {
      id: `f-auto-${Date.now()}`,
      type: 'income',
      amount: finalSales,
      category: 'Avocado Sale',
      description: `Avocado Export shipment Ref ${rec.ref} to (${buyerName}) - A: ${rec.gradeA} bx @ Ks${pA}, B: ${rec.gradeB} bx @ Ks${pB}, Rj: ${rec.reject} kg @ Ks${pR}`,
      date: rec.date
    };
    setFinancials((prev) => [autoIncome, ...prev]);
  };

  const handleAddCropSale = (rec: CropSaleRecord) => {
    setCropSales([rec, ...cropSales]);
    const autoIncome: FinancialRecord = {
      id: `f-auto-${Date.now()}`,
      type: 'income',
      amount: rec.totalSales,
      category: 'General Crop Sale',
      description: `Crop Sale (${rec.crop}) payout Ref ${rec.ref} to (${rec.buyer}) - ${rec.qty} ${rec.unit} @ Ksh ${rec.pricePerUnit}/${rec.unit}`,
      date: rec.date
    };
    setFinancials((prev) => [autoIncome, ...prev]);
  };

  const handleAddTransaction = (rec: FinancialRecord) => {
    setFinancials([rec, ...financials]);
  };

  const handleDeleteTransaction = (id: string) => {
    setFinancials(financials.filter((f) => f.id !== id));
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
    setStaffOffRecords(staffOffRecords.filter((r) => r.staffId !== id)); // Clean up off records if staff is deleted
  };

  const handleAddOffRecord = (record: Omit<StaffOffRecord, 'id'>) => {
    const newRecord: StaffOffRecord = {
      ...record,
      id: `off-${Date.now()}`
    };
    setStaffOffRecords([newRecord, ...staffOffRecords]);
    
    // Automatically update the main staffList status field if the off start date is <= today and today is <= end date!
    const today = new Date().toISOString().split('T')[0];
    if (newRecord.startDate <= today && today <= newRecord.endDate && newRecord.status === 'Approved') {
      const liveStatus = newRecord.type === 'Day Off' ? 'Off' : 'On Leave';
      setStaffList((prev) => prev.map((s) => s.id === newRecord.staffId ? { ...s, status: liveStatus } : s));
    }
  };

  const handleDeleteOffRecord = (id: string) => {
    const target = staffOffRecords.find((r) => r.id === id);
    setStaffOffRecords(staffOffRecords.filter((r) => r.id !== id));
    if (target) {
      setStaffList((prev) => prev.map((s) => s.id === target.staffId ? { ...s, status: 'Present' } : s));
    }
  };

  const handleUpdateOffRecordStatus = (id: string, status: 'Approved' | 'Pending' | 'Completed') => {
    setStaffOffRecords((prevList) =>
      prevList.map((r) => {
        if (r.id === id) {
          const updated = { ...r, status };
          const today = new Date().toISOString().split('T')[0];
          if (updated.startDate <= today && today <= updated.endDate) {
            if (status === 'Approved') {
              const liveStatus = updated.type === 'Day Off' ? 'Off' : 'On Leave';
              setStaffList((prev) => prev.map((s) => s.id === updated.staffId ? { ...s, status: liveStatus } : s));
            } else {
              setStaffList((prev) => prev.map((s) => s.id === updated.staffId ? { ...s, status: 'Present' } : s));
            }
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleDeleteIngredientLib = (name: string) => {
    setIngredients(ingredients.filter((i) => i.name !== name));
  };

  const handleDeleteMilkRecord = (id: string, date: string) => {
    setMilkRecords(milkRecords.filter((m) => !(m.id === id && m.date === date)));
  };

  const handleDeleteAIRecord = (cowId: string, date: string) => {
    setAiRecords(aiRecords.filter((a) => !(a.cowId === cowId && a.date === date)));
  };

  const handleDeleteTea = (ref: string) => {
    setTeaRecords(teaRecords.filter((t) => t.ref !== ref));
  };

  const handleDeleteAvo = (ref: string) => {
    setAvoRecords(avoRecords.filter((a) => a.ref !== ref));
  };

  const handleDeleteCropSale = (id: string) => {
    setCropSales(cropSales.filter((s) => s.id !== id));
  };

  const handleDeleteSpray = (id: string) => {
    setSprayRecords(sprayRecords.filter((s) => s.id !== id));
  };

  const handleDeleteFields = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleDeleteLivestock = (id: string) => {
    setLivestock(livestock.filter((l) => l.id !== id));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter((i) => i.id !== id));
  };

  const handleAddSpray = (rec: SprayRecord) => {
    setSprayRecords([rec, ...sprayRecords]);
  };

  const handleAddFields = (rec: FieldRecord) => {
    setFields([rec, ...fields]);
  };

  const handleAddLivestock = (rec: LivestockRecord) => {
    setLivestock([rec, ...livestock]);
  };

  const handleUpdateInventoryStock = (id: string, newQty: number) => {
    setInventory(
      inventory.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleAddInventoryItem = (item: InventoryItem) => {
    setInventory([...inventory, item]);
  };

  const handleAddCow = (rec: Cow) => {
    setCows([rec, ...cows]);
  };

  const handleDeleteCow = (id: string) => {
    setCows(cows.filter(c => c.id !== id));
  };

  const handleUpdateCowStatus = (id: string, status: Cow['status']) => {
    setCows(cows.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleAddVetRecord = (rec: VetRecord) => {
    setVetRecords([rec, ...vetRecords]);
    if (rec.cost > 0) {
      handleAddTransaction({
        id: `f-vet-${Date.now()}`,
        type: 'expense',
        amount: rec.cost,
        category: 'Veternary Care',
        description: `Vet care ${rec.type} for ${rec.cowId} (${rec.treatment})`,
        date: rec.date
      });
    }
  };

  const handleDeleteVetRecord = (id: string) => {
    setVetRecords(vetRecords.filter(r => r.id !== id));
  };

  const handleAddGoatRecord = (rec: GoatRecord) => {
    setGoatRecords([rec, ...goatRecords]);
  };

  const handleDeleteGoatRecord = (id: string) => {
    setGoatRecords(goatRecords.filter(r => r.id !== id));
  };

  const handleAddCalfRecord = (rec: CalfRecord) => {
    setCalfRecords([rec, ...calfRecords]);
  };

  const handleDeleteCalfRecord = (id: string) => {
    setCalfRecords(calfRecords.filter(r => r.id !== id));
  };

  const handleAddBsfRecord = (rec: BsfRecord) => {
    setBsfRecords([rec, ...bsfRecords]);
  };

  const handleDeleteBsfRecord = (id: string) => {
    setBsfRecords(bsfRecords.filter(r => r.id !== id));
  };

  const handleAddCropOp = (rec: CropOpRecord) => {
    setCropOps([rec, ...cropOps]);
  };

  const handleDeleteCropOp = (id: string) => {
    setCropOps(cropOps.filter(r => r.id !== id));
  };

  const handleUpdateCropOpStatus = (id: string, status: CropOpRecord['status'], completedBy?: string, notes?: string) => {
    setCropOps(cropOps.map(c => c.id === id ? { ...c, status, completedBy: completedBy ?? c.completedBy, notes: notes ?? c.notes } : c));
  };

  const handleEditStaff = (id: string, updated: StaffMember) => {
    setStaffList((prev) => prev.map((s) => s.id === id ? updated : s));
  };

  const handleEditMilkRecord = (id: string, date: string, updated: MilkingRecord) => {
    setMilkRecords((prev) => prev.map((m) => (m.id === id && m.date === date) ? updated : m));
  };

  const handleEditAIRecord = (cowId: string, date: string, updated: AIRecord) => {
    setAiRecords((prev) => prev.map((a) => (a.cowId === cowId && a.date === date) ? updated : a));
  };

  const handleEditTea = (oldRef: string, updated: TeaRecord) => {
    setTeaRecords((prev) => prev.map((t) => t.ref === oldRef ? updated : t));
  };

  const handleEditAvo = (oldRef: string, updated: AvocadoRecord) => {
    setAvoRecords((prev) => prev.map((a) => a.ref === oldRef ? updated : a));
  };

  const handleEditFinancialRecord = (id: string, updated: FinancialRecord) => {
    setFinancials((prev) => prev.map((f) => f.id === id ? updated : f));
  };

  const handleEditSprayRecord = (id: string, updated: SprayRecord) => {
    setSprayRecords((prev) => prev.map((s) => s.id === id ? updated : s));
  };

  const handleEditFieldRecord = (id: string, updated: FieldRecord) => {
    setFields((prev) => prev.map((f) => f.id === id ? updated : f));
  };

  const handleEditLivestockRecord = (id: string, updated: LivestockRecord) => {
    setLivestock((prev) => prev.map((l) => l.id === id ? updated : l));
  };

  const handleEditInventoryItem = (id: string, updated: InventoryItem) => {
    setInventory((prev) => prev.map((i) => i.id === id ? updated : i));
  };

  const handleEditStaffOffRecord = (id: string, updated: StaffOffRecord) => {
    setStaffOffRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCow = (id: string, updated: Cow) => {
    setCows((prev) => prev.map((c) => c.id === id ? updated : c));
  };

  const handleEditVetRecord = (id: string, updated: VetRecord) => {
    setVetRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditGoatRecord = (id: string, updated: GoatRecord) => {
    setGoatRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCalfRecord = (id: string, updated: CalfRecord) => {
    setCalfRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditBsfRecord = (id: string, updated: BsfRecord) => {
    setBsfRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCropOpRecord = (id: string, updated: CropOpRecord) => {
    setCropOps((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCropSale = (id: string, updated: CropSaleRecord) => {
    setCropSales((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  // CSV Exporter helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'JR FARM MASTER ESTATE REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Estate Manager: Dr. Devin Omwenga\n\n`;

    // 1. Staff deployment
    if (selectedSections.staff) {
      csvContent += '--- STAFF DEPLOYMENT STATUS ROSTER ---\n';
      csvContent += 'Name,Section/Unit,Morning Shift,Afternoon Shift,Status\n';
      staffList.forEach((st) => {
        csvContent += `"${st.name}","${st.unit}","${st.shiftMorning}","${st.shiftAfternoon}","${st.status}"\n`;
      });
      csvContent += '\n';
    }

    // 2. Milking records Section
    if (selectedSections.milk) {
      csvContent += '--- MILKING RECORDS & BULK SALES ---\n';
      csvContent += 'Date,Cow Tag ID,AM Liters,PM Liters,Total Liters,Price/L (Ksh),Buyer/Purchaser,Total Milk Sales (Ksh),Recorder Officer\n';
      milkRecords.forEach((m) => {
        const p = m.pricePerLiter ?? 0;
        const b = m.buyer ?? 'Domestic Use';
        const s = m.totalSales ?? ((m.am + m.pm) * p);
        csvContent += `${m.date},"${m.id}",${m.am},${m.pm},${(m.am + m.pm).toFixed(2)},${p},"${b}",${s},"${m.staff}"\n`;
      });
      csvContent += '\n';
    }

    // 3. Breeding / AI Records Section
    if (selectedSections.ai) {
      csvContent += '--- ARTIFICIAL INSEMINATION AND BREEDING HERD CYCLES ---\n';
      csvContent += 'Cow Tag ID,Service Date,Bull Name / Semen Reference,Expected Due Date (Gestation),Pregnancy Status\n';
      aiRecords.forEach((cycle) => {
        csvContent += `"${cycle.cowId}",${cycle.date},"${cycle.bull}",${cycle.due},"${cycle.status}"\n`;
      });
      csvContent += '\n';
    }

    // 4. Tea harvest Section
    if (selectedSections.tea) {
      csvContent += '--- KTDA TEA EXPORTS HARVEST & DELIVERIES ---\n';
      csvContent += 'Date,Plucking Ref,Primary Buyer,Harvest Weight (KG),Price/KG (Ksh),Gross Amount (Ksh)\n';
      teaRecords.forEach((t) => {
        const p = t.pricePerKg ?? 58;
        const b = t.buyer ?? 'Chinga KTDA Factory';
        const s = t.totalSales ?? (t.qty * p);
        csvContent += `${t.date},"${t.ref}","${b}",${t.qty},${p},${s}\n`;
      });
      csvContent += '\n';
    }

    // 5. Avocado Section
    if (selectedSections.avo) {
      csvContent += '--- AVOCADO EXPORT LOGISTICS ---\n';
      csvContent += 'Date,Shipping Ref,Primary Exporter,Grade A (Boxes),Grade B (Boxes),Reject (KG),Price Grade A (Ksh),Price Grade B (Ksh),Price Reject (Ksh),Gross Revenue (Ksh)\n';
      avoRecords.forEach((item) => {
        const pA = item.priceGradeA ?? 1500;
        const pB = item.priceGradeB ?? 850;
        const pR = item.priceReject ?? 38;
        const b = item.buyer ?? 'Kakuzi Agribusiness Exporters';
        const s = item.totalSales ?? ((item.gradeA * pA) + (item.gradeB * pB) + (item.reject * pR));
        csvContent += `${item.date},"${item.ref}","${b}",${item.gradeA},${item.gradeB},${item.reject},${pA},${pB},${pR},${s}\n`;
      });
      csvContent += '\n';
    }

    // 6. Other Crops Local Sales Section
    if (selectedSections.cropSales) {
      csvContent += '--- OTHER FIELD CROPS LOCAL SALES RECORD ---\n';
      csvContent += 'Date,Invoice/Receipt Ref,Local Crop,Quantity Sold,Unit,Rate per Unit (Ksh),Gross Income (Ksh),Primary Buyer\n';
      cropSales.forEach((cs) => {
        csvContent += `${cs.date},"${cs.ref}","${cs.crop}",${cs.qty},"${cs.unit}",${cs.pricePerUnit},${cs.totalSales},"${cs.buyer}"\n`;
      });
      csvContent += '\n';
    }

    // 7. Financials Section
    if (selectedSections.financials) {
      csvContent += '--- OPERATING FINANCIAL GENERAL LEDGER ---\n';
      csvContent += 'Date,Transaction,Amount (Ksh),Type,Description\n';
      financials.forEach((f) => {
        csvContent += `${f.date},"${f.category}",${f.amount},${f.type.toUpperCase()},"${f.description}"\n`;
      });
      csvContent += '\n';
    }

    // 8. Spray Section
    if (selectedSections.spray) {
      csvContent += '--- AGROCHEMICAL SPRAY QUARANTINE INDEX ---\n';
      csvContent += 'Date Sprayed,Plot/Section,Chemical Brand,PHI Days,Pest Target,Authorized Harvest Date\n';
      sprayRecords.forEach((s) => {
        csvContent += `${s.date},"${s.block}","${s.chemical}",${s.phi},"${s.target}",${s.safeDate}\n`;
      });
      csvContent += '\n';
    }

    // 9. Fields Directory Section
    if (selectedSections.fields) {
      csvContent += '--- REGISTERED FIELDS & AGRO FORESTRY COMPLIANCE DIRECTORY ---\n';
      csvContent += 'Plot ID,Block Name,Crop Type,Area (Acres),Status,Observational Notes,Date Logged\n';
      fields.forEach((f) => {
        csvContent += `"${f.id}","${f.blockName}","${f.cropType}",${f.acreage},"${f.status}","${f.notes || ''}","${f.date}"\n`;
      });
      csvContent += '\n';
    }

    // 10. Livestock Canine / Poultry Log Section
    if (selectedSections.livestock) {
      csvContent += '--- AGRICULTURAL CANINE & POULTRY STATUS MANAGER ---\n';
      csvContent += 'Date,Asset Name,Category Type,Quantity/Breed details,Current Activity,Observational Log\n';
      livestock.forEach((item) => {
        csvContent += `"${item.date}","${item.name}","${item.type}","${item.countOrBreed}","${item.activity}","${item.notes || ''}"\n`;
      });
      csvContent += '\n';
    }

    // 11. Goats Section
    if (selectedSections.goats) {
      csvContent += '--- GOAT DAIRY & BREEDING HERD REGISTER ---\n';
      csvContent += 'Date,Record ID,Tag/Collar ID,Breed,Purpose,Milk Yield (Liters),Activity,Observational Notes\n';
      goatRecords.forEach((gt) => {
        csvContent += `${gt.date},"${gt.id}","${gt.tagId}","${gt.breed}","${gt.purpose}",${gt.milkYieldLiters ?? ''},"${gt.activity}","${gt.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 12. Calves Section
    if (selectedSections.calves) {
      csvContent += '--- NURSERY CALF WEANING & HEALTH DOSAGE HISTORY ---\n';
      csvContent += 'Date,Record ID,Calf ID,Dam/Mother ID,DOB,Milk Intake (L),Creep Feed Intro Date,Weaned Status,Observational Notes\n';
      calfRecords.forEach((cf) => {
        csvContent += `${cf.date},"${cf.id}","${cf.calfId}","${cf.damId}","${cf.dob}",${cf.milkIntakeLiters},"${cf.creepFeedIntroDate || ''}","${cf.weaned ? 'Weaned' : 'Nursery active'}","${cf.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 13. BSF Batches Section
    if (selectedSections.bsf) {
      csvContent += '--- BLACK SOLDIER FLY (BSF) LARVAE REARING CYCLES ---\n';
      csvContent += 'Date,Record ID,Batch ID,Substrate Feed Type,Inoculation Date,Larvae Harvested (KG),Status Stage,Observational Notes\n';
      bsfRecords.forEach((batch) => {
        csvContent += `${batch.date},"${batch.id}","${batch.batchId}","${batch.substrateType}","${batch.inoculationDate}",${batch.larvaeHarvestedKg},"${batch.status}","${batch.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 14. Inventory items
    if (selectedSections.inventory) {
      csvContent += '--- STORAGE WAREHOUSE INVENTORY RESERVES ---\n';
      csvContent += 'Item ID,Item Name,Primary Category,Current Stock,Unit Measure,Reorder Safety Level,Status Alert\n';
      inventory.forEach((item) => {
        const isLow = item.quantity <= item.minStock;
        csvContent += `"${item.id}","${item.name}","${item.category}",${item.quantity},"${item.unit}",${item.minStock},"${isLow ? 'RESTOCK REQUIRED' : 'Secure level'}"\n`;
      });
      csvContent += '\n';
    }

    // 15. Vet records
    if (selectedSections.vet) {
      csvContent += '--- VETERINARY CLINICAL OPERATIONS & HERD TREATMENTS ---\n';
      csvContent += 'Incident Date,Target animal Tag,Type,clinical Diagnosis / Drugs,Cost (Ksh),Veterinary Inoculator,Notes\n';
      vetRecords.forEach((vet) => {
        csvContent += `${vet.date},"${vet.cowId}","${vet.type}","${vet.treatment}",${vet.cost},"${vet.staff}","${vet.notes}"\n`;
      });
      csvContent += '\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'JR_Farm_Master_Estate_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive navigation links
  const sidebarLinks = [
    { id: 'dash', label: 'Command Center', icon: LayoutDashboard, category: 'Main' },
    { id: 'roster', label: 'Staff Roster', icon: Users, category: 'Main' },

    { id: 'factory', label: 'Feed Formulator', icon: FlaskConical, category: 'Feed & Factory' },
    { id: 'tmr', label: 'TMR Mixing', icon: Truck, category: 'Feed & Factory' },

    { id: 'dairy', label: 'Dairy & AI', icon: Activity, category: 'Livestock' },
    { id: 'livestock', label: 'Livestock & BSF', icon: Heart, category: 'Livestock' },

    { id: 'horti', label: 'Tea & Avocado', icon: Leaf, category: 'Crop Exports' },
    { id: 'fields', label: 'Fields & Trees', icon: Sprout, category: 'Crop Exports' },
    { id: 'spray', label: 'GlobalGAP Spray', icon: FlaskConical, category: 'Crop Exports' },

    { id: 'finance', label: 'Financials (P&L)', icon: Coins, category: 'Operations' },
    { id: 'inventory', label: 'Inventory Store', icon: Warehouse, category: 'Operations' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 bg-emerald-950 text-emerald-100 w-72 h-screen border-r border-emerald-900 shadow-xl overflow-y-auto hidden lg:flex flex-col z-40 transition-all">
        <div className="p-8 text-center border-b border-emerald-900 mb-6 shrink-0 relative">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-800 border border-green-700 text-yellow-500 rounded text-[9px] font-black uppercase tracking-wider">
            Live
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter">JR FARM MASTER</h1>
          <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1.5">
            Estate Manager: Dr. Devin Omwenga
          </p>
        </div>

        {/* Sidebar Nav links grouped by category */}
        <nav className="flex-1 px-4 space-y-6">
          {['Main', 'Feed & Factory', 'Livestock', 'Crop Exports', 'Operations'].map((cat) => (
            <div key={cat} className="space-y-1">
              <span className="px-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">
                {cat}
              </span>
              {sidebarLinks
                .filter((link) => link.category === cat)
                .map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-wide leading-none ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-md border-l-4 border-yellow-500 pl-3 font-extrabold'
                          : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-yellow-500' : 'text-emerald-400'} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight size={12} className={isActive ? 'text-yellow-500 opacity-100' : 'opacity-0'} />
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Master PDF printable report downloader trigger */}
        <div className="p-6 border-t border-emerald-900 shrink-0">
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 m-0 cursor-pointer"
          >
            <FileText size={16} />
            Master Report
          </button>
        </div>
      </aside>

      {/* 2. MOBILE MENU HEADER BAR */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-72 relative">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-xs z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-emerald-950 hover:bg-slate-100 rounded-lg transition-colors m-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest font-mono">
              {sidebarLinks.find((l) => l.id === activeTab)?.label || 'System Core'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono font-bold bg-slate-50 border px-3 py-1.5 rounded-full shadow-inner">
              <Clock size={12} className="text-emerald-800 shrink-0" />
              <span>{liveTime || 'Synchronizing...'}</span>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="lg:hidden bg-yellow-500 text-slate-950 font-black p-2 rounded-lg text-xs hover:bg-yellow-400 transition-all flex items-center gap-1.5 m-0 cursor-pointer"
              title="View Master Report"
            >
              <FileText size={14} />
            </button>
          </div>
        </header>

        {/* 3. MOBILE SYSTEM SLIDING DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="relative flex flex-col w-full max-w-xs h-full bg-emerald-950 text-emerald-100 shadow-2xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center pb-6 border-b border-emerald-900 mb-6">
                <div>
                  <h1 className="text-lg font-black text-white italic tracking-tighter">JR FARM MASTER</h1>
                  <p className="text-[9px] text-[10px] text-green-400 font-bold uppercase mt-0.5">Dr. Devin Omwenga</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-emerald-900 border border-emerald-800 text-emerald-200 m-0"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 space-y-5">
                {['Main', 'Feed & Factory', 'Livestock', 'Crop Exports', 'Operations'].map((cat) => (
                  <div key={cat} className="space-y-1">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">
                      {cat}
                    </span>
                    {sidebarLinks
                      .filter((link) => link.category === cat)
                      .map((link) => {
                        const Icon = link.icon;
                        const isActive = activeTab === link.id;
                        return (
                          <button
                            key={link.id}
                            onClick={() => {
                              setActiveTab(link.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs ${
                              isActive
                                ? 'bg-emerald-800 text-white border-l-4 border-yellow-500 pl-2 font-extrabold'
                                : 'text-emerald-100 hover:bg-emerald-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={14} className={isActive ? 'text-yellow-500' : 'text-emerald-400'} />
                              <span>{link.label}</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                ))}
              </nav>

              <div className="pt-6 border-t border-emerald-900 mt-6">
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-yellow-500 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 m-0"
                >
                  <FileText size={15} />
                  Master Report
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* 4. MAIN CENTRAL PANEL VIEWS CONTROLLER */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full transition-all">
          {activeTab === 'dash' && (
            <Dashboard
              milkRecords={milkRecords}
              netPl={netPl}
              activeAlarmsCount={activeAlarmsCount}
              upcomingDueAlarm={upcomingDueAlarm}
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              totalTeaQty={totalTeaQty}
              staffOffRecords={staffOffRecords}
              staffList={staffList}
            />
          )}

          {activeTab === 'roster' && (
            <Roster
              staffList={staffList}
              onUpdateStatus={handleUpdateStaffStatus}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onEditStaff={handleEditStaff}
              staffOffRecords={staffOffRecords}
              onAddOffRecord={handleAddOffRecord}
              onDeleteOffRecord={handleDeleteOffRecord}
              onUpdateOffRecordStatus={handleUpdateOffRecordStatus}
              onEditStaffOffRecord={handleEditStaffOffRecord}
            />
          )}

          {activeTab === 'factory' && (
            <FeedFormulator
              ingredients={ingredients}
              onAddIngredientToLib={handleAddIngredientLib}
              onDeleteIngredientToLib={handleDeleteIngredientLib}
            />
          )}

          {activeTab === 'tmr' && <TmrMixing />}

          {activeTab === 'dairy' && (
            <DairyBreeding
              milkRecords={milkRecords}
              aiRecords={aiRecords}
              staffList={staffList}
              onAddMilkRecord={handleAddMilkRecord}
              onAddAIRecord={handleAddAIRecord}
              onUpdateAIStatus={handleUpdateAIStatus}
              onDeleteMilkRecord={handleDeleteMilkRecord}
              onDeleteAIRecord={handleDeleteAIRecord}
              cows={cows}
              vetRecords={vetRecords}
              onAddCow={handleAddCow}
              onDeleteCow={handleDeleteCow}
              onUpdateCowStatus={handleUpdateCowStatus}
              onAddVetRecord={handleAddVetRecord}
              onDeleteVetRecord={handleDeleteVetRecord}
              onEditMilkRecord={handleEditMilkRecord}
              onEditAIRecord={handleEditAIRecord}
              onEditCow={handleEditCow}
              onEditVetRecord={handleEditVetRecord}
            />
          )}

          {activeTab === 'horti' && (
            <Horticulture
              teaRecords={teaRecords}
              avoRecords={avoRecords}
              onAddTea={handleAddTea}
              onAddAvo={handleAddAvo}
              onDeleteTea={handleDeleteTea}
              onDeleteAvo={handleDeleteAvo}
              onEditTea={handleEditTea}
              onEditAvo={handleEditAvo}
            />
          )}

          {activeTab === 'spray' && (
            <SprayLog
              sprayRecords={sprayRecords}
              onAddSpray={handleAddSpray}
              onDeleteSpray={handleDeleteSpray}
              onEditSprayRecord={handleEditSprayRecord}
            />
          )}

          {activeTab === 'finance' && (
            <Financials
              financialRecords={financials}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onEditFinancialRecord={handleEditFinancialRecord}
            />
          )}

          {/* Sub-view switcher for agronomy / canine logs / warehouse */}
          {(activeTab === 'fields' || activeTab === 'livestock' || activeTab === 'inventory') && (
            <OtherSections
              viewType={activeTab as any}
              fields={fields}
              livestock={livestock}
              inventory={inventory}
              onAddFields={handleAddFields}
              onAddLivestock={handleAddLivestock}
              onUpdateInventoryStock={handleUpdateInventoryStock}
              onAddInventoryItem={handleAddInventoryItem}
              onDeleteFields={handleDeleteFields}
              onDeleteLivestock={handleDeleteLivestock}
              onDeleteInventoryItem={handleDeleteInventoryItem}
              goatRecords={goatRecords}
              calfRecords={calfRecords}
              bsfRecords={bsfRecords}
              cropOps={cropOps}
              staffList={staffList}
              onAddGoatRecord={handleAddGoatRecord}
              onDeleteGoatRecord={handleDeleteGoatRecord}
              onAddCalfRecord={handleAddCalfRecord}
              onDeleteCalfRecord={handleDeleteCalfRecord}
              onAddBsfRecord={handleAddBsfRecord}
              onDeleteBsfRecord={handleDeleteBsfRecord}
              onAddCropOp={handleAddCropOp}
              onDeleteCropOp={handleDeleteCropOp}
              onUpdateCropOpStatus={handleUpdateCropOpStatus}
              cropSales={cropSales}
              onAddCropSale={handleAddCropSale}
              onDeleteCropSale={handleDeleteCropSale}
              onEditField={handleEditFieldRecord}
              onEditLivestock={handleEditLivestockRecord}
              onEditInventoryItem={handleEditInventoryItem}
              onEditGoatRecord={handleEditGoatRecord}
              onEditCalfRecord={handleEditCalfRecord}
              onEditBsfRecord={handleEditBsfRecord}
              onEditCropOp={handleEditCropOpRecord}
              onEditCropSale={handleEditCropSale}
            />
          )}
        </main>
      </div>

      {/* 5. MASTER PRINT / EXPORT REPORT PREVIEW MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-yellow-500" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">Master Estate Compiler Panel</h3>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5 font-sans">Auditing & Compliance Reports</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-emerald-200 cursor-pointer m-0 border border-emerald-850"
              >
                <X size={16} />
              </button>
            </div>

            {/* Split Composer Workspace */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0 bg-slate-100">
              {/* Left Pane: Configurator (Hidden on print) */}
              <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto flex flex-col justify-between print:hidden gap-5 shrink-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800">Configure Report Deck</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Toggle datasets to compile or print</p>
                  </div>

                  {/* Mass Toggles */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const allOn = Object.keys(selectedSections).reduce((acc, key) => {
                          acc[key] = true;
                          return acc;
                        }, {} as Record<string, boolean>);
                        setSelectedSections(allOn);
                      }}
                      className="text-center font-bold text-[10px] uppercase py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer m-0"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        const allOff = Object.keys(selectedSections).reduce((acc, key) => {
                          acc[key] = false;
                          return acc;
                        }, {} as Record<string, boolean>);
                        setSelectedSections(allOff);
                      }}
                      className="text-center font-bold text-[10px] uppercase py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer m-0"
                    >
                      Clear Selection
                    </button>
                  </div>

                  {/* Section checklist */}
                  <div className="space-y-2 max-h-[45vh] lg:max-h-[50vh] overflow-y-auto pr-1">
                    {[
                      { key: 'staff', label: '1. Staff Deployment Roster', count: staffList.length },
                      { key: 'milk', label: '2. Milk Harvest Yields', count: milkRecords.length },
                      { key: 'ai', label: '3. Insemination & Breeding', count: aiRecords.length },
                      { key: 'tea', label: '4. KTDA Tea Deliveries', count: teaRecords.length },
                      { key: 'avo', label: '5. Avocado Exports Logs', count: avoRecords.length },
                      { key: 'cropSales', label: '6. Local Commodities Cash Sales', count: cropSales.length },
                      { key: 'financials', label: '7. Operational Ledger Postings', count: financials.length },
                      { key: 'spray', label: '8. Chemical PHI Quarantines', count: sprayRecords.length },
                      { key: 'fields', label: '9. Registered Field plots', count: fields.length },
                      { key: 'livestock', label: '10. Poultry & Canine Assets', count: livestock.length },
                      { key: 'goats', label: '11. Goat Milk Registers', count: goatRecords.length },
                      { key: 'calves', label: '12. Liquidfed Calves log', count: calfRecords.length },
                      { key: 'bsf', label: '13. Organic BSF Batches', count: bsfRecords.length },
                      { key: 'inventory', label: '14. Storage Warehouse stocks', count: inventory.length },
                      { key: 'vet', label: '15. Clinical Treatments', count: vetRecords.length }
                    ].map((sec) => (
                      <label
                        key={sec.key}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          selectedSections[sec.key]
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSections[sec.key] || false}
                            onChange={(e) => {
                              setSelectedSections((prev) => ({
                                ...prev,
                                [sec.key]: e.target.checked
                              }));
                            }}
                            className="rounded-sm text-emerald-950 border-slate-300 focus:ring-emerald-500 w-3.5 h-3.5"
                          />
                          <span className="capitalize text-[11px] font-sans pr-2">{sec.label.toLowerCase()}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 border bg-white font-mono text-slate-600 shrink-0 font-bold">
                          {sec.count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden lg:block">
                  Compiling {Object.values(selectedSections).filter(Boolean).length} of 15 Active modules
                </div>
              </div>

              {/* Right Pane: Document Preview Container */}
              <div className="p-8 overflow-y-auto flex-1 bg-white max-h-[70vh] lg:max-h-[75vh] space-y-6" id="printable-area">
                {showPdfGuide && (
                  <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-4 text-amber-950 font-sans print:hidden animate-fade-in relative z-10 shadow-sm mb-6">
                    <div className="p-2.5 bg-amber-100 rounded-xl shrink-0 mt-0.5">
                      <FileDown size={20} className="text-amber-800" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-950">PDF Document Export Ready</h4>
                        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mt-0.5">Active modules: {Object.values(selectedSections).filter(Boolean).length} sections compiled</p>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900 font-sans">
                        We have optimized the layout for professional, high-fidelity PDF outputs. Follow these three steps in the system dialog:
                      </p>
                      <ol className="text-[10px] text-amber-850 list-decimal pl-4 space-y-1.5 font-bold font-sans">
                        <li>
                          Change the <span className="bg-amber-100 px-1 py-0.5 rounded">Destination</span> to <span className="text-amber-950 underline italic">Save as PDF</span>.
                        </li>
                        <li>
                          In the "More Settings" drilldown, ensure <span className="bg-amber-100 px-1 py-0.5 rounded">Background graphics</span> is <span className="text-amber-950 font-black">CHECKED</span> (to show labels & striping).
                        </li>
                        <li>
                          Click the blue <span className="bg-amber-200 px-1 py-0.5 rounded">Save</span> button at the bottom of the printing prompt.
                        </li>
                      </ol>
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer m-0"
                        >
                          Trigger PDF Save
                        </button>
                        <button
                          onClick={() => setShowPdfGuide(false)}
                          className="px-3 py-2 border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-xl transition-all cursor-pointer m-0"
                        >
                          Cancel Export
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formal Letterhead */}
                <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1">
                  <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase font-mono">JR FARM COOPERATIVE ESTATE</h1>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                    Sovereign Agricultural compliance. GlobalGAP Registered Plot No. KT-205A
                  </p>
                  <div className="pt-2 text-xs text-slate-500 font-bold font-mono">
                    <span>Authorized Comptroller: Dr. Devin Omwenga</span> • <span>Generated: {new Date().toLocaleString()}</span>
                  </div>
                </div>

                {/* High-Level P&L Summary Cards for print */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">All-time Milk Compiled</span>
                    <h3 className="text-xl font-black font-mono text-slate-800 mt-1">
                      {milkRecords.reduce((sum, r) => sum + r.am + r.pm, 0).toFixed(1)} L
                    </h3>
                  </div>
                  <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">All-time Tea Volumes</span>
                    <h3 className="text-xl font-black font-mono text-slate-800 mt-1">
                      {totalTeaQty.toLocaleString()} KG
                    </h3>
                  </div>
                  <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">P&L Operating Balance</span>
                    <h3 className="text-xl font-black font-mono text-emerald-800 mt-1">
                      Ksh {netPl.toLocaleString()}
                    </h3>
                  </div>
                </div>

                {/* Sections Compilation Stack */}
                <div className="space-y-8 pt-4">
                  {Object.values(selectedSections).filter(Boolean).length === 0 && (
                    <div className="py-20 text-center text-slate-400 space-y-3">
                      <FileText className="mx-auto text-slate-300 animate-pulse" size={48} />
                      <p className="font-black text-xs uppercase tracking-widest font-sans">No Report Sections Compiled</p>
                      <p className="text-[10px] text-slate-400 font-medium font-sans">Toggle section blocks in the composer panel to preview or export.</p>
                    </div>
                  )}

                  {/* 1. Staff deployment List */}
                  {selectedSections.staff && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>1. Staff Deployment Schedule</span>
                        <span className="text-[9px] font-mono text-slate-400">({staffList.length} staff)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Name</th>
                            <th className="p-1">Section</th>
                            <th className="p-1">Morning Shift</th>
                            <th className="p-1">Afternoon Shift</th>
                            <th className="p-1 text-center">Duty Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffList.map((st) => (
                            <tr key={st.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-bold text-slate-800">{st.name}</td>
                              <td className="p-1.5">{st.unit}</td>
                              <td className="p-1.5 text-slate-500">{st.shiftMorning}</td>
                              <td className="p-1.5 text-slate-500">{st.shiftAfternoon}</td>
                              <td className="p-1.5 text-center font-bold">{st.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2. Milk harvest yields */}
                  {selectedSections.milk && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>2. Dairy Production Log</span>
                        <span className="text-[9px] font-mono text-slate-400">({milkRecords.length} records)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Cow Tag ID</th>
                            <th className="p-1 text-right">AM Liters</th>
                            <th className="p-1 text-right">PM Liters</th>
                            <th className="p-1 text-right">Total Yield</th>
                            <th className="p-1">Milker</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milkRecords.slice(0, 10).map((m, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{m.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">{m.id}</td>
                              <td className="p-1.5 text-right font-mono">{m.am.toFixed(1)}</td>
                              <td className="p-1.5 text-right font-mono">{m.pm.toFixed(1)}</td>
                              <td className="p-1.5 text-right font-mono font-bold">{(m.am + m.pm).toFixed(1)} L</td>
                              <td className="p-1.5">{m.staff}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {milkRecords.length > 10 && (
                        <p className="text-[9px] text-slate-400 italic font-mono">* Only showing the 10 most recent milking trials of {milkRecords.length} total.</p>
                      )}
                    </div>
                  )}

                  {/* 3. Insemination & Breeding */}
                  {selectedSections.ai && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>3. Artificial Insemination & Breeding</span>
                        <span className="text-[9px] font-mono text-slate-400">({aiRecords.length} cycles)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Cow Tag ID</th>
                            <th className="p-1">Service Date</th>
                            <th className="p-1">Bull Name/Semen Ref</th>
                            <th className="p-1">Gestation Expected Due</th>
                            <th className="p-1">Pregnancy Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiRecords.slice(0, 10).map((ai, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-1.5 font-bold text-slate-800">{ai.cowId}</td>
                              <td className="p-1.5 font-mono text-slate-400">{ai.date}</td>
                              <td className="p-1.5 italic text-slate-600">{ai.bull}</td>
                              <td className="p-1.5 font-mono font-bold">{ai.due}</td>
                              <td className="p-1.5">{ai.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {aiRecords.length > 10 && (
                        <p className="text-[9px] text-slate-400 italic font-mono">* Showing 10 most recent of {aiRecords.length} AI cycles.</p>
                      )}
                    </div>
                  )}

                  {/* 4. Tea harvest */}
                  {selectedSections.tea && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>4. Tea Exports Harvest & Deliveries</span>
                        <span className="text-[9px] font-mono text-slate-400">({teaRecords.length} dispatches)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Plucking Ref</th>
                            <th className="p-1">Factory Buyer</th>
                            <th className="p-1 text-right">Harvest Weight</th>
                            <th className="p-1 text-right">Gross Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teaRecords.slice(0, 10).map((t, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{t.date}</td>
                              <td className="p-1.5 font-bold text-slate-850">{t.ref}</td>
                              <td className="p-1.5">{t.buyer || 'Chinga KTDA'}</td>
                              <td className="p-1.5 text-right font-mono font-bold">{t.qty.toLocaleString()} KG</td>
                              <td className="p-1.5 text-right font-mono text-emerald-800">Ksh {(t.totalSales || (t.qty * (t.pricePerKg ?? 58))).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {teaRecords.length > 10 && (
                        <p className="text-[9px] text-slate-400 italic font-mono">* Showing 10 most recent records of {teaRecords.length} total.</p>
                      )}
                    </div>
                  )}

                  {/* 5. Avocado Grading */}
                  {selectedSections.avo && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>5. Avocado Export Grading & Logistics</span>
                        <span className="text-[9px] font-mono text-slate-400">({avoRecords.length} records)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Shipping Ref</th>
                            <th className="p-1 text-right">Grade A (Boxes)</th>
                            <th className="p-1 text-right">Grade B (Boxes)</th>
                            <th className="p-1 text-right">Reject (KG)</th>
                            <th className="p-1 text-right">Gross proceeds</th>
                          </tr>
                        </thead>
                        <tbody>
                          {avoRecords.slice(0, 10).map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{item.date}</td>
                              <td className="p-1.5 font-bold text-slate-850">{item.ref}</td>
                              <td className="p-1.5 text-right font-mono">{item.gradeA}</td>
                              <td className="p-1.5 text-right font-mono">{item.gradeB}</td>
                              <td className="p-1.5 text-right font-mono">{item.reject}</td>
                              <td className="p-1.5 text-right font-mono font-bold text-emerald-850">
                                Ksh {(item.totalSales || ((item.gradeA * (item.priceGradeA ?? 1500)) + (item.gradeB * (item.priceGradeB ?? 850)) + (item.reject * (item.priceReject ?? 38)))).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {avoRecords.length > 10 && (
                        <p className="text-[9px] text-slate-400 italic font-mono">* Showing 10 most recent of {avoRecords.length} Avocado shipments.</p>
                      )}
                    </div>
                  )}

                  {/* 6. Crop Sales */}
                  {selectedSections.cropSales && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>6. Local Commodities cash transactions</span>
                        <span className="text-[9px] font-mono text-slate-400">({cropSales.length} trades)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Commodity Crop</th>
                            <th className="p-1">Quantity</th>
                            <th className="p-1 text-right">Price per Unit</th>
                            <th className="p-1 text-right">Gross Revenue</th>
                            <th className="p-1">Buyer Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cropSales.slice(0, 10).map((cs, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{cs.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">{cs.crop}</td>
                              <td className="p-1.5 italic">{cs.qty} {cs.unit}</td>
                              <td className="p-1.5 text-right font-mono">Ksh {cs.pricePerUnit}</td>
                              <td className="p-1.5 text-right font-mono font-bold text-emerald-850">Ksh {cs.totalSales.toLocaleString()}</td>
                              <td className="p-1.5">{cs.buyer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 7. Financial Ledger */}
                  {selectedSections.financials && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>7. Operational accounting General Ledger</span>
                        <span className="text-[9px] font-mono text-slate-400">({financials.length} journals)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Reference & description</th>
                            <th className="p-1">Accounting Type</th>
                            <th className="p-1 text-right">Amount (Ksh)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financials.slice(0, 10).map((f) => (
                            <tr key={f.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{f.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">
                                {f.category} <span className="text-[10px] text-slate-450 font-medium italic">({f.description})</span>
                              </td>
                              <td className="p-1.5 uppercase font-mono font-black text-[10px]">
                                <span className={f.type === 'income' ? 'text-emerald-705' : 'text-amber-805'}>
                                  {f.type}
                                </span>
                              </td>
                              <td className={`p-1.5 text-right font-mono font-bold ${f.type === 'income' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                Ksh {f.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 8. Spray Compliance and Quarantines */}
                  {selectedSections.spray && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>8. Agrochemical Spray Compliance & Quarantines</span>
                        <span className="text-[9px] font-mono text-slate-400">({sprayRecords.length} treatments)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Plot Section</th>
                            <th className="p-1">Chemical Brand</th>
                            <th className="p-1 text-center font-mono">PHI Quarantine</th>
                            <th className="p-1">Target pest</th>
                            <th className="p-1">Safe pick date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sprayRecords.map((s) => (
                            <tr key={s.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-bold text-slate-800">{s.block}</td>
                              <td className="p-1.5 italic">{s.chemical}</td>
                              <td className="p-1.5 text-center font-mono font-bold">{s.phi} Days</td>
                              <td className="p-1.5">{s.target}</td>
                              <td className="p-1.5 font-mono font-bold text-green-700">{s.safeDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 9. Registered field Plots */}
                  {selectedSections.fields && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>9. Registered Blocks & Silage Fields Directory</span>
                        <span className="text-[9px] font-mono text-slate-400">({fields.length} plots)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Plot ID</th>
                            <th className="p-1">Block Name</th>
                            <th className="p-1">Primary Feed Crop</th>
                            <th className="p-1 text-right">Size (Acres)</th>
                            <th className="p-1 text-center">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((f) => (
                            <tr key={f.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{f.id}</td>
                              <td className="p-1.5 font-bold text-slate-800">{f.blockName}</td>
                              <td className="p-1.5 italic">{f.cropType}</td>
                              <td className="p-1.5 text-right font-mono font-bold">{f.acreage} Acres</td>
                              <td className="p-1.5 text-center font-bold text-[10px] text-slate-600">{f.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 10. Poultry & Canines */}
                  {selectedSections.livestock && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>10. Poultry Eggs & Canine Protection assets</span>
                        <span className="text-[9px] font-mono text-slate-400">({livestock.length} records)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date Logged</th>
                            <th className="p-1">Asset Group</th>
                            <th className="p-1">Details Classification</th>
                            <th className="p-1">Activity</th>
                            <th className="p-1">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {livestock.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{item.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">{item.name} <span className="text-[10px] text-slate-450 italic">({item.type})</span></td>
                              <td className="p-1.5">{item.countOrBreed}</td>
                              <td className="p-1.5 font-bold text-slate-700">{item.activity}</td>
                              <td className="p-1.5 text-slate-500 italic">{item.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 11. Goats Milk registers */}
                  {selectedSections.goats && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>11. Goats Dairy herd & lactation logs</span>
                        <span className="text-[9px] font-mono text-slate-400">({goatRecords.length} records)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Tag/Collar ID</th>
                            <th className="p-1">Breed Class</th>
                            <th className="p-1">Classification</th>
                            <th className="p-1 text-right">Yield (Liters)</th>
                            <th className="p-1">Observations</th>
                          </tr>
                        </thead>
                        <tbody>
                          {goatRecords.slice(0, 10).map((gt) => (
                            <tr key={gt.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{gt.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">{gt.tagId}</td>
                              <td className="p-1.5 italic text-slate-500">{gt.breed}</td>
                              <td className="p-1.5">{gt.purpose}</td>
                              <td className="p-1.5 text-right font-mono font-bold text-slate-800">{gt.milkYieldLiters !== undefined ? `${gt.milkYieldLiters} L` : 'N/A'}</td>
                              <td className="p-1.5 font-medium">{gt.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 12. Liquidfed Calves log */}
                  {selectedSections.calves && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>12. Nursery young calf nutrition logs</span>
                        <span className="text-[9px] font-mono text-slate-400">({calfRecords.length} records)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date Logged</th>
                            <th className="p-1">Calf ID</th>
                            <th className="p-1">Mother Cow ID</th>
                            <th className="p-1 text-right">Liquid Milk Intake</th>
                            <th className="p-1">Weaned Status</th>
                            <th className="p-1">Clinical Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calfRecords.slice(0, 10).map((cf) => (
                            <tr key={cf.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{cf.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">{cf.calfId}</td>
                              <td className="p-1.5 italic text-slate-505">{cf.damId}</td>
                              <td className="p-1.5 text-right font-mono font-bold">{cf.milkIntakeLiters} Liters</td>
                              <td className="p-1.5 font-bold">{cf.weaned ? 'WEANED' : 'active Nursery'}</td>
                              <td className="p-1.5 italic text-slate-500">{cf.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 13. Black Soldier Fly Cycles */}
                  {selectedSections.bsf && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>13. organic black Soldier Fly (BSF) Larval cycles</span>
                        <span className="text-[9px] font-mono text-slate-400">({bsfRecords.length} batches)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Date</th>
                            <th className="p-1">Batch ID</th>
                            <th className="p-1">Substrate Type</th>
                            <th className="p-1 text-center font-mono">Inoculated</th>
                            <th className="p-1 text-right">larvae Harvested</th>
                            <th className="p-1">Stage status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bsfRecords.map((batch) => (
                            <tr key={batch.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{batch.date}</td>
                              <td className="p-1.5 font-bold text-slate-850">{batch.batchId}</td>
                              <td className="p-1.5 italic">{batch.substrateType}</td>
                              <td className="p-1.5 text-center font-mono">{batch.inoculationDate}</td>
                              <td className="p-1.5 text-right font-mono font-bold text-yellow-800">{batch.larvaeHarvestedKg} KG</td>
                              <td className="p-1.5 font-mono font-semibold text-[10px] text-slate-550">{batch.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 14. Stock reserves */}
                  {selectedSections.inventory && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>14. Storage Warehouse stocks reserves</span>
                        <span className="text-[9px] font-mono text-slate-400">({inventory.length} items)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Item ID</th>
                            <th className="p-1">Name</th>
                            <th className="p-1">Category Classification</th>
                            <th className="p-1 text-right">Available stock</th>
                            <th className="p-1">Safety level</th>
                            <th className="p-1 text-center">Alert status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((item) => {
                            const isLow = item.quantity <= item.minStock;
                            return (
                              <tr key={item.id} className="border-b border-slate-100">
                                <td className="p-1.5 font-mono text-slate-400">{item.id}</td>
                                <td className="p-1.5 font-bold text-slate-800">{item.name}</td>
                                <td className="p-1.5 italic text-slate-600">{item.category}</td>
                                <td className="p-1.5 text-right font-mono font-bold">{item.quantity} {item.unit}</td>
                                <td className="p-1.5 text-right font-mono text-slate-450">{item.minStock}</td>
                                <td className="p-1.5 text-center text-[10px] font-black">
                                  {isLow ? <span className="text-amber-705">RESTOCK</span> : <span className="text-emerald-705">SECURE</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 15. vet clinicals */}
                  {selectedSections.vet && (
                    <div className="space-y-2">
                       <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                        <span>15. Clinical veterinary treatments & diagnostics</span>
                        <span className="text-[9px] font-mono text-slate-400">({vetRecords.length} entries)</span>
                      </h5>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                            <th className="p-1">Incident Date</th>
                            <th className="p-1">Animal Cow Tag</th>
                            <th className="p-1">Treatment Type</th>
                            <th className="p-1">clinical Diagnosis / Intervention</th>
                            <th className="p-1 text-right">Authorized Cost</th>
                            <th className="p-1">Inoculator Vet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vetRecords.map((vet) => (
                            <tr key={vet.id} className="border-b border-slate-100">
                              <td className="p-1.5 font-mono text-slate-400">{vet.date}</td>
                              <td className="p-1.5 font-bold text-slate-800">{vet.cowId}</td>
                              <td className="p-1.5 italic text-slate-500">{vet.type}</td>
                              <td className="p-1.5 font-mono">{vet.treatment} <span className="text-[10px] text-slate-500 block">{vet.notes}</span></td>
                              <td className="p-1.5 text-right font-mono font-black">Ksh {vet.cost.toLocaleString()}</td>
                              <td className="p-1.5">{vet.staff}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Sign-off Stamps */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-xs shrink-0">
                  <div className="border-t border-slate-400 pt-3 text-center space-y-1">
                    <div className="h-10"></div>
                    <span className="font-mono font-bold block">Mosoti (Senior Herdsman)</span>
                    <span className="text-[10px] text-slate-450 block uppercase">Operations Inspector Sig</span>
                  </div>
                  <div className="border-t border-slate-400 pt-3 text-center space-y-1">
                    <div className="h-10"></div>
                    <span className="font-mono font-bold block">Dr. Devin Omwenga (Overall Farm Manager)</span>
                    <span className="text-[10px] text-slate-450 block uppercase">Sovereign Superintendent Sig</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all m-0"
              >
                Close Preview
              </button>
              <button
                onClick={handleExportCSV}
                className="px-5 py-3 bg-emerald-100 border border-emerald-200 text-emerald-950 font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-emerald-200 transition-all m-0 cursor-pointer"
              >
                <Download size={14} /> Download Selected (CSV)
              </button>
              <button
                onClick={() => {
                  setShowPdfGuide(true);
                  const printArea = document.getElementById('printable-area');
                  if (printArea) {
                    printArea.scrollTop = 0;
                  }
                }}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-2 transition-all m-0 cursor-pointer shadow-sm border border-amber-600/15"
              >
                <FileDown size={14} /> Download Selected (PDF)
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-all m-0 cursor-pointer"
              >
                <Printer size={14} /> Print Selected Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
