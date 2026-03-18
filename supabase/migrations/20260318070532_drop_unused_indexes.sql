/*
  # Drop Unused Indexes

  ## Summary
  Removes all indexes that have never been used according to pg_stat_user_indexes.
  Unused indexes waste storage and slow down INSERT/UPDATE/DELETE operations without
  providing any query performance benefit.

  ## Indexes Removed
  - user_usage_user_id_idx (public.user_usage)
  - user_usage_month_idx (public.user_usage)
  - user_usage_user_month_idx (public.user_usage)
  - user_usage_last_used_idx (public.user_usage)
  - distance_query_user_id_idx (public.distance_query)
  - distance_query_created_at_idx (public.distance_query)
  - contacts_email_idx (public.contacts)
  - contacts_status_idx (public.contacts)
  - contacts_created_at_idx (public.contacts)
  - api_tokens_token_idx (public.api_tokens)

  ## Notes
  - Unique constraints are NOT removed (only plain indexes)
  - Primary key indexes are NOT removed
  - These can be recreated later if query patterns change
*/

DROP INDEX IF EXISTS public.user_usage_user_id_idx;
DROP INDEX IF EXISTS public.user_usage_month_idx;
DROP INDEX IF EXISTS public.user_usage_user_month_idx;
DROP INDEX IF EXISTS public.user_usage_last_used_idx;
DROP INDEX IF EXISTS public.distance_query_user_id_idx;
DROP INDEX IF EXISTS public.distance_query_created_at_idx;
DROP INDEX IF EXISTS public.contacts_email_idx;
DROP INDEX IF EXISTS public.contacts_status_idx;
DROP INDEX IF EXISTS public.contacts_created_at_idx;
DROP INDEX IF EXISTS public.api_tokens_token_idx;
