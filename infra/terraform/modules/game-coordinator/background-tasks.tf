resource "google_project_service" "cloudtasks" {
  project            = var.project_id
  service            = "cloudtasks.googleapis.com"
  disable_on_destroy = true
}

resource "google_service_account" "game_background_tasks" {
  account_id  = "game-background-tasks"
  description = "Service account for the game background tasks"
}

resource "google_cloud_tasks_queue" "game_background_tasks" {
  name     = "game-background-tasks-queue"
  location = var.region

  depends_on = [
    google_project_service.cloudtasks
  ]
}

resource "google_cloud_tasks_queue_iam_binding" "game_background_tasks_enqueuer" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_tasks_queue.game_background_tasks.name
  role     = "roles/cloudtasks.enqueuer"
  members = [
    "serviceAccount:${var.game_coordinator_service_account_email}",
  ]
}
resource "google_cloud_tasks_queue_iam_binding" "game_background_tasks_task_delete" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_tasks_queue.game_background_tasks.name
  role     = "roles/cloudtasks.taskDeleter"
  members = [
    "serviceAccount:${var.game_coordinator_service_account_email}",
  ]
}
resource "google_cloud_tasks_queue_iam_binding" "game_background_tasks_viewer" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_tasks_queue.game_background_tasks.name
  role     = "roles/cloudtasks.viewer"
  members = [
    "serviceAccount:${var.game_coordinator_service_account_email}",
  ]
}
