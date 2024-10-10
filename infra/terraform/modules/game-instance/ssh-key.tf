resource "google_secret_manager_secret" "instance_ssh_key" {
  secret_id = "team-${var.team_index}-ssh-key"
  replication {
    auto {}
  }

  labels = {
    "purpose" = "instance-ssh-key"
    "team_id" = "${var.team_index}"
  }
}

resource "google_secret_manager_secret_iam_member" "instance_ssh_key_writer" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.instance_ssh_key.id
  role      = "roles/secretmanager.secretVersionAdder"
  member    = "serviceAccount:${google_service_account.service_account.email}"
}
