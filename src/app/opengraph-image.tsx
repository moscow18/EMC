import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Egypt Medical Clinic — عيادة مصر الطبية';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0070CD 0%, #004C8C 50%, #0F172A 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        {/* EMC Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 90,
            height: 90,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.15)',
            marginBottom: 24,
            fontSize: 36,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          EMC
        </div>

        {/* English Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          Egypt Medical Clinic
        </div>

        {/* Arabic Title */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginBottom: 24,
            direction: 'rtl',
          }}
        >
          عيادة مصر الطبية
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: '#E50000',
            marginBottom: 24,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          Heliopolis, Cairo — مصر الجديدة، القاهرة
        </div>

        {/* Contact */}
        <div
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            marginTop: 12,
            fontWeight: 400,
          }}
        >
          01044437797 • emc.egypt12@gmail.com
        </div>
      </div>
    ),
    { ...size }
  );
}
