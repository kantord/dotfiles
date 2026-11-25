import { I3Config, Bindcode, Bindsym, Blank, Comment, Exec, FloatingModifier, Font, ForWindow, Include, Mode, Set, SmartBorders, TitleAlign, WorkspaceOutput } from "@gh/kantord/dotfiles-tauler";

// The i3 config, ported from the hand-written one. Written to `config.tauler` beside the live
// `~/.config/i3/config` so the two can be diffed before this takes over the real path; it
// never touches the live config and never reloads i3.
export default function I3ConfigUnit() {
  return (
    <I3Config path="~/.config/i3/config.tauler">
      <Comment text={"i3 config — managed by chezmoi (dot_config/i3/config in the dotfiles source). Edit the"} />
      <Comment text={"source and run `chezmoi apply` (which restarts i3); do not edit ~/.config/i3/config."} />
      <Blank />
      <Comment text={"i3 config file (v4)"} />
      <Comment text={""} />
      <Comment text={"Please see https://i3wm.org/docs/userguide.html for a complete reference!"} />
      <Blank />
      <Set name={"$mod"} value={"Mod4"} />
      <Blank />
      <Comment text={"Font for window titles. There is no i3bar: tauler draws the bar."} />
      <Font value={"pango:MonaspiceXe Nerd Font Mono 16px"} />
      <Blank />
      <Comment text={"Start XDG autostart .desktop files using dex. See also"} />
      <Comment text={"https://wiki.archlinux.org/index.php/XDG_Autostart"} />
      <Exec command={"dex --autostart --environment i3"} noStartupId />
      <Blank />
      <Comment text={"NetworkManager is the most popular way to manage wireless networks on Linux,"} />
      <Comment text={"and nm-applet is a desktop environment-independent system tray GUI for it."} />
      <Exec command={"nm-applet"} noStartupId />
      <Exec command={"/usr/lib/mate-polkit/polkit-mate-authentication-agent-1"} noStartupId />
      <Exec command={"~/.cargo/bin/tauler"} noStartupId />
      <Comment text={"Dictation daemon. Started via the script so the capture-device pin lives in one place."} />
      <Exec command={"bash $HOME/.config/i3/voxtype_daemon.sh start"} noStartupId />
      <Blank />
      <Comment text={"Pre-load the knob-click sample into PulseAudio's sample cache once at"} />
      <Comment text={"startup — `pactl play-sample` then triggers it with ~5ms latency (vs ~390ms"} />
      <Comment text={"for `paplay` decoding the file fresh each time), since it's just a message"} />
      <Comment text={"to the already-running daemon rather than a new process+connection+decode."} />
      <Comment text={"The sample is pre-attenuated to 30% rather than turned down at playback:"} />
      <Comment text={"`pactl play-sample` takes only NAME and SINK, no volume, and switching to a"} />
      <Comment text={"player that accepts one would give back the latency this design exists for."} />
      <Comment text={"Derived from kenney_ui-audio/Audio/switch16.ogg with `ffmpeg -af volume=0.2`."} />
      <Exec command={"pactl upload-sample $HOME/.config/i3/sounds/workspace-switch-click.ogg workspace-switch-click"} noStartupId />
      <Blank />
      <Comment text={"Use pactl to adjust volume in PulseAudio."} />
      <Bindsym keys={"XF86AudioRaiseVolume"} command={"exec --no-startup-id pactl set-sink-volume @DEFAULT_SINK@ +10%"} />
      <Bindsym keys={"XF86AudioLowerVolume"} command={"exec --no-startup-id pactl set-sink-volume @DEFAULT_SINK@ -10%"} />
      <Bindsym keys={"XF86AudioMute"} command={"exec --no-startup-id pactl set-sink-mute @DEFAULT_SINK@ toggle"} />
      <Bindsym keys={"XF86AudioMicMute"} command={"exec --no-startup-id pactl set-source-mute @DEFAULT_SOURCE@ toggle"} />
      <Bindsym keys={"XF86AudioPlay"} command={"exec playerctl play-pause"} />
      <Bindsym keys={"XF86AudioNext"} command={"exec playerctl next"} />
      <Bindsym keys={"XF86AudioPrev"} command={"exec playerctl previous"} />
      <Blank />
      <Comment text={"Take screenshots"} />
      <Bindsym keys={"$mod+Print"} command={"exec scrot -e 'mv $f ~/Pictures/Screenshots'"} release />
      <Bindsym keys={"$mod+Shift+Print"} command={"exec scrot -s -e 'mv $f ~/Pictures/Screenshots'"} release />
      <Bindsym keys={"$mod+Shift+s"} command={"exec --no-startup-id ~/.config/i3/screenshot-region.sh"} />
      <Blank />
      <Comment text={"Copy the path of a recently edited / downloaded file via rofi."} />
      <Bindsym keys={"$mod+y"} command={"exec --no-startup-id ~/.config/i3/rofi_recent_files.sh"} />
      <Blank />
      <Bindsym keys={"$mod+u"} command={"fullscreen toggle"} />
      <Blank />
      <Blank />
      <Blank />
      <Comment text={"Use Mouse+$mod to drag floating windows to their wanted position"} />
      <FloatingModifier value={"$mod"} />
      <Blank />
      <Comment text={"start a terminal"} />
      <Comment text={"Try the enwiro-aware terminal first (kitty template: host kitty wrapping the"} />
      <Comment text={"active env's shell, containerized when an image exists); fall back to the"} />
      <Comment text={"generic launcher if kitty isn't available."} />
      <Bindsym keys={"$mod+Return"} command={"exec ~/.cargo/bin/enw wrap kitty -- -1 || i3-sensible-terminal"} />
      <Blank />
      <Comment text={"kill focused window"} />
      <Bindsym keys={"$mod+Shift+q"} command={"kill"} />
      <Blank />
      <Bindsym keys={"$mod+d"} command={"[urgent=latest] focus"} />
      <Blank />
      <Blank />
      <Comment text={"change focus"} />
      <Bindsym keys={"$mod+h"} command={"focus left"} />
      <Bindsym keys={"$mod+j"} command={"focus down"} />
      <Bindsym keys={"$mod+k"} command={"focus up"} />
      <Bindsym keys={"$mod+l"} command={"focus right"} />
      <Blank />
      <Comment text={"Go to previous workspace"} />
      <Bindsym keys={"$mod+o"} command={"workspace back_and_forth"} />
      <Comment text={"Knob 3. Direction matches the brightness knobs in the mode blocks below."} />
      <Comment text={"Via a script rather than prev/next_on_output, which wrap around."} />
      <Bindsym keys={"$mod+i"} command={"exec --no-startup-id bash $HOME/.config/i3/workspace_step.sh prev"} />
      <Bindsym keys={"$mod+Shift+i"} command={"exec --no-startup-id bash $HOME/.config/i3/workspace_step.sh next"} />
      <Blank />
      <Comment text={"Open applications"} />
      <Bindsym keys={"$mod+Escape"} command={"exec ~/.cargo/bin/enw wrap rofi -- -show combi -matching fuzzy"} />
      <Bindsym keys={"Mod1+space"} command={"exec ~/.cargo/bin/enw wrap rofi -- -show combi -matching fuzzy"} />
      <Bindsym keys={"Mod5+space"} command={"exec ~/.cargo/bin/enw wrap rofi -- -show combi -matching fuzzy"} />
      <Bindsym keys={"Control+space"} command={"exec ~/.cargo/bin/enw wrap rofi -- -show combi -matching fuzzy"} />
      <Bindsym keys={"Control+Escape"} command={"exec \"$HOME/.cargo/bin/wmfocus --halign center --valign center --font 'Mono:128' --textcolor red\""} />
      <Bindsym keys={"$mod+Shift+Escape"} command={"exec rofi -show enwiro -modi \"enwiro:$HOME/.cargo/bin/enwiro-bridge-rofi\" -matching fuzzy -no-sort"} />
      <Blank />
      <Blank />
      <Blank />
      <Comment text={"alternatively, you can use the cursor keys:"} />
      <Bindsym keys={"$mod+Left"} command={"focus left"} />
      <Bindsym keys={"$mod+Down"} command={"focus down"} />
      <Bindsym keys={"$mod+Up"} command={"focus up"} />
      <Bindsym keys={"$mod+Right"} command={"focus right"} />
      <Blank />
      <Comment text={"move focused window"} />
      <Bindsym keys={"$mod+Shift+h"} command={"move left"} />
      <Bindsym keys={"$mod+Shift+j"} command={"move down"} />
      <Bindsym keys={"$mod+Shift+k"} command={"move up"} />
      <Bindsym keys={"$mod+Shift+l"} command={"move right"} />
      <Blank />
      <Comment text={"alternatively, you can use the cursor keys:"} />
      <Bindsym keys={"$mod+Shift+Left"} command={"move left"} />
      <Bindsym keys={"$mod+Shift+Down"} command={"move down"} />
      <Bindsym keys={"$mod+Shift+Up"} command={"move up"} />
      <Bindsym keys={"$mod+Shift+Right"} command={"move right"} />
      <Blank />
      <Comment text={"split in horizontal orientation"} />
      <Bindsym keys={"$mod+semicolon"} command={"split h"} />
      <Blank />
      <Comment text={"split in vertical orientation"} />
      <Bindsym keys={"$mod+v"} command={"split v"} />
      <Blank />
      <Comment text={"enter fullscreen mode for the focused container"} />
      <Bindsym keys={"$mod+f"} command={"fullscreen toggle"} />
      <Blank />
      <Comment text={"change container layout (stacked, tabbed, toggle split)"} />
      <Bindsym keys={"$mod+s"} command={"layout stacking"} />
      <Bindsym keys={"$mod+w"} command={"layout tabbed"} />
      <Bindsym keys={"$mod+e"} command={"layout toggle split"} />
      <Blank />
      <Comment text={"toggle tiling / floating"} />
      <Bindsym keys={"$mod+Shift+space"} command={"floating toggle"} />
      <Blank />
      <Comment text={"change focus between tiling / floating windows"} />
      <Bindsym keys={"$mod+space"} command={"focus mode_toggle"} />
      <Blank />
      <Comment text={"focus the parent container"} />
      <Bindsym keys={"$mod+a"} command={"focus parent"} />
      <Blank />
      <Comment text={"focus the child container"} />
      <Comment text={"bindsym $mod+d focus child"} />
      <Blank />
      <Comment text={"Define names for default workspaces for which we configure key bindings later on."} />
      <Comment text={"We use variables to avoid repeating the names in multiple places."} />
      <Set name={"$ws1"} value={"\"1\""} />
      <Set name={"$ws2"} value={"\"2\""} />
      <Set name={"$ws3"} value={"\"3\""} />
      <Set name={"$ws4"} value={"\"4\""} />
      <Set name={"$ws5"} value={"\"5\""} />
      <Set name={"$ws6"} value={"\"6\""} />
      <Set name={"$ws7"} value={"\"7\""} />
      <Set name={"$ws8"} value={"\"8\""} />
      <Set name={"$ws9"} value={"\"9\""} />
      <Set name={"$ws10"} value={"\"10\""} />
      <Blank />
      <Comment text={"switch to workspace"} />
      <Bindsym keys={"$mod+1"} command={"workspace number $ws1"} />
      <Bindsym keys={"$mod+2"} command={"workspace number $ws2"} />
      <Bindsym keys={"$mod+3"} command={"workspace number $ws3"} />
      <Bindsym keys={"$mod+4"} command={"workspace number $ws4"} />
      <Bindsym keys={"$mod+5"} command={"workspace number $ws5"} />
      <Bindsym keys={"$mod+6"} command={"workspace number $ws6"} />
      <Bindsym keys={"$mod+7"} command={"workspace number $ws7"} />
      <Bindsym keys={"$mod+8"} command={"workspace number $ws8"} />
      <Bindsym keys={"$mod+9"} command={"workspace number $ws9"} />
      <Bindsym keys={"$mod+0"} command={"workspace number $ws10"} />
      <Blank />
      <Comment text={"move focused container to workspace"} />
      <Bindsym keys={"$mod+Shift+1"} command={"move container to workspace number $ws1"} />
      <Bindsym keys={"$mod+Shift+2"} command={"move container to workspace number $ws2"} />
      <Bindsym keys={"$mod+Shift+3"} command={"move container to workspace number $ws3"} />
      <Bindsym keys={"$mod+Shift+4"} command={"move container to workspace number $ws4"} />
      <Bindsym keys={"$mod+Shift+5"} command={"move container to workspace number $ws5"} />
      <Bindsym keys={"$mod+Shift+6"} command={"move container to workspace number $ws6"} />
      <Bindsym keys={"$mod+Shift+7"} command={"move container to workspace number $ws7"} />
      <Bindsym keys={"$mod+Shift+8"} command={"move container to workspace number $ws8"} />
      <Bindsym keys={"$mod+Shift+9"} command={"move container to workspace number $ws9"} />
      <Bindsym keys={"$mod+Shift+0"} command={"move container to workspace number $ws10"} />
      <Blank />
      <Comment text={"reload the configuration file"} />
      <Bindsym keys={"$mod+Shift+c"} command={"reload"} />
      <Comment text={"restart i3 inplace (preserves your layout/session, can be used to upgrade i3)"} />
      <Bindsym keys={"$mod+Shift+r"} command={"restart"} />
      <Comment text={"exit i3 (logs you out of your X session)"} />
      <Bindsym keys={"$mod+Shift+e"} command={"exec \"i3-nagbar -t warning -m 'You pressed the exit shortcut. Do you really want to exit i3? This will end your X session.' -B 'Yes, exit i3' 'i3-msg exit'\""} />
      <Blank />
      <Comment text={"resize window (you can also use the mouse for that)"} />
      <Mode name={"resize"}>
        <Bindsym keys={"h"} command={"resize shrink width 10 px or 10 ppt"} />
        <Bindsym keys={"j"} command={"resize grow height 10 px or 10 ppt"} />
        <Bindsym keys={"k"} command={"resize shrink height 10 px or 10 ppt"} />
        <Bindsym keys={"l"} command={"resize grow width 10 px or 10 ppt"} />
        <Bindsym keys={"Left"} command={"resize shrink width 10 px or 10 ppt"} />
        <Bindsym keys={"Down"} command={"resize grow height 10 px or 10 ppt"} />
        <Bindsym keys={"Up"} command={"resize shrink height 10 px or 10 ppt"} />
        <Bindsym keys={"Right"} command={"resize grow width 10 px or 10 ppt"} />
        <Bindsym keys={"Return"} command={"mode \"default\""} />
        <Bindsym keys={"Escape"} command={"mode \"default\""} />
        <Bindsym keys={"$mod+r"} command={"mode \"default\""} />
      </Mode>
      <Bindsym keys={"$mod+r"} command={"mode \"resize\""} />
      <Blank />
      <Comment text={"Screen brightness (ddcutil)"} />
      <Mode name={"brightness"}>
        <Bindsym keys={"a"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 10"} />
        <Bindsym keys={"s"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 20"} />
        <Bindsym keys={"d"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 30"} />
        <Bindsym keys={"f"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 40"} />
        <Bindsym keys={"g"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 50"} />
        <Bindsym keys={"h"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 60"} />
        <Bindsym keys={"j"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 70"} />
        <Bindsym keys={"k"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 80"} />
        <Bindsym keys={"l"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 90"} />
        <Bindsym keys={"semicolon"} command={"exec --no-startup-id bash $HOME/.config/i3/set_brightness.sh 100"} />
        <Comment text={"Knob 3 steps relative; the row above stays for absolute jumps."} />
        <Bindsym keys={"$mod+i"} command={"exec --no-startup-id bash $HOME/.config/i3/screen_brightness_step.sh down"} />
        <Bindsym keys={"$mod+Shift+i"} command={"exec --no-startup-id bash $HOME/.config/i3/screen_brightness_step.sh up"} />
        <Bindsym keys={"Return"} command={"mode \"default\""} />
        <Bindsym keys={"Escape"} command={"mode \"default\""} />
        <Bindsym keys={"$mod+b"} command={"mode \"default\""} />
        <Comment text={"Next step of the cycle: back out to wherever it started."} />
        <Bindcode keys={"199"} command={"exec --no-startup-id bash $HOME/.config/i3/mode_cycle.sh"} />
      </Mode>
      <Bindsym keys={"$mod+b"} command={"mode \"brightness\""} />
      <Blank />
      <Comment text={"Macropad F21 — see the note on keycode 200 below. Cycles:"} />
      <Comment text={"  here → screen brightness → back here"} />
      <Bindcode keys={"199"} command={"exec --no-startup-id bash $HOME/.config/i3/mode_cycle.sh"} />
      <Blank />
      <Comment text={"--- Recording mode ---"} />
      <Mode name={"recording"}>
        <Bindsym keys={"$mod+Shift+v"} command={"exec --no-startup-id ~/.config/i3/record-stop.sh"} />
      </Mode>
      <Comment text={"Enter recording mode + start capture (same key toggles on/off)"} />
      <Bindsym keys={"$mod+Shift+v"} command={"exec --no-startup-id ~/.config/i3/record-start.sh"} />
      <Blank />
      <Comment text={"--- Dictation mode (voxtype voice-to-text) ---"} />
      <Comment text={"mod+grave: start recording; same key / Return / Escape: stop and type"} />
      <Comment text={"Media playing at entry is paused and resumed on exit — see"} />
      <Comment text={"dictation_media.sh for why it can't just be `playerctl play-pause`."} />
      <Comment text={"Gated on the mode rather than on voice activity: mic VAD would flip-flop the"} />
      <Comment text={"music back on during every pause between sentences."} />
      <Mode name={"dictating"}>
        <Bindsym keys={"$mod+grave"} command={"exec --no-startup-id voxtype record stop, exec --no-startup-id ~/.config/i3/dictation_media.sh resume, mode \"default\""} />
        <Bindsym keys={"grave"} command={"exec --no-startup-id voxtype record stop, exec --no-startup-id ~/.config/i3/dictation_media.sh resume, mode \"default\""} />
        <Bindsym keys={"Return"} command={"exec --no-startup-id voxtype record stop, exec --no-startup-id ~/.config/i3/dictation_media.sh resume, mode \"default\""} />
        <Bindsym keys={"Escape"} command={"exec --no-startup-id voxtype record cancel, exec --no-startup-id ~/.config/i3/dictation_media.sh resume, mode \"default\""} />
      </Mode>
      <Bindsym keys={"$mod+grave"} command={"exec --no-startup-id voxtype record start, exec --no-startup-id ~/.config/i3/dictation_media.sh pause, mode \"dictating\""} />
      <Blank />
      <ForWindow criteria={"all"} command={"border pixel 1"} />
      <ForWindow criteria={"all"} command={"title_window_icon yes"} />
      <ForWindow criteria={"all"} command={"title_window_icon padding 1px"} />
      <Comment text={"gaps owned by tauler's <I3Layout>: the space its panels claim becomes the i3 gaps."} />
      <SmartBorders value={"on"} />
      <Blank />
      <Blank />
      <Blank />
      <Blank />
      <Bindsym keys={"$mod+M"} command={"exec --no-startup-id ~/.config/i3/move_workspace_to_output.sh"} />
      <Blank />
      <Blank />
      <Comment text={"Scratchpad apps"} />
      <ForWindow criteria={"class=\"^i3scratchpad$\""} command={"move scratchpad, sticky enable"} />
      <Exec command={"kitty -1 --class=i3scratchpad"} noStartupId />
      <Exec command={"kitty -1 --class=i3scratchpad --directory ~/.local/share/chezmoi claude"} noStartupId />
      <Bindsym keys={"$mod+n"} command={"scratchpad show"} />
      <Blank />
      <Comment text={"Zotero citation window"} />
      <ForWindow criteria={"title=\"^Quick Format Citation$\""} command={"floating enable, sticky enable"} />
      <Blank />
      <Blank />
      <Bindsym keys={"$mod+Next"} command={"exec --no-startup-id ~/.config/i3/radio_control.sh next"} release />
      <Bindsym keys={"$mod+Prior"} command={"exec --no-startup-id ~/.config/i3/radio_control.sh prev"} release />
      <Bindsym keys={"$mod+End"} command={"exec --no-startup-id mpc stop"} release />
      <Bindsym keys={"$mod+Home"} command={"exec --no-startup-id mpc toggle"} release />
      <Blank />
      <Comment text={"Hide trackball cursor after inactivity (seconds)"} />
      <Exec command={"unclutter --timeout 0.5"} noStartupId />
      <Blank />
      <Blank />
      <Comment text={"tauler-theme.conf is GENERATED by tauler's <I3Theme /> unit (see"} />
      <Comment text={"~/.config/tauler layout); edit the tauler layout, not the generated file."} />
      <Include value={"~/.config/i3/tauler-theme.conf"} />
      <Blank />
      <TitleAlign value={"center"} />
      <Blank />
      <Comment text={"TWP visual test: float Kitty windows so they don't disrupt tiling"} />
      <ForWindow criteria={"class=\"^twp-visual-test\""} command={"floating enable"} />
      <Blank />
      <Comment text={"Floating editor for qutebrowser"} />
      <ForWindow criteria={"class=\"^KittyFloatingNeovim$\" instance=\"^KittyFloatingNeovim$\""} command={"floating enable, sticky enable"} />
      <Blank />
      <Comment text={"PiP gets a dedicated screen: DP-3 (the small landscape display next to the 4K)."} />
      <WorkspaceOutput workspace={"."} outputs={["DP-3"]} />
      <Blank />
      <Comment text={"Automatically move Picture in Picture windows to workspace '.'"} />
      <ForWindow criteria={"title=\"Picture in picture\""} command={"move to workspace ."} />
      <Blank />
      <Comment text={"Force fullscreen mode for the PiP window"} />
      <ForWindow criteria={"title=\"Picture in picture\""} command={"fullscreen enable"} />
      <Blank />
      <Comment text={"Quickly switch to the PiP workspace"} />
      <Bindsym keys={"$mod+period"} command={"workspace ."} />
    </I3Config>
  );
}
