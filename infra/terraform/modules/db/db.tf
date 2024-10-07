resource "google_firestore_database" "game_database" {
  project     = var.project_id
  name        = "game-database"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}
