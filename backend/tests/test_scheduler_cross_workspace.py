from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from statussphere.models.application import Application
from statussphere.models.environment import Environment
from statussphere.models.health_check import HealthCheck
from statussphere.models.workspace import Workspace
from statussphere.services.health_check import HealthCheckResult
from statussphere.services.scheduler import MonitoringScheduler


@pytest.mark.asyncio
async def test_scheduler_processes_applications_across_all_workspaces(
    db_session: AsyncSession,
):
    # 1. Fetch default environment
    result = await db_session.execute(
        select(Environment).where(Environment.slug == "production")
    )
    env = result.scalar_one()

    # 2. Create Workspace 1 with Application 1
    workspace_1 = Workspace()
    db_session.add(workspace_1)
    await db_session.flush()

    app_1 = Application(
        workspace_id=workspace_1.id,
        environment_id=env.id,
        name="Workspace 1 App",
        slug="workspace-1-app",
        url="https://app1.internal/health",
        method="GET",
        expected_status_code=200,
        timeout_seconds=5,
        check_interval_seconds=30,
        tags=["ws1"],
        is_active=True,
    )
    db_session.add(app_1)

    # 3. Create Workspace 2 with Application 2
    workspace_2 = Workspace()
    db_session.add(workspace_2)
    await db_session.flush()

    app_2 = Application(
        workspace_id=workspace_2.id,
        environment_id=env.id,
        name="Workspace 2 App",
        slug="workspace-2-app",
        url="https://app2.internal/health",
        method="GET",
        expected_status_code=200,
        timeout_seconds=5,
        check_interval_seconds=30,
        tags=["ws2"],
        is_active=True,
    )
    db_session.add(app_2)
    await db_session.commit()

    # 4. Initialize MonitoringScheduler and mock HealthCheckService
    scheduler = MonitoringScheduler()
    checked_urls: list[str] = []

    async def mock_check(url: str, **kwargs) -> HealthCheckResult:
        checked_urls.append(url)
        return HealthCheckResult(
            is_healthy=True,
            status_code=200,
            response_time_ms=45,
            error=None,
        )

    scheduler.health_check_service.check = AsyncMock(side_effect=mock_check)

    # 5. Patch AsyncSessionLocal in scheduler module to use our test session
    session_factory = async_sessionmaker(
        db_session.bind,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    with patch("statussphere.services.scheduler.AsyncSessionLocal", session_factory):
        await scheduler.run_health_checks()

    # 6. Verify that applications from BOTH workspaces were processed
    assert len(checked_urls) == 2
    assert "https://app1.internal/health" in checked_urls
    assert "https://app2.internal/health" in checked_urls

    # 7. Verify health checks were persisted for both applications
    hc_1_res = await db_session.execute(
        select(HealthCheck).where(HealthCheck.application_id == app_1.id)
    )
    assert len(hc_1_res.scalars().all()) == 1

    hc_2_res = await db_session.execute(
        select(HealthCheck).where(HealthCheck.application_id == app_2.id)
    )
    assert len(hc_2_res.scalars().all()) == 1
