resource "google_project_service" "run-api" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_service_account" "game_coordinator" {
  account_id = "game-coordinator"
}

resource "google_cloud_run_v2_service" "game_coordinator" {
  name     = "game-coordinator"
  location = var.region

  template {
    service_account = google_service_account.game_coordinator.email
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.name}/game-coordinator:latest"
    }
  }

  depends_on = [google_project_service.run-api]
}
