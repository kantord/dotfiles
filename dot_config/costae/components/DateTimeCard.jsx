import { Card } from '@ui/card';

function Cell({ label, cmd }) {
  return (
    <container tw="flex-1 flex flex-col gap-1">
      <text tw="text-[10px] text-foreground">{label}</text>
      <text tw="text-[14px] text-foreground">{useStringStream("/usr/bin/bash", `while true; do ${cmd}; sleep 1; done`)}</text>
    </container>
  );
}

export default function DateTimeCard() {
  return (
    <Card tw="flex flex-row gap-[10px] w-full">
      <Cell label="DATE" cmd={`date +"%b %-d"`} />
      <Cell label="TIME" cmd={`date +"%H:%M"`} />
    </Card>
  );
}
