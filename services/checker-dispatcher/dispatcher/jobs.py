import json
from typing import Any, Literal, Optional
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


def invoke_checker(
    job: run_v2.Job,
    target_ip: str,
    checker_mode: Literal["push", "pull"],
    round_flag: Optional[str],
    metadata: Any,
):
    args = [
        "--target-ip",
        target_ip,
        "--mode",
        checker_mode,
    ]
    if round_flag is not None:
        args.extend(["--round-flag", round_flag])
    args.extend(["--metadata", json.dumps(metadata)])

    client.run_job(
        request=run_v2.RunJobRequest(
            name=job.name,
            overrides={"container_overrides": [{"args": args}]},
        )
    )
