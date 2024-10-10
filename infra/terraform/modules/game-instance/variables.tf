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

variable "network_name" {
  type        = string
  description = "The name of the VPC network where game instances will be deployed"
}

variable "team_index" {
  type        = number
  description = "The team index that is used to assign subnet and instance names"
  validation {
    condition     = var.team_index > 0 && var.team_index < 255
    error_message = "Team index must be greater than 0 and less than 255 (255 is reserved for the checker subnet)"
  }
}
