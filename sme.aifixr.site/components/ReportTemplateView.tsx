'use client';

import { useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Save, FileText, Trash2, Plus } from 'lucide-react';
import { cn } from '@/components/ui/utils';

// 색상 옵션
const colorOptions = [
  { value: 'primary', label: 'Primary (보라)', color: '#5B3BFA' },
  { value: 'secondary', label: 'Secondary (하늘)', color: '#00B4FF' },
  { value: 'integrity', label: 'Integrity (파랑)', color: '#1A439C' },
  { value: 'courage', label: 'Courage (핑크)', color: '#E30074' },
  { value: 'together', label: 'Together (청록)', color: '#00A3B5' },
  { value: 'for-better', label: 'For Better (보라)', color: '#6B23C0' },
];

// 산업분류 옵션
const industryOptions = [
  { value: 'manufacturing', label: '제조업' },
  { value: 'finance', label: '금융업' },
  { value: 'it', label: 'IT/소프트웨어' },
  { value: 'retail', label: '유통/소매' },
  { value: 'energy', label: '에너지' },
  { value: 'construction', label: '건설업' },
  { value: 'healthcare', label: '의료/제약' },
  { value: 'education', label: '교육' },
  { value: 'other', label: '기타' },
];

// 저장된 작업 타입
interface SavedWork {
  id: string;
  title: string;
  color: string;
  industry: string;
  createdAt: string;
}

export function ReportTemplateView() {
  const [selectedColor, setSelectedColor] = useState<string>('primary');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('manufacturing');
  const [savedWorks, setSavedWorks] = useState<SavedWork[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);

  // 선택된 색상 정보 가져오기
  const selectedColorInfo = colorOptions.find(c => c.value === selectedColor) || colorOptions[0];

  // 템플릿 렌더링 (색상과 산업분류에 따라 변경)
  const renderTemplate = () => {
    return (
      <div className="space-y-6">
        <Card className="rounded-xl shadow-aifix-lg border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold" style={{ color: selectedColorInfo.color }}>
              ESG 보고서 템플릿
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${selectedColorInfo.color}15` }}>
                <h3 className="font-semibold mb-2" style={{ color: selectedColorInfo.color }}>
                  산업분류: {industryOptions.find(i => i.value === selectedIndustry)?.label}
                </h3>
                <p className="text-foreground-muted text-sm">
                  선택하신 색상과 산업분류에 맞는 템플릿이 생성됩니다.
                </p>
              </div>

              {/* 템플릿 미리보기 영역 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="p-4 border-2" style={{ borderColor: `${selectedColorInfo.color}40` }}>
                  <div className="space-y-2">
                    <div className="h-32 rounded-lg" style={{ backgroundColor: `${selectedColorInfo.color}20` }} />
                    <h4 className="font-semibold">섹션 1</h4>
                    <p className="text-sm text-foreground-muted">템플릿 내용이 여기에 표시됩니다.</p>
                  </div>
                </Card>
                <Card className="p-4 border-2" style={{ borderColor: `${selectedColorInfo.color}40` }}>
                  <div className="space-y-2">
                    <div className="h-32 rounded-lg" style={{ backgroundColor: `${selectedColorInfo.color}20` }} />
                    <h4 className="font-semibold">섹션 2</h4>
                    <p className="text-sm text-foreground-muted">템플릿 내용이 여기에 표시됩니다.</p>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 저장 처리
  const handleSave = () => {
    if (!saveTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    const newWork: SavedWork = {
      id: Date.now().toString(),
      title: saveTitle,
      color: selectedColor,
      industry: selectedIndustry,
      createdAt: new Date().toLocaleString('ko-KR'),
    };

    setSavedWorks([...savedWorks, newWork]);
    setSaveTitle('');
    setIsSaveDialogOpen(false);
  };

  // 저장된 작업 삭제
  const handleDeleteWork = (id: string) => {
    setSavedWorks(savedWorks.filter(work => work.id !== id));
    if (selectedWorkId === id) {
      setSelectedWorkId(null);
    }
  };

  // 저장된 작업 선택
  const handleSelectWork = (work: SavedWork) => {
    setSelectedWorkId(work.id);
    setSelectedColor(work.color);
    setSelectedIndustry(work.industry);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* 사이드바 - 작업내용 저장 */}
        <Sidebar className="border-r border-border" collapsible="offcanvas">
          <SidebarContent className="pt-[140px]">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-semibold text-foreground mb-3">저장된 작업</h3>
                      <div className="space-y-2">
                        {savedWorks.length === 0 ? (
                          <p className="text-sm text-foreground-muted px-2">
                            저장된 작업이 없습니다.
                          </p>
                        ) : (
                          savedWorks.map((work) => {
                            const colorInfo = colorOptions.find(c => c.value === work.color) || colorOptions[0];
                            const industryInfo = industryOptions.find(i => i.value === work.industry) || industryOptions[0];
                            const isSelected = selectedWorkId === work.id;

                            return (
                              <div
                                key={work.id}
                                className={cn(
                                  "p-3 rounded-lg border cursor-pointer transition-all",
                                  isSelected
                                    ? "border-aifix-primary bg-aifix-primary/10"
                                    : "border-border hover:border-aifix-primary/50 hover:bg-aifix-secondary-light/20"
                                )}
                                onClick={() => handleSelectWork(work)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: colorInfo.color }}
                                      />
                                      <p className="text-sm font-medium truncate">{work.title}</p>
                                    </div>
                                    <p className="text-xs text-foreground-muted">{industryInfo.label}</p>
                                    <p className="text-xs text-foreground-muted mt-1">{work.createdAt}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteWork(work.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-foreground-muted" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              {/* 저장 버튼 */}
              <Button
                onClick={() => setIsSaveDialogOpen(true)}
                className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix rounded-xl px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* 상단 콤보박스 영역 */}
                <div className="mb-6">
                  <Card className="p-6 rounded-xl shadow-aifix-lg border border-border">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* 색상 선택 */}
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          색상 선택
                        </label>
                        <Select value={selectedColor} onValueChange={setSelectedColor}>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: selectedColorInfo.color }}
                                />
                                {selectedColorInfo.label}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {colorOptions.map((color) => (
                              <SelectItem
                                key={color.value}
                                value={color.value}
                                className="hover:bg-aifix-secondary-light"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color.color }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 산업분류 선택 */}
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          산업분류
                        </label>
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {industryOptions.map((industry) => (
                              <SelectItem
                                key={industry.value}
                                value={industry.value}
                                className="hover:bg-aifix-secondary-light"
                              >
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 템플릿 영역 */}
                {renderTemplate()}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>

      {/* 저장 다이얼로그 */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>작업 저장</DialogTitle>
            <DialogDescription>
              현재 설정을 저장할 제목을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="제목을 입력하세요"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setSaveTitle('');
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
