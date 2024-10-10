variable "project_id" {
  type        = string
  description = "The GCP project ID"
}
variable "region" {
  type        = string
  description = "The GCP region to deploy resources"
}

variable "game_coordinator_service_account_email" {
  type        = string
  description = "Game Coordinator service account email"
}
variable "app_artifact_registry_repository_name" {
  type        = string
  description = "The name of the Artifact Registry repository where the app artifacts are stored"
}

variable "production_mode" {
  type        = bool
  description = "Whether if enable production mode protections: e.g. enable deletion protection"
}
