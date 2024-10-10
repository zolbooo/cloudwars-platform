#!/usr/bin/env bash
set -e

sudo useradd -m -s /bin/bash game
sudo usermod -aG docker game
echo 'game ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/game

sudo -u game mkdir -p /home/game/.ssh
sudo -u game ssh-keygen -t ed25519 -f /home/game/.ssh/instance.key -N ""
sudo -u game mv /home/game/.ssh/{instance.key.pub,authorized_keys}
sudo -u game chmod -R 700 /home/game/.ssh

SSH_KEY_SECRET_NAME=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/ssh-key-secret-name" -H "Metadata-Flavor: Google")
sudo -u game gcloud secrets versions add team-1-ssh-key --data-file=/home/game/.ssh/instance.key
sudo -u game shred -u /home/game/.ssh/instance.key

# See: https://stackoverflow.com/questions/8981164/self-deleting-shell-script/34303677#34303677
function selfdestruct() {
	shred -u "${0}"
}
trap selfdestruct EXIT
