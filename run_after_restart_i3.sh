#!/bin/bash

# Check if the i3-msg command exists
if command -v i3-msg >/dev/null 2>&1; then
    # If i3-msg exists, restart i3
    i3-msg restart
fi
