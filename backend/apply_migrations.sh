#!/bin/bash
DB="data/app.db"
echo "Applying migrations to $DB..."

for file in migrations/*.sql; do
    filename=$(basename "$file")
    # Compare strings for lexicographical order (works for YYYYMMDD based names)
    if [[ "$filename" > "20260121171000" ]]; then
        echo "Applying $filename..."
        sqlite3 "$DB" < "$file"
        if [ $? -ne 0 ]; then
            echo "Error applying $filename"
            # specific logic to ignore errors for duplicate columns or tables if needed
            # but usually we want to know.
            # Continue anyway as we are recovering
        fi
    fi
done
echo "Migration application complete."
