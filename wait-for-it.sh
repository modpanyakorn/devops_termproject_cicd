#!/bin/sh
# wait-for-it.sh แบบปรับปรุงที่ทำงานบน BusyBox และรอจนกว่า MySQL จะพร้อมอย่างแท้จริง

set -e

host="$1"
shift
cmd="$@"

echo "⏳ รอให้ $host พร้อมให้บริการ..."

# รอให้ MySQL พร้อมเชื่อมต่อ
until nc -z -v -w5 ${host%%:*} ${host##*:}; do
  echo "⏳ รอให้ $host พร้อมให้บริการ..."
  sleep 5
done

# รอให้ฐานข้อมูลพร้อมใช้งานจริง (รอให้สร้างตารางเสร็จ)
echo "⏳ รอให้ MySQL สร้างตารางให้เสร็จสมบูรณ์..."
for i in $(seq 1 30); do
  if echo "SHOW TABLES" | mysql -h${host%%:*} -P${host##*:} -ueasyroomteam -p1234 easyroom 2>/dev/null | grep -q 'room_request'; then
    echo "✅ ตาราง room_request พร้อมใช้งานแล้ว"
    break
  fi
  echo "⏳ ยังไม่พบตาราง room_request... รอต่ออีก 5 วินาที"
  sleep 5
  
  # ถ้ารอนานเกินไป ให้พยายามนำเข้า SQL ด้วยตัวเอง
  if [ $i -eq 20 ]; then
    echo "⚠️ ยังไม่พบตาราง ลองนำเข้า SQL ด้วยตัวเอง..."
    mysql -h${host%%:*} -P${host##*:} -ueasyroomteam -p1234 easyroom < /docker-entrypoint-initdb.d/easyroom.sql 2>/dev/null || true
  fi
done

echo "✅ $host พร้อมให้บริการแล้ว กำลังดำเนินการคำสั่งต่อไป..."
exec $cmd