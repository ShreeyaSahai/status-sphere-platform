from enum import StrEnum


class HttpMethod(StrEnum):
    GET = "GET"
    HEAD = "HEAD"


class HealthStatus(StrEnum):
    UP = "UP"
    DOWN = "DOWN"


class IncidentStatus(StrEnum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
