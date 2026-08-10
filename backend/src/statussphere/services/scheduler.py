from apscheduler.schedulers.asyncio import AsyncIOScheduler

from statussphere.core.config import settings
from statussphere.db.session import AsyncSessionLocal
from statussphere.repositories.application import ApplicationRepository
from statussphere.services.health_check import HealthCheckService


class MonitoringScheduler:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler()
        self.health_check_service = HealthCheckService()

    async def run_health_checks(self) -> None:
        async with AsyncSessionLocal() as session:
            repository = ApplicationRepository(session)
            applications = await repository.list()

            for application in applications:
                result = await self.health_check_service.check(
                    url=application.url,
                    method=application.method,
                    expected_status_code=application.expected_status_code,
                    timeout=application.timeout_seconds,
                )

                if result.is_healthy:
                    print(
                        f"[HealthCheck] ✓ {application.name} "
                        f"{result.status_code} "
                        f"{result.response_time_ms}ms"
                    )
                else:
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

        print(
            "[Scheduler] Started "
            f"(interval={settings.health_check_interval_seconds}s)"
        )

    async def shutdown(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)

        await self.health_check_service.close()

        print("[Scheduler] Stopped")