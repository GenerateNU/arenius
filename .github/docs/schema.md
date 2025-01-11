We are using a Supabase-hosted Postgres database. Our schema is relational and we handle changes by making migration scripts so that we have a changelog of the database schema history.

The following pathway allows you to make and test schema changes locally via migration script without affecting the shared database until you're ready. More information on local development best practices can be found in the [Supabase docs](https://supabase.com/docs/guides/cli/local-development). **Note that running the DB locally requires Docker to be installed and running.**

0. Install the Supabase CLI by following directions [here](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=access-method&access-method=postgres&queryGroups=platform&platform=macos).
1. Create a new feature branch off of main to make sure you are up-to-date with any recently-added migration scripts.
2. `cd` into `/backend/internal`
3. Create a new migration script by running `supabase migration new migration-name`. Your migration-name should be concise but descriptive of what's going on!
   - Ex. `supabase migration new update_track_add_url` if adding a URL column to the track table.
4. Add your SQL to the auto-generated script file in `/migrations`
5. Add or update the `seed.sql` data to see populated values for your change if relevant

6. With Docker running, run `supabase start`
   - This will take some time on the first run, because the CLI needs to download the Docker images to your local machine. The CLI includes the entire Supabase toolset, and a few additional images that are useful for local development
7. Run `supabase db reset` to apply your changes locally. This might also take some time. If there are any syntax errors with your migration script or `seed.sql` file, they'll be caught here.
8. If applying the db changes goes smoothly, go to http://localhost:54323 to see a local version of the Supabase dashboard, where your sample data will be visible. Feel free to add/update data to test out your new schema and any constraints.
   - Anything you do in this local database won't impact our shared instance
9. If you want to test new API functionality against the locally-running database, you can point the server
   at this database by going to `arenius/backend/internal/storage/postgres/storage.go` and modifying the first line of the ConnectDatabase method to `dbConfig, err := pgxpool.ParseConfig("postgresql://postgres:postgres@127.0.0.1:54322/postgres")`
   - This is a connection string for the local DB
   - Make sure to switch this back to what it was when you make your PR!
10. When done, run `supabase stop` to stop the local instance of the DB.

After script is approved/merged:

0. If this is your first time pushing to our shared database, you'll need to link the supabase-cli to our specific project. Do this via `supabase link --project-ref [PROJECT-REF-VALUE]`
   - Our specific project ref can be found in the Supabase UI (look at the string in the URL following `/project/` or slack a TL if you're stuck)
   - It will also prompt you for a DB password - slack a TL to get this
   - It'll also prompt you to log in to Supabase
1. Run the actual script(s) against the supabase db using `supabase db push`
   - This will run the script and add a log to the migrations table.
