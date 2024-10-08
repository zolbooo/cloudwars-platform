resource "google_project_service" "cloudkms" {
  project = var.project_id
  service = "cloudkms.googleapis.com"
}

resource "google_kms_key_ring" "game_key_ring" {
  name       = "game-key-ring"
  location   = var.region
  depends_on = [google_project_service.cloudkms]
}

resource "google_kms_crypto_key" "flag_key" {
  name     = "flag-key"
  key_ring = google_kms_key_ring.game_key_ring.id

  purpose = "ASYMMETRIC_SIGN"
  version_template {
    algorithm = "EC_SIGN_P256_SHA256"
  }
}

resource "google_project_iam_custom_role" "key_version_viewer" {
  role_id = "key_version_viewer"
  title   = "Cloud KMS Key version viewer"
  permissions = [
    "cloudkms.cryptoKeyVersions.list",
  ]
}
resource "google_kms_crypto_key_iam_member" "game_coordinator-flag_key-version-viewer" {
  crypto_key_id = google_kms_crypto_key.flag_key.id
  role          = google_project_iam_custom_role.key_version_viewer.id
  member        = "serviceAccount:${google_service_account.game_coordinator.email}"
}
resource "google_kms_crypto_key_iam_member" "game_coordinator-flag_key-public-key-viewer" {
  crypto_key_id = google_kms_crypto_key.flag_key.id
  role          = "roles/cloudkms.publicKeyViewer"
  member        = "serviceAccount:${google_service_account.game_coordinator.email}"
}
