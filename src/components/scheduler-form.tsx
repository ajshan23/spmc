
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Clock,
  User,
  Stethoscope,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formSchema, type ScheduleFormValues } from '@/lib/schedule';
import React, { useEffect, useState } from 'react';

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

const timeOptionsAmPm = Array.from({ length: 48 }, (_, i) => {
    const totalMinutes = i * 30;
    const date = new Date();
    date.setHours(Math.floor(totalMinutes / 60));
    date.setMinutes(totalMinutes % 60);
    return format(date, "h:mm a");
});


interface SchedulerFormProps {
  onSubmit: (data: ScheduleFormValues) => void;
  isScheduleGenerated: boolean;
  initialValues?: ScheduleFormValues;
}

export function SchedulerForm({
  onSubmit,
  isScheduleGenerated,
  initialValues,
}: SchedulerFormProps) {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      patientName: '',
      sachets: '2',
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  const onFormSubmit = (data: ScheduleFormValues) => {
    const [time, ampm] = data.procedureTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (ampm === 'PM' && hours !== 12) {
        hours += 12;
    }
    if (ampm === 'AM' && hours === 12) {
        hours = 0;
    }
    
    const time24 = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    onSubmit({
        ...data,
        procedureTime: time24
    });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Stethoscope className="text-primary" />
          Procedure Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="e.g., John Doe"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="procedureDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Procedure Date</FormLabel>
                    <Popover open={isDatePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal border-input',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDatePickerOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="procedureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure Time</FormLabel>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="pl-10 w-full border-input">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptionsAmPm.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sachets"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Number of Sachets</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      {[2, 3, 4].map((num) => (
                        <FormItem
                          key={num}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={String(num)} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {num} Sachets
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg">
              {isScheduleGenerated ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
