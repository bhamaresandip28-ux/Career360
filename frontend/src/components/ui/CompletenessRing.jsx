/**
 * Career360 — Profile Completeness Ring
 * Displays a circular progress indicator using the Career360 palette.
 */

export default function CompletenessRing({ value = 0, size = 120 }) {
  const radius = (size - 16) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  const color = value >= 80 ? '#10B981' : value >= 50 ? '#0A4174' : '#4E8EA2';
  const label = value >= 80 ? 'Excellent' : value >= 50 ? 'Good' : 'Incomplete';

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#BDD8E9" strokeWidth="6" opacity="0.6" />
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#001D39] tracking-tight">{value}%</span>
          <span className="text-[11px] text-[#49769F] font-medium mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
}
