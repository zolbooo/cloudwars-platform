from google.cloud import run_v2


client = run_v2.JobsClient()


def list_checker_jobs(project_id: str, region: str):
    jobs = client.list_jobs(
        request=run_v2.ListJobsRequest(
            parent=client.common_location_path(project_id, region),
        )
    )
    return list(
        filter(
            lambda job: "purpose" in job.labels
            and job.labels["purpose"] == "service-checker",
            jobs,
        )
    )


def invoke_checker(job: run_v2.Job, target_ip: str, round_flag: str):
    client.run_job(
        request=run_v2.RunJobRequest(
            name=job.name,
            overrides={
                "container_overrides": [
                    {
                        "args": [
                            "--target-ip",
                            target_ip,
                            "--round-flag",
                            round_flag,
                        ]
                    }
                ]
            },
        )
    )
