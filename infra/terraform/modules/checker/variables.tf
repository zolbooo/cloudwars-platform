variable "project_id" {
  type        = string
  description = "The GCP project ID"
}
variable "region" {
  type        = string
  description = "The GCP region to deploy resources"
}

variable "network_name" {
  type        = string
  description = "The name of the VPC network where game instances will are deployed"
}
variable "subnet_name" {
  type        = string
  description = "The name of the subnet where the checker instances will be deployed"
}

variable "dispatcher_service_account_email" {
  type        = string
  description = "The email of the service account used by the checker dispatcher"
}
variable "service_checker_service_account_email" {
  type        = string
  description = "The email of the service account used by the service checkers"
}

variable "registry_name" {
  type        = string
  description = "The name of the Docker Artifact Registry"
}
variable "service_name" {
  type        = string
  description = "The name of the service"
}

variable "game_coordinator_url" {
  type        = string
  description = "The URL of the game coordinator"
}

variable "production_mode" {
  type        = bool
  description = "Whether if enable production mode protections: e.g. enable deletion protection"
}
