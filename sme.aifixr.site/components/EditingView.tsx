'use client';

import { useState, useRef, useEffect } from 'react';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Upload,
  FileText,
  Trash2,
  Save,
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/components/ui/utils';

// 저장된 작업 타입
interface SavedWork {
  id: string;
  title: string;
  beforeText: string;
  afterText: string;
  createdAt: string;
}

export function EditingView() {
  const [beforeText, setBeforeText] = useState<string>('');
  const [afterText, setAfterText] = useState<string>('');
  const [savedWorks, setSavedWorks] = useState<SavedWork[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const beforeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBeforeText(text);
      setAfterText(''); // 새 파일 업로드 시 After 초기화
    };
    reader.readAsText(file);
  };

  // 텍스트 선택 처리
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
      } else {
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);

  // 전체 윤문 처리
  const handleFullEdit = async () => {
    if (!beforeText.trim()) {
      alert('먼저 파일을 업로드해주세요.');
      return;
    }

    // TODO: 실제 윤문 API 호출
    // 현재는 샘플로 텍스트를 약간 수정한 버전으로 표시
    const editedText = await simulateEditing(beforeText);
    setAfterText(editedText);
  };

  // 선택 영역 윤문 처리
  const handleSelectedEdit = async () => {
    if (!selectedText.trim()) {
      alert('윤문할 텍스트를 선택해주세요.');
      return;
    }

    // TODO: 실제 윤문 API 호출
    const editedText = await simulateEditing(selectedText);

    // 선택된 텍스트를 After에 추가 또는 교체
    if (afterText) {
      setAfterText(afterText + '\n\n' + editedText);
    } else {
      setAfterText(editedText);
    }
  };

  // 윤문 시뮬레이션 (실제 API로 교체 필요)
  const simulateEditing = async (text: string): Promise<string> => {
    // 실제로는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        // 간단한 시뮬레이션: 텍스트를 그대로 반환 (실제 API에서는 윤문된 텍스트 반환)
        resolve(`[윤문된 텍스트]\n${text}`);
      }, 500);
    });
  };

  // PDF 저장 처리
  const handleSavePDF = () => {
    if (!afterText.trim()) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    // TODO: PDF 생성 및 다운로드
    const blob = new Blob([afterText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '윤문_결과.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('PDF 저장 기능은 추후 구현 예정입니다. 현재는 텍스트 파일로 다운로드됩니다.');
  };

  // 작업 저장 처리
  const handleSave = () => {
    if (!saveTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!beforeText.trim() && !afterText.trim()) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    const newWork: SavedWork = {
      id: Date.now().toString(),
      title: saveTitle,
      beforeText,
      afterText,
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

  // 저장된 작업 불러오기
  const handleLoadWork = (work: SavedWork) => {
    setSelectedWorkId(work.id);
    setBeforeText(work.beforeText);
    setAfterText(work.afterText);
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
                                onClick={() => handleLoadWork(work)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{work.title}</p>
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
              {/* 우측 상단 버튼들 */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  불러오기
                </Button>
                <Button
                  onClick={handleFullEdit}
                  disabled={!beforeText.trim()}
                  className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix rounded-xl"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  전체 윤문
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-6 py-8 max-w-[1600px]">
                {/* Before/After 영역 */}
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                  {/* Before 영역 */}
                  <Card className="rounded-xl shadow-aifix-lg border border-border flex flex-col">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="text-xl font-bold text-foreground">
                        Before
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                      <Textarea
                        ref={beforeTextareaRef}
                        value={beforeText}
                        onChange={(e) => setBeforeText(e.target.value)}
                        placeholder="파일을 업로드하거나 텍스트를 입력하세요..."
                        className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 min-h-[500px]"
                        readOnly={false}
                      />
                    </CardContent>
                  </Card>

                  {/* 중간 윤문 버튼 */}
                  <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <Button
                      onClick={handleSelectedEdit}
                      disabled={!selectedText.trim()}
                      className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix-lg rounded-xl px-6 py-3 flex items-center gap-2"
                      title={selectedText ? `선택된 텍스트 윤문: "${selectedText.substring(0, 20)}..."` : '텍스트를 선택하고 클릭하세요'}
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="font-semibold">윤문</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* After 영역 */}
                  <Card className="rounded-xl shadow-aifix-lg border border-border flex flex-col">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="text-xl font-bold text-foreground">
                        After
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                      <Textarea
                        value={afterText}
                        onChange={(e) => setAfterText(e.target.value)}
                        placeholder="윤문된 결과가 여기에 표시됩니다..."
                        className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 min-h-[500px]"
                        readOnly={false}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* 하단 버튼 영역 (모바일용 윤문 버튼 포함) */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2 lg:hidden">
                    <Button
                      onClick={handleSelectedEdit}
                      disabled={!selectedText.trim()}
                      className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix rounded-xl"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      <span className="font-semibold">윤문</span>
                    </Button>
                    {selectedText && (
                      <span className="text-sm text-foreground-muted">
                        선택: {selectedText.substring(0, 30)}...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      onClick={() => setIsSaveDialogOpen(true)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                    <Button
                      onClick={handleSavePDF}
                      disabled={!afterText.trim()}
                      className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix rounded-xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF 저장
                    </Button>
                  </div>
                </div>
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
              현재 작업을 저장할 제목을 입력해주세요.
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
