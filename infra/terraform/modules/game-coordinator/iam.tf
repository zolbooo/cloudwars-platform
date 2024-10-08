resource "google_project_iam_member" "game_coordinator_firestore-user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.game_coordinator.email}"
}
