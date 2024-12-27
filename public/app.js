const formulario = document.querySelector('.formulario');
const divisasContainer = document.querySelector(".divisas-container");
const precioTotal = document.querySelector(".info-total");
const precioA = document.querySelector("#precio-a");
const precioB = document.querySelector("#precio-b");

const intercambioImg = document.querySelector(".intercambio-img");
intercambioImg.addEventListener("click", intercambiarMonedas);

let conversionRates = {};

formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    llenarSelects();
});

async function apiDivisas() {
    const url = "https://v6.exchangerate-api.com/v6/15fd308857e4a72c49dc791b/latest/USD";
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.conversion_rates) {
            conversionRates = data.conversion_rates;
            llenarSelects();
        } else {
            console.error("Error: No se obtuvieron datos válidos de la API.");
        }
    } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
    }
}

function llenarSelects() {
    divisasContainer.innerHTML = "";

    const selectA = document.createElement("select");
    const selectB = document.createElement("select");
    selectA.classList.add("select-pais");
    selectB.classList.add("select-pais");

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

    selectA.value = "USD";
    selectB.value = Object.keys(conversionRates).find(currency => currency !== "USD");

    selectA.addEventListener("change", () => {
        evitarMonedasDuplicadas(selectA, selectB);
        calcularConversion();
    });
    selectB.addEventListener("change", () => {
        evitarMonedasDuplicadas(selectB, selectA);
        calcularConversion();
    });

    divisasContainer.appendChild(selectA);
    divisasContainer.appendChild(selectB);

    precioA.addEventListener("input", validarEntrada);
    precioA.addEventListener("input", calcularConversion);

    precioB.disabled = true; // Deshabilitar el segundo campo

    calcularConversion();
}

function evitarMonedasDuplicadas(selectOrigen, selectDestino) {
    const valorSeleccionado = selectOrigen.value;

    if (selectDestino.value === valorSeleccionado) {
        const opcionesValidas = Array.from(selectDestino.options).filter(option => option.value !== valorSeleccionado);
        if (opcionesValidas.length > 0) {
            selectDestino.value = opcionesValidas[0].value;
        }
    }
}

function validarEntrada(event) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9.]/g, ""); // Eliminar caracteres no numéricos
    if (input.value.includes(".")) {
        input.value = input.value.split(".")[0] + "." + input.value.split(".")[1].slice(0, 2); // Limitar a 2 decimales
    }
    if (parseFloat(input.value) < 0) {
        input.value = ""; // No permitir números negativos
    }
}

function calcularConversion() {
    const monedaA = divisasContainer.querySelectorAll(".select-pais")[0].value;
    const monedaB = divisasContainer.querySelectorAll(".select-pais")[1].value;

    const cantidad = parseFloat(precioA.value);

    if (!monedaA || !monedaB || isNaN(cantidad)) {
        precioB.value = "";
        precioTotal.textContent = "N/A";
        return;
    }

    const tasaA = conversionRates[monedaA];
    const tasaB = conversionRates[monedaB];
    const resultado = (cantidad / tasaA) * tasaB;

    precioB.value = resultado.toFixed(2); // Mostrar resultado en el campo deshabilitado
    precioTotal.textContent = `${resultado.toFixed(2)} ${monedaB}`;
}

function intercambiarMonedas() {
    const selectA = divisasContainer.querySelectorAll(".select-pais")[0];
    const selectB = divisasContainer.querySelectorAll(".select-pais")[1];

    const monedaA = selectA.value;
    const monedaB = selectB.value;

    selectA.value = monedaB;
    selectB.value = monedaA;

    calcularConversion();
}

apiDivisas();
