#!/bin/sh
export DISPLAY=:0.0
xinit -e matchbox-window-manager-2-simple -use_titlebar no -- -nocursor &
xset dpms force off &
xset s off &
xset s noblank &
cd ./server;./startServer.sh $1 :0.0
