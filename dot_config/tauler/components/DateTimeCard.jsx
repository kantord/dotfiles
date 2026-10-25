import { ink } from './ink.jsx';
import { SidebarSection, Clock } from "@gh/kantord/dotfiles-tauler";
function Cell({ label, value }) {
  return (
    <div class="flex-1 flex flex-col gap-1">
      <span class="text-[10px]" style={{color: ink(0.40)}}>{label}</span>
      <span class="text-[14px]" style={{color: ink(0.92)}}>{value ?? ''}</span>
    </div>
  );
}

export default function DateTimeCard() {
  return (
    <SidebarSection class="flex-row">
      <Clock>{t => <Cell label="TIME" value={t} />}</Clock>
    </SidebarSection>
  );
}
