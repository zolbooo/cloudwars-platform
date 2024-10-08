resource "google_service_account" "dispatcher" {
  account_id  = "dispatcher"
  description = "Service account used by the checker dispatcher"
}

resource "google_cloud_run_v2_job" "dispatcher" {
  name     = "checker-dispatcher"
  location = var.region

  template {
    template {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_artifact_registry_repository_name}/checker-dispatcher:latest"

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCP_REGION"
          value = var.region
        }

        env {
          name  = "CHECKER_KEY_RING_NAME"
          value = google_kms_key_ring.game_key_ring.name
        }
        env {
          name  = "CHECKER_KEY_REGION"
          value = google_kms_key_ring.game_key_ring.location
        }
        env {
          name  = "CHECKER_FLAG_KEY_NAME"
          value = google_kms_crypto_key.flag_key.name
        }
      }
      service_account = google_service_account.dispatcher.email
    }
  }

  deletion_protection = var.production_mode
}

resource "google_project_iam_custom_role" "run_jobs_dispatcher" {
  project     = var.project_id
  role_id     = "run_jobs_dispatcher"
  title       = "Cloud Run Jobs dispatcher"
  description = "Allows listing and invoking Cloud Run jobs"
  permissions = [
    "run.jobs.list",
    "run.jobs.get",
    "run.jobs.run",
    "run.jobs.runWithOverrides",
  ]
}
resource "google_project_iam_member" "dispatcher-run_jobs_dispatcher" {
  project = var.project_id
  role    = google_project_iam_custom_role.run_jobs_dispatcher.id
  member  = "serviceAccount:${google_service_account.dispatcher.email}"
}
