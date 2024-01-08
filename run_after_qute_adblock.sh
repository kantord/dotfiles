#!/bin/bash


if command -v qutebrowser >/dev/null 2>&1; then
  qutebrowser ":adblock-update"
fi
