import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import moment from "moment-jalaali";

// تنظیم moment-jalaali برای استفاده از اعداد فارسی و شروع هفته از شنبه
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });
moment.updateLocale('fa', { week: { dow: 6 } }); // شروع هفته از شنبه

interface PersianDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

const persianMonths = [
  'فروردین',
  'اردیبهشت', 
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

const persianWeekDays = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

const persianWeekDaysShort = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  className = "",
  "data-testid": dataTestId
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(() => {
    const today = moment().locale('fa');
    return today;
  });
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(() => {
    if (value && value.length > 0) {
      // تبدیل تاریخ میلادی به شمسی
      const parsedDate = moment(value);
      if (parsedDate.isValid()) {
        // تنظیم locale به فارسی
        parsedDate.locale('fa');
        return parsedDate;
      }
    }
    return null;
  });

  useEffect(() => {
    if (value && value.length > 0) {
      const parsedDate = moment(value);
      if (parsedDate.isValid()) {
        // تنظیم locale به فارسی
        parsedDate.locale('fa');
        setSelectedDate(parsedDate);
        setDisplayDate(parsedDate);
      } else {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date);
    // تبدیل صحیح تاریخ شمسی به میلادی
    const gregorianDate = moment(date).locale('en').format('YYYY-MM-DD');
    onChange?.(gregorianDate);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setDisplayDate(prev => {
      const newDate = moment(prev).subtract(1, 'jMonth');
      newDate.locale('fa');
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setDisplayDate(prev => {
      const newDate = moment(prev).add(1, 'jMonth');
      newDate.locale('fa');
      return newDate;
    });
  };

  const goToPreviousYear = () => {
    setDisplayDate(prev => {
      const newDate = moment(prev).subtract(1, 'jYear');
      newDate.locale('fa');
      return newDate;
    });
  };

  const goToNextYear = () => {
    setDisplayDate(prev => {
      const newDate = moment(prev).add(1, 'jYear');
      newDate.locale('fa');
      return newDate;
    });
  };

  const goToToday = () => {
    const today = moment();
    today.locale('fa');
    setDisplayDate(today);
    handleDateSelect(today);
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange?.('');
    setIsOpen(false);
  };

  const renderCalendar = () => {
    // شروع و پایان ماه فارسی
    const startOfMonth = moment(displayDate).jDate(1); // اول ماه
    const endOfMonth = moment(displayDate).jDate(moment.jDaysInMonth(displayDate.jYear(), displayDate.jMonth())); // آخر ماه
    
    // محاسبه شروع تقویم از شنبه
    const startOfCalendar = moment(startOfMonth);
    const daysToSubtract = (startOfMonth.day() - 6 + 7) % 7;
    startOfCalendar.subtract(daysToSubtract, 'days');
    
    const endOfCalendar = moment(endOfMonth);
    const daysToAdd = (5 - endOfMonth.day() + 7) % 7;
    endOfCalendar.add(daysToAdd, 'days');

    const days = [];
    let currentDate = moment(startOfCalendar);

    while (currentDate.isSameOrBefore(endOfCalendar)) {
      const dayOfWeek = currentDate.day();
      const isCurrentMonth = currentDate.jYear() === displayDate.jYear() && currentDate.jMonth() === displayDate.jMonth();
      const isToday = currentDate.isSame(moment(), 'day');
      const isSelected = selectedDate && currentDate.isSame(selectedDate, 'day');
      
      // کپی کردن تاریخ برای جلوگیری از مشکل closure
      const dateToSelect = moment(currentDate);

      days.push(
        <button
          key={currentDate.format('YYYY-MM-DD')}
          type="button"
          onClick={() => handleDateSelect(dateToSelect)}
          data-testid={`day-${currentDate.format('YYYY-MM-DD')}`}
          className={`
            w-8 h-8 text-sm rounded-md transition-colors duration-200
            ${isCurrentMonth 
              ? 'text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900' 
              : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            ${isToday 
              ? 'bg-blue-100 dark:bg-blue-900 font-bold border border-blue-300 dark:border-blue-700' 
              : ''
            }
            ${isSelected 
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700' 
              : ''
            }
          `}
        >
          {currentDate.format('jD')}
        </button>
      );

      currentDate.add(1, 'day');
    }

    return days;
  };

  const formatDisplayValue = () => {
    if (!selectedDate || !selectedDate.isValid()) return '';
    try {
      selectedDate.locale('fa');
      return selectedDate.format('jYYYY/jMM/jDD');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative" dir="rtl">
          <Input
            value={formatDisplayValue()}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            className={`cursor-pointer pr-10 text-right ${className}`}
            data-testid={dataTestId}
            dir="rtl"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" dir="rtl">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousYear}
                className="h-8 w-8 p-0"
                data-testid="nav-year-prev"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
                data-testid="nav-month-prev"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-lg">
                {displayDate.isValid() && displayDate.jMonth() >= 0 && displayDate.jMonth() < 12 
                  ? `${persianMonths[displayDate.jMonth()]} ${displayDate.format('jYYYY')}` 
                  : 'تاریخ نامعلوم'}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
                data-testid="nav-month-next"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextYear}
                className="h-8 w-8 p-0"
                data-testid="nav-year-next"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {persianWeekDaysShort.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearDate}
              className="text-xs"
              data-testid="button-clear"
            >
              پاک کردن
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
              data-testid="button-today"
            >
              امروز
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}