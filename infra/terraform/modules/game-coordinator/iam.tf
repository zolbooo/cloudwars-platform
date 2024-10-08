resource "google_service_account" "service-checker" {
  account_id  = "service-checker"
  description = "Service account used by the service checkers"
}

resource "google_project_iam_member" "game_coordinator_firestore-user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.game_coordinator.email}"
}
