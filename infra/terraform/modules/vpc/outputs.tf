output "game_network_name" {
  value = google_compute_network.game_network.name
}
output "checker_subnet_name" {
  value = google_compute_subnetwork.checker_subnet.name
}
