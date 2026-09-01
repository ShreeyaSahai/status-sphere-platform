from datetime import UTC, datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from statussphere.core.config import settings
from statussphere.core.metrics import (
    health_checks_total,
    incidents_created_total,
    incidents_resolved_total,
)
from statussphere.db.session import AsyncSessionLocal
from statussphere.models.enums import IncidentStatus
from statussphere.models.incident import Incident
from statussphere.repositories.application import ApplicationRepository
from statussphere.repositories.health_check import HealthCheckRepository
from statussphere.repositories.incident import IncidentRepository
from statussphere.services.health_check import HealthCheckService


class MonitoringScheduler:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler()
        self.health_check_service = HealthCheckService()

    async def run_health_checks(self) -> None:
        async with AsyncSessionLocal() as session:
            application_repository = ApplicationRepository(session)
            health_check_repository = HealthCheckRepository(session)
            incident_repository = IncidentRepository(session)

            applications = await application_repository.list()

            for application in applications:
                result = await self.health_check_service.check(
                    url=application.url,
                    method=application.method,
                    expected_status_code=application.expected_status_code,
                    timeout=application.timeout_seconds,
                )

                await health_check_repository.create(
                    application_id=application.id,
                    result=result,
                )

                open_incident = await incident_repository.get_open_by_application(application.id)

                if result.is_healthy:
                    health_checks_total.labels(
                        application=application.name, status="ok"
                    ).inc()

                    if open_incident is not None:
                        await incident_repository.resolve(open_incident)
                        incidents_resolved_total.labels(application=application.name).inc()

                        print(f"[Incident] ✓ Resolved {application.name}")

                    print(
                        f"[HealthCheck] ✓ {application.name} "
                        f"{result.status_code} "
                        f"{result.response_time_ms}ms"
                    )

                else:
                    health_checks_total.labels(
                        application=application.name, status="failed"
                    ).inc()

                    if open_incident is None:
                        incident = Incident(
                            application_id=application.id,
                            status=IncidentStatus.OPEN,
                            reason=(
                                result.error
                                or f"Expected HTTP {application.expected_status_code}, "
                                f"received {result.status_code}"
                            ),
                            started_at=datetime.now(UTC),
                        )

                        await incident_repository.create(incident)
                        incidents_created_total.labels(application=application.name).inc()

                        print(f"[Incident] ✗ Created {application.name}: {incident.reason}")

                    print(
                        f"[HealthCheck] ✗ {application.name} "
                        f"{result.status_code} "
                        f"{result.response_time_ms}ms "
                        f"{result.error or ''}"
                    )

                if result.is_healthy:
                    if open_incident is not None:
                        await incident_repository.resolve(open_incident)

                        print(f"[Incident] ✓ Resolved {application.name}")

                    print(
                        f"[HealthCheck] ✓ {application.name} "
                        f"{result.status_code} "
                        f"{result.response_time_ms}ms"
                    )

                else:
                    if open_incident is None:
                        incident = Incident(
                            application_id=application.id,
                            status=IncidentStatus.OPEN,
                            reason=(
                                result.error
                                or f"Expected HTTP {application.expected_status_code}, "
                                f"received {result.status_code}"
                            ),
                            started_at=datetime.now(UTC),
                        )

                        await incident_repository.create(incident)

                        print(f"[Incident] ✗ Created {application.name}: {incident.reason}")

                    print(
                        f"[HealthCheck] ✗ {application.name} "
                        f"{result.status_code} "
                        f"{result.response_time_ms}ms "
                        f"{result.error or ''}"
                    )

    def start(self) -> None:
        self.scheduler.add_job(
            self.run_health_checks,
            "interval",
            seconds=settings.health_check_interval_seconds,
            id="health-checks",
            replace_existing=True,
            max_instances=1,
        )

        self.scheduler.start()

        print(f"[Scheduler] Started (interval={settings.health_check_interval_seconds}s)")

    async def shutdown(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)

        await self.health_check_service.close()
