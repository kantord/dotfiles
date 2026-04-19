const NOTIF_W = 340;
const NOTIF_H = 72;
const NOTIF_GAP = 8;
const NOTIF_MARGIN = 16;

export default function NotificationPanel({ n, i, ctx }) {
  return (
    <panel
      id={`notif-pos-${i}`}
      above={true}
      x={ctx.screen_width - NOTIF_W - NOTIF_MARGIN}
      y={NOTIF_MARGIN + i * (NOTIF_H + NOTIF_GAP)}
      width={NOTIF_W}
      height={NOTIF_H}
    >
      <container
        tw="flex flex-col justify-center h-full w-full px-4 gap-[3px] rounded-lg border border-[rgba(255,255,255,0.25)] bg-[rgba(10,10,10,0.75)] backdrop-blur-md"
        style={{ backgroundImage: "url(root-bg)", backgroundSize: "100% 100%" }}
      >
        <text tw="text-[13px] font-bold text-white">{n.summary}</text>
        {n.body ? <text tw="text-[12px] text-[rgba(255,255,255,0.75)]">{n.body}</text> : <container />}
      </container>
    </panel>
  );
}
