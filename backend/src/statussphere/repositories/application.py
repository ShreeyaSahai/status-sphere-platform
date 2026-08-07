from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.models.application import Application
from statussphere.models.environment import Environment


class ApplicationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_environment_by_slug(
        self,
        slug: str,
    ) -> Environment | None:
        result = await self.session.execute(
            select(Environment).where(
                Environment.slug == slug
            )
        )

        return result.scalar_one_or_none()

    async def get_by_slug(
        self,
        environment_id: UUID,
        slug: str,
    ) -> Application | None:
        result = await self.session.execute(
            select(Application).where(
                Application.environment_id == environment_id,
                Application.slug == slug,
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        application: Application,
    ) -> Application:
        self.session.add(application)

        await self.session.commit()

        await self.session.refresh(application)

        return application

    async def get_by_id(
        self,
        application_id: UUID,
    ) -> Application | None:
        result = await self.session.execute(
            select(Application).where(
                Application.id == application_id
            )
        )

        return result.scalar_one_or_none()


    async def list(
        self,
    ) -> list[Application]:
        result = await self.session.execute(
            select(Application)
            .where(Application.is_active.is_(True))
            .order_by(Application.created_at.desc())
        )

        return list(result.scalars().all())


    async def save(
        self,
        application: Application,
    ) -> Application:
        await self.session.commit()
        await self.session.refresh(application)
        return application