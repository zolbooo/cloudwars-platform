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
