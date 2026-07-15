/**
 * StatCard — KRMU branded stat tile
 * color prop: 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'teal' | 'navy'
 */
export default function StatCard({ label, value, icon: Icon, color = 'blue', sub, trend }) {
  const palette = {
    blue:   { icon: 'bg-primary-50 text-primary-700',   accent: '#003087' },
    navy:   { icon: 'bg-primary-100 text-primary-800',  accent: '#001f5c' },
    red:    { icon: 'bg-accent-50 text-accent-600',     accent: '#C8102E' },
    green:  { icon: 'bg-emerald-50 text-emerald-700',   accent: '#059669' },
    orange: { icon: 'bg-amber-50 text-amber-700',       accent: '#d97706' },
    purple: { icon: 'bg-violet-50 text-violet-700',     accent: '#7c3aed' },
    teal:   { icon: 'bg-teal-50 text-teal-700',         accent: '#0d9488' },
  };

  const { icon: iconCls, accent } = palette[color] || palette.blue;

  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-card-md transition-all duration-200 animate-fade-in-up">
      {/* Icon box */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
        <Icon className="text-2xl" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <p className="text-2xl font-extrabold leading-none" style={{ color: accent }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 mt-1 leading-snug">{sub}</p>
        )}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-accent-600'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% this month
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: accent }}
      />
    </div>
  );
}
