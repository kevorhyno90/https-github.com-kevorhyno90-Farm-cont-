import { toIsoDate } from './dateHelper';

export const buildReportPdfFilename = (
  activeKeys: string[],
  partialThreshold: number = 17
): string => {
  const dateSuffix = toIsoDate();

  if (activeKeys.length === 1) {
    const key = activeKeys[0];
    const formattedKey = key === 'ai' ? 'Insemination_Breeding' : key.charAt(0).toUpperCase() + key.slice(1);
    return `JR_Farm_${formattedKey}_Report_${dateSuffix}.pdf`;
  }

  if (activeKeys.length < partialThreshold) {
    return `JR_Farm_Active_Sections_Report_${dateSuffix}.pdf`;
  }

  return `JR_Farm_Master_Estate_Report_${dateSuffix}.pdf`;
};
