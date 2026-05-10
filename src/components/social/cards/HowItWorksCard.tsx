import Image from 'next/image';

export default function HowItWorksCard() {
  const steps = [
    {
      number: '01',
      emoji: '📋',
      title: 'Pick your drivers',
      desc: 'Before qualifying locks, predict which drivers will finish in each points position.',
      color: '#2563eb',
    },
    {
      number: '02',
      emoji: '🏎️',
      title: 'Watch the race',
      desc: 'Sit back, watch every lap, and hope your predictions hold up under pressure.',
      color: '#7c3aed',
    },
    {
      number: '03',
      emoji: '🏆',
      title: 'Score points',
      desc: 'Earn points for every correct pick. Climb your league leaderboard across the season.',
      color: '#f59e0b',
    },
  ];

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
      }}
    >
      {/* Top accent */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #7c3aed, #f59e0b)' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 48px 16px' }}>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          FinalPoint
        </p>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 28 }}>
          How it works
        </h2>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {steps.map((step, i) => (
            <div key={step.number} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Step number + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {step.emoji}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.07)', marginTop: 6, minHeight: 20 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: step.color, letterSpacing: '0.1em' }}>{step.number}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
                    {step.title}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="FinalPoint" width={20} height={20} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>FinalPoint</span>
        </div>
        <span style={{ fontSize: 11, color: '#475569' }}>Free · finalpoint.app</span>
      </div>
    </div>
  );
}
