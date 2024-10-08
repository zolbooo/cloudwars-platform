resource "google_compute_firewall" "game_instances_allow_ssh" {
  name        = "game-instances-allow-ssh"
  network     = google_compute_network.game_network.name
  description = "Allow SSH connections to game instances"

  source_ranges = ["0.0.0.0/0"]
  direction     = "INGRESS"
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  target_tags = ["game-instance"]
}

resource "google_compute_firewall" "game_instances_allow_internal" {
  name        = "game-instances-allow-internal"
  network     = google_compute_network.game_network.name
  description = "Allow internal connections between game subnetworks"

  disabled           = true # Disable internal traffic by default, they will be enabled by the game coordinator
  source_ranges      = ["10.124.0.0/16"]
  destination_ranges = ["10.124.0.0/16"]
  direction          = "INGRESS"
  allow {
    protocol = "all"
  }

  target_tags = ["game-instance", "service-checker"]

  lifecycle {
    ignore_changes = [disabled] # Ignore changes to the disabled attribute, which is managed by the game coordinator
  }
}
