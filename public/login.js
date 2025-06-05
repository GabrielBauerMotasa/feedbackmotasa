// login.js
const form = document.getElementById("loginForm");
const error = document.getElementById("error");

const users = [
  { username: "admin", password: "1234" },
  { username: "rh", password: "rh123" },
  { username: "gestor", password: "gestor456" },
  // Adicione mais usuários aqui
];

const redirectTo = "relatorios.html"; // ou o que quiser

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const userFound = users.find(
    (u) => u.username === username && u.password === password
  );

  if (userFound) {
    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("username", username); // opcional
    window.location.href = redirectTo;
  } else {
    error.textContent = "Usuário ou senha incorretos.";
  }
});
