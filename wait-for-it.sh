#!/bin/sh
# wait-for-it.sh แบบง่ายที่ทำงานบน BusyBox

set -e

host="$1"
shift
cmd="$@"

until nc -z -v -w5 ${host%%:*} ${host##*:}; do
  echo "⏳ รอให้ $host พร้อมให้บริการ..."
  sleep 5
done

echo "✅ $host พร้อมให้บริการแล้ว กำลังดำเนินการคำสั่งต่อไป..."
exec $cmd