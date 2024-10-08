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

module "game-coordinator" {
  source = "./modules/game-coordinator"

  project_id = var.project_id
  region     = var.region
}

module "checkers" {
  source = "./modules/checkers"

  project_id = var.project_id
  region     = var.region

  network_name = module.vpc.game_network_name
}
