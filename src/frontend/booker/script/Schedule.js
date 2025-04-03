/********************************
 * 1) ตัวแปร days, timeSlots
 ********************************/
const days = [
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
  "อาทิตย์",
];

const timeSlots = [
  "08:00:00",
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "13:00:00",
  "14:00:00",
  "15:00:00",
  "16:00:00",
  "17:00:00",
  "18:00:00",
  "19:00:00",
  "20:00:00",
];

/********************************
 * Global: อ่าน room_id จาก URL
 ********************************/
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
if (!roomId) {
  console.error("No room specified in URL!");
}

/********************************
 * Helper: formatTime(timeStr)
 * - แปลงค่าเวลาจาก string (หรือ ISO string) ให้เหลือ "HH:MM:SS"
 ********************************/
function formatTime(timeStr) {
  if (!timeStr) return null;
  if (timeStr.includes("T")) {
    const date = new Date(timeStr);
    return date.toTimeString().slice(0, 8);
  }
  return timeStr;
}

/********************************
 * Helper: getISODate(date)
 * - คืนค่าวันในรูปแบบ "YYYY-MM-DD"
 ********************************/
function getISODate(date) {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/********************************
 * 2) getStartOfWeek(date)
 *    - หา "วันจันทร์" ของสัปดาห์ที่เลือก
 ********************************/
function getStartOfWeek(date) {
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ...
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(
    selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );
  return startOfWeek;
}

/********************************
 * 3) getFormattedDate(date)
 *    - แปลงเป็น dd/mm/yyyy (ปีพ.ศ.)
 ********************************/
function getFormattedDate(date) {
  const dayOfMonth = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear() + 543;
  return `${dayOfMonth}/${month}/${year}`;
}

/********************************
 * 4) addOneHour(time)
 *    - เพิ่มเวลา 1 ชม. (HH:MM:SS)
 ********************************/
function addOneHour(time) {
  const timePattern = /^\d{2}:\d{2}:\d{2}$/;
  if (!timePattern.test(time)) {
    throw new Error("รูปแบบเวลาไม่ถูกต้อง ควรเป็น HH:MM:SS");
  }
  const [hour, minute, second] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, second);
  date.setHours(date.getHours() + 1);
  return date.toTimeString().slice(0, 8);
}

/********************************
 * 5) showAlert(message)
 *    - popup สีแดงแจ้งเตือน 3 วิ
 ********************************/
function showAlert(message) {
  const alertDiv = document.createElement("div");
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "20px";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translateX(-50%)";
  alertDiv.style.backgroundColor = "#f44336";
  alertDiv.style.color = "white";
  alertDiv.style.padding = "10px 20px";
  alertDiv.style.fontSize = "16px";
  alertDiv.style.borderRadius = "5px";
  alertDiv.textContent = message;

  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

/********************************
 * 6) fetchSchedule()
 *    - ดึงข้อมูลตารางเรียนและการจอง แล้วแสดงผลใน <tbody>
 ********************************/
async function fetchSchedule(selectedDate) {
  try {
    const startOfWeek = getStartOfWeek(new Date(selectedDate));

    // ดึงข้อมูลตารางเรียนทั้งหมด
    const response = await fetch(`${API_URL}/booker/getSchedule`);
    const data = await response.json();
    // กรองเฉพาะ schedule ที่ตรงกับ room_id ที่อ่านมาจาก URL
    const roomSchedules = data.filter((d) => d.room_id === roomId);

    // ดึงข้อมูลการจองและกรองเฉพาะของ room นั้น
    const bookingResponse = await fetch(`${API_URL}/booker/room_request`);
    let bookings = await bookingResponse.json();
    bookings = bookings.filter(
      (b) => b.request_status === "อนุมัติ" && b.room_id === roomId
    );

    console.log("📌 ตารางเรียน (Room " + roomId + "):", roomSchedules);
    console.log("📌 การจอง (Room " + roomId + "):", bookings);

    const tbody = document.querySelector("tbody");
    if (!tbody) {
      console.error("ไม่พบ <tbody> ในตาราง");
      return;
    }

    // ตรวจสอบวันปัจจุบัน
    const today = new Date();
    const todayISO = getISODate(today);

    tbody.innerHTML = days
      .map((day, index) => {
        let currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);
        const formattedDate = getFormattedDate(currentDate);
        const rowISO = getISODate(currentDate);

        // เช็คว่าวันนี้เป็นวันปัจจุบันหรือไม่
        const isToday = todayISO === rowISO;

        // คัดกรอง schedule entries สำหรับวันนั้น:
        const applicableSchedules = roomSchedules.filter((entry) => {
          if (entry.schedule_date) {
            return getISODate(new Date(entry.schedule_date)) === rowISO;
          } else {
            return entry.week_day?.trim() === day;
          }
        });

        return `
        <tr ${isToday ? 'class="highlight"' : ""}>
          <td data-day="${index}">
            ${day} (${formattedDate})
            ${isToday ? '<span class="today-indicator">วันนี้</span>' : ""}
          </td>
          ${timeSlots
            .map((slot) => {
              // หา entry ที่ครอบคลุมช่วงเวลาใน cell นี้
              const matchingEntry = applicableSchedules.find((entry) => {
                // เปรียบเทียบโดยตรง (เวลาที่เก็บใน database ควรเป็น HH:MM:SS)
                return slot >= entry.start_time && slot < entry.end_time;
              });
              let cellClass = "available";
              let cellContent = "";
              if (matchingEntry) {
                const status = matchingEntry.room_status;
                if (status === "มีเรียน") {
                  cellClass = "class-time";
                  cellContent = "มีเรียน";
                } else if (status === "ไม่ว่าง") {
                  cellClass = "not-available";
                  cellContent = "ไม่ว่าง";
                } else if (status === "กำลังปรับปรุง") {
                  cellClass = "maintenance-time";
                  cellContent = "กำลังปรับปรุง";
                }
              }
              // ตรวจสอบการจอง ถ้า cell ยัง available
              if (cellClass === "available") {
                const isBooked = bookings.some((b) => {
                  const bookingISO = getISODate(new Date(b.used_date));
                  if (bookingISO !== rowISO) return false;
                  return slot >= b.start_time && slot < b.end_time;
                });
                if (isBooked) {
                  cellClass = "booked-time";
                  cellContent = "จองแล้ว";
                }
              }
              // กำหนดให้ cell ที่เป็น available สามารถคลิกเลือกได้เฉพาะวันปัจจุบันหรืออนาคต
              const canSelect = rowISO >= todayISO && cellClass === "available";
              return `<td class="${cellClass}" ${
                canSelect ? 'onclick="toggleSelection(this)"' : ""
              }>${cellContent}</td>`;
            })
            .join("")}
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("❌ Error fetching schedule:", error);
  }
}

/********************************
 * 7) updateTableForSelectedDate(date)
 *    - สร้างโครงสร้างตารางสำหรับสัปดาห์ที่เลือก แล้วโหลดข้อมูล
 ********************************/
async function updateTableForSelectedDate(date) {
  const selectedDate = new Date(date);
  const startOfWeek = getStartOfWeek(selectedDate);
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  // อัพเดท datePicker ด้วย
  document.getElementById("date-picker").value = getISODate(selectedDate);

  tbody.innerHTML = days
    .map((day, index) => {
      let currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + index);
      const formattedDate = getFormattedDate(currentDate);
      const isWeekend = index === 5 || index === 6; // เสาร์ (5), อาทิตย์ (6)

      console.log(
        `🔍 Checking: ${day} (${formattedDate}) -> isWeekend: ${isWeekend}`
      );

      return `
      <tr>
        <td data-day="${index}" class="${isWeekend ? "disabled" : ""}">
          ${day} (${formattedDate})
        </td>
        ${timeSlots
          .map(
            () =>
              `<td class="available" ${
                isWeekend
                  ? 'style="background-color: #f0f0f0; cursor: not-allowed;"'
                  : ""
              }></td>`
          )
          .join("")}
      </tr>
    `;
    })
    .join("");

  await fetchSchedule(date);
}

/********************************
 * 8) toggleSelection(cell)
 *    - เมื่อคลิก cell ให้เลือก (available cells เท่านั้น)
 ********************************/
let selectedDayIndex = null; // เก็บ index ของวันที่ถูกเลือกครั้งแรก
let selectedTimeIndexes = []; // เก็บ index ของเวลาที่ถูกเลือก

function toggleSelection(cell) {
  if (!cell.classList.contains("available")) {
    showAlert("ช่วงเวลานี้ไม่ว่าง!");
    return;
  }

  const row = cell.parentElement;
  const dayCell = row.querySelector("td");
  const dayIndex = parseInt(dayCell.dataset.day);
  const cellIndex = Array.from(row.children).indexOf(cell);

  // วันเสาร์-อาทิตย์
  if (dayIndex === 5 || dayIndex === 6) {
    showAlert("ไม่สามารถเลือกวันเสาร์-อาทิตย์ได้!");
    return;
  }

  // ตั้งค่าหมายเลขวัน
  if (selectedDayIndex === null) {
    selectedDayIndex = dayIndex;
  }

  if (dayIndex !== selectedDayIndex) {
    showAlert("ไม่สามารถเลือกข้ามวันได้!");
    return;
  }

  const alreadySelected = cell.classList.contains("checked");

  if (!alreadySelected) {
    // ✅ เพิ่มช่องใหม่
    if (selectedTimeIndexes.length === 0) {
      selectedTimeIndexes.push(cellIndex);
    } else {
      // ต้องติดกับอย่างน้อย 1 ช่อง
      const isAdjacent = selectedTimeIndexes.some(
        (index) => Math.abs(cellIndex - index) === 1
      );
      if (!isAdjacent) {
        showAlert("กรุณาเลือกช่วงเวลาที่ติดกันเท่านั้น!");
        return;
      }
      selectedTimeIndexes.push(cellIndex);
    }

    cell.classList.add("checked");
    cell.innerHTML = '<i class="fas fa-check"></i>';
  } else {
    // ✅ ลบช่องที่เลือก → ได้เฉพาะหัวหรือท้ายเท่านั้น
    selectedTimeIndexes.sort((a, b) => a - b);
    const min = selectedTimeIndexes[0];
    const max = selectedTimeIndexes[selectedTimeIndexes.length - 1];

    if (cellIndex !== min && cellIndex !== max) {
      showAlert("สามารถยกเลิกได้เฉพาะช่องแรกหรือช่องสุดท้ายเท่านั้น!");
      return;
    }

    // เอาออก
    selectedTimeIndexes = selectedTimeIndexes.filter(
      (index) => index !== cellIndex
    );
    cell.classList.remove("checked");
    cell.innerHTML = "";

    if (selectedTimeIndexes.length === 0) {
      selectedDayIndex = null;
    }
  }
}

/********************************
 * 9) highlightDay(date)
 *    - ไฮไลต์แถวที่ตรงกับวันปัจจุบัน (วันนี้) เท่านั้น
 ********************************/
function highlightDay(date) {
  // ล้าง highlight ทั้งหมดก่อน
  document.querySelectorAll("#schedule-table tbody tr").forEach((row) => {
    row.classList.remove("highlight");
  });

  // เคลียร์ "วันนี้" indicator ทั้งหมด
  document.querySelectorAll(".today-indicator").forEach((el) => {
    el.remove();
  });

  // ตรวจสอบวันปัจจุบัน (วันนี้)
  const today = new Date();
  const todayISO = getISODate(today);

  // วันที่เลือกในปฏิทิน
  const selectedDate = new Date(date);

  // หาวันจันทร์ของสัปดาห์ที่เลือก (เพื่อคำนวณวันแต่ละแถว)
  const startOfWeek = getStartOfWeek(selectedDate);

  // วนลูปแต่ละแถวในตาราง
  document.querySelectorAll("#schedule-table tbody tr").forEach((row) => {
    const dayCell = row.querySelector("td");
    if (!dayCell) return;

    // ตรวจสอบว่าเป็นวันหยุดหรือไม่
    const dayIndex = parseInt(dayCell.dataset.day);
    if (dayIndex === 5 || dayIndex === 6) {
      dayCell.classList.add("disabled"); // ป้องกันการเลือกวันหยุด
    }

    // หาวันที่ของแถวนี้
    const rowDate = new Date(startOfWeek);
    rowDate.setDate(startOfWeek.getDate() + dayIndex);
    const rowISO = getISODate(rowDate);

    // ถ้าเป็นวันนี้ ให้ highlight แถวและแสดง indicator "วันนี้"
    if (rowISO === todayISO) {
      row.classList.add("highlight");

      // เพิ่ม indicator "วันนี้"
      if (!dayCell.querySelector(".today-indicator")) {
        const indicator = document.createElement("span");
        indicator.className = "today-indicator";
        indicator.textContent = "วันนี้";
        dayCell.appendChild(indicator);
      }
    }
  });
}

/********************************
 * 10) confirmBooking()
 *    - เมื่อกด "ยืนยัน" จะเก็บข้อมูลวัน ห้อง เวลาเริ่ม-สิ้นสุด แล้วส่งไปหน้าต่อ
 ********************************/
let finalRedirectUrl;
async function confirmBooking() {
  const selectedCells = document.querySelectorAll("td.checked");
  if (selectedCells.length === 0) {
    showAlert("กรุณาเลือกช่วงเวลาที่ต้องการจอง!");
    return;
  }
  const rowSet = new Set();
  selectedCells.forEach((cell) => rowSet.add(cell.parentElement));
  if (rowSet.size > 1) {
    showAlert("ไม่สามารถเลือกเวลาข้ามวันได้!");
    return;
  }
  const row = selectedCells[0].parentElement;
  const dayCell = row.querySelector("td");
  const text = dayCell.textContent.replace("วันนี้", "").trim();
  const matched = text.match(/^(.*?)\s*\((\d{2}\/\d{2}\/\d{4})\)$/);
  let selectedDay, selectedDate;
  if (matched) {
    selectedDay = matched[1];
    const dateOnly = matched[2];
    const [d, m, y] = dateOnly.split("/");
    const yearInAD = parseInt(y) - 543;
    selectedDate = `${yearInAD}-${m}-${d}`;
  } else {
    console.error("รูปแบบวันไม่ตรงกับที่คาดไว้:", text);
    return;
  }
  let selectedIndexes = [];
  selectedCells.forEach((cell) => {
    const cellIndex = Array.from(row.children).indexOf(cell);
    selectedIndexes.push(cellIndex);
  });
  selectedIndexes.sort((a, b) => a - b);
  const startIndex = selectedIndexes[0];
  const endIndex = selectedIndexes[selectedIndexes.length - 1];
  const startTime = timeSlots[startIndex - 1] ?? timeSlots[startIndex]; // ✅ รองรับกรณี startIndex = 0
  const endTime =
    endIndex < row.children.length - 1
      ? timeSlots[endIndex]
      : addOneHour(timeSlots[endIndex - 1]);
  console.log("📄รายละเอียดการจอง📄");
  console.log("Selected Day:", selectedDay);
  console.log("Selected Date:", selectedDate);
  console.log("Start Time:", startTime);
  console.log("End Time:", endTime);
  const urlParams = new URLSearchParams({
    date: selectedDate,
    room: roomId,
    startTime: startTime,
    endTime: endTime,
  });
  finalRedirectUrl = `desk_equipment.html?${urlParams.toString()}`;
  // ดึงรายการจองแล้วเช็คซ้ำ
  try {
    const res = await fetch(`${API_URL}/booker/room_request`);
    const bookings = await res.json();

    const conflicts = bookings.filter((b) => {
      const dateObj = new Date(b.used_date);
      const bookingDate = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      const selectedISO = new Date(selectedDate).toISOString().split("T")[0];

      // แปลงเวลาให้ชัวร์ว่าเป็น string HH:MM:SS
      const bStart = b.start_time?.substring(0, 8); // "18:00:00"
      const bEnd = b.end_time?.substring(0, 8);
      const myStart = startTime?.substring(0, 8);
      const myEnd = endTime?.substring(0, 8);

      // แปลง room_id ทั้งสองฝั่งให้เป็น string เพื่อให้เทียบตรงกัน
      const sameRoom = String(b.room_id) === String(roomId);
      const sameDate = bookingDate === selectedISO;
      const overlap = isTimeOverlap(myStart, myEnd, bStart, bEnd);

      console.log("🟡 เปรียบเทียบ:", {
        bookingDate,
        selectedISO,
        bStart,
        bEnd,
        myStart,
        myEnd,
        sameRoom,
        sameDate,
        overlap,
      });

      return sameDate && sameRoom && overlap;
    });
    lastConflicts = conflicts;

    if (conflicts.length > 0) {
      showConflictModal(conflicts.length); // มีคิวซ้ำ → แสดง popup
    } else {
      window.location.href = finalRedirectUrl; // ไม่มีคิวซ้ำ → ไปหน้า desk ทันที
    }
    return;
  } catch (err) {
    console.error("❌ ตรวจสอบการจองซ้อนล้มเหลว:", err);
  }
}

/********************************
 * 11) DOMContentLoaded
 *    - ตั้งค่า datePicker เป็นวันนี้, กำหนด min (สำหรับการจอง)
 *    - โหลดตารางและตั้ง EventListener
 ********************************/
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const datePicker = document.getElementById("date-picker");
    datePicker.value = formattedDate;
    // สำหรับการจอง ให้ไม่เลือกวันย้อนหลัง แต่ให้ดูข้อมูลย้อนหลังได้
    datePicker.min = formattedDate;
    await updateTableForSelectedDate(formattedDate);
    highlightDay(formattedDate); // เรียกเพื่อ highlight วันนี้เสมอ

    // กำหนด EventListener สำหรับปุ่มย้อนกลับ
    document
      .getElementById("schedule-back")
      .addEventListener("click", function () {
        window.location.href = `Floor${roomId.charAt(0)}.html`;
      });

    document.getElementById("schedule-back").style.cursor = "pointer";

    // เพิ่ม EventListener สำหรับปุ่มนำทางสัปดาห์
    document
      .getElementById("prev-week-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        navigateWeek(-1);
      });

    document
      .getElementById("next-week-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        navigateWeek(1);
      });

    document
      .getElementById("current-week-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        const today = new Date();
        updateTableForSelectedDate(today);
        highlightDay(today); // เรียกเพื่อ highlight วันนี้เสมอ
      });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะโหลดตาราง:", error);
  }
  // แสดงชื่อห้องตาม room_id จาก URL
  if (roomId) {
    document.getElementById("room-name").textContent = `ห้อง: SC2-${roomId}`;
    console.log(`Loading schedule for room SC2-${roomId}`);
  }
  document
    .getElementById("date-picker")
    .addEventListener("change", async (event) => {
      await updateTableForSelectedDate(event.target.value);
      highlightDay(event.target.value); // เรียกเพื่อ highlight วันนี้เสมอ
    });
});

/********************************
 * 12) navigateWeek(direction)
 *    - ฟังก์ชันสำหรับเปลี่ยนสัปดาห์ (+1 หรือ -1)
 ********************************/
function navigateWeek(direction) {
  const datePicker = document.getElementById("date-picker");
  const currentDate = new Date(datePicker.value);

  // หาวันจันทร์ของสัปดาห์ปัจจุบัน
  const startOfWeek = getStartOfWeek(currentDate);

  // เพิ่ม/ลด 7 วัน (1 สัปดาห์)
  startOfWeek.setDate(startOfWeek.getDate() + 7 * direction);

  // อัพเดทตาราง
  updateTableForSelectedDate(startOfWeek);

  // ต้องเรียก highlightDay เพื่อแสดง highlight วันนี้หากอยู่ในสัปดาห์นี้
  highlightDay(startOfWeek);
}

/********************************
 * 13) ตรวจสอบเวลาซ้อนทับกัน
 ********************************/
function isTimeOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

let lastConflicts = []; // ⬅️ เก็บ conflicts ไว้ใช้ใน popup

function showConflictModal(count) {
  if (count === 0) return; // ป้องกันไม่ให้ popup ขึ้นถ้าไม่มีคิว

  const detailText = lastConflicts
    .map((b, i) => {
      const start = b.start_time?.substring(0, 5);
      const end = b.end_time?.substring(0, 5);
      return `คิว ${i + 1}. ${start} - ${end}`;
    })
    .join("<br>");

  Swal.fire({
    icon: "warning",
    title: `⚠️ มีการจองซ้อน ${count} คิว`,
    html: `<div style="text-align:center; font-size:16px;">${detailText}</div>ต้องการจองอยู่หรือไม่?`,
    showCancelButton: true,
    confirmButtonText: "ไปยังหน้าเลือกโต๊ะ",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#4CAF50",
    cancelButtonColor: "#f44336",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = finalRedirectUrl;
    }
  });
}

function closeModal() {
  document.getElementById("conflictModal").style.display = "none";
}

function proceedToDesk() {
  window.location.href = finalRedirectUrl;
}

/********************************
 * 14) WebSocket สำหรับการอัปเดตเรียลไทม์
 ********************************/
const socket = io(`${API_URL}`);
socket.on("connect", () => {
  console.log("WebSocket connected!");
});
socket.on("booking_update", fetchSchedule);
