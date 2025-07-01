import { 
  findFreeSlots, 
  distributeVariableSlots, 
  allocateTimeInDay, 
  generateWeeklySchedule 
} from '../scheduler';
import { ScheduleSlot, WeeklySchedule, DaySchedule } from '../types';

describe('Scheduler utility functions', () => {
  // Mock data for testing
  const mockFixedSlots: ScheduleSlot[] = [
    { id: 'fixed1', day: 'monday', startTime: 540, endTime: 600, name: 'Meeting', color: 'blue' },
    { id: 'fixed2', day: 'wednesday', startTime: 720, endTime: 780, name: 'Lunch', color: 'green' }
  ];

  const mockVariableSlots: ScheduleSlot[] = [
    { id: 'var1', duration: 60, name: 'Study', color: 'red', sessionsPerWeek: 3 },
    { id: 'var2', duration: 30, name: 'Exercise', color: 'yellow', sessionsPerWeek: 5 }
  ];

  const mockDayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mockDayRange = { startTime: 480, endTime: 1260 }; // 8:00 AM to 9:00 PM

  describe('findFreeSlots', () => {
    test('should find free slots in a day with fixed slots', () => {
      const fixedSlotsForDay = [
        { startTime: 540, endTime: 600 }, // 9:00 AM - 10:00 AM
        { startTime: 720, endTime: 780 }  // 12:00 PM - 1:00 PM
      ];

      const freeSlots = findFreeSlots(fixedSlotsForDay, mockDayRange);
      
      expect(freeSlots).toHaveLength(3);
      expect(freeSlots).toEqual([
        { startTime: 480, endTime: 540 },  // 8:00 AM - 9:00 AM
        { startTime: 600, endTime: 720 },  // 10:00 AM - 12:00 PM
        { startTime: 780, endTime: 1260 }  // 1:00 PM - 9:00 PM
      ]);
    });

    test('should return whole day as free when no fixed slots exist', () => {
      const freeSlots = findFreeSlots([], mockDayRange);
      
      expect(freeSlots).toHaveLength(1);
      expect(freeSlots).toEqual([
        { startTime: mockDayRange.startTime, endTime: mockDayRange.endTime }
      ]);
    });

    test('should handle fixed slots at the boundaries of day range', () => {
      const fixedSlotsForDay = [
        { startTime: 480, endTime: 540 }, // Start of day to 9:00 AM
        { startTime: 1200, endTime: 1260 } // 8:00 PM to 9:00 PM (end of day)
      ];

      const freeSlots = findFreeSlots(fixedSlotsForDay, mockDayRange);
      
      expect(freeSlots).toHaveLength(1);
      expect(freeSlots).toEqual([
        { startTime: 540, endTime: 1200 }
      ]);
    });
  });

  describe('distributeVariableSlots', () => {
    test('should distribute variable slots evenly across days', () => {
      const result = distributeVariableSlots(mockVariableSlots, mockDayNames);
      
      // Should have 3 sessions of var1 and 5 sessions of var2
      const totalSessions = result.reduce((sum, day) => sum + day.length, 0);
      expect(totalSessions).toBe(8); // 3 + 5
      
      // Check distribution of var1 (3 sessions)
      const var1Count = result.flat().filter(slot => slot.id === 'var1').length;
      expect(var1Count).toBe(3);
      
      // Check distribution of var2 (5 sessions)
      const var2Count = result.flat().filter(slot => slot.id === 'var2').length;
      expect(var2Count).toBe(5);
    });

    test('should handle empty variable slots array', () => {
      const result = distributeVariableSlots([], mockDayNames);
      
      expect(result.every(day => day.length === 0)).toBe(true);
      expect(result).toHaveLength(mockDayNames.length);
    });
  });

  describe('allocateTimeInDay', () => {
    test('should allocate variable slots within free time in a day', () => {
      const freeSlots = [
        { startTime: 480, endTime: 540 },  // 8:00 AM - 9:00 AM
        { startTime: 600, endTime: 720 },  // 10:00 AM - 12:00 PM
        { startTime: 780, endTime: 1260 }  // 1:00 PM - 9:00 PM
      ];
      
      const variableSlotsForDay = [
        { ...mockVariableSlots[0] }, // 60 min slot
        { ...mockVariableSlots[1] }  // 30 min slot
      ];
      
      const allocatedSlots = allocateTimeInDay(variableSlotsForDay, freeSlots);
      
      expect(allocatedSlots).toHaveLength(2);
      
      // Check that the allocated slots have start and end times
      allocatedSlots.forEach(slot => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot.endTime - slot.startTime).toBe(slot.duration);
        
        // Check that the allocated slot fits within one of the free slots
        const fitsInFreeSlot = freeSlots.some(
          free => slot.startTime >= free.startTime && slot.endTime <= free.endTime
        );
        expect(fitsInFreeSlot).toBe(true);
      });
    });

    test('should handle the case when not enough free time is available', () => {
      const freeSlots = [
        { startTime: 480, endTime: 510 } // Only 30 minutes free
      ];
      
      const variableSlotsForDay = [
        { ...mockVariableSlots[0] } // 60 min slot (won't fit)
      ];
      
      const allocatedSlots = allocateTimeInDay(variableSlotsForDay, freeSlots);
      
      // Should not allocate the slot since it doesn't fit
      expect(allocatedSlots).toHaveLength(0);
    });
  });

  describe('generateWeeklySchedule', () => {
    test('should generate a complete weekly schedule', () => {
      const config = {
        dayRange: mockDayRange,
        dayNames: mockDayNames,
        fixedSlots: mockFixedSlots,
        variableSlots: mockVariableSlots
      };
      
      const schedule = generateWeeklySchedule(config);
      
      // Check structure of the schedule
      expect(schedule).toHaveProperty('monday');
      expect(schedule).toHaveProperty('sunday');
      
      // Each day should contain fixed slots for that day
      expect(schedule.monday.some(slot => slot.id === 'fixed1')).toBe(true);
      expect(schedule.wednesday.some(slot => slot.id === 'fixed2')).toBe(true);
      
      // Variable slots should be distributed across the week
      const totalVariableSlots = Object.values(schedule)
        .flat()
        .filter(slot => slot.id === 'var1' || slot.id === 'var2')
        .length;
        
      expect(totalVariableSlots).toBe(8); // 3 for var1 and 5 for var2
      
      // Every slot should have start and end times
      Object.values(schedule).flat().forEach(slot => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot.endTime).toBeGreaterThan(slot.startTime);
      });
    });

    test('should handle schedule with no variable slots', () => {
      const config = {
        dayRange: mockDayRange,
        dayNames: mockDayNames,
        fixedSlots: mockFixedSlots,
        variableSlots: []
      };
      
      const schedule = generateWeeklySchedule(config);
      
      // Schedule should only contain fixed slots
      expect(schedule.monday).toHaveLength(1); // Only fixed1
      expect(schedule.wednesday).toHaveLength(1); // Only fixed2
      
      // All other days should be empty
      expect(schedule.tuesday).toHaveLength(0);
      expect(schedule.thursday).toHaveLength(0);
    });
    
    test('should handle schedule with no fixed slots', () => {
      const config = {
        dayRange: mockDayRange,
        dayNames: mockDayNames,
        fixedSlots: [],
        variableSlots: mockVariableSlots
      };
      
      const schedule = generateWeeklySchedule(config);
      
      // All variable slots should be distributed
      const totalVariableSlots = Object.values(schedule)
        .flat()
        .filter(slot => slot.id === 'var1' || slot.id === 'var2')
        .length;
        
      expect(totalVariableSlots).toBe(8); // 3 for var1 and 5 for var2
    });
  });
});
