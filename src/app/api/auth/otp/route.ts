import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory storage for OTP codes
const otpStore = new Map<string, { code: string; expires: number }>();

// Simple in-memory server rate limiting cache for OTP
const otpIpCache = new Map<string, { count: number; firstRequestTime: number }>();
const OTP_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const OTP_MAX_REQUESTS = 3; // Max 3 OTP requests per minute per IP

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Rate limiting check
    const now = Date.now();
    const userRecord = otpIpCache.get(ip);
    if (!userRecord) {
      otpIpCache.set(ip, { count: 1, firstRequestTime: now });
    } else {
      if (now - userRecord.firstRequestTime > OTP_RATE_LIMIT_WINDOW) {
        otpIpCache.set(ip, { count: 1, firstRequestTime: now });
      } else {
        userRecord.count += 1;
        if (userRecord.count > OTP_MAX_REQUESTS) {
          return NextResponse.json(
            { error: 'Too many OTP requests. Please try again in a minute.' },
            { status: 429 }
          );
        }
      }
    }

    const body = await request.json();
    const { email, code, action, userType, newPassword } = body;

    // Sanitize parameters to prevent XSS
    const sanitize = (val: string) => val ? val.replace(/<[^>]*>/g, '').trim() : '';
    const cleanEmail = sanitize(email);
    const cleanCode = sanitize(code);
    const cleanNewPassword = sanitize(newPassword);

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (action === 'send') {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

      otpStore.set(cleanEmail.toLowerCase().trim(), { code: otp, expires });

      const isAr = true; // Default to Arabic for user friendliness
      const subject = isAr ? 'رمز التحقق الخاص بك - عيادة EMC' : 'Your Verification Code - EMC Clinic';
      
      const html = `
        <div style="font-family: sans-serif; direction: ${isAr ? 'rtl' : 'ltr'}; text-align: ${isAr ? 'right' : 'left'}; padding: 24px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0070cd; margin: 0; font-weight: 800; font-size: 24px;">EMC Clinic</h2>
            </div>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <h3 style="color: #111827; font-size: 18px; margin: 0 0 12px; font-weight: 700;">${isAr ? 'رمز التحقق المؤقت (OTP)' : 'Temporary Verification Code (OTP)'}</h3>
            <p style="color: #4b5563; font-size: 15px; margin: 0 0 16px;">${isAr ? 'استخدم الرمز التالي لتأكيد التغيير أو استعادة كلمة المرور:' : 'Use the following verification code to confirm your request:'}</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
              <h1 style="color: #1a1a2e; font-size: 32px; letter-spacing: 6px; margin: 0; font-weight: 800;">${otp}</h1>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">${isAr ? 'الرمز صالح لمدة 5 دقائق فقط.' : 'This code is valid for 5 minutes only.'}</p>
          </div>
        </div>
      `;

      if (emailUser && emailPass) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        await transporter.sendMail({
          from: `"EMC Clinic" <${emailUser}>`,
          to: email,
          subject,
          html,
        });

        console.log(`[OTP] Sent OTP ${otp} to ${email}`);
        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
      } else {
        // Log locally if no mail config exists
        console.log('=============================================');
        console.log(`[OTP BYPASS] OTP for ${email}: ${otp}`);
        console.log('=============================================');
        return NextResponse.json({ success: true, devMode: true, code: otp, message: 'OTP logged to console (Dev Mode)' });
      }
    }

    if (action === 'verify') {
      if (!cleanCode) {
        return NextResponse.json({ error: 'Code is required' }, { status: 400 });
      }

      const record = otpStore.get(cleanEmail.toLowerCase().trim());

      if (!record) {
        return NextResponse.json({ error: 'No verification request found for this email' }, { status: 400 });
      }

      if (Date.now() > record.expires) {
        otpStore.delete(cleanEmail.toLowerCase().trim());
        return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
      }

      if (record.code !== cleanCode) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      // If userType is patient, we handle resetting the password using Supabase Admin Client
      if (userType === 'patient') {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRoleKey) {
          return NextResponse.json({ 
            error: 'MISSING_SERVICE_ROLE_KEY',
            message: 'برجاء إضافة مفتاح الـ SUPABASE_SERVICE_ROLE_KEY في ملف env.local لإتمام تحديث كلمة مرور المريض بدون SMTP سوبابيز.' 
          }, { status: 400 });
        }

        if (!cleanNewPassword) {
          return NextResponse.json({ error: 'New password is required' }, { status: 400 });
        }

        // Initialize Admin Client
        const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        // Search for the user by email
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const targetUser = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail.toLowerCase().trim());

        if (!targetUser) {
          return NextResponse.json({ error: 'البريد الإلكتروني المدخل غير مسجل في النظام' }, { status: 400 });
        }

        // Update user password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          targetUser.id,
          { password: cleanNewPassword }
        );

        if (updateError) throw updateError;
      }

      // Valid! Remove OTP from store
      otpStore.delete(cleanEmail.toLowerCase().trim());
      return NextResponse.json({ success: true, message: 'Verification successful' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('OTP API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
