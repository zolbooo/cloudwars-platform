output "checker_dispatcher_service_account_email" {
  value = google_service_account.dispatcher.email
}
output "service_checker_service_account_email" {
  value = google_service_account.service-checker.email
}

output "url" {
  value = google_cloud_run_v2_service.game_coordinator.uri
}
