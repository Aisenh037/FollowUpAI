"""Email generation using Groq LLM."""
from groq import Groq
from config import get_settings
from typing import Any, Literal, List, Dict

settings = get_settings()

# Initialize Groq client
client = Groq(api_key=settings.GROQ_API_KEY)


class EmailGenerator:
    """LLM-powered email generator with multi-context support (Sales & Career)."""
    
    SYSTEM_PROMPT = """You are a highly effective B2B outbound SDR. 
Your goal is to write cold emails that feel human, short, and relevant.

Rules:
- No hype words (e.g., 'revolutionary', 'game-changing').
- DO NOT use generic openings like "I hope this finds you well" or "Hi, my name is...".
- Length: Strictly between 80-120 words.
- Tone: Direct, empathetic, and professional.
- Format: Plain text only, one clear low-friction CTA.
- One clear CTA (e.g., a 15-min chat or a simple yes/no response).

Context Structure:
- Start with a specific piece of company context.
- Mention a potential pain point you've inferred.
- Briefly state how your service helps.
- Provide a quick piece of social proof or a demo result.
- End with a low-friction CTA."""
    
    @staticmethod
    def generate_email(
        lead: Any,  # Lead model instance
        context_type: str = "followup"  # followup, breakup, cold_mail, saas_offer
    ) -> str:
        """
        Generate a tailored cold email using the B2B SDR persona.
        """
        # Determine the core pitch based on contact type
        is_recruiter = lead.contact_type in ["recruiter", "hr"]
        
        if is_recruiter:
            service = "SDE professional services"
            proof = f"Tech stack: {lead.tech_stack or 'Fullstack development'}. Resume: {lead.resume_link or 'Available on request'}"
            pain = "Finding reliable technical talent that fits the company's specific stack."
        else:
            service = "AI Automation & SaaS Development"
            proof = "Helping companies automate 40+ hours of manual work weekly with custom AI agents."
            pain = "Manual overhead and inefficient lead processing/outreach workflows."

        # Company context (1-2 lines)
        company_context = f"noticed {lead.company} is scaling its tech operations" if lead.company else "came across your recent work in the industry"
        
        prompt = f"""
        Recipient: {lead.name}, {lead.contact_type} at {lead.company or 'your team'}
        Context: {company_context}
        Pain Point Inferred: {pain}
        My Service: {service}
        Proof: {proof}
        Task Type: {context_type} (Tailor the tone for this context)
        
        Draft the email following the B2B SDR rules strictly. No "hope you're well". Direct and human.
        """
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": EmailGenerator.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.7,
                max_tokens=300
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            # Fallback (Short & SDR-style)
            if is_recruiter:
                return f"Hi {lead.name},\n\nNoticed you're hiring for technical roles at {lead.company or 'your company'}. I'm an SDE with deep experience in {lead.tech_stack or 'modern web stacks'}.\n\nDo you have a few minutes this week to see if my background fits any current openings?\n\nBest,"
            else:
                return f"Hi {lead.name},\n\nSaw {lead.company or 'your team'} is looking to streamline operations. I build custom AI agents that automate manual outreach and lead processing.\n\nWorth a 10-minute chat to see if we can save your team some time?\n\nBest,"


    @staticmethod
    def parse_search_results(results: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """
        Use LLM to parse raw search results into structured lead objects.
        """
        if not results:
            return []
            
        results_str = "\n".join([f"- {r.get('title')}: {r.get('url')}\n  {r.get('content')[:200]}" for r in results])
        
        prompt = f"""
        Search Query: {query}
        Search Results:
        {results_str}
        
        Task:
        Extract potential leads/contacts from these results.
        For each lead, provide:
        - name
        - email (if found, else skip or put 'unknown@domain.com')
        - company
        - contact_type (recruiter, hr, or client)
        - source_url
        
        Return ONLY a JSON list of objects. No other text.
        """
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a data extraction assistant. Return JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model=settings.GROQ_MODEL,
                temperature=0,
                response_format={"type": "json_object"}
            )
            import json
            raw_response = chat_completion.choices[0].message.content.strip()
            data = json.loads(raw_response)
            # Handle if LLM wraps in a root key
            if isinstance(data, dict):
                for key in ["leads", "contacts", "results"]:
                    if key in data and isinstance(data[key], list):
                        return data[key]
                return [data] if "name" in data else []
            return data
        except Exception as e:
            logger.error(f"Failed to parse search results: {str(e)}")
            return []

# Singleton instance
email_generator = EmailGenerator()
