export type ESGStandard = 'K-ESG' | 'ESRS';

export interface DisclosureItem {
  id: string;
  itemNumber: string;
  itemName: string;
  itemNameKo: string;
  category: 'E' | 'S' | 'G';
  companyValue: number;
  standardValue: number;
  maxValue: number;
}

