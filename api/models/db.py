"""
Supabase client singleton.

Returns None when SUPABASE_URL is not configured,
allowing graceful fallback to CSV/JSON data loading.
"""

import logging
import os

logger = logging.getLogger(__name__)

_client = None


def get_supabase():
    """Return a Supabase client, or None if not configured."""
    global _client
    if _client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
        if url and key:
            try:
                from supabase import create_client

                _client = create_client(url, key)
                logger.info("Supabase client initialized")
            except Exception as e:
                logger.warning("Failed to initialize Supabase client: %s", e)
    return _client
