# Database Initialization Scripts

This directory contains SQL scripts that will be automatically executed when the PostgreSQL container is first created.

## Usage

Place any `.sql` or `.sh` files in this directory, and they will be executed in alphabetical order when the database is initialized.

## Example

You can create initialization scripts like:

- `01-create-extensions.sql` - Create PostgreSQL extensions
- `02-seed-categories.sql` - Seed initial categories
- `03-seed-users.sql` - Seed initial users

## Note

These scripts only run when the database volume is first created. If you need to re-run initialization scripts, you'll need to remove the Docker volume first.


