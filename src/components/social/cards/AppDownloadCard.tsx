import Image from 'next/image';

export default function AppDownloadCard() {
  return (
    <div
      style={{
        width: 600,
        height: 600,
        background: 'linear-gradient(145deg, #090c14 0%, #0d1629 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top accent */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />

      {/* Decorative glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 48px', textAlign: 'center', position: 'relative' }}>

        {/* Logo */}
        <Image src="/logo.png" alt="FinalPoint" width={80} height={80} style={{ borderRadius: 18, marginBottom: 20, boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }} />

        {/* App name + tagline */}
        <p style={{ fontSize: 42, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>
          FinalPoint
        </p>
        <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500, marginBottom: 32, lineHeight: 1.4 }}>
          The free F1 race prediction game.<br />Pick drivers. Compete. Score.
        </p>

        {/* App store buttons */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
          {/* iOS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
          }}>
            <svg width="22" height="22" fill="#ffffff" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', margin: 0 }}>DOWNLOAD ON THE</p>
              <p style={{ fontSize: 15, color: '#ffffff', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>App Store</p>
            </div>
          </div>

          {/* Android */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
          }}>
            <svg width="22" height="22" fill="#ffffff" viewBox="0 -960 960 960">
              <path d="M40-240q9-107 65.5-197T256-580l-74-128q-6-9-3-19t13-15q8-5 18-2t16 12l74 128q86-36 180-36t180 36l74-128q6-9 16-12t18 2q10 5 13 15t-3 19l-74 128q94 53 150.5 143T920-240H40Zm240-110q21 0 35.5-14.5T330-400q0-21-14.5-35.5T280-450q-21 0-35.5 14.5T230-400q0 21 14.5 35.5T280-350Zm400 0q21 0 35.5-14.5T730-400q0-21-14.5-35.5T680-450q-21 0-35.5 14.5T630-400q0 21 14.5 35.5T680-350Z" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', margin: 0 }}>GET IT ON</p>
              <p style={{ fontSize: 15, color: '#ffffff', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Google Play</p>
            </div>
          </div>
        </div>

        {/* Web CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500, padding: '0 12px' }}>or play at</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 10 }}>finalpoint.app</p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="FinalPoint" width={20} height={20} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>FinalPoint</span>
        </div>
        <span style={{ fontSize: 11, color: '#475569' }}>Free · iOS & Android</span>
      </div>
    </div>
  );
}
