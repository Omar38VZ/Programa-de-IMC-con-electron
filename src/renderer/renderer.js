// DOM Elements
const form = document.getElementById('imc-form');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const resultContainer = document.getElementById('result-container');
const imcValueEl = document.getElementById('imc-value');
const imcClassificationEl = document.getElementById('imc-classification');
const historyBody = document.getElementById('history-body');
const clearBtn = document.getElementById('clear-btn');

// Load history on initialization
document.addEventListener('DOMContentLoaded', loadHistory);

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value);

  // Validation: empty or negative values
  if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
    alert("Por favor ingresa valores válidos y mayores a cero.");
    return;
  }

  // Calculate BMI
  const imc = weight / (height * height);
  const imcRounded = imc.toFixed(2);

  // Classify BMI
  const classificationInfo = classifyIMC(imc);

  // Update DOM with results
  imcValueEl.textContent = imcRounded;
  imcValueEl.style.color = classificationInfo.color;

  imcClassificationEl.textContent = classificationInfo.text;
  imcClassificationEl.style.backgroundColor = `${classificationInfo.color}20`; // 20 is hex for 12% opacity
  imcClassificationEl.style.color = classificationInfo.color;

  resultContainer.classList.remove('hidden');

  // Prepare history entry
  const now = new Date();
  const entry = {
    weight: weight.toFixed(1),
    height: height.toFixed(2),
    imc: imcRounded,
    classification: classificationInfo.text,
    color: classificationInfo.color,
    date: now.toLocaleString()
  };

  // Save to history via IPC
  const response = await window.api.saveHistory(entry);
  if (response.success) {
    appendHistoryRow(entry);
  } else {
    alert("Error al guardar en el historial: " + response.error);
  }
});

// Clear history
clearBtn.addEventListener('click', async () => {
  if (confirm("¿Estás seguro de que deseas limpiar todo el historial?")) {
    const response = await window.api.clearHistory();
    if (response.success) {
      historyBody.innerHTML = ''; // Clear table
      resultContainer.classList.add('hidden'); // Opcional: ocultar resultado actual
    } else {
      alert("Error al limpiar el historial: " + response.error);
    }
  }
});

// Helper: Classify IMC
function classifyIMC(imc) {
  if (imc < 18.5) {
    return { text: "Bajo peso", color: "var(--class-underweight)" };
  } else if (imc >= 18.5 && imc < 24.9) {
    return { text: "Normal", color: "var(--class-normal)" };
  } else if (imc >= 25 && imc < 29.9) {
    return { text: "Sobrepeso", color: "var(--class-overweight)" };
  } else {
    return { text: "Obesidad", color: "var(--class-obese)" };
  }
}

// Helper: Load history from main process
async function loadHistory() {
  const history = await window.api.getHistory();
  historyBody.innerHTML = '';
  history.forEach(entry => appendHistoryRow(entry));
}

// Helper: Append a single row to the table
function appendHistoryRow(entry) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.weight}</td>
    <td>${entry.height}</td>
    <td><strong>${entry.imc}</strong></td>
    <td>
      <span class="badge" style="background-color: ${entry.color}20; color: ${entry.color}">
        ${entry.classification}
      </span>
    </td>
  `;

  historyBody.appendChild(row);
}
