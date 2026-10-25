import { OutputVolume, AudioChannels, SidebarSection } from "@gh/kantord/dotfiles-tauler";
import { Slider } from "@ui/slider";

const VOLUME_STEP = 5;

const isPlayingOutputStream = (channel) =>
  channel.type === "stream" && channel.kind === "output" && channel.state === "running";

function VolumeSlider({ value, muted, onChange }) {
  return <Slider value={muted ? 0 : value} min={0} max={100} step={VOLUME_STEP} on_change={onChange} />;
}

export default function VolumeCard() {
  return (
    <SidebarSection gap={10}>
      <OutputVolume>
        {(volume, actions) => (
          <div class="flex flex-col gap-[6px] w-full">
            <div class="flex flex-row items-baseline justify-between w-full">
              <div on_click={[actions.toggleMute()]}>
                <span class="text-[10px] text-muted-foreground">{volume?.muted ? "Volume · muted" : "Volume"}</span>
              </div>
              <span class="text-[10px] text-muted-foreground">{volume?.volume ?? 0}%</span>
            </div>
            <VolumeSlider value={volume?.volume ?? 0} muted={volume?.muted} onChange={actions.setVolume} />
          </div>
        )}
      </OutputVolume>
      <AudioChannels>
        {(channels, actions) => channels.filter(isPlayingOutputStream).map(channel => (
          <VolumeSlider value={channel.volume} muted={channel.muted}
                        onChange={level => actions.setVolume(channel.id, level)} />
        ))}
      </AudioChannels>
    </SidebarSection>
  );
}
