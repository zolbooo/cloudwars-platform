resource "google_project_service" "run-api" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_secret_manager_secret" "auth_secret" {
  secret_id = "game-coordinator-auth-secret"
  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_iam_member" "game_coordinator_auth_secret_reader" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.auth_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.game_coordinator_service_account_email}"
}

resource "google_cloud_run_v2_service" "game_coordinator" {
  name     = "game-coordinator"
  location = var.region

  template {
    service_account = var.game_coordinator_service_account_email
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

      env {
        name  = "GAME_INSTANCE_ZONE"
        value = "${var.region}-a"
      }

      env {
        name = "AUTH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.auth_secret.secret_id
            version = "latest"
          }
        }
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
