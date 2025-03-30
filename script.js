// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCfq6YcNfAfExWw3ChPDREw8U3oAKfKcSw",
    authDomain: "proyecto-rec-c048c.firebaseapp.com",
    databaseURL: "https://proyecto-rec-c048c-default-rtdb.firebaseio.com",
    projectId: "proyecto-rec-c048c",
    storageBucket: "proyecto-rec-c048c.appspot.com",
    messagingSenderId: "369525260052",
    appId: "1:369525260052:web:f376ed49de8e04e79d4c01",
    measurementId: "G-9WSCEYMJKW"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Activar la cámara
const video = document.getElementById("camera");
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error al acceder a la cámara:", err);
    });

// Función para clasificar la imagen (simulada)
function classifyImage() {
    const result = document.getElementById("classification-result");
    const suggestion = document.getElementById("bin-suggestion");

    // Simulación de clasificación con IA
    const materials = ["Papel", "Plástico", "Metal"];
    const material = materials[Math.floor(Math.random() * materials.length)];

    result.textContent = `Resultado: ${material}`;
    let bin = "Desconocido";
    if (material === "Papel") bin = "Papel";
    else if (material === "Plástico") bin = "Plásticos";
    else if (material === "Metal") bin = "Metales";

    suggestion.textContent = `Bótalo en: ${bin}`;

    // Guardar en Firebase
    const recordRef = db.ref(`usuarios/user123/residuos`).push();
    recordRef.set({
        material,
        bin,
        timestamp: new Date().toISOString()
    });
}

// Agregar evento al botón
document.getElementById("capture-btn").addEventListener("click", classifyImage);

