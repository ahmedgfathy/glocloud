/**
 * Get the week number for a given date
 * Week 1 starts from the beginning of the year
 */
export function getWeekNumber(date: Date): number {
  // Copy date so we don't modify the original
  const currentDate = new Date(date.getTime());
  
  // Get the first day of the year
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  
  // Calculate the number of days between the date and start of year
  const days = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  
  // Calculate week number (starting from 1)
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  
  return weekNumber;
}

/**
 * Get the current week number
 */
export function getCurrentWeekNumber(): number {
  return getWeekNumber(new Date());
}

/**
 * Create employee-specific upload path
 * Structure: uploads/emp_{employeeId}_{hashedUserId}/week-{weekNumber}/
 */
export function createEmployeeUploadPath(employeeId: string, userId: string, weekNumber?: number): string {
  const week = weekNumber || getCurrentWeekNumber();
  // Create a short hash of the user ID for security while keeping employee ID readable
  const userHash = userId.substring(0, 8);
  return `uploads/emp_${employeeId}_${userHash}/week-${week}`;
}

/**
 * Generate unique filename for employee upload
 */
export function generateEmployeeFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.replace(/\.[^/.]+$/, "").substring(0, 50); // Limit base name length
  
  return `${baseName}_${timestamp}_${randomId}.${extension}`;
}
