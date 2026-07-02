import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Simple in-memory server rate limiting cache
const ipCache = new Map<string, { count: number; firstRequestTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // Max 3 bookings per minute per IP

export async function POST(request: NextRequest) {
  try {
    const detectedLocale = request.headers.get('accept-language')?.includes('ar') ? 'ar' : 'en'; // fallback locale detector
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Check rate limit
    const now = Date.now();
    const userRecord = ipCache.get(ip);
    if (!userRecord) {
      ipCache.set(ip, { count: 1, firstRequestTime: now });
    } else {
      if (now - userRecord.firstRequestTime > RATE_LIMIT_WINDOW) {
        ipCache.set(ip, { count: 1, firstRequestTime: now });
      } else {
        userRecord.count += 1;
        if (userRecord.count > MAX_REQUESTS) {
          return NextResponse.json(
            { error: detectedLocale === 'ar' ? 'تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد دقيقة.' : 'Too many requests. Please try again in a minute.' },
            { status: 429 }
          );
        }
      }
    }

    const body = await request.json();
    const { patient_name, phone, email, doctor_name, doctor_id, department_id, department, appointment_date, appointment_time, message } = body;
    const locale = body.locale || detectedLocale;

    // Sanitize string inputs to prevent XSS vulnerabilities
    const sanitize = (val: string) => val ? val.replace(/<[^>]*>/g, '').trim() : '';
    const cleanPatientName = sanitize(patient_name);
    const cleanEmailVal = sanitize(email);
    const cleanMessage = sanitize(message);

    // Validate required fields
    if (!cleanPatientName || !phone || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { error: locale === 'ar' ? 'البيانات المطلوبة ناقصة' : 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Validate Egyptian phone
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^(\+?20|0020)?1[0-9]{9}$/.test(cleanPhone) && !/^01[0-9]{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: locale === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Validate UUID format before inserting, otherwise use null
    const isValidUUID = (id: string) => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    };
    const dbDoctorId = (doctor_id && isValidUUID(doctor_id)) ? doctor_id : null;
    const dbDeptId = (department_id && isValidUUID(department_id)) ? department_id : null;

    // Insert appointment into Supabase
    const { data: appointment, error: insertError } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_name: cleanPatientName,
        phone: cleanPhone,
        email: cleanEmailVal || null,
        doctor_id: dbDoctorId,
        department_id: dbDeptId,
        appointment_date,
        appointment_time,
        message: cleanMessage || null,
        status: 'pending',
        notes: doctor_name || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: locale === 'ar' ? 'حدث خطأ أثناء الحجز' : 'Booking failed' },
        { status: 500 }
      );
    }

    // Send confirmation email if email is provided
    if (email) {
      try {
        await sendConfirmationEmail({
          to: email,
          patientName: patient_name,
          doctorName: doctor_name || 'EMC Doctor',
          department: department || '',
          date: appointment_date,
          time: appointment_time,
          appointmentId: appointment.id,
          locale: locale || 'ar',
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: locale === 'ar'
        ? 'تم الحجز بنجاح! تم إرسال بريد التأكيد.'
        : 'Booking confirmed! Confirmation email sent.',
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Confirmation / Cancel action
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');
    const action = searchParams.get('action'); // 'confirm' or 'cancel'

    if (!appointmentId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';

    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      console.error('Supabase update status error:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'confirm' ? 'confirmed' : 'cancelled'
    });
  } catch (err: any) {
    console.error('Error in GET booking action:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ─── Email Helper ─────────────────────────────────────
interface EmailParams {
  to: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  appointmentId: string;
  locale: string;
}

async function sendConfirmationEmail(params: EmailParams) {
  const { to, patientName, doctorName, department, date, time, appointmentId, locale } = params;
  const isAr = locale === 'ar';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emc-bice.vercel.app';
  const activeBaseUrl = baseUrl.includes('emc-clinic.com') ? 'https://emc-bice.vercel.app' : baseUrl;

  const confirmUrl = `${activeBaseUrl}/${locale || 'ar'}/booking-action?id=${appointmentId}&action=confirm`;
  const cancelUrl = `${activeBaseUrl}/${locale || 'ar'}/booking-action?id=${appointmentId}&action=cancel`;

  const subject = isAr
    ? 'تاكيد حجز موعدك - عيادة مصر الطبية EMC'
    : 'Appointment Booking Confirmation - Egypt Medical Clinic EMC';

  const html = `<!DOCTYPE html>
  <html lang="${locale}" dir="${isAr ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
      
      * {
        font-family: ${isAr ? "'Cairo', 'Helvetica Neue', Helvetica, Arial, sans-serif" : "'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif"};
      }
      
      body {
        margin: 0;
        padding: 0;
        background-color: #F8FAFC;
        -webkit-font-smoothing: antialiased;
      }
      
      .wrapper {
        width: 100%;
        background-color: #F8FAFC;
        padding: 40px 0;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #FFFFFF;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        border: 1px solid #E2E8F0;
      }
      
      .header {
        background: linear-gradient(135deg, #0070CD, #004C8C);
        padding: 40px 32px;
        text-align: center;
      }
      
      .logo-img {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: #FFFFFF;
        padding: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: inline-block;
      }
      
      .header-title {
        color: #FFFFFF;
        margin: 16px 0 4px;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      
      .header-sub {
        color: rgba(255, 255, 255, 0.85);
        margin: 0;
        font-size: 13px;
        font-weight: 600;
      }
      
      .content {
        padding: 40px 32px;
      }
      
      .greeting {
        color: #1A1A2E;
        font-size: 20px;
        font-weight: 800;
        margin: 0 0 12px;
        text-align: ${isAr ? 'right' : 'left'};
      }
      
      .intro-text {
        color: #64748B;
        font-size: 14px;
        line-height: 1.7;
        margin: 0 0 32px;
        text-align: ${isAr ? 'right' : 'left'};
      }
      
      .details-card {
        background-color: #F8FAFC;
        border-radius: 20px;
        border: 1px solid #EDF2F7;
        padding: 24px;
        margin-bottom: 32px;
        text-align: ${isAr ? 'right' : 'left'};
      }
      
      .detail-row {
        margin-bottom: 16px;
      }
      
      .detail-row:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        color: #64748B;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      
      .detail-value {
        color: #1A1A2E;
        font-size: 14px;
        font-weight: 700;
      }
      
      .detail-highlight {
        color: #0070CD;
      }
      
      .actions-table {
        width: 100%;
        margin-bottom: 16px;
      }
      
      .action-cell {
        width: 50%;
        padding: 0 8px;
      }
      
      .btn {
        display: block;
        padding: 14px 20px;
        text-decoration: none;
        border-radius: 16px;
        font-weight: 800;
        font-size: 14px;
        text-align: center;
      }
      
      .btn-confirm {
        background-color: #10B981;
        color: #FFFFFF !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
      }
      
      .btn-cancel {
        background-color: #EF4444;
        color: #FFFFFF !important;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
      }
      
      .footer {
        background-color: #F8FAFC;
        padding: 32px;
        text-align: center;
        border-top: 1px solid #E2E8F0;
      }
      
      .footer-contact {
        color: #64748B;
        font-size: 12px;
        font-weight: 600;
        margin: 0 0 8px;
      }
      
      .footer-copyright {
        color: #94A3B8;
        font-size: 11px;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        
        <!-- Header -->
        <div class="header">
          <img src="https://emc-bice.vercel.app/emc-logo.jpg" class="logo-img" alt="EMC Logo" />
          <h1 class="header-title">${isAr ? 'عيادة مصر الطبية' : 'Egypt Medical Clinic'}</h1>
          <p class="header-sub">${isAr ? 'تأكيد وحفظ مواعيد الحجوزات الطبية' : 'Medical Appointments Portal'}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <h2 class="greeting">
            ${isAr ? `مرحباً بك، ${patientName}` : `Hello, ${patientName}`}
          </h2>
          <p class="intro-text">
            ${isAr
              ? 'تم استلام طلب حجز موعدك بنجاح في عيادتنا. يرجى مراجعة تفاصيل الموعد أدناه وتأكيده لتثبيت الحجز، أو إلغائه إذا كنت ترغب في تغيير الموعد.'
              : 'We have received your appointment request. Please review the details below and confirm to secure your slot, or cancel if you wish to change it.'}
          </p>
          
          <!-- Appointment Details -->
          <div class="details-card">
            <div class="detail-row">
              <div class="detail-label">${isAr ? '🩺 التخصص والطبيب:' : '🩺 Doctor:'}</div>
              <div class="detail-value">${doctorName}${department ? ` (${department})` : ''}</div>
            </div>
            <div style="height: 1px; background-color: #E2E8F0; margin: 12px 0;"></div>
            <div class="detail-row">
              <div class="detail-label">${isAr ? '📅 تاريخ الموعد:' : '📅 Date:'}</div>
              <div class="detail-value detail-highlight">${date}</div>
            </div>
            <div style="height: 1px; background-color: #E2E8F0; margin: 12px 0;"></div>
            <div class="detail-row">
              <div class="detail-label">${isAr ? '⏰ توقيت الموعد:' : '⏰ Time:'}</div>
              <div class="detail-value detail-highlight">${time}</div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <table class="actions-table" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="action-cell">
                <a href="${confirmUrl}" class="btn btn-confirm">
                  ${isAr ? '✓ تأكيد حجز الموعد' : '✓ Confirm Booking'}
                </a>
              </td>
              <td class="action-cell">
                <a href="${cancelUrl}" class="btn btn-cancel">
                  ${isAr ? '✕ إلغاء الحجز' : '✕ Cancel Booking'}
                </a>
              </td>
            </tr>
          </table>
          
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="footer-contact">
            ${isAr ? '📞 هاتف الدعم: 01044437797 | ✉ البريد: emc.egypt12@gmail.com' : '📞 Call support: 01044437797 | ✉ Email: emc.egypt12@gmail.com'}
          </p>
          <p class="footer-copyright">
            ${isAr 
              ? 'حقوق النشر محفوظة © 2026 عيادة مصر الطبية EMC - مصر الجديدة، القاهرة' 
              : 'Copyright © 2026 Egypt Medical Clinic EMC - Heliopolis, Cairo'}
          </p>
        </div>
        
      </div>
    </div>
  </body>
  </html>`;

  // Gmail SMTP Transporter config
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: `"EMC Clinic" <${emailUser}>`,
        to,
        subject,
        html,
      });

      console.log(`Email successfully sent via Gmail SMTP (${emailUser}) to ${to}`);
      return;
    } catch (smtpError) {
      console.error('Gmail SMTP failed, falling back to Resend:', smtpError);
    }
  }

  // Fallback to Resend API
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.log('===========================================');
    console.log('EMAIL SENT LOG (No SMTP or Resend Configured)');
    console.log('===========================================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Confirm URL: ${confirmUrl}`);
    console.log(`Cancel URL: ${cancelUrl}`);
    console.log('===========================================');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'EMC Clinic <noreply@emc-clinic.com>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${err}`);
  }
}
