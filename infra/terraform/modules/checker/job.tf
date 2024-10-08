resource "google_service_account" "checker" {
  account_id  = "${var.service_name}-checker"
  description = "Service account used by the checker for the \"${var.service_name}\" service"
}

resource "google_cloud_run_v2_job" "checker" {
  name     = "${var.service_name}-checker"
  location = var.region

  labels = {
    purpose      = "service-checker"
    service_name = var.service_name
  }

  template {
    template {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.registry_name}/${var.service_name}:latest"

        env {
          name  = "CHECKER_SERVICE_NAME"
          value = var.service_name
        }
        env {
          name  = "GAME_COORDINATOR_URL"
          value = var.game_coordinator_url
        }
      }
      service_account = google_service_account.checker.email

      vpc_access {
        network_interfaces {
          network    = var.network_name
          subnetwork = var.subnet_name
          tags       = ["service-checker"]
        }
      }
    }
  }

  deletion_protection = var.production_mode
}
