'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Flex,
} from '@chakra-ui/react';
import Calendar from 'react-calendar'; // Import react-calendar
import 'react-calendar/dist/Calendar.css'; // Calendar styling
import { format } from 'date-fns';

interface TimeSlot {
  id: number;
  time: string; // UTC time from database
  isBooked: boolean;
}

interface BookingFormData {
  name: string;
  email: string;
  timeSlotId: number;
}

const TimeSlotBookingForm: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]); // Track available dates with time slots
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // For calendar date selection
  const { handleSubmit, register, formState: { errors }, reset } = useForm<BookingFormData>();

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get the user's local timezone

  // Fetch all future available dates
// Fetch all future available dates
useEffect(() => {
    const fetchAvailableDates = async () => {
      const response = await fetch(`/api/time-slots?timezone=${encodeURIComponent(userTimeZone)}`);
      const data = await response.json();
      // Convert date strings (YYYY-MM-DD) to Date objects
      const dateObjects = data.map((dateString: string) => new Date(`${dateString}T00:00:00`));
      setAvailableDates(dateObjects); // Set available dates
    };
    fetchAvailableDates();
  }, [userTimeZone]);
  
  // Fetch available slots for the selected date
  useEffect(() => {
    const fetchAvailableSlotsForDate = async () => {
      if (!selectedDate) return; // Don't fetch if no date is selected
  
      const formattedDate = format(selectedDate, 'yyyy-MM-dd'); // Format date as 'YYYY-MM-DD'
      const response = await fetch(`/api/time-slots?date=${formattedDate}&timezone=${encodeURIComponent(userTimeZone)}`); // Send user's timezone
      const data = await response.json();
      setAvailableSlots(data); // Set available slots for the selected date
    };
  
    fetchAvailableSlotsForDate();
  }, [selectedDate, userTimeZone]);
  
  const onSubmit = async (data: BookingFormData) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      reset(); // Reset the form after successful submission
      alert('Successfully booked the time slot!');
    } else {
      alert('Failed to book the time slot.');
    }
  };

  // Convert UTC time to the user's local time with timezone abbreviation
  const convertToLocalTime = (utcTime: string) => {
    const localDate = new Date(utcTime); // Convert from UTC to local time
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short', // Show abbreviation (e.g., PST, EST)
    };
    return new Intl.DateTimeFormat(undefined, options).format(localDate);
  };

  // Disable days that don't have available time slots in local time
  const isTileDisabled = ({ date }: { date: Date }) => {
    // Check if the date is in availableDates
    const isAvailable = availableDates.some(
      availableDate => availableDate.getTime() === date.getTime()
    );
    return !isAvailable; // Disable the date if it's not available
  };

  return (
    <Flex justify="center" mt={8}>
      <Box maxW="600px" w="100%" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <Heading mb={6} size="lg" textAlign="center">Book a Time Slot</Heading>

        {/* Calendar for Date Selection */}
        <FormControl mb={4}>
          <FormLabel>Select a Date</FormLabel>
          <Calendar
            onChange={(value) => {
              if (Array.isArray(value)) {
                const start = value[0]; // If it's a range of dates, take the first
                if (start instanceof Date) {
                  setSelectedDate(start);
                }
              } else if (value instanceof Date) {
                setSelectedDate(value); // If it's a single Date, set it directly
              } else {
                setSelectedDate(null); // If the value is null or invalid, reset
              }
            }}
            tileDisabled={isTileDisabled} // Disable tiles that don't have available time slots
            value={selectedDate} // The current selected date
          />
        </FormControl>

        {/* Available time slots for the selected date */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter your name"
              />
              {errors.name && <Box color="red.500">{errors.name.message}</Box>}
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="Enter your email"
              />
              {errors.email && <Box color="red.500">{errors.email.message}</Box>}
            </FormControl>

            <FormControl isInvalid={!!errors.timeSlotId}>
              <FormLabel>Available Time Slots</FormLabel>
              <Select
                {...register('timeSlotId', { required: 'Time slot is required' })}
                placeholder={availableSlots.length > 0 ? "Select a time slot" : "No time slots available"}
              >
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id} disabled={slot.isBooked}>
                    {convertToLocalTime(slot.time)} {/* Convert UTC time to local time */}
                  </option>
                ))}
              </Select>
              {errors.timeSlotId && <Box color="red.500">{errors.timeSlotId.message}</Box>}
            </FormControl>

            <Button type="submit" colorScheme="teal" width="100%" isDisabled={!availableSlots.length}>
              Book Time Slot
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default TimeSlotBookingForm;
