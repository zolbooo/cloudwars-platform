variable "project_id" {
  type        = string
  description = "The GCP project ID"
}
variable "region" {
  type        = string
  description = "The GCP region to deploy resources"
}

variable "game_coordinator_origin" {
  type        = string
  description = "The origin of game coordinator app"
}

variable "production_mode" {
  type        = bool
  description = "Whether if enable production mode protections: e.g. enable deletion protection"
}
