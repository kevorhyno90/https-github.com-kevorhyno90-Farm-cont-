import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  StaffMember,
  Ingredient,
  MilkingRecord,
  AIRecord,
  TeaRecord,
  AvocadoRecord,
  FinancialRecord,
  SprayRecord,
  MilkOutflowRecord,
  Todo,
  FieldRecord,
  LivestockRecord,
  InventoryItem,
  StaffOffRecord,
  Cow,
  VetRecord,
  GoatRecord,
  CalfRecord,
  BsfRecord,
  CropOpRecord,
  CropSaleRecord,
  AnimalSaleRecord,
  MortalityRecord,
  ActivityLogEntry,
  SilageRecord,
  HeiferRecord,
  PoultryRecord,
  QuarantineRecord,
  SemenInventoryItem,
  AzollaRecord
} from '../types';

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
  INITIAL_CROP_SALES,
  INITIAL_ANIMAL_SALES,
  INITIAL_MORTALITY_RECORDS,
  INITIAL_MILK_OUTFLOW_RECORDS,
  INITIAL_SEMEN_INVENTORY
} from '../initialData';
import { offsetIsoDate, toIsoDate } from '../utils/dateHelper';
import { nativeSetItem } from '../utils/nativeStorage';

interface FarmContextType {
  staffList: StaffMember[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  milkRecords: MilkingRecord[];
  setMilkRecords: React.Dispatch<React.SetStateAction<MilkingRecord[]>>;
  aiRecords: AIRecord[];
  setAiRecords: React.Dispatch<React.SetStateAction<AIRecord[]>>;
  teaRecords: TeaRecord[];
  setTeaRecords: React.Dispatch<React.SetStateAction<TeaRecord[]>>;
  avoRecords: AvocadoRecord[];
  setAvoRecords: React.Dispatch<React.SetStateAction<AvocadoRecord[]>>;
  financials: FinancialRecord[];
  setFinancials: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
  sprayRecords: SprayRecord[];
  setSprayRecords: React.Dispatch<React.SetStateAction<SprayRecord[]>>;
  milkOutflows: MilkOutflowRecord[];
  setMilkOutflows: React.Dispatch<React.SetStateAction<MilkOutflowRecord[]>>;
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  fields: FieldRecord[];
  setFields: React.Dispatch<React.SetStateAction<FieldRecord[]>>;
  livestock: LivestockRecord[];
  setLivestock: React.Dispatch<React.SetStateAction<LivestockRecord[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  staffOffRecords: StaffOffRecord[];
  setStaffOffRecords: React.Dispatch<React.SetStateAction<StaffOffRecord[]>>;
  cows: Cow[];
  setCows: React.Dispatch<React.SetStateAction<Cow[]>>;
  vetRecords: VetRecord[];
  setVetRecords: React.Dispatch<React.SetStateAction<VetRecord[]>>;
  goatRecords: GoatRecord[];
  setGoatRecords: React.Dispatch<React.SetStateAction<GoatRecord[]>>;
  calfRecords: CalfRecord[];
  setCalfRecords: React.Dispatch<React.SetStateAction<CalfRecord[]>>;
  bsfRecords: BsfRecord[];
  setBsfRecords: React.Dispatch<React.SetStateAction<BsfRecord[]>>;
  cropOps: CropOpRecord[];
  setCropOps: React.Dispatch<React.SetStateAction<CropOpRecord[]>>;
  cropSales: CropSaleRecord[];
  setCropSales: React.Dispatch<React.SetStateAction<CropSaleRecord[]>>;
  animalSales: AnimalSaleRecord[];
  setAnimalSales: React.Dispatch<React.SetStateAction<AnimalSaleRecord[]>>;
  mortalities: MortalityRecord[];
  setMortalities: React.Dispatch<React.SetStateAction<MortalityRecord[]>>;
  activityLogs: ActivityLogEntry[];
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
  silageRecords: SilageRecord[];
  setSilageRecords: React.Dispatch<React.SetStateAction<SilageRecord[]>>;
  heiferRecords: HeiferRecord[];
  setHeiferRecords: React.Dispatch<React.SetStateAction<HeiferRecord[]>>;
  poultryRecords: PoultryRecord[];
  setPoultryRecords: React.Dispatch<React.SetStateAction<PoultryRecord[]>>;
  quarantineRecords: QuarantineRecord[];
  setQuarantineRecords: React.Dispatch<React.SetStateAction<QuarantineRecord[]>>;
  semenInventory: SemenInventoryItem[];
  setSemenInventory: React.Dispatch<React.SetStateAction<SemenInventoryItem[]>>;
  azollaRecords: AzollaRecord[];
  setAzollaRecords: React.Dispatch<React.SetStateAction<AzollaRecord[]>>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const REMOTE_SYNC_APPLIED_EVENT = 'jr-farm-remote-sync-applied';

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isRemoteHydrationRef = useRef(false);

  const persistJson = (key: string, value: any) => {
    const serialized = JSON.stringify(value);
    if (isRemoteHydrationRef.current) {
      nativeSetItem(key, serialized);
      return;
    }

    localStorage.setItem(key, serialized);
  };

  const reloadFromLocalStorage = () => {
    isRemoteHydrationRef.current = true;

    try {
      const loadJson = <T,>(key: string, fallback: T): T => {
        const saved = localStorage.getItem(key);
        if (!saved) return fallback;

        try {
          return JSON.parse(saved) as T;
        } catch {
          return fallback;
        }
      };

      setStaffList(loadJson('jr_farm_staff', INITIAL_STAFF));
      setIngredients(loadJson('jr_farm_ingredients', INITIAL_INGREDIENTS));
      setMilkRecords(loadJson('jr_farm_milk', INITIAL_MILK_RECORDS));
      setAiRecords(loadJson('jr_farm_ai', INITIAL_AI_RECORDS));
      setTeaRecords(loadJson('jr_farm_tea', INITIAL_TEA_RECORDS));
      setAvoRecords(loadJson('jr_farm_avo', INITIAL_AVOCADO_RECORDS));
      setFinancials(loadJson('jr_farm_financials', INITIAL_FINICAL_RECORDS));
      setSprayRecords(loadJson('jr_farm_sprays', INITIAL_SPRAY_RECORDS));
      setMilkOutflows(loadJson('jr_farm_milk_outflows', INITIAL_MILK_OUTFLOW_RECORDS));
      setTodos(loadJson('jr_farm_todos', INITIAL_TODOS));
      setFields(loadJson('jr_farm_fields', INITIAL_FIELDS));
      setLivestock(loadJson('jr_farm_livestock', INITIAL_LIVESTOCK));
      setInventory(loadJson('jr_farm_inventory', INITIAL_INVENTORY));
      setStaffOffRecords(loadJson('jr_farm_staff_off', INITIAL_STAFF_OFF_RECORDS));
      setCows(loadJson('jr_farm_cows', INITIAL_COWS));
      setVetRecords(loadJson('jr_farm_vets', INITIAL_VET_RECORDS));
      setGoatRecords(loadJson('jr_farm_goats', INITIAL_GOAT_RECORDS));
      setCalfRecords(loadJson('jr_farm_calves', INITIAL_CALF_RECORDS));
      setBsfRecords(loadJson('jr_farm_bsfs', INITIAL_BSF_RECORDS));
      setCropOps(loadJson('jr_farm_crop_ops', INITIAL_CROP_OP_RECORDS));
      setCropSales(loadJson('jr_farm_crop_sales', INITIAL_CROP_SALES));
      setAnimalSales(loadJson('jr_farm_animal_sales', INITIAL_ANIMAL_SALES));
      setMortalities(loadJson('jr_farm_mortalities', INITIAL_MORTALITY_RECORDS));
      setActivityLogs(loadJson('jr_farm_activity_logs', []));
      setSilageRecords(loadJson('jr_farm_silages', []));
      setHeiferRecords(loadJson('jr_farm_heifers', []));
      setPoultryRecords(loadJson('jr_farm_poultries', []));
      setQuarantineRecords(loadJson('jr_farm_quarantines', []));
      setSemenInventory(loadJson('jr_farm_semen_inventory', INITIAL_SEMEN_INVENTORY));
      setAzollaRecords(loadJson('jr_farm_azolla', []));
    } finally {
      window.setTimeout(() => {
        isRemoteHydrationRef.current = false;
      }, 0);
    }
  };

  useEffect(() => {
    const handleRemoteSyncApplied = () => {
      reloadFromLocalStorage();
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSyncApplied);
    window.addEventListener('storage', handleRemoteSyncApplied);

    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSyncApplied);
      window.removeEventListener('storage', handleRemoteSyncApplied);
    };
  }, []);

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('jr_farm_staff');
    let parsed: StaffMember[] = saved ? JSON.parse(saved) : INITIAL_STAFF;
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
    const parsed = saved ? JSON.parse(saved) : INITIAL_MILK_RECORDS;
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        const debtsList = item.debtsList || (item.debtsKsh && item.debtCustomer ? [{ debtor: item.debtCustomer, amount: Number(item.debtsKsh) }] : []);
        const debtsKsh = debtsList.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0) || Number(item.debtsKsh || 0);
        return {
          ...item,
          debtsList,
          debtsKsh,
          milkUsedByCalf: item.milkUsedByCalf !== undefined ? Number(item.milkUsedByCalf) : undefined
        };
      });
    }
    return INITIAL_MILK_RECORDS;
  });

  const [aiRecords, setAiRecords] = useState<AIRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_ai');
    return saved ? JSON.parse(saved) : INITIAL_AI_RECORDS;
  });

  const [teaRecords, setTeaRecords] = useState<TeaRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_tea');
    const parsed = saved ? JSON.parse(saved) : INITIAL_TEA_RECORDS;
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        qty: Number(item.qty ?? 0),
        ref: item.ref || 'KTDA-UNKNOWN',
        date: item.date || toIsoDate(),
        pricePerKg: Number(item.pricePerKg ?? 58),
        buyer: item.buyer || 'Chinga KTDA Factory',
        totalSales: Number(item.totalSales ?? (Number(item.qty ?? 0) * Number(item.pricePerKg ?? 58)))
      }));
    }
    return INITIAL_TEA_RECORDS;
  });

  const [avoRecords, setAvoRecords] = useState<AvocadoRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_avo');
    const parsed = saved ? JSON.parse(saved) : INITIAL_AVOCADO_RECORDS;
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        const grade1Kg = Number(item.grade1Kg ?? item.gradeA ?? item.grade1 ?? 0);
        const grade1PricePerKg = Number(item.grade1PricePerKg ?? item.priceGradeA ?? 150);
        const rejectKg = Number(item.rejectKg ?? item.rejects ?? item.reject ?? 0);
        const priceForRejects = Number(item.priceForRejects ?? item.priceRejects ?? 35);
        const totalSales = Number(item.totalSales ?? ((grade1Kg * grade1PricePerKg) + (rejectKg * priceForRejects)));
        return {
          ref: item.ref || 'EXP-UNKNOWN',
          date: item.date || toIsoDate(),
          grade1Kg,
          grade1PricePerKg,
          rejectKg,
          priceForRejects,
          grade1Buyer: item.grade1Buyer || item.buyerGradeA || 'Kakuzi Agribusiness Exporters',
          rejectBuyer: item.rejectBuyer || item.buyerRejects || 'Local Puree Processor',
          paymentMode: item.paymentMode || item.paymentModeNextHarvestSeason || 'Deferred',
          nextHarvestSeason: item.nextHarvestSeason || 'October - December',
          paymentModeNextHarvestSeason: item.paymentModeNextHarvestSeason || 'Deferred',
          debts: Number(item.debts ?? 0),
          notes: item.notes || '',
          totalSales
        };
      });
    }
    return INITIAL_AVOCADO_RECORDS;
  });

  const [financials, setFinancials] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_financials');
    return saved ? JSON.parse(saved) : INITIAL_FINICAL_RECORDS;
  });

  const [sprayRecords, setSprayRecords] = useState<SprayRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_sprays');
    return saved ? JSON.parse(saved) : INITIAL_SPRAY_RECORDS;
  });

  const [milkOutflows, setMilkOutflows] = useState<MilkOutflowRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_milk_outflows');
    return saved ? JSON.parse(saved) : INITIAL_MILK_OUTFLOW_RECORDS;
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

  const [animalSales, setAnimalSales] = useState<AnimalSaleRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_animal_sales');
    return saved ? JSON.parse(saved) : INITIAL_ANIMAL_SALES;
  });

  const [mortalities, setMortalities] = useState<MortalityRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_mortalities');
    return saved ? JSON.parse(saved) : INITIAL_MORTALITY_RECORDS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => {
    const saved = localStorage.getItem('jr_farm_activity_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [silageRecords, setSilageRecords] = useState<SilageRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_silages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'silage-1',
        rawMaterial: 'Maize',
        acres: 2.0,
        calculatedWeightKg: 36000,
        dateMade: offsetIsoDate(-37),
        dateOpened: offsetIsoDate(-11),
        quality: 'Excellent (Golden yellow, lactic acid smell)',
        notes: 'Formic acid inoculant used. Well compacted. No visual moulds.',
        animalsFedCount: 15,
        averageAnimalWeightKg: 450,
        recommendedDailyIntakePerAnimal: 15,
        daysOfFeedAvailable: 160
      }
    ];
  });

  const [heiferRecords, setHeiferRecords] = useState<HeiferRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_heifers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'heifer-1',
        cowId: 'C-083 (Precious)',
        dateLogged: offsetIsoDate(-1),
        weightKg: 295,
        girthCm: 154,
        feedRationType: 'Boma Rhodes + Grower cake concentrate + legumes',
        averageDailyGainGrams: 750,
        breedingReady: true,
        notes: 'Exceeded the 280kg insemination marker. Frame growth is superb. Ready for AI.'
      }
    ];
  });

  const [poultryRecords, setPoultryRecords] = useState<PoultryRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_poultries');
    return saved ? JSON.parse(saved) : [
      {
        id: 'poultry-chick',
        stage: 'Chick',
        batchName: 'Batch G-9 Chicks',
        count: 500,
        dateLogged: offsetIsoDate(-3),
        feedGivenKg: 35,
        feedType: 'Chick Start Crumble',
        mortalityCount: 1,
        waterIntakeLiters: 90,
        vaccinesAdministered: 'Gumboro Booster Dose',
        notes: 'Chicks are active; brooder temperature stands at ~31°C.'
      },
      {
        id: 'poultry-grower',
        stage: 'Grower',
        batchName: 'Batch F-2 Pullets',
        count: 400,
        dateLogged: offsetIsoDate(-2),
        feedGivenKg: 48,
        feedType: 'Growers Mash',
        mortalityCount: 0,
        waterIntakeLiters: 110,
        notes: 'Growing frame is high. Average weight is inside targets (~1.25kg).'
      },
      {
        id: 'poultry-layer',
        stage: 'Layer',
        batchName: 'Batch E-8 Layers',
        count: 600,
        dateLogged: offsetIsoDate(0),
        feedGivenKg: 75,
        feedType: 'Layers High Calcium mash',
        mortalityCount: 0,
        eggCratesHarvested: 17,
        crackedEggsCount: 2,
        waterIntakeLiters: 155,
        percentageProduction: 85,
        notes: 'Laying peak cycle. Excellent calcified egg shells.'
      }
    ];
  });

  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_quarantines');
    return saved ? JSON.parse(saved) : [
      {
        id: 'quar-1',
        animalType: 'Cow',
        animalTagOrBatch: 'H-302 (Milly)',
        dateStarted: offsetIsoDate(-6),
        dateScheduledEnd: offsetIsoDate(8),
        quarantineReason: 'Newly purchased heifer from Nyeri showground',
        symptomsObserved: 'None, routine quarantine protocol for biosecurity',
        quarantineStatus: 'Under Observation',
        vetInCharge: 'Dr. Joseph Ndwiga',
        notes: 'Isolated in Section C Quarantine Pen.'
      }
    ];
  });

  const [semenInventory, setSemenInventory] = useState<SemenInventoryItem[]>(() => {
    const saved = localStorage.getItem('jr_farm_semen_inventory');
    return saved ? JSON.parse(saved) : INITIAL_SEMEN_INVENTORY;
  });

  const [azollaRecords, setAzollaRecords] = useState<AzollaRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_azolla');
    return saved ? JSON.parse(saved) : [];
  });

  // LocalStorage synchronizations
  useEffect(() => { persistJson('jr_farm_staff', staffList); }, [staffList]);
  useEffect(() => { persistJson('jr_farm_ingredients', ingredients); }, [ingredients]);
  useEffect(() => { persistJson('jr_farm_milk', milkRecords); }, [milkRecords]);
  useEffect(() => { persistJson('jr_farm_ai', aiRecords); }, [aiRecords]);
  useEffect(() => { persistJson('jr_farm_tea', teaRecords); }, [teaRecords]);
  useEffect(() => { persistJson('jr_farm_avo', avoRecords); }, [avoRecords]);
  useEffect(() => { persistJson('jr_farm_financials', financials); }, [financials]);
  useEffect(() => { persistJson('jr_farm_sprays', sprayRecords); }, [sprayRecords]);
  useEffect(() => { persistJson('jr_farm_milk_outflows', milkOutflows); }, [milkOutflows]);
  useEffect(() => { persistJson('jr_farm_todos', todos); }, [todos]);
  useEffect(() => { persistJson('jr_farm_fields', fields); }, [fields]);
  useEffect(() => { persistJson('jr_farm_livestock', livestock); }, [livestock]);
  useEffect(() => { persistJson('jr_farm_inventory', inventory); }, [inventory]);
  useEffect(() => { persistJson('jr_farm_staff_off', staffOffRecords); }, [staffOffRecords]);
  useEffect(() => { persistJson('jr_farm_cows', cows); }, [cows]);
  useEffect(() => { persistJson('jr_farm_vets', vetRecords); }, [vetRecords]);
  useEffect(() => { persistJson('jr_farm_goats', goatRecords); }, [goatRecords]);
  useEffect(() => { persistJson('jr_farm_calves', calfRecords); }, [calfRecords]);
  useEffect(() => { persistJson('jr_farm_bsfs', bsfRecords); }, [bsfRecords]);
  useEffect(() => { persistJson('jr_farm_crop_ops', cropOps); }, [cropOps]);
  useEffect(() => { persistJson('jr_farm_crop_sales', cropSales); }, [cropSales]);
  useEffect(() => { persistJson('jr_farm_animal_sales', animalSales); }, [animalSales]);
  useEffect(() => { persistJson('jr_farm_mortalities', mortalities); }, [mortalities]);
  useEffect(() => { persistJson('jr_farm_activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { persistJson('jr_farm_silages', silageRecords); }, [silageRecords]);
  useEffect(() => { persistJson('jr_farm_heifers', heiferRecords); }, [heiferRecords]);
  useEffect(() => { persistJson('jr_farm_poultries', poultryRecords); }, [poultryRecords]);
  useEffect(() => { persistJson('jr_farm_quarantines', quarantineRecords); }, [quarantineRecords]);
  useEffect(() => { persistJson('jr_farm_semen_inventory', semenInventory); }, [semenInventory]);
  useEffect(() => { persistJson('jr_farm_azolla', azollaRecords); }, [azollaRecords]);

  return (
    <FarmContext.Provider
      value={{
        staffList, setStaffList,
        ingredients, setIngredients,
        milkRecords, setMilkRecords,
        aiRecords, setAiRecords,
        teaRecords, setTeaRecords,
        avoRecords, setAvoRecords,
        financials, setFinancials,
        sprayRecords, setSprayRecords,
        milkOutflows, setMilkOutflows,
        todos, setTodos,
        fields, setFields,
        livestock, setLivestock,
        inventory, setInventory,
        staffOffRecords, setStaffOffRecords,
        cows, setCows,
        vetRecords, setVetRecords,
        goatRecords, setGoatRecords,
        calfRecords, setCalfRecords,
        bsfRecords, setBsfRecords,
        cropOps, setCropOps,
        cropSales, setCropSales,
        animalSales, setAnimalSales,
        mortalities, setMortalities,
        activityLogs, setActivityLogs,
        silageRecords, setSilageRecords,
        heiferRecords, setHeiferRecords,
        poultryRecords, setPoultryRecords,
        quarantineRecords, setQuarantineRecords,
        semenInventory, setSemenInventory,
        azollaRecords, setAzollaRecords
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmState = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarmState must be used within a FarmProvider');
  return context;
};
