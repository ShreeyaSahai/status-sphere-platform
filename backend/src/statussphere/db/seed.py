import asyncio
import statussphere.db.models

from sqlalchemy import select

from statussphere.db.session import AsyncSessionLocal
from statussphere.models.environment import Environment


DEFAULT_ENVIRONMENTS = [
    ("Development", "development"),
    ("Staging", "staging"),
    ("Production", "production"),
]


async def seed_environments() -> None:
    async with AsyncSessionLocal() as session:
        for name, slug in DEFAULT_ENVIRONMENTS:
            result = await session.execute(
                select(Environment).where(
                    Environment.slug == slug
                )
            )

            existing = result.scalar_one_or_none()

            if existing:
                print(f"✓ {name} already exists")
                continue

            session.add(
                Environment(
                    name=name,
                    slug=slug,
                )
            )

            print(f"+ Created {name}")

        await session.commit()


async def main() -> None:
    await seed_environments()


if __name__ == "__main__":
    asyncio.run(main())