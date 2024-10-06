'use client';

import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  IconButton,
  VStack,
  Flex,
  Tooltip,
  Select,
  Heading,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Define your Zod schema
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().nonempty('Date is required'),
  timezone: z.string().nonempty('Timezone is required'),
  timeSlots: z.array(z.object({
    time: z.string().nonempty('Time slot is required')
  })).min(1, 'At least one time slot is required'),
});

// Define form data structure
interface TimeSlot {
  time: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  timezone: string;
  timeSlots: TimeSlot[];
}

const CreateEventForm: React.FC = () => {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ time: '' }]);
  const { handleSubmit, register, control, formState: { errors }, reset } = useForm<EventFormData>();

  const addTimeSlot = () => setTimeSlots([...timeSlots, { time: '' }]);

  const removeTimeSlot = (index: number) => {
    const newTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newTimeSlots);
  };

  const onSubmit = async (data: EventFormData) => {
    // Validate using Zod
    const result = eventSchema.safeParse(data);
    if (!result.success) {
      console.error(result.error.format());
      return; // You can handle errors as needed
    }

    const { date, timeSlots, timezone, ...rest } = data;

    // Convert the time slots to the selected timezone
    const formattedTimeSlots = timeSlots.map((slot) => {
      const fullDateTime = `${slot.time}`;
      return { time: fullDateTime };
    });

    // Handle the event creation API request
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...rest,
        date,
        timeSlots: formattedTimeSlots,
        timezone,
      }),
    });

    if (response.ok) {
      reset(); // Reset the form after successful submission
      router.refresh();
    } else {
      console.error("Failed to create the event.");
    }
  };

  return (
    <Flex justify="center" mt={8}>
      <Box maxW="800px" w="100%" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <Heading mb={6} size="lg" textAlign="center">Create New Event</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Event Title</FormLabel>
              <Input
                {...register('title')}
                placeholder="Enter event title"
              />
              {errors.title && <Box color="red.500">{errors.title.message}</Box>}
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                {...register('description')}
                placeholder="Enter event description"
              />
              {errors.description && <Box color="red.500">{errors.description.message}</Box>}
            </FormControl>

            <FormControl isInvalid={!!errors.date}>
              <FormLabel>Event Date</FormLabel>
              <Input
                type="date"
                {...register('date')}
              />
              {errors.date && <Box color="red.500">{errors.date.message}</Box>}
            </FormControl>

            <FormControl isInvalid={!!errors.timezone}>
              <FormLabel>Timezone</FormLabel>
              <Select {...register('timezone')}>
                <option value="ET">ET (Eastern Time)</option>
                <option value="CT">CT (Central Time)</option>
                <option value="MT">MT (Mountain Time)</option>
                <option value="PT">PT (Pacific Time)</option>
                <option value="AKT">AKT (Alaska Time)</option>
                <option value="HT">HT (Hawaii Time)</option>
              </Select>
              {errors.timezone && <Box color="red.500">{errors.timezone.message}</Box>}
            </FormControl>

            <Box w="100%">
              <FormLabel>Time Slots</FormLabel>
              {timeSlots.map((slot, index) => (
                <Flex key={index} mb={2} alignItems="center">
                <Controller
                  control={control}
                  name={`timeSlots.${index}.time`}
                  render={({ field }) => (
                    <Input
                      type="time"
                      {...field}
                      isInvalid={!!errors.timeSlots?.[index]?.time}
                    />
                  )}
                  rules={{ required: true }} // Validation rule for time slots
                />
                  <Tooltip label="Remove time slot">
                    <IconButton
                      ml={2}
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      aria-label="Delete Time Slot"
                      onClick={() => removeTimeSlot(index)}
                    />
                  </Tooltip>
                </Flex>
              ))}
              <Button onClick={addTimeSlot} colorScheme="blue" leftIcon={<AddIcon />}>
                Add Time Slot
              </Button>
            </Box>

            <Button type="submit" colorScheme="teal" width="100%">
              Create Event
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default CreateEventForm;
