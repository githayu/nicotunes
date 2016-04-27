#!/bin/bash

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb http://download.mono-project.com/repo/debian wheezy main" | sudo tee /etc/apt/sources.list.d/mono-xamarin.list
sudo add-apt-repository -y ppa:ubuntu-wine/ppa
sudo gpg --keyserver pgp.mit.edu --recv-keys 749D6EEC0353B12C
sudo gpg --export --armor 749D6EEC0353B12C | sudo apt-key add -
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install expect
expect ./scripts/installer-script.exp
gem install fpm
