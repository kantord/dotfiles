#!/bin/bash
# Save as /usr/local/bin/refresh-all-i3-windows

# Get all visible window IDs
visible_windows=$(DISPLAY=:0 xdotool search --onlyvisible --name ".")

# For each visible window
for window in $visible_windows; do
    echo "Refreshing window $window"
    DISPLAY=:0 xdotool windowactivate $window
    DISPLAY=:0 xdotool windowfocus $window
done


# # Finally, return focus to the originally active window (first in the list)
# if [ ! -z "$visible_windows" ]; then
#     first_window=$(echo $visible_windows | cut -d' ' -f1)
#     DISPLAY=:0 xdotool windowactivate $first_window
# fi
