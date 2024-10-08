resource "google_project_service" "artifact-registry" {
  project            = var.project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = true
}

resource "google_artifact_registry_repository" "checkers" {
  project  = var.project_id
  location = var.region

  repository_id = "checkers"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact-registry]
}

resource "google_artifact_registry_repository_iam_member" "gh_actions" {
  repository = google_artifact_registry_repository.checkers.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${module.ci.gh_actions_service_account_email}"
}
