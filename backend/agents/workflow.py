"""LangGraph workflow for Sales & Career agent."""
from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, END
from agents.lead_classifier import lead_classifier
from agents.email_generator import email_generator
from tools.search_tool import search_tool
import logging

logger = logging.getLogger(__name__)

class AgentState(TypedDict):
    """Internal state for the agent workflow."""
    lead: Any  # Lead model instance (can be None for discovery)
    days_since_contact: int
    status: str
    email_body: str
    email_subject: str
    action_taken: str
    discovery_results: List[Dict[str, Any]]
    search_query: str  # For discovery mode

def classify_node(state: AgentState) -> AgentState:
    """Classifies the lead based on contact history."""
    lead = state["lead"]
    days_since = lead_classifier.get_days_since_contact(lead.last_contacted_date)
    status = lead_classifier.classify_lead(lead.last_contacted_date)
    
    return {
        **state,
        "days_since_contact": days_since,
        "status": status,
        "action_taken": "classified"
    }

def active_node(state: AgentState) -> AgentState:
    """Handles active leads (no email needed)."""
    return {
        **state,
        "email_body": "",
        "action_taken": "skipped_active"
    }

def followup_node(state: AgentState) -> AgentState:
    """Generates a follow-up email."""
    lead = state["lead"]
    email_body = email_generator.generate_email(lead, context_type="followup")
    subject = f"Following up - {lead.name}"
    
    return {
        **state,
        "email_body": email_body,
        "email_subject": subject,
        "action_taken": "generated_followup"
    }

def breakup_node(state: AgentState) -> AgentState:
    """Generates a breakup email."""
    lead = state["lead"]
    email_body = email_generator.generate_email(lead, context_type="breakup")
    subject = f"Checking in - {lead.name}"
    
    return {
        **state,
        "email_body": email_body,
        "email_subject": subject,
        "action_taken": "generated_breakup"
    }

def format_node(state: AgentState) -> AgentState:
    """Formats the final output for the email service."""
    # Logic to clean up or wrap email body if needed
    if state["email_body"]:
        state["email_body"] = state["email_body"].strip()
    
    return {
        **state,
        "action_taken": f"finalized_{state['action_taken']}"
    }

async def discovery_node(state: AgentState) -> AgentState:
    """Node for autonomous lead/contact discovery via search."""
    query = state.get("search_query")
    if not query:
        return {**state, "action_taken": "discovery_failed_no_query"}
    
    logger.info(f"Running discovery for query: {query}")
    results = await search_tool.search_leads(query)
    
    # We return the results; the integration layer will handle DB insertion
    # Or we could use LLM here to extract structured lead data from results content
    return {
        **state,
        "discovery_results": results,
        "action_taken": "discovery_completed"
    }

# Routing logic
def route_by_status(state: AgentState) -> Literal["active", "followup", "breakup"]:
    status = state["status"]
    if status == "active":
        return "active"
    elif status == "needs_followup":
        return "followup"
    else:
        return "breakup"

# Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("classify", classify_node)
workflow.add_node("active", active_node)
workflow.add_node("followup", followup_node)
workflow.add_node("breakup", breakup_node)
workflow.add_node("format", format_node)

# Set entry point
workflow.set_entry_point("classify")

# Add conditional edges
workflow.add_conditional_edges(
    "classify",
    route_by_status,
    {
        "active": "active",
        "followup": "followup",
        "breakup": "breakup"
    }
)

# Add normal edges
workflow.add_edge("active", "format")
workflow.add_edge("followup", "format")
workflow.add_edge("breakup", "format")
workflow.add_edge("format", END)

# Compile the graph
agent_executor = workflow.compile()

# --- Discovery Workflow ---

discovery_workflow = StateGraph(AgentState)
discovery_workflow.add_node("discovery", discovery_node)
discovery_workflow.set_entry_point("discovery")
discovery_workflow.add_edge("discovery", END)

discovery_executor = discovery_workflow.compile()

# Combine both for export
class AgentExecutors:
    run = agent_executor
    discover = discovery_executor

agent_executors = AgentExecutors()
