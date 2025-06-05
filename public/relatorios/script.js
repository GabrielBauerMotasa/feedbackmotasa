const BASE_API_URL = "/.netlify/functions/relatorio";

const urlParams = new URLSearchParams(window.location.search);
const SECRET_ID = urlParams.get("id");

// REMOVI o bloqueio por falta do ID secreto
// Antes tinha um if que bloqueava a página se não tivesse o ID.
// Agora ele simplesmente não obriga o ID, então segue normalmente.

const tableBody = document.querySelector("#feedbackTable tbody");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const filterVendedor = document.getElementById("filterVendedor");
const filterStartDate = document.getElementById("filterStartDate");
const filterEndDate = document.getElementById("filterEndDate");
const btnFilter = document.getElementById("btnFilter");
const btnReset = document.getElementById("btnReset");
const btnExport = document.getElementById("btnExport");

let feedbacks = [];

function formatDateBR(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function setButtonsDisabled(state) {
  btnFilter.disabled = state;
  btnReset.disabled = state;
}

function validateFilters() {
  message.textContent = "";

  const start = filterStartDate.value;
  const end = filterEndDate.value;

  if (start && end && start > end) {
    message.textContent = "Data inicial não pode ser maior que a data final.";
    return false;
  }
  return true;
}

function areFiltersEmpty() {
  return (
    filterVendedor.value.trim() === "" &&
    filterStartDate.value === "" &&
    filterEndDate.value === ""
  );
}

function updateFilterButtonState() {
  btnFilter.disabled = areFiltersEmpty();
}

function buildQueryString() {
  const params = new URLSearchParams();
  // Não inclui mais o ID secreto porque não é obrigatório
  if (filterVendedor.value.trim() !== "") {
    params.append("vendedor", filterVendedor.value.trim());
  }
  if (filterStartDate.value) {
    params.append("startDate", filterStartDate.value);
  }
  if (filterEndDate.value) {
    params.append("endDate", filterEndDate.value);
  }

  return params.toString();
}

function loadFeedbacks() {
  if (!validateFilters()) return;

  setButtonsDisabled(true);
  loading.style.display = "block";
  message.textContent = "";
  tableBody.innerHTML = "";

  const queryString = buildQueryString();
  const url = `${BASE_API_URL}?${queryString}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao carregar dados");
      return res.json();
    })
    .then(data => {
      feedbacks = data.data || [];
      if (feedbacks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum feedback encontrado.</td></tr>`;
      } else {
        renderTable(feedbacks);
      }
      loading.style.display = "none";
      setButtonsDisabled(false);
      updateFilterButtonState();
    })
    .catch(err => {
      loading.style.display = "none";
      message.textContent = err.message || "Erro ao carregar dados.";
      setButtonsDisabled(false);
      updateFilterButtonState();
    });
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(fb => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Atendente">${fb.vendedor || "-"}</td>
      <td data-label="Empresa/Nome">${fb.empresa || "-"}</td>
      <td data-label="Estrelas">${fb.rating || "-"}</td>
      <td data-label="Comentário">${fb.comment || "-"}</td>
      <td data-label="Data">${formatDateBR(fb.created_at || fb.createdAt || fb.date)}</td>
      <td data-label="IP">${fb.ip_address || "-"}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function resetFilters() {
  filterVendedor.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  message.textContent = "";
  updateFilterButtonState();
  loadFeedbacks();
}

function exportToCSV() {
  if (!feedbacks.length) {
    message.textContent = "Nada para exportar.";
    return;
  }
  // Implementação do CSV continua aqui...
}

// Inicializa o carregamento dos feedbacks ao abrir a página
loadFeedbacks();
