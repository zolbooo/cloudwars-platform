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

# Allow impersonation in order to allow game coordinator to create Cloud Tasks
# Read more: https://github.com/googleapis/nodejs-tasks/issues/249#issuecomment-1095054277
resource "google_service_account_iam_member" "game_background_tasks_impersonation" {
  service_account_id = google_service_account.game_background_tasks.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${var.game_coordinator_service_account_email}"
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
        name  = "CHECKER_DISPATCHER_JOB_NAME"
        value = google_cloud_run_v2_job.dispatcher.id
      }

      env {
        name  = "BACKGROUND_TASKS_SERVICE_ACCOUNT_EMAIL"
        value = google_service_account.game_background_tasks.email
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

      env {
        name  = "GAME_BACKGROUND_TASKS_QUEUE_NAME"
        value = "projects/${var.project_id}/locations/${var.region}/queues/${google_cloud_tasks_queue.game_background_tasks.name}"
      }
      env {
        name  = "ROUND_PROGRESS_JOB_NAME"
        value = "projects/${var.project_id}/locations/${var.region}/jobs/${google_cloud_scheduler_job.round_progress.name}"
      }

      env {
        name  = "APP_ORIGIN"
        value = var.app_origin
      }
    }
    scaling {
      min_instance_count = var.production_mode ? 1 : 0
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
