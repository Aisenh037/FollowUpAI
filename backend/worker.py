import asyncio
from tkq import broker
from agents.agent_runner import AgentRunner
from services.database import SessionLocal
from loguru import logger

@broker.task
async def run_agent_task(user_id: int):
    """Background task to run the agent for all leads of a user."""
    logger.info(f"Starting background agent run for user {user_id}")
    db = SessionLocal()
    try:
        agent = AgentRunner(db=db, user_id=user_id)
        result = agent.run()
        logger.info(f"Agent run completed for user {user_id}: {result}")
    except Exception as e:
        logger.error(f"Agent run failed for user {user_id}: {str(e)}")
    finally:
        db.close()

@broker.task
async def run_lead_task(user_id: int, lead_id: int, context_type: str = None):
    """Background task to run the agent for a specific lead."""
    logger.info(f"Starting background agent run for lead {lead_id} (User: {user_id})")
    db = SessionLocal()
    try:
        agent = AgentRunner(db=db, user_id=user_id)
        result = agent.run_for_lead(lead_id=lead_id, force_context=context_type)
        logger.info(f"Lead task completed for lead {lead_id}: {result}")
    except Exception as e:
        logger.error(f"Lead task failed for lead {lead_id}: {str(e)}")
    finally:
        db.close()

@broker.task(schedule=[{"cron": "0 * * * *"}]) # Run every hour
async def autonomous_sequence_check():
    """Background task to advance all active outreach sequences."""
    from agents.sequence_manager import SequenceManager
    logger.info("Starting autonomous sequence advancement check")
    db = SessionLocal()
    try:
        manager = SequenceManager(db=db)
        manager.advance_sequences()
    except Exception as e:
        logger.error(f"Sequence advancement failed: {str(e)}")
    finally:
        db.close()
