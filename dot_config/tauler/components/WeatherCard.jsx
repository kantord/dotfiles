import { Weather, WeatherSummary, SidebarSection } from "@gh/kantord/dotfiles-tauler";

export default function WeatherCard() {
  return (
    <Weather>
      {weather => (
        <SidebarSection>
          <WeatherSummary {...weather} />
        </SidebarSection>
      )}
    </Weather>
  );
}
