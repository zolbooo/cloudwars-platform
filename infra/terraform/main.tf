module "vpc" {
  source = "./modules/vpc"

  project_id = var.project_id
  region     = var.region
}
