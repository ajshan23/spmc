// src/components/schedule-display.tsx
'use client';

import { format } from 'date-fns';
import { Calendar, Clock, UtensilsCrossed, Droplets, Stethoscope, Share2, Mail, Copy, Download, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Schedule } from '@/lib/schedule';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { WhatsAppIcon } from './icons/whatsapp-icon';
import { Button } from './ui/button';
import { Separator } from '@radix-ui/react-select';

interface ScheduleDisplayProps {
  schedule: Schedule;
  onReset: () => void;
}

const timelineItems = (schedule: Schedule) => [
  {
    icon: UtensilsCrossed,
    title: 'Last Meal',
    time: schedule.lastMealTime,
    description: 'A light, low-fiber meal. Avoid nuts, seeds, and high-fiber foods.',
    color: 'text-accent',
    bgColor: 'bg-accent-foreground',
  },
  ...schedule.doses.map((dose, index) => ({
    icon: Droplets,
    title: `Dose ${index + 1}`,
    time: dose,
    description: 'Mix sachet with water as instructed and drink over one hour.',
    color: 'text-primary',
    bgColor: 'bg-primary-foreground',
  })),
  {
    icon: Stethoscope,
    title: 'Procedure Time',
    time: schedule.procedureDateTime,
    description: 'Arrive at the hospital/clinic as advised.',
    color: 'text-destructive',
    bgColor: 'bg-destructive-foreground',
  },
];

export function ScheduleDisplay({ schedule, onReset }: ScheduleDisplayProps) {
  const { toast } = useToast();

  const generateShareText = () => {
    let text = `Dosing Schedule for ${schedule.patientName}:\n\n`;
    text += `*Last Meal:* ${format(schedule.lastMealTime, 'eeee, MMM d @ p')}\n`;
    schedule.doses.forEach((dose, i) => {
      text += `*Dose ${i + 1}:* ${format(dose, 'eeee, MMM d @ p')}\n`;
    });
    text += `\n*Procedure Time:* ${format(
      schedule.procedureDateTime,
      'eeee, MMM d @ p'
    )}\n\n`;
    text += 'Please follow all instructions from your doctor.';
    return text;
  };
  
  const handleShare = (platform: 'whatsapp' | 'email') => {
    const text = generateShareText();
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + `\n\nView online: ${window.location.href}`)}`;
    } else {
      url = `mailto:?subject=Dosing Schedule for ${schedule.patientName}&body=${encodeURIComponent(text + `\n\nView online: ${window.location.href}`)}`;
    }
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
            title: "Link Copied!",
            description: "You can now share the schedule link.",
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not copy the link.",
        });
    });
  };
  
  const handleDownloadPdf = async (lang: 'en' | 'ar') => {
    try {
      toast({ title: "Generating PDF...", description: "Please wait a moment." });

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule, lang }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SPMC_Schedule_${schedule.patientName.replace(/\s/g, '_')}_${lang}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Failed to generate PDF", error);
      toast({ 
        variant: "destructive", 
        title: "PDF Generation Failed", 
        description: "An unexpected error occurred while generating the PDF." 
      });
    }
  };

  return (
    <div className="mt-8">
      <Card className="w-full shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Calendar className="text-primary" />
            Your Dosing Schedule
          </CardTitle>
          <CardDescription>
            For {schedule.patientName}, procedure on{' '}
            {format(schedule.procedureDateTime, 'MMMM do, yyyy')}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative pl-6">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border"></div>
            {timelineItems(schedule).map((item, index) => (
              <div key={index} className="flex items-start gap-4 mb-6 last:mb-0">
                <div
                  className={`flex-shrink-0 w-6 h-6 ${item.color} flex items-center justify-center rounded-full bg-background relative z-10 -left-3 mt-1 ring-4 ring-background`}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {format(item.time, "eeee, MMMM do 'at' h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-2 pt-2 no-print">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Share2 className="h-5 w-5 text-primary" />
              Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <Button variant="outline" onClick={() => handleShare('whatsapp')}>
                <WhatsAppIcon className="mr-2" /> WhatsApp
              </Button>
              <Button variant="outline" onClick={() => handleShare('email')}>
                <Mail className="mr-2" /> Email
              </Button>
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="mr-2" /> Copy Link
              </Button>
              <Button variant="outline" onClick={() => handleDownloadPdf('en')}>
                <Download className="mr-2" /> English PDF
              </Button>
              <Button variant="outline" onClick={() => handleDownloadPdf('ar')}>
                <Download className="mr-2" /> Arabic PDF
              </Button>
              <Button variant="destructive" onClick={onReset}>
                <RotateCcw className="mr-2" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}