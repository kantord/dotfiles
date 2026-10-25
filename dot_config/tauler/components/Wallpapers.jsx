// `tauler:outputs` is tauler's built-in monitor list, so no output names are hard-coded.
export default function Wallpapers() {
  const outputs = useJSONStream("tauler:outputs") ?? [];
  return outputs.map(output => (
    <wallpaper id={`desktop-${output.name}`} output={output.name}>
      {/* Darker than the workspace area, which is drawn in plain `background`; less so in light mode, where muted text needs the contrast. */}
      <div class="relative flex w-full h-full bg-background">
        <div class="absolute inset-0 bg-black/5 dark:bg-black/20" />
      </div>
    </wallpaper>
  ));
}
