const API_BASE = 'http://localhost:5000/api';

// Always get fresh user
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

// ✅ Add hostel (FINAL FIX)
async function addHostelFunc(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();

  if (!currentUser) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  // 🔥 IMPORTANT: handle both id and _id
  const ownerId = currentUser._id || currentUser.id;

  if (!ownerId) {
    alert("User ID missing. Please login again.");
    console.log("User object:", currentUser);
    return;
  }

  const hostelData = {
    name: document.getElementById('hostelName').value,
    location: document.getElementById('hostelLocation').value,
    type: document.getElementById('hostelType').value,
    price: parseInt(document.getElementById('nonAcSingle').value),
    ownerId: ownerId   // ✅ guaranteed value
  };

  try {
    const file = document.getElementById('hostelImage').files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        hostelData.image = reader.result;
        await saveHostel(hostelData);
      };
      reader.readAsDataURL(file);
    } else {
      await saveHostel(hostelData);
    }

  } catch (error) {
    console.error(error);
    alert("Failed to add hostel");
  }
}

// Save hostel
async function saveHostel(hostelData) {
  try {
    console.log("Sending data:", hostelData); // 🔍 debug

    const res = await fetch(`${API_BASE}/hostels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hostelData)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Backend error:", data);
      throw new Error(data.error || "Failed");
    }

    alert("Hostel published successfully ✅");

    document.querySelector('form').reset();
    document.getElementById('imagePreview').style.display = 'none';

    loadMyHostels();

  } catch (error) {
    console.error(error);
    alert("Publish failed ❌");
  }
}

// Load my hostels
async function loadMyHostels() {
  const currentUser = getCurrentUser();
  const ownerId = currentUser?._id || currentUser?.id;

  if (!ownerId) return;

  try {
    const res = await fetch(`${API_BASE}/hostels/my?ownerId=${ownerId}`);
    ownerHostels = await res.json();
    renderMyHostels();
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

// Load bookings
async function loadOwnerBookings() {
  const currentUser = getCurrentUser();
  const ownerId = currentUser?._id || currentUser?.id;

  if (!ownerId) return;

  try {
    if (!ownerHostels.length) {
      const res = await fetch(`${API_BASE}/hostels/my?ownerId=${ownerId}`);
      ownerHostels = await res.json();
    }

    const hostelNames = ownerHostels.map(h => h.name).join(',');

    const res = await fetch(`${API_BASE}/bookings/owner?hostelNames=${hostelNames}`);
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
  if (!confirm("Delete this hostel?")) return;

  await fetch(`${API_BASE}/hostels/${id}`, {
    method: 'DELETE'
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