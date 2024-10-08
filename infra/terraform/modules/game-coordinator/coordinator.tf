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
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_artifact_registry_repository_name}/game-coordinator:latest"

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GAME_KEY_RING_NAME"
        value = google_kms_key_ring.game_key_ring.name
      }
      env {
        name  = "FLAG_KEY_NAME"
        value = google_kms_crypto_key.flag_key.name
      }
      env {
        name  = "FLAG_KEY_REGION"
        value = google_kms_key_ring.game_key_ring.location
      }

      env {
        name  = "CHECKER_SERVICE_ACCOUNT_EMAIL"
        value = google_service_account.service-checker.email
      }
    }
  }

  deletion_protection = var.production_mode
  depends_on          = [google_project_service.run-api]
}

# Allow public access to the game coordinator
resource "google_cloud_run_service_iam_binding" "game_coordinator" {
  location = google_cloud_run_v2_service.game_coordinator.location
  service  = google_cloud_run_v2_service.game_coordinator.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}
