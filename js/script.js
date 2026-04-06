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
            // Load hostels (public)
            const hostelsRes = await fetch(`${API_BASE}/hostels`);
            this.hostels = await hostelsRes.json();
            window.app = this;

            if (document.getElementById('hostelGrid') || document.getElementById('homeHostelGrid')) {
                renderHostels(this.hostels);
            }

            // Load bookings (protected)
            const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser'));
            const token = localStorage.getItem('hmates_token');

            if (currentUser && token) {
                const bookingsRes = await fetch(`${API_BASE}/bookings/student?userId=${currentUser._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
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
        document.getElementById('statStudents') && (document.getElementById('statStudents').textContent = '100+');
        document.getElementById('statHostels') && (document.getElementById('statHostels').textContent = this.hostels.length + '+');
        document.getElementById('statBookings') && (document.getElementById('statBookings').textContent = this.bookings.length + '+');
    }
}

// ✅ FIXED BOOKING FUNCTION (TOKEN ADDED)
async function handleBooking(event) {
    event.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser'));
    const token = localStorage.getItem('hmates_token');

    const userId = currentUser?._id || currentUser?.id;

    if (!userId || !token) {
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
        userId
    };

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`   // 🔥 FIX
            },
            body: JSON.stringify(booking)
        });

        if (!res.ok) throw new Error("Booking failed");

        alert("Booking successful ✅");

        if (window.app) {
            await window.app.loadData();
            window.app.updateStats();
        }

        document.querySelector('form').reset();

    } catch (error) {
        console.error(error);
        alert('Booking failed.');
    }
}

// Price calculation
function updateBookingPrice() {
    const hostelSelect = document.getElementById('bookHostel');
    if (!hostelSelect?.value) return;

    let price = parseInt(hostelSelect.selectedOptions[0].dataset.price);

    if (document.getElementById('bookSharing')?.value === 'double') price -= 1000;
    if (document.getElementById('bookType')?.value === 'ac') price += 1500;

    document.getElementById('bookTotal').textContent = `₹${price}`;
}

// ✅ SINGLE CLEAN AUTH FUNCTION
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser') || 'null');
    const page = window.location.pathname.split('/').pop();

    if (page === 'booking.html' && (!currentUser || currentUser.role !== 'student')) {
        alert('Login as student required');
        window.location.href = 'login.html';
    }

    if (page === 'owner.html' && (!currentUser || currentUser.role !== 'owner')) {
        alert('Login as owner required');
        window.location.href = 'login.html';
    }
}

// Navbar
function updateNavDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('hmates_currentUser') || 'null');
    const btn = document.querySelector('.login-btn');

    if (btn && currentUser) {
        btn.innerHTML = currentUser.name;
        btn.onclick = logoutUser;
    }
}

// ✅ FIXED LOGOUT
function logoutUser() {
    localStorage.removeItem('hmates_currentUser');
    localStorage.removeItem('hmates_token');   // 🔥 IMPORTANT
    window.location.href = 'index.html';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavDisplay();
    window.app = new HMatesApp();
});