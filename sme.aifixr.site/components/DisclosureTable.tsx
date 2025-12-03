import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DisclosureItem, ESGStandard } from './types';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface DisclosureTableProps {
  disclosureItems: DisclosureItem[];
  updateCompanyValue: (id: string, value: number) => void;
  standard: ESGStandard;
}

const getItemGrade = (companyValue: number, standardValue: number, maxValue: number): string => {
  const percentage = (companyValue / maxValue) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'C+';
  if (percentage >= 65) return 'C';
  if (percentage >= 60) return 'D+';
  if (percentage >= 55) return 'D';
  return 'F';
};

const getGradeBadgeColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'bg-aifix-primary/10 text-aifix-primary border-aifix-primary/20';
  if (grade.startsWith('B')) return 'bg-aifix-secondary/10 text-aifix-secondary border-aifix-secondary/20';
  if (grade.startsWith('C')) return 'bg-aifix-together/10 text-aifix-together border-aifix-together/20';
  if (grade.startsWith('D')) return 'bg-aifix-courage/10 text-aifix-courage border-aifix-courage/20';
  return 'bg-aifix-courage/10 text-aifix-courage border-aifix-courage/20';
};

const generateAdvice = (
  item: DisclosureItem,
  grade: string,
  standard: ESGStandard
): { en: string; ko: string } => {
  const diff = item.standardValue - item.companyValue;
  
  if (diff <= 0) {
    return {
      en: 'Excellent performance! Maintain current practices and share best practices with peers.',
      ko: '우수한 성과입니다! 현재 관행을 유지하고 동료들과 모범 사례를 공유하세요.',
    };
  }

  const adviceMap: Record<string, Record<string, { en: string; ko: string }>> = {
    E: {
      'E-01': {
        en: 'Implement energy-efficient technologies and set measurable emission reduction targets.',
        ko: '에너지 효율적인 기술을 도입하고 측정 가능한 배출 감축 목표를 설정하세요.',
      },
      'E-02': {
        en: 'Conduct energy audit and upgrade to LED lighting and efficient HVAC systems.',
        ko: '에너지 감사를 수행하고 LED 조명 및 효율적인 HVAC 시스템으로 업그레이드하세요.',
      },
      'E-03': {
        en: 'Install water monitoring systems and implement recycling programs.',
        ko: '물 모니터링 시스템을 설치하고 재활용 프로그램을 구현하세요.',
      },
      'E-04': {
        en: 'Establish waste segregation protocols and partner with recycling vendors.',
        ko: '폐기물 분리 프로토콜을 수립하고 재활용 업체와 파트너십을 맺으세요.',
      },
    },
    S: {
      'S-01': {
        en: 'Develop comprehensive safety training programs and conduct regular workplace assessments.',
        ko: '포괄적인 안전 교육 프로그램을 개발하고 정기적인 작업장 평가를 실시하세요.',
      },
      'S-02': {
        en: 'Create inclusive hiring policies and establish diversity training initiatives.',
        ko: '포용적인 채용 정책을 만들고 다양성 교육 이니셔티브를 수립하세요.',
      },
      'S-03': {
        en: 'Review labor contracts and ensure compliance with international labor standards.',
        ko: '노동 계약을 검토하고 국제 노동 기준 준수를 보장하세요.',
      },
      'S-04': {
        en: 'Initiate local community partnerships and volunteer programs for employees.',
        ko: '지역 사회 파트너십을 시작하고 직원을 위한 자원봉사 프로그램을 운영하세요.',
      },
    },
    G: {
      'G-01': {
        en: 'Appoint independent board members and establish clear governance committees.',
        ko: '독립적인 이사회 구성원을 임명하고 명확한 거버넌스 위원회를 설립하세요.',
      },
      'G-02': {
        en: 'Implement ethics hotline and provide regular compliance training to all staff.',
        ko: '윤리 핫라인을 구현하고 모든 직원에게 정기적인 준법 교육을 제공하세요.',
      },
      'G-03': {
        en: 'Develop enterprise risk management framework and conduct quarterly risk assessments.',
        ko: '기업 리스크 관리 프레임워크를 개발하고 분기별 리스크 평가를 실시하세요.',
      },
      'G-04': {
        en: 'Publish annual sustainability reports and enhance stakeholder communication channels.',
        ko: '연간 지속가능성 보고서를 발행하고 이해관계자 커뮤니케이션 채널을 강화하세요.',
      },
    },
  };

  const categoryAdvice = adviceMap[item.category];
  const specificAdvice = categoryAdvice?.[item.itemNumber];

  return specificAdvice || {
    en: `Improve by ${diff.toFixed(0)} points to meet ${standard} standards. Focus on gap analysis and action planning.`,
    ko: `${standard} 기준을 충족하기 위해 ${diff.toFixed(0)}점을 개선하세요. 격차 분석 및 실행 계획에 집중하세요.`,
  };
};

const getCategoryColor = (category: 'E' | 'S' | 'G'): string => {
  switch (category) {
    case 'E':
      return 'bg-aifix-together/5 border-l-4 border-l-aifix-together';
    case 'S':
      return 'bg-aifix-secondary/5 border-l-4 border-l-aifix-secondary';
    case 'G':
      return 'bg-aifix-primary/5 border-l-4 border-l-aifix-primary';
  }
};

const getCategoryLabel = (category: 'E' | 'S' | 'G'): { en: string; ko: string } => {
  switch (category) {
    case 'E':
      return { en: 'Environmental', ko: '환경' };
    case 'S':
      return { en: 'Social', ko: '사회' };
    case 'G':
      return { en: 'Governance', ko: '지배구조' };
  }
};

export function DisclosureTable({
  disclosureItems,
  updateCompanyValue,
  standard,
}: DisclosureTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const groupedItems = {
    E: disclosureItems.filter(item => item.category === 'E'),
    S: disclosureItems.filter(item => item.category === 'S'),
    G: disclosureItems.filter(item => item.category === 'G'),
  };

  return (
    <Card className="bg-white shadow-aifix-lg border-2 border-border rounded-xl">
      <div className="p-6 border-b border-border bg-gradient-to-r from-aifix-secondary-light/30 to-aifix-primary-light/20 rounded-t-xl">
        <h2 className="text-foreground mb-1 font-bold">
          Disclosure Items Assessment
        </h2>
        <p className="text-foreground-muted">
          공시 항목 평가
        </p>
      </div>

      <div className="p-4 md:p-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-4 text-foreground font-semibold">
                  <div>Item Number</div>
                  <div className="text-foreground-muted text-xs mt-1">항목 번호</div>
                </th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">
                  <div>Disclosure Item</div>
                  <div className="text-foreground-muted text-xs mt-1">공시 항목</div>
                </th>
                <th className="text-center py-3 px-4 text-foreground font-semibold">
                  <div>Company Value</div>
                  <div className="text-foreground-muted text-xs mt-1">기업 입력값</div>
                </th>
                <th className="text-center py-3 px-4 text-foreground font-semibold">
                  <div>Standard</div>
                  <div className="text-foreground-muted text-xs mt-1">기준값</div>
                </th>
                <th className="text-center py-3 px-4 text-foreground font-semibold">
                  <div>Grade</div>
                  <div className="text-foreground-muted text-xs mt-1">등급</div>
                </th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">
                  <div>AI Advice</div>
                  <div className="text-foreground-muted text-xs mt-1">AI 개선 조언</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedItems).map(([category, items]) => (
                <>
                  <tr key={`header-${category}`} className="bg-aifix-secondary-light/20">
                    <td colSpan={6} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getGradeBadgeColor('A')}>
                          {getCategoryLabel(category as 'E' | 'S' | 'G').en}
                        </Badge>
                        <span className="text-foreground font-semibold">
                          {getCategoryLabel(category as 'E' | 'S' | 'G').ko}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {items.map((item) => {
                    const grade = getItemGrade(item.companyValue, item.standardValue, item.maxValue);
                    const advice = generateAdvice(item, grade, standard);
                    return (
                      <tr key={item.id} className="border-b border-border hover:bg-aifix-secondary-light/10 transition-colors">
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="border-border text-foreground">
                            {item.itemNumber}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-foreground font-medium">{item.itemName}</div>
                          <div className="text-sm text-foreground-muted mt-1">{item.itemNameKo}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Input
                            type="number"
                            min="0"
                            max={item.maxValue}
                            value={item.companyValue}
                            onChange={(e) => {
                              const value = Math.min(item.maxValue, Math.max(0, Number(e.target.value)));
                              updateCompanyValue(item.id, value);
                            }}
                            className="w-24 text-center border-border focus:border-aifix-primary focus:ring-aifix-primary/20"
                          />
                        </td>
                        <td className="py-4 px-4 text-center text-foreground font-semibold">
                          {item.standardValue}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={getGradeBadgeColor(grade)}>
                            {grade}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-aifix-courage mt-1 flex-shrink-0" />
                            <div className="text-sm">
                              <div className="text-foreground">{advice.en}</div>
                              <div className="text-foreground-muted mt-1">{advice.ko}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="mb-3 p-3 bg-aifix-secondary-light/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Badge className={getGradeBadgeColor('A')}>
                    {getCategoryLabel(category as 'E' | 'S' | 'G').en}
                  </Badge>
                  <span className="text-foreground font-semibold">
                    {getCategoryLabel(category as 'E' | 'S' | 'G').ko}
                  </span>
                </div>
              </div>
              {items.map((item) => {
                const grade = getItemGrade(item.companyValue, item.standardValue, item.maxValue);
                const advice = generateAdvice(item, grade, standard);
                const isExpanded = expandedRows.has(item.id);

                return (
                  <Card key={item.id} className={`p-4 ${getCategoryColor(item.category)} rounded-xl`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Badge variant="outline" className="border-border text-foreground mb-2">
                          {item.itemNumber}
                        </Badge>
                        <div className="text-foreground mb-1 font-medium">{item.itemName}</div>
                        <div className="text-sm text-foreground-muted">{item.itemNameKo}</div>
                      </div>
                      <Badge className={getGradeBadgeColor(grade)}>
                        {grade}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-foreground-muted block mb-1 font-medium">
                          Company Value / 기업값
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={item.maxValue}
                          value={item.companyValue}
                          onChange={(e) => {
                            const value = Math.min(item.maxValue, Math.max(0, Number(e.target.value)));
                            updateCompanyValue(item.id, value);
                          }}
                          className="border-border focus:border-aifix-primary focus:ring-aifix-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground-muted block mb-1 font-medium">
                          Standard / 기준값
                        </label>
                        <div className="h-10 flex items-center justify-center bg-aifix-secondary-light/20 rounded-md border border-border text-foreground font-semibold">
                          {item.standardValue}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(item.id)}
                      className="w-full text-foreground hover:text-aifix-primary hover:bg-aifix-secondary-light/30 rounded-lg"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {isExpanded ? 'Hide' : 'Show'} AI Advice / AI 조언 {isExpanded ? '숨기기' : '보기'}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 p-3 bg-aifix-courage/5 border border-aifix-courage/20 rounded-lg">
                        <div className="text-sm text-foreground mb-2 font-medium">{advice.en}</div>
                        <div className="text-sm text-foreground-muted">{advice.ko}</div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

