packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}

variable "project_id" {
  type = string
}
variable "source_image" {
  type = string
}
variable "region" {
  type = string
}


source "googlecompute" "game_instance" {
  project_id   = var.project_id
  source_image = var.source_image
  zone         = "${var.region}-a"
  ssh_username = "packer"
}

build {
  sources = ["source.googlecompute.game_instance"]

  provisioner "shell" {
    scripts = [
      "./scripts/install-docker.sh",
      "./scripts/setup-firewall.sh",
      "./scripts/setup-game-user.sh",
    ]
  }

  provisioner "file" {
    source      = "./scripts/bootstrap.sh"
    destination = "/tmp/"
  }
  provisioner "shell" {
    inline = [
      "mkdir -p /opt",
      "sudo mv /tmp/bootstrap.sh /opt/bootstrap.sh",
      "sudo chmod +x /opt/bootstrap.sh"
    ]
  }
}
