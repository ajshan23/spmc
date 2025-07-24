import { z } from 'zod';
import {
  sub,
  set,
} from 'date-fns';

export const formSchema = z.object({
  patientName: z
    .string()
    .min(2, { message: 'Patient name must be at least 2 characters.' })
    .max(50, { message: 'Patient name must be 50 characters or less.' }),
  procedureDate: z.date({ required_error: 'Please select a procedure date.' }),
  procedureTime: z.string({ required_error: 'Please select a procedure time.' }),
  sachets: z.enum(['2', '3', '4'], {
    required_error: 'Please select the number of sachets.',
  }),
});

export type ScheduleFormValues = z.infer<typeof formSchema>;

export interface Schedule {
  patientName: string;
  procedureDateTime: Date;
  lastMealTime: Date;
  doses: Date[];
}

export function calculateSchedule(data: ScheduleFormValues): Schedule {
  const { procedureDate, procedureTime, sachets, patientName } = data;

  const [hours, minutes] = procedureTime.split(':').map(Number);
  const procedureDateTime = set(procedureDate, { hours, minutes });
  
  const numSachets = parseInt(sachets, 10);
  const doses: Date[] = [];
  
  // The last dose is always 5 hours before the procedure
  doses[numSachets - 1] = sub(procedureDateTime, { hours: 5 });

  // Subsequent doses are 3 hours before the previous one
  for (let i = numSachets - 2; i >= 0; i--) {
    doses[i] = sub(doses[i + 1], { hours: 3 });
  }

  // Last meal is 3 hours before the first dose
  const lastMealTime = sub(doses[0], { hours: 3 });

  return {
    patientName,
    procedureDateTime,
    lastMealTime,
    doses: doses.sort((a, b) => a.getTime() - b.getTime()),
  };
}
