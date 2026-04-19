const poll = (cmd) => useStringStream("/usr/bin/bash", `while true; do ${cmd}; sleep 1; done`);

function Card({ label, content }) {
  return (
    <container tw="flex flex-col gap-1 rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md px-3 py-[10px]">
      <text tw="text-[10px] text-[rgba(255,255,255,0.9)]">{label}</text>
      <text tw="text-[14px] text-white">{content}</text>
    </container>
  );
}

export default function BashCard({ label, cmd }) {
  return <Card label={label} content={poll(cmd)} />;
}
