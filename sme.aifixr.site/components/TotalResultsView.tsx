'use client';

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { CalendarIcon, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import type { CompanyESGData } from './types/navigation';
import { MonthYearPicker } from './MonthYearPicker';
import { cn } from './ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TotalResultsViewProps {
  companyData: CompanyESGData[];
  companyName: string;
  standard?: 'K-ESG' | 'ESRS';
  onStandardChange?: (standard: 'K-ESG' | 'ESRS') => void;
}

const getGradeBadgeColor = (grade: string): string => {
  if (grade.startsWith('A+')) return 'bg-aifix-primary/10 text-aifix-primary border-aifix-primary/20';
  if (grade.startsWith('A')) return 'bg-aifix-primary/10 text-aifix-primary border-aifix-primary/20';
  if (grade.startsWith('B+')) return 'bg-aifix-secondary/10 text-aifix-secondary border-aifix-secondary/20';
  if (grade.startsWith('B')) return 'bg-aifix-secondary/10 text-aifix-secondary border-aifix-secondary/20';
  if (grade.startsWith('C+')) return 'bg-aifix-together/10 text-aifix-together border-aifix-together/20';
  if (grade.startsWith('C')) return 'bg-aifix-together/10 text-aifix-together border-aifix-together/20';
  if (grade.startsWith('D+')) return 'bg-aifix-courage/10 text-aifix-courage border-aifix-courage/20';
  if (grade.startsWith('D')) return 'bg-aifix-courage/10 text-aifix-courage border-aifix-courage/20';
  return 'bg-aifix-courage/10 text-aifix-courage border-aifix-courage/20';
};

const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-aifix-primary';
  if (score >= 75) return 'text-aifix-secondary';
  if (score >= 65) return 'text-aifix-together';
  if (score >= 55) return 'text-aifix-courage';
  return 'text-aifix-courage';
};

export function TotalResultsView({ companyData, companyName, standard: propStandard, onStandardChange }: TotalResultsViewProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 24); // 24개월 전 (더 많은 데이터 포함)
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [internalStandard, setInternalStandard] = useState<'K-ESG' | 'ESRS'>('K-ESG');
  const itemsPerPage = 15;

  // propStandard가 있으면 사용하고, 없으면 내부 상태 사용
  const standard = propStandard ?? internalStandard;
  const setStandard = onStandardChange ?? setInternalStandard;

  // 실제 적용된 필터 상태 (검색 버튼을 눌렀을 때 업데이트)
  // 초기값을 넓게 설정하여 모든 데이터를 포함하도록 함
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 24); // 24개월 전부터 (더 많은 데이터 포함)
    return date;
  });
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(new Date());
  const [appliedSortOrder, setAppliedSortOrder] = useState<'desc' | 'asc'>('desc');

  // 기간 필터링 및 정렬 (적용된 필터 사용)
  const sortedData = useMemo(() => {
    let filtered = [...companyData];

    // 기간 필터링
    if (appliedStartDate && appliedEndDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.period + '-01');
        const start = new Date(appliedStartDate.getFullYear(), appliedStartDate.getMonth(), 1);
        const end = new Date(appliedEndDate.getFullYear(), appliedEndDate.getMonth() + 1, 0);
        return itemDate >= start && itemDate <= end;
      });
    }

    // 정렬
    return filtered.sort((a, b) => {
      if (appliedSortOrder === 'desc') {
        return b.period.localeCompare(a.period); // 내림차순 (최신순)
      } else {
        return a.period.localeCompare(b.period); // 오름차순 (과거순)
      }
    });
  }, [companyData, appliedStartDate, appliedEndDate, appliedSortOrder]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const filteredData = useMemo(() => {
    return paginatedData;
  }, [paginatedData]);

  const handleSearch = () => {
    // 검색 버튼을 눌렀을 때 필터 상태 적용
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedSortOrder(sortOrder);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    setIsStartCalendarOpen(false);
    setIsEndCalendarOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            ESG 종합 등급
          </h2>
          <p className="text-foreground-muted">
            기업별 ESG 종합 등급을 확인할 수 있습니다
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-aifix-secondary-light rounded-lg px-4 py-2.5 shadow-sm">
            <Label
              htmlFor="standard-toggle"
              className="text-sm font-medium text-aifix-secondary cursor-pointer"
            >
              {standard === 'ESRS' ? 'ESRS' : 'K-ESG'}
            </Label>
            <Switch
              id="standard-toggle"
              checked={standard === 'ESRS'}
              onCheckedChange={(checked) => {
                setStandard(checked ? 'ESRS' : 'K-ESG');
              }}
              className="data-[state=checked]:bg-aifix-primary data-[state=unchecked]:bg-gray-300"
            />
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-6 rounded-xl shadow-aifix-lg border border-border">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                시작일
              </label>
              <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-border force-white-bg"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'yyyy년 MM월')
                    ) : (
                      <span>시작일 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 !bg-white" align="start" style={{ backgroundColor: '#FFFFFF' }}>
                  <MonthYearPicker
                    value={startDate}
                    onChange={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                종료일
              </label>
              <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-border force-white-bg"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, 'yyyy년 MM월')
                    ) : (
                      <span>종료일 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 !bg-white" align="start" style={{ backgroundColor: '#FFFFFF' }}>
                  <MonthYearPicker
                    value={endDate}
                    onChange={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                정렬
              </label>
              <Select
                value={sortOrder}
                onValueChange={(value: 'desc' | 'asc') => {
                  setSortOrder(value);
                }}
              >
                <SelectTrigger
                  className="w-full border-border force-white-bg"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <SelectValue placeholder="정렬 선택" />
                </SelectTrigger>
                <SelectContent
                  className="border-border force-white-bg"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <SelectItem value="desc" className="hover:bg-aifix-secondary-light/50">최신순 (내림차순)</SelectItem>
                  <SelectItem value="asc" className="hover:bg-aifix-secondary-light/50">과거순 (오름차순)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix rounded-xl px-6"
          >
            검색
          </Button>
        </div>
      </Card>

      {/* 전체 개수 표시 */}
      <div className="text-sm text-foreground-muted">
        전체 {sortedData.length} 사
      </div>

      {/* 테이블 */}
      <Card className="rounded-xl shadow-aifix-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-aifix-secondary-light/30">
              <TableHead rowSpan={2} className="font-semibold text-foreground text-center">회사명</TableHead>
              <TableHead rowSpan={2} className="font-semibold text-foreground text-center">기간</TableHead>
              <TableHead colSpan={4} className="font-semibold text-foreground text-center">{standard}</TableHead>
            </TableRow>
            <TableRow className="bg-aifix-secondary-light/30">
              <TableHead className="font-semibold text-foreground text-center">종합점수</TableHead>
              <TableHead className="font-semibold text-foreground text-center">Environment</TableHead>
              <TableHead className="font-semibold text-foreground text-center">Social</TableHead>
              <TableHead className="font-semibold text-foreground text-center">Governance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((data) => {
              // 표준에 따라 점수 선택
              const overallScore = standard === 'ESRS' ? (data.esrsOverallScore ?? data.overallScore) : data.overallScore;
              const eScore = standard === 'ESRS' ? (data.esrsEScore ?? data.eScore) : data.eScore;
              const sScore = standard === 'ESRS' ? (data.esrsSScore ?? data.sScore) : data.sScore;
              const gScore = standard === 'ESRS' ? (data.esrsGScore ?? data.gScore) : data.gScore;
              const overallGrade = standard === 'ESRS' ? (data.esrsOverallGrade ?? data.overallGrade) : data.overallGrade;
              const eGrade = standard === 'ESRS' ? (data.esrsEGrade ?? data.eGrade) : data.eGrade;
              const sGrade = standard === 'ESRS' ? (data.esrsSGrade ?? data.sGrade) : data.sGrade;
              const gGrade = standard === 'ESRS' ? (data.esrsGGrade ?? data.gGrade) : data.gGrade;

              return (
                <TableRow key={data.id} className="hover:bg-aifix-secondary-light/10">
                  <TableCell className="font-medium text-center">{data.companyName}</TableCell>
                  <TableCell className="text-foreground-muted text-center">{data.period}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className={getGradeBadgeColor(overallGrade)}>
                        {overallGrade}
                      </Badge>
                      <span className={`text-sm font-semibold ${getScoreColor(overallScore)}`}>
                        {overallScore.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className={getGradeBadgeColor(eGrade)}>
                        {eGrade}
                      </Badge>
                      <span className={`text-sm font-semibold ${getScoreColor(eScore)}`}>
                        {eScore.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className={getGradeBadgeColor(sGrade)}>
                        {sGrade}
                      </Badge>
                      <span className={`text-sm font-semibold ${getScoreColor(sScore)}`}>
                        {sScore.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className={getGradeBadgeColor(gGrade)}>
                        {gGrade}
                      </Badge>
                      <span className={`text-sm font-semibold ${getScoreColor(gScore)}`}>
                        {gScore.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {filteredData.length === 0 && (
        <Card className="p-12 text-center rounded-xl shadow-aifix-lg border border-border">
          <p className="text-foreground-muted">
            {companyName ? '데이터가 없습니다.' : '회사명을 먼저 입력해주세요.'}
          </p>
        </Card>
      )}

      {/* 페이지네이션 */}
      {sortedData.length > itemsPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
