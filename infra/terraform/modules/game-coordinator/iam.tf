resource "google_project_iam_custom_role" "key_version_viewer" {
  role_id = "key_version_viewer"
  title   = "Cloud KMS Key version viewer"
  permissions = [
    "cloudkms.cryptoKeyVersions.list",
  ]
}
