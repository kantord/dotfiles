export default function MonitorDot({ o }) {
  return (
    <panel
      id={`monitor-dot-${o.name}`}
      output={o.name}
      above={true}
      x={o.screen_width - 40}
      y={8}
      width={32}
      height={32}
    >
      <container tw="flex items-center justify-center w-full h-full rounded-full bg-red-500" />
    </panel>
  );
}
