#!/bin/sh
killall node
killall Xorg
sleep 3
cd "$(dirname "$0")"
cd ..
./start.sh