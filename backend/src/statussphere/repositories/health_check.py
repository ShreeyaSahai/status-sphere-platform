from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.models.enums import HealthStatus
from statussphere.models.health_check import HealthCheck
from statussphere.services.health_check import HealthCheckResult


class HealthCheckRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        *,
        application_id: UUID,
        result: HealthCheckResult,
    ) -> HealthCheck:
        health_check = HealthCheck(
            application_id=application_id,
            status=(
                HealthStatus.UP
                if result.is_healthy
                else HealthStatus.DOWN
            ),
            status_code=result.status_code,
            response_time_ms=result.response_time_ms,
            error_message=result.error,
        )

        self.session.add(health_check)
        await self.session.commit()
        await self.session.refresh(health_check)

        return health_check