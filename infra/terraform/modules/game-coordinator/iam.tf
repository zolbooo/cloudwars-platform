resource "google_service_account" "service-checker" {
  account_id  = "service-checker"
  description = "Service account used by the service checkers"
}

resource "google_project_iam_member" "game_coordinator_firestore-user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${var.game_coordinator_service_account_email}"
}

resource "google_project_iam_member" "game_coordinator_instance-lister" {
  project = var.project_id
  role    = "roles/compute.viewer"
  member  = "serviceAccount:${var.game_coordinator_service_account_email}"
}

resource "google_project_iam_custom_role" "firewall_editor" {
  role_id     = "firewall_editor"
  title       = "Firewall Editor"
  description = "Allows updating a firewall rule"
  permissions = [
    "compute.firewalls.update",
  ]
}
resource "google_project_iam_member" "game_coordinator-firewall_editor" {
  project = var.project_id
  role    = google_project_iam_custom_role.firewall_editor.id
  member  = "serviceAccount:${var.game_coordinator_service_account_email}"
  condition {
    title       = "Only allow updates to the game instances firewall"
    description = "Only allow updates to the game instances firewall"
    expression  = "resource.name.startsWith(\"projects/${var.project_id}/global/firewalls/game-instances-\")"
  }
}
