function toggleForm(formId) {
  document.getElementById("registrationForm").style.display =
    formId === "registrationForm" ? "block" : "none";
  document.getElementById("loginForm").style.display =
    formId === "loginForm" ? "block" : "none";
}

function registerUser() {
  const registerForm = document.getElementById("registerForm");
  const name = registerForm.querySelector('[name="name"]').value;
  const email = registerForm.querySelector('[name="email"]').value;
  const password = registerForm.querySelector('[name="password"]').value;
  const confirmPassword = registerForm.querySelector(
    '[name="confirmPassword"]'
  ).value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return false;
  }

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      alert(data.message);

      registerForm.reset();

      toggleForm("loginForm");
    });

  return false;
}

function loginUser() {
  const loginForm = document.getElementById("loginForm");
  const username = loginForm.querySelector('[name="username"]').value;
  const password = loginForm.querySelector('[name="password"]').value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        alert("Login successful");
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    });

  return false;
}

