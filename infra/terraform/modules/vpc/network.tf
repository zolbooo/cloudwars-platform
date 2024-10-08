resource "google_project_service" "compute-api" {
  project = var.project_id
  service = "compute.googleapis.com"
}

resource "google_compute_network" "game_network" {
  project = var.project_id
  name    = "game-network"

  auto_create_subnetworks = false

  depends_on = [google_project_service.compute-api]
}
