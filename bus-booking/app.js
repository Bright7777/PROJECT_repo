const FARE_PER_SEAT = 172.0;
const ADDITIONAL_CHARGE = 2.0;
const TOTAL_SEATS = 44;

const el = (id) => document.getElementById(id);
const formatMoney = (n) => `GHS ${n.toFixed(2)}`;

const state = {
  selectedSeats: new Set(),
  bookedSeats: new Set(),
  traveller: null,
};

function saveToStorage() {
  const data = {
    selectedSeats: [...state.selectedSeats],
    bookedSeats: [...state.bookedSeats],
    traveller: state.traveller,
  };
  localStorage.setItem("bookingState", JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem("bookingState");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.selectedSeats = new Set(data.selectedSeats || []);
    state.bookedSeats = new Set(data.bookedSeats || []);
    state.traveller = data.traveller || null;
  } catch {}
}

function show(sectionId) {
  ["tripSection", "loadingSection", "seatsSection", "detailsSection", "receiptSection"].forEach((id) => {
    el(id).classList.add("hidden");
  });
  el(sectionId).classList.remove("hidden");
}

function simulateLoading(nextSectionId) {
  show("loadingSection");
  setTimeout(() => show(nextSectionId), 800);
}

function renderSeats() {
  const grid = el("seatsGrid");
  grid.innerHTML = "";
  for (let i = 1; i <= TOTAL_SEATS; i++) {
    const seatBtn = document.createElement("button");
    seatBtn.type = "button";
    seatBtn.className = "seat";
    seatBtn.dataset.seat = String(i);
    seatBtn.innerHTML = `${i}`;

    if (state.bookedSeats.has(i)) {
      seatBtn.classList.add("booked");
      seatBtn.disabled = true;
    } else if (state.selectedSeats.has(i)) {
      seatBtn.classList.add("selected");
    }

    seatBtn.addEventListener("click", () => toggleSeat(i));
    grid.appendChild(seatBtn);
  }
  updateCounters();
}

function toggleSeat(seatNum) {
  if (state.selectedSeats.has(seatNum)) {
    state.selectedSeats.delete(seatNum);
  } else {
    state.selectedSeats.add(seatNum);
  }
  saveToStorage();
  renderSeats();
  renderCart();
}

function renderCart() {
  const tbody = el("cartBody");
  tbody.innerHTML = "";
  const selected = [...state.selectedSeats].sort((a, b) => a - b);
  selected.forEach((num) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${num}</td><td>${formatMoney(FARE_PER_SEAT)}</td>`;
    const tdDelete = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.dataset.seat = String(num);
    delBtn.addEventListener('click', (e) => {
      const seat = Number(e.currentTarget.dataset.seat);
      toggleSeat(seat);
    });
    tdDelete.appendChild(delBtn);
    tr.appendChild(tdDelete);
    tbody.appendChild(tr);
  });

  const total = selected.length * FARE_PER_SEAT;
  el("cartTotal").textContent = formatMoney(total);
  el("proceedDetails").disabled = selected.length === 0;

  // Mirror on details page
  const tbody2 = el("cartBody2");
  if (tbody2) {
    tbody2.innerHTML = tbody.innerHTML;
    tbody2.querySelectorAll('button.btn-danger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const seat = Number(e.currentTarget.dataset.seat);
        toggleSeat(seat);
      });
    });
  }

  const fees = selected.length > 0 ? ADDITIONAL_CHARGE : 0;
  const payBtn = el("payBtn");
  const feesNote = el("feesNote");
  if (payBtn) payBtn.textContent = `Pay ${formatMoney(total)}`;
  if (feesNote) feesNote.textContent = fees > 0 ? `Additional Charges of ${formatMoney(fees)}` : "";
}

function updateCounters() {
  el("totalSeats").textContent = String(TOTAL_SEATS);
  const available = TOTAL_SEATS - state.bookedSeats.size;
  el("availableSeats").textContent = String(available);
}

function handleProceedDetails() {
  simulateLoading("detailsSection");
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(form);
  const traveller = Object.fromEntries(formData.entries());
  state.traveller = traveller;

  // Mock payment success and mark seats as booked
  [...state.selectedSeats].forEach((n) => state.bookedSeats.add(n));
  state.selectedSeats.clear();
  saveToStorage();

  const purchasedSeats = [...state.bookedSeats];
  renderSeats();
  renderCart();

  el("receiptText").textContent = `Thank you ${traveller.name}. Your booking for seat(s) ${purchasedSeats.join(', ')} is confirmed. A receipt has been sent to ${traveller.email}.`;
  show("receiptSection");
}

function resetAll() {
  state.selectedSeats.clear();
  state.traveller = null;
  saveToStorage();
  renderSeats();
  renderCart();
  show("tripSection");
}

function wireEvents() {
  el("year").textContent = String(new Date().getFullYear());
  el("startBooking").addEventListener("click", () => {
    simulateLoading("seatsSection");
  });
  el("proceedDetails").addEventListener("click", handleProceedDetails);
  el("detailsForm").addEventListener("submit", handleFormSubmit);
  el("newBooking").addEventListener("click", resetAll);
}

function init() {
  loadFromStorage();
  renderSeats();
  renderCart();
  wireEvents();
}

init();