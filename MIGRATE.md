# Migrating to Another PC

This guide moves the whole system - code, data, and uploaded files - to a new PC.

## What holds the data

| Data | Where it lives | How it is transferred |
|------|----------------|-----------------------|
| All app data (users, events, registrations, feedback, applications) | MySQL database `usiu_events` on this PC | `db_backup/usiu_events_full_*.sql` (already generated) + `restore-db.bat` |
| Organizer application documents, uploads | `uploads/` folder (inside the project) | Copy the folder as-is |
| Source code + config | Project folder | Copy the folder as-is |

> The database is NOT inside the project folder, so you cannot migrate by copying the
> project alone. The folder now includes a ready-made backup in `db_backup/`.

## Step 1 - On THIS PC (done already)

- `db_backup/usiu_events_full_20260806-1801.sql` - full dump (schema + data, includes the
  `CREATE DATABASE` statement).
- `uploads/` - contains all uploaded organizer documents referenced by the database.
- `restore-db.bat` - the restore tool for the new PC.

To make a fresh backup any time (for example after more testing):

```
mysqldump --host=127.0.0.1 -u root --databases usiu_events --single-transaction --routines --triggers --add-drop-table --set-gtid-purged=OFF --result-file=db_backup\usiu_events_full_<date>.sql
```

(If your root user has a password, add `-p` and type it when prompted.)

## Step 2 - Copy the project to the new PC

Copy the **whole project folder** (including `db_backup` and `uploads`) using a USB drive,
external disk, or network share.

- Keep `node_modules` only if the new PC has the same architecture (both Windows 64-bit).
  Otherwise delete it - `setup.bat` / `launch.bat` will reinstall it.
- `target/` and `backend.log` are build artifacts and can be deleted; they are rebuilt.
- Do NOT copy via `git push/pull` alone: the repository ignores `uploads/` in `.gitignore`.
  Use a direct folder copy, or force-add the ignored folders if you really want git.

## Step 3 - On the NEW PC: install the tools

Prerequisites (same as this PC): **Java 21, Maven, Node.js, MySQL 8+** on Windows.

Simplest way - open a command prompt inside the copied project and run:

```
setup.bat
```

This installs the tools via winget, runs `npm install`, and compiles the backend. Follow the
MySQL installer wizard if it appears: keep port 3306, set a root password of your choice, and
tick "Start MySQL Server at System Startup".

> If MySQL was already installed, just make sure the service is running.

## Step 4 - On the NEW PC: restore the database

In a command prompt inside the project:

```
restore-db.bat
```

- If your MySQL `root` user has NO password: just run it.
- If your MySQL `root` has a password, set it first:
  ```
  set DB_PASSWORD=yourpassword
  restore-db.bat
  ```
- The script drops any existing `usiu_events` database, imports the backup, and prints the
  table count. It finishes with "DATABASE RESTORED SUCCESSFULLY".

### If your MySQL root password differs (app login)

The backend connects with the credentials in `src/main/resources/application.properties`:

```
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

Defaults are `root` with an empty password on `localhost:3306`. To use a different user or
password on the new PC without editing files, set environment variables before running:

```
set DB_USERNAME=root
set DB_PASSWORD=yourpassword
launch.bat
```

The same env vars are read by `launch.bat` for creating the database.

## Step 5 - Start the application

In the copied project folder:

```
launch.bat
```

It starts the backend (port 8080) and frontend (port 3000) in two windows and opens
http://localhost:3000 .

## Step 6 - Verify everything moved

- Log in with an existing account (the accounts are in the database backup).
- On the Dashboard, confirm previously created events/registrations appear.
- Open the Analytics page (admin) and confirm the Event Feedback section lists events.
- Check a student profile to confirm registrations, or open an organizer application to
  confirm its uploaded document still downloads (documents live in `uploads/`).

## Notes / gotchas

- **Uploads**: the app stores uploads under `./uploads` (relative to the project), so the
  documents keep working as long as the `uploads/` folder is copied with the project.
- **Frontend API address**: `frontend-react/src/services/api.ts` defaults to
  `http://localhost:8080/api/v1` - correct on any PC running the backend locally.
- **e2e test scripts** (`frontend-react/*_browser.js`) hardcode
  `C:\Program Files\Google\Chrome\Application\chrome.exe` - update that path if Chrome is
  installed elsewhere on the new PC. These are dev/test-only and not needed to run the app.
- **MySQL version**: the backup is plain SQL and restores on MySQL 8.x/9.x. The new PC does
  not need to match the exact server version.
