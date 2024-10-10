output "instance_ssh_key_secret_id" {
  value = google_secret_manager_secret.instance_ssh_key.id
}
