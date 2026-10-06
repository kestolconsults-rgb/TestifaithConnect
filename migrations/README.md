# Database migrations

For existing databases, generate and apply schema changes with:

1. `npm run db:generate` after editing `shared/schema.ts`.
2. Review the generated SQL in `migrations/` and commit it.
3. Run `npm run db:migrate` against the target database before deploying code that depends on the change.

The initial migration records the `email_verified` column that was previously added manually. Its `IF NOT EXISTS` clause lets Drizzle record the migration safely on databases where that hotfix is already present.

For a brand-new database, provision the current schema once with `npm run db:push`; use reviewed migrations for subsequent schema changes.


Reviewed migrations run automatically during application startup. The runtime image includes the migration files, and a PostgreSQL advisory lock ensures only one Koyeb replica applies pending migrations at a time. New databases can still be provisioned once with `npm run db:push`.
