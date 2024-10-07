resource "google_compute_subnetwork" "team_subnet" {
  project = var.project_id
  region  = var.region

  name          = "team-${var.team_index}-subnet"
  ip_cidr_range = "10.124.${var.team_index}.0/24"
  network       = var.network_name
}

module "instance_address" {
  source  = "terraform-google-modules/address/google"
  version = "~> 4.0"

  project_id = var.project_id
  region     = var.region

  subnetwork = google_compute_subnetwork.team_subnet.name
  names      = ["team-${var.team_index}-instance-address"]
  addresses  = ["10.124.${var.team_index}.10"]
}

resource "google_compute_address" "game_instance_public_ip" {
  name         = "team-${var.team_index}-public-ip"
  project      = var.project_id
  address_type = "EXTERNAL"
}
