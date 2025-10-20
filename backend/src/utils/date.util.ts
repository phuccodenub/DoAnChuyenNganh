// Date utility functions
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeDifference {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
}

export const dateUtils = {
  // Get current date
  now(): Date {
    return new Date();
  },

  // Get current timestamp
  timestamp(): number {
    return Date.now();
  },

  // Parse date string
  parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    return date;
  },

  // Format date to string
  formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // Add time to date
  addTime(date: Date, amount: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds'): Date {
    const result = new Date(date);

    switch (unit) {
      case 'years':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'months':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'days':
        result.setDate(result.getDate() + amount);
        break;
      case 'hours':
        result.setHours(result.getHours() + amount);
        break;
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount);
        break;
    }

    return result;
  },

  // Subtract time from date
  subtractTime(date: Date, amount: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds'): Date {
    return this.addTime(date, -amount, unit);
  },

  // Get difference between two dates
  getDifference(startDate: Date, endDate: Date): TimeDifference {
    const diffMs = endDate.getTime() - startDate.getTime();
    
    const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    const days = Math.floor((diffMs % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diffMs % (60 * 1000)) / 1000);

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalMilliseconds: diffMs
    };
  },

  // Check if date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  },

  // Check if date is yesterday
  isYesterday(date: Date): boolean {
    const yesterday = this.subtractTime(new Date(), 1, 'days');
    return this.isSameDay(date, yesterday);
  },

  // Check if date is tomorrow
  isTomorrow(date: Date): boolean {
    const tomorrow = this.addTime(new Date(), 1, 'days');
    return this.isSameDay(date, tomorrow);
  },

  // Check if two dates are the same day
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },

  // Check if date is in the past
  isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  },

  // Check if date is in the future
  isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  },

  // Get start of day
  startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of day
  endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of week
  startOfWeek(date: Date, weekStartsOn: number = 0): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day - weekStartsOn;
    result.setDate(result.getDate() - diff);
    return this.startOfDay(result);
  },

  // Get end of week
  endOfWeek(date: Date, weekStartsOn: number = 0): Date {
    const result = this.startOfWeek(date, weekStartsOn);
    result.setDate(result.getDate() + 6);
    return this.endOfDay(result);
  },

  // Get start of month
  startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.startOfDay(result);
  },

  // Get end of month
  endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    return this.endOfDay(result);
  },

  // Get start of year
  startOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(0, 1);
    return this.startOfDay(result);
  },

  // Get end of year
  endOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(11, 31);
    return this.endOfDay(result);
  },

  // Get age from birth date
  getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  // Get relative time string
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    }
  },

  // Create date range
  createDateRange(start: Date, end: Date): DateRange {
    if (start.getTime() > end.getTime()) {
      throw new Error('Start date must be before end date');
    }
    
    return { start, end };
  },

  // Check if date is within range
  isWithinRange(date: Date, range: DateRange): boolean {
    return date.getTime() >= range.start.getTime() && date.getTime() <= range.end.getTime();
  },

  // Get dates between two dates
  getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  },

  // Convert to ISO string
  toISOString(date: Date): string {
    return date.toISOString();
  },

  // Convert from ISO string
  fromISOString(isoString: string): Date {
    return new Date(isoString);
  },

  // Get timezone offset
  getTimezoneOffset(date: Date): number {
    return date.getTimezoneOffset();
  },

  // Convert to UTC
  toUTC(date: Date): Date {
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  },

  // Convert from UTC
  fromUTC(date: Date): Date {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  },

  // Validate date
  isValidDate(date: any): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
  },

  // Compare dates
  compareDates(date1: Date, date2: Date): number {
    return date1.getTime() - date2.getTime();
  },

  // Sort dates
  sortDates(dates: Date[], ascending: boolean = true): Date[] {
    return [...dates].sort((a, b) => {
      const comparison = this.compareDates(a, b);
      return ascending ? comparison : -comparison;
    });
  }
};

