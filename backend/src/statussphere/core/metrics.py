from prometheus_client import Counter

health_checks_total = Counter(
    "statussphere_health_checks_total",
    "Total health checks executed, labeled by application and outcome",
    ["application", "status"],
)

incidents_created_total = Counter(
    "statussphere_incidents_created_total",
    "Total incidents created, labeled by application",
    ["application"],
)

incidents_resolved_total = Counter(
    "statussphere_incidents_resolved_total",
    "Total incidents resolved, labeled by application",
    ["application"],
)
