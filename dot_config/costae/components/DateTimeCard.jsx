function Cell({ label, cmd }) {
  return (
    <container tw="flex-1 flex flex-col gap-1">
      <text tw="text-[10px] text-[rgba(255,255,255,0.9)]">{label}</text>
      <text tw="text-[14px] text-white">{useStringStream("/usr/bin/bash", `while true; do ${cmd}; sleep 1; done`)}</text>
    </container>
  );
}

export default function DateTimeCard() {
  return (
    <container tw="flex flex-row gap-[10px] rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md px-3 py-[10px] w-full">
      <Cell label="DATE" cmd={`date +"%b %-d"`} />
      <Cell label="TIME" cmd={`date +"%H:%M"`} />
    </container>
  );
}
