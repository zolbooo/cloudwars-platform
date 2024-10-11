#!/usr/bin/env bash
set -e

sudo useradd -m -s /bin/bash game
sudo usermod -aG docker game
echo 'game ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/game
