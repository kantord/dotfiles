#!/bin/bash

notify-send "Setting brightness to $1%"
ddcutil set 10 $1

