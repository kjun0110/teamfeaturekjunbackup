'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface MonthYearPickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}

export function MonthYearPicker({ value, onChange }: MonthYearPickerProps) {
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const months = [
    { value: 1, label: '1월' },
    { value: 2, label: '2월' },
    { value: 3, label: '3월' },
    { value: 4, label: '4월' },
    { value: 5, label: '5월' },
    { value: 6, label: '6월' },
    { value: 7, label: '7월' },
    { value: 8, label: '8월' },
    { value: 9, label: '9월' },
    { value: 10, label: '10월' },
    { value: 11, label: '11월' },
    { value: 12, label: '12월' },
  ];

  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentYear, parseInt(month) - 1, 1);
    setCurrentDate(newDate);
    onChange(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonth - 1, 1);
    setCurrentDate(newDate);
    onChange(newDate);
  };

  const handlePrevYear = () => {
    const newDate = new Date(currentYear - 1, currentMonth - 1, 1);
    setCurrentDate(newDate);
    onChange(newDate);
  };

  const handleNextYear = () => {
    const newDate = new Date(currentYear + 1, currentMonth - 1, 1);
    setCurrentDate(newDate);
    onChange(newDate);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePrevYear}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">{currentYear}년</div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleNextYear}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <Button
            key={month.value}
            type="button"
            variant={currentMonth === month.value ? 'default' : 'outline'}
            className={
              currentMonth === month.value
                ? 'bg-aifix-primary text-white hover:bg-aifix-primary-hover'
                : ''
            }
            onClick={() => handleMonthChange(month.value.toString())}
          >
            {month.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

