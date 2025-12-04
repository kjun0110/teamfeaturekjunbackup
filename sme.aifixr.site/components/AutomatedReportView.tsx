'use client';

import { useState, useEffect } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TotalResultsView } from '@/components/TotalResultsView';
import { CompanyInfoInput } from '@/components/CompanyInfoInput';
import type { ESGStandard } from '@/components/types';
import type { MainTab, ResultsSubTab, InputSubTab, MonthlyESGData, CompanyESGData } from '@/components/types/navigation';

// 샘플 회사별 데이터 생성 (회사명과 기간 기반)
const generateSampleCompanyData = (companyName: string): CompanyESGData[] => {
  const data: CompanyESGData[] = [];
  const now = new Date();

  // 최신부터 20개월 데이터 생성 (페이지네이션 테스트용)
  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // 고정된 시드 기반 점수 (일관성 유지)
    const baseScore = 70 + (i % 10) * 2.5;
    const eScore = baseScore + (i % 5) - 2;
    const sScore = baseScore + (i % 7) - 3;
    const gScore = baseScore + (i % 6) - 2.5;
    const overallScore = (eScore + sScore + gScore) / 3;

    const getGrade = (score: number): string => {
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'B+';
      if (score >= 75) return 'B';
      if (score >= 70) return 'C+';
      if (score >= 65) return 'C';
      if (score >= 60) return 'D+';
      if (score >= 55) return 'D';
      return 'F';
    };

    // ESRS 점수 생성 (K-ESG와 약간 다르게)
    const esrsBaseScore = baseScore + (i % 8) - 3;
    const esrsEScore = esrsBaseScore + (i % 4) - 1.5;
    const esrsSScore = esrsBaseScore + (i % 6) - 2;
    const esrsGScore = esrsBaseScore + (i % 5) - 2;
    const esrsOverallScore = (esrsEScore + esrsSScore + esrsGScore) / 3;

    data.push({
      id: `company-${i}`,
      companyName: companyName || '회사명을 입력하세요',
      period: period,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      eScore: Math.max(0, Math.min(100, eScore)),
      sScore: Math.max(0, Math.min(100, sScore)),
      gScore: Math.max(0, Math.min(100, gScore)),
      overallGrade: getGrade(overallScore),
      eGrade: getGrade(eScore),
      sGrade: getGrade(sScore),
      gGrade: getGrade(gScore),
      // ESRS 점수
      esrsOverallScore: Math.max(0, Math.min(100, esrsOverallScore)),
      esrsEScore: Math.max(0, Math.min(100, esrsEScore)),
      esrsSScore: Math.max(0, Math.min(100, esrsSScore)),
      esrsGScore: Math.max(0, Math.min(100, esrsGScore)),
      esrsOverallGrade: getGrade(esrsOverallScore),
      esrsEGrade: getGrade(esrsEScore),
      esrsSGrade: getGrade(esrsSScore),
      esrsGGrade: getGrade(esrsGScore),
    });
  }

  return data;
};

// 샘플 월별 데이터 생성 (고정된 데이터로 변경)
const generateSampleMonthlyData = (): MonthlyESGData[] => {
  const data: MonthlyESGData[] = [];
  const now = new Date();

  // 고정된 시드 기반 점수 (일관성 유지)
  const scores = [
    { overall: 87.5, e: 85, s: 87, g: 91 },
    { overall: 75.1, e: 81, s: 73, g: 72 },
    { overall: 96.3, e: 98, s: 98, g: 92 },
    { overall: 76.9, e: 76, s: 78, g: 77 },
    { overall: 92.3, e: 87, s: 95, g: 95 },
    { overall: 77.4, e: 78, s: 75, g: 79 },
    { overall: 84.2, e: 82, s: 85, g: 86 },
    { overall: 88.7, e: 90, s: 87, g: 89 },
    { overall: 79.5, e: 80, s: 78, g: 81 },
    { overall: 91.2, e: 92, s: 90, g: 92 },
    { overall: 73.8, e: 74, s: 72, g: 75 },
    { overall: 86.4, e: 85, s: 87, g: 87 },
  ];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const scoreData = scores[11 - i];

    const overallScore = scoreData.overall;
    let grade = '';
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'C+';
    else if (overallScore >= 65) grade = 'C';
    else if (overallScore >= 60) grade = 'D+';
    else if (overallScore >= 55) grade = 'D';
    else grade = 'F';

    data.push({
      id: `month-${i}`,
      month,
      overallScore,
      eScore: scoreData.e,
      sScore: scoreData.s,
      gScore: scoreData.g,
      grade,
    });
  }

  return data;
};

export function AutomatedReportView() {
  const [standard, setStandard] = useState<ESGStandard>('K-ESG');
  const [mainTab, setMainTab] = useState<MainTab>('results');
  const [resultsSubTab, setResultsSubTab] = useState<ResultsSubTab>('total');
  const [inputSubTab, setInputSubTab] = useState<InputSubTab>('company-info');
  const [monthlyData, setMonthlyData] = useState<MonthlyESGData[]>([]);
  const [companyData, setCompanyData] = useState<CompanyESGData[]>([]);
  const [companyName, setCompanyName] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 데이터 생성
  useEffect(() => {
    setIsMounted(true);
    setMonthlyData(generateSampleMonthlyData());
  }, []);

  // 회사명이 변경되면 데이터 업데이트
  useEffect(() => {
    if (isMounted) {
      setCompanyData(generateSampleCompanyData(companyName));
    }
  }, [companyName, isMounted]);

  const renderContent = () => {
    if (!isMounted) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">로딩 중...</div>
        </div>
      );
    }

    if (mainTab === 'results') {
      if (resultsSubTab === 'total') {
        return <TotalResultsView companyData={companyData} companyName={companyName} standard={standard} onStandardChange={setStandard} />;
      }
      if (resultsSubTab === 'environment') {
        return <div className="space-y-6"><h2 className="text-3xl font-bold text-foreground mb-2">Environment 결과</h2><p className="text-foreground-muted">Environment 데이터를 확인할 수 있습니다</p></div>;
      }
      if (resultsSubTab === 'social') {
        return <div className="space-y-6"><h2 className="text-3xl font-bold text-foreground mb-2">Social 결과</h2><p className="text-foreground-muted">Social 데이터를 확인할 수 있습니다</p></div>;
      }
      if (resultsSubTab === 'governance') {
        return <div className="space-y-6"><h2 className="text-3xl font-bold text-foreground mb-2">Governance 결과</h2><p className="text-foreground-muted">Governance 데이터를 확인할 수 있습니다</p></div>;
      }
      return <div>준비 중입니다...</div>;
    } else if (mainTab === 'input') {
      if (inputSubTab === 'company-info') {
        return <CompanyInfoInput companyName={companyName} onCompanyNameChange={setCompanyName} />;
      }
      if (inputSubTab === 'environment') {
        return <div className="space-y-6"><h2 className="text-3xl font-bold text-foreground mb-2">Environment 데이터 입력</h2><p className="text-foreground-muted">Environment 데이터를 입력할 수 있습니다</p></div>;
      }
      if (inputSubTab === 'social') {
        return <div className="space-y-6"><h2 className="text-3xl font-bold text-foreground mb-2">Social 데이터 입력</h2><p className="text-foreground-muted">Social 데이터를 입력할 수 있습니다</p></div>;
      }
      if (inputSubTab === 'governance') {
        return <div className="space-y-6"><h2 className="text-3xl font-bold text-foreground mb-2">Governance 데이터 입력</h2><p className="text-foreground-muted">Governance 데이터를 입력할 수 있습니다</p></div>;
      }
      return <div>준비 중입니다...</div>;
    }

    return <div>준비 중입니다...</div>;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar
          mainTab={mainTab}
          resultsSubTab={resultsSubTab}
          inputSubTab={inputSubTab}
          onMainTabChange={setMainTab}
          onResultsSubTabChange={setResultsSubTab}
          onInputSubTabChange={setInputSubTab}
        />
        <SidebarInset>
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              {/* Standard Info Badge */}
              <div className="inline-flex items-center gap-2 bg-aifix-secondary-light text-aifix-secondary px-5 py-2.5 rounded-full border border-aifix-secondary/20">
                <div className="w-2 h-2 bg-aifix-secondary rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Currently using {standard} standard / 현재 {standard} 기준 사용 중
                </span>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-6 py-8 max-w-7xl">
                {renderContent()}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
