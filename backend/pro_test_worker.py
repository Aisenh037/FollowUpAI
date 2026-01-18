from tkq import broker
from worker import run_agent_task
import asyncio

async def test_worker_dispatch():
    print("📡 Testing Taskiq Dispatch...")
    try:
        # This doesn't RUN the task, it just sends it to Redis
        # It's like putting a letter in the mailbox
        task = await run_agent_task.kiq(user_id=1)
        print(f"✅ Task Dispatched! ID: {task.task_id}")
        print("💡 Now the worker (if running) will pick this up.")
    except Exception as e:
        print(f"❌ Dispatch FAILED (Is Redis running?): {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_worker_dispatch())
