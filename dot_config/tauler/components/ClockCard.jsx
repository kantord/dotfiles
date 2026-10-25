import { SidebarSection, Clock } from "@gh/kantord/dotfiles-tauler";

export default function ClockCard() {
  return (
    <SidebarSection>
      <span class="text-[10px] text-muted-foreground">Time</span>
      <Clock>{time => <span class="text-[14px] text-foreground">{time ?? ""}</span>}</Clock>
    </SidebarSection>
  );
}
