document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      // Store authentication token or flag in localStorage
      localStorage.setItem('authToken', data.token || 'authenticated');
      // Redirect to main app page
      window.location.href = 'index.html';
    } else {
      document.getElementById('error').textContent = 'Invalid credentials';
    }
  } catch (error) {
    document.getElementById('error').textContent = 'Login failed. Please try again.';
    console.error('Login error:', error);
  }
};

// On protected pages (e.g. index.html or any page under /app/), add this script:
document.addEventListener('DOMContentLoaded', () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    // Not authenticated, redirect to login page
    window.location.href = 'login.html';
  }
});

// Optional: Provide logout function
function logout() {
  localStorage.removeItem('authToken');
  window.location.href = 'login.html';
}
