#!/usr/bin/env bash

# Array of radio stations
radio_stations=(
    "https://stream.rekt.network/rekt.ogg"
    "https://stream.rekt.network/spacesynth.ogg"
    "https://stream.rekt.network/datawave.ogg"
    "https://stream.rekt.network/nightride.ogg"
    "https://stream.rekt.network/chillsynth.ogg"
    "https://stream.rekt.network/darksynth.ogg"
    "https://stream.rekt.network/horrorsynth.ogg"
    "https://stream.rekt.network/ebsm.ogg"
    "https://stream.rekt.network/rektory.ogg"
)

# Get the currently playing station
current_station=$(mpc -f %file% current)

# Find the index of the current station in the list
current_index=-1
for i in "${!radio_stations[@]}"; do
    if [[ "${radio_stations[$i]}" = "${current_station}" ]]; then
        current_index=$i
        break
    fi
done

# Define next and previous station index
next_index=$(( (current_index + 1) % ${#radio_stations[@]} ))
prev_index=$(( (current_index - 1 + ${#radio_stations[@]}) % ${#radio_stations[@]} ))

case $1 in
    next)
        mpc clear
        mpc add "${radio_stations[$next_index]}"
        mpc play
        ;;
    prev)
        mpc clear
        mpc add "${radio_stations[$prev_index]}"
        mpc play
        ;;
    *)
        echo "Invalid argument. Please provide 'next' or 'prev'."
        exit 1
        ;;
esac
