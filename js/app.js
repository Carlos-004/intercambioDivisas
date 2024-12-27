// Selección de elementos del DOM
const formulario = document.querySelector('.formulario');
const divisasContainer = document.querySelector(".divisas-container");
const precioTotal = document.querySelector(".info-total");
const precioA = document.querySelector("#precio-a");
const precioB = document.querySelector("#precio-b");

const intercambioImg = document.querySelector(".intercambio-img");
intercambioImg.addEventListener("click", intercambiarMonedas);

const dataDivisas = [];
let conversionRates = {};

// Evento para el formulario
formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    llenarSelects();
});

// Función para obtener las divisas desde la API
async function apiDivisas() {
    const url = "https://v6.exchangerate-api.com/v6/15fd308857e4a72c49dc791b/latest/USD";
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Verificar si se obtuvieron datos válidos
        if (data && data.conversion_rates) {
            conversionRates = data.conversion_rates; // Guardar las tasas de conversión
            llenarSelects();
        } else {
            console.error("Error: No se obtuvieron datos válidos de la API.");
        }
    } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
    }
}

// Llenar los selects dinámicamente con las divisas
function llenarSelects() {
    divisasContainer.innerHTML = ""; // Limpiar contenedor

    // Crear los dos selects
    const selectA = document.createElement("select");
    const selectB = document.createElement("select");
    selectA.classList.add("select-pais");
    selectB.classList.add("select-pais");

    // Agregar opciones de divisas
    Object.entries(conversionRates).forEach(([currency]) => {
        const optionA = document.createElement("option");
        const optionB = document.createElement("option");

        optionA.value = currency;
        optionA.textContent = currency;

        optionB.value = currency;
        optionB.textContent = currency;

        selectA.appendChild(optionA);
        selectB.appendChild(optionB);
    });

    // Agregar selects al contenedor
    divisasContainer.appendChild(selectA);
    divisasContainer.appendChild(selectB);

    // Escuchar cambios en los selects
    selectA.addEventListener("change", calcularConversion);
    selectB.addEventListener("change", calcularConversion);

    // Escuchar cambios en los inputs
    precioA.addEventListener("input", calcularConversion);
}

// Calcular la conversión de divisas
function calcularConversion() {
    const monedaA = divisasContainer.querySelectorAll(".select-pais")[0].value;
    const monedaB = divisasContainer.querySelectorAll(".select-pais")[1].value;

    const cantidad = parseFloat(precioA.value);

    if (!monedaA || !monedaB || isNaN(cantidad)) {
        precioB.value = ""; // Limpiar input si faltan datos
        precioTotal.textContent = "N/A"; // Actualizar mensaje
        return;
    }

    // Calcular la conversión
    const tasaA = conversionRates[monedaA];
    const tasaB = conversionRates[monedaB];
    const resultado = (cantidad / tasaA) * tasaB;

    precioB.value = resultado.toFixed(2); // Mostrar resultado redondeado a 2 decimales
    precioTotal.textContent = `${resultado.toFixed(2)} ${monedaB}`; // Actualizar resultado en `precioTotal`
}

// Función para intercambiar las monedas
function intercambiarMonedas() {
    // Obtener los selects
    const selectA = divisasContainer.querySelectorAll(".select-pais")[0];
    const selectB = divisasContainer.querySelectorAll(".select-pais")[1];

    // Obtener los valores seleccionados
    const monedaA = selectA.value;
    const monedaB = selectB.value;

    // Intercambiar los valores
    selectA.value = monedaB;
    selectB.value = monedaA;

    // Actualizar el cálculo después del intercambio
    calcularConversion();
}



apiDivisas();
