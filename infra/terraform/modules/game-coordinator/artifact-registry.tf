resource "google_project_service" "artifact-registry" {
  project            = var.project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = true
}

resource "google_artifact_registry_repository" "app" {
  project  = var.project_id
  location = var.region

  repository_id = "app"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact-registry]
}
