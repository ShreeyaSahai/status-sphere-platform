class StatusSphereError(Exception):
    """Base exception for the application."""


class EnvironmentNotFoundError(StatusSphereError):
    pass


class ApplicationNotFoundError(StatusSphereError):
    pass


class DuplicateApplicationError(StatusSphereError):
    pass
