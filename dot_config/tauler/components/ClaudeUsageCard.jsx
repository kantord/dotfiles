import { SidebarSection, ClaudeUsage } from "@gh/kantord/dotfiles-tauler";
import { Progress } from '@ui/progress';

// `bin`: the reader script is still installed under its old name.
export default function ClaudeUsageCard() {
  return <ClaudeUsage>{accounts => <UsageSection accounts={accounts} />}</ClaudeUsage>;
}

function UsageSection({ accounts }) {
  if (accounts.length === 0) return null;
  // Status colours come from the theme's ANSI colours (red / yellow / green), so they stay legible in light and dark.
  return (
    <SidebarSection>
      {accounts.map(a => {
        const resetsStr = a.resetsIn < 3600
          ? `${Math.floor(a.resetsIn / 60)}m`
          : a.resetsIn < 86400
          ? `${Math.floor(a.resetsIn / 3600)}h`
          : `${Math.floor(a.resetsIn / 86400)}d`;
        const color = a.percent >= 90 ? ctx.theme.colors['ansi-red'] : a.percent >= 70 ? ctx.theme.colors['ansi-yellow'] : ctx.theme.colors['ansi-green'];
        return (
          <div class="flex flex-col gap-[6px]">
            <span class="text-[10px] text-muted-foreground">Claude · {a.label}</span>
            <div class="flex flex-row items-baseline justify-between">
              <span class="text-[15px] text-foreground font-bold" style={{ color }}>{a.percent}%</span>
              <span class="text-[10px] text-muted-foreground">resets {resetsStr}</span>
            </div>
            <Progress value={a.percent} color={color} />
          </div>
        );
      })}
    </SidebarSection>
  );
}
