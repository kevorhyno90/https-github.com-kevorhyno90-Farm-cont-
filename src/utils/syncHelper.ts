export interface ConflictConfig {
  key: string;
  label: string;
  localOnlyCount: number;
  cloudOnlyCount: number;
  idConflicts: Array<{
    id: string;
    localVal: any;
    cloudVal: any;
    selectedSource: 'local' | 'cloud';
  }>;
}

export const getItemKey = (item: any, collectionKey?: string): string => {
  if (!item || typeof item !== 'object') return String(item);

  // 1. Milking records: must combine cow tag + date to be uniquely identifiable
  if (collectionKey === 'jr_farm_milk' || ((item.am !== undefined || item.pm !== undefined) && item.date)) {
    const cow = item.id || item.cowId || '';
    const date = item.date || '';
    const session = item.session || '';
    return `milk_${cow}_${date}${session ? '_' + session : ''}`;
  }

  // 2. AI / Breeding records: cowId + date
  if ((collectionKey === 'jr_farm_ai' || item.bull !== undefined) && item.cowId && item.date) {
    return `ai_${item.cowId}_${item.date}`;
  }

  // 3. Generic Unique IDs
  if (item.id) return String(item.id);
  if (item.ref) return String(item.ref);
  if (item.code) return String(item.code);
  if (item.tag) return String(item.tag);
  if (item.tagId) return String(item.tagId);
  if (item.kidTagId) return String(item.kidTagId);
  if (item.doeTagId) return String(item.doeTagId);
  if (item.flockId) return String(item.flockId);
  if (item.batchId) return String(item.batchId);
  if (item.cowId && item.date) return `${item.cowId}_${item.date}`;
  if (item.date && item.time) return `${item.date}_${item.time}`;
  if (item.name) return String(item.name);
  return JSON.stringify(item);
};

export const executeSmartMerge = (
  cloudPayload: Record<string, any>,
  strategy: 'merge' | 'cloud' | 'local',
  conflicts: ConflictConfig[] = []
): Record<string, any> => {
  const BASE_KEYS = [
    'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
    'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
    'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
    'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
    'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales',
    'jr_farm_animal_sales', 'jr_farm_mortalities', 'jr_farm_activity_logs',
    'jr_farm_silages', 'jr_farm_heifers', 'jr_farm_poultries', 'jr_farm_quarantines',
    'jr_farm_semen_inventory', 'jr_farm_azolla', 'jr_farm_machinery', 'jr_farm_machinery_services',
    'jr_farm_custom_timetable', 'jr_farm_milk_outflows', 'jr_farm_tmr_mix_logs',
    'jr_farm_estate_settings',
    'jr_farm_poultry_flocks', 'jr_farm_poultry_eggs', 'jr_farm_poultry_health', 'jr_farm_poultry_mortality',
    'jr_farm_canine_profiles', 'jr_farm_canine_vaccines', 'jr_farm_canine_treatments', 'jr_farm_canine_patrols',
    'jr_farm_canine_training', 'jr_farm_canine_feeding', 'jr_farm_canine_breeding', 'jr_farm_canine_biosecurity',
    'jr_farm_canine_sales', 'jr_farm_canine_mortality', 'jr_farm_canine_emergency_meds', 'jr_farm_canine_handovers', 'jr_farm_kennel_bays',
    'jr_farm_bsf_breeding_logs', 'jr_farm_bsf_egg_collections', 'jr_farm_bsf_feedings', 'jr_farm_bsf_harvests',
    'jr_farm_bsf_pupae_harvests', 'jr_farm_bsf_commercial_sales', 'jr_farm_bsf_substrates',
    'jr_farm_goat_breedings', 'jr_farm_goat_treatments', 'jr_farm_goat_kids',
    'jr_farm_dairy_calves', 'jr_farm_dairy_heifers',
    'jr_farm_morning_buyer_payments', 'jr_farm_monthly_debt_settlements', 'jr_farm_owner_remittances',
    'jr_farm_tea_practices', 'jr_farm_tea_weekly_disbursed',
    'jr_farm_avo_practices', 'jr_farm_avo_sections',
    'jr_farm_inventory_movements',
    'jr_farm_attendance_records', 'jr_farm_weekly_shifts',
    'jr_farm_alarm_resolutions', 'jr_farm_feed_formulator_batch'
  ];

  // Dynamically include any jr_farm_* keys from cloudPayload or localStorage
  const allKeys = Array.from(new Set([
    ...BASE_KEYS,
    ...Object.keys(cloudPayload).filter(k => k.startsWith('jr_farm_') && k !== 'jr_farm_cloud_last_synced_at' && k !== 'jr_farm_device_persistent_id'),
    ...Object.keys(localStorage).filter(k => k.startsWith('jr_farm_') && k !== 'jr_farm_cloud_last_synced_at' && k !== 'jr_farm_device_persistent_id')
  ]));

  const mergedPayload: Record<string, any> = {};

  // Retrieve deleted tombstone records
  let deletedRecords: string[] = [];
  try {
    const rawDeleted = localStorage.getItem('jr_farm_deleted_records');
    if (rawDeleted) {
      deletedRecords = JSON.parse(rawDeleted);
    }
  } catch (e) {
    console.error("Error reading deleted records tombstone", e);
  }

  // Also look for cloud-deleted records if they are tracked in the payload
  if (cloudPayload['jr_farm_deleted_records']) {
    try {
      const cloudDeleted = Array.isArray(cloudPayload['jr_farm_deleted_records']) 
        ? cloudPayload['jr_farm_deleted_records'] 
        : JSON.parse(cloudPayload['jr_farm_deleted_records']);
      deletedRecords = [...deletedRecords, ...cloudDeleted];
    } catch (e) {
      console.error("Error reading cloud deleted records tombstone", e);
    }
  }

  // Keep up to 2000 most recent tombstones
  const globalDeletedSet = new Set(deletedRecords.slice(-2000));
  mergedPayload['jr_farm_deleted_records'] = Array.from(globalDeletedSet);

  allKeys.forEach(k => {
    const localRaw = localStorage.getItem(k);
    const cloudRaw = cloudPayload[k];

    if (!localRaw && !cloudRaw) return;

    let localData: any = null;
    if (localRaw) {
      try { localData = JSON.parse(localRaw); } catch { localData = localRaw; }
    }

    const cloudData = cloudRaw;

    if (!localData) {
      mergedPayload[k] = cloudData;
      return;
    }
    if (!cloudData) {
      mergedPayload[k] = localData;
      return;
    }

    if (strategy === 'cloud') {
      mergedPayload[k] = cloudData;
      return;
    }
    if (strategy === 'local') {
      mergedPayload[k] = localData;
      return;
    }

    if (Array.isArray(localData) && Array.isArray(cloudData)) {
      const itemConflicts = conflicts.find(c => c.key === k)?.idConflicts || [];
      const conflictResolutions = new Map<string, 'local' | 'cloud'>();
      itemConflicts.forEach(item => {
        conflictResolutions.set(item.id, item.selectedSource);
      });

      const mergedArray: any[] = [];
      const localMap = new Map<string, any>();
      localData.forEach(item => {
        const id = getItemKey(item, k);
        localMap.set(String(id), item);
      });

      const cloudMap = new Map<string, any>();
      cloudData.forEach(item => {
        const id = getItemKey(item, k);
        cloudMap.set(String(id), item);
      });

      // Cloud is authoritative for active items: iterate cloudMap
      cloudMap.forEach((cloudVal, id) => {
        if (globalDeletedSet.has(id)) return;

        if (!localMap.has(id)) {
          mergedArray.push(cloudVal);
        } else {
          const localVal = localMap.get(id);
          const resolution = conflictResolutions.get(id);
          if (resolution === 'local') {
            mergedArray.push(localVal);
          } else if (resolution === 'cloud') {
            mergedArray.push(cloudVal);
          } else {
            // Intelligent conflict resolution: compare timestamps if available
            const localTime = localVal?.updatedAt ? new Date(localVal.updatedAt).getTime() : (localVal?.date ? new Date(localVal.date).getTime() : 0);
            const cloudTime = cloudVal?.updatedAt ? new Date(cloudVal.updatedAt).getTime() : (cloudVal?.date ? new Date(cloudVal.date).getTime() : 0);

            if (localTime > cloudTime) {
              mergedArray.push(localVal);
            } else if (cloudTime > localTime) {
              mergedArray.push(cloudVal);
            } else {
              mergedArray.push({ ...cloudVal, ...localVal });
            }
          }
        }
      });

      // Only preserve local items missing from cloud if explicitly marked as pending offline draft
      localMap.forEach((val, id) => {
        if (globalDeletedSet.has(id) || cloudMap.has(id)) return;
        if (val?._isLocalDraft || val?._pendingUpload) {
          mergedArray.push(val);
        }
      });

      mergedPayload[k] = mergedArray;
    } else {
      const configConflict = conflicts.find(c => c.key === k)?.idConflicts?.[0];
      if (configConflict) {
        mergedPayload[k] = configConflict.selectedSource === 'local' ? localData : cloudData;
      } else {
        mergedPayload[k] = cloudData; // Default merge strategy for non-arrays (objects/configs) is cloud wins
      }
    }
  });

  return mergedPayload;
};
