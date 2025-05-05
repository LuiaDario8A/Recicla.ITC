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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// UI Elements
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const classificationSection = document.getElementById("classification-section");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

// Eventos de cambio entre login y registro
document.getElementById("show-register").addEventListener("click", () => {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
});
document.getElementById("show-login").addEventListener("click", () => {
    registerSection.style.display = "none";
    loginSection.style.display = "block";
});

// Registro
registerBtn.addEventListener("click", () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Registrado correctamente");
        })
        .catch(error => alert(error.message));
});

// Login
loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

// Logout
logoutBtn.addEventListener("click", () => {
    auth.signOut();
});

// Auth state
auth.onAuthStateChanged(user => {
    if (user) {
        loginSection.style.display = "none";
        registerSection.style.display = "none";
        classificationSection.style.display = "block";
    } else {
        loginSection.style.display = "block";
        registerSection.style.display = "none";
        classificationSection.style.display = "none";
    }
});

// Activar cámara
const video = document.getElementById("camera");
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error al acceder a la cámara:", err);
    });

// Teachable Machine
const modelURL = "https://teachablemachine.withgoogle.com/models/Bd2P5VBit/";
let model, webcam, labelContainer, maxPredictions;

async function loadModel() {
    const URL = modelURL;
    const modelURLJSON = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURLJSON, metadataURL);
    console.log("Modelo cargado");
}
loadModel();

document.getElementById("capture-btn").addEventListener("click", async () => {
    if (!model) {
        alert("El modelo aún no se ha cargado.");
        return;
    }

    // Crear un canvas y capturar frame de video
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    // Clasificar imagen
    const prediction = await model.predict(canvas);
    const sorted = prediction.sort((a, b) => b.probability - a.probability);
    const best = sorted[0];

    const material = best.className;
    const result = document.getElementById("classification-result");
    const suggestion = document.getElementById("bin-suggestion");

    result.textContent = `Resultado: ${material}`;
    let bin = "Desconocido";
    if (material === "Papel") bin = "Papel";
    else if (material === "Plástico") bin = "Plásticos";
    else if (material === "Metal") bin = "Metales";

    suggestion.textContent = `Bótalo en: ${bin}`;

    // Guardar en Firebase
    const user = auth.currentUser;
    if (user) {
        const ref = db.ref(`usuarios/${user.uid}/residuos`).push();
        ref.set({
            material,
            bin,
            timestamp: new Date().toISOString()
        });
    }
});
