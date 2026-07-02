import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

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
    const { data: appointment, error: insertError } = await supabase
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

    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    // Return HTML page for the user
    const isConfirmed = action === 'confirm';
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isConfirmed ? 'تم تأكيد الحجز' : 'تم إلغاء الحجز'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', Arial, sans-serif; background: #F8F9FA; color: #1A1A2E; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 24px; padding: 48px 32px; text-align: center; max-width: 440px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .icon { width: 64px; height: 64px; border-radius: 50%; background: ${isConfirmed ? '#D1FAE5' : '#FEE2E2'}; color: ${isConfirmed ? '#10B981' : '#EF4444'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 28px; font-weight: bold; }
        h1 { font-size: 22px; font-weight: 800; color: #1A1A2E; margin-bottom: 12px; }
        p { color: #6B7280; font-size: 15px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${isConfirmed ? '✓' : '✕'}</div>
        <h1>${isConfirmed ? 'تم تأكيد حجزك بنجاح' : 'تم إلغاء الحجز'}</h1>
        <p>${isConfirmed
          ? 'تم تسجيل تأكيد موعدك بنجاح في نظام العيادة. نتطلع لرؤيتك قريباً.'
          : 'تم إلغاء الحجز بنجاح بناءً على طلبك.'}</p>
        <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF;">سيتم إغلاق هذه الصفحة تلقائياً خلال لحظات...</p>
      </div>
      <script>
        setTimeout(() => {
          window.close();
        }, 2000);
      </script>
    </body>
    </html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
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
  const confirmUrl = `${baseUrl}/api/book?id=${appointmentId}&action=confirm`;
  const cancelUrl = `${baseUrl}/api/book?id=${appointmentId}&action=cancel`;

  const subject = isAr
    ? 'تاكيد حجز موعدك - عيادة مصر الطبية EMC'
    : 'Appointment Booking Confirmation - Egypt Medical Clinic EMC';

  const html = `
  <!DOCTYPE html>
  <html lang="${locale}" dir="${isAr ? 'rtl' : 'ltr'}">
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;font-family:'Cairo',Arial,sans-serif;background:#f4f6f7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0070CD,#004C8C);padding:32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;font-weight:800;">EMC</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">
            ${isAr ? 'عيادة مصر الطبية - مصر الجديدة' : 'Egypt Medical Clinic - Heliopolis'}
          </p>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <h2 style="color:#1A1A2E;font-size:22px;margin:0 0 16px;">
            ${isAr ? `مرحبا ${patientName}` : `Hello ${patientName}`}
          </h2>
          <p style="color:#64748B;font-size:15px;line-height:1.8;margin:0 0 24px;">
            ${isAr
              ? 'تم استلام طلب حجز موعدك بنجاح. يرجى مراجعة التفاصيل والتأكيد أو الإلغاء.'
              : 'Your appointment booking has been received. Please review the details and confirm or cancel.'}
          </p>

          <!-- Appointment Details -->
          <table width="100%" cellpadding="12" cellspacing="0" style="background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;margin-bottom:24px;">
            <tr>
              <td style="color:#64748B;font-size:13px;font-weight:700;border-bottom:1px solid #E2E8F0;">
                ${isAr ? 'الطبيب' : 'Doctor'}
              </td>
              <td style="color:#1A1A2E;font-size:14px;font-weight:700;border-bottom:1px solid #E2E8F0;">
                ${doctorName}${department ? ` - ${department}` : ''}
              </td>
            </tr>
            <tr>
              <td style="color:#64748B;font-size:13px;font-weight:700;border-bottom:1px solid #E2E8F0;">
                ${isAr ? 'التاريخ' : 'Date'}
              </td>
              <td style="color:#0070CD;font-size:14px;font-weight:700;border-bottom:1px solid #E2E8F0;">
                ${date}
              </td>
            </tr>
            <tr>
              <td style="color:#64748B;font-size:13px;font-weight:700;">
                ${isAr ? 'الوقت' : 'Time'}
              </td>
              <td style="color:#0070CD;font-size:14px;font-weight:700;">
                ${time}
              </td>
            </tr>
          </table>

          <!-- Action Buttons -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px;text-align:center;" width="50%">
                <a href="${confirmUrl}" style="display:inline-block;width:100%;padding:14px 0;background:#10B981;color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;text-align:center;">
                  ${isAr ? 'تاكيد الحجز' : 'Confirm'}
                </a>
              </td>
              <td style="padding:8px;text-align:center;" width="50%">
                <a href="${cancelUrl}" style="display:inline-block;width:100%;padding:14px 0;background:#EF4444;color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;text-align:center;">
                  ${isAr ? 'الغاء الحجز' : 'Cancel'}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:24px;background:#F8FAFC;text-align:center;border-top:1px solid #E2E8F0;">
          <p style="color:#94A3B8;font-size:12px;margin:0;">
            ${isAr ? 'الهاتف: 01044437797 | البريد الالكتروني: emc.egypt12@gmail.com' : 'Phone: 01044437797 | Email: emc.egypt12@gmail.com'}
          </p>
          <p style="color:#CBD5E1;font-size:11px;margin:8px 0 0;">
            ${isAr ? 'حقوق النشر محفوظة - عيادة مصر الطبية - مصر الجديدة، القاهرة' : 'Egypt Medical Clinic - Heliopolis, Cairo'}
          </p>
        </td>
      </tr>
    </table>
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
