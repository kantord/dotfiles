const MOCK_EVENTS = [
  { title: "Standup", start: "09:00", end: "09:30", color: "#818cf8" },
  { title: "Design Review", start: "10:30", end: "11:30", color: "#f472b6" },
  { title: "Lunch", start: "12:30", end: "13:30", color: "#34d399" },
  { title: "1:1 Anna", start: "14:00", end: "14:45", color: "#fbbf24" },
  { title: "Sprint Planning", start: "15:00", end: "16:30", color: "#818cf8" },
];

const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const DAY_SPAN = DAY_END - DAY_START;

function toPct(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return Math.max(0, Math.min(100, ((h * 60 + m - DAY_START) / DAY_SPAN) * 100));
}

export default function CalendarSidebar() {
  const raw = useStringStream("/usr/bin/bash", "while true; do date +'%H:%M'; sleep 10; done");
  const nowPct = raw ? toPct(raw.trim()) : null;

  return (
    <container tw="relative h-full w-full">
      {MOCK_EVENTS.map((ev, i) => (
        <container
          key={i}
          style={{
            position: 'absolute',
            top: `${toPct(ev.start)}%`,
            height: `${toPct(ev.end) - toPct(ev.start)}%`,
            left: 0,
            right: 0,
            backgroundColor: ev.color + '22',
            borderLeft: `2px solid ${ev.color}`,
            borderRadius: 2,
            overflow: 'hidden',
            paddingLeft: 3,
            paddingTop: 2,
          }}
        >
          {/* THEME-GAP: event colors (#818cf8 etc.) and backgroundColor/borderLeft are per-event semantic colors applied via inline style — not themeable as tw tokens */}
          <text tw="text-[8px] text-foreground leading-none">{ev.title}</text>
        </container>
      ))}
      {nowPct !== null && (
        <container
          style={{
            position: 'absolute',
            top: `${nowPct}%`,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#ef4444',
            borderRadius: 1,
          }}
        />
      )}
    </container>
  );
}
