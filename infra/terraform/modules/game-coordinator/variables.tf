variable "project_id" {
  type        = string
  description = "The GCP project ID"
}
variable "region" {
  type        = string
  description = "The GCP region to deploy resources"
}

variable "app_artifact_registry_repository_name" {
  type        = string
  description = "The name of the Artifact Registry repository where the app artifacts are stored"
}
