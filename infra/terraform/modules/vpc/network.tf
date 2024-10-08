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

resource "google_compute_subnetwork" "checker_subnet" {
  project = var.project_id
  region  = var.region

  name          = "checker-subnet"
  ip_cidr_range = "10.124.255.0/24"
  network       = google_compute_network.game_network.name
}
