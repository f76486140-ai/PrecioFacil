alert("PrecioFácil está cargando el JavaScript");
// ========================================
// 1. ELEMENTOS HTML
// ========================================

const form = document.querySelector("#price-form");

const productName = document.querySelector("#product-name");
const costInput = document.querySelector("#cost");
const extrasInput = document.querySelector("#extras");
const marginInput = document.querySelector("#margin");

const marginValue = document.querySelector("#margin-value");
const salePrice = document.querySelector("#sale-price");
const resultName = document.querySelector("#result-name");
const totalCostOutput = document.querySelector("#total-cost");
const profitOutput = document.querySelector("#profit");
const resultMargin = document.querySelector("#result-margin");
const errorMessage = document.querySelector("#error-message");
const resetButton = document.querySelector("#reset-button");

const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history");
const downloadHistoryButton = document.querySelector("#download-history");


 // 2. HISTORIAL GUARDADO EN EL NAVEGADOR

const savedHistory = localStorage.getItem("precioFacilHistory");

let calculationHistory = [];

try {
  const parsedHistory = savedHistory
    ? JSON.parse(savedHistory)
    : [];

  if (Array.isArray(parsedHistory)) {
    calculationHistory = parsedHistory;
  }
} catch (error) {
  calculationHistory = [];
}



// ========================================
// 3. FORMATO DE DINERO
// ========================================

function money(amount) {
  return "S/ " + amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


// ========================================
// 4. MOSTRAR Y OCULTAR ERRORES
// ========================================

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}


// ========================================
// 5. CALCULAR EL PRECIO
// ========================================

function calculatePrice() {
  hideError();

  const costText = costInput.value.trim();
  const extrasText = extrasInput.value.trim();

  const cost = Number(costText);
  const extras = Number(extrasText);
  const margin = Number(marginInput.value);

  // Comprobar los costos
  if (
    costText === "" ||
    extrasText === "" ||
    !Number.isFinite(cost) ||
    !Number.isFinite(extras) ||
    cost < 0 ||
    extras < 0
  ) {
    showError("Introduce costos válidos de cero o más soles.");
    clearResults();
    return null;
  }

  const totalCost = cost + extras;

  if (!Number.isFinite(totalCost) || totalCost <= 0) {
    showError("El costo total debe ser mayor que cero.");
    clearResults();
    return null;
  }

  if (
    !Number.isFinite(margin) ||
    margin < 0 ||
    margin >= 100
  ) {
    showError("El margen debe estar entre 0% y menos de 100%.");
    clearResults();
    return null;
  }

  const price = totalCost / (1 - margin / 100);
  const profit = price - totalCost;

  if (!Number.isFinite(price) || !Number.isFinite(profit)) {
    showError("No se pudo calcular. Revisa los datos.");
    clearResults();
    return null;
  }

  // Mostrar resultados
  salePrice.textContent = money(price);
  totalCostOutput.textContent = money(totalCost);
  profitOutput.textContent = money(profit);
  resultMargin.textContent = `${margin}%`;

  resultName.textContent =
    productName.value.trim() || "Tu producto";

  return {
    name: productName.value.trim() || "Tu producto",
    totalCost: totalCost,
    price: price,
    profit: profit,
    margin: margin
  };
}


// ========================================
// 6. LIMPIAR RESULTADOS SI HAY UN ERROR
// ========================================

function clearResults() {
  salePrice.textContent = "—";
  totalCostOutput.textContent = "—";
  profitOutput.textContent = "—";
  resultMargin.textContent = "—";
  resultName.textContent = "Corrige los datos para calcular.";
}


// ========================================
// 7. MOSTRAR HISTORIAL
// ========================================

function renderHistory() {
  historyList.replaceChildren();

  if (calculationHistory.length === 0) {
    const message = document.createElement("p");
    message.textContent =
      "Todavía no hay productos en el historial.";

    historyList.appendChild(message);
    return;
  }

  calculationHistory.forEach((item) => {
    const card = document.createElement("article");
    card.className = "history-item";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const cost = document.createElement("p");
    cost.textContent = `Costo total: ${money(item.totalCost)}`;

    const price = document.createElement("p");
    price.textContent = `Precio de venta: ${money(item.price)}`;

    const profit = document.createElement("p");
    profit.textContent = `Ganancia: ${money(item.profit)}`;

    const margin = document.createElement("p");
    margin.textContent = `Margen: ${item.margin}%`;

    card.append(title, cost, price, profit, margin);
    historyList.appendChild(card);
  });
}


// ========================================
// 8. ACTUALIZAR PORCENTAJE AUTOMÁTICAMENTE
// ========================================

function updateMargin() {
  marginValue.textContent = `${marginInput.value}%`;
  calculatePrice();
}


// ========================================
// 9. EVENTOS
// ========================================

// Actualizar el cálculo al cambiar los datos
costInput.addEventListener("input", calculatePrice);
extrasInput.addEventListener("input", calculatePrice);
productName.addEventListener("input", calculatePrice);

marginInput.addEventListener("input", updateMargin);

// Guardar un producto al pulsar "Calcular precio"
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const result = calculatePrice();

  if (result === null) {
    return;
  }

  calculationHistory.unshift(result);

localStorage.setItem(
  "precioFacilHistory",
  JSON.stringify(calculationHistory)
);

renderHistory();
});


 // Borrar historial guardado
clearHistoryButton.addEventListener("click", function() {
  calculationHistory = [];

  localStorage.removeItem("precioFacilHistory");

  renderHistory();
});

// Restablecer formulario
resetButton.addEventListener("click", function() {
  form.reset();

  marginInput.value = "30";
  extrasInput.value = "0";
  marginValue.textContent = "30%";

  salePrice.textContent = "S/ 0.00";
  resultName.textContent = "Tu producto aparecerá aquí";
  totalCostOutput.textContent = "S/ 0.00";
  profitOutput.textContent = "S/ 0.00";
  resultMargin.textContent = "30%";

  hideError();
});

function downloadHistoryCSV() {
  if (calculationHistory.length === 0) {
    alert("Todavía no hay productos en el historial para descargar.");
    return;
  }

  const headers = [
    "Producto",
    "Costo total (S/)",
    "Precio de venta (S/)",
    "Ganancia (S/)",
    "Margen (%)"
  ];

  const rows = calculationHistory.map((item) => [
    item.name,
    item.totalCost.toFixed(2),
    item.price.toFixed(2),
    item.profit.toFixed(2),
    item.margin
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((value) =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(";")
    )
    .join("\r\n");

  // BOM para que Excel reconozca correctamente las tildes
  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "historial-preciofacil.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

downloadHistoryButton.addEventListener(
  "click",
  downloadHistoryCSV
);

// Inicializar página
marginValue.textContent = `${marginInput.value}%`;
renderHistory();
calculatePrice();
