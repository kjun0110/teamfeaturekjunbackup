'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import {
  FileText,
  FileEdit,
  BarChart3,
  Leaf,
  Users,
  Shield,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from './ui/utils';
import type { MainTab, ResultsSubTab, InputSubTab } from './types/navigation';

interface AppSidebarProps {
  mainTab: MainTab;
  resultsSubTab: ResultsSubTab;
  inputSubTab: InputSubTab;
  onMainTabChange: (tab: MainTab) => void;
  onResultsSubTabChange: (tab: ResultsSubTab) => void;
  onInputSubTabChange: (tab: InputSubTab) => void;
}

export function AppSidebar({
  mainTab,
  resultsSubTab,
  inputSubTab,
  onMainTabChange,
  onResultsSubTabChange,
  onInputSubTabChange,
}: AppSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['results', 'input'])
  );

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <Sidebar className="border-r border-border" collapsible="offcanvas">
      <SidebarContent className="pt-[140px]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 자가진단 결과보기 */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    toggleGroup('results');
                  }}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold">자가진단 결과보기</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedGroups.has('results') && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>
                {expandedGroups.has('results') && (
                  <div className="ml-6 mt-1 space-y-1">
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('results');
                        onResultsSubTabChange('total');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'results' && resultsSubTab === 'total' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Total
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('results');
                        onResultsSubTabChange('environment');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'results' && resultsSubTab === 'environment' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Leaf className="h-4 w-4 mr-2" />
                      Environment
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('results');
                        onResultsSubTabChange('social');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'results' && resultsSubTab === 'social' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Social
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('results');
                        onResultsSubTabChange('governance');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'results' && resultsSubTab === 'governance' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Governance
                    </SidebarMenuButton>
                  </div>
                )}
              </SidebarMenuItem>

              {/* ESG 데이터 입력 */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    toggleGroup('input');
                  }}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    <span className="font-semibold">ESG 데이터 입력</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedGroups.has('input') && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>
                {expandedGroups.has('input') && (
                  <div className="ml-6 mt-1 space-y-1">
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('input');
                        onInputSubTabChange('company-info');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'input' && inputSubTab === 'company-info' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      회사 기본정보 입력
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('input');
                        onInputSubTabChange('environment');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'input' && inputSubTab === 'environment' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Leaf className="h-4 w-4 mr-2" />
                      Environment
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('input');
                        onInputSubTabChange('social');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'input' && inputSubTab === 'social' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Social
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={() => {
                        onMainTabChange('input');
                        onInputSubTabChange('governance');
                      }}
                      className={cn(
                        "w-full justify-start",
                        mainTab === 'input' && inputSubTab === 'governance' && "bg-aifix-primary/20 text-aifix-primary font-medium"
                      )}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Governance
                    </SidebarMenuButton>
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
