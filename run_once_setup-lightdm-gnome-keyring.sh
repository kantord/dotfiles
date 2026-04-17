#!/bin/bash
# Add gnome-keyring PAM integration to LightDM for keyring auto-unlock at login
if ! grep -q "pam_gnome_keyring" /etc/pam.d/lightdm; then
    sudo sed -i \
        -e '/^auth.*system-login/a auth       optional     pam_gnome_keyring.so' \
        -e '/^session.*system-login/a session    optional     pam_gnome_keyring.so auto_start' \
        /etc/pam.d/lightdm
fi
