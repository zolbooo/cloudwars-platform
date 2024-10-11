resource "google_service_account" "service_account" {
  account_id   = "team-${var.team_index}-service-account"
  display_name = "Team ${var.team_index} Service Account"
}

resource "google_compute_instance" "game_instance" {
  name         = "team-${var.team_index}-instance"
  machine_type = "e2-micro"
  zone         = "${var.region}-a"

  boot_disk {
    initialize_params {
      image = "packer-1728555415"
      size  = 20
    }
  }

  metadata = {
    "ssh-key-secret-name" = google_secret_manager_secret.instance_ssh_key.secret_id
  }
  metadata_startup_script = "sudo -u packer bash /home/packer/bootstrap.sh"

  network_interface {
    network    = var.network_name
    subnetwork = google_compute_subnetwork.team_subnet.name
    network_ip = module.instance_address.addresses[0]
    access_config {
      nat_ip = google_compute_address.game_instance_public_ip.address
    }
  }

  service_account {
    email  = google_service_account.service_account.email
    scopes = ["cloud-platform"]
  }

  labels = {
    "purpose" = "game-instance"
    "team_id" = "${var.team_index}"
  }

  lifecycle {
    ignore_changes = [metadata]
  }
}
