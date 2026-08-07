from dataclasses import dataclass
from time import perf_counter

import httpx

from statussphere.models.enums import HttpMethod


@dataclass(slots=True)
class HealthCheckResult:
    is_healthy: bool
    status_code: int | None
    response_time_ms: int
    error: str |None


class HealthCheckService:
    def __init__(
        self,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self.client = client or httpx.AsyncClient(
            follow_redirects=True,
        )

    async def check(
        self,
        *,
        url: str,
        method: HttpMethod,
        expected_status_code: int,
        timeout: int,
    ) -> HealthCheckResult:
        start = perf_counter()

        try:
            response = await self.client.request(
                method=method.value,
                url=url,
                timeout=timeout,
            )

            elapsed = int((perf_counter() - start) * 1000)

            return HealthCheckResult(
                is_healthy=response.status_code == expected_status_code,
                status_code=response.status_code,
                response_time_ms=elapsed,
                error=None,
            )

        except httpx.HTTPError as exc:
            elapsed = int((perf_counter() - start) * 1000)

            return HealthCheckResult(
                is_healthy=False,
                status_code=None,
                response_time_ms=elapsed,
                error=str(exc),
            )

    async def close(self):
        await self.client.aclose()