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
      image = "debian-cloud/debian-11"
      labels = {
        team_id = "${var.team_index}"
      }
      size = 10
    }
  }

  network_interface {
    network    = var.network_name
    subnetwork = google_compute_subnetwork.team_subnet.name
    network_ip = module.instance_address.addresses[0]
  }

  service_account {
    email  = google_service_account.service_account.email
    scopes = ["cloud-platform"]
  }

  tags = ["game-instance"]
}
