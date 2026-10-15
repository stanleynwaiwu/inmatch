document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  const submitButton = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
      const response = await fetch('/api/admins/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      if (!data.token) {
        throw new Error('The server did not return a login token.');
      }

      localStorage.setItem('authToken', data.token);
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorMessage.textContent =
        error.message || 'Unable to connect to the server.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  });
});
