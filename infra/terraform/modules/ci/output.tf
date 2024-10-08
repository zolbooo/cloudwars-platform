output "app_artifact_registry_repository_name" {
  value = google_artifact_registry_repository.app.name
}

output "gh_actions_service_account_email" {
  value = google_service_account.gh_actions.email
}
