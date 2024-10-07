resource "google_compute_network" "game_network" {
  project = var.project_id
  name    = "game-network"

  auto_create_subnetworks = false
}
