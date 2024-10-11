import { toZonedTime } from 'date-fns-tz';

export function convertToUTC(dateTimeStr: string, timezone: string): Date {
    // Example input format: "10/8/2024 - 01:03 PM PDT"
    // Forgets about the timezone abbreviation
    try {
        console.log('dateTimeStr:', dateTimeStr);
        console.log('timezone:', timezone);
        const [date, time] = dateTimeStr.split(' - ');
        const [timeValue, meridiem, timeAbbreviation] = time.split(' ');
      
        if (!date || !timeValue || !meridiem || !timeAbbreviation) {
          throw new Error('Invalid date/time format');
        }
        // Check if the meridiem is AM or PM
        const isPM = meridiem === 'PM';
      
        // if the meridiem is pm then add 12 hours to the time value
        const [hours, minutes] = timeValue.split(':').map(Number);
      
        let hours24 = hours;
        if (isPM && hours !== 12) {
          hours24 = hours + 12;
        } else if (!isPM && hours === 12) {
          hours24 = 0;
        }
      
        // Put the date and time together in the format "YYYY-MM-DDTHH:MM:SS"
        const [month, day, year] = date.split('/');
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const formattedTime = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        const dateTime = `${formattedDate}T${formattedTime}`;
        console.log('dateTime:', dateTime);
        // use date-fns-tz to convert the date/time to UTC
        const zonedDate = toZonedTime(dateTime, timezone);
        return zonedDate;
    } catch (error) {
        console.error('Error converting to UTC:', error);
        throw new Error('Error converting to UTC');
    }
    
  }