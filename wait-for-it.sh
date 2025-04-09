#!/bin/sh
# Improved wait-for-it.sh script that ensures MySQL is fully ready with tables

set -e

host="$1"
shift
cmd="$@"

HOST_PART=${host%%:*}
PORT_PART=${host##*:}

echo "⏳ Waiting for $host to be available..."

# Wait for MySQL to accept connections
until nc -z -v -w5 $HOST_PART $PORT_PART; do
  echo "⏳ Still waiting for $host to accept connections..."
  sleep 3
done

echo "✅ MySQL is accepting connections. Now checking for database readiness..."

# Wait for the required tables to be created
MAX_ATTEMPTS=30
ATTEMPT=1
TABLE_FOUND=0

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "⏳ Checking if tables are ready (attempt $ATTEMPT/$MAX_ATTEMPTS)..."
  
  if mysql -h$HOST_PART -P$PORT_PART -ueasyroomteam -p1234 easyroom -e "SHOW TABLES" 2>/dev/null | grep -q 'room_request'; then
    echo "✅ Found room_request table. Database is ready!"
    TABLE_FOUND=1
    break
  fi
  
  echo "⏳ Tables not ready yet. Waiting another 3 seconds..."
  sleep 3
  ATTEMPT=$((ATTEMPT + 1))
  
  # Try to import SQL manually if needed
  if [ $ATTEMPT -eq 15 ] || [ $ATTEMPT -eq 25 ]; then
    echo "🔄 Tables still not ready. Attempting manual import..."
    mysql -h$HOST_PART -P$PORT_PART -ueasyroomteam -p1234 easyroom < /docker-entrypoint-initdb.d/easyroom.sql 2>/dev/null || true
  fi
done

if [ $TABLE_FOUND -eq 0 ]; then
  echo "⚠️ Warning: Tables might not be fully ready, but proceeding anyway..."
else
  echo "✅ Database is fully ready with all required tables!"
fi

echo "⚙️ Starting application: $cmd"
exec $cmd