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
      }
      service_account = google_service_account.dispatcher.email
    }
  }
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
