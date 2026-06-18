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
  Download
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

    // Milking records Section
    csvContent += '--- MILKING RECORDS & BULK SALES ---\n';
    csvContent += 'Date,Cow Tag ID,AM Liters,PM Liters,Total Liters,Price/L (Ksh),Buyer/Purchaser,Total Milk Sales (Ksh),Recorder Officer\n';
    milkRecords.forEach((m) => {
      const p = m.pricePerLiter ?? 0;
      const b = m.buyer ?? 'Domestic Use';
      const s = m.totalSales ?? ((m.am + m.pm) * p);
      csvContent += `${m.date},"${m.id}",${m.am},${m.pm},${(m.am + m.pm).toFixed(2)},${p},"${b}",${s},"${m.staff}"\n`;
    });

    // Tea harvest Section
    csvContent += '\n--- KTDA TEA EXPORTS HARVEST & DELIVERIES ---\n';
    csvContent += 'Date,Plucking Ref,Primary Buyer,Harvest Weight (KG),Price/KG (Ksh),Gross Amount (Ksh)\n';
    teaRecords.forEach((t) => {
      const p = t.pricePerKg ?? 58;
      const b = t.buyer ?? 'Chinga KTDA Factory';
      const s = t.totalSales ?? (t.qty * p);
      csvContent += `${t.date},"${t.ref}","${b}",${t.qty},${p},${s}\n`;
    });

    // Avocado Section
    csvContent += '\n--- AVOCADO EXPORT LOGISTICS ---\n';
    csvContent += 'Date,Shipping Ref,Primary Exporter,Grade A (Boxes),Grade B (Boxes),Reject (KG),Price Grade A (Ksh),Price Grade B (Ksh),Price Reject (Ksh),Gross Revenue (Ksh)\n';
    avoRecords.forEach((item) => {
      const pA = item.priceGradeA ?? 1500;
      const pB = item.priceGradeB ?? 850;
      const pR = item.priceReject ?? 38;
      const b = item.buyer ?? 'Kakuzi Agribusiness Exporters';
      const s = item.totalSales ?? ((item.gradeA * pA) + (item.gradeB * pB) + (item.reject * pR));
      csvContent += `${item.date},"${item.ref}","${b}",${item.gradeA},${item.gradeB},${item.reject},${pA},${pB},${pR},${s}\n`;
    });

    // Other Crops Local Sales Section
    csvContent += '\n--- OTHER FIELD CROPS LOCAL SALES RECORD ---\n';
    csvContent += 'Date,Invoice/Receipt Ref,Local Crop,Quantity Sold,Unit,Rate per Unit (Ksh),Gross Income (Ksh),Primary Buyer\n';
    cropSales.forEach((cs) => {
      csvContent += `${cs.date},"${cs.ref}","${cs.crop}",${cs.qty},"${cs.unit}",${cs.pricePerUnit},${cs.totalSales},"${cs.buyer}"\n`;
    });

    // Financials Section
    csvContent += '\n--- ESTATE OPERATIONS CASHFLOW ---\n';
    csvContent += 'Date,Transaction,Amount (Ksh),Type,Description\n';
    financials.forEach((f) => {
      csvContent += `${f.date},"${f.category}",${f.amount},${f.type.toUpperCase()},"${f.description}"\n`;
    });

    // Spray Section
    csvContent += '\n--- AGROCHEMICAL SPRAY QUARANTINE INDEX ---\n';
    csvContent += 'Date Sprayed,Plot/Section,Chemical Brand,PHI Days,Pest Target,Authorized Harvest Date\n';
    sprayRecords.forEach((s) => {
      csvContent += `${s.date},"${s.block}","${s.chemical}",${s.phi},"${s.target}",${s.safeDate}\n`;
    });

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
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-yellow-500" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">Master Estate Compiler Panel</h3>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">Auditing & Compliance Reports</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-emerald-200 cursor-pointer m-0 border border-emerald-850"
              >
                <X size={16} />
              </button>
            </div>

            {/* Document body for Printing/Previewing */}
            <div className="p-8 overflow-y-auto max-h-[65vh] space-y-6" id="printable-area">
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

              {/* Granular Section 1: Staff Presence */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                  1. Staff Deployment Schedule
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

              {/* Granular Section 2: Milking Records */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                  2. Dairy Production Log
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
                <p className="text-[10px] text-slate-400 italic font-mono">* Only showing the 10 most recent milking trials</p>
              </div>

              {/* Granular Section 3: spray chemical */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                  3. Agrochemical Spray Compliance & Quarantines
                </h5>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                      <th className="p-1">Plot Section</th>
                      <th className="p-1">Chemical Brand</th>
                      <th className="p-1 text-center">PHI Quarantine</th>
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
                        <td className="p-1.5 font-mono font-bold">{s.safeDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signoff Blocks */}
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

            {/* Action buttons footer */}
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
                <Download size={14} /> Download spreadsheet (CSV)
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-all m-0 cursor-pointer"
              >
                <Printer size={14} /> Print Master PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
