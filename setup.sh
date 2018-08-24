#!/bin/sh
echo "INSTALL JETSONJS DEPENDANCIES"
echo "SHOULD RUN ON THE JETSON TX2"
#
echo "INSTALL USEFULL STUFFS"
sudo apt-get install nano firefox
#
echo "REMOVE USELESS STUFFS"
sudo apt-get remove cups unity
sudo apt-get remove lightdm
sudo apt-get autoremove
sudo apt-get autoclean
#
echo "INSTALL MATCHBOX WINDOW MANAGER"
mkdir ~/src
cd ~/src
git clone https://git.yoctoproject.org/git/matchbox-window-manager-2
cd matchbox-window-manager-2
sudo apt-get install libxft2 libxft-dev libxcursor-dev libxcursor1 libpng12-dev
./autogen.sh
./configure LIBS=-lexpat
make
sudo make install
#
echo "INSTALL ELECTRON"
sudo apt-get install curl
cd ~/src
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install npm --global
sudo npm install -g electron --unsafe-perm=true --allow-root