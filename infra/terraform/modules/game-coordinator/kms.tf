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
