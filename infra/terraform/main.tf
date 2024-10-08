module "vpc" {
  source = "./modules/vpc"

  project_id = var.project_id
  region     = var.region
}

module "game-instance" {
  count  = 0
  source = "./modules/game-instance"

  project_id = var.project_id
  region     = var.region

  network_name = module.vpc.game_network_name
  team_index   = count.index + 1
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

  app_artifact_registry_repository_name = module.ci.app_artifact_registry_repository_name

  production_mode = var.production_mode
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

  dispatcher_service_account_email = module.game-coordinator.checker_service_account_email

  production_mode = var.production_mode
}
