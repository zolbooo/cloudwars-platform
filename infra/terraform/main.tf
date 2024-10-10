resource "google_project_service" "secret-manager" {
  project            = var.project_id
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = true
}

module "vpc" {
  source = "./modules/vpc"

  project_id = var.project_id
  region     = var.region
}

locals {
  game_instances = 0 # CHANGEME: Set the number of game instances you want to run (usually it's the number of teams)
}
module "game-instance" {
  count  = local.game_instances
  source = "./modules/game-instance"

  project_id = var.project_id
  region     = var.region

  game_coordinator_service_account_email = google_service_account.game_coordinator.email

  network_name = module.vpc.game_network_name
  team_index   = count.index + 1

  depends_on = [google_project_service.secret-manager]
}

module "db" {
  source = "./modules/db"

  project_id = var.project_id
  region     = var.region
}

module "ci" {
  source = "./modules/ci"

  project_id = var.project_id
  region     = var.region
}
module "game-coordinator" {
  source = "./modules/game-coordinator"

  project_id = var.project_id
  region     = var.region

  game_coordinator_service_account_email = google_service_account.game_coordinator.email
  app_artifact_registry_repository_name  = module.ci.app_artifact_registry_repository_name

  production_mode = var.production_mode

  depends_on = [google_project_service.secret-manager]
}

module "checker" {
  for_each = toset(["example-service"]) # CHANGEME: Add the names of the services you want to run checkers for

  source = "./modules/checker"

  project_id = var.project_id
  region     = var.region

  network_name  = module.vpc.game_network_name
  subnet_name   = module.vpc.checker_subnet_name
  registry_name = google_artifact_registry_repository.checkers.name
  service_name  = each.value

  game_coordinator_url                  = module.game-coordinator.url
  dispatcher_service_account_email      = module.game-coordinator.checker_dispatcher_service_account_email
  service_checker_service_account_email = module.game-coordinator.service_checker_service_account_email

  production_mode = var.production_mode
}
