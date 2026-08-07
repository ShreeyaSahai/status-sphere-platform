from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from statussphere.models.enums import HttpMethod


NonEmptyStr = Annotated[
    str,
    Field(min_length=1, max_length=150),
]


class ApplicationCreate(BaseModel):
    environment_slug: str

    name: NonEmptyStr

    url: HttpUrl

    method: HttpMethod = HttpMethod.GET

    expected_status_code: int = Field(
        default=200,
        ge=100,
        le=599,
    )

    timeout_seconds: int = Field(
        default=10,
        ge=1,
        le=120,
    )

    check_interval_seconds: int = Field(
        default=30,
        ge=10,
        le=3600,
    )

    tags: list[str] = Field(default_factory=list)


class ApplicationUpdate(BaseModel):
    name: NonEmptyStr | None = None

    url: HttpUrl | None = None

    method: HttpMethod | None = None

    expected_status_code: int | None = Field(
        default=None,
        ge=100,
        le=599,
    )

    timeout_seconds: int | None = Field(
        default=None,
        ge=1,
        le=120,
    )

    check_interval_seconds: int | None = Field(
        default=None,
        ge=10,
        le=3600,
    )

    tags: list[str] | None = None

    is_active: bool | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID

    environment_id: UUID

    name: str

    slug: str

    url: HttpUrl

    method: HttpMethod

    expected_status_code: int

    timeout_seconds: int

    check_interval_seconds: int

    tags: list[str]

    is_active: bool