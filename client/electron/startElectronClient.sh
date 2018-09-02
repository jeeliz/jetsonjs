#!/bin/sh
# usage: ./startElectron.sh <pathOfSettings.js>
# settings.js is given without extension and from jetsonJS/server. default: ../settings
#
# Absolute path to this script. /home/user/bin/foo.sh:
SCRIPT=$(readlink -f $0)
# Absolute path this script is in /home/user/bin
SCRIPTPATH=`dirname $SCRIPT`
electron $SCRIPTPATH $1
