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

variable "dispatcher_service_account_email" {
  type        = string
  description = "The email of the service account used by the checker dispatcher"
}

variable "registry_name" {
  type        = string
  description = "The name of the Docker Artifact Registry"
}
variable "service_name" {
  type        = string
  description = "The name of the service"
}
