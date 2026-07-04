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
  playstoreAppTitle: 'JR Farm Omni-Estate Manager',
  admobBannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  admobInterstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  monetizationStrategy: 'Ad Supported (AdMob)',
  premiumAppPrice: '9.99',
  orientationPreference: 'any'
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
