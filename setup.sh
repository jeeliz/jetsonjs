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
#
echo "INSTALL NODE PACKAGES"
cd ~/jetsonjs/server
npm install
cd ../client/electron
npm install
#
echo "INSTALL CAMERA CONTROL"
cd ~/src
wget http://mirrors.kernel.org/ubuntu/pool/universe/libw/libwebcam/uvcdynctrl-data_0.2.4-1.1ubuntu1_all.deb
wget http://old-releases.ubuntu.com/ubuntu/pool/universe/libw/libwebcam/uvcdynctrl_0.2.4-1.1ubuntu1_arm64.deb
wget http://old-releases.ubuntu.com/ubuntu/pool/universe/libw/libwebcam/libwebcam0_0.2.4-1.1ubuntu1_arm64.deb
sudo dpkg -i uvcdynctrl-data_0.2.4-1.1ubuntu1_all.deb
sudo dpkg -i libwebcam0_0.2.4-1.1ubuntu1_arm64.deb
sudo dpkg -i uvcdynctrl_0.2.4-1.1ubuntu1_arm64.deb
#
echo "REMOVE .XINIT"
mv ~/.xinit ~/.xinit.bak 2>/dev/null
echo "/DONE, JETSONJS IS SETUPED NOW :)"
