import { SidebarSection, ClaudeUsage } from "@gh/kantord/dotfiles-tauler";
import { Progress } from "@ui/progress";
import { formatDuration } from "../lib/formatDuration.js";

const WARN_PERCENT = 70;
const CRITICAL_PERCENT = 90;

function usageColor(percent) {
  const colors = ctx.theme.colors;
  if (percent >= CRITICAL_PERCENT) return colors["ansi-red"];
  if (percent >= WARN_PERCENT) return colors["ansi-yellow"];
  return colors["ansi-green"];
}

function AccountUsage({ account }) {
  const color = usageColor(account.percent);
  return (
    <div class="flex flex-col gap-[6px]">
      <span class="text-[10px] text-muted-foreground">Claude · {account.label}</span>
      <div class="flex flex-row items-baseline justify-between">
        <span class="text-[15px] font-bold" style={{ color }}>{account.percent}%</span>
        <span class="text-[10px] text-muted-foreground">resets {formatDuration(account.resetsIn)}</span>
      </div>
      <Progress value={account.percent} color={color} />
    </div>
  );
}

export default function ClaudeUsageCard() {
  return (
    <ClaudeUsage>
      {accounts => accounts.length === 0 ? null : (
        <SidebarSection>
          {accounts.map(account => <AccountUsage account={account} />)}
        </SidebarSection>
      )}
    </ClaudeUsage>
  );
}
