export type UserRole = 'owner' | 'manager' | 'herdsman_vet' | 'field_worker';

export interface RolePermissionConfig {
  role: UserRole;
  label: string;
  description: string;
  allowedCategories: string[];
  disallowedTabIds: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  owner: {
    role: 'owner',
    label: 'Farm Owner & Director',
    description: 'Unrestricted master access to all financial records, executive settings, system backups, and operations.',
    allowedCategories: ['Main', 'Feed & Factory', 'Livestock', 'Crop Exports', 'Operations', 'Academy'],
    disallowedTabIds: []
  },
  manager: {
    role: 'manager',
    label: 'General Estate Manager',
    description: 'Operational and workforce leadership across all production, machinery, and logistics domains.',
    allowedCategories: ['Main', 'Feed & Factory', 'Livestock', 'Crop Exports', 'Operations', 'Academy'],
    disallowedTabIds: ['backup']
  },
  herdsman_vet: {
    role: 'herdsman_vet',
    label: 'Herdsman & Veterinary Lead',
    description: 'Specialized focus on dairy cattle, caprine breeding, poultry, biosecurity, and feed ration formulation.',
    allowedCategories: ['Main', 'Feed & Factory', 'Livestock', 'Academy'],
    disallowedTabIds: ['finance', 'backup', 'settings', 'roster']
  },
  field_worker: {
    role: 'field_worker',
    label: 'Agronomy & Field Specialist',
    description: 'Hands-on focus for cash crops, tea harvesting, avocado orchard shipments, and GlobalGAP spraying.',
    allowedCategories: ['Main', 'Crop Exports', 'Academy'],
    disallowedTabIds: ['finance', 'backup', 'settings', 'roster', 'dairy', 'canines']
  }
};

export interface FarmSettings {
  estateName: string;
  administrator: string;
  locationCode: string;
  currency: string;
  teaContractPrice: number;
  avocadoTargetVolume: number;
  targetDailyMilk: number;
  dryOffGestationDay: number;
  gestationDuration: number;
  simulationSpeed: string;
  autoSeedingEnabled: boolean;
  latitude: number;
  longitude: number;
  playstorePackageId: string;
  playstoreAppTitle: string;
  admobBannerUnitId: string;
  admobInterstitialUnitId: string;
  monetizationStrategy: string;
  premiumAppPrice: string;
  orientationPreference: 'any' | 'portrait' | 'landscape';
  activeRole: UserRole;
}

export const DEFAULT_SETTINGS: FarmSettings = {
  estateName: 'NYARONDE COOPERATIVE ESTATE',
  administrator: 'Dr. Devin Omwenga',
  locationCode: 'KT-205A Nyamira',
  currency: 'Ksh',
  teaContractPrice: 58,
  avocadoTargetVolume: 12000,
  targetDailyMilk: 22.5,
  dryOffGestationDay: 220,
  gestationDuration: 283,
  simulationSpeed: 'Normal',
  autoSeedingEnabled: true,
  latitude: -0.5667,
  longitude: 34.9333,
  playstorePackageId: 'com.nyaronde.jrfarm.estate',
  playstoreAppTitle: 'JR BioFarm Nexus Manager',
  admobBannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  admobInterstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  monetizationStrategy: 'Ad Supported (AdMob)',
  premiumAppPrice: '9.99',
  orientationPreference: 'any',
  activeRole: 'owner'
};

export function getStoredSettings(): FarmSettings {
  try {
    const stored = localStorage.getItem('jr_farm_estate_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure numeric fields are correctly parsed if stringified
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      if (!merged.orientationPreference) {
        merged.orientationPreference = 'any';
      }
      if (!merged.activeRole) {
        merged.activeRole = 'owner';
      }
      merged.latitude = parseFloat(merged.latitude as any) || DEFAULT_SETTINGS.latitude;
      merged.longitude = parseFloat(merged.longitude as any) || DEFAULT_SETTINGS.longitude;
      merged.teaContractPrice = parseFloat(merged.teaContractPrice as any) || DEFAULT_SETTINGS.teaContractPrice;
      merged.avocadoTargetVolume = parseFloat(merged.avocadoTargetVolume as any) || DEFAULT_SETTINGS.avocadoTargetVolume;
      merged.targetDailyMilk = parseFloat(merged.targetDailyMilk as any) || DEFAULT_SETTINGS.targetDailyMilk;
      merged.dryOffGestationDay = parseInt(merged.dryOffGestationDay as any, 10) || DEFAULT_SETTINGS.dryOffGestationDay;
      merged.gestationDuration = parseInt(merged.gestationDuration as any, 10) || DEFAULT_SETTINGS.gestationDuration;
      return merged;
    }
  } catch (e) {
    console.error("Local storage load exception", e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Safely applies the user's preferred screen orientation locking/auto-rotate state.
 * Works inside installed PWAs and supporting mobile browsers.
 */
export function applyOrientationPreference(preference: 'any' | 'portrait' | 'landscape') {
  if (typeof window === 'undefined') return;
  
  const screenObj = window.screen as any;
  if (!screenObj || !screenObj.orientation) {
    console.log("Screen Orientation API is not supported on this browser or device (e.g. standard iOS Safari).");
    return;
  }

  try {
    if (preference === 'portrait') {
      screenObj.orientation.lock('portrait-primary')
        .then(() => console.log("Orientation locked to Portrait Mode successfully."))
        .catch((err: any) => {
          // If portrait-primary is not supported, try generic portrait
          screenObj.orientation.lock('portrait').catch((e2: any) => {
            console.log("Note: Native orientation lock portrait bypassed:", e2.message || e2);
          });
        });
    } else if (preference === 'landscape') {
      screenObj.orientation.lock('landscape-primary')
        .then(() => console.log("Orientation locked to Landscape Mode successfully."))
        .catch((err: any) => {
          // If landscape-primary is not supported, try generic landscape
          screenObj.orientation.lock('landscape').catch((e2: any) => {
            console.log("Note: Native orientation lock landscape bypassed:", e2.message || e2);
          });
        });
    } else {
      // Unlock orientation to allow native device auto-rotate
      screenObj.orientation.unlock();
      console.log("Orientation unlocked. Device native auto-rotation enabled.");
    }
  } catch (e: any) {
    console.log("Orientation preference lock skipped:", e.message || e);
  }
}
