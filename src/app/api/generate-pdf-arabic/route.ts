import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

interface ScheduleData {
  patientName: string;
  procedureDateTime: string;
  procedureDateFormatted: string;
  procedureTimeFormatted: string;
  registrationTimeFormatted: string;
  lastMealTime: string;
  doses: Array<{
    time: string;
    timeFormatted: string;
  }>;
  hospital?: string;
}

export async function POST(req: Request) {
  try {
    const { schedule }: { schedule: ScheduleData } = await req.json();

    const browser = await puppeteer.launch({
      headless: 'shell',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1
    });
    
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>SPMC Prescription Pad</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            width: 100%;
            margin: 0;
            padding: 5mm;
            line-height: 1.4;
            box-sizing: border-box;
            overflow: hidden;
          }
          
          .page-container {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .content-constraint {
            max-width: 95%;
            margin: 0 auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          
          td, th {
            padding: 4px;
            vertical-align: top;
            text-align: right;
          }
          
          .blue { color: #f58220; }
          .orange { color: #f58220; }
          .bold { font-weight: bold; }
          
          .info-line {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-top: 8px;
            flex-wrap: wrap;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            margin-left: 10px;
            margin-bottom: 4px;
          }
          
          .info-item .underline {
            border-bottom: 1px solid #333;
            min-width: 70px;
            display: inline-block;
            margin: 0 4px;
            height: 16px;
          }
          
          .dose-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .dose-table th, .dose-table td {
            border: 1px solid #000;
            padding: 8px;
          }
          
          .instruction-box {
            border: 2px solid #f58220;
            border-radius: 15px;
            display: flex;
            overflow: hidden;
            margin: 10px 0;
            flex-direction: row-reverse;
          }
          
          .instruction-title {
            flex: 2;
            background: #fff;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            border-left: 3px solid #f58220;
          }
          
          .instruction-content {
            flex: 2;
            background: #f9f9f9;
            padding: 10px 15px;
            display: flex;
            align-items: center;
          }
          
          .instruction-icon {
            background: #f58220;
            padding: 8px;
            display: flex;
            align-items: center;
            print-color-adjust: exact;
          }
          
          .qa-section {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin-top: 20px;
          }
          
          .qa-title {
            font-weight: bold;
            font-size: 14px;
            color: #f58220;
            text-align: center;
            border-bottom: 1px solid #f58220;
            padding-bottom: 6px;
            margin-bottom: 15px;
          }
          
          .qa-pair {
            display: flex;
            flex-direction: row-reverse;
            margin-bottom: 10px;
          }
          
          .qa-question {
            flex: 1;
            padding: 10px;
            border-radius: 0 6px 6px 0;
            font-weight: 600;
            background: linear-gradient(to left, #f9fafa, #fff);
          }
          
          .qa-answer {
            flex: 1;
            padding: 10px;
            border-radius: 6px 0 0 6px;
            background: linear-gradient(to left, #f9f9f9, #fff);
          }
          
          .underline-line {
            border-bottom: 1px solid #000;
            height: 16px;
            margin: 6px 0;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-constraint">
            <!-- TOP DESCRIPTION -->
            <p style="font-size: 16px; font-weight: bold; color: #f58220; text-transform: uppercase; margin-bottom: 12px; line-height: 22px;">
              صوديوم بيكوسلفات: 10 مجم، ماغنيسيوم (أكسيد الماغنيسيوم الخفيف): 3.5 جم، حمض الستريك اللامائي: 10.97 جم (SPMC) مسحوق للحل
            </p>

            <!-- Header -->
            <table class="no-break">
              <tr>
                <td style="width: 100%; margin-top: 8px; vertical-align: top;">
                  <h2 style="font-size: 16px; color: #f58220; margin: 0;">موعد إجراء العملية:</h2>
                  <div class="info-line">
                    <div class="info-item">
                      <strong>التاريخ:</strong> <span class="underline">${schedule.procedureDateFormatted}</span>
                    </div>
                    
                    <div class="info-item">
                      <strong>اسم:</strong> <span class="underline">${schedule.patientName}</span>
                    </div>
                    <div class="info-item">
                      <strong>الوقت:</strong> <span class="underline">${schedule.procedureTimeFormatted}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Instruction Box -->
            <div class="instruction-box no-break">
              <div class="instruction-title">
                <span style="font-size: 20px;">
                  <span style="color: #f58220; font-weight: bold;">SPMC</span>
                  <span style="font-weight: bold;">تعليمات المريض</span>
                </span>
              </div>
              <div class="instruction-content">
                <span>ستحتاج إلى أن تكون بالقرب من المرحاض بعد تناول هذا الدواء حيث يمكن أن يبدأ مفعوله خلال 1 إلى 3 ساعات.</span>
              </div>
              <div class="instruction-icon">
                <img src="https://krishnadas-test-1.s3.ap-south-1.amazonaws.com/sample-spmc/icon1.png" alt="Toilet Icon" style="height: 50px; width: 50px; object-fit: cover;" />
              </div>
            </div>

            <!-- Important Message -->
            <p style="font-size: 14px; font-weight: 700; line-height: 20px; border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 15px;" class="no-break">
              لكي يتمكن طبيبك من رؤية بطانة القولون بوضوح، يجب تنظيف القولون بشكل كافٍ. وهذا يزيد بشكل كبير من دقة الإجراء لضمان الفحص الشامل وتجنب الحاجة إلى تكراره.
            </p>

            <!-- How to Prepare Section -->
            <table style="width: 100%; margin-top: 20px;" class="no-break">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                  <h3 style="margin-top: 0; font-size: 14px;">
                    <span style="color: #f58220; font-weight: bold;">طريقة التحضير والاستخدام</span>
                    <span style="color: #f58220;">SPMC:</span>
                  </h3>
                  <table style="width: 100%;">
                    <tr><td>1. املأ كوبًا بـ <span class="orange bold">150 مل من الماء البارد.</span></td></tr>
                    <tr><td>2. أفرغ محتويات كيس واحد في الكوب.</td></tr>
                    <tr><td>3. قلّب لمدة 2 إلى 3 دقائق حتى يذوب تمامًا<br/>(قد ترتفع درجة حرارة الخليط - اتركه ليبرد - ثم اشرب الخليط).</td></tr>
                    <tr><td class="bold">4. خذ <span class="orange">SPMC</span> وفقًا للجدول الزمني التالي.</td></tr>
                    <tr><td class="bold">5. يجب أن يكون الوقت المنقضي بين الجرعات على الأقل 3-4 ساعات.</td></tr>
                  </table>
                </td>
                <td style="width: 48%; text-align: left;">
                  <img src="https://krishnadas-test-1.s3.ap-south-1.amazonaws.com/sample-spmc/glass-eng.png" alt="Preparation Steps" style="max-width: 90%; height: auto;" />
                </td>
              </tr>
            </table>

            <!-- Schedule Table -->
            <table class="dose-table no-break">
              ${schedule.doses.map(dose => `
                <tr>
                  <td>${dose.timeFormatted}</td>
                  <td><span class="bold">خذ كيس واحد من <span class="blue">SPMC</span></span></td>
                  <td>يجب شرب 1 لتر من الماء أو السوائل الصافية بعد كل جرعة</td>
                </tr>
              `).join('')}
            </table>

            <p style="font-size: 14px; font-weight: 600; margin-top: 8px; text-align: center;" class="no-break">
              <span class="orange bold">*السوائل الصافية:</span> الماء، مشروبات الطاقة الصافية، عصير التفاح، الزنجبيل، سبرايت، سفن أب، الحساء.<br/>
              لا تشرب السوائل التي لا يمكنك الرؤية من خلالها.
            </p>

            <!-- Q&A Section -->
            <div class="qa-section no-break">
              <div class="qa-title">أسئلة وأجوبة لتعزيز نجاح تنظيف الأمعاء:</div>
              
              <!-- Q&A 1 -->
              <div class="qa-pair">
                <div class="qa-question">
                  لماذا يجب أن أشرب 1.5 إلى 2 لتر من السوائل الصافية بعد كل كيس؟
                </div>
                <div class="qa-answer">
                  شرب السوائل الصافية يساعد على:<br>
                  - تحسين تنظيف الأمعاء<br>
                  - تجنب الجفاف
                </div>
              </div>
              
              <!-- Q&A 2 -->
              <div class="qa-pair">
                <div class="qa-question">
                  كم من الوقت يستغرق <span style="color: #f58220;">SPMC</span> لبدء العمل؟
                </div>
                <div class="qa-answer">
                  يختلف هذا حسب كل فرد ولكن عادةً خلال 3 ساعات
                </div>
              </div>
              
              <!-- Q&A 3 -->
              <div class="qa-pair">
                <div class="qa-question">
                  هل هناك اعتبارات غذائية أخرى يجب أن آخذها في الاعتبار؟
                </div>
                <div class="qa-answer">
                  باتباع نصيحة طبيبك قبل الإجراء، <strong>تجنب</strong><br>
                  الأطعمة التالية لأنها تترك بقايا هضمية:<br>
                  - البذور والمكسرات<br>
                  - الفواكه أو الخضروات الطازجة<br>
                  - الخبز متعدد الحبوب
                </div>
              </div>

              <!-- Note Section -->
             
            </div>
          </div>
        </div>
      </body>
      </html>
    `, {
      waitUntil: 'networkidle0'
    });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        preferCSSPageSize: false,
        printBackground: true,
        
        margin: {
            top: '5mm',
            right: '5mm',
            bottom: '5mm',
            left: '5mm'
        },
        displayHeaderFooter: false
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=SPMC_Schedule_${schedule.patientName.replace(/\s/g, '_')}_ar.pdf`
      }
    });

  } catch (error) {
    console.error('Error generating Arabic PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate Arabic PDF' },
      { status: 500 }
    );
  }
}