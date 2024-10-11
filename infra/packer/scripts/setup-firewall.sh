#!/usr/bin/env bash
set -e

sudo ufw deny from 10.124.0.0/16 to any port 22
sudo ufw allow ssh

echo "y" | sudo ufw enable
