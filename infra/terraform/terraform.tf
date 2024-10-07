terraform {
  backend "gcs" {
    bucket = "cloudwars-tf-state" # CHANGEME: Change this to your own GCS bucket name
    prefix = "terraform/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.5.0"
    }
  }
}
