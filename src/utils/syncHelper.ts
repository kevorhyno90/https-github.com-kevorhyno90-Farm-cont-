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
  if (item.id) return String(item.id);
  if (item.ref) return String(item.ref);
  if (item.code) return String(item.code);
  if (item.tagId) return String(item.tagId);
  if (item.kidTagId) return String(item.kidTagId);
  if (item.doeTagId) return String(item.doeTagId);
  if (item.flockId) return String(item.flockId);
  if (item.batchId) return String(item.batchId);
  // Specifically for breeding/AI records (cowId + date)
  if ((collectionKey === 'jr_farm_ai' || item.bull !== undefined) && item.cowId && item.date) {
    return `ai_${item.cowId}_${item.date}`;
  }
  if (item.cowId && item.date) {
    return `${item.cowId}_${item.date}`;
  }
  if (item.date && item.time) {
    return `${item.date}_${item.time}`;
  }
  if (collectionKey === 'jr_farm_milk' && item.date) {
    return `milk_${item.date}`;
  }
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
    'jr_farm_estate_settings'
  ];

  // Dynamically include any jr_farm_* keys from cloudPayload or localStorage
  const allKeys = Array.from(new Set([
    ...BASE_KEYS,
    ...Object.keys(cloudPayload).filter(k => k.startsWith('jr_farm_') && k !== 'jr_farm_cloud_last_synced_at'),
    ...Object.keys(localStorage).filter(k => k.startsWith('jr_farm_') && k !== 'jr_farm_cloud_last_synced_at')
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

  const globalDeletedSet = new Set(deletedRecords);
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

      localMap.forEach((val, id) => {
        // Skip if globally deleted
        if (globalDeletedSet.has(id)) return;

        if (!cloudMap.has(id)) {
          mergedArray.push(val);
        } else {
          const cloudVal = cloudMap.get(id);
          const resolution = conflictResolutions.get(id);
          if (resolution === 'local') {
            mergedArray.push(val);
          } else if (resolution === 'cloud') {
            mergedArray.push(cloudVal);
          } else {
            // Intelligent conflict resolution: compare timestamps if available
            const localTime = val?.updatedAt ? new Date(val.updatedAt).getTime() : (val?.date ? new Date(val.date).getTime() : 0);
            const cloudTime = cloudVal?.updatedAt ? new Date(cloudVal.updatedAt).getTime() : (cloudVal?.date ? new Date(cloudVal.date).getTime() : 0);

            if (localTime > cloudTime) {
              mergedArray.push(val);
            } else if (cloudTime > localTime) {
              mergedArray.push(cloudVal);
            } else {
              // Same timestamp or untracked: merge fields, with local edits taking precedence over stale cloud fields
              mergedArray.push({ ...cloudVal, ...val });
            }
          }
        }
      });

      cloudMap.forEach((val, id) => {
        // Skip if globally deleted
        if (globalDeletedSet.has(id)) return;

        if (!localMap.has(id)) {
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
