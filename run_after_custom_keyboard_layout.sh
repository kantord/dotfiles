#!/bin/bash

set -e

if ! command -v setxkbmap &> /dev/null; then
    exit 0
fi

cat <<END > /tmp/__my_custom_keyboard_layout
partial alphanumeric_keys
xkb_symbols "my_customizations" {
    include "us(basic)" 
    include "level3(ralt_switch)" 
    
    // Swap Caps Lock and Escape
    key <CAPS> { [ Escape ] }; 
    key <ESC> { [ Caps_Lock ] };

    // Swap Alt with Left Ctrl and Alt Gr with Right Ctrl
    key <LALT> { [ Control_L, Control_L ] };
    key <LCTL> { [ Alt_L ] };
    key <RALT> { [ Control_R, Control_R ] };
    key <RCTL> { [ ISO_Level3_Shift ] };
    key <LSGT> { [ ISO_Level3_Shift ] };
    
    // Add any other custom key definitions here
    key <AD03> { [	  e,          E,        eacute,           Eacute ] };
    key <AD07> { [	  u,          U,        uacute,           Uacute ] };
    key <AD08> { [	  i,          I,        iacute,           Iacute ] };
    key <AD09> { [	  o,          O,        oacute,           Oacute ] };
    key <AC01> { [	  a,          A,        aacute,           Aacute ] };
    key <AD06> { [	  y,          Y,    udiaeresis,       Udiaeresis ] };
    key <AD10> { [	  p,          P,    odiaeresis,       Odiaeresis ] };
    key <AC05> { [	  g,          G,             udoubleacute,                Udoubleacute ] };
    key <AC06> { [	  h,          H,             odoubleacute,                Odoubleacute ] };
    key <AB06>  { [         n,          N,      ntilde,           Ntilde ] };
    key <AB03> { [            c,            C,        ccedilla,         Ccedilla ] };
    key <AB04> { [            v,            V,        scedilla,         Scedilla ] };
    key <AC07> { [	  j,          J,             idotless,                Iabovedot ] };
    key <AB05> { [            b,            B,        gbreve,         Gbreve ] };
};
END

sudo cp -f /tmp/__my_custom_keyboard_layout /usr/share/X11/xkb/symbols/mylayout
setxkbmap -layout mylayout -variant my_customizations
