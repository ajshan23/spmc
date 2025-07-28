// src/app/api/generate-pdf/route.ts
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
    const { schedule, lang }: { schedule: ScheduleData; lang: 'en' | 'ar' } = await req.json();

    const browser = await puppeteer.launch({
      headless: 'shell',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set the HTML content with pre-formatted date strings
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8" />
        <title>SPMC Prescription Pad</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
         @page {
    size: A4;
    margin: 10mm;
  }
  
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #333;
            width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td, th {
            padding: 8px;
            vertical-align: top;
          }
          .blue { color: #f58220; }
          .orange { color: #f58220; }
          .bold { font-weight: bold; }
          .info-line {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-top: 10px;
            flex-wrap: wrap;
          }
          .info-item {
            display: flex;
            align-items: center;
            margin-right: 15px;
            margin-bottom: 5px;
          }
          .info-item .underline {
            border-bottom: 1px solid #333;
            min-width: 80px;
            display: inline-block;
            margin: 0 5px;
            height: 18px;
          }
          .dose-table {
            width: 100%;
            border-collapse: collapse;
          }
          .dose-table th, .dose-table td {
            border: 1px solid #000;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <!-- TOP DESCRIPTION -->
        <p style="font-size: 20px; font-weight: bold; color: #f58220; text-transform: uppercase; margin-bottom: 15px; line-height: 27px;">
          SODIUM PICOSULPHATE: 10 MG, MAGNESIUM (AS MAGNESIUM OXIDE LIGHT): 3.5 G, CITRIC ACID ANHYDROUS: 10.97 G (SPMC) POWDER FOR SOLUTION
        </p>

        <!-- Header -->
        <table>
          <tr>
            <td style="width: 100%; margin-top: 10px; vertical-align: top;">
              <h2 class="orange" style="margin: 0;">Your procedure is scheduled for:</h2>
              <div class="info-line">
                <div class="info-item">
                  <strong>Date:</strong> <span class="underline">${schedule.procedureDateFormatted}</span>
                </div>
                <div class="info-item">
                  <strong>Time:</strong> <span class="underline">${schedule.procedureTimeFormatted}</span>
                </div>
               
              </div>
            </td>
          </tr>
        </table>

        <!-- Instruction Box -->
        <div style="border: 3px solid #f58220; border-radius: 20px; display: flex; overflow: hidden; margin: 20px 0;">
          <div style="flex: 2; background: #fff; padding: 15px 20px; display: flex; align-items: center; border-right: 4px solid #f58220;">
            <span style="font-size: 27px;">
              <span style="color: #f58220; font-weight: bold;">SPMC</span>
              <span style="font-weight: bold;">Patient Instructions</span>
            </span>
          </div>
          <div style="flex: 2; background: #f9f9f9; padding: 15px 20px; display: flex; align-items: center;">
            <span>You will need to be near a toilet after you take this medicine as it can start working within 1 to 3 hours.</span>
          </div>
          <div style="background: #f58220; padding: 10px; display: flex; align-items: center; print-color-adjust: exact;">
  <img src="https://krishnadas-test-1.s3.ap-south-1.amazonaws.com/sample-spmc/icon1.png" alt="Toilet Icon" style="height: 60px; width: 60px; object-fit: cover;" />
</div>
        </div>

        <!-- Important Message -->
        <p style="font-size: 18px; font-weight: 700; line-height: 25px; border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 20px;">
          In order for your doctor to see the colon lining clearly, your colon must be adequately cleansed.
          This is greatly increasing the accuracy of the procedure to ensure thorough examination and to avoid the need for repeating it.
        </p>

        <!-- How to Prepare Section -->
        <table style="width: 100%; margin-top: 30px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 20px;">
              <h3 style="margin-top: 0;">
                <span style="color: #f58220; font-weight: bold;">HOW TO PREPARE & TAKE</span>
                <span style="color: #f58220;">SPMC:</span>
              </h3>
              <table style="width: 100%;">
                <tr><td>1. Fill a cup with <span class="orange bold">150ml cold water.</span></td></tr>
                <tr><td>2. Empty contents of one sachet in the cup.</td></tr>
                <tr><td>3. Stir for 2 to 3 minutes until completely dissolved<br/>(mixture may heat up – allow to cool – then drink the mixture).</td></tr>
                <tr><td class="bold">4. Take <span class="orange">SPMC</span> according to the following schedule.</td></tr>
                <tr><td class="bold">5. The time elapsed between the sachets should be at least 3-4 hours.</td></tr>
              </table>
            </td>
            <td style="width: 48%; text-align: right;">
              <img src="https://krishnadas-test-1.s3.ap-south-1.amazonaws.com/sample-spmc/glass-eng.png" alt="Preparation Steps" style="max-width: 100%; height: auto;" />
            </td>
          </tr>
        </table>

        <!-- Schedule Table -->
        <table class="dose-table" style="margin-top: 20px;">
          ${schedule.doses.map(dose => `
            <tr>
              <td>${dose.timeFormatted}</td>
              <td><span class="bold">Take 1 sachet of <span class="blue">SPMC</span></span></td>
              <td>Should drink 1L of water or clear fluid after each preparation</td>
            </tr>
          `).join('')}
        </table>

        <p style="font-size: 18px; font-weight: 600; margin-top: 10px; text-align: center;">
          <span class="orange bold">*Clear Fluids:</span> Water, Clean Power drinks, apple juice, ginger ale, Sprite, 7up, Soup.<br/>
          Do not drink liquids that you can't see through.
        </p>

                  <!-- Q&A Section -->
        <div style="
          font-family: Arial, sans-serif;
          font-size: 14px;
          margin-top: 40px;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        ">
          <div style="
            font-weight: bold;
            font-size: 16px;
            color: #f58220;
            text-align: center;
            border-bottom: 1px solid #f58220;
            padding-bottom: 8px;
            margin-bottom: 20px;
          ">
            Q & A TO MAXIMIZE BOWEL CLEANSING SUCCESS:
          </div>
          
          <!-- Q&A Row 1 -->
          <div style="display: flex; margin-bottom: 15px;">
            <!-- Question 1 -->
            <div style="
              flex: 1;
              padding: 15px;
              border-radius: 8px 0 0 8px;
              font-weight: 600;
              background: linear-gradient(to right, #f9fafa, #fff) !important;
              margin-right: 2px;
            ">
              Why do I have to drink 1.5 to 2 litres of clear fluids after each sachet?
            </div>
            
            <!-- Answer 1 -->
            <div style="
              flex: 1;
              padding: 15px;
              border-radius: 8px 0 0 8px;
              background: linear-gradient(to right, #f9f9f9, #fff) !important;
              margin-left: 2px;
            ">
              Drinking clear fluids helps to:<br>
              - Optimise bowel cleansing<br>
              - Avoid dehydration
            </div>
          </div>
          
          <!-- Separator Line -->
          <div style="
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, rgba(0,0,0,0) 0%, #56CCF2 30%, #f58220 70%, rgba(0,0,0,0) 100%) !important;
            margin-bottom: 15px;
          "></div>
          
          <!-- Q&A Row 2 -->
          <div style="display: flex; margin-bottom: 15px;">
            <!-- Question 2 -->
            <div style="
              flex: 1;
              padding: 15px;
              border-radius: 8px 0 0 8px;
              font-weight: 600;
              background: linear-gradient(to right, #f9fafa, #fff) !important;
              margin-right: 2px;
            ">
              How long does it take for <span style="color: #f58220;">SPMC</span> to start working?
            </div>
            
            <!-- Answer 2 -->
            <div style="
              flex: 1;
              padding: 15px;
              border-radius: 8px 0 0 8px;
              background: linear-gradient(to right, #f9f9f9, #fff) !important;
              margin-left: 2px;
            ">
              This varies depending on each individual but usually within 3 hours
            </div>
          </div>
          
          <!-- Separator Line -->
          <div style="
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, rgba(0,0,0,0) 0%, #56CCF2 30%, #f58220 70%, rgba(0,0,0,0) 100%) !important;
            margin-bottom: 15px;
          "></div>
          
          <!-- Q&A Row 3 -->
          <div style="display: flex; margin-bottom: 15px;">
            <!-- Question 3 -->
            <div style="
              flex: 1;
              padding: 15px;
              border-radius: 8px 0 0 8px;
              font-weight: 600;
              background: linear-gradient(to right, #f9fafa, #fff) !important;
              margin-right: 2px;
            ">
              Are there any other dietary considerations I should take into account?
            </div>
            
            <!-- Answer 3 -->
            <div style="
              flex: 1;
              padding: 15px;
             border-radius: 8px 0 0 8px;
              background: linear-gradient(to right, #f9f9f9, #fff) !important;
              margin-left: 2px;
            ">
              Following your Doctor's advice prior to your procedure, <strong>AVOID</strong><br>
              the following as they leave digestive residue:<br>
              - Seeds and nuts<br>
              - Fresh fruits or vegetables<br>
              - Multigrain bread
            </div>
          </div>

          <!-- Note Section -->
          <div style="margin-top: 40px;">
            <strong>Note:</strong>
            <div style="border-bottom: 1px solid #000; height: 20px; margin: 8px 0;"></div>
            <div style="border-bottom: 1px solid #000; height: 20px; margin: 8px 0;"></div>
            <div style="border-bottom: 1px solid #000; height: 20px; margin: 8px 0;"></div>
          </div>
        </div>
      </body>
      </html>
    `, {
      waitUntil: 'networkidle0'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      preferCSSPageSize: true,
      scale: 0.72,
      printBackground: true
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=SPMC_Schedule_${schedule.patientName.replace(/\s/g, '_')}_${lang}.pdf`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}