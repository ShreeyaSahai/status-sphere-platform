import httpx
import pytest

from statussphere.models.enums import HttpMethod
from statussphere.services.health_check import HealthCheckService


class MockClient:
    def __init__(self, status_code: int):
        self.status_code = status_code

    async def request(self, **kwargs):
        return httpx.Response(status_code=self.status_code)

    async def aclose(self):
        pass


@pytest.mark.asyncio
async def test_successful_health_check():
    service = HealthCheckService(
        client=MockClient(200)
    )

    result = await service.check(
        url="https://example.com",
        method=HttpMethod.GET,
        expected_status_code=200,
        timeout=5,
    )

    assert result.is_healthy
    assert result.status_code == 200
    assert result.error is None


@pytest.mark.asyncio
async def test_unsuccessful_health_check():
    service = HealthCheckService(
        client=MockClient(404)
    )

    result = await service.check(
        url="https://example.com",
        method=HttpMethod.GET,
        expected_status_code=200,
        timeout=5,
    )

    assert not result.is_healthy
    assert result.status_code == 404