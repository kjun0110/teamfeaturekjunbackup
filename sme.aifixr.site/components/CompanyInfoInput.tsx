'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface CompanyInfoInputProps {
  companyName: string;
  onCompanyNameChange: (name: string) => void;
}

export function CompanyInfoInput({ companyName, onCompanyNameChange }: CompanyInfoInputProps) {
  const [localCompanyName, setLocalCompanyName] = useState(companyName);

  const handleSave = () => {
    onCompanyNameChange(localCompanyName);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          회사 기본정보 입력
        </h2>
        <p className="text-foreground-muted">
          회사 기본정보를 입력해주세요
        </p>
      </div>

      {/* 입력 폼 */}
      <Card className="p-6 rounded-xl shadow-aifix-lg border border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name" className="text-sm font-medium text-foreground mb-2 block">
              회사명
            </Label>
            <Input
              id="company-name"
              placeholder="회사명을 입력하세요"
              value={localCompanyName}
              onChange={(e) => setLocalCompanyName(e.target.value)}
              className="border-border"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-aifix-gradient hover:bg-aifix-gradient-hover text-white shadow-aifix rounded-xl px-6"
            >
              저장
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

