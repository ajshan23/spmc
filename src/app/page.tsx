
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Schedule, ScheduleFormValues } from '@/lib/schedule';
import { calculateSchedule, formSchema } from '@/lib/schedule';
import { SchedulerForm } from '@/components/scheduler-form';
import { ScheduleDisplay } from '@/components/schedule-display';
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns';

function SchedulerContent() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleFormSubmit = useCallback((data: ScheduleFormValues) => {
    const newSchedule = calculateSchedule(data);
    setSchedule(newSchedule);

    const dataToEncode = {
      patientName: data.patientName,
      procedureDate: data.procedureDate.toISOString(),
      procedureTime: data.procedureTime,
      sachets: data.sachets,
    };
    try {
      const encodedData = btoa(JSON.stringify(dataToEncode));
      router.push(`/?data=${encodedData}`, { scroll: false });
    } catch (error) {
      console.error("Failed to encode data: ", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a shareable link.",
      });
    }

  }, [router, toast]);

  const handleReset = useCallback(() => {
    setSchedule(null);
    router.push('/', { scroll: false });
  }, [router]);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData));
        const formData = {
          ...decodedData,
          procedureDate: new Date(decodedData.procedureDate),
        };
        const validatedData = formSchema.parse(formData);
        const newSchedule = calculateSchedule(validatedData);
        setSchedule(newSchedule);
      } catch (e) {
        console.error("Failed to parse schedule data from URL", e);
        handleReset();
        toast({
            variant: "destructive",
            title: "Invalid Link",
            description: "The shared schedule link is invalid. Please create a new one.",
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, handleReset, toast]);

  const getInitialFormValues = () => {
    if (!schedule) return undefined;

    const procedureTimeAmPm = format(schedule.procedureDateTime, "h:mm a");

    return {
        patientName: schedule.patientName,
        procedureDate: schedule.procedureDateTime,
        procedureTime: procedureTimeAmPm,
        sachets: schedule.doses.length.toString() as "2" | "3" | "4",
    };
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          SPMC
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          SPMC Dosing Tracker
        </p>
      </header>
      <main className="w-full max-w-2xl">
          <SchedulerForm
            onSubmit={handleFormSubmit}
            isScheduleGenerated={!!schedule}
            initialValues={getInitialFormValues()}
            />
          {schedule && <ScheduleDisplay schedule={schedule} onReset={handleReset} />}
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>This tool is for informational purposes only. Always follow the specific instructions provided by your doctor.</p>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense>
      <SchedulerContent />
    </Suspense>
  )
}
