import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BookOpen, 
  Sprout, 
  Leaf, 
  Heart, 
  Sparkles, 
  Calculator, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Award, 
  HelpCircle,
  TrendingUp,
  Flame,
  Search,
  CheckCircle,
  Plus,
  Droplets,
  Scale,
  FileText,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Database,
  Calendar,
  DollarSign,
  Sliders,
  Gauge,
  Clipboard,
  Trash2,
  Printer,
  Download
} from 'lucide-react';
import { InventoryItem } from '../types';

interface FarmerAcademyProps {
  inventory?: InventoryItem[];
  setInventory?: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  initialTab?: 'science' | 'crops' | 'livestock' | 'calculators' | 'diagnostics' | 'inventory_deduct' | 'timelines' | 'forecasting';
  sprayRecords?: any[];
  setSprayRecords?: React.Dispatch<React.SetStateAction<any[]>>;
  vetRecords?: any[];
  setVetRecords?: React.Dispatch<React.SetStateAction<any[]>>;
  cows?: any[];
  financials?: any[];
  setFinancials?: React.Dispatch<React.SetStateAction<any[]>>;
  fields?: any[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export default function FarmerAcademy({ 
  inventory, 
  setInventory, 
  initialTab,
  sprayRecords,
  setSprayRecords,
  vetRecords,
  setVetRecords,
  cows,
  financials,
  setFinancials,
  fields,
  onTriggerSectionReport
}: FarmerAcademyProps) {
  const formatCurrentTimestamp = () => {
    const datePart = new Date().toISOString().split('T')[0];
    const timePart = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return `${datePart} ${timePart}`;
  };

  const fieldRecords = fields;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'science' | 'crops' | 'livestock' | 'calculators' | 'diagnostics' | 'inventory_deduct' | 'timelines' | 'forecasting'>('science');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Local inventory backing if props not provided
  const [localInventory, setLocalInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('jr_farm_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const currentInventory = inventory || localInventory;

  const updateInventoryStorage = (next: InventoryItem[]) => {
    if (setInventory) {
      setInventory(next);
    } else {
      setLocalInventory(next);
      localStorage.setItem('jr_farm_inventory', JSON.stringify(next));
    }
  };


  // Sub-tabs to detail specific items within categories
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');
 
  // Interactive Quiz States
  const [currentQuizQ, setCurrentQuizQ] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Calculator states
  const [biogasVolume, setBiogasVolume] = useState<number>(2); // target m3 of gas
  const [heatTime, setHeatTime] = useState<string>('06:00');
  const [heatPeriod, setHeatPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [currentMilk, setCurrentMilk] = useState<number>(15);
  const [currentProtein, setCurrentProtein] = useState<number>(14);

  // New upgraded state variables for the 5 Smart Tools
  const [selectedCowId, setSelectedCowId] = useState<string>('');
  const [tool1Message, setTool1Message] = useState<string | null>(null);
  const [tool2Message, setTool2Message] = useState<string | null>(null);
  const [tool3ActiveIngredients, setTool3ActiveIngredients] = useState<string[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [tool4Message, setTool4Message] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [tool5Message, setTool5Message] = useState<string | null>(null);

  // Fertilizer calculator states
  const [calcCrop, setCalcCrop] = useState<string>('maize');
  const [calcAcreage, setCalcAcreage] = useState<number>(1);

  // MILK-TO-FEED PROFIT MARGIN ANALYZER STATES
  const [analyzerMilkYield, setAnalyzerMilkYield] = useState<number>(20);
  const [analyzerMilkPrice, setAnalyzerMilkPrice] = useState<number>(65); // KES per liter
  const [analyzerSilageKg, setAnalyzerSilageKg] = useState<number>(15);
  const [analyzerSilageCost, setAnalyzerSilageCost] = useState<number>(8); // KES/kg
  const [analyzerMealKg, setAnalyzerMealKg] = useState<number>(4);
  const [analyzerMealCost, setAnalyzerMealCost] = useState<number>(45); // KES/kg
  const [analyzerSupplementsKg, setAnalyzerSupplementsKg] = useState<number>(2);
  const [analyzerSupplementsCost, setAnalyzerSupplementsCost] = useState<number>(15); // KES/kg
  const [analyzerIncludeBioslurry, setAnalyzerIncludeBioslurry] = useState<boolean>(true);

  // DIAGNOSTICS TROUBLESHOOTING WIZARD STATES
  const [diagCategory, setDiagCategory] = useState<'crops' | 'livestock'>('crops');
  const [diagSelectedTarget, setDiagSelectedTarget] = useState<string>('tomato');
  const [diagSelectedSymptom, setDiagSelectedSymptom] = useState<string>('');
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [isDiagnoseLoading, setIsDiagnoseLoading] = useState<boolean>(false);
  const [diagnoseError, setDiagnoseError] = useState<string | null>(null);
  const [customDiagResult, setCustomDiagResult] = useState<{
    symptom: string;
    conditionName: string;
    pathogen: string;
    likelihood: 'High' | 'Moderate';
    description: string;
    treatment: string;
    quarantine: string;
    prevention: string;
    isOffline?: boolean;
  } | null>(null);

  // Pipeline integrations & diagnostics history states (Improvements 1, 2, 3, 4)
  const [forecastBreed, setForecastBreed] = useState<'Friesian' | 'Ayrshire' | 'Jersey' | 'Guernsey'>('Friesian');
  const [forecastWeight, setForecastWeight] = useState<number>(550);
  const [forecastFeedQuality, setForecastFeedQuality] = useState<'poor' | 'average' | 'premium'>('average');
  const [forecastBcs, setForecastBcs] = useState<number>(3.0);

  const forecastingCurveData = React.useMemo(() => {
    const fatPct = { Friesian: 3.6, Ayrshire: 4.0, Jersey: 5.2, Guernsey: 4.5 }[forecastBreed];
    const basePeak = { Friesian: 34, Ayrshire: 26, Jersey: 21, Guernsey: 24 }[forecastBreed];
    
    const feedMod = forecastFeedQuality === 'poor' ? 0.75 : (forecastFeedQuality === 'premium' ? 1.15 : 1.0);
    let bcsMod = 1.0;
    if (forecastBcs < 2.5) bcsMod = 0.82;
    else if (forecastBcs > 4.0) bcsMod = 0.88;

    const adjustedPeak = basePeak * feedMod * bcsMod;
    
    const peakWeek = 6;
    const b = 0.18;
    const declineMod = forecastFeedQuality === 'poor' ? 1.35 : (forecastFeedQuality === 'premium' ? 0.75 : 1.0);

    const curve = [];
    for (let w = 1; w <= 44; w++) {
      let yieldVal = 0;
      if (w <= peakWeek) {
        yieldVal = adjustedPeak * Math.pow(w / peakWeek, b) * Math.exp(-b * (w - peakWeek) / peakWeek);
      } else {
        yieldVal = adjustedPeak * Math.pow(w / peakWeek, b) * Math.exp(-b * (w - peakWeek) / peakWeek * declineMod);
      }

      const fcm = yieldVal * (0.4 + 0.15 * fatPct);
      const dmi = 0.0185 * forecastWeight + 0.305 * fcm;

      curve.push({
        week: `Wk ${w}`,
        weekNum: w,
        milkYield: Number(yieldVal.toFixed(1)),
        feedIntake: Number(dmi.toFixed(1))
      });
    }

    const totalMilk = curve.reduce((sum, item) => sum + item.milkYield, 0) * 7;
    const totalFeed = curve.reduce((sum, item) => sum + item.feedIntake, 0) * 7;

    return {
      curve,
      totalMilk,
      totalFeed,
      adjustedPeak: Number(adjustedPeak.toFixed(1))
    };
  }, [forecastBreed, forecastWeight, forecastFeedQuality, forecastBcs]);

  // Pest and Disease Simulator States
  const [simActiveCaseIndex, setSimActiveCaseIndex] = useState<number | null>(null);
  const [simScore, setSimScore] = useState<number>(100);
  const [simStreak, setSimStreak] = useState<number>(0);
  const [simInspectedClues, setSimInspectedClues] = useState<string[]>([]);
  const [simChosenDiagnosis, setSimChosenDiagnosis] = useState<string | null>(null);
  const [simChosenTreatment, setSimChosenTreatment] = useState<string | null>(null);
  const [simFeedback, setSimFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const simCases = React.useMemo(() => [
    {
      id: 1,
      category: 'livestock',
      specimen: 'Ayrshire Purebred (Milking Cow)',
      symptoms: 'High somatic cell count in Bulk Tank Milk test. During milking, the cow kicks when the back quarter is touched, and she looks distressed. The milk from that quarter has tiny white stringy clots.',
      inspectOptions: [
        { key: 'udder', label: 'Perform Udder Palpation', clue: 'The rear-left quarter of the udder is extremely swollen, hot to the touch, and hard (fibrous).' },
        { key: 'cmt', label: 'California Mastitis Test (CMT)', clue: 'The CMT paddle shows deep purple gelation in the rear-left cup, confirming a massive inflammatory reaction.' },
        { key: 'temp', label: 'Measure Body Temperature', clue: 'Rectal temperature is 39.6°C, indicating systemic infection fever.' }
      ],
      diagnoses: [
        'Subclinical Mastitis',
        'Acute Streptococcal Mastitis',
        'Milk Fever (Hypocalcemia)',
        'Ketosis (Acetonemia)'
      ],
      correctDiagnosis: 'Acute Streptococcal Mastitis',
      treatments: [
        'Intramammary antibiotic infusion of Amoxicillin + dry cow therapy',
        'Oral Calcium Borogluconate drench',
        'Intravenous Dextrose 50% solution',
        'Isolate cow and apply warm salt water rubs only'
      ],
      correctTreatment: 'Intramammary antibiotic infusion of Amoxicillin + dry cow therapy',
      feedbackSuccess: 'Outstanding! Acute Streptococcal Mastitis requires immediate targeted intramammary antibiotic infusions to clear the udder infection. Stripping out the bad quarter completely and discarding the milk prevents somatic cell count spike in public sales.',
      feedbackFail: 'Incorrect. While somatic cell count indicates mastitis, treating it with warm rubs or metabolic drenches is insufficient for acute bacterial infections of the mammary tissue. This can lead to permanent quarter blindness.'
    },
    {
      id: 2,
      category: 'crops',
      specimen: 'Tomato Block Alpha (Drip Irrigation)',
      symptoms: 'Older leaves are turning dull yellow, mottled, and speckled. Under close look, there are tiny fine silk-like threads or webs spinning across the stems and leaf junctions.',
      inspectOptions: [
        { key: 'loupe', label: 'Examine leaf underside with loupe', clue: 'Loupe inspection reveals hundreds of microscopic, 8-legged yellowish-green mites crawling and feeding on leaf sap.' },
        { key: 'rh', label: 'Check environmental humidity', clue: 'Relative Humidity is extremely low (35%) and temperature is 32°C. Low moisture accelerates mite hatch cycles.' },
        { key: 'soil', label: 'Soil moisture probe', clue: 'Soil is dry on the top 3 inches; plant is undergoing moisture stress.' }
      ],
      diagnoses: [
        'Tomato Yellow Leaf Curl Virus (TYLCV)',
        'Two-Spotted Spider Mites Infestation',
        'Late Blight fungal damage',
        'Nitrogen nutrient deficiency'
      ],
      correctDiagnosis: 'Two-Spotted Spider Mites Infestation',
      treatments: [
        'Foliar spray of Abamectin miticide + organic copper soap',
        'Apply high nitrogen NPK 23:10:10 fertilizer',
        'Copper Oxychloride spray + pruning',
        'Systemic Imidacloprid drench'
      ],
      correctTreatment: 'Foliar spray of Abamectin miticide + organic copper soap',
      feedbackSuccess: 'Perfect diagnosis! Two-spotted spider mites are sap-sucking arachnids that thrive in hot, dry conditions. Applying Abamectin (a specialized miticide) combined with raising humidity breaks their life cycle effectively.',
      feedbackFail: 'Incorrect. Spider mites are arachnids, meaning standard systemic insecticides (like Imidacloprid) or fertilizers are ineffective and may actually trigger a population surge by killing natural insect predators.'
    },
    {
      id: 3,
      category: 'crops',
      specimen: 'Maize Block Beta (Rainfed Crop)',
      symptoms: 'Ragged, deep, irregular holes in the maize whorls. The center of the leaf whorl contains dark green caterpillars and is filled with moist sawdust-like brown fecal matter (frass).',
      inspectOptions: [
        { key: 'head', label: 'Inspect caterpillar head capsule', clue: 'Close inspection of the caterpillar head shows a highly prominent, white inverted Y-shaped mark.' },
        { key: 'window', label: 'Check leaf margins', clue: 'The margins show extensive windowpane feeding where early-stage larvae ate everything except the transparent upper epidermis.' },
        { key: 'count', label: 'Perform larval count per whorl', clue: 'Averages 3 active larvae per plant, which is well above the economic threshold of 1 larva/plant.' }
      ],
      diagnoses: [
        'Maize Stalk Borer',
        'Fall Armyworm (Spodoptera frugiperda)',
        'African Migratory Locusts',
        'Cutworm infestation'
      ],
      correctDiagnosis: 'Fall Armyworm (Spodoptera frugiperda)',
      treatments: [
        'Apply Emamectin Benzoate or Spinetoram directed inside the whorls at dusk',
        'Broadcast NPK fertilizer directly onto leaves',
        'Spray systemic glyphosate herbicide',
        'Release Bacillus subtilis beneficial fungi to soil'
      ],
      correctTreatment: 'Apply Emamectin Benzoate or Spinetoram directed inside the whorls at dusk',
      feedbackSuccess: 'Superb! Fall Armyworm larvae reside deep inside the whorl. Spraying Emamectin Benzoate at dusk (when caterpillars feed actively) directly down into the whorls ensures contact. General sprays that miss the whorl will fail due to canopy protection.',
      feedbackFail: 'Incorrect. Standard broadcast fertilizer or soil fungi will not control Fall Armyworm. General surface sprays fail because the larvae reside deep inside the protective whorl cavity, feeding on the growing tip.'
    },
    {
      id: 4,
      category: 'livestock',
      specimen: 'Jersey Purebred (Freshly Calved)',
      symptoms: 'Cow calved 18 hours ago. She is unable to stand, weak in her hind legs, and is resting in sternal recumbency with her neck kinked in an S shape, tucking her head into her flank. Her muzzle is dry, and she looks drowsy.',
      inspectOptions: [
        { key: 'temp', label: 'Check body temperature', clue: 'Rectal temperature is subnormal (37.1°C) and her ears feel icy cold.' },
        { key: 'heart', label: 'Measure heart rate & check eyes', clue: 'Heart rate is elevated but weak (92 bpm) and pupils are dilated and unresponsive to light.' },
        { key: 'urine', label: 'Urinalysis for ketones', clue: 'Urinalysis is negative for ketones.' }
      ],
      diagnoses: [
        'Ketosis (Acetonemia)',
        'Hypocalcemia (Milk Fever)',
        'Downer Cow Syndrome (Pelvic Nerve Injury)',
        'Toxic Mastitis'
      ],
      correctDiagnosis: 'Hypocalcemia (Milk Fever)',
      treatments: [
        'Slow intravenous administration of Calcium Borogluconate 23% solution',
        'Intramuscular Penicillin injection',
        'Oral drenching with Propylene Glycol',
        'Force cow to stand using hip clamps'
      ],
      correctTreatment: 'Slow intravenous administration of Calcium Borogluconate 23% solution',
      feedbackSuccess: 'Excellent! Milk Fever is a metabolic calcium deficiency caused by sudden milk synthesis drawing calcium from blood faster than bone mobilization. Injecting Calcium Borogluconate IV slowly (monitoring heart rate, as calcium affects myocardium) saves the cow within minutes.',
      feedbackFail: 'Incorrect. Intramuscular antibiotics or propylene glycol have no effect on subnormal calcium levels. Forcing the cow to stand can cause severe muscle tearing or skeletal fractures.'
    },
    {
      id: 5,
      category: 'crops',
      specimen: 'Hass Avocado Block (Clay Loam Soil)',
      symptoms: 'Tree canopy is pale green and leaves are small, wilted, and falling off, leading to branch dieback. The tree is wilting despite recent heavy rainfall.',
      inspectOptions: [
        { key: 'drainage', label: 'Inspect soil drainage base', clue: 'Soil around the base is heavy, waterlogged clay with highly compacted layers.' },
        { key: 'roots', label: 'Examine feeder roots', clue: 'Feeder roots are dark brown, mushy, rotten, and snap easily, instead of being creamy white and fibrous.' },
        { key: 'bark', label: 'Bark canker check', clue: 'No active bleeding or cankers on the main trunk above ground.' }
      ],
      diagnoses: [
        'Avocado Thrips damage',
        'Phytophthora Cinnamomi (Root Rot)',
        'Fusarium Wilt',
        'Zinc micro-nutrient deficiency'
      ],
      correctDiagnosis: 'Phytophthora Cinnamomi (Root Rot)',
      treatments: [
        'Improve soil drainage + inject tree with Potassium Phosphonate + Trichoderma drench',
        'Spray Copper Oxychloride on foliage',
        'Apply heavy doses of Urea 46% nitrogen fertilizer',
        'Heavy systemic insecticide sprays'
      ],
      correctTreatment: 'Improve soil drainage + inject tree with Potassium Phosphonate + Trichoderma drench',
      feedbackSuccess: 'Outstanding! Phytophthora root rot is caused by a water mold that thrives in heavy compacted soils. Injecting Potassium Phosphonate systemically strengthens tree immune defenses, while Trichoderma drench repopulates soil with beneficial fungi.',
      feedbackFail: 'Incorrect. Copper foliar sprays cannot reach or heal rotted root systems. Applying high-nitrogen Urea in anaerobic soil will accelerate root decay by increasing salt toxicity.'
    }
  ], []);

  const [remediationBlock, setRemediationBlock] = useState<string>('Block Alpha - Tomatoes');
  const [remediationCost, setRemediationCost] = useState<number>(3500);
  const [selectedBovineId, setSelectedBovineId] = useState<string>('COW-01');
  const [selectedPoultryCoop, setSelectedPoultryCoop] = useState<string>('COOP-A');
  const [pipelineSuccessMessage, setPipelineSuccessMessage] = useState<string | null>(null);
  const [diagnosticHistory, setDiagnosticHistory] = useState<Array<{
    id: string;
    timestamp: string;
    specimen: string;
    symptom: string;
    conditionName: string;
    likelihood: string;
    isOffline: boolean;
    pathogen?: string;
    description?: string;
    treatment?: string;
    quarantine?: string;
    prevention?: string;
    deepResearch?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_diagnostic_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'diag-init-1',
          timestamp: formatCurrentTimestamp(),
          specimen: 'cow',
          symptom: 'udder quarters inflamed, milk clotted',
          conditionName: 'Clinical Mastitis',
          likelihood: 'High',
          isOffline: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const getFallbackDeepResearch = (target: string, conditionName: string) => {
    const normCond = (conditionName || '').toLowerCase();
    const tgt = (target || '').toLowerCase();

    if (tgt === 'cow' || tgt === 'cattle') {
      if (normCond.includes('mastitis')) {
        return "Epidemiological research across East African smallholder dairies highlights Streptococcus and Staphylococcus strains as major contributors to subclinical losses. Cold damp resting floors, lack of post-milking teat disinfectants, and improper strip-testing are key structural catalysts leading to chronic udder tissue inflammation.";
      }
      if (normCond.includes('east coast') || normCond.includes('fever') || normCond.includes('tick')) {
        return "East Coast Fever (ECF) remains the leading cause of exotic and crossbred cattle mortality in sub-Saharan Africa. The brown ear tick (Rhipicephalus appendiculatus) acts as the primary vector for Theileria parva. Clinical research shows that early therapeutic intervention with buparvaquone within 48 hours of high-fever detection increases survival rates by over 90%.";
      }
      return "Agronomic & metabolic research reveals that intensive zero-grazing feeding regimes lacking physical structure or buffers often trigger acute rumen fermentation. Managing forage-to-concentrate ratios is key to stabilizing rumen microbes and preventing fatal bloat episodes.";
    }

    if (tgt === 'tomato') {
      if (normCond.includes('curl') || normCond.includes('tylcv')) {
        return "Tomato Yellow Leaf Curl Virus (TYLCV) is a highly destructive geminivirus vectored exclusively by the whitefly (Bemisia tabaci) complex. Research indicates that modern climate shifts and prolonged dry spells have expanded whitefly habitats, raising regional infestation pressures. Complete eradication of weed hosts like Solanum incanum from farm margins is vital.";
      }
      if (normCond.includes('blight')) {
        return "Phytophthora infestans is an extremely aggressive oomycete pathogen capable of wiping out solanaceous fields in under 10 days during high-humidity periods. Studies show that spore proliferation is optimal between 15°C and 22°C with free leaf moisture. Effective control requires rotating chemical modes of action and implementing wide spacing.";
      }
      return "Solanaceous crop agronomy warns against continuous monocropping. Soil-borne bacterial wilt (Ralstonia solanacearum) and root-knot nematodes can build up in the soil matrix, requiring crop rotation with non-host crops like Rhodes grass or brassicas to break the cycle.";
    }

    if (tgt === 'maize') {
      return "Maize Lethal Necrosis (MLN) and Streak Virus are devastating regional viral complexes transmitted by thrips, aphids, and leafhoppers. Research confirms that planting resistant germplasm, maintaining strict weed-free margins, and synchronizing planting dates across blocks are the most effective community-wide preventative strategies.";
    }

    if (tgt === 'chicken' || tgt === 'poultry') {
      return "Epidemiological surveillance of poultry in East Africa indicates that Newcastle Disease and Gumboro (IBD) cause up to 80% mortality in unvaccinated flocks. The virus spreads rapidly via aerosolized droplets and contaminated feed/water. Maintaining strict biosecurity barriers at coop entries and adhering to a strict vaccination timetable are paramount.";
    }

    return "Agronomic and veterinary diagnostic studies confirm that structural biosecurity, sanitary handling, and early pathogen strain identification are the cornerstones of farm productivity. Proper logging of diagnostic cases enables historical analytics, assisting local extension officers in coordinating responses to regional outbreaks.";
  };

  const getFullHistoryItem = (item: any) => {
    if (item.treatment && item.deepResearch) {
      return item;
    }
    const fallback = selectClientFallbackDiagnosis(item.specimen, item.symptom);
    const deepRes = getFallbackDeepResearch(item.specimen, item.conditionName);
    return {
      ...item,
      pathogen: item.pathogen || fallback.pathogen || "General Pathogen / Environmental stressor",
      description: item.description || fallback.description || "General physiological or biological disorder triggered by local conditions.",
      treatment: item.treatment || fallback.treatment || "Isolate specimen and apply recommended systemic therapy.",
      quarantine: item.quarantine || fallback.quarantine || "Withhold sales/use of products during active clinical recovery.",
      prevention: item.prevention || fallback.prevention || "Implement continuous sanitation, biosecurity controls, and vector management.",
      deepResearch: item.deepResearch || deepRes
    };
  };

  // SMART STOCK AUTO-DEDUCT STATES
  const [selectedAutoSop, setSelectedAutoSop] = useState<string>('sop-1');
  const [actionLogs, setActionLogs] = useState<Array<{ id: string; timestamp: string; taskTitle: string; deductionText: string; success: boolean }>>(() => {
    const saved = localStorage.getItem('jr_farm_academy_auto_deduct_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'log-init', timestamp: formatCurrentTimestamp(), taskTitle: 'Stock Engine Active', deductionText: 'Ready for auto-deduction SOP protocols.', success: true }
    ];
  });

  // PHI & BREEDING TIMELINE STATES
  const [phiChemical, setPhiChemical] = useState<string>('copper');
  const [phiDaysElapsed, setPhiDaysElapsed] = useState<number>(3);
  const [gestDaysInseminated, setGestDaysInseminated] = useState<number>(150);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    let pageNumber = 1;
    
    const drawHeader = (pageNum: number) => {
      // Dark slate background brand bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(margin, 12, contentWidth, 24, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('CLINICAL DIAGNOSTICS & CASE ARCHIVE REPORT', margin + 6, 21);
      
      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225); // slate-300
      const generatedDate = new Date().toLocaleString('en-US', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.text(`Generated: ${generatedDate} | Farmer's Academy Portal | Page ${pageNum}`, margin + 6, 28);
    };
    
    const drawFooter = (pageNum: number) => {
      // Simple hairline divider at footer
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 14, margin + contentWidth, pageHeight - 14);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Farmer's Academy Expert Diagnostics & Vet SOP Center", margin, pageHeight - 9);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 9);
    };
    
    drawHeader(pageNumber);
    drawFooter(pageNumber);
    
    let y = 43;
    
    // Aggregated Metrics Banner
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(margin, y, contentWidth, 26, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 26, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('DIAGNOSTIC CASE SYNCHRONIZATION STATS', margin + 6, y + 6);
    
    const totalCases = diagnosticHistory.length;
    
    // Specimen type breakdown
    const cowCount = diagnosticHistory.filter(h => h.specimen === 'cow').length;
    const cropCount = diagnosticHistory.filter(h => ['tomato', 'maize', 'avocado', 'banana'].includes(h.specimen)).length;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Total Cases Saved', margin + 6, y + 13);
    doc.text('Animal vs Crop Cases', margin + 75, y + 13);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`${totalCases} cases`, margin + 6, y + 19.5);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text(`${cowCount} Anm / ${cropCount} Crp`, margin + 75, y + 19.5);
    
    y += 35;
    
    // Details header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('CHRONOLOGICAL VET & AGRONOMIC DIAGNOSTIC CASE DOSSIERS', margin, y);
    
    y += 7;
    
    // Sort items newest first
    const sortedHistory = [...diagnosticHistory].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    sortedHistory.forEach((rawItem, index) => {
      const item = getFullHistoryItem(rawItem);
      
      // Calculate dynamic text wrapping
      const textWidth = contentWidth - 16; // internal padding inside box
      const wrappedSymptom = doc.splitTextToSize(`"${item.symptom}"`, textWidth);
      const wrappedResearch = doc.splitTextToSize(item.deepResearch || '', textWidth);
      const wrappedTreatment = doc.splitTextToSize(item.treatment || '', textWidth - 40);
      const wrappedQuarantine = doc.splitTextToSize(item.quarantine || '', textWidth - 40);
      const wrappedPrevention = doc.splitTextToSize(item.prevention || '', textWidth - 40);
      
      // Compute total dynamic height of this case report block
      const symptomLinesHeight = wrappedSymptom.length * 4;
      const researchLinesHeight = wrappedResearch.length * 4;
      const treatmentLinesHeight = wrappedTreatment.length * 3.8;
      const quarantineLinesHeight = wrappedQuarantine.length * 3.8;
      const preventionLinesHeight = wrappedPrevention.length * 3.8;
      
      const detailsSectionHeight = treatmentLinesHeight + quarantineLinesHeight + preventionLinesHeight + 20;
      const blockHeight = 16 + symptomLinesHeight + researchLinesHeight + detailsSectionHeight + 8;
      
      // Dynamic page break detection
      if (y + blockHeight > pageHeight - 20) {
        doc.addPage();
        pageNumber++;
        drawHeader(pageNumber);
        drawFooter(pageNumber);
        y = 43;
      }
      
      // Draw outer card box
      doc.setFillColor(250, 251, 252); // extremely soft gray
      doc.rect(margin, y, contentWidth, blockHeight - 4, 'F');
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.rect(margin, y, contentWidth, blockHeight - 4, 'S');
      
      // Left border accent line depending on specimen
      const isCrop = ['tomato', 'maize', 'avocado', 'banana'].includes(item.specimen);
      if (isCrop) {
        doc.setFillColor(16, 185, 129); // emerald green
      } else {
        doc.setFillColor(29, 78, 216); // dark blue
      }
      doc.rect(margin, y, 4, blockHeight - 4, 'F');
      
      let cursorY = y + 6;
      
      // Header: Date & Case ID & Classification Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42); // slate-900
      const specText = item.specimen ? item.specimen.toUpperCase() : 'GENERIC';
      doc.text(`${item.timestamp} | ${specText} CASE | CLASSIFICATION: ${item.conditionName.toUpperCase()}`, margin + 8, cursorY);
      
      cursorY += 6;
      
      // Pathogen & Likelihood line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Pathogen Profile: ', margin + 8, cursorY);
      doc.setFont('helvetica', 'bold');
      doc.text(item.pathogen || 'Unknown Pathogen Strain', margin + 30, cursorY);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Likelihood: ', margin + 110, cursorY);
      doc.setFont('helvetica', 'bold');
      doc.text(item.likelihood || 'High', margin + 125, cursorY);
      
      cursorY += 6;
      
      // Reported Symptoms block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Symptom Footprint: ', margin + 8, cursorY);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      wrappedSymptom.forEach((line: string) => {
        doc.text(line, margin + 35, cursorY);
        cursorY += 4;
      });
      
      cursorY += 2;
      
      // Deep Research section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text('EPIDEMIOLOGICAL ANALYSIS & DEEP RESEARCH CONTEXT:', margin + 8, cursorY);
      cursorY += 4.5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105); // slate-600
      wrappedResearch.forEach((line: string) => {
        doc.text(line, margin + 8, cursorY);
        cursorY += 4;
      });
      
      cursorY += 3;
      
      // Clinical Solution and SOP Protocols
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text('CLINICAL RECOVERY & BIOSECURITY PROTOCOLS:', margin + 8, cursorY);
      cursorY += 5;
      
      // Therapy sub-block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('Active Therapy & Medication:', margin + 8, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      wrappedTreatment.forEach((line: string) => {
        doc.text(line, margin + 48, cursorY);
        cursorY += 3.8;
      });
      
      cursorY += 1.5;
      
      // Quarantine sub-block
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('Quarantine & Isolation SOP:', margin + 8, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      wrappedQuarantine.forEach((line: string) => {
        doc.text(line, margin + 48, cursorY);
        cursorY += 3.8;
      });
      
      cursorY += 1.5;
      
      // Prevention sub-block
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Long-term Biosecurity SOP:', margin + 8, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      wrappedPrevention.forEach((line: string) => {
        doc.text(line, margin + 48, cursorY);
        cursorY += 3.8;
      });
      
      y += blockHeight + 2; // Advance Y to next block position
    });
    
    const fileDateStr = new Date().toISOString().split('T')[0];
    doc.save(`clinical_diagnostics_archive_${fileDateStr}.pdf`);
  };

  // --- HANDLERS FOR THE FIVE UPGRADED SMART TOOLS ---
  
  // Tool 1 Handler: Record Artificial Insemination Event
  const handleRecordInsemination = (targetCowId: string, scheduledTimeText: string) => {
    const cowId = targetCowId || 'COW-01';
    const newRecord = {
      id: 'vet-' + Date.now(),
      cowId: cowId,
      animalCategory: 'Cow' as const,
      date: new Date().toISOString().substring(0, 10),
      type: 'Treatment' as const,
      treatment: `Scheduled Reproductive AI (AM-PM Window: ${scheduledTimeText})`,
      cost: 3000,
      staff: 'Sovereign AI Operator',
      notes: `Heat observed at ${heatTime} (${heatPeriod === 'morning' ? 'AM' : 'PM'}). Insemination scheduled via Reproductive Window Planner.`,
      diagnosis: 'Oestrus Heat Management (AM-PM Rule)',
      prognosis: 'Good' as const,
      retreatmentScheduled: false
    };

    if (setVetRecords) {
      setVetRecords(prev => [newRecord, ...prev]);
    } else {
      try {
        const saved = localStorage.getItem('jr_farm_vet_records');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('jr_farm_vet_records', JSON.stringify([newRecord, ...existing]));
      } catch (e) {
        console.error("Local vet logging failed:", e);
      }
    }

    setTool1Message(`✓ Recorded AI Insemination task successfully for Cow ${cowId}! Check the Veterinary log or Dairy & AI tab.`);
    setTimeout(() => setTool1Message(null), 5000);
  };

  // Tool 2 Handler: Add Slurry Yield to Inventory and log offset
  const handleLogBiogasSlurry = () => {
    const slurryLiters = Math.round(biogasVolume * 45);
    const manureItemName = 'Premium Bio-slurry Liquid Nitrogen';
    
    // 1. Update Inventory
    if (inventory && setInventory) {
      const existingItem = inventory.find(i => i.name.toLowerCase() === manureItemName.toLowerCase());
      if (existingItem) {
        const updated = inventory.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + slurryLiters } : i);
        setInventory(updated);
      } else {
        const newItem = {
          id: 'inv-' + Date.now(),
          name: manureItemName,
          category: 'Fertilizer' as const,
          quantity: slurryLiters,
          unit: 'liters',
          minStock: 200,
          location: 'Bio-digester Pit B',
          dateReceived: new Date().toISOString().substring(0, 10)
        };
        setInventory([newItem, ...inventory]);
      }
    } else {
      // Local inventory fallback
      const saved = localStorage.getItem('jr_farm_inventory');
      let currentInv = saved ? JSON.parse(saved) : [];
      const existingItem = currentInv.find((i: any) => i.name.toLowerCase() === manureItemName.toLowerCase());
      if (existingItem) {
        currentInv = currentInv.map((i: any) => i.id === existingItem.id ? { ...i, quantity: i.quantity + slurryLiters } : i);
      } else {
        const newItem = {
          id: 'inv-' + Date.now(),
          name: manureItemName,
          category: 'Fertilizer',
          quantity: slurryLiters,
          unit: 'liters',
          minStock: 200,
          location: 'Bio-digester Pit B',
          dateReceived: new Date().toISOString().substring(0, 10)
        };
        currentInv = [newItem, ...currentInv];
      }
      localStorage.setItem('jr_farm_inventory', JSON.stringify(currentInv));
      if (setInventory) {
        setInventory(currentInv);
      }
    }

    // 2. Add green-energy offset to financials
    const energySavingsKsh = Math.round(biogasVolume * 300); // 300 KES daily LP Gas savings per m3
    const offsetRecord = {
      id: 'fin-' + Date.now(),
      type: 'income' as const,
      amount: energySavingsKsh,
      category: 'Other Revenue (Energy Offset)',
      description: `Daily Biogas Methane Fuel Offset (${biogasVolume} m³)`,
      date: new Date().toISOString().substring(0, 10)
    };

    if (setFinancials) {
      setFinancials(prev => [offsetRecord, ...prev]);
    } else {
      try {
        const saved = localStorage.getItem('jr_farm_financials');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('jr_farm_financials', JSON.stringify([offsetRecord, ...existing]));
      } catch (e) {
        console.error("Local financial logging failed:", e);
      }
    }

    setTool2Message(`✓ Successfully added ${slurryLiters}L bio-slurry to store inventory & logged +KES ${energySavingsKsh} LP Gas offset to Operating Income!`);
    setTimeout(() => setTool2Message(null), 7000);
  };

  // Tool 4 Handler: Verify Store Inventory and Deduct Stock
  const handleVerifyAndDeductFertilizer = (cropKey: string, acreageCount: number, fertilizerDbData: any) => {
    if (!fertilizerDbData) return;
    
    const isSsp = fertilizerDbData.planting.toLowerCase().includes('ssp');
    const isDap = fertilizerDbData.planting.toLowerCase().includes('dap');
    const isNpk = fertilizerDbData.planting.toLowerCase().includes('npk');
    const isCan = fertilizerDbData.topDressing.toLowerCase().includes('can');

    const plantingFertilizerName = isSsp ? 'SSP Fertilizer' : isNpk ? 'NPK 17:17:17' : 'DAP Fertilizer';
    const topDressingFertilizerName = isCan ? 'CAN Topdressing' : 'NPK 17:17:17';

    // Parse estimated bags required
    let plantingBagsNeeded = 1;
    let topDressingBagsNeeded = 1;

    try {
      if (fertilizerDbData.planting.includes('—')) {
        const parts = fertilizerDbData.planting.split('—');
        const bagsPerAcreStr = parts[1].replace(/[^0-9.]/g, '');
        plantingBagsNeeded = Math.ceil(parseFloat(bagsPerAcreStr) * acreageCount);
      }
      if (fertilizerDbData.topDressing.includes('—')) {
        const parts = fertilizerDbData.topDressing.split('—');
        const bagsPerAcreStr = parts[1].replace(/[^0-9.]/g, '');
        topDressingBagsNeeded = Math.ceil(parseFloat(bagsPerAcreStr) * acreageCount);
      }
    } catch {
      plantingBagsNeeded = Math.ceil(acreageCount);
      topDressingBagsNeeded = Math.ceil(acreageCount);
    }

    // Check store inventory items matching these categories
    const currentInv = inventory || localInventory;
    const plantingItem = currentInv.find(i => i.name.toLowerCase().includes(plantingFertilizerName.toLowerCase()) || i.category === 'Fertilizer');
    const topDressingItem = currentInv.find(i => i.name.toLowerCase().includes(topDressingFertilizerName.toLowerCase()));

    if (!plantingItem || plantingItem.quantity < plantingBagsNeeded) {
      setTool4Message({
        text: `⚠️ Insufficient Fertilizer in stock! Required: ${plantingBagsNeeded} bags of ${plantingFertilizerName}. Please restock the Inventory Store first.`,
        type: 'error'
      });
      return;
    }

    // We can proceed to deduct the bags
    const nextInv = currentInv.map(i => {
      if (plantingItem && i.id === plantingItem.id) {
        return { ...i, quantity: Math.max(0, i.quantity - plantingBagsNeeded) };
      }
      if (topDressingItem && i.id === topDressingItem.id) {
        return { ...i, quantity: Math.max(0, i.quantity - topDressingBagsNeeded) };
      }
      return i;
    });

    if (setInventory) {
      setInventory(nextInv);
    } else {
      setLocalInventory(nextInv);
      localStorage.setItem('jr_farm_inventory', JSON.stringify(nextInv));
    }

    // Add financial expense for fertilizer usage
    const expenseCost = (plantingBagsNeeded + topDressingBagsNeeded) * 2800; // Estimated 2800 KES per bag
    const expenseRecord = {
      id: 'fin-' + Date.now(),
      type: 'expense' as const,
      amount: expenseCost,
      category: 'Crop Inputs (Fertilizer)',
      description: `Fertilizer Application: Deducted ${plantingBagsNeeded} bags ${plantingFertilizerName} and ${topDressingBagsNeeded} bags for ${cropKey} on ${calcAcreage} acres.`,
      date: new Date().toISOString().substring(0, 10)
    };

    if (setFinancials) {
      setFinancials(prev => [expenseRecord, ...prev]);
    } else {
      try {
        const saved = localStorage.getItem('jr_farm_financials');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('jr_farm_financials', JSON.stringify([expenseRecord, ...existing]));
      } catch (e) {
        console.error("Local financial expense logging failed:", e);
      }
    }

    setTool4Message({
      text: `✓ Deducted ${plantingBagsNeeded} bags of ${plantingFertilizerName} successfully from store inventory. Logged ${expenseCost} KES fertilizer utilization expense.`,
      type: 'success'
    });
    setTimeout(() => setTool4Message(null), 6000);
  };

  // Tool 5 Handler: Publish Daily Feed Profit Margin to Financial Ledger
  const handlePublishFeedMarginProfit = (revenue: number, feedCost: number) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const revRecord = {
      id: 'fin-rev-' + Date.now(),
      type: 'income' as const,
      amount: revenue,
      category: 'Dairy Milking Revenue',
      description: `Daily Milk Yield revenue (${analyzerMilkYield}L @ ${analyzerMilkPrice} KES/L) published via Feed Margin Analyzer`,
      date: todayStr
    };
    const expRecord = {
      id: 'fin-exp-' + Date.now(),
      type: 'expense' as const,
      amount: feedCost,
      category: 'Animal Feed Inputs',
      description: `Daily TMR Dairy Feed Rations Cost (${analyzerSilageKg}kg silage, ${analyzerMealKg}kg dairy meal, ${analyzerSupplementsKg}kg lucerne)`,
      date: todayStr
    };

    if (setFinancials) {
      setFinancials(prev => [revRecord, expRecord, ...prev]);
    } else {
      try {
        const saved = localStorage.getItem('jr_farm_financials');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('jr_farm_financials', JSON.stringify([revRecord, expRecord, ...existing]));
      } catch (e) {
        console.error("Local financial logging failed:", e);
      }
    }

    setTool5Message(`✓ Successfully published Milk Yield Revenue (+KES ${revenue}) and Feed Cost (-KES ${feedCost}) to the Farm Financial Ledger!`);
    setTimeout(() => setTool5Message(null), 6000);
  };

  const handleCustomAiDiagnose = async () => {
    if (!customSymptom.trim()) return;
    setIsDiagnoseLoading(true);
    setDiagnoseError(null);
    setCustomDiagResult(null);
    setDiagSelectedSymptom(''); // clear preselected symptom so it renders the custom result

    const forcedOffline = localStorage.getItem('jr_farm_forced_offline') === 'true';

    if (forcedOffline) {
      setTimeout(() => {
        const fallback = selectClientFallbackDiagnosis(diagSelectedTarget, customSymptom);
        const diagObj = {
          ...fallback,
          isOffline: true
        };
        setCustomDiagResult(diagObj);
        setDiagnoseError("Offline analysis engine engaged (Sync Simulator active).");
        setIsDiagnoseLoading(false);

        // Save to case history
        const newCase = {
          id: 'diag-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          specimen: diagSelectedTarget,
          symptom: customSymptom.trim(),
          conditionName: diagObj.conditionName,
          likelihood: 'High',
          isOffline: true,
          pathogen: diagObj.pathogen,
          description: diagObj.description,
          treatment: diagObj.treatment,
          quarantine: diagObj.quarantine,
          prevention: diagObj.prevention,
          deepResearch: getFallbackDeepResearch(diagSelectedTarget, diagObj.conditionName)
        };
        setDiagnosticHistory(prev => {
          const updated = [newCase, ...prev];
          localStorage.setItem('jr_farm_diagnostic_history', JSON.stringify(updated));
          return updated;
        });
      }, 700);
      return;
    }

    try {
      const response = await fetch('/api/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: diagCategory,
          target: diagSelectedTarget,
          symptom: customSymptom.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Diagnosis service returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.diagnosis) {
        const diagObj = {
          ...data.diagnosis,
          isOffline: !!data.isOffline
        };
        setCustomDiagResult(diagObj);

        // Save to case history
        const newCase = {
          id: 'diag-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          specimen: diagSelectedTarget,
          symptom: customSymptom.trim(),
          conditionName: diagObj.conditionName,
          likelihood: diagObj.likelihood || 'High',
          isOffline: !!data.isOffline,
          pathogen: diagObj.pathogen,
          description: diagObj.description,
          treatment: diagObj.treatment,
          quarantine: diagObj.quarantine,
          prevention: diagObj.prevention,
          deepResearch: diagObj.deepResearch || getFallbackDeepResearch(diagSelectedTarget, diagObj.conditionName)
        };
        setDiagnosticHistory(prev => {
          const updated = [newCase, ...prev];
          localStorage.setItem('jr_farm_diagnostic_history', JSON.stringify(updated));
          return updated;
        });
      } else {
        throw new Error(data.error || "Failed to retrieve classification");
      }
    } catch (err: any) {
      console.warn("Custom diagnostic scan failed, compiling static local estimation:", err);
      // Run deep offline matching directly client-side too as double safety!
      const fallback = selectClientFallbackDiagnosis(diagSelectedTarget, customSymptom);
      const diagObj = {
        ...fallback,
        isOffline: true
      };
      setCustomDiagResult(diagObj);
      
      const isDeviceOffline = !navigator.onLine;
      const errorMsg = err?.message || err || "Connection timeout";
      if (isDeviceOffline) {
        setDiagnoseError("Offline analysis engine engaged (Your phone is currently offline, utilizing locally-saved rules).");
      } else {
        setDiagnoseError(`Offline analysis engine engaged (Could not contact server: ${errorMsg}. Using robust local rules).`);
      }

      // Save to case history
      const newCase = {
        id: 'diag-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        specimen: diagSelectedTarget,
        symptom: customSymptom.trim(),
        conditionName: diagObj.conditionName,
        likelihood: 'High',
        isOffline: true,
        pathogen: diagObj.pathogen,
        description: diagObj.description,
        treatment: diagObj.treatment,
        quarantine: diagObj.quarantine,
        prevention: diagObj.prevention,
        deepResearch: getFallbackDeepResearch(diagSelectedTarget, diagObj.conditionName)
      };
      setDiagnosticHistory(prev => {
        const updated = [newCase, ...prev];
        localStorage.setItem('jr_farm_diagnostic_history', JSON.stringify(updated));
        return updated;
      });
    } finally {
      setIsDiagnoseLoading(false);
    }
  };

  const handleLogCropRemediation = (dObj: any) => {
    // 1. Log a new SprayRecord
    const nextSprayRecord = {
      id: 'spray-' + Date.now(),
      block: remediationBlock,
      chemical: dObj.treatment?.split(' ')[0] || 'Copper Hydroxide',
      phi: 7, // default pre-harvest interval
      target: dObj.conditionName,
      date: new Date().toISOString().substring(0, 10),
      safeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    };

    if (setSprayRecords) {
      setSprayRecords(prev => [nextSprayRecord, ...prev]);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('jr_farm_spray_records') || '[]');
        localStorage.setItem('jr_farm_spray_records', JSON.stringify([nextSprayRecord, ...existing]));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Post expense to double-entry financials ledger
    const nextExpense = {
      id: 'fin-' + Date.now(),
      type: 'expense' as const,
      amount: remediationCost,
      category: 'Crop Hygiene / Spraying',
      description: `Targeted remediation spraying for ${dObj.conditionName} on ${remediationBlock}`,
      date: new Date().toISOString().substring(0, 10)
    };

    if (setFinancials) {
      setFinancials(prev => [nextExpense, ...prev]);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('jr_farm_financials') || '[]');
        localStorage.setItem('jr_farm_financials', JSON.stringify([nextExpense, ...existing]));
      } catch (e) {
        console.error(e);
      }
    }

    setPipelineSuccessMessage(`Successfully scheduled treatment for ${dObj.conditionName}! Sprayer dispatched to ${remediationBlock}. Financial operating expense of KSH ${remediationCost} recorded.`);
    setTimeout(() => setPipelineSuccessMessage(null), 7000);
  };

  const handleLogBovineTreatment = (dObj: any) => {
    const currentCows = cows || [
      { id: 'COW-01', name: 'Baraka' },
      { id: 'COW-02', name: 'Malaika' },
      { id: 'COW-03', name: 'Neema' },
      { id: 'COW-04', name: 'Tajiri' }
    ];
    // 1. Log a new VetRecord
    const cow = currentCows.find(c => c.id === selectedBovineId) || { name: 'Ailing Specimen' };
    const nextVetRecord = {
      id: 'vet-' + Date.now(),
      cowId: selectedBovineId,
      animalCategory: 'Cow' as const,
      date: new Date().toISOString().substring(0, 10),
      type: 'Treatment' as const,
      treatment: dObj.treatment,
      cost: remediationCost,
      staff: 'Estate Veterinarian',
      notes: `Diagnosed condition: ${dObj.conditionName}. Pathogen footprint: ${dObj.pathogen}. Active symptoms description: ${dObj.symptom || 'Noted symptoms'}`,
      diagnosis: dObj.conditionName,
      withdrawalMilkDays: 4,
      drugAdministered: dObj.treatment?.split(' ')[0] || 'Antibiotic'
    };

    if (setVetRecords) {
      setVetRecords(prev => [nextVetRecord, ...prev]);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('jr_farm_vet_records') || '[]');
        localStorage.setItem('jr_farm_vet_records', JSON.stringify([nextVetRecord, ...existing]));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Post expense to double-entry financials ledger
    const nextExpense = {
      id: 'fin-' + Date.now(),
      type: 'expense' as const,
      amount: remediationCost,
      category: 'Veterinary / Herd Health',
      description: `Clinical vet treatment of ${cow.name} (Tag: ${selectedBovineId}) for ${dObj.conditionName}`,
      date: new Date().toISOString().substring(0, 10)
    };

    if (setFinancials) {
      setFinancials(prev => [nextExpense, ...prev]);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('jr_farm_financials') || '[]');
        localStorage.setItem('jr_farm_financials', JSON.stringify([nextExpense, ...existing]));
      } catch (e) {
        console.error(e);
      }
    }

    setPipelineSuccessMessage(`Veterinary health dossier updated! ${cow.name} (Tag: ${selectedBovineId}) is marked for clinical Treatment. Milk yield quarantined for 4 days. Expense of KSH ${remediationCost} recorded.`);
    setTimeout(() => setPipelineSuccessMessage(null), 7000);
  };

  const handleLogPoultryTreatment = (dObj: any) => {
    const poultryCohorts: Record<string, string> = {
      'COOP-A': 'Coop Alpha - Layers',
      'COOP-B': 'Coop Beta - Broilers',
      'CHICK-C': 'Brooding House C'
    };
    const coopName = poultryCohorts[selectedPoultryCoop] || 'Poultry Flock';

    // 1. Log a new VetRecord
    const nextVetRecord = {
      id: 'vet-' + Date.now(),
      cowId: selectedPoultryCoop, // coop or cohort label
      animalCategory: 'Poultry' as const,
      date: new Date().toISOString().substring(0, 10),
      type: 'Treatment' as const,
      treatment: dObj.treatment,
      cost: remediationCost,
      staff: 'Poultry Specialist',
      notes: `Diagnosed flock disease: ${dObj.conditionName}. Treatment: ${dObj.treatment}. Active symptoms analyzed: "${dObj.symptom || 'Noted symptoms'}"`,
      diagnosis: dObj.conditionName,
      withdrawalMeatDays: 7, // chemical withdrawal for poultry meat or eggs
      drugAdministered: dObj.treatment?.split(' ')[0] || 'Broad-spectrum antibiotic'
    };

    if (setVetRecords) {
      setVetRecords(prev => [nextVetRecord, ...prev]);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('jr_farm_vet_records') || '[]');
        localStorage.setItem('jr_farm_vet_records', JSON.stringify([nextVetRecord, ...existing]));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Post expense to double-entry financials ledger
    const nextExpense = {
      id: 'fin-' + Date.now(),
      type: 'expense' as const,
      amount: remediationCost,
      category: 'Veterinary / Herd Health',
      description: `Flock-wide vet treatment of ${coopName} (ID: ${selectedPoultryCoop}) for ${dObj.conditionName}`,
      date: new Date().toISOString().substring(0, 10)
    };

    if (setFinancials) {
      setFinancials(prev => [nextExpense, ...prev]);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('jr_farm_financials') || '[]');
        localStorage.setItem('jr_farm_financials', JSON.stringify([nextExpense, ...existing]));
      } catch (e) {
        console.error(e);
      }
    }

    setPipelineSuccessMessage(`Poultry flock dossier updated! ${coopName} (ID: ${selectedPoultryCoop}) is under active veterinary medication. Eggs & fowl sales are blocked for 7 days. Operating expense of KSH ${remediationCost} synced to ledger.`);
    setTimeout(() => setPipelineSuccessMessage(null), 7000);
  };

  // Double-safety client-side fallback matching
  const selectClientFallbackDiagnosis = (target: string, symptom: string) => {
    const norm = symptom.toLowerCase();
    const tgt = target.toLowerCase();

    // 1. BOVINE / CATTLE / COW
    if (tgt === 'cow' || tgt === 'cattle') {
      if (norm.includes('udder') || norm.includes('milk') || norm.includes('breast') || norm.includes('clot') || norm.includes('mastitis') || norm.includes('teat')) {
        return {
          symptom,
          conditionName: "Clinical Mastitis (Heuristic Match)",
          pathogen: "Streptococcus uberis (Bacterial Infection)",
          likelihood: "High" as const,
          description: "An acute physical swelling inside the dairy milk glands, triggered by unsterilized milking operations or damp pasture resting beds.",
          treatment: "Infuse warm teat tubes with intramammary Penicillin/Cloxacillin immediately. Massage with dynamic heat ointments and strip the quarter frequently.",
          quarantine: "Withhold all yields for human-consumption for 3-4 full days. Separate cow to feed pasture block LAST.",
          prevention: "Wipe with standard 0.5% organic iodine teat dip before/after milking. Layer resting cubicles with mineral builder's lime."
        };
      }
      if (norm.includes('cough') || norm.includes('fever') || norm.includes('breathe') || norm.includes('breathing') || norm.includes('tick') || norm.includes('gland')) {
        return {
          symptom,
          conditionName: "East Coast Fever / Tick Congestion (Heuristic Match)",
          pathogen: "Theileria parva (Protozoan parasite via Brown Ear Ticks)",
          likelihood: "High" as const,
          description: "Catastrophic tick-derived parasite leading to critical lymph node inflammation, heavy breathing, high fevers, and fluid block inside cow lungs.",
          treatment: "Administer Buparvaquone (Butalex) injection immediately at 2.5mg/kg into neck muscle tissue + long-lasting Oxytetracyclines.",
          quarantine: "Restrict animal pasture access. Separate the high-risk sick cow in isolation box parameters.",
          prevention: "Execute weekly dip or spray routines with Amitraz chemicals, treating ears manually with mineral tick grease."
        };
      }
      return {
        symptom,
        conditionName: "Ruminal Acidosis / Bloat (Heuristic Match)",
        pathogen: "Carbohydrate overload or excessive leguminous fresh feeding.",
        likelihood: "Moderate" as const,
        description: "An acute metabolic emergency caused by rapid fermentation of soluble concentrates in the rumen, dropping pH below 5.5 and trapping frothy gas.",
        treatment: "Drench immediately with 300ml of organic vegetable oil or anti-bloat silicone surfactant (e.g., Bloat Guard). Keep the beast moving.",
        quarantine: "Suspend commercial concentrate feeding for 48 hours. Transition carefully back with dry Rhodes hay fiber.",
        prevention: "Incorporate minimum 30% structural long forage fiber inside TMR diet mixers. Provide sodium bicarbonate free-choice buffers."
      };
    }

    // 2. TOMATO
    if (tgt === 'tomato') {
      if (norm.includes('curling') || norm.includes('yellow') || norm.includes('stunted') || norm.includes('twist') || norm.includes('border')) {
        return {
          symptom,
          conditionName: "Tomato Yellow Leaf Curl Virus (TYLCV) (Heuristic Match)",
          pathogen: "Begomovirus (Transmitted by Whiteflies)",
          likelihood: "High" as const,
          description: "A devastating viral disease restricting overall starch distribution, causing leaves to curl and stunt, arresting flower development.",
          treatment: "No curative chemical exists for the virus. Spray organic Garlic/Neem extracts or Actara (Thiamethoxam) to arrest whitefly vectors.",
          quarantine: "Uproot infected tomato plants instantly, bag them carefully inside the field rows, and incinerate to block spread.",
          prevention: "Utilize fine insect-proof netting in crop nursery screens. Maintain tight solanaceous weed-free field boundaries."
        };
      }
      if (norm.includes('blight') || norm.includes('lesion') || norm.includes('leaf spot') || norm.includes('rain') || norm.includes('dark')) {
        return {
          symptom,
          conditionName: "Tomato Late Blight (Heuristic Match)",
          pathogen: "Phytophthora infestans (Oomycete Spore Disease)",
          likelihood: "High" as const,
          description: "Catastrophic fungal-like spore infection that flushes during rain humidity. Causes rapid stem rot and dark leaf canopy death.",
          treatment: "Foliar spray systemic Metalaxyl + Mancozeb (e.g. Ridomil Gold) immediately. Re-apply preventative copper solutions.",
          quarantine: "Strict 7-day chemical withholding period (PHI) for crop harvests after metalaxyl treatment.",
          prevention: "Respect wide plant spacing (60x45cm) to maximize air draft. Use drip lines instead of overhead sprinklers."
        };
      }
      return {
        symptom,
        conditionName: "Blossom-End Rot / Calcium Lockout (Heuristic Match)",
        pathogen: "Calcium Defect (Physiological Water Deficiency)",
        likelihood: "High" as const,
        description: "Not a microbial pathogen, but a nutritional tissue defect caused by irregular soil water or nitrogen ammonium oversupply.",
        treatment: "Foliar spray with water-soluble Calcium Nitrate weekly at 20g/20L water tank. Irrigate beds uniformly.",
        quarantine: "Discard rot-affected tomato fruits immediately so plant directs energy and calcium to upper healthy buds.",
        prevention: "Maintain steady watering regimes. Incorporate well-composted organic manures during land tillage."
      };
    }

    // 3. MAIZE
    if (tgt === 'maize') {
      if (norm.includes('streak') || norm.includes('yellow') || norm.includes('line')) {
        return {
          symptom,
          conditionName: "Maize Streak Virus (MSV) (Heuristic Match)",
          pathogen: "Maize Streak Mastrevirus (Transmitted by Leafhoppers)",
          likelihood: "High" as const,
          description: "Severe plant viral disease causing multiple yellow-green streaks parallel to veins, stunting cob development. Vectored by Cicadulina.",
          treatment: "No direct viral cure. Spray chlorpyrifos or synthetic pyrethroids if leafhopper counts cross threshold limits.",
          quarantine: "Uproot heavily stunted bushes. Do not plant maize adjacent to infected wild grassy headlands.",
          prevention: "Plant resistant hybrids (e.g., DK-803 or Pannar). Establish field boundaries with nitrogen-fixing dry beans."
        };
      }
      return {
        symptom,
        conditionName: "Fall Armyworm (FAW) Infestation (Heuristic Match)",
        pathogen: "Spodoptera frugiperda (Lepidopteran Pest)",
        likelihood: "High" as const,
        description: "Destructive caterpillar pest that bores into maize whorls, chewing ragged holes and leaving wet frass, causing dead-heart symptoms.",
        treatment: "Spray with bio-rational Spinetoram (Radiant) or Emamectin Benzoate during early mornings when larvae feed.",
        quarantine: "Scout and physically crush egg masses manually. Do not harvest baby corn within 14 days of spraying.",
        prevention: "Adopt the Push-Pull strategy (intercrop with Desmodium to repel pests, plant Napier grass on boundaries to trap larvae)."
      };
    }

    // 4. CHICKEN / POULTRY
    if (tgt === 'chicken' || tgt === 'poultry') {
      if (norm.includes('respiratory') || norm.includes('sneeze') || norm.includes('cough') || norm.includes('gasp') || norm.includes('sound') || norm.includes('neck')) {
        return {
          symptom,
          conditionName: "Newcastle Disease (Heuristic Match)",
          pathogen: "Avian Paramyxovirus Type 1 (APMV-1)",
          likelihood: "High" as const,
          description: "An extremely contagious viral disease of swine/poultry causing respiratory gasping, green diarrhea, and twisted neck (torticollis).",
          treatment: "No curative drug. Administer soluble multivitamins + broad spectrum Tylosin/Doxycycline to control concurrent bacterial complexes.",
          quarantine: "Establish strict biosecurity quarantine. Bar entry of external visitors and burn all wild bird wild carcasses.",
          prevention: "Meticulous vaccination regimen (LaSota vaccine strain via drinking water every 3 months. Sterilize coop foot-baths)."
        };
      }
      return {
        symptom,
        conditionName: "Clinical Coccidiosis (Heuristic Match)",
        pathogen: "Eimeria spp. (Protozoan parasite of Intestinal Lining)",
        likelihood: "High" as const,
        description: "Intestinal protozoa destroying gut villi, causing bloody droppings, ruffled feathers, acute dehydration, and poor feed conversion rates.",
        treatment: "Treat immediately with Amprolium soluble powder at 1.25g per Liter of clean water for 5-7 days continuously.",
        quarantine: "Scrape wet coop litter and apply dry lime. Quarantine young chicks from mature flocks.",
        prevention: "Keep litter bone dry. Add feed-grade coccidiostats. Ensure feeder troughs are suspended above dropping zones."
      };
    }
    
    // 4b. GOAT
    if (tgt === 'goat' || tgt === 'goats') {
      if (norm.includes('cough') || norm.includes('breathe') || norm.includes('pneumonia') || norm.includes('nose') || norm.includes('nasal')) {
        return {
          symptom,
          conditionName: "Contagious Caprine Pleuropneumonia (CCPP) (Heuristic Match)",
          pathogen: "Mycoplasma capricolum subsp. capripneumoniae",
          likelihood: "High" as const,
          description: "A highly contagious, devastating respiratory mycoplasma causing severe pleuropneumonia, high fever, coughing, and yellow/frothy nasal discharges.",
          treatment: "Administer Oxytetracycline 20% Long-Acting (1ml/10kg body weight) or Tylosin injectable (10mg/kg) early in the course of the infection.",
          quarantine: "Isolate affected goats immediately. CCPP is highly infectious via airborne aerosols. Disinfect pasture stalls with Virkon-S.",
          prevention: "Vaccinate annually with inactivated CCPP culture vaccine. Quarantine newly bought goats for at least 21 days."
        };
      }
      if (norm.includes('hoof') || norm.includes('foot') || norm.includes('lame') || norm.includes('limp') || norm.includes('rot')) {
        return {
          symptom,
          conditionName: "Infectious Caprine Foot Rot (Heuristic Match)",
          pathogen: "Dichelobacter nodosus + Fusobacterium necrophorum",
          likelihood: "High" as const,
          description: "An extremely painful synergistic bacterial infection causing progressive decay of the hoof horn, severe lameness, and a foul, distinctive odor.",
          treatment: "Trim infected hoof tissue meticulously to expose anaerobic bacteria. Paint with 10% Copper Sulfate solution or oxytetracycline spray.",
          quarantine: "Tether sick animals on dry elevated slats. Keep away from muddy communal water logs or damp clay pastures.",
          prevention: "Provide weekly 10% Zinc/Copper Sulfate foot-baths. Keep kidding pens clean and dry."
        };
      }
    }

    // 4c. AVOCADO
    if (tgt === 'avocado' || tgt === 'avocados') {
      if (norm.includes('root') || norm.includes('rot') || norm.includes('wilt') || norm.includes('dieback')) {
        return {
          symptom,
          conditionName: "Phytophthora Root Rot (Heuristic Match)",
          pathogen: "Phytophthora cinnamomi (Oomycete Spore)",
          likelihood: "High" as const,
          description: "A catastrophic root destroyer. Causes avocado foliage to turn pale green/yellow, wilt, drop prematurely, and leads to branch tip dieback.",
          treatment: "Drench soil with Metalaxyl (Ridomil Gold) or inject the tree trunks with soluble Potassium Phosphonate solutions (10% formulation).",
          quarantine: "Cease immediate over-irrigation. Do not transport soil or tools from infected root zones to clean avocado sectors.",
          prevention: "Plant avocado seedlings on raised mounds (at least 30cm high) for premium drainage. Meticulously apply coarse organic mulch."
        };
      }
      if (norm.includes('spot') || norm.includes('dark') || norm.includes('anthracnose') || norm.includes('fruit')) {
        return {
          symptom,
          conditionName: "Avocado Anthracnose Fruit Rot (Heuristic Match)",
          pathogen: "Colletotrichum gloeosporioides (Fungal Spore)",
          likelihood: "High" as const,
          description: "A high-risk fungal infection creating circular, sunken dark brown or black spots on the avocado skin, which rot the edible flesh underneath.",
          treatment: "Spray preventive Copper Hydroxide (Kocide 3000) at 15g per 20-liter tank every 21-28 days starting from fruit set.",
          quarantine: "Withhold all harvested avocados from export crates if there are signs of dark skin specks. Keep harvest tools disinfected.",
          prevention: "Prune lower avocado branches (keep canopy at least 1 meter off the ground) to optimize airflow and lower humidity build-up."
        };
      }
    }

    // 5. CROP OVERALL DEFAULT
    return {
      symptom,
      conditionName: "Standard Physiological Stress (Heuristic Match)",
      pathogen: "Macro-Nutritional imbalance or crop hydration shock",
      likelihood: "Moderate" as const,
      description: "Severe physiological reaction caused by temperature swings, extreme wind exposure, or inconsistent soil water delivery.",
      treatment: "Foliar feed immediately with soluble premium bio-slurry or liquid Seaweed trace mineral complexes.",
      quarantine: "Check adjacent rows for vector bugs. Pruning cuts should be suspended until structural turgor pressure returns.",
      prevention: "Carry out complete soil testing analysis. Apply deep compost soil covers to hold root temperatures stable."
    };
  };

  // Helper matching filter for global searches
  const filterMatches = (title: string, tags: string[], description: string) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchTitle = title.toLowerCase().includes(term);
    const matchDesc = description.toLowerCase().includes(term);
    const matchTags = tags.some(tag => tag.toLowerCase().includes(term));
    return matchTitle || matchDesc || matchTags;
  };

  // NPK Fertilization rules data
  const fertilizerDb: Record<string, { planting: string; topDressing: string; notes: string }> = {
    maize: {
      planting: "DAP (Diammonium Phosphate) — 1 bag (50kg) per acre",
      topDressing: "CAN (Calcium Ammonium Nitrate) — 1.5 bags (75kg) per acre, applied when maize is knee-high (V4-V6 stage)",
      notes: "Place DAP 2 inches to the side and 2 inches below the seed to prevent acidic root burn. Apply CAN after rain or watering when the soil is damp."
    },
    tea: {
      planting: "NPK 25:5:5 or NPK 26:5:5 — 1.2 bags (60kg) per acre",
      topDressing: "NPK 25:5:5 — 2 bags (100kg) per acre annually, usually split into two seasons (March and October)",
      notes: "Tea thrives in acidic soils (pH 4.5 - 5.6). Do not apply wood ash or lime, as it raises pH and stunts tea bush vigor."
    },
    avocado: {
      planting: "Single Super Phosphate (SSP) — 250g per planting hole mixed with 1 wheelbarrow of dry manure",
      topDressing: "CAN — 150g per immature tree, increasing to 500g annually for mature Hass trees. Also apply Solubor (Boron) to boost fruit set",
      notes: "Feed fertilizer around the tree canopy drip-line, never next to the trunk. Mulch tree root zone meticulously with dry leaves."
    },
    banana: {
      planting: "Double Super Phosphate (DSP) — 200g per plant hole, combined with 20kg of dark cured manure",
      topDressing: "Muriate of Potash (MOP) — 150g per mat twice yearly + CAN 100g to support active pseudostem development",
      notes: "Bananas are extremely heavy potassium feeders. Bio-slurry from the biogas digester is highly recommended as a foliar drench."
    },
    sorghum: {
      planting: "NPK 23:21:0 or DAP — 0.8 bags (40kg) per acre",
      topDressing: "CAN — 1 bag (50kg) per acre when plants reach 30cm in height",
      notes: "Highly tolerant of dry soils, but responds exceptionally well to nitrogen top-dressing just before boot-stage elongation."
    },
    beans: {
      planting: "SSP (Single Super Phosphate) — 1 bag (50kg) per acre, inoculating seeds with Rhizobium",
      topDressing: "Foliar trace micro-elements spray at first flowering. Generally requires zero nitrogen CAN top-dressing",
      notes: "Beans actively fix nitrogen from the air. Nitrogen top-dressing is counter-productive as it causes excessive canopy growth, reducing pod yield."
    },
    vegetables: {
      planting: "NPK 17:17:17 — 1 bag per acre mixed thoroughly inside the planting beds",
      topDressing: "Calcium Nitrate (Soluble) — via drip lines (fertigation) weekly at 5kg per acre to prevent physiological blossom-end rot",
      notes: "For tomatoes and sweet peppers, Calcium is critical for cell-wall integrity. Maintain drip irrigation system flush."
    },
    napier: {
      planting: "DAP or NPK 23:21:0 — 1 bag (50kg) per acre inside the planting furrows",
      topDressing: "CAN — 1 bag (50kg) per acre after EVERY second cutting, or continuous Bio-slurry drenching",
      notes: "Napier grass is a highly demanding fodder crop. Nitrogen top-dressing determines raw leaf crude protein (CP) and feed digestibility."
    },
    eucalyptus: {
      planting: "NPK 17:17:17 — 100g per seedling hole mixed with loose soil",
      topDressing: "Generally requires minimal top-dressing once roots reach deep aquifers. Supplement with composted manure during year 1",
      notes: "Ensure windbreaks do not rob water from nearby crop root lines. Dig a deep root-barrier trench to guide Eucalyptus roots vertically."
    }
  };

  const diagnosticsDb: Record<string, Array<{
    symptom: string;
    conditionName: string;
    pathogen: string;
    likelihood: 'High' | 'Moderate';
    description: string;
    treatment: string;
    quarantine: string;
    prevention: string;
  }>> = {
    tomato: [
      {
        symptom: "Leaves curling upwards with yellow/purplish borders, stunted plant growth",
        conditionName: "Tomato Yellow Leaf Curl Virus (TYLCV)",
        pathogen: "Begomovirus (Transmitted by Whiteflies)",
        likelihood: "High",
        description: "A devasting viral disease causing severe necrosis and flower dropping. Once infected, plants cannot be cured but must be managed.",
        treatment: "No curative chemical exists. Spray organic Garlic/Neem extract or Acetamiprid / Imidacloprid to arrest active whitefly vectors.",
        quarantine: "Uproot infected tomato plants, bag them immediately inside the field, and burn or bury deep to halt viral multiplication.",
        prevention: "Utilize fine insect-proof netting in nurseries. Keep fields free of solanaceous weeds (e.g., nightshade) which harbor the virus."
      },
      {
        symptom: "Water-soaked dark lesions on leaves, rapid canopy collapse after rainy weeks",
        conditionName: "Late Blight",
        pathogen: "Phytophthora infestans (Oomycete)",
        likelihood: "High",
        description: "A catastrophic fungal-like spore infection that flourishes under high humidity, cold mornings, and rainy seasons. It can wipe out acres in 3 days.",
        treatment: "Apply systemic metalaxyl-based sprays (mancozeb mix) immediately. Spray preventative Copper fungicides before rainfall events.",
        quarantine: "Withhold harvesting for 7 days after Copper spraying. Prune and destroy lower water-splashed foliage.",
        prevention: "Adopt wide plant spacing (60x45cm) to improve airflow. Irrigate soil using drip lines instead of overhead sprinklers to keep leaves dry."
      },
      {
        symptom: "Fruit bottom turning dark, sunken, leathery and flat",
        conditionName: "Blossom-End Rot (BER)",
        pathogen: "Calcium Deficiency (Physiological Breakdown)",
        likelihood: "High",
        description: "Not a pathogen, but a nutritional disorder caused by insufficient soil calcium absorption or highly irregular water delivery.",
        treatment: "Foliar spray with water-soluble Calcium Nitrate weekly at 20g per 20L water knapsack.",
        quarantine: "Harvest and discard rot-affected tomato fruits immediately so the plant channels remaining water and calcium to upper buds.",
        prevention: "Maintain uniform soil moisture. Avoid over-applying ammonium-based nitrogen fertilizers which compete with calcium uptake."
      }
    ],
    maize: [
      {
        symptom: "Tiny yellow-green streaks on leaves, cobs are tiny and dry prematurely",
        conditionName: "Maize Streak Virus (MSV)",
        pathogen: "Maize Streak Mastrevirus (Transmitted by Leafhoppers)",
        likelihood: "High",
        description: "A major viral disease restricting starch mobilization, causing typical yellow streaks running parallel to leaf veins.",
        treatment: "No cure for the virus. Control the Leafhopper vector (Cicadulina spp.) with organic pyrethroids if infestation exceeds thresholds.",
        quarantine: "Uproot and bury heavily stunted plants to limit spreading vectors.",
        prevention: "Plant resistant hybrid maize seeds (e.g. H614 or DK series). Intercrop with dry beans to disrupt insect flight path."
      }
    ],
    avocado: [
      {
        symptom: "Pale yellowing leaves, tip dieback of branches, roots are black and brittle",
        conditionName: "Phytophthora Root Rot",
        pathogen: "Phytophthora cinnamomi",
        likelihood: "High",
        description: "The most destructive avocado disease globally, thriving in poorly-drained or waterlogged soils. Attacks secondary feeder roots, starving the tree of water.",
        treatment: "Inject mature tree trunks with potassium phosphonate, or apply Ridomil Gold (Metalaxyl) around the tree drip line during soil moisture.",
        quarantine: "Sterilize pruning tools in copper solutions. Restrict machinery movement from contaminated wet plots to healthy blocks.",
        prevention: "Plant trees on raised mounds (0.5m high) to redirect rainwater. Incorporate deep woodchip mulching to foster beneficial trichoderma bacteria."
      }
    ],
    banana: [
      {
        symptom: "Bacterial yellow oozing from cut stems, premature fruit ripening with rusty dry rot",
        conditionName: "Banana Xanthomonas Wilt (BXW)",
        pathogen: "Xanthomonas vasicola pv. musacearum",
        likelihood: "High",
        description: "A highly aggressive vascular bacterial disease transmitted by male bud flowers attracting bees and dirty cutting panga knives.",
        treatment: "No chemical cured. Cut off the male bud flower using a forked stick (forclis) immediately after the last hand forms.",
        quarantine: "Strict field quarantine. Sterilize farm tools with fire or 20% chlorine bleach before moving to any other banana mat.",
        prevention: "Uproot the entire infected banana mat, chop into small pieces, heap on site to rot, and plant alternative rotation crops for 12 months."
      }
    ],
    cow: [
      {
        symptom: "Swollen hot udder quarters, milk contains yellow clots, watery/bloody fluid",
        conditionName: "Clinical Mastitis",
        pathogen: "Streptococcus uberis / Staphylococcus aureus (Bacterial)",
        likelihood: "High",
        description: "An acute bacterial invasion of the mammary gland tissue, causing painful inflammation, loss of yields, and irreversible scar damage.",
        treatment: "Wash and dry udder. Perform California Mastitis Test (CMT). Apply intramammary penicillin/cloxacillin infusions immediately into infected quarters.",
        quarantine: "Strict milk withholding of 3-4 days (PHI). Always milk mastitis cows LAST to prevent micro-organism spread to healthy cows.",
        prevention: "Adopt teat-dipping with 0.5% Iodine spray post-milking. Keep dairy stables clean, dry, and apply lime to pasture sleeping beds."
      },
      {
        symptom: "High fever (41°C), swollen lymph nodes below the ears, pale gums, heavy panting",
        conditionName: "East Coast Fever (ECF)",
        pathogen: "Theileria parva (Parasitic Protozoa via Brown Ear Ticks)",
        likelihood: "High",
        description: "The leading tick-borne killer of dairy cattle in East Africa. Red blood cells and white blood cells undergo severe destructive division.",
        treatment: "Administer Buparvaquone (e.g., Butalex) at 2.5mg/kg intramuscularly immediately + long-acting Oxytetracycline for lung congestion.",
        quarantine: "Restrict animal movement to avoid seeding pastures with tick eggs. Clip and treat and segregate infected heifer.",
        prevention: "Strict weekly tick control - spray or dip with Amitraz acaricides. Clean ticks manually with tick grease in ear folds and tail heads."
      }
    ],
    chicken: [
      {
        symptom: "Bloody diarrhea, ruffled feathers, pale combs, and high mortality",
        conditionName: "Coccidiosis",
        pathogen: "Eimeria protozoa (Intestinal parasite)",
        likelihood: "High",
        description: "A common protozoal infection of chicken gut lining. Thrives when chicken litter is damp, warm, and highly crowded.",
        treatment: "Administer Amprolium (e.g. Coccidiostat) in clean drinking water for 5-7 days continuously.",
        quarantine: "Isolate affected flocks. Scoop damp litter, disinfect floor with lime powder, and replace with dry dust-free wood shavings.",
        prevention: "Avoid feed container water leaks. Mix starter/grower feeds containing preventative coccidiostats. Administer vaccine."
      }
    ]
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 animate-fadeIn" id="academy-root">
      
      {/* Academy Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border border-emerald-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800/15 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-900 text-emerald-300 font-extrabold tracking-widest text-[9px] uppercase px-3 py-1 rounded-full border border-emerald-700/50">
                ⚡ MASTERCLASS SUPER-HUB
              </span>
              <span className="bg-amber-500/20 text-amber-300 font-bold text-[9px] px-2.5 py-1 rounded-full border border-amber-500/30">
                LIVESTOCK + AGRONOMY SPECIFICATIONS
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Farmer's Knowledge Academy
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed max-w-xl font-medium">
              Achieve total compliance and record yields. Access scientific protocols for livestock health, crop-specific calendars, chemical quarantine controls (GlobalGAP PHI), compost engineering, and real-time simulators.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            {onTriggerSectionReport && (
              <button
                onClick={() => onTriggerSectionReport('academy')}
                type="button"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase p-4 rounded-2xl border border-amber-600/10 transition-all flex flex-col items-center justify-center shadow-lg cursor-pointer h-[66px] min-w-[85px] m-0 font-bold"
                title="Download Expert Diagnostics & SOP Audit PDF Report"
              >
                <Download size={16} className="text-slate-950 mb-1" />
                <span className="text-[9px] font-bold tracking-wider">Download PDF</span>
              </button>
            )}
            <div className="farm-shell-panel px-5 py-4 rounded-2xl border border-white/70 text-center shadow-md h-[66px] flex flex-col justify-center">
              <span className="text-2xl font-black text-yellow-500 block font-mono leading-none">15+</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5 whitespace-nowrap">App Crops & Beasts</span>
            </div>
            <div className="farm-shell-panel px-5 py-4 rounded-2xl border border-white/70 text-center shadow-md h-[66px] flex flex-col justify-center">
              <span className="text-2xl font-black text-emerald-300 block font-mono leading-none">4</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5 whitespace-nowrap">Smart Simulators</span>
            </div>
          </div>
        </div>

        {/* Integrated Real-Time Interactive Search */}
        <div className="mt-6 relative max-w-lg" id="academy-search">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-emerald-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search crop (tea, avocado, bsf), disease (mastitis, rot), protocol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-16 py-3.5 bg-white/80 text-slate-900 focus:bg-white focus:text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:border-emerald-500 underline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-xs transition-all shadow-sm"
          />
          {searchTerm ? (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] text-amber-400 hover:text-amber-300 font-black tracking-wide uppercase border-0 bg-transparent cursor-pointer"
            >
              Clear
            </button>
          ) : (
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-[9px] text-slate-500 font-bold">
              KNOWLEDGE ENGINE
            </span>
          )}
        </div>
      </div>

      {/* Main Academy Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('science'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'science'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-slate-200'
          }`}
          id="tab-science"
        >
          <Sprout size={13} className={activeTab === 'science' ? 'text-yellow-400' : 'text-emerald-700'} />
          Scientific Practices
        </button>

        <button
          onClick={() => { setActiveTab('crops'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'crops'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-slate-200'
          }`}
          id="tab-crops"
        >
          <Leaf size={13} className={activeTab === 'crops' ? 'text-yellow-400' : 'text-emerald-700'} />
          Crop Guides
        </button>

        <button
          onClick={() => { setActiveTab('livestock'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'livestock'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-slate-200'
          }`}
          id="tab-livestock"
        >
          <Heart size={13} className={activeTab === 'livestock' ? 'text-red-400' : 'text-rose-700'} />
          Livestock Protocols
        </button>

        <button
          onClick={() => { setActiveTab('calculators'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'calculators'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
              : 'bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 border-amber-300'
          }`}
          id="tab-calculators"
        >
          <Calculator size={13} />
          Interactive Smart Tools
        </button>

        <button
          onClick={() => { setActiveTab('diagnostics'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'diagnostics'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm animate-pulse'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200'
          }`}
          id="tab-diagnostics"
        >
          <Activity size={13} />
          Diagnostics Wizard
        </button>

        <button
          onClick={() => { setActiveTab('forecasting'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'forecasting'
              ? 'bg-teal-700 text-white border-teal-700 shadow-sm animate-pulse'
              : 'bg-teal-50 text-teal-950 hover:bg-teal-100/50 border-teal-200'
          }`}
          id="tab-forecasting"
        >
          <TrendingUp size={13} />
          Predictive Yield Forecasting
        </button>

        <button
          onClick={() => { setActiveTab('inventory_deduct'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'inventory_deduct'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border-indigo-200'
          }`}
          id="tab-inventory-deduct"
        >
          <Database size={13} />
          Smart Stock Auto-Deduct
        </button>

        <button
          onClick={() => { setActiveTab('timelines'); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'timelines'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200'
          }`}
          id="tab-timelines"
        >
          <Calendar size={13} />
          PHI & Breeding Gestation Timelines
        </button>
 
        <button
          onClick={() => { setActiveTab('quizzes' as any); }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === ('quizzes' as any)
              ? 'bg-rose-950 text-white border-rose-950 shadow-sm'
              : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border-rose-200'
          }`}
          id="tab-quizzes"
        >
          <Award size={13} className={activeTab === ('quizzes' as any) ? 'text-yellow-400' : 'text-rose-700'} />
          Interactive Quizzes
        </button>
      </div>

      {/* 1. SCIENTIFIC FARMING PRACTICES TAB */}
      {activeTab === 'science' && (
        <div className="space-y-6" id="science-section">
          <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 flex items-start gap-3">
            <Info className="text-emerald-800 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
              <strong>Core Agricultural Biology Directive:</strong> Scientific farming builds soil structures instead of exhausting nutrients. Always verify biological compatibility, composting heat levels, and pesticide Pre-Harvest Withholding Intervals (PHI) before conducting any farm work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Practice 1: Soil pH & Dynamic Organic Carbon */}
            {filterMatches(
              "Soil Health & Dynamic Organic Carbon", 
              ["soil", "organic", "pH", "testing", "manure", "nitrogen", "calcium"],
              "Comprehensive guidelines on soil test ranges, balancing acidic profiles, boosting microbial life, and organic carbon maintenance"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-50 text-emerald-850 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-100">
                    🔬 Chemistry Lab
                  </span>
                  <Droplets className="text-emerald-700 font-bold" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Soil Health & Dynamic Organic Carbon</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. Soil pH Management targets:</strong> Most crops thrive at pH <span className="font-bold text-slate-900">5.5 to 6.5</span> (slightly acidic). 
                    <br />• <strong>High acidity (pH &lt; 5.0):</strong> Blocks critical phosphorus absorption. Apply agricultural lime (Calcium Carbonate) or dolomite at 1 ton per acre to buffer.
                    <br />• <strong>Alkalinity (pH &gt; 7.5):</strong> Stunts trace elements like iron and zinc. Use chemical agricultural sulfur powder.
                  </p>
                  <p>
                    <strong>2. Boosting Humus & Microbial Life:</strong> Organic matter acts as a biological sponge. Maintain soil carbon levels at &gt;3% by continuous zero-till mulching, applying dark compost, and scheduling rotational plantings.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <span className="text-lg">🧪</span>
                    <div>
                      <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-wide">Dynamic Nitrogen Fixation Note:</h4>
                      <p className="text-[10px] leading-relaxed text-slate-500 font-medium">Intercropping beans with maize releases natural fixed atmospheric nitrogen, reducing CAN fertilizer expenses by up to 35% annually.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Practice 2: Composting Engineering */}
            {filterMatches(
              "Bovine & Poultry Compost Windrow Engineering", 
              ["composting", "manure", "windrows", "temperature", "carbon", "nitrogen", "turning"],
              "Guidelines for compost piling, optimal C:N ratio, temperature monitoring curve, and hydration"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-amber-50 text-amber-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-200">
                    🍂 Biomass Lab
                  </span>
                  <Layers className="text-amber-600" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Bovine & Poultry Compost Windrow Engineering</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. The Golden Carbon-to-Nitrogen (C:N) Ratio:</strong> Achieve a target of <span className="font-bold text-slate-900">30:1</span>.
                    <br />• <strong>Browns (Carbon):</strong> Dry twigs, maize stalks, wood chips, dry tea prunings (3 parts).
                    <br />• <strong>Greens (Nitrogen):</strong> Fresh green weeds, poultry droppings, cattle manure, bio-digester slurry (1 part).
                  </p>
                  <p>
                    <strong>2. Active Thermophilic Temperature Curve:</strong> Pile compost in active windrows 1.5m high.
                    <br />• Monitor with a probe. Within 4 days, heat must spike to <span className="font-bold text-rose-600 font-mono">55°C - 65°C</span>. This high heat physically pasteurizes weed seeds and pathogenic bacteria.
                    <br />• If heat drops below 45°C, turn and hydrate the compost pile immediately to re-activate aerobic digestion.
                  </p>
                  <p className="font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded text-[11px] leading-snug">
                    ✓ Cured compost must smell like sweet forest rain, be completely dark crumbly humus, and feel cool to the touch (within 60 days).
                  </p>
                </div>
              </div>
            )}

            {/* Practice 3: Integrated Pest Management (IPM) */}
            {filterMatches(
              "Integrated Pest Management (IPM) & GlobalGAP Rules", 
              ["ipm", "pesticides", "traps", "biological", "globalgap", "quarantine", "withholding"],
              "How to track and control crop pests organically, sticky traps, predatory insects, and quarantine safety"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-50 text-rose-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-150">
                    🛡️ GlobalGAP
                  </span>
                  <ShieldCheck className="text-rose-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Integrated Pest Management & Chemical Control</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. Eco-Friendly Pest Trapping protocols:</strong> Do not spray chemical poisons at first sight. Use physical traps:
                    <br />• <strong>Yellow Sticky Traps:</strong> Capture whiteflies, thrips, and aphids in tomato drip greenhouses.
                    <br />• <strong>Pheromone Traps:</strong> Catch fruit flies in avocado groves to protect export fruits from puncture rot.
                  </p>
                  <p>
                    <strong>2. Biological Predatory insects:</strong> Leverage nature. Maintain wild floral margins around bean fields to attract predatory ladybirds (which devour aphids) and parasitic wasps (for leafminer control).
                  </p>
                  <p className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[10px] space-y-1">
                    <span className="text-yellow-405 font-black uppercase block tracking-wider">⚠️ STRICT EXPORT QUARANTINE (PHI):</span>
                    <span>Pre-Harvest Intervals are legally binding. When chemical drenching is unavoidable, always check the chemical label. The sprayed crops MUST remain quarantined (absolutely zero harvesting allowed) until the PHI safe expiration date.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Practice 4: Precision Drip & Gravity Water Engineering */}
            {filterMatches(
              "Precision Drip & Gravity Water Engineering", 
              ["water", "drip", "irrigation", "soil", "gravity", "flow", "mulching"],
              "High-efficiency drip lines, calculating flow rates, avoiding waterlogging, and soil moisture lock techniques"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-100">
                    💧 Hydrology Lab
                  </span>
                  <Activity className="text-blue-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Precision Drip & Gravity Water Engineering</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. Drip Line Calibration:</strong> Gravity-fed low pressure systems require header tanks raised &gt;2 meters above the fields. 
                    <br />• Use pressure-compensating drip buttons to supply a uniform <span className="font-bold text-slate-900 font-mono">1.5 - 2.0 Liters per hour</span> per plant emitter, avoiding water wasted on pathways.
                  </p>
                  <p>
                    <strong>2. Crop Waterlogging Defenses:</strong> Clay soils lock water, inducing anaerobic root asphyxiation (robbing roots of oxygen). Prepare high-raised soil beds at least 30cm tall, and till wood chips inside clay basins.
                  </p>
                  <p>
                    <strong>3. Moisture Lock (Mulching):</strong> Mulch crop rows with dry Napier grass or tea pruning clippings. Organic mulch blocks solar reflection, cutting surface water evaporation by up to 70% and suppressing weeds.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. CROP-SPECIFIC GUIDES TAB */}
      {activeTab === 'crops' && (
        <div className="space-y-6 text-slate-805" id="crops-section">
          
          {/* Crop Selector Filter pills */}
          <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 p-2.5 rounded-2xl border">
            <span className="text-[10px] font-black uppercase text-slate-505 block tracking-wide pl-2">Filter Crop:</span>
            {[
              { id: 'all', label: 'All Crops' },
              { id: 'tea', label: 'Tea Highlands' },
              { id: 'avocado', label: 'Avocado Hass/Fuerte' },
              { id: 'banana', label: 'Banana Groves' },
              { id: 'sorghum', label: 'Sorghum Fields' },
              { id: 'maize', label: 'Maize Staples' },
              { id: 'beans', label: 'Nitrogen Beans' },
              { id: 'vegetables', label: 'Drip Veggies' },
              { id: 'napier', label: 'Napier & Eucalyptus' },
              { id: 'boma_rhodes', label: 'Boma Rhodes' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedCrop(pill.id)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase cursor-pointer transition-all ${
                  selectedCrop === pill.id
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-white text-slate-500 hover:text-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Tea Highlands Card */}
            {(selectedCrop === 'all' || selectedCrop === 'tea') && filterMatches(
              "Tea Cultivation, Pruning & Diseases", 
              ["tea", "clones", "pruning", "grey blight", "rust", "armillaria"],
              "Pruning cycle, plucking standards, Triennial cycles, Grey Blight control, and Armillaria root rot"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-teal-50 text-teal-850 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-teal-200">
                    🍃 TEA HIGHLANDS
                  </span>
                  <Leaf className="text-teal-700 font-bold" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Tea Cultivation, Pruning & Disease Control</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• The Pruning SOP (Triennial):</strong> Pruning back tea bushes every 3 years is mandatory to renew young vegetative flushing stems. Maintain a flat plucking table 24–28 inches above ground.
                  </p>
                  <p>
                    <strong>• Grey Blight (Pestalotiopsis):</strong> Causes circular leaf spots with dark concentric bands, killing young plucking terminals. Protect crops by spraying micronized copper foliar mix right after hard pruning.
                  </p>
                  <p>
                    <strong>• Armillaria Root Rot:</strong> The split lower stems show thick white fungal fans. Dig out the roots of dead plants physically to stop structural propagation across neighboring tea grids.
                  </p>
                </div>
              </div>
            )}

            {/* Avocado Card */}
            {(selectedCrop === 'all' || selectedCrop === 'avocado') && filterMatches(
              "Avocado Fuerte & Hass Agronomy", 
              ["avocado", "hass", "fuerte", "root rot", "anthracnose", "planting", "manure", "ssp"],
              "Avocado planting hole mix, managing Anthracnose spots, Phytophthora Root Rot, and SSP fertilizer needs"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-50 text-emerald-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-100">
                    🥑 AVOCADO HASS & FUERTE
                  </span>
                  <Sprout className="text-emerald-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Avocado Planting & Disease Prevention</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Planting Hole Protocol:</strong> Excavate holes exactly <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">2ft x 2ft x 2ft</code>. Backfill mix: Topsoil + 1 wheelbarrow of composted dry cow manure + 250g of Single Super Phosphate (SSP) fertilizer per hole.
                  </p>
                  <p>
                    <strong>• Phytophthora Root Rot:</strong> Yellowing dead leaves and sparse twig diebacks indicate drowned rotten roots. Apply Copper Oxychloride (Ridomil Gold) soil drench and plant in high-draining sandy areas.
                  </p>
                  <p>
                    <strong>• Anthracnose (Colletotrichum):</strong> Sunken black spots on avocado fruits. Maintain high GlobalGAP branch canopy trimming to allow sunlight. Spray copper hydroxide 21 days pre-harvest.
                  </p>
                </div>
              </div>
            )}

            {/* Banana Card */}
            {(selectedCrop === 'all' || selectedCrop === 'banana') && filterMatches(
              "Banana Plantation Management", 
              ["banana", "spacing", "sigatoka", "weevil", "mulching", "propping", "manure"],
              "Banana grove layouts, Sigatoka spot control, stem weevils, propping heavier banana bunches, dynamic mulching"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-yellow-50 text-amber-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-yellow-250">
                    🍌 BANANA GROVES
                  </span>
                  <Award className="text-yellow-600" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Banana Husbandry & Pest Management</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Spacing & Field Layout:</strong> Plant banana suckers in rows using <span className="font-bold text-slate-900">3 meters x 3 meters</span> grid spacing. Keep only 1 active mother, 1 daughter, and 1 granddaughter stem per clump.
                  </p>
                  <p>
                    <strong>• Black Sigatoka Disease:</strong> Dark leaf streaks that cause premature leaf drop, reducing bunch weights. Prune affected leaves immediately and bury or burn them.
                  </p>
                  <p>
                    <strong>• Stem Weevils & Bunch Support:</strong> Larvae hole the pseudostem base. Keep stem residues neatly chopped to suppress laying spaces. Prop expanding bunches with strong fork branches to stop heavy storm snaps.
                  </p>
                </div>
              </div>
            )}

            {/* Sorghum Card */}
            {(selectedCrop === 'all' || selectedCrop === 'sorghum') && filterMatches(
              "Sorghum Cereal Dryland Agronomy", 
              ["sorghum", "spacing", "smut", "dryland", "hybrid", "moisture", "birds"],
              "Sorghum cereal spacing, wind-resistant seeds, moisture bounds, head smut control, bird scaring"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-orange-50 text-orange-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-orange-150">
                    🌾 SORGHUM DRYLAND
                  </span>
                  <TrendingUp className="text-orange-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Sorghum Husbandry & Head Smut Control</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Row Spacing & Seeding:</strong> Plant seeds directly in furrows spaced <span className="font-bold text-slate-900">60cm apart</span>, then thin seedlings to 15cm per stand. This supports sturdy stalks, preventing dryland wind-bending.
                  </p>
                  <p>
                    <strong>• Sphacelotheca Head Smut:</strong> Black carbon soot bags replace normal starch grains. Plant resistant certified hybrid seeds and practice crop-rotations annually.
                  </p>
                  <p>
                    <strong>• Crop moisture & Bird defenses:</strong> Extremely hardy and drought-tolerant. Protect maturing ears from birds using sound tape, reflective ribbons, or physical bird-mesh nets.
                  </p>
                </div>
              </div>
            )}

            {/* Maize Staples Card */}
            {(selectedCrop === 'all' || selectedCrop === 'maize') && filterMatches(
              "Maize Staples Masterclass", 
              ["maize", "corn", "spacing", "fall armyworm", "borer", "crop", "neem", "sand"],
              "Maize planting layout, Fall Armyworm sand drenching, neem oil whorl dosage, stalk borer prevention"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-amber-50 text-amber-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-205">
                    🌽 MAIZE STAPLES
                  </span>
                  <Award className="text-amber-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Maize Spacing, Pests & Hybrid Selection</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Field Spacing Rule:</strong> Maintain spacing at <span className="font-bold text-slate-900">75cm between rows x 25cm between hills</span> (1 seed per hill). Plant with DAP (Diammonium Phosphate) placed slightly side-shifted.
                  </p>
                  <p>
                    <strong>• Fall Armyworm & Stalk Borer Treatment:</strong> Whorl damage shows ragged leaf holes. Drop fine dry sand, wood ash, or active neem oil solution directly down the plant leaf whorl at early vegetative growth stage.
                  </p>
                  <p>
                    <strong>• Composting & CAN Top-Dressing:</strong> Drench fields with processed cow manure compost at planting. Apply CAN (Calcium Ammonium Nitrate) top-dressing at knee-high height.
                  </p>
                </div>
              </div>
            )}

            {/* Beans Nitrogen Card */}
            {(selectedCrop === 'all' || selectedCrop === 'beans') && filterMatches(
              "Beans Legume Intercropping Layouts", 
              ["beans", "legumes", "intercropping", "nitrogen", "rhizobium", "fly", "rust"],
              "Bean legume intercropping spacing, Rhizobium seedling innoculant, pod yield, bean fly control, bean rust"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-purple-50 text-purple-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-purple-200">
                    🌰 ROTATIONAL BEANS
                  </span>
                  <Activity className="text-purple-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Beans Inoculation & Intercropping</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Legume Seed Inoculation:</strong> Inoculate bean seeds with <span className="font-bold text-slate-900">Rhizobium bacteria powder</span> before planting to jump-start nitrogen-fixing nodules. Use single super phosphate.
                  </p>
                  <p>
                    <strong>• Intercropping with Maize:</strong> Alternate crops utilizing 2 rows of maize and 1 row of beans. This arrangement provides structural shade for beans and supplies local nitrogen to maize lines.
                  </p>
                  <p>
                    <strong>• Bean Fly (Ophiomyia):</strong> Thinned dark stems and wilting seedlings. Ensure early planting with damp healthy composts. Treat severe infestations with organic garlic sprays.
                  </p>
                </div>
              </div>
            )}

            {/* Vegetables Drip Card */}
            {(selectedCrop === 'all' || selectedCrop === 'vegetables') && filterMatches(
              "Vegetables Drip Lines & Wilt", 
              ["vegetables", "tomatoes", "cabbage", "wilt", "calcium", "blossom-end", "drip", "greenhouse"],
              "Drip tomato greenhouses, physical insect sticky traps, crop rotations against bacterial wilt, prevent blossom-end rot"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-150">
                    🍅 DRIP VEGETABLES
                  </span>
                  <Droplets className="text-blue-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Tomato, Cabbage & Pepper Drip Husbandry</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Water Management & Blossom Rot:</strong> Drip tomatoes must receive steady watering. Blossom-End Rot is caused by dry-spell calcium transport failures. Fertigate with water-soluble calcium nitrate.
                  </p>
                  <p>
                    <strong>• Bacterial Wilt (Ralstonia):</strong> Sudden daytime wilting while the plant leaves stay bright green. This pathogen stays dormant in soil. Rotate beds annually with onions or cereals to break the cycle.
                  </p>
                  <p>
                    <strong>• Organic Pesticides & GlobalGAP compliance:</strong> Use yellow sticky insect plates in greenhouse entries. Track pesticide quarantine intervals closely to guarantee biochemical safety of food.
                  </p>
                </div>
              </div>
            )}

            {/* Napier & Eucalyptus Card */}
            {(selectedCrop === 'all' || selectedCrop === 'napier') && filterMatches(
              "Napier & Eucalyptus Agronomy", 
              ["napier", "eucalyptus", "fodder", "windbreak", "timber", "roots"],
              "Napier organic multi-cut zero-grazing feed, Eucalyptus windbreak layout, safeguarding water water tables"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-250">
                    🌳 FODDER & SILVICULTURE
                  </span>
                  <Sprout className="text-emerald-800" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Napier Fodcer & Eucalyptus Woodlots</h3>
                <div className="text-xs leading-relaxed text-slate-605 space-y-3">
                  <p>
                    <strong>• Napier Grass Multi-Cut SOP:</strong> Plant root slips in rows using <span className="font-bold text-slate-900">1m x 1m</span> layouts. Harvest only when the canopy is between <span className="font-bold">2.5 and 4 feet high</span>. Cutting too early reduces overall yield, while cutting too late yields tough, woody, indigestible fodder.
                  </p>
                  <p>
                    <strong>• Eucalyptus Windbreak Architecture:</strong> Fast wind gusts stunt avocado fruit-set. Plant Eucalyptus around field perimeters. Excavate a <span className="font-bold text-slate-900">1.2-meter-deep trench</span> parallel to windbreaks to prevent aggressive Eucalyptus roots from robbing your crops of moisture.
                  </p>
                </div>
              </div>
            )}

            {/* Boma Rhodes Card */}
            {(selectedCrop === 'all' || selectedCrop === 'boma_rhodes') && filterMatches(
              "Boma Rhodes Pasture Agronomy",
              ["boma", "rhodes", "grass", "pasture", "hay", "bales", "forage", "seed"],
              "Boma Rhodes premium forage grass seeding rate, fine seedbed preparation, hay baling SOPs"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-250">
                    🌾 PREMIUM FORAGE PASTURE
                  </span>
                  <Sprout className="text-emerald-800" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Boma Rhodes Pasture SOP & Seed Rate</h3>
                <div className="text-xs leading-relaxed text-slate-605 space-y-3">
                  <p>
                    <strong>• Seeding Rate & Est. Density:</strong> Broadcast seeds at <span className="font-bold text-slate-900">3 - 5 kg per acre</span> on a finely prepared, fine, weed-free seedbed. Maintain adequate soil contact using minimal light soil cover, or simple roller brushing.
                  </p>
                  <p>
                    <strong>• Nitrogen & Canopy Flush:</strong> Apply Nitrogen (CAN) top dressing after the first weeding at <span className="font-bold">50 kg per acre</span> to trigger explosive vegetative flush. Harvest crops exactly at the 50% flowering stage to capture peak leaf nutrition and crude protein content before lignification.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 3. LIVESTOCK HEALTH MANAGEMENT PROTOCOLS TAB */}
      {activeTab === 'livestock' && (
        <div className="space-y-6 text-slate-805" id="livestock-section">

          {/* Animal Selector pills */}
          <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 p-2.5 rounded-2xl border">
            <span className="text-[10px] font-black uppercase text-slate-505 block tracking-wide pl-2">Filter Animal:</span>
            {[
              { id: 'all', label: 'All Beasts' },
              { id: 'cows', label: 'Dairy Bovine' },
              { id: 'goats', label: 'Goats Caprine' },
              { id: 'calves', label: 'Maternity Calves' },
              { id: 'poultry', label: 'Poultry Farm' },
              { id: 'canines', label: 'K-9 Guard Security' },
              { id: 'bsf', label: 'BSF Larvae protein' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedAnimal(pill.id)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase cursor-pointer transition-all ${
                  selectedAnimal === pill.id
                    ? 'bg-rose-955 bg-rose-950 text-white border-rose-950'
                    : 'bg-white text-slate-505 hover:text-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Dairy Cows Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'cows') && filterMatches(
              "Dairy Bovine Veterinary Protocols", 
              ["cows", "milk", "bovine", "foot rot", "milk fever", "mastitis", "calcium", "stripping", "iodine"],
              "Treating milk fever postpartum, 5% copper sulfate footbath, 3-step hygiene stripping mastitis control"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-55 bg-rose-100 text-rose-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-200">
                    🐄 DAIRY BOVINE
                  </span>
                  <Activity className="text-rose-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900 font-sans">Dairy Cow Yield & Disease Prevention</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Postpartum Milk Fever Emergency:</strong> S-curve neck, cold extremities, sternal collapse. DO NOT feed oral drench (danger of aspiration). Slowly infuse <span className="font-bold text-rose-700">450ml of Calcium Borogluconate 20%</span> directly into the jugular vein.
                  </p>
                  <p>
                    <strong>• Mastitis Control (3-Step Hygiene):</strong>
                    <br />1. Strip 2 test streams per teat to flush bacteria.
                    <br />2. Pre-dip with Chlorhexidine, wait 30 sec, wipe dry.
                    <br />3. Seal teats immediately post-milking with thick antiseptic iodine drench.
                  </p>
                  <p>
                    <strong>• Foot Rot (Fusobacterium):</strong> Prevent pasture mud lock. Lead herd through a weekly footbath loaded with <span className="font-bold">5% Copper Sulfate drench</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Goats Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'goats') && filterMatches(
              "Caprine Kids & Goat Husbandry", 
              ["goats", "caprine", "orf", "ccpp", "elevated", "diet", "foot rot"],
              "Vaccinating goats against CCPP, Orf viral sores, designing elevated wooden goat pens, browsing nutrition"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-orange-50 text-orange-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-orange-200">
                    🐐 CAPRINE GOATS
                  </span>
                  <HelpCircle className="text-orange-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Goat Health & Raised-Floor Housing</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Housing (Elevated Slatted Flooring):</strong> Goats cannot stand damp mud. Construct elevated timber floors <span className="font-bold text-slate-900">0.8 meters high</span> with 1.5cm slats. This design allows droppings to fall through cleanly, keeping feet dry to eliminate Foot Rot.
                  </p>
                  <p>
                    <strong>• Contagious Caprine Pleuropneumonia (CCPP):</strong> Highly contagious respiratory disease. Schedule annual vaccines for the entire goat herd. Quarantine new caprine stock for 21 days first.
                  </p>
                  <p>
                    <strong>• Orf (Sore Mouth Virus):</strong> Red, bleeding crusty sores around lips and mouth. Feed soft wilted grass. Keep infected kids isolated and apply mild iodine or potassium permanganate solution directly to sores.
                  </p>
                </div>
              </div>
            )}

            {/* Calves Maternity Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'calves') && filterMatches(
              "Calf Rearing Maternity Protocols", 
              ["calves", "maternity", "colostrum", "navel", "dehorning", "castration", "burdizzo"],
              "Dynamic 10% colostrum weight within 2 hours, navel dipping with 10% iodine, electric dehorning, bloodless Burdizzo"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-teal-50 text-teal-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-teal-200">
                    🍼 MATERNITY CALVES
                  </span>
                  <Award className="text-teal-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Maternity Calf Care & Management</h3>
                
                <div className="text-xs leading-relaxed text-slate-605 space-y-3">
                  <p>
                    <strong>• The 10% Colostrum Gold Standard:</strong> Within exactly <span className="font-bold text-slate-900">2 hours of birth</span>, hand-feed the calf warm colostrum equal to <span className="text-slate-950 font-extrabold text-sm font-mono">10% of its body weight</span>. Colostrum locks maternal antibodies into the calf's digestive tract before it seals.
                  </p>
                  <p>
                    <strong>• Navel Infection Prevention:</strong> Drench the hanging umbilical stem inside a cup of <span className="font-bold text-emerald-800">10% iodine solution</span> immediately post-birth. Repeat daily for 3 days to block systemic bacteria.
                  </p>
                  <p>
                    <strong>• Dehorning & Castration:</strong> Bud horns using an electric iron before 4 weeks. Perform bloodless castration using a <span className="font-bold">Burdizzo clamp</span> before 3 months of age to avoid septic infections.
                  </p>
                </div>
              </div>
            )}

            {/* Poultry Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'poultry') && filterMatches(
              "Poultry Vaccination & Litter Husbandry", 
              ["poultry", "layers", "coccidiosis", "brooder", "chicken", "vaccines", "gumboro", "amprolium"],
              "Brooder hot air settings 32-35C, Marek Newcastle Gumboro drops, damp sand coccidiosis, amprolium"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-yellow-50 text-amber-955 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-yellow-200">
                    🐔 POULTRY FLOCK
                  </span>
                  <TrendingUp className="text-yellow-600" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Poultry Vaccination & Brooding</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Brooder Environmental Parameters:</strong> Day-old chicks require hover temps strictly at <span className="font-bold font-mono">32°C - 35°C</span>. Reduce by 2°C weekly. Top with clean, dry wood shaving layers; avoid fine sawdust, which triggers irreversible poultry respiratory infections.
                  </p>
                  <p>
                    <strong>• Strict Vaccination Pathway:</strong>
                    <br />• Day 1: Marek's & Infectious Bronchitis (Hatchery)
                    <br />• Week 1 & 3: Newcastle disease drops in fresh drinking water.
                    <br />• Week 2: Gumboro (Infectious Bursal Disease) vaccine.
                  </p>
                  <p>
                    <strong>• Coccidiosis Management:</strong> Look for bloody droppings or ruffled feathers. Coccidia thrives in damp conditions. Keep the waterers on raised wire racks. Treat outbreaks immediately with <span className="font-bold">Amprolium 20% Soluble powder</span> or Sulfaclozine in drinking water for 3-5 days. Ensure full 7-day withdrawal period limit.
                  </p>
                </div>
              </div>
            )}

            {/* Canine Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'canines') && filterMatches(
              "Canine Guard Dog Care & Duty Training", 
              ["canines", "dogs", "rabies", "parvovirus", "ticks", "obedience", "dhlpp"],
              "DHLPP vaccine intervals, canine parvo defense, tick-borne ehrlichia, guard training boundaries"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-200">
                    🐕 K-9 SECURE SECURITY
                  </span>
                  <ShieldActionIcon className="text-blue-700" />
                </div>
                <h3 className="text-base font-black text-slate-900">Canine Immunization & Duties</h3>
                
                <div className="text-xs leading-relaxed text-slate-605 space-y-3 text-left">
                  <p>
                    <strong>• Parvovirus Defense Pathway:</strong> Parvo is highly contagious and fatal. Administer canine <span className="font-bold text-slate-900">DHLPP combo shots</span> at weeks 8, 12, and 16, followed by annual boosters. Deliver rabies shots annually.
                  </p>
                  <p>
                    <strong>• Tick-Borne Illness Protection:</strong> Ehrlichia and Babesia parasites destroy canine red blood cells rapidly. Maintain Bravecto chews or weekly flumethrin washes to prevent tick bites.
                  </p>
                  <p>
                    <strong>• Guard Obedience Boundaries:</strong> K-9 units must respect commands completely and release instantly upon human trigger commands. Socialize guard dogs to differentiate roster-approved workers from strangers.
                  </p>
                </div>
              </div>
            )}

            {/* BSF Protein Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'bsf') && filterMatches(
              "Black Soldier Fly (BSF) Larval Breeding", 
              ["bsf", "larvae", "black soldier", "substrate", "protein", "organic", "poultry", "feed"],
              "Larval nursery setup, substrate C:N ratios, moisture range 60-70%, harvesting prep, bypass protein replacement"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-50 text-emerald-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-200">
                    🔬 BSF PROTEIN SYSTEMS
                  </span>
                  <Layers className="text-emerald-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Black Soldier Fly Protein Production</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Hermetia illucens Larval Nursery:</strong> Setup cages for adult flies to mate and lay eggs near structural cardboard slots. Collect hatched tiny larvae and transfer them directly into organic feed waste trays.
                  </p>
                  <p>
                    <strong>• Substrate Feeding & Moisture:</strong> Feed larvae organic fruit leftovers or vegetable residues. Maintain moisture levels meticulously between <span className="font-bold text-slate-900">60% and 70%</span>. Substrates that are too dry halt larval eating, while soggy piles drown larvae.
                  </p>
                  <p>
                    <strong>• Protein Harvesting & Replacement:</strong> Harvest fat larvae after 12 to 14 days, just before they turn into dark pre-pupae. Boil and solar-dry the larvae to produce a premium insect meal containing <span className="font-bold font-mono">42% crude protein</span>. This can replace 50% of commercial fish meal in poultry and fish feed rations.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. INTERACTIVE SMART TOOLS TAB */}
      {activeTab === 'calculators' && (
        <div className="space-y-6 animate-fadeIn" id="calculators-section">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Tool 1: Standing Heat & AI Window Calculator */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="text-purple-700 font-bold animate-spin-slow" size={18} />
                  AM-PM Reproductive Insemination Window Planner
                </h3>
                <span className="bg-purple-100 text-purple-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-200">
                  Tool 1 Upgraded
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Maximize heifers conception ratios. Select the target heifer/cow, input the heat observation details, and directly log the recommended veterinarian artificial insemination task.
              </p>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Select Specimen Cow
                    </label>
                    <select
                      value={selectedCowId || (cows && cows[0]?.id) || 'COW-01'}
                      onChange={(e) => setSelectedCowId(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold focus:border-purple-500 outline-none cursor-pointer"
                    >
                      {((cows && cows.length > 0) ? cows : [
                        { id: 'COW-01', name: 'Jersey Beauty (Jersey)' },
                        { id: 'COW-02', name: 'Ayrshire Crown (Ayrshire)' },
                        { id: 'HEIFER-01', name: 'Maziwa Mingi (Friesian)' }
                      ]).map(c => (
                        <option key={c.id} value={c.id}>{c.name} [Tag: {c.id}]</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Time Heat Observed
                    </label>
                    <input 
                      type="time" 
                      value={heatTime}
                      onChange={(e) => setHeatTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold font-mono focus:border-purple-500 outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Observation Focus Period
                  </label>
                  <select
                    value={heatPeriod}
                    onChange={(e) => setHeatPeriod(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold focus:border-purple-500 outline-none cursor-pointer"
                  >
                    <option value="morning">Morning (AM Standing Mount - Heat starts around 6am)</option>
                    <option value="afternoon">Evening/Afternoon (PM Standing Mount - Heat starts around 6pm)</option>
                  </select>
                </div>

                {/* Fertile Window Visualizer Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    <span>Heat Start</span>
                    <span className="text-purple-750 font-black text-purple-700">Optimal Window (9-18 Hours Peak)</span>
                    <span>Window Closes</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-slate-300" style={{ width: '30%' }} title="Early Stage (0-9h) - Low fertility" />
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-700 animate-pulse" style={{ width: '45%' }} title="Optimal Window (9-18h) - HIGH fertility" />
                    <div className="h-full bg-slate-300" style={{ width: '25%' }} title="Late Stage (18-24h) - Declining fertility" />
                  </div>
                </div>

                <div className="bg-purple-950 text-purple-100 p-4 rounded-xl space-y-2 border border-purple-800">
                  <span className="text-[10px] font-black uppercase bg-purple-800 text-white px-2 py-0.5 rounded tracking-wide">
                    👑 CRITICAL VET AI INSIGHT RECOMMENDATION
                  </span>
                  
                  <div className="text-xs leading-relaxed space-y-2">
                    {heatPeriod === 'morning' ? (
                      <div>
                        • Optimal Semen Insertion: <span className="font-extrabold text-yellow-405 block text-sm mt-0.5">Today between 3:00 PM and 9:00 PM</span>
                        • Rationale: Inseminate in the evening for morning heats. This timing ensures sperm capacitation aligns with ovulation (about 10 hours later).
                      </div>
                    ) : (
                      <div>
                        • Optimal Semen Insertion: <span className="font-extrabold text-yellow-405 block text-sm mt-0.5">Tomorrow morning before 11:30 AM</span>
                        • Rationale: Inseminate the following morning for evening heats, to ensure viable sperm meet the released ovum.
                      </div>
                    )}
                  </div>
                </div>

                {/* Logging Trigger Button */}
                <button
                  type="button"
                  onClick={() => handleRecordInsemination(
                    selectedCowId || (cows && cows[0]?.id) || 'COW-01',
                    heatPeriod === 'morning' ? 'Today 3:00 PM - 9:00 PM' : 'Tomorrow 6:00 AM - 11:30 AM'
                  )}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black text-xs uppercase py-3 rounded-xl border border-purple-600 transition-all cursor-pointer flex items-center justify-center gap-2 m-0"
                >
                  <Plus size={14} />
                  Record Insemination to Vet Logs
                </button>

                {tool1Message && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl font-bold animate-fadeIn">
                    {tool1Message}
                  </div>
                )}
              </div>
            </div>

            {/* Tool 2: Biogas Digester Loading Optimizer */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Flame className="text-amber-500 font-bold" size={18} />
                  Biogas Slurry Loading & Yield Estimator
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                  Tool 2 Upgraded
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Estimate how many kilograms of fresh bovine dung and water are needed daily to generate high methane gas pressures without souring risks.
              </p>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-150">
                  <span className="text-[10px] font-bold text-slate-500">Live Active Herd Size:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-xs">{cows?.length || 3} Cattle</span>
                    <button
                      type="button"
                      onClick={() => {
                        const count = cows?.length || 3;
                        // Limit to maximum supported volume (10 m3) or calculate: 0.8 m3 per cow
                        setBiogasVolume(Math.min(10, Math.max(1, parseFloat((count * 0.8).toFixed(1)))));
                      }}
                      className="bg-amber-50 border border-amber-200 text-amber-900 font-black text-[9px] uppercase px-2 py-1 rounded hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      Sync Volume
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Target Gas Generation: <strong className="text-emerald-800 font-mono font-black text-sm">{biogasVolume} m³</strong> per day
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5"
                    value={biogasVolume}
                    onChange={(e) => setBiogasVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-850" 
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-450 mt-1 font-mono">
                    <span>1 m³ (Single Burner)</span>
                    <span>10 m³ (Large Generator)</span>
                  </div>
                </div>

                {/* Methane Pressure Indicator Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-405 tracking-wider">
                    <span>Low Pressure</span>
                    <span className="text-amber-600">Optimal Digestion Zone</span>
                    <span>High Danger</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-slate-300" style={{ width: `${Math.max(0, Math.min(100, (biogasVolume / 10) * 100))}%` }} />
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold block text-center leading-normal">
                    {biogasVolume < 3 ? '● Sub-optimal loading (low pressure)' : biogasVolume <= 7.5 ? '✓ Perfect biological loading & high pressures' : '⚠️ Extreme Loading - Monitor digestor acid content'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center">
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Cattle Dung Required</span>
                    <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{(biogasVolume * 25).toFixed(0)} KG</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">Roughly {(biogasVolume * 2.5).toFixed(1)} cows</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center">
                    <span className="text-[9px] font-black uppercase text-slate-405 block tracking-wider">Water Mix Amount</span>
                    <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{(biogasVolume * 25).toFixed(0)} Liters</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">1:1 Dilution standard</span>
                  </div>
                </div>

                <div className="bg-emerald-950 text-slate-100 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="text-yellow-405 font-black block text-[10px] uppercase tracking-wide">🍂 Recycling Bio-slurry bypass:</span>
                  <span>This system yields approximately <strong className="font-mono text-white">{(biogasVolume * 45).toFixed(0)} L</strong> of ammoniacal premium fertilizer daily, perfect for avocado trees or Napier crops.</span>
                </div>

                {/* Harvesting Integration Trigger */}
                <button
                  type="button"
                  onClick={handleLogBiogasSlurry}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase py-3 rounded-xl border border-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2 m-0"
                >
                  Harvest Bio-slurry & Log Green Offset
                </button>

                {tool2Message && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl font-bold animate-fadeIn leading-relaxed">
                    {tool2Message}
                  </div>
                )}
              </div>
            </div>

            {/* Tool 3: TMR Feed Protein Optimizer */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4 md:col-span-1 lg:col-span-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calculator className="text-emerald-700 font-bold" size={18} />
                  Lactation Dairy CP Protein Target Estimator
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                  Tool 3 Upgraded
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Determine if your feeding mixture satisfies the Crude Protein (CP) threshold required for high-yield dairy cows. Check premium organic supplements to boost feed density.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Current Cow Daily Milk Yield (Liters/day)
                    </label>
                    <input 
                      type="number"
                      value={currentMilk}
                      onChange={(e) => setCurrentMilk(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold font-mono focus:border-emerald-600 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Base Feed Crude Protein (CP) (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="10" 
                        max="22" 
                        value={currentProtein}
                        onChange={(e) => setCurrentProtein(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700" 
                      />
                      <span className="text-xs font-black font-mono bg-white px-2.5 py-1 rounded border border-emerald-200/50 text-emerald-800">{currentProtein}%</span>
                    </div>
                  </div>

                  {/* Interactive Ingredient Boosters */}
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Add Premium Protein Boosters
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { name: 'Lucerne/Alfalfa (Hay)', cpBoost: 3, desc: 'High fiber & protein (+3% CP)' },
                        { name: 'Cottonseed Cake (Bypass)', cpBoost: 4, desc: 'Bypass amino acids (+4% CP)' },
                        { name: 'Brewer\'s Dried Grains (BDG)', cpBoost: 5, desc: 'Palatable fermented feed (+5% CP)' },
                        { name: 'Concentrated Fish Meal', cpBoost: 6, desc: 'High density lysine (+6% CP)' }
                      ].map(booster => {
                        const isChecked = tool3ActiveIngredients.includes(booster.name);
                        return (
                          <label key={booster.name} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setTool3ActiveIngredients(tool3ActiveIngredients.filter(n => n !== booster.name));
                                } else {
                                  setTool3ActiveIngredients([...tool3ActiveIngredients, booster.name]);
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            <div>
                              <span className="text-xs font-black text-slate-800 block leading-tight">{booster.name}</span>
                              <span className="text-[10px] text-slate-500 block leading-normal font-semibold">{booster.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  {(() => {
                    const requiredProtein = currentMilk < 10 ? 12 : currentMilk < 20 ? 14 : currentMilk < 30 ? 16 : 18;
                    const boosterCp = tool3ActiveIngredients.reduce((acc, name) => {
                      const cpMap: Record<string, number> = {
                        'Lucerne/Alfalfa (Hay)': 3,
                        'Cottonseed Cake (Bypass)': 4,
                        'Brewer\'s Dried Grains (BDG)': 5,
                        'Concentrated Fish Meal': 6
                      };
                      return acc + (cpMap[name] || 0);
                    }, 0);
                    const totalCpCalculated = currentProtein + boosterCp;
                    const isSatisfied = totalCpCalculated >= requiredProtein;
                    return (
                      <div className="space-y-4">
                        <div className={`p-5 rounded-2xl border transition-all ${
                          isSatisfied 
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-200' 
                            : 'bg-rose-50 text-rose-950 border-rose-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className={isSatisfied ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'} size={18} />
                            <span className="text-xs font-black uppercase tracking-tight">
                              {isSatisfied ? 'Dietary Protein Satisfied!' : 'Protein Deficiency Alert'}
                            </span>
                          </div>
                          <div className="text-xs space-y-2 font-medium">
                            <p>
                              • Yield: <strong className="font-mono text-sm">{currentMilk}L/day</strong> requires a minimum crude protein level of <strong className="font-sans text-sm">{requiredProtein}% CP</strong>.
                            </p>
                            <p>
                              • Base Feed CP: <strong className="font-mono text-sm">{currentProtein}% CP</strong>.
                            </p>
                            {boosterCp > 0 && (
                              <p>
                                • Supplements Boost: <strong className="font-mono text-sm text-emerald-800">+{boosterCp}% CP</strong> from {tool3ActiveIngredients.length} ingredients.
                              </p>
                            )}
                            <p className="border-t border-slate-200 pt-2 mt-2">
                              • Total Adjusted Feed CP: <strong className="font-mono text-base text-slate-900">{totalCpCalculated}% CP</strong>.
                            </p>
                            {!isSatisfied && (
                              <p className="bg-rose-950/10 p-2.5 rounded font-black text-[10px] text-rose-900 leading-normal">
                                💡 Upgrade Advice: Incorporate more supplements (like cottonseed cake or brewer's grains) to satisfy the {requiredProtein}% CP protein threshold.
                              </p>
                            )}
                            {isSatisfied && (
                              <p className="bg-emerald-950/10 p-2.5 rounded font-black text-[10px] text-emerald-900 leading-normal">
                                🚀 Perfect! Your feed mix provides ideal nitrogen densities to foster active rumen bacteria fermentation, maximizing milk volumes.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Save Action Log button */}
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().replace('T', ' ').substring(0, 16);
                            const newLog = {
                              id: 'feed-formula-' + Date.now(),
                              timestamp: today,
                              taskTitle: 'Saved TMR Ration Formula',
                              deductionText: `Calculated formula for ${currentMilk}L yield. Base CP: ${currentProtein}%, Supp CP: +${boosterCp}%, Total: ${totalCpCalculated}% CP. Ingredients: ${tool3ActiveIngredients.join(', ') || 'None'}. Status: ${isSatisfied ? 'Pass' : 'Deficient'}.`,
                              success: true
                            };
                            setActionLogs(prev => {
                              const updated = [newLog, ...prev];
                              localStorage.setItem('jr_farm_academy_auto_deduct_logs', JSON.stringify(updated));
                              return updated;
                            });
                            alert(`✓ Formulated TMR Ration saved successfully to Action Logs history!`);
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-805 text-white font-black text-xs uppercase py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 m-0"
                        >
                          Save TMR Ration Formula to Logs
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Tool 4: NPK & SSP Organic Planting Fertilizer Dosage Calculator */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4 md:col-span-1 lg:col-span-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calculator className="text-amber-600 font-bold" size={18} />
                  NPK & SSP Crop Fertilizer Dosage Calculator
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                  Tool 4 Upgraded
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Determine exactly how many 50kg bags of planting and top-dressing fertilizers are required based on your target crop type and acreage. Deduct directly from your store inventory!
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Target Crop Name
                      </label>
                      <select
                        value={calcCrop}
                        onChange={(e) => setCalcCrop(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold cursor-pointer focus:border-amber-500 outline-none"
                      >
                        <option value="maize">Maize Staples</option>
                        <option value="tea">Tea Highlands</option>
                        <option value="avocado">Avocado Hass/Fuerte</option>
                        <option value="banana">Banana Groves</option>
                        <option value="sorghum">Sorghum Cereal</option>
                        <option value="beans">Rotational Beans</option>
                        <option value="vegetables">Drip Vegetables</option>
                        <option value="napier">Napier Fodder grass</option>
                        <option value="eucalyptus">Eucalyptus Woodlots</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Link to Farm Block
                      </label>
                      <select
                        value={selectedFieldId || 'Block Alpha'}
                        onChange={(e) => setSelectedFieldId(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold cursor-pointer focus:border-amber-500 outline-none"
                      >
                        {((fieldRecords && fieldRecords.length > 0) ? fieldRecords : [
                          { id: '1', blockName: 'Block Alpha (Tomatoes)' },
                          { id: '2', blockName: 'Block Beta (Maize)' },
                          { id: '3', blockName: 'West Orchard (Avocados)' }
                        ]).map(f => (
                          <option key={f.id} value={f.blockName || f.blockName}>{f.blockName || f.blockName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Farm Area (Acres): <strong className="text-amber-800 font-mono text-xs">{calcAcreage} Acre(s)</strong>
                    </label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="20" 
                      step="0.5"
                      value={calcAcreage}
                      onChange={(e) => setCalcAcreage(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-405 mt-1 font-mono">
                      <span>0.5 Acre</span>
                      <span>20 Acres</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  {(() => {
                    const data = fertilizerDb[calcCrop];
                    if (!data) return null;
                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-slate-800 space-y-3">
                          <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                            <span className="text-base">🧪</span>
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                              Calculation results ({calcAcreage} Acre{calcAcreage !== 1 ? 's' : ''})
                            </span>
                          </div>
                          
                          <div className="text-xs space-y-2">
                            <p>
                              • <strong>Planting Requirement:</strong>
                              <span className="block font-bold text-slate-900 font-mono mt-0.5 text-xs">
                                {data.planting.includes('—') 
                                  ? `${data.planting.split('—')[0]}— ${(parseFloat(data.planting.split('—')[1]) * calcAcreage).toFixed(1)} bag(s)`
                                  : `${calcAcreage} crop dose volume equivalent`}
                              </span>
                            </p>
                            <p>
                              • <strong>Top-Dressing Requirement:</strong>
                              <span className="block font-bold text-slate-900 font-mono mt-0.5 text-xs">
                                {data.topDressing.includes('—') 
                                  ? `${data.topDressing.split('—')[0]}— ${(parseFloat(data.topDressing.split('—')[1]) * calcAcreage).toFixed(1)} bag(s)`
                                  : `${calcAcreage} crop top-dose equivalents`}
                              </span>
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-200/50 mt-2 text-[10px] text-slate-505 font-semibold leading-normal">
                              <span className="font-black text-amber-900 block mb-0.5">💡 APPLICATION SOP:</span>
                              {data.notes}
                            </div>
                          </div>
                        </div>

                        {/* Deduct Stock Integration Trigger */}
                        <button
                          type="button"
                          onClick={() => handleVerifyAndDeductFertilizer(calcCrop, calcAcreage, data)}
                          className="w-full bg-amber-700 hover:bg-amber-850 text-white font-black text-xs uppercase py-3 rounded-xl border border-amber-600 transition-all cursor-pointer flex items-center justify-center gap-2 m-0"
                        >
                          Verify & Deduct from Store Inventory
                        </button>

                        {tool4Message && (
                          <div className={`p-3 rounded-xl border text-xs font-bold animate-fadeIn leading-relaxed ${
                            tool4Message.type === 'error' 
                              ? 'bg-rose-50 border-rose-200 text-rose-800' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}>
                            {tool4Message.text}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Tool 5: Milk-to-Feed Profit Margin Analyzer */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4 md:col-span-1 lg:col-span-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="text-emerald-700 font-bold" size={18} />
                Milk-to-Feed Profit Margin Analyzer
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Tune your dairy cow feeding rations and instantly recalculate feed cost margins relative to daily milk revenue. Optimize feed conversions with bio-slurry values.
              </p>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Controls */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                        Daily Milk Yield: <strong className="text-emerald-700 font-mono text-sm">{analyzerMilkYield} Liters</strong>
                      </label>
                      <input 
                        type="range" min="5" max="60" step="1"
                        value={analyzerMilkYield}
                        onChange={(e) => setAnalyzerMilkYield(parseInt(e.target.value) || 20)}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                      />
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 font-mono">
                        <span>5 Liter/day</span>
                        <span>60 Liters</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                        Milk Selling Price: <strong className="text-emerald-700 font-mono text-sm">{analyzerMilkPrice} KES/L</strong>
                      </label>
                      <input 
                        type="range" min="30" max="120" step="5"
                        value={analyzerMilkPrice}
                        onChange={(e) => setAnalyzerMilkPrice(parseInt(e.target.value) || 65)}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                      />
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 font-mono">
                        <span>30 KES</span>
                        <span>120 KES / Liter</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/50 pt-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Daily Rations Cost Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Silage/Fodder */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[9px] font-black uppercase text-indigo-800 block mb-1">☘️ Fodder/Silage</label>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span>{analyzerSilageKg} kg</span>
                          <span className="text-indigo-600">@{analyzerSilageCost}/kg</span>
                        </div>
                        <input 
                          type="range" min="5" max="45" step="1"
                          value={analyzerSilageKg}
                          onChange={(e) => setAnalyzerSilageKg(parseInt(e.target.value) || 15)}
                          className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <div className="flex gap-1 items-center mt-2">
                          <span className="text-[8px] text-slate-400 font-black uppercase shrink-0">Cost KES/kg:</span>
                          <input 
                            type="number" min="0" max="50"
                            value={analyzerSilageCost}
                            onChange={(e) => setAnalyzerSilageCost(parseInt(e.target.value) || 0)}
                            className="w-12 bg-slate-50 border border-slate-200 text-[10px] px-1 py-0.5 rounded font-mono font-bold text-center"
                          />
                        </div>
                      </div>

                      {/* Concentrates */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[9px] font-black uppercase text-amber-800 block mb-1">🌾 Dairy Meals</label>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span>{analyzerMealKg} kg</span>
                          <span className="text-amber-600">@{analyzerMealCost}/kg</span>
                        </div>
                        <input 
                          type="range" min="1" max="25" step="1"
                          value={analyzerMealKg}
                          onChange={(e) => setAnalyzerMealKg(parseInt(e.target.value) || 4)}
                          className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-amber-600"
                        />
                        <div className="flex gap-1 items-center mt-2">
                          <span className="text-[8px] text-slate-400 font-black uppercase shrink-0">Cost KES/kg:</span>
                          <input 
                            type="number" min="0" max="150"
                            value={analyzerMealCost}
                            onChange={(e) => setAnalyzerMealCost(parseInt(e.target.value) || 0)}
                            className="w-12 bg-slate-50 border border-slate-200 text-[10px] px-1 py-0.5 rounded font-mono font-bold text-center"
                          />
                        </div>
                      </div>

                      {/* Legumes/High Protein */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[9px] font-black uppercase text-rose-800 block mb-1">🌻 Lucerne/Protein</label>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span>{analyzerSupplementsKg} kg</span>
                          <span className="text-rose-600">@{analyzerSupplementsCost}/kg</span>
                        </div>
                        <input 
                          type="range" min="0" max="15" step="1"
                          value={analyzerSupplementsKg}
                          onChange={(e) => setAnalyzerSupplementsKg(parseInt(e.target.value) || 0)}
                          className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-rose-600"
                        />
                        <div className="flex gap-1 items-center mt-2">
                          <span className="text-[8px] text-slate-400 font-black uppercase shrink-0">Cost KES/kg:</span>
                          <input 
                            type="number" min="0" max="100"
                            value={analyzerSupplementsCost}
                            onChange={(e) => setAnalyzerSupplementsCost(parseInt(e.target.value) || 0)}
                            className="w-12 bg-slate-50 border border-slate-200 text-[10px] px-1 py-0.5 rounded font-mono font-bold text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">♻️</span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-950 block">Bio-Slurry Manure Recycling</span>
                        <span className="text-[9px] text-slate-500 font-semibold leading-normal">Represents dry pasture chemical fertilizer cost savings of equivalent dung value (+150 KES/day)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAnalyzerIncludeBioslurry(!analyzerIncludeBioslurry)}
                      className={`text-[9px] font-black uppercase px-3.5 py-2 rounded-lg border cursor-pointer transition-all ${
                        analyzerIncludeBioslurry 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {analyzerIncludeBioslurry ? '● ACTIVE CREDIT' : '○ EXCLUDE'}
                    </button>
                  </div>
                </div>

                {/* Arithmetic Summary */}
                {(() => {
                  const revenue = analyzerMilkYield * analyzerMilkPrice;
                  const feedCost = (analyzerSilageKg * analyzerSilageCost) + (analyzerMealKg * analyzerMealCost) + (analyzerSupplementsKg * analyzerSupplementsCost);
                  const slurryValue = analyzerIncludeBioslurry ? 150 : 0;
                  const netDailyMargin = revenue - feedCost + slurryValue;
                  const feedToRevenueRatio = revenue > 0 ? (feedCost / revenue) * 100 : 0;
                  
                  return (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="border-b border-slate-100 pb-2">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Estimated Revenue</span>
                          <span className="block font-black text-emerald-700 font-mono text-base">+{revenue.toLocaleString()} KES / day</span>
                        </div>
                        
                        <div className="border-b border-slate-100 pb-2">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Feed Intake Costs</span>
                          <span className="block font-black text-rose-700 font-mono text-base">-{feedCost.toLocaleString()} KES / day</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">NET Daily Yield Profit</span>
                          <span className="block font-black text-emerald-950 font-mono text-xl">{(netDailyMargin).toLocaleString()} KES / day</span>
                        </div>
                      </div>

                      {/* Feed Margin ratio */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-slate-500">Feed Cost Ratio:</span>
                          <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md ${
                            feedToRevenueRatio < 45 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : feedToRevenueRatio <= 60 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>{feedToRevenueRatio.toFixed(1)}%</span>
                        </div>

                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                          <div style={{ width: `${Math.min(feedToRevenueRatio, 100)}%` }} className={`h-full ${
                            feedToRevenueRatio < 45 ? 'bg-emerald-500' : feedToRevenueRatio <= 60 ? 'bg-amber-500' : 'bg-rose-600'
                          }`} />
                        </div>
                        <span className="text-[8px] text-slate-400 font-bold block text-center leading-normal">
                          Allowable max limit: 60% of revenue
                        </span>
                      </div>

                      <div className="p-3 rounded-xl text-[9px] leading-relaxed font-semibold bg-indigo-50 border border-indigo-100/50 text-indigo-950">
                        <span className="block font-black text-indigo-900 text-[10px] mb-0.5 uppercase">💡 DIETARY OPTIMIZATION RULE:</span>
                        {feedToRevenueRatio < 45 ? (
                          "✓ Exceptional feed conversion! Your cow converts fodder into milk extremely efficiently. Keep up the high dry matter ratios."
                        ) : feedToRevenueRatio <= 60 ? (
                          "⚠️ Moderate feed threshold margin. To elevate net profits, raise local high-protein fodders (Desmodium, Sesbania) to offset commercial meals."
                        ) : (
                          "🚨 High Feed Deficit Expense! You are overfed on commercial concentrates relative to milk revenues. Limit dairy meal ration to 1kg per 2.5L yielded."
                        )}
                      </div>

                      {/* Publish to Financial Ledger Trigger */}
                      <button
                        type="button"
                        onClick={() => handlePublishFeedMarginProfit(revenue, feedCost)}
                        className="w-full bg-emerald-700 hover:bg-emerald-850 text-white font-black text-xs uppercase py-3 rounded-xl border border-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2 m-0"
                      >
                        <Plus size={14} />
                        Publish to Financial Ledger
                      </button>

                      {tool5Message && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] p-2.5 rounded-xl font-bold animate-fadeIn leading-relaxed">
                          {tool5Message}
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. DIAGNOSTICS TROUBLESHOOTING WIZARD TAB */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6 animate-fadeIn" id="diagnostics-section">
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="text-3xl bg-blue-100 p-2.5 rounded-2xl">🩺</span>
              <div>
                <h3 className="text-lg font-black text-blue-950">Interactive Diagnostics troubleshooting wizard</h3>
                <p className="text-xs text-blue-800 font-medium leading-relaxed max-w-2xl mt-0.5">
                  Select a farm target (beasts or crops) and enter their major symptoms. Our expert diagnostic system will generate a science-backed treatment, exact chemical dosage, withdrawal periods, and long-term SOPs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              {/* Category selector */}
              <div className="lg:col-span-4 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-blue-900 block mb-2 tracking-wider">Select Domain</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setDiagCategory('crops');
                        setDiagSelectedTarget('tomato');
                        setDiagSelectedSymptom('');
                      }}
                      className={`py-3 px-4 rounded-xl border font-black text-xs uppercase cursor-pointer transition-all ${
                        diagCategory === 'crops'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      🌱 Crop Agronomy
                    </button>
                    <button
                      onClick={() => {
                        setDiagCategory('livestock');
                        setDiagSelectedTarget('cow');
                        setDiagSelectedSymptom('');
                        setCustomDiagResult(null);
                        setCustomSymptom('');
                      }}
                      className={`py-3 px-4 rounded-xl border font-black text-xs uppercase cursor-pointer transition-all ${
                        diagCategory === 'livestock'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      🐄 Livestock Veterinary
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-blue-900 block mb-2 tracking-wider">Select Specimen</label>
                  <div className="grid grid-cols-2 gap-2">
                    {diagCategory === 'crops' ? (
                      ['tomato', 'maize', 'avocado', 'banana'].map((crop) => (
                        <button
                          key={crop}
                          onClick={() => {
                            setDiagSelectedTarget(crop);
                            setDiagSelectedSymptom('');
                            setCustomDiagResult(null);
                            setCustomSymptom('');
                          }}
                          className={`py-2 px-3 rounded-lg border font-black text-[10px] uppercase text-left capitalize shrink-0 cursor-pointer ${
                            diagSelectedTarget === crop
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-extrabold'
                              : 'bg-white border-slate-200 text-slate-605'
                          }`}
                        >
                          {crop === 'tomato' && '🍅 '}
                          {crop === 'maize' && '🌽 '}
                          {crop === 'avocado' && '🥑 '}
                          {crop === 'banana' && '🍌 '}
                          {crop}
                        </button>
                      ))
                    ) : (
                      ['cow', 'chicken'].map((animal) => (
                        <button
                          key={animal}
                          onClick={() => {
                            setDiagSelectedTarget(animal);
                            setDiagSelectedSymptom('');
                            setCustomDiagResult(null);
                            setCustomSymptom('');
                          }}
                          className={`py-2 px-3 rounded-lg border font-black text-[10px] uppercase text-left capitalize shrink-0 cursor-pointer ${
                            diagSelectedTarget === animal
                              ? 'bg-blue-55 border-blue-400 text-blue-900 font-extrabold'
                              : 'bg-white border-slate-200 text-slate-605'
                          }`}
                        >
                          {animal === 'cow' && '🐄 '}
                          {animal === 'chicken' && '🐔 '}
                          {animal}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-blue-900 block mb-2 tracking-wider">Select Observable Symptoms</label>
                    {(() => {
                      const matchedSymptoms = diagSelectedTarget === 'tomato' 
                        ? [
                            "Leaves curling upwards with yellow/purplish borders, stunted plant growth",
                            "Water-soaked dark lesions on leaves, rapid canopy collapse after rainy weeks",
                            "Fruit bottom turning dark, sunken, leathery and flat"
                          ]
                        : diagSelectedTarget === 'maize'
                        ? [
                            "Tiny yellow-green streaks on leaves, cobs are tiny and dry prematurely"
                          ]
                        : diagSelectedTarget === 'avocado'
                        ? [
                            "Pale yellowing leaves, tip dieback of branches, roots are black and brittle"
                          ]
                        : diagSelectedTarget === 'banana'
                        ? [
                            "Bacterial yellow oozing from cut stems, premature fruit ripening with rusty dry rot"
                          ]
                        : diagSelectedTarget === 'cow'
                        ? [
                            "Swollen hot udder quarters, milk contains yellow clots, watery/bloody fluid",
                            "High fever (41°C), swollen lymph nodes below the ears, pale gums, heavy panting"
                          ]
                        : diagSelectedTarget === 'chicken'
                        ? [
                            "Bloody diarrhea, ruffled feathers, pale combs, and high mortality"
                          ]
                        : [];

                      return (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {matchedSymptoms.map((sym) => (
                            <button
                              key={sym}
                              onClick={() => {
                                setDiagSelectedSymptom(sym);
                                setCustomDiagResult(null);
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-[11px] leading-relaxed transition-all cursor-pointer ${
                                diagSelectedSymptom === sym
                                  ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              • {sym}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Interactive input box to enter ANY symptom custom dynamically */}
                  <div className="bg-white/80 p-4 border border-blue-200/60 rounded-2xl space-y-3 shadow-xs">
                    <label className="text-[10px] font-black uppercase text-blue-900 block tracking-wider leading-none">
                      🖋️ OR TYPE ANY CUSTOM SYMPTOM DETAILS
                    </label>
                    <p className="text-[9px] text-slate-500 font-medium">
                      Enter any specific observable health issues or crop anomalies to query our live clinical diagnostic classification.
                    </p>
                    <textarea
                      rows={3}
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      placeholder={`Describe symtoms (e.g. My ${diagSelectedTarget} has lost weight, is coughing, running a high fever, discharging eye liquid...)`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-400 transition-all font-medium resize-none leading-relaxed"
                    />
                    <button
                      onClick={handleCustomAiDiagnose}
                      disabled={isDiagnoseLoading || !customSymptom.trim()}
                      className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm transition-all ${
                        isDiagnoseLoading || !customSymptom.trim()
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.01]'
                      }`}
                    >
                      {isDiagnoseLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Running AI Diagnosis...
                        </>
                      ) : (
                        <>🔬 AI Diagnose Symptom</>
                      )}
                    </button>
                    {diagnoseError && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1 text-center bg-emerald-50 rounded py-1 px-1.5 border border-emerald-100/50">
                        {diagnoseError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Outcome report details */}
              <div className="lg:col-span-8">
                {(() => {
                  const targetList = diagnosticsDb[diagSelectedTarget];
                  const dObj = diagSelectedSymptom 
                    ? targetList?.find(item => item.symptom === diagSelectedSymptom)
                    : customDiagResult;

                  if (!dObj) {
                    return (
                      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 h-full">
                        <span className="text-4xl">🔍</span>
                        <div className="space-y-1">
                          <p className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Awaiting Specimen Observations</p>
                          <p className="text-[10px] text-slate-400 font-medium">Select target domain, dynamic crop/animal species, and checking diagnostic symptoms OR write your own custom symptoms inside the box to compile real-time treatment SOPs.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-2xl border border-blue-200/80 shadow-md p-6 space-y-5 animate-scaleUp">
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-100 text-rose-800 font-extrabold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-md border border-rose-200/70">
                              {dObj.likelihood.toUpperCase()} LIKELIHOOD Diagnosis
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mt-2">{dObj.conditionName}</h4>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">Pathogen Structure: {dObj.pathogen}</span>
                        </div>
                        <span className="text-3xl">☣️</span>
                      </div>

                      {/* Display the symptoms that triggered this */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 block pb-0.5">Observed Symptoms analyzed</span>
                        <p className="text-[11px] text-slate-650 leading-relaxed font-bold italic text-slate-600">"{dObj.symptom}"</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Immediate Chemical/Veterinary SOP</span>
                          <p className="text-xs text-slate-800 leading-normal font-semibold">{dObj.treatment}</p>
                        </div>
                        
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-1 font-semibold">
                          <span className="text-[9px] font-black uppercase text-amber-800 block">Quarantine & Withholding Rules</span>
                          <p className="text-xs text-amber-955 text-amber-900 leading-normal">{dObj.quarantine}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-blue-900 block">Scientific Biology Description</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{dObj.description}</p>
                      </div>

                      <div className="bg-slate-550 bg-slate-900 text-white p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-yellow-400 block tracking-wider uppercase">🛡️ LONG-TERM BIOLOGICAL CONTROL ACTION (GAP)</span>
                        <p className="text-xs text-slate-200 leading-normal font-medium">{dObj.prevention}</p>
                      </div>

                      {/* Clinical-to-Field / Veterinary Direct Pipeline Actions (Improvements 1, 2, 3) */}
                      <div className="border-t border-slate-200/60 pt-4 mt-2 space-y-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                          🔗 Clinical Integration Pipeline (Active)
                        </span>
                        
                        {diagCategory === 'crops' ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-black text-emerald-950 uppercase">Schedule Remediation Spraying</h5>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Crop Path</span>
                            </div>
                            <p className="text-[11px] text-slate-650 leading-normal">
                              Automatically seed this clinical treatment onto the GlobalGAP Spray Log & set the safe harvest block restriction dates based on withholding margins.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Remediation Block</label>
                                <select 
                                  value={remediationBlock}
                                  onChange={(e) => setRemediationBlock(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                >
                                  <option value="Block Alpha - Tomatoes">Block Alpha - Tomatoes</option>
                                  <option value="Block Beta - Maize/Napier">Block Beta - Maize/Napier</option>
                                  <option value="Block Gamma - Orchards">Block Gamma - Orchards</option>
                                  <option value="General Greenhouse A">General Greenhouse A</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Estimated Application Cost (Ksh)</label>
                                <input 
                                  type="number"
                                  value={remediationCost}
                                  onChange={(e) => setRemediationCost(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleLogCropRemediation(dObj)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer border-0"
                            >
                              <Plus size={14} /> Commit & Sync Remediation Spray
                            </button>
                          </div>
                        ) : diagSelectedTarget === 'chicken' ? (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-black text-amber-900 uppercase">Record Poultry Treatment & Eggs block</h5>
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase font-sans">Poultry Path</span>
                            </div>
                            <p className="text-[11px] text-slate-650 leading-normal">
                              Log flock-wide medical treatment for specific chicken coops, calculate safe withdrawal buffers for eggs sales, and synchronise operational veterinary expenses automatically.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase font-sans">Affected Poultry Cohort</label>
                                <select 
                                  value={selectedPoultryCoop}
                                  onChange={(e) => setSelectedPoultryCoop(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                >
                                  <option value="COOP-A">Coop Alpha - Layers</option>
                                  <option value="COOP-B">Coop Beta - Broilers</option>
                                  <option value="CHICK-C">Brooding House C</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase font-sans">Veterinary clinical cost (Ksh)</label>
                                <input 
                                  type="number"
                                  value={remediationCost}
                                  onChange={(e) => setRemediationCost(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleLogPoultryTreatment(dObj)}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer border-0"
                            >
                              <Plus size={14} /> Commit & Sync Poultry Vet Record
                            </button>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-black text-blue-900 uppercase">Record Veterinary Treatment & Milk block</h5>
                              <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase font-sans">Livestock Path</span>
                            </div>
                            <p className="text-[11px] text-slate-650 leading-normal">
                              Log a formal veterinary clinical log entries against a specific cow tag, update withdrawal metrics, and trigger automated diary ledger expense records.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase font-sans">Affected Bovine specimen</label>
                                <select 
                                  value={selectedBovineId}
                                  onChange={(e) => setSelectedBovineId(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                >
                                  {(cows || [
                                    { id: 'COW-01', name: 'Baraka' },
                                    { id: 'COW-02', name: 'Malaika' },
                                    { id: 'COW-03', name: 'Neema' },
                                    { id: 'COW-04', name: 'Tajiri' }
                                  ]).map(cow => (
                                    <option key={cow.id} value={cow.id}>{cow.name} (Tag: {cow.id})</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase font-sans">Veterinary clinical cost (Ksh)</label>
                                <input 
                                  type="number"
                                  value={remediationCost}
                                  onChange={(e) => setRemediationCost(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleLogBovineTreatment(dObj)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer border-0"
                            >
                              <Plus size={14} /> Commit & Sync Veterinary Record
                            </button>
                          </div>
                        )}
                        {pipelineSuccessMessage && (
                          <div className="bg-amber-100 border border-amber-200/80 p-3 rounded-lg text-[10px] text-amber-900 font-black animate-pulse text-center leading-normal">
                            ✨ {pipelineSuccessMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Core Case History Archives (Improvement 4 component) */}
              <div className="lg:col-span-12 mt-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-600" size={18} />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
                        Clinical Cases Archive & Diagnostic History Log
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {diagnosticHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          id="download-diagnostics-pdf-btn"
                          className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer m-0 border-none shadow-sm"
                        >
                          <Download size={11} />
                          <span>Download PDF Report</span>
                        </button>
                      )}
                      <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        Local Sync Database Protected
                      </span>
                    </div>
                  </div>

                  {diagnosticHistory.length === 0 ? (
                    <p className="text-slate-400 font-medium text-xs py-4 text-center">
                      No diagnostic cases logged in current cycle. Type a symptom above to begin recording archive history files.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-450 font-black uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-1">Date / Stamp</th>
                            <th className="py-3">Specimen Cluster</th>
                            <th className="py-3">Reported Symptom Footprint</th>
                            <th className="py-3">Clinical Classification Outcome</th>
                            <th className="py-3 text-right">Quick View</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {diagnosticHistory.map((rawHistoryItem) => {
                            const historyItem = getFullHistoryItem(rawHistoryItem);
                            const isExpanded = expandedCaseId === historyItem.id;
                            return (
                              <React.Fragment key={historyItem.id}>
                                <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                  <td className="py-3 px-1 text-slate-500 font-mono text-[10px]">{historyItem.timestamp}</td>
                                  <td className="py-3">
                                    <span className="capitalize font-black text-slate-800 flex items-center gap-1.5">
                                      {historyItem.specimen === 'cow' ? '🐄 Cow' :
                                       historyItem.specimen === 'chicken' ? '🐓 Chicken' :
                                       historyItem.specimen === 'tomato' ? '🍅 Tomato' :
                                       historyItem.specimen === 'maize' ? '🌽 Maize' :
                                       historyItem.specimen === 'avocado' ? '🥑 Avocado' :
                                       historyItem.specimen === 'banana' ? '🍌 Banana' : '🌱 Generic'}
                                    </span>
                                  </td>
                                  <td className="py-3 max-w-[180px] truncate text-slate-500 italic font-normal">"{historyItem.symptom}"</td>
                                  <td className="py-3 font-black text-blue-950">{historyItem.conditionName}</td>
                                  <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (historyItem.id.startsWith('diag-init-1')) {
                                            setDiagSelectedSymptom(historyItem.symptom);
                                            setCustomDiagResult(null);
                                          } else {
                                            setDiagSelectedSymptom('');
                                            setCustomDiagResult({
                                              symptom: historyItem.symptom,
                                              conditionName: historyItem.conditionName,
                                              pathogen: historyItem.pathogen || "Retrieved Case History Record",
                                              likelihood: historyItem.likelihood || 'High',
                                              description: historyItem.description || "Re-queried case diagnostic artifact. Open the original database record files for active medication details.",
                                              treatment: historyItem.treatment || "Refer to original clinical dossiers or query the Gemini live AI for updated schedules.",
                                              quarantine: historyItem.quarantine || "Standard quarantine withholding periods apply.",
                                              prevention: historyItem.prevention || "Execute long-term biosecurity protocols.",
                                              isOffline: historyItem.isOffline
                                            });
                                          }
                                        }}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 cursor-pointer hover:underline border-0 bg-transparent p-0 uppercase"
                                      >
                                        Load
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => setExpandedCaseId(isExpanded ? null : historyItem.id)}
                                        className="text-[10px] font-black text-slate-600 hover:text-slate-800 cursor-pointer hover:underline border-0 bg-transparent p-0 uppercase flex items-center gap-0.5"
                                        title="Toggle details"
                                      >
                                        <span>{isExpanded ? 'Hide' : 'Expand'}</span>
                                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDiagnosticHistory(prev => {
                                            const updated = prev.filter(item => item.id !== historyItem.id);
                                            localStorage.setItem('jr_farm_diagnostic_history', JSON.stringify(updated));
                                            return updated;
                                          });
                                          if (expandedCaseId === historyItem.id) {
                                            setExpandedCaseId(null);
                                          }
                                        }}
                                        className="text-[10px] font-black text-rose-600 hover:text-rose-800 cursor-pointer hover:underline border-0 bg-transparent p-0 uppercase flex items-center gap-0.5"
                                        title="Delete case log"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-slate-50/70 border-b border-slate-200/50">
                                    <td colSpan={5} className="p-4">
                                      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
                                        
                                        {/* Left Column: Symptoms and Deep Research */}
                                        <div className="space-y-4 text-left">
                                          <div>
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Reported Symptom Footprint</span>
                                            <p className="text-slate-700 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 font-normal leading-relaxed">
                                              "{historyItem.symptom}"
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider block mb-1">✨ DEEP RESEARCH & AGRONOMIC EPIDEMIOLOGY OVERVIEW</span>
                                            <div className="text-slate-600 leading-relaxed bg-blue-50/40 p-4 rounded-xl border border-blue-100/40 space-y-2">
                                              <p className="font-semibold text-blue-900 text-[11px] flex items-center gap-1">
                                                <span>Pathogen Profile:</span>
                                                <span className="font-mono text-[10px] text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">{historyItem.pathogen}</span>
                                              </p>
                                              <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                                                {historyItem.deepResearch}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right Column: Remediation & Biosecurity SOP */}
                                        <div className="space-y-4 text-left">
                                          <div>
                                            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider block mb-1">🛠️ CLINICAL SOLUTION & MEDICATION PLAN</span>
                                            <div className="bg-emerald-50/30 border border-emerald-100/50 p-4 rounded-xl space-y-3">
                                              <div>
                                                <span className="text-[9px] font-black uppercase text-emerald-800 block mb-0.5">Active Therapy SOP</span>
                                                <p className="text-slate-700 text-[11px] leading-relaxed font-normal">{historyItem.treatment}</p>
                                              </div>
                                              <div>
                                                <span className="text-[9px] font-black uppercase text-amber-800 block mb-0.5">Quarantine & Isolation Withholding</span>
                                                <p className="text-slate-700 text-[11px] leading-relaxed font-normal">{historyItem.quarantine}</p>
                                              </div>
                                              <div>
                                                <span className="text-[9px] font-black uppercase text-slate-800 block mb-0.5">Long-term Biosecurity Prevention Guidelines</span>
                                                <p className="text-slate-700 text-[11px] leading-relaxed font-normal">{historyItem.prevention}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* INTERACTIVE PEST & DISEASE RECOGNITION SIMULATOR */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6 border-4 border-slate-700/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5 text-left">
                  <span className="text-3xl bg-slate-800 p-2.5 rounded-2xl">🎓</span>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider font-mono">Pest, Disease & Metabolic Recognition Simulator</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                      Test your agronomic diagnostic skills with real-world clinical veterinary and crop pathogen training scenarios.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700/60 font-mono text-xs text-left shrink-0">
                  <div>
                    <span className="text-[8.5px] text-slate-450 uppercase block font-black">Score (Reputation)</span>
                    <span className="text-sm font-black text-emerald-400">{simScore} PTS</span>
                  </div>
                  <div className="border-l border-slate-700 h-6"></div>
                  <div>
                    <span className="text-[8.5px] text-slate-450 uppercase block font-black">Streak</span>
                    <span className="text-sm font-black text-amber-400">🔥 {simStreak} wins</span>
                  </div>
                  {simScore !== 100 && (
                    <button
                      onClick={() => {
                        setSimScore(100);
                        setSimStreak(0);
                      }}
                      className="text-[9px] bg-slate-750 text-slate-300 hover:text-white px-2 py-1 rounded-md uppercase font-black cursor-pointer border border-slate-700 hover:bg-slate-700 m-0 self-center"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {simActiveCaseIndex === null ? (
                /* SIMULATOR CASE LIST SCREEN */
                <div className="space-y-4">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 text-slate-355 text-xs text-left leading-relaxed">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Training Objective</span>
                    Inspect clinical signs, choose diagnostic tests to reveal physical symptoms, formulate accurate disease identifications, and prescribe direct scientifically approved treatments. Success increases your reputation score.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {simCases.map((cs, index) => (
                      <div
                        key={cs.id}
                        className="bg-slate-850 hover:bg-slate-800 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between text-left space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-sm ${
                              cs.category === 'livestock' ? 'bg-amber-900/40 text-amber-300 border border-amber-800/40' : 'bg-teal-900/40 text-teal-300 border border-teal-800/40'
                            }`}>
                              {cs.category === 'livestock' ? '🐄 Livestock Veterinary' : '🌱 Crop Agronomy'}
                            </span>
                            <span className="text-xs font-bold text-slate-550">Case #{cs.id}</span>
                          </div>

                          <h4 className="text-sm font-black text-white">{cs.specimen}</h4>
                          <p className="text-[10.5px] text-slate-400 line-clamp-3 leading-relaxed">
                            {cs.symptoms}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSimActiveCaseIndex(index);
                            setSimInspectedClues([]);
                            setSimChosenDiagnosis(null);
                            setSimChosenTreatment(null);
                            setSimFeedback(null);
                          }}
                          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer border-none shadow-sm"
                        >
                          Start Diagnostic Run
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ACTIVE SIMULATION CASE RUN SCREEN */
                (() => {
                  const activeCase = simCases[simActiveCaseIndex];
                  return (
                    <div className="space-y-6 text-left">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest font-mono">
                          Active Clinical Evaluation Case #{activeCase.id}
                        </span>
                        <button
                          onClick={() => setSimActiveCaseIndex(null)}
                          className="text-[9px] bg-slate-800 text-slate-355 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl uppercase font-black cursor-pointer m-0"
                        >
                          ← Exit Training Session
                        </button>
                      </div>

                      {/* Main case display */}
                      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider">Specimen Target</span>
                          <h4 className="text-base font-black text-white font-mono">{activeCase.specimen}</h4>
                        </div>

                        <div className="space-y-1 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider mb-1">Reported Symptoms</span>
                          {activeCase.symptoms}
                        </div>

                        {/* Interactive inspection actions */}
                        <div className="space-y-2.5">
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider">Clinical Field Inspection Actions</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {activeCase.inspectOptions.map((opt) => {
                              const isInspected = simInspectedClues.includes(opt.key);
                              return (
                                <button
                                  key={opt.key}
                                  onClick={() => {
                                    if (!isInspected) {
                                      setSimInspectedClues([...simInspectedClues, opt.key]);
                                    }
                                  }}
                                  className={`p-3 text-left rounded-xl border transition-all text-[10px] cursor-pointer font-bold ${
                                    isInspected
                                      ? 'bg-slate-900 text-emerald-400 border-slate-800'
                                      : 'bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-slate-750'
                                  }`}
                                >
                                  <div className="flex justify-between items-center font-black uppercase text-[8px] tracking-wider text-slate-450 mb-0.5">
                                    <span>{opt.label}</span>
                                    <span>{isInspected ? '✓ REVEALED' : '🔍 RUN'}</span>
                                  </div>
                                  <p className="text-[10px] leading-relaxed font-semibold mt-1">
                                    {isInspected ? opt.clue : 'Click to perform diagnostics action...'}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Question Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                          {/* Choose Diagnosis */}
                          <div className="space-y-2">
                            <span className="text-[9px] text-slate-550 font-black uppercase tracking-wider block">Step 1: Disease / Pathogen Identification</span>
                            <div className="space-y-2">
                              {activeCase.diagnoses.map((diag) => {
                                const isSelected = simChosenDiagnosis === diag;
                                return (
                                  <button
                                    key={diag}
                                    disabled={simFeedback !== null}
                                    onClick={() => setSimChosenDiagnosis(diag)}
                                    className={`w-full p-3 rounded-xl border text-left text-[10.5px] cursor-pointer font-black transition-all ${
                                      isSelected
                                        ? 'bg-indigo-950 text-indigo-400 border-indigo-500/50'
                                        : 'bg-slate-900/40 text-slate-300 border-slate-800 hover:bg-slate-800/40'
                                    }`}
                                  >
                                    <span className="mr-2">{isSelected ? '●' : '○'}</span>
                                    {diag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Choose Treatment */}
                          <div className="space-y-2">
                            <span className="text-[9px] text-slate-550 font-black uppercase tracking-wider block">Step 2: Prescribe Science-Backed Treatment</span>
                            <div className="space-y-2">
                              {activeCase.treatments.map((tr) => {
                                const isSelected = simChosenTreatment === tr;
                                return (
                                  <button
                                    key={tr}
                                    disabled={simFeedback !== null || simChosenDiagnosis === null}
                                    onClick={() => setSimChosenTreatment(tr)}
                                    className={`w-full p-3 rounded-xl border text-left text-[10.5px] cursor-pointer font-black transition-all ${
                                      isSelected
                                        ? 'bg-indigo-950 text-indigo-400 border-indigo-500/50'
                                        : 'bg-slate-900/40 text-slate-300 border-slate-800 hover:bg-slate-800/40 disabled:opacity-40 disabled:cursor-not-allowed'
                                    }`}
                                  >
                                    <span className="mr-2">{isSelected ? '●' : '○'}</span>
                                    {tr}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Submit Action */}
                        {simFeedback === null ? (
                          <div className="pt-4 border-t border-slate-800 text-right">
                            <button
                              onClick={() => {
                                if (simChosenDiagnosis === null || simChosenTreatment === null) return;
                                const isDiagCorrect = simChosenDiagnosis === activeCase.correctDiagnosis;
                                const isTrCorrect = simChosenTreatment === activeCase.correctTreatment;
                                const isCorrect = isDiagCorrect && isTrCorrect;

                                if (isCorrect) {
                                  setSimScore(prev => prev + 15);
                                  setSimStreak(prev => prev + 1);
                                  setSimFeedback({ success: true, text: activeCase.feedbackSuccess });
                                } else {
                                  setSimScore(prev => Math.max(0, prev - 10));
                                  setSimStreak(0);
                                  setSimFeedback({ success: false, text: isDiagCorrect ? 'Diagnosis was correct but chosen treatment was incorrect.' : activeCase.feedbackFail });
                                }
                              }}
                              disabled={simChosenDiagnosis === null || simChosenTreatment === null}
                              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] uppercase font-black tracking-wider rounded-xl cursor-pointer border-none transition-all shadow-md"
                            >
                              Submit Agronomic / Vet Diagnostic Report
                            </button>
                          </div>
                        ) : (
                          /* Feedback state */
                          <div className="pt-4 border-t border-slate-800 space-y-4">
                            <div className={`p-4 rounded-xl border ${
                              simFeedback.success
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                            } text-xs leading-relaxed font-semibold`}>
                              <span className="font-black uppercase block text-[10px] mb-1">
                                {simFeedback.success ? '🏆 ACCURATE DIAGNOSIS CERTIFIED' : '❌ DIAGNOSTIC CRITIQUE'}
                              </span>
                              {simFeedback.text}
                            </div>

                            <div className="text-right">
                              <button
                                onClick={() => {
                                  setSimActiveCaseIndex(null);
                                  setSimInspectedClues([]);
                                  setSimChosenDiagnosis(null);
                                  setSimChosenTreatment(null);
                                  setSimFeedback(null);
                                }}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer border border-slate-700"
                              >
                                Try Another Case
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })()
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. SMART STOCK AUTO-DEDUCT TAB */}
      {activeTab === 'inventory_deduct' && (
        <div className="space-y-6 animate-fadeIn" id="inventory-deduct-section">
          <div className="bg-indigo-50 border border-indigo-150 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="text-3xl bg-indigo-100 p-2.5 rounded-2xl">📦</span>
              <div>
                <h3 className="text-lg font-black text-indigo-950">Smart Inventory Auto-Deduct Panel</h3>
                <p className="text-xs text-indigo-805 text-indigo-800 font-medium leading-relaxed max-w-2xl mt-0.5">
                  Execute farm actions (spraying, drenching, dosing calves, feeding cow groups) and automatically subtract the precise amount consumed from your central warehouse stockpile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Task SOP selection */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-indigo-200/50 shadow-xs space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">Select Active Crop/Animal SOP Task</h4>
                  
                  {(() => {
                    const sops = [
                      { id: 'sop-1', title: 'Avocado Spotting Bug Spray', inventoryKeyword: 'Copper Oxychloride Spray', searchName: 'Copper Oxychloride Spray', count: 2, unit: 'liters' },
                      { id: 'sop-2', title: 'Calf Mineral Milk Supplementation', inventoryKeyword: 'Premium Dairy Meal', searchName: 'Premium Dairy Meal', count: 5, unit: 'bags (50kg)' },
                      { id: 'sop-3', title: 'Planter Maize Row Nitrates', inventoryKeyword: 'NPK 26:0:0 Fertilizer', searchName: 'NPK 26:0:0 Fertilizer', count: 3, unit: 'bags (50kg)' },
                      { id: 'sop-4', title: 'Daily Silage Feeding Intake', inventoryKeyword: 'Super Napier Silage', searchName: 'Super Napier Silage', count: 0.5, unit: 'tons' }
                    ];

                    const activeSop = sops.find(s => s.id === selectedAutoSop) || sops[0];
                    const matchedStockItem = currentInventory.find(item => item.name.toLowerCase().includes(activeSop.inventoryKeyword.toLowerCase()));
                    const hasEnought = matchedStockItem ? matchedStockItem.quantity >= activeSop.count : false;

                    const handleExcuteDeduct = () => {
                      if (!matchedStockItem) return;
                      if (matchedStockItem.quantity < activeSop.count) return;

                      // Subtract items
                      const nextInv = currentInventory.map(item => {
                        if (item.id === matchedStockItem.id) {
                          return {
                            ...item,
                            quantity: Number((item.quantity - activeSop.count).toFixed(2))
                          };
                        }
                        return item;
                      });

                      updateInventoryStorage(nextInv);

                      // Log activity
                      const newLog = {
                         id: `log-${Date.now()}`,
                         timestamp: formatCurrentTimestamp(),
                         taskTitle: activeSop.title,
                         deductionText: `Completed SOP: Deducted ${activeSop.count} ${activeSop.unit} from ${matchedStockItem.name}. Remaining: ${(matchedStockItem.quantity - activeSop.count).toFixed(2)} ${activeSop.unit}.`,
                         success: true
                      };

                      const updatedLogs = [newLog, ...actionLogs];
                      setActionLogs(updatedLogs);
                      localStorage.setItem('jr_farm_academy_auto_deduct_logs', JSON.stringify(updatedLogs));
                    };

                    return (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {sops.map((sop) => (
                            <button
                              key={sop.id}
                              onClick={() => setSelectedAutoSop(sop.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                                selectedAutoSop === sop.id
                                  ? 'bg-indigo-650 bg-indigo-600 border-indigo-600 text-white font-black'
                                  : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold">{sop.title}</span>
                                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                                  selectedAutoSop === sop.id ? 'bg-indigo-900 text-white' : 'bg-slate-300 text-slate-800'
                                }`}>- {sop.count} {sop.unit.split(' ')[0]}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-slate-200/50 pt-4 space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/80 space-y-2">
                            <span className="text-[9px] font-black uppercase text-indigo-500 block">Stock Connection Health</span>
                            {matchedStockItem ? (
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800">{matchedStockItem.name}</span>
                                <span className={`text-xs font-mono font-black ${
                                  matchedStockItem.quantity < matchedStockItem.minStock 
                                    ? 'text-rose-600' 
                                    : 'text-indigo-900'
                                }`}>
                                  Available: <span className="text-sm font-semibold underline">{matchedStockItem.quantity}</span> {matchedStockItem.unit}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs text-rose-600 font-bold">⚠️ Linked Stock Item not found in Warehouse!</p>
                            )}

                            {matchedStockItem && matchedStockItem.quantity < matchedStockItem.minStock && (
                              <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-[10px] font-black leading-snug border border-rose-100">
                                ⚠️ Minimum threshold broken! Deducting now will trigger active shortage alarms in your Control Desk.
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleExcuteDeduct}
                            disabled={!hasEnought}
                            className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer border-0 shadow-md flex items-center justify-center gap-2 transition-all ${
                              hasEnought
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            ⚡ Execute SOP & Auto-Deduct
                          </button>

                          {!hasEnought && (
                            <p className="text-[10px] text-rose-650 text-rose-600 font-black text-center mt-1">
                              ❌ INSUFFICIENT INVENTORY: Please restock {activeSop.inventoryKeyword} in main stock tab.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action History logs ledger */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-indigo-200/50 shadow-xs p-5 space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                      <span className="text-xs font-black uppercase text-indigo-900 tracking-wider">Auto-Deduct Actions Audit Log</span>
                      <button
                        onClick={() => {
                          const clean = [{ id: 'log-clean', timestamp: formatCurrentTimestamp(), taskTitle: 'Wiped Log', deductionText: 'Ledger cleared by administrator.', success: true }];
                          setActionLogs(clean);
                          localStorage.setItem('jr_farm_academy_auto_deduct_logs', JSON.stringify(clean));
                        }}
                        className="text-[9px] font-black text-indigo-700 hover:text-indigo-900 uppercase cursor-pointer border-0 bg-transparent"
                      >
                        Clear Ledger
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto mt-2 space-y-2 pr-1">
                      {actionLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl space-y-1 text-left border border-slate-100">
                          <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                            <span>{log.timestamp}</span>
                            <span className="text-emerald-700 font-black">LOGGED</span>
                          </div>
                          <span className="text-[11px] font-black text-slate-800 block">Sop Action: {log.taskTitle}</span>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{log.deductionText}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 font-bold block text-center uppercase border-t border-slate-150 pt-3">
                    Verified compliant with National GAP Warehouse bookkeeping guidelines
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PHI & BREEDING TIMELINE TAB */}
      {activeTab === 'timelines' && (
        <div className="space-y-6 animate-fadeIn" id="timelines-section">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Countdown Chemical PHI */}
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-sm font-black text-purple-900 uppercase tracking-wide">Chemical Restrictive Harvest Countdown (PHI)</h3>
                  <p className="text-[11px] text-purple-800 font-medium">Pre-Harvest intervals ensure zero toxic chemicals reach consumers. Select medication dosage day.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-purple-100">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Select Substance</label>
                    <select
                      value={phiChemical}
                      onChange={(e) => setPhiChemical(e.target.value)}
                      className="w-full bg-slate-50 text-[10px] py-1.5 px-2 rounded-lg font-black border border-slate-200 cursor-pointer"
                    >
                      <option value="copper">Copper Fungicide (Crop)</option>
                      <option value="whitefly">Acetamiprid Pesticide (Crop)</option>
                      <option value="penicillin">Intramammary Penicillin (Cow)</option>
                      <option value="amitraz">Amitraz Tick Dip (Cow)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Elapsed Days: <span className="font-mono text-xs text-purple-800 font-black">{phiDaysElapsed} Days</span></label>
                    <input 
                      type="range" min="0" max="25" step="1"
                      value={phiDaysElapsed}
                      onChange={(e) => setPhiDaysElapsed(parseInt(e.target.value) || 0)}
                      className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-purple-600 mt-2"
                    />
                  </div>
                </div>

                {(() => {
                  const chemicalRules: Record<string, { name: string; phi: number; target: string; residue: string }> = {
                    copper: { name: "Copper Oxychloride", phi: 14, target: "Crop Harvesting", residue: "Heavy metal copper traces cause digestive toxicity in humans if eaten prematurely." },
                    whitefly: { name: "Acetamiprid whitefly blocker", phi: 7, target: "Leaf Consumption", residue: "Systemic pesticide causing neurobiological disruption if consumed before cellular breakdown." },
                    penicillin: { name: "Veterinary Cloxapen Penicillin", phi: 3, target: "Milk Withholding", residue: "Traces ruin dairy milk lactic fermentation, causing stomach allergies and antibiotic resistance." },
                    amitraz: { name: "Amitraz Tick Spray", phi: 1, target: "Active Milk Withholding", residue: "Pungent insecticide which ruins taste profiles, highly banned from commercial processors." }
                  };

                  const chem = chemicalRules[phiChemical] || chemicalRules.copper;
                  const daysRemaining = Math.max(chem.phi - phiDaysElapsed, 0);
                  const percent = Math.min((phiDaysElapsed / chem.phi) * 100, 100);

                  return (
                    <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-505 font-bold">Rule target: {chem.name} (PHI: {chem.phi} Days for {chem.target})</span>
                        {daysRemaining > 0 ? (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-rose-200">
                            🚨 QUARANTINED ({daysRemaining}d left)
                          </span>
                        ) : (
                          <span className="bg-emerald-105 bg-emerald-110 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-200">
                            ✓ SAFE FOR HARVEST
                          </span>
                        )}
                      </div>

                      {/* Timeline graphic representation */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex border border-slate-200 relative">
                          <div style={{ width: `${percent}%` }} className={`h-full ${daysRemaining > 0 ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                          <div className="absolute inset-0 flex items-center justify-between px-3 text-[8px] font-mono font-black text-slate-700 pointer-events-none">
                            <span>Sprayed (Day 0)</span>
                            <span>Safe Boundary (Day {chem.phi})</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-slate-400">
                          <span>Elapsed: {phiDaysElapsed} Days</span>
                          <span>Remaining: {daysRemaining} Days</span>
                        </div>
                      </div>

                      {daysRemaining > 0 ? (
                        <div className="bg-rose-50 text-rose-950 p-3 rounded-lg border border-rose-150 text-[10px] leading-relaxed font-semibold">
                          ⚠️ <strong>ACTIVE QUARANTINE:</strong> Do NOT harvest or gather milk. {chem.residue} Keep accurate medicine logs for food inspectors.
                        </div>
                      ) : (
                        <div className="bg-emerald-50 text-emerald-950 p-3 rounded-lg border border-emerald-155 text-[10px] leading-relaxed font-semibold">
                          ✅ <strong>SAFE PASS ZONE:</strong> Biodegredation complete. Harvest is fully compliant with GlobalGAP safety certifications.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Breeding Gestation milestone slide tracker */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-indigo-100 pb-3">
                <span className="text-2xl">🍼</span>
                <div>
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wide">Cow Pregnant Calving Milestone Timeline</h3>
                  <p className="text-[11px] text-indigo-805 text-indigo-800 font-medium">Coordinate gestation stages perfectly. Gestation cycle for cows is 282 days.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Days since Artificial Insemination (AI)</label>
                    <span className="text-base font-black text-indigo-900 font-mono">{gestDaysInseminated} / 282 Days</span>
                  </div>
                  <input 
                    type="range" min="1" max="282" step="1"
                    value={gestDaysInseminated}
                    onChange={(e) => setGestDaysInseminated(parseInt(e.target.value) || 120)}
                    className="w-1/2 h-1.5 bg-slate-200 appearance-none cursor-pointer accent-indigo-600 shrink-0"
                  />
                </div>

                {(() => {
                  let phase = "Phase 1: Embryo Implantation";
                  let note = "Embryo attachment to uterus wall. Keep cow calm, provide high quality vitamins, avoid heat stressors or rough handling.";
                  let icon = "🔬";
                  let color = "indigo";

                  if (gestDaysInseminated > 90 && gestDaysInseminated <= 210) {
                    phase = "Phase 2: Rapid Fetus growth";
                    note = "Rapid gestational growth. Calf increases in size significantly. Maintain balanced silage feeds, clean water, and check parameters.";
                    icon = "📈";
                    color = "amber";
                  } else if (gestDaysInseminated > 210 && gestDaysInseminated <= 270) {
                    phase = "Phase 3: MANDATORY Dry-Off Stage";
                    note = "UDDER MAINTENANCE DRY-OFF! Stop milking immediately to rebuild and rest mammary cells. Infuse dry-cow antibiotics to guard against mastitis.";
                    icon = "🍂";
                    color = "rose";
                  } else if (gestDaysInseminated > 270) {
                    phase = "Phase 4: Calving & Parturition Preparation";
                    note = "CALVING ALARM! Move cow to clean grass-padded maternity pens. Supplement with High Calcium salt block to avoid Milk Fever disease on day 1.";
                    icon = "🍀";
                    color = "yellow";
                  }

                  return (
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Gestation Status ({gestDaysInseminated}d)</span>
                        <span className="text-2xl">{icon}</span>
                      </div>

                      {/* Milestones dynamic graphics bar */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 1, text: "Day 1-90", label: "Embryo", active: gestDaysInseminated <= 90 },
                          { id: 2, text: "Day 91-210", label: "Fetus Growth", active: gestDaysInseminated > 90 && gestDaysInseminated <= 210 },
                          { id: 3, text: "Day 211-270", label: "Dry off", active: gestDaysInseminated > 210 && gestDaysInseminated <= 270 },
                          { id: 4, text: "Day 271-282", label: "Parturition", active: gestDaysInseminated > 270 }
                        ].map((m) => (
                          <div 
                            key={m.id} 
                            className={`p-2 rounded-lg text-center border transition-all ${
                              m.active 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-black' 
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="block text-[8px] uppercase tracking-wider font-extrabold">{m.label}</span>
                            <span className="text-[8px] font-mono">{m.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] leading-relaxed font-semibold">
                        <span className="font-black text-slate-800 block text-[10px] mb-0.5">{phase.toUpperCase()}</span>
                        {note}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 8: Automatic Predictive Feed Intake & Milk Yield Forecasting */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6 text-left animate-fadeIn">
          <div className="bg-teal-50 border border-teal-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="text-3xl bg-teal-100 p-2.5 rounded-2xl">📈</span>
              <div>
                <h3 className="text-lg font-black text-teal-950">AI Predictive Feed Intake & Lactation forecasting simulator</h3>
                <p className="text-xs text-teal-800 font-medium leading-relaxed max-w-3xl mt-0.5">
                  Model continuous 44-week lactation curves using biologically grounded Wood's models. Dynamically adjust cow weights, breeds, and feed quality rations to predict daily feed dry matter intake (DMI) and milk output.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Controls Column */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white p-5 rounded-2xl border border-teal-150 shadow-xs space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-teal-900 tracking-wider">Simulation parameters</h4>
                  
                  {/* Breed Choice */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-405 block">Cattle Breed Profile</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Friesian', 'Ayrshire', 'Jersey', 'Guernsey'] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setForecastBreed(b)}
                          className={`py-2 px-3 rounded-lg border font-black text-[10px] uppercase cursor-pointer transition-all ${
                            forecastBreed === b
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Weight */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-405">
                      <span>Cow Body Weight</span>
                      <span className="font-mono text-teal-700 font-black">{forecastWeight} kg</span>
                    </div>
                    <input
                      type="range" min="350" max="750" step="10"
                      value={forecastWeight}
                      onChange={(e) => setForecastWeight(parseInt(e.target.value) || 550)}
                      className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-teal-700 rounded-lg"
                    />
                    <span className="text-[8.5px] text-slate-400 font-medium block">DMI baseline increases with weight maintenance requirements</span>
                  </div>

                  {/* BCS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-405">
                      <span>Body Condition Score (BCS)</span>
                      <span className="font-mono text-teal-700 font-black">{forecastBcs.toFixed(1)} / 5.0</span>
                    </div>
                    <input
                      type="range" min="2.0" max="4.5" step="0.5"
                      value={forecastBcs}
                      onChange={(e) => setForecastBcs(parseFloat(e.target.value) || 3.0)}
                      className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-teal-700 rounded-lg"
                    />
                    <span className="text-[8.5px] text-slate-400 font-medium block">Optimal range: 3.0-3.5. Under/over-conditioning cuts peak yield.</span>
                  </div>

                  {/* Feed quality select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-405 block">Ration Quality Profile</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'poor', label: 'Poor (Fiber)' },
                        { id: 'average', label: 'Std (TMR)' },
                        { id: 'premium', label: 'Premium' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setForecastFeedQuality(f.id as any)}
                          className={`py-2 px-1 rounded-lg border font-black text-[9px] uppercase cursor-pointer transition-all ${
                            forecastFeedQuality === f.id
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results panel */}
                <div className="bg-teal-950 text-white p-5 rounded-2xl space-y-4 border border-teal-900 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-teal-300 tracking-wider">Predictive calculations (308d Cycle)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <span className="text-[8.5px] text-teal-200 font-bold uppercase tracking-wider block">Est. Lactation Output</span>
                       <h3 className="text-xl font-black font-mono mt-0.5">{forecastingCurveData.totalMilk.toLocaleString(undefined, {maximumFractionDigits:0})} L</h3>
                     </div>
                     <div>
                       <span className="text-[8.5px] text-teal-200 font-bold uppercase tracking-wider block">Predicted Peak Yield</span>
                       <h3 className="text-xl font-black font-mono mt-0.5">{forecastingCurveData.adjustedPeak} L/day</h3>
                     </div>
                     <div className="col-span-2 border-t border-teal-900 pt-3">
                       <span className="text-[8.5px] text-teal-200 font-bold uppercase tracking-wider block">Est. Total Feed Requirement (Dry Matter)</span>
                       <h3 className="text-lg font-black font-mono mt-0.5">{forecastingCurveData.totalFeed.toLocaleString(undefined, {maximumFractionDigits:0})} kg</h3>
                     </div>
                  </div>
                </div>
              </div>

              {/* Interactive Graph Column */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-teal-150 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">44-Week Wood's Lactation Curve & Dry Matter Intake Prediction</h4>
                  <p className="text-[9.5px] text-slate-450 uppercase font-black tracking-wide mt-0.5">Dual-axis line charts depicting feed conversions over stages</p>
                </div>

                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart
                      data={forecastingCurveData.curve}
                      margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 9 }} interval={3} />
                      <YAxis yAxisId="left" tick={{ fontSize: 9 }} label={{ value: 'Milk Yield (L/day)', angle: -90, position: 'insideLeft', style: {fontSize: 9, fontWeight: 'bold', fill: '#0f766e'} }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} label={{ value: 'Feed DMI (kg/day)', angle: 90, position: 'insideRight', style: {fontSize: 9, fontWeight: 'bold', fill: '#d97706'} }} />
                      <Tooltip formatter={(value, name) => [value, name === 'milkYield' ? 'Forecasted Yield (L)' : 'Predicted DMI (kg)']} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line yAxisId="left" type="monotone" name="milkYield" dataKey="milkYield" stroke="#0f766e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" name="feedIntake" dataKey="feedIntake" stroke="#d97706" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 text-[10px] leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold text-teal-850 block uppercase text-[8px] tracking-wide">Weeks 1-10 (Early)</span>
                    <p className="text-slate-500">Yield rises steeply. Feed intake is laggy, causing energy deficit. Must feed starch-dense rations to avoid rapid weight loss.</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-2.5">
                    <span className="font-bold text-amber-800 block uppercase text-[8px] tracking-wide">Weeks 11-20 (Mid)</span>
                    <p className="text-slate-500">DMI peaks, matching energy needs. Yield stabilizes. This represents the golden fertility and breeding re-insemination window.</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-2.5">
                    <span className="font-bold text-slate-800 block uppercase text-[8px] tracking-wide">Weeks 21-44 (Late)</span>
                    <p className="text-slate-500">Gradual yield decline. Shift feeds to high-roughage forage to prevent over-fattening, preparing cow for standard Dry-off.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {activeTab === ('quizzes' as any) && (
        <div className="space-y-6 text-left animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">FARMER'S ACADEMY QUIZ</span>
              <span className="text-[9.5px] text-slate-400 font-bold uppercase">GAP Audit Assessment</span>
            </div>
            
            <h4 className="text-base font-black text-slate-800 uppercase tracking-wide">Test Your Agronomic & Safety Knowledge</h4>
            <p className="text-xs text-slate-400 font-medium">Verify your understanding of chemical handling, withholding periods, and livestock feed standards to prepare for official certifications.</p>
          </div>
 
          {!quizDone ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase mb-2">
                  <span>Question {currentQuizQ + 1} of 3</span>
                  <span>Score: {quizScore} / 3</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-605 bg-emerald-600 h-full transition-all duration-300" style={{ width: `${((currentQuizQ) / 3) * 100}%` }}></div>
                </div>
              </div>
 
              {/* Question Card */}
              {(() => {
                const quizQuestions = [
                  {
                    q: "Under GlobalGAP standards, what is the mandatory Pre-Harvest Interval (PHI) withholding period for standard copper-based fungicide applications?",
                    options: [
                      "A) 14 days",
                      "B) 2 days",
                      "C) 45 days",
                      "D) 0 days"
                    ],
                    correct: 0,
                    explanation: "Copper-based treatments require at least a 14-day withholding period to clear residues before picking or plucking leaf crops."
                  },
                  {
                    q: "What does the WHO Toxicity Class Ib designation represent on pesticide or insecticide packaging labels?",
                    options: [
                      "A) Slightly Hazardous",
                      "B) Highly Hazardous",
                      "C) Extremely Toxic (Class Ia)",
                      "D) Non-hazardous"
                    ],
                    correct: 1,
                    explanation: "Class Ib is classified by the World Health Organization as 'Highly Hazardous' and requires strict PPE including respirator face guards."
                  },
                  {
                    q: "In standard compounding formulation, what is the target Crude Protein (CP) percentage recommended for high-yielding peak lactation dairy cattle?",
                    options: [
                      "A) 12.0% CP",
                      "B) 19.5% CP",
                      "C) 8.0% CP",
                      "D) 28.0% CP"
                    ],
                    correct: 1,
                    explanation: "Peak lactation dairy cows have high metabolic demand, needing approximately 19.5% CP in their dry matter concentrate intake."
                  }
                ];
 
                const currentQuestion = quizQuestions[currentQuizQ];
 
                return (
                  <div className="space-y-6">
                    <p className="text-sm font-black text-slate-800 leading-normal">{currentQuestion.q}</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options.map((opt, idx) => {
                        let btnStyle = "border-slate-200 hover:border-slate-300 bg-white text-slate-700";
                        if (selectedAns !== null) {
                          if (idx === currentQuestion.correct) {
                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-black";
                          } else if (idx === selectedAns) {
                            btnStyle = "border-red-405 bg-rose-50 text-rose-950";
                          } else {
                            btnStyle = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60";
                          }
                        }
 
                        return (
                          <button
                            key={idx}
                            disabled={selectedAns !== null}
                            onClick={() => {
                              setSelectedAns(idx);
                              setShowFeedback(true);
                              if (idx === currentQuestion.correct) {
                                setQuizScore(prev => prev + 1);
                              }
                            }}
                            className={`p-4 border rounded-2xl text-left text-xs font-bold transition-all cursor-pointer focus:outline-none ${btnStyle} w-full`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
 
                    {showFeedback && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 block">Agronomic Explanation:</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{currentQuestion.explanation}</p>
                        
                        <button
                          onClick={() => {
                            if (currentQuizQ < 2) {
                              setCurrentQuizQ(prev => prev + 1);
                              setSelectedAns(null);
                              setShowFeedback(false);
                            } else {
                              setQuizDone(true);
                            }
                          }}
                          className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none shadow"
                        >
                          {currentQuizQ < 2 ? "Next Question" : "Complete Quiz"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Award size={32} />
              </div>
 
              <div>
                <h4 className="text-lg font-black text-slate-800 uppercase">Assessment Complete</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Sovereign Agronomic Certificate of Achievement</p>
                <h2 className="text-3xl font-black text-emerald-950 mt-4 font-mono">{quizScore} / 3 Score</h2>
              </div>
 
              <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto font-medium">
                {quizScore === 3 
                  ? "Outstanding! You scored 100% and demonstrated expert compliance with GlobalGAP & WHO safety guidelines."
                  : "Good effort! Review the chemical withholding protocols and lactation targets to achieve a perfect compliance record."}
              </p>
 
              <button
                onClick={() => {
                  setCurrentQuizQ(0);
                  setQuizScore(0);
                  setSelectedAns(null);
                  setQuizDone(false);
                  setShowFeedback(false);
                }}
                className="px-6 py-3 border border-slate-200 text-slate-550 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline auxiliary icons to guarantee standard execution without missing imports
function ShieldActionIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ width: '16px', height: '16px' }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
