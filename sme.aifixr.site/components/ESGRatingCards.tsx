import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { DisclosureItem } from './types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ESGRatingCardsProps {
  disclosureItems: DisclosureItem[];
}

const calculateCategoryScore = (items: DisclosureItem[], category: 'E' | 'S' | 'G') => {
  const categoryItems = items.filter(item => item.category === category);
  const totalScore = categoryItems.reduce((sum, item) => sum + item.companyValue, 0);
  const maxScore = categoryItems.reduce((sum, item) => sum + item.maxValue, 0);
  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
};

const calculateOverallScore = (items: DisclosureItem[]) => {
  const totalScore = items.reduce((sum, item) => sum + item.companyValue, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxValue, 0);
  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
};

const getLetterGrade = (score: number): string => {
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

const getGradeColor = (score: number): string => {
  if (score >= 85) return 'text-aifix-primary';
  if (score >= 75) return 'text-aifix-secondary';
  if (score >= 65) return 'text-aifix-together';
  if (score >= 55) return 'text-aifix-courage';
  return 'text-aifix-courage';
};

const getProgressColor = (score: number): string => {
  if (score >= 85) return 'bg-aifix-primary';
  if (score >= 75) return 'bg-aifix-secondary';
  if (score >= 65) return 'bg-aifix-together';
  if (score >= 55) return 'bg-aifix-courage';
  return 'bg-aifix-courage';
};

const getTrendIcon = (score: number, benchmark: number) => {
  const diff = score - benchmark;
  if (diff > 2) return <TrendingUp className="h-4 w-4 text-aifix-secondary" />;
  if (diff < -2) return <TrendingDown className="h-4 w-4 text-aifix-courage" />;
  return <Minus className="h-4 w-4 text-foreground-muted" />;
};

const RatingCard = ({
  title,
  titleKo,
  score,
  benchmark,
  color,
}: {
  title: string;
  titleKo: string;
  score: number;
  benchmark: number;
  color: string;
}) => {
  const grade = getLetterGrade(score);
  const gradeColor = getGradeColor(score);

  return (
    <Card className={`p-6 border-2 ${color} bg-white shadow-aifix-lg hover:shadow-aifix transition-all duration-200 rounded-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-foreground mb-1 font-bold">{title}</h3>
          <p className="text-foreground-muted">{titleKo}</p>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon(score, benchmark)}
          <Badge variant="secondary" className="bg-aifix-secondary-light text-aifix-secondary hover:bg-aifix-secondary-light font-semibold">
            {score.toFixed(1)}%
          </Badge>
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div className={`${gradeColor} font-bold`}>
          <div className="text-5xl tracking-tight">{grade}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-foreground-muted mb-1">
            Benchmark / 기준
          </div>
          <div className="text-sm text-foreground font-semibold">
            {benchmark.toFixed(1)}%
          </div>
        </div>
      </div>

      <Progress value={score} className="h-3 rounded-full" indicatorClassName={getProgressColor(score)} />
      
      <div className="mt-3 flex items-center justify-between text-xs text-foreground-muted">
        <span>Progress / 진행도</span>
        <span>{score.toFixed(1)}% of 100%</span>
      </div>
    </Card>
  );
};

export function ESGRatingCards({ disclosureItems }: ESGRatingCardsProps) {
  const eScore = calculateCategoryScore(disclosureItems, 'E');
  const sScore = calculateCategoryScore(disclosureItems, 'S');
  const gScore = calculateCategoryScore(disclosureItems, 'G');
  const overallScore = calculateOverallScore(disclosureItems);

  // Calculate benchmarks (average of standard values)
  const eBenchmark = disclosureItems
    .filter(item => item.category === 'E')
    .reduce((sum, item) => sum + item.standardValue, 0) / 
    disclosureItems.filter(item => item.category === 'E').length;
  
  const sBenchmark = disclosureItems
    .filter(item => item.category === 'S')
    .reduce((sum, item) => sum + item.standardValue, 0) / 
    disclosureItems.filter(item => item.category === 'S').length;
  
  const gBenchmark = disclosureItems
    .filter(item => item.category === 'G')
    .reduce((sum, item) => sum + item.standardValue, 0) / 
    disclosureItems.filter(item => item.category === 'G').length;
  
  const overallBenchmark = (eBenchmark + sBenchmark + gBenchmark) / 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <RatingCard
        title="E Overall Rating"
        titleKo="환경 종합 등급"
        score={eScore}
        benchmark={eBenchmark}
        color="border-aifix-together/30"
      />
      <RatingCard
        title="S Overall Rating"
        titleKo="사회 종합 등급"
        score={sScore}
        benchmark={sBenchmark}
        color="border-aifix-secondary/30"
      />
      <RatingCard
        title="G Overall Rating"
        titleKo="지배구조 종합 등급"
        score={gScore}
        benchmark={gBenchmark}
        color="border-aifix-primary/30"
      />
      <RatingCard
        title="ESG Total Rating"
        titleKo="ESG 총점 등급"
        score={overallScore}
        benchmark={overallBenchmark}
        color="border-aifix-for-better/30"
      />
    </div>
  );
}

