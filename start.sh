#!/bin/sh
export DISPLAY=:0.0
xinit -e matchbox-window-manager-2-simple -nocursor -use_titlebar no &
./server/startServer.sh  :0.0 2>/dev/null 1>/dev/null & 
