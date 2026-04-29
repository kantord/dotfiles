import { Card } from '@ui/card';

const poll = (cmd) => useStringStream("/usr/bin/bash", `while true; do ${cmd}; sleep 1; done`);

export default function BashCard({ label, cmd }) {
  return (
    <Card>
      <text tw="text-[10px] text-foreground">{label}</text>
      <text tw="text-[14px] text-foreground">{poll(cmd)}</text>
    </Card>
  );
}
