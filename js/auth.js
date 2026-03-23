// MongoDB API Integration - Auth handlers
const API_BASE = 'http://localhost:5000/api';

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function handleLogin(event) {
    event.preventDefault();
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    
    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role, email, pass })
      });
      
      if (result.error) {
        alert(result.error);
        return;
      }
      
      localStorage.setItem('hmates_currentUser', JSON.stringify(result.user));
      localStorage.setItem('hmates_token', result.token);
      alert('Login successful!');
      
      if (role === 'student') {
        window.location.href = 'booking.html';
      } else {
        window.location.href = 'owner.html';
      }
    } catch (error) {
      alert('Login failed. Is server running?');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const data = {
        role: document.getElementById('regRole').value,
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        org: document.getElementById('regOrg').value,
        pass: document.getElementById('regPass').value
    };
    
    try {
      const result = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (result.error) {
        alert(result.error);
        return;
      }
      
      alert('Registered successfully!');
      window.location.href = 'login.html';
    } catch (error) {
      alert('Registration failed. Is server running?');
    }
}

function toggleRegField() {
    const role = document.getElementById('regRole').value;
    const orgInput = document.getElementById('regOrg');
    if (role === 'owner') {
        orgInput.required = true;
        orgInput.placeholder = 'Hostel Name';
    } else {
        orgInput.required = false;
        orgInput.placeholder = 'College';
    }
}

function logoutUser() {
    localStorage.removeItem('hmates_currentUser');
    localStorage.removeItem('hmates_token');
    window.location.href = 'index.html';
}
