// MongoDB API Integration - Main App
const API_BASE = 'http://localhost:5000/api';

class HMatesApp {
    constructor() {
        this.hostels = [];
        this.bookings = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.bindEvents();
        this.loadPageSpecificContent();
    }
 
   async loadData() {
    try {
        // Load hostels
        const hostelsRes = await fetch(`${API_BASE}/hostels`);
        this.hostels = await hostelsRes.json();
        window.app = this;   // 🔥 IMPORTANT LINE

        // ✅ ADD THIS LINE
        if (document.getElementById('hostelGrid')|| document.getElementById('homeHostelGrid')) {
            renderHostels(this.hostels);
        }

        // Load bookings
        const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser'));
        if (currentUser && currentUser._id) {
            const bookingsRes = await fetch(`${API_BASE}/bookings?userId=${currentUser._id}`);
            this.bookings = await bookingsRes.json();
        }

    } catch (error) {
        console.error('Data load error:', error);
    }
}

    bindEvents() {
        if (document.getElementById('bookHostel')) {
            this.populateBookingSelect();
        }
    }

    loadPageSpecificContent() {
        if (document.getElementById('bookHostel')) {
            this.populateBookingSelect();
        }
        if (document.getElementById('statStudents')) {
            this.updateStats();
        }
    }

    populateBookingSelect() {
        const select = document.getElementById('bookHostel');
        if (select && this.hostels.length) {
            select.innerHTML =
                '<option value="">Choose hostel...</option>' +
                this.hostels.map(h =>
                    `<option value="${h.name}" data-price="${h.price}">
                        ${h.name} (₹${h.price}/month)
                    </option>`
                ).join('');
        }
    }

    updateStats() {
        const studentsEl = document.getElementById('statStudents');
        const hostelsEl = document.getElementById('statHostels');
        const bookingsEl = document.getElementById('statBookings');

        if (studentsEl) studentsEl.textContent = '100+';
        if (hostelsEl) hostelsEl.textContent = this.hostels.length + '+';
        if (bookingsEl) bookingsEl.textContent = this.bookings.length + '+';
    }
}

// ✅ Booking function (FIXED)
async function handleBooking(event) {
    event.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser'));

const userId = currentUser?._id || currentUser?.id;

if (!userId) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
}

const booking = {
    name: document.getElementById('bookName').value,
    phone: document.getElementById('bookPhone').value,
    hostel: document.getElementById('bookHostel').value,
    price: document.getElementById('bookTotal').textContent,
    date: new Date().toLocaleString(),
    userId: userId   // ✅ FIXED
};

    try {
        const res = await fetch(`${API_BASE}/bookings`, {   // ✅ FIXED
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });

        if (!res.ok) throw new Error("Booking failed");

        alert("Booking successful!");

        if (window.app) {
            await window.app.loadData();
            window.app.updateStats();
        }

        document.querySelector('form').reset();

    } catch (error) {
        console.error(error);
        alert('Booking failed. Check backend.');
    }
}

// Price calculation
function updateBookingPrice() {
    const hostelSelect = document.getElementById('bookHostel');
    if (!hostelSelect?.value) return;

    const hostelPrice = parseInt(hostelSelect.options[hostelSelect.selectedIndex].dataset.price) || 6000;
    let price = hostelPrice;

    const sharing = document.getElementById('bookSharing')?.value || 'single';
    const type = document.getElementById('bookType')?.value || 'non-ac';

    if (sharing === 'double') price -= 1000;
    if (type === 'ac') price += 1500;

    document.getElementById('bookTotal').textContent = `₹${price}`;
}

// Auth check
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser') || 'null');
    const page = window.location.pathname.split('/').pop();

    if (page === 'booking.html' && (!currentUser || currentUser.role !== 'student')) {
        alert('Login as student required');
        window.location.href = 'login.html';
    }
}

// Navbar update
function updateNavDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser') || 'null');
    const btn = document.querySelector('.login-btn');

    if (btn && currentUser) {
        btn.innerHTML = currentUser.name;
        btn.onclick = logoutUser;
    }
}

function logoutUser() {
    localStorage.removeItem('hmates_currentUser');
    window.location.href = 'index.html';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavDisplay();
    window.app = new HMatesApp();
});
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser') || 'null');
    const pathname = window.location.pathname.split('/').pop();
    
    if (pathname === 'booking.html') {
        if (!currentUser || currentUser.role !== 'student') {
            alert('Student login required for booking.');
            window.location.href = 'login.html';
            return false;
        }
    }
    
    if (pathname === 'owner.html') {
        if (!currentUser || currentUser.role !== 'owner') {
            alert('Owner login required.');
            window.location.href = 'login.html';
            return false;
        }
    }
    
    return true;
}
function renderHostels(hostels) {
  const grid = document.getElementById('hostelGrid') || document.getElementById('homeHostelGrid');
  if (!grid) return;

  grid.innerHTML = hostels.map(h => `
    <div class="card ${h.type}">
      
      <!-- 🔥 TAG BACK -->
      <div class="tag ${h.type === 'premium' ? 'gold' : ''}">
        ${h.type.toUpperCase()}
      </div>

      <img src="${h.image || 'https://via.placeholder.com/400'}" alt="${h.name}" />

      <div class="card-info">
        <h3>${h.name}</h3>

        <p class="location">📍 ${h.location}</p>

        <p class="features">
          ❄️ AC/Non-AC &nbsp; 📶 Free WiFi &nbsp; 🍽️ Food Included
        </p>

        <div class="card-footer">
          <span class="price">₹${h.price}/mo</span>
          <button class="btn-sm" onclick="bookHostel('${h._id}', '${h.name}', ${h.price})">
            Book Now
          </button>
        </div>
      </div>

    </div>
  `).join('');
}
function bookHostel(id, name, price) {
  localStorage.setItem('selectedHostel', JSON.stringify({ id, name, price }));
  window.location.href = "booking.html";
}
// filter hostels
function filterHostels() {
  if (!window.app || !window.app.hostels) return;

  const type = document.getElementById('hostelFilter').value;
  const search = document.getElementById('hostelSearch').value.toLowerCase();

  let filtered = window.app.hostels;

  // 🔥 filter by type
  if (type !== 'all') {
    filtered = filtered.filter(h => h.type === type);
  }

  // 🔥 filter by search
  if (search) {
    filtered = filtered.filter(h =>
      h.name.toLowerCase().includes(search) ||
      h.location.toLowerCase().includes(search)
    );
  }

  renderHostels(filtered);
}