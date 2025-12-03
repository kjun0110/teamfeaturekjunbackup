export type MainTab = 'results' | 'input';
export type ResultsSubTab = 'total' | 'environment' | 'social' | 'governance';
export type InputSubTab = 'company-info' | 'environment' | 'social' | 'governance';

export interface MonthlyESGData {
  id: string;
  month: string; // YYYY-MM 형식
  overallScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  grade: string;
}

export interface CompanyESGData {
  id: string;
  companyName: string;
  period: string; // 기간 (예: "2025-12")
  overallScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  overallGrade: string;
  eGrade: string;
  sGrade: string;
  gGrade: string;
  // ESRS 표준 점수 (K-ESG와 다를 수 있음)
  esrsOverallScore?: number;
  esrsEScore?: number;
  esrsSScore?: number;
  esrsGScore?: number;
  esrsOverallGrade?: string;
  esrsEGrade?: string;
  esrsSGrade?: string;
  esrsGGrade?: string;
}

