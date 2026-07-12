import { offsetIsoDate, toTimestamp } from './dateHelper';

export const buildDefaultDiagnosticHistory = () => {
  const first = new Date();
  first.setHours(8, 30, 0, 0);
  const second = new Date(first);
  second.setMinutes(second.getMinutes() + 15);

  return [
    {
      id: 'diag-init-1',
      timestamp: toTimestamp(first),
      specimen: 'cow',
      symptom: 'udder quarters inflamed, milk clotted',
      conditionName: 'Clinical Mastitis',
      likelihood: 'High',
      isOffline: true
    },
    {
      id: 'diag-init-2',
      timestamp: toTimestamp(second),
      specimen: 'chicken',
      symptom: 'coughing, sneezing, gasping, green liquid faeces',
      conditionName: 'Newcastle Disease',
      likelihood: 'High',
      isOffline: true
    }
  ];
};

export const buildDefaultDeductLogs = () => {
  const init = new Date();
  init.setHours(8, 0, 0, 0);
  return [
    {
      id: 'log-init',
      timestamp: toTimestamp(init),
      taskTitle: 'Stock Engine Active',
      deductionText: 'Ready for auto-deduction SOP protocols.',
      success: true
    }
  ];
};

export const buildDefaultTimetable = () => {
  return [
    {
      id: 'tt-1',
      category: 'Cows & Calves',
      operation: 'Teat Dipping & Hygiene Routine',
      when: 'Daily (Milking session)',
      how: 'Strip foremilk, dip teats in Chlorhexidine for 30s, post-milking seal with iodine.',
      why: 'Prevents mastitis infections and seals teat sphincter.',
      status: 'Completed',
      targetDate: offsetIsoDate(0),
      assignedTo: 'Milking Crew'
    },
    {
      id: 'tt-2',
      category: 'Cows & Calves',
      operation: 'Calf Decorn/Dehorning',
      when: 'At 2 to 6 Weeks of age',
      how: 'Apply topical lidocaine, use hot iron dehorner precisely on buds for 5 seconds.',
      why: 'Safe management, prevents horn-gouging injuries.',
      status: 'Pending',
      targetDate: offsetIsoDate(3),
      assignedTo: 'Veterinary Officer (Dr. Peter)'
    },
    {
      id: 'tt-3',
      category: 'Cows & Calves',
      operation: 'Postpartum Selenium Boost',
      when: '4 Weeks before calving',
      how: 'Inject cow with Vitamin E and Selenium booster mixture.',
      why: 'Prevents placental complications, lifts calf immunity markers.',
      status: 'Completed',
      targetDate: offsetIsoDate(-3),
      assignedTo: 'Livestock Manager'
    },
    {
      id: 'tt-4',
      category: 'Goats & Pigs',
      operation: 'Hoof Trimming and Copper Dip',
      when: 'Every 4 to 6 Weeks',
      how: 'Trim excess hoof horn flat. Dip in 5% Copper Sulfate solution.',
      why: 'Prevents foot rot lameness on moist concrete.',
      status: 'Pending',
      targetDate: offsetIsoDate(7),
      assignedTo: 'Small Ruminants Team'
    },
    {
      id: 'tt-5',
      category: 'Crops & Orchards',
      operation: 'Avocado Pre-Harvest Copper Spray',
      when: '21 to 30 Days before Hass maturity',
      how: 'Spray canopy with Micronized Copper Oxychloride fungicide.',
      why: 'Prevents anthracnose spots and secures export quality standards.',
      status: 'Completed',
      targetDate: offsetIsoDate(-1),
      assignedTo: 'Agronomy Handler'
    },
    {
      id: 'tt-6',
      category: 'Crops & Orchards',
      operation: 'Tea Triennial Hard Pruning',
      when: 'Every 3 Years',
      how: 'Cut tea branches to a flat 24-28 inches high table, paint with copper paste.',
      why: 'Resets plucking table width, triggers young plucking shoots.',
      status: 'Pending',
      targetDate: offsetIsoDate(24),
      assignedTo: 'Field Operations'
    },
    {
      id: 'tt-7',
      category: 'Poultry & Dogs',
      operation: 'Newcastle & Gumboro Vaccine',
      when: 'Newcastle Week 1 & 3, Gumboro week 2',
      how: 'Water starvation for 2 hours, mix vaccine vials with cool clean water.',
      why: 'Creates immune defence against poultry virus epidemics.',
      status: 'Completed',
      targetDate: offsetIsoDate(-2),
      assignedTo: 'Poultry Team'
    },
    {
      id: 'tt-8',
      category: 'Poultry & Dogs',
      operation: 'DHLPP + Rabies Vaccine',
      when: 'DHLPP weeks 8, 12, 16; Rabies week 12',
      how: 'Administer 1ml vaccine subcutaneously in the neck skin fold.',
      why: 'Rabies protection and puppy immunisation.',
      status: 'Pending',
      targetDate: offsetIsoDate(4),
      assignedTo: 'Canine Care Specialist'
    }
  ];
};
