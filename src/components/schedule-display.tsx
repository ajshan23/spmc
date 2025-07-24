
'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  UtensilsCrossed,
  Droplets,
  Stethoscope,
  Share2,
  Mail,
  Copy,
  Download,
  RotateCcw,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Schedule } from '@/lib/schedule';
import { WhatsAppIcon } from './icons/whatsapp-icon';
import { useToast } from "@/hooks/use-toast"
import { useRef } from 'react';

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

const SchedulePrintable = ({ schedule, lang, printableRef }: { schedule: Schedule, lang: 'en' | 'ar', printableRef: React.RefObject<HTMLDivElement> }) => {
    const isArabic = lang === 'ar';
    const translations = {
      title: isArabic ? "جدول الجرعات" : "Dosing Schedule",
      patient: isArabic ? "المريض" : "Patient",
      procedureOn: isArabic ? "الإجراء في" : "Procedure on",
      lastMeal: isArabic ? "آخر وجبة" : "Last Meal",
      dose: isArabic ? "الجرعة" : "Dose",
      procedure: isArabic ? "وقت الإجراء" : "Procedure Time",
      footer: isArabic ? "هذا الجدول لأغراض إعلامية فقط. اتبع دائمًا تعليمات طبيبك." : "This schedule is for informational purposes. Always follow your doctor's instructions.",
    };

    const items = timelineItems(schedule);

    return (
        <div 
          ref={printableRef}
          dir={isArabic ? 'rtl' : 'ltr'} 
          className="font-body bg-background p-8"
          style={{ width: '800px' }}
        >
          <style>{`
            .font-body { font-family: 'Roboto', sans-serif; }
            .font-headline { font-family: 'Roboto', sans-serif; font-weight: 700; }
          `}</style>
          <Card className="w-full shadow-lg border-2 border-primary">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-4xl text-primary">
                SPMC
                </CardTitle>
                <CardDescription className="text-lg">
                    {translations.title} for {schedule.patientName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="relative pl-8">
                <div className="absolute left-11 top-4 bottom-4 w-0.5 bg-border"></div>
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-6 mb-8 last:mb-0">
                    <div
                      className={`flex-shrink-0 w-10 h-10 ${item.color} flex items-center justify-center rounded-full bg-background relative z-10 -left-1 mt-1 ring-4 ring-background`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-headline text-xl">{isArabic ? item.title === 'Last Meal' ? translations.lastMeal : item.title.replace('Dose', translations.dose) : item.title}</p>
                      <p className="text-md text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(item.time, "eeee, MMMM do 'at' h:mm a")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-center justify-center text-center text-xs text-muted-foreground pt-4">
                <Separator className="my-2" />
                <p>{translations.footer}</p>
            </CardFooter>
          </Card>
        </div>
    );
};


export function ScheduleDisplay({ schedule, onReset }: ScheduleDisplayProps) {
  const { toast } = useToast();
  const printableRef = useRef<HTMLDivElement>(null);
  const printableRefEn = useRef<HTMLDivElement>(null);
  const printableRefAr = useRef<HTMLDivElement>(null);

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
  
  const handleDownloadPdf = async () => {
    const elementEn = printableRefEn.current;
    const elementAr = printableRefAr.current;

    if (!elementEn || !elementAr) {
        toast({ variant: "destructive", title: "Error", description: "Could not find schedule content to download." });
        return;
    };
    
    toast({ title: "Generating PDF...", description: "Please wait a moment." });

    try {
        const canvasEn = await html2canvas(elementEn, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
        const canvasAr = await html2canvas(elementAr, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
        
        const imgDataEn = canvasEn.toDataURL('image/png');
        const imgDataAr = canvasAr.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvasEn.width, canvasEn.height]
        });

        pdf.addImage(imgDataEn, 'PNG', 0, 0, canvasEn.width, canvasEn.height);
        pdf.addPage([canvasAr.width, canvasAr.height], 'p');
        pdf.addImage(imgDataAr, 'PNG', 0, 0, canvasAr.width, canvasAr.height);

        pdf.save(`CitraFleet_Schedule_${schedule.patientName.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF", error);
        toast({ variant: "destructive", title: "PDF Generation Failed", description: "An unexpected error occurred." });
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
                 {/* <Button variant="outline" onClick={() => handleShare('whatsapp')}>
                    <WhatsAppIcon className="mr-2" /> WhatsApp
                 </Button>
                 <Button variant="outline" onClick={() => handleShare('email')}>
                    <Mail /> Email
                 </Button> */}
                 <Button variant="outline" onClick={handleCopyLink}>
                    <Copy /> Copy Link
                 </Button>
                 <Button variant="outline" onClick={handleDownloadPdf}>
                    <Download /> Download
                 </Button>
                 <Button variant="destructive" onClick={onReset}>
                    <RotateCcw /> Reset
                 </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* These elements are used for PDF generation and are not displayed on the page */}
      <div className="absolute -left-[9999px] top-auto">
        <SchedulePrintable schedule={schedule} lang="en" printableRef={printableRefEn} />
      </div>
      <div className="absolute -left-[9999px] top-auto">
        <SchedulePrintable schedule={schedule} lang="ar" printableRef={printableRefAr} />
      </div>
    </div>
  );
}
