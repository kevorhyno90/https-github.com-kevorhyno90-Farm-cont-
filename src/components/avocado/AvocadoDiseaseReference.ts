/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * JR Farm Omni-Estate - Export Avocado Disease, Chemical & Agronomic Reference Guide
 * Stamped & Approved by: Dr. Devin Omwenga (General Farm Manager)
 */

export interface AvocadoDiseaseInfo {
  id: string;
  name: string;
  scientificName: string;
  category: 'Fungal Disease' | 'Bacterial Disease' | 'Oomycete / Root Rot' | 'Insect Pest' | 'Physiological Disorder';
  severity: 'Critical / High Risk' | 'Moderate' | 'Seasonal Alert';
  symptoms: string[];
  recommendedDrugs: {
    tradeName: string;
    activeIngredient: string;
    inventoryCategory: 'Chemical' | 'Fertilizer' | 'Tools';
    defaultDosage: string;
    applicationMethod: 'Foliar Spray' | 'Soil Drench' | 'Trunk Injection' | 'Trunk Paint' | 'Trapping / Baiting' | 'Sterilized Cut & Seal';
    phiDays: number; // Pre-Harvest Interval
    matchingInventoryKeyword: string;
  }[];
  culturalPractices: string[];
  preventativeMeasures: string[];
  recommendedIntervalDays: number; // For scheduling next due date
}

export const AVOCADO_DISEASE_COMPENDIUM: AvocadoDiseaseInfo[] = [
  {
    id: 'anthracnose',
    name: 'Anthracnose Fruit & Twig Blight',
    scientificName: 'Colletotrichum gloeosporioides',
    category: 'Fungal Disease',
    severity: 'Critical / High Risk',
    symptoms: [
      'Circular brown-black sunken lesions on mature fruit skin',
      'Pink or salmon-colored gelatinous spore masses under humid conditions',
      'Twig dieback and tear-stain necrotic streaks along fruit shoulders',
      'Premature fruit drop during heavy rainfall periods'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Copper Oxychloride 50% WP',
        activeIngredient: 'Copper Oxychloride (500 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '50g per 20L knapsack sprayer (2.5 kg/ha in 1000L water)',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Copper Oxychloride'
      },
      {
        tradeName: 'Kocide 2000 (Copper Hydroxide)',
        activeIngredient: 'Copper Hydroxide (350 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '35g per 20L knapsack sprayer',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Copper Hydroxide'
      },
      {
        tradeName: 'Ortiva Top / Azoxystrobin',
        activeIngredient: 'Azoxystrobin (200 g/L) + Difenoconazole (125 g/L)',
        inventoryCategory: 'Chemical',
        defaultDosage: '20ml per 20L knapsack sprayer',
        applicationMethod: 'Foliar Spray',
        phiDays: 21,
        matchingInventoryKeyword: 'Azoxystrobin'
      }
    ],
    culturalPractices: [
      'Pruning lower skirt branches to maintain at least 0.5m clearance from wet soil splash',
      'Annual canopy thinning to allow direct sunlight penetration and rapid leaf drying',
      'Removing and burning infected mummified fruits and dead twig wood'
    ],
    preventativeMeasures: [
      'Apply preventative copper spray immediately following fruit set and repeat every 28-35 days during wet season',
      'Maintain strict harvest tool sanitation'
    ],
    recommendedIntervalDays: 30
  },
  {
    id: 'phytophthora_root_rot',
    name: 'Phytophthora Root Rot & Canker',
    scientificName: 'Phytophthora cinnamomi',
    category: 'Oomycete / Root Rot',
    severity: 'Critical / High Risk',
    symptoms: [
      'Pale, wilted, yellowing foliage with sparse canopy defoliation',
      'Necrotic black, brittle feeder roots (healthy roots are crisp and white/cream)',
      'Branch dieback from the top canopy downwards (stagheading)',
      'Dark watery exudate or white crystalline bleeding from lower trunk collar'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Potassium Phosphonate / Foli-R-Fos 400',
        activeIngredient: 'Phosphorous Acid / Potassium Phosphite (400 g/L)',
        inventoryCategory: 'Chemical',
        defaultDosage: '20ml per 1m canopy diameter via trunk injection or 5ml/L foliar spray',
        applicationMethod: 'Trunk Injection',
        phiDays: 0,
        matchingInventoryKeyword: 'Phosphonate'
      },
      {
        tradeName: 'Ridomil Gold MZ 68WG',
        activeIngredient: 'Mefenoxam 40g/kg + Mancozeb 640g/kg',
        inventoryCategory: 'Chemical',
        defaultDosage: '50g per tree drenched uniformly in 15-20L water along the root drip-line',
        applicationMethod: 'Soil Drench',
        phiDays: 28,
        matchingInventoryKeyword: 'Ridomil Gold'
      },
      {
        tradeName: 'Aliette 80 WP',
        activeIngredient: 'Fosetyl-Al (800 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '50g per 20L water drenched at root collar',
        applicationMethod: 'Soil Drench',
        phiDays: 14,
        matchingInventoryKeyword: 'Aliette'
      }
    ],
    culturalPractices: [
      'Mound planting on raised ridges (0.5m) to ensure excellent gravity drainage',
      'Thick coarse organic wood chip mulching kept 15cm away from trunk collar',
      'Sanitizing footwear and vehicle tires in copper footbaths at orchard entrance'
    ],
    preventativeMeasures: [
      'Inject phosphonate into trunk twice per year (spring leaf flush & autumn root flush)',
      'Never allow standing irrigation puddles around tree bases'
    ],
    recommendedIntervalDays: 90
  },
  {
    id: 'cercospora_spot',
    name: 'Cercospora Fruit & Leaf Spot (Pseudocercospora)',
    scientificName: 'Pseudocercospora purpurea',
    category: 'Fungal Disease',
    severity: 'Moderate',
    symptoms: [
      'Small, angular, dark brown or purple spots on leaves with distinct yellow halos',
      'Rough, hard, cracked brown lesions on avocado peel surface causing export downgrade to reject',
      'Skin cracking allowing entry of secondary post-harvest pathogens'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Copper Oxychloride 50% WP',
        activeIngredient: 'Copper Oxychloride (500 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '50g per 20L knapsack sprayer',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Copper Oxychloride'
      },
      {
        tradeName: 'Daconil / Chlorothalonil 720 SC',
        activeIngredient: 'Chlorothalonil (720 g/L)',
        inventoryCategory: 'Chemical',
        defaultDosage: '40ml per 20L knapsack sprayer',
        applicationMethod: 'Foliar Spray',
        phiDays: 21,
        matchingInventoryKeyword: 'Chlorothalonil'
      }
    ],
    culturalPractices: [
      'Canopy opening through strategic window pruning to maximize wind movement',
      'Weeding tall grass underneath trees to lower micro-climate relative humidity'
    ],
    preventativeMeasures: [
      'Begin copper protective sprays 3 weeks after flowering and continue every 4 weeks until fruit reaches full maturity'
    ],
    recommendedIntervalDays: 30
  },
  {
    id: 'scab',
    name: 'Avocado Scab',
    scientificName: 'Sphaceloma perseae',
    category: 'Fungal Disease',
    severity: 'Moderate',
    symptoms: [
      'Cork-like, raised, brownish-tan warty scabs on young developing fruitlets',
      'Leaves become distorted, puckered, or crinkled with necrotic lesions along veins',
      'Heavily infected young fruitlets abort and drop prematurely'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Copper Oxychloride 50% WP',
        activeIngredient: 'Copper Oxychloride (500 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '50g per 20L knapsack sprayer',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Copper Oxychloride'
      },
      {
        tradeName: 'Mancozeb 80% WP (Dithane M-45)',
        activeIngredient: 'Mancozeb (800 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '50g per 20L water',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Mancozeb'
      }
    ],
    culturalPractices: [
      'Prune off and incinerate infected dead twigs before the start of the seasonal rain',
      'Sterilize pruning shears between rows using 70% methylated spirit'
    ],
    preventativeMeasures: [
      'Critical spray timing: Apply initial copper spray at early bud break, second at 75% petal drop, third 4 weeks later'
    ],
    recommendedIntervalDays: 28
  },
  {
    id: 'sun_scald_stem_cracking',
    name: 'Sun Scald, Bark Cracking & Trunk Canker',
    scientificName: 'Solar thermal radiation necrosis & secondary fungal ingress',
    category: 'Physiological Disorder',
    severity: 'Critical / High Risk',
    symptoms: [
      'Burnt, yellow-brown or blackened bark on exposed western and southern facing trunks',
      'Severe vertical bark splitting and peeling away from the wood',
      'Secondary fungal infection and wood rot entering through sun-damaged tissues',
      'Dieback of upper structural scaffold branches after severe pruning'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Sun-Shield Copper White Trunk Paint',
        activeIngredient: 'White Interior Water-based Acrylic Latex (1:1 with water) + 30g/L Copper Oxychloride',
        inventoryCategory: 'Chemical',
        defaultDosage: '1L paint mixture per 4-5 mature tree trunks painted up to 1.2m and first main crotch',
        applicationMethod: 'Trunk Paint',
        phiDays: 0,
        matchingInventoryKeyword: 'Copper White Trunk Paint'
      },
      {
        tradeName: 'Agricultural Hydrated Lime + Copper Wash',
        activeIngredient: 'Hydrated Calcium Hydroxide + Copper Sulfate (Bordeaux White Slurry)',
        inventoryCategory: 'Chemical',
        defaultDosage: '1kg Lime + 100g Copper Sulfate dissolved in 5L water painted onto bark',
        applicationMethod: 'Trunk Paint',
        phiDays: 0,
        matchingInventoryKeyword: 'Hydrated Lime'
      },
      {
        tradeName: 'Pruning Wound Sealant (Copper-infused)',
        activeIngredient: 'Bituminous / acrylic sealant with cuprous oxide',
        inventoryCategory: 'Tools',
        defaultDosage: 'Brush directly onto any pruning cut larger than 2.5cm diameter',
        applicationMethod: 'Sterilized Cut & Seal',
        phiDays: 0,
        matchingInventoryKeyword: 'Wound Sealant'
      }
    ],
    culturalPractices: [
      'Paint trunks immediately following formative pruning or when planting young grafted saplings',
      'Maintain shade tree windbreaks on windy exposed ridge lines',
      'Avoid excessive central canopy pruning during peak dry summer months'
    ],
    preventativeMeasures: [
      'Re-apply copper white paint every 6-9 months, especially after intense rainy seasons wash away the barrier',
      'Ensure mulch does not touch the painted trunk collar'
    ],
    recommendedIntervalDays: 180
  },
  {
    id: 'fruit_fly_codling_moth',
    name: 'False Codling Moth & Oriental Fruit Fly',
    scientificName: 'Thaumatotibia leucotreta & Bactrocera dorsalis',
    category: 'Insect Pest',
    severity: 'Critical / High Risk',
    symptoms: [
      'Pin-prick oviposition puncture marks with white sugary crystalline sap exudation on fruit skin',
      'Internal pulp rotting and larval burrowing rendering entire harvest unsaleable for export (strict EU quarantine)',
      'Premature fruit softening and drop beneath tree canopy'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Spinosad Bait (GF-120 NF)',
        activeIngredient: 'Spinosad (0.24 g/L) + Food Attractant Hydrolyzed Protein',
        inventoryCategory: 'Chemical',
        defaultDosage: '1L GF-120 diluted in 4L water, coarse droplet spot spray to 1m² inner canopy per tree',
        applicationMethod: 'Trapping / Baiting',
        phiDays: 1,
        matchingInventoryKeyword: 'Spinosad'
      },
      {
        tradeName: 'Methyl Eugenol & Cue-Lure Pheromone Traps',
        activeIngredient: 'Sex Pheromone Attractant + Malathion/Dichlorvos insecticide strip',
        inventoryCategory: 'Tools',
        defaultDosage: '4-8 delta or bucket traps per acre hung at 1.8m height in shade canopy',
        applicationMethod: 'Trapping / Baiting',
        phiDays: 0,
        matchingInventoryKeyword: 'Pheromone Trap'
      },
      {
        tradeName: 'Deltamethrin 25 EC (Decis)',
        activeIngredient: 'Deltamethrin (25 g/L)',
        inventoryCategory: 'Chemical',
        defaultDosage: '15ml per 20L knapsack sprayer',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Deltamethrin'
      }
    ],
    culturalPractices: [
      'Strict orchard sanitation: Collect all dropped fruits daily, double-bag in black plastic polythene and solarize for 7 days',
      'Install field-perimeter pheromone monitoring lines for early pest warning',
      'Regular scouting of fruit surfaces during oil accumulation stage'
    ],
    preventativeMeasures: [
      'Maintain continuous lure re-baiting every 6-8 weeks throughout fruit sizing up to harvest',
      'Complies with EU Phytosanitary export quarantine protocol'
    ],
    recommendedIntervalDays: 21
  },
  {
    id: 'thrips_mites',
    name: 'Greenhouse Thrips & Persea Spider Mites',
    scientificName: 'Heliothrips haemorrhoidalis & Oligonychus perseae',
    category: 'Insect Pest',
    severity: 'Moderate',
    symptoms: [
      'Silvery or bronzed leathery russeting patches on fruit peel surfaces (major cause of reject grading)',
      'Webbing and necrotic brown spotting along the underside of leaf veins',
      'Premature defoliation in severe dry season infestations'
    ],
    recommendedDrugs: [
      {
        tradeName: 'Abamectin 1.8% EC (Dynamec / Romectin)',
        activeIngredient: 'Abamectin (18 g/L)',
        inventoryCategory: 'Chemical',
        defaultDosage: '10ml per 20L water + mineral oil adjuvant',
        applicationMethod: 'Foliar Spray',
        phiDays: 14,
        matchingInventoryKeyword: 'Abamectin'
      },
      {
        tradeName: 'Wettable Sulfur 80% WP (Kumulus)',
        activeIngredient: 'Elemental Micronized Sulfur (800 g/kg)',
        inventoryCategory: 'Chemical',
        defaultDosage: '40g per 20L water',
        applicationMethod: 'Foliar Spray',
        phiDays: 3,
        matchingInventoryKeyword: 'Sulfur'
      }
    ],
    culturalPractices: [
      'Manage dust along orchard roadways using gravel or living cover crops',
      'Preserve predatory beneficial mites (Euseius / Phytoseiidae) by avoiding broad-spectrum synthetic pyrethroids'
    ],
    preventativeMeasures: [
      'Scout 10 fruit clusters per block bi-weekly; apply treatment when >5% fruit show early thrips clustering'
    ],
    recommendedIntervalDays: 21
  }
];

export interface AvocadoSectionConfig {
  id: string;
  name: string;
  code: string;
  treeCount: number;
  variety: string;
  rootstock: string;
  spacingMeters: string;
  plantingYear: number;
  irrigationType: 'Automated Drip' | 'Micro-sprinkler' | 'Gravity Furrow' | 'Rainfed';
  soilType: string;
  description: string;
}

export const AVOCADO_ORCHARD_SECTIONS: AvocadoSectionConfig[] = [
  {
    id: 'sec-1',
    name: 'Block 1: Lower Valley Hass (Prime Export)',
    code: 'BLK-A1',
    treeCount: 450,
    variety: 'Hass (Export Grade A)',
    rootstock: 'Duke 7 (Phytophthora tolerant)',
    spacingMeters: '5m x 5m (High Density)',
    plantingYear: 2020,
    irrigationType: 'Automated Drip',
    soilType: 'Deep volcanic loam, pH 6.2',
    description: 'Our primary high-yielding Hass export block. Fitted with pressure-compensated dual drip lines and mulch rings.'
  },
  {
    id: 'sec-2',
    name: 'Block 2: East Ridge Hass (Hillside Terraces)',
    code: 'BLK-A2',
    treeCount: 380,
    variety: 'Hass (Export Prime)',
    rootstock: 'Local Mexican Native Grafts',
    spacingMeters: '6m x 5m (Contour Spacing)',
    plantingYear: 2021,
    irrigationType: 'Automated Drip',
    soilType: 'Clay loam on hillside terraces, pH 6.4',
    description: 'Terraced hillside block protected by Grevillea windbreaks. Produces high dry-matter export fruit.'
  },
  {
    id: 'sec-3',
    name: 'Block 3: Fuerte & Cross-Pollinator Orchard',
    code: 'BLK-A3',
    treeCount: 210,
    variety: 'Fuerte (Type B) & Bacon / Zutano',
    rootstock: 'Indigenous Seedling',
    spacingMeters: '7m x 6m (Spreading Canopy)',
    plantingYear: 2019,
    irrigationType: 'Micro-sprinkler',
    soilType: 'Rich alluvial loam, pH 6.5',
    description: 'Serves dual role: Early-season domestic green-skin cash crop and synchronous Type B pollination for neighboring Hass blocks.'
  },
  {
    id: 'sec-4',
    name: 'Block 4: Young Grafted Orchard (Year 2 Saplings)',
    code: 'BLK-A4',
    treeCount: 320,
    variety: 'Hass & Pinkerton',
    rootstock: 'Duke 7 & Dusa Clonal',
    spacingMeters: '5m x 4m',
    plantingYear: 2024,
    irrigationType: 'Automated Drip',
    soilType: 'Well-drained red volcanic loam, pH 6.0',
    description: 'Formative training phase. Focus is on formative tip pruning, weed-free tree rings, and trunk copper whitewash against sunburn.'
  },
  {
    id: 'sec-5',
    name: 'Block 5: Certified Mother Trees & Grafting Nursery',
    code: 'BLK-A5',
    treeCount: 650,
    variety: 'Certified KEPHIS Mother Scion Trees + Rootstock Bags',
    rootstock: 'Selected disease-free seeds',
    spacingMeters: 'Nursery Tables / Shade Net (30% shade)',
    plantingYear: 2023,
    irrigationType: 'Micro-sprinkler',
    soilType: 'Sterilized potting compost & sand mix',
    description: 'Mother trees for certified scion budwood collection and on-farm graft propagation under shade net.'
  },
  {
    id: 'sec-6',
    name: 'Packhouse & Cold Storage Bay (4.5°C Pre-Cooling)',
    code: 'PKH-01',
    treeCount: 0,
    variety: 'Grading, De-sapping & Shipping Facility',
    rootstock: 'N/A',
    spacingMeters: 'Facility (400 sq meters)',
    plantingYear: 2022,
    irrigationType: 'Rainfed',
    soilType: 'Sanitized epoxy-coated packhouse floor',
    description: 'Equipped with roller grading tables, electronic scale stations, chlorinated water wash tanks, and 4.5°C pre-cooling container bay.'
  }
];
