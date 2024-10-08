resource "google_project_iam_member" "game_coordinator_firestore-user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.game_coordinator.email}"
}

resource "google_service_account" "dispatcher" {
  account_id  = "dispatcher"
  description = "Service account used by the checker dispatcher"
}
