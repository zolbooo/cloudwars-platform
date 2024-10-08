resource "google_project_service" "firestore-api" {
  service = "firestore.googleapis.com"
}

resource "google_firestore_database" "game_database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.firestore-api]
}
