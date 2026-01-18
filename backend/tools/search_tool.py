"""Web search tool for sourcing leads and HR contacts."""
import httpx
import logging
from typing import List, Dict, Any
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class SearchTool:
    """Tool for searching the web for potential leads."""
    
    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY
        self.base_url = "https://api.tavily.com/search"

    async def search_leads(self, query: str, search_depth: str = "advanced") -> List[Dict[str, Any]]:
        """
        Search for potential leads or HR contacts.
        
        Args:
            query: The search query (e.g., "AI startups hiring SDE")
            search_depth: "basic" or "advanced"
            
        Returns:
            List of search results with title, url, and content
        """
        if not self.api_key:
            logger.warning("TAVILY_API_KEY not configured. Search will return empty results.")
            return []

        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": search_depth,
            "include_domains": [],
            "exclude_domains": [],
            "max_results": 5
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return data.get("results", [])
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []

search_tool = SearchTool()
