from taskiq_redis import ListQueueBroker
from taskiq.schedule_sources.label_based import LabelScheduleSource
from taskiq import TaskiqScheduler
from config import get_settings

settings = get_settings()

# Redis Broker Configuration
broker = ListQueueBroker(
    url=settings.REDIS_URL
)

# Scheduler Configuration
scheduler = TaskiqScheduler(
    broker=broker,
    sources=[LabelScheduleSource(broker)],
)
