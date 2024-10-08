resource "google_service_account" "gh_actions" {
  account_id  = "gh-actions"
  description = "Service account used by GitHub Actions"
}

locals {
  repository = "zolbooo/cloudwars-platform" # CHANGEME: The repository to be used for the CI/CD pipeline
}
module "gh_oidc" {
  source              = "terraform-google-modules/github-actions-runners/google//modules/gh-oidc"
  project_id          = var.project_id
  pool_id             = "ci-pool"
  provider_id         = "gh-provider"
  attribute_condition = "attribute.repository == '${local.repository}'"
  sa_mapping = {
    "gh-actions-service-account" = {
      sa_name   = "projects/${var.project_id}/serviceAccounts/${google_service_account.gh_actions.email}"
      attribute = "attribute.repository/${local.repository}"
    }
  }
}
