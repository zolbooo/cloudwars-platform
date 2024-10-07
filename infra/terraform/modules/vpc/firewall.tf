resource "google_compute_firewall" "game_instances_allow_ssh" {
  name        = "game-instances-allow-ssh"
  network     = google_compute_network.game_network.name
  description = "Allow SSH connections from IAP to game instances"

  source_ranges = ["35.235.240.0/20"]
  direction     = "INGRESS"
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  target_tags = ["game-instance"]
}
