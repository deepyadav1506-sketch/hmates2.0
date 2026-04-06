const API_BASE = 'http://localhost:5000/api';

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('hmates_currentUser') || 'null');
}

let ownerHostels = [];
let ownerBookings = [];

// Show sections
function showOwnerSection(section) {
  document.querySelectorAll('.owner-section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`owner-${section}-section`).classList.remove('hidden');

  if (section === 'my') loadMyHostels();
  if (section === 'bookings') loadOwnerBookings();
}

// Image preview
function previewImage() {
  const file = document.getElementById('hostelImage').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('imagePreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// Add hostel
async function addHostelFunc(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  const token = localStorage.getItem('hmates_token');

  if (!currentUser || !token) {
    alert("Login required");
    return;
  }

  const ownerId = currentUser._id || currentUser.id;

  const hostelData = {
    name: document.getElementById('hostelName').value,
    location: document.getElementById('hostelLocation').value,
    type: document.getElementById('hostelType').value,
    price: parseInt(document.getElementById('nonAcSingle').value),
    ownerId
  };

  try {
    const file = document.getElementById('hostelImage').files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        hostelData.image = reader.result;
        await saveHostel(hostelData, token);
      };
      reader.readAsDataURL(file);
    } else {
      await saveHostel(hostelData, token);
    }

  } catch (error) {
    console.error(error);
    alert("Failed to add hostel");
  }
}

// Save hostel
async function saveHostel(hostelData, token) {
  const res = await fetch(`${API_BASE}/hostels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(hostelData)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed");
    return;
  }

  alert("Hostel published ✅");

  document.querySelector('form').reset();
  document.getElementById('imagePreview').style.display = 'none';

  loadMyHostels();
}

// ✅ FIXED: Load my hostels
async function loadMyHostels() {
  const currentUser = getCurrentUser();
  const token = localStorage.getItem('hmates_token');

  const ownerId = currentUser?._id || currentUser?.id;

  if (!ownerId || !token) return;

  try {
    const res = await fetch(`${API_BASE}/hostels/my?ownerId=${ownerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    ownerHostels = await res.json();   // 🔥 IMPORTANT
    renderMyHostels();                 // 🔥 IMPORTANT

  } catch (error) {
    console.error(error);
  }
}

// Render hostels
function renderMyHostels() {
  const tbody = document.getElementById('myHostelsTable');

  if (!ownerHostels.length) {
    tbody.innerHTML = '<tr><td colspan="5">No hostels yet</td></tr>';
    return;
  }

  tbody.innerHTML = ownerHostels.map(h => `
    <tr>
      <td>${h.name}</td>
      <td>${h.location}</td>
      <td>₹${h.price}</td>
      <td>${h.type}</td>
      <td>
        <button onclick="deleteHostel('${h._id}')" class="btn-danger-sm">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ✅ FIXED: Load bookings
async function loadOwnerBookings() {
  const token = localStorage.getItem('hmates_token');

  if (!token) return;

  try {
    const hostelNames = ownerHostels.map(h => h.name).join(',');

    const res = await fetch(`${API_BASE}/bookings/owner?hostelNames=${hostelNames}`, {
      headers: {
        Authorization: `Bearer ${token}`   // 🔥 FIXED
      }
    });

    ownerBookings = await res.json();
    renderBookings();

  } catch (error) {
    console.error(error);
  }
}

// Render bookings
function renderBookings() {
  const container = document.getElementById('ownerBookingsList');

  if (!ownerBookings.length) {
    container.innerHTML = '<p>No bookings yet</p>';
    return;
  }

  container.innerHTML = ownerBookings.map(b => `
    <div class="booking-card">
      <h4>${b.name} <span style="float:right;">${b.date}</span></h4>
      <p>Phone: ${b.phone} | Hostel: ${b.hostel} | ₹${b.price}</p>
      <button onclick="contactStudent('${b.phone}')" class="btn-sm">Call</button>
    </div>
  `).join('');
}

// Delete hostel
async function deleteHostel(id) {
  const token = localStorage.getItem('hmates_token');

  if (!confirm("Delete this hostel?")) return;

  await fetch(`${API_BASE}/hostels/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadMyHostels();
}

// Call student
function contactStudent(phone) {
  window.open(`tel:${phone}`);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('owner.html')) {
    showOwnerSection('list');
  }
});