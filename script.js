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

// Secciones
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const classificationSection = document.getElementById("classification-section");

// Botones
document.getElementById("show-register").addEventListener("click", () => {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
});
document.getElementById("show-login").addEventListener("click", () => {
    registerSection.style.display = "none";
    loginSection.style.display = "block";
});

document.getElementById("register-btn").addEventListener("click", () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Registro exitoso.");
        })
        .catch(err => alert(err.message));
});

document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth.signInWithEmailAndPassword(email, password)
        .catch(err => alert(err.message));
});

document.getElementById("logout-btn").addEventListener("click", () => {
    auth.signOut();
});

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

// Cámara
const video = document.getElementById("camera");
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => console.error("Error cámara:", err));

// Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/Bd2P5VBit/";
let model, webcam, labelContainer, maxPredictions;

async function initModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
}

initModel();

async function classifyImage() {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    const prediction = await model.predict(canvas);
    const topPrediction = prediction.sort((a, b) => b.probability - a.probability)[0];

    const material = topPrediction.className;
    let bin = "Desconocido";
    if (material === "Papel") bin = "Papel";
    else if (material === "Plástico") bin = "Plásticos";
    else if (material === "Metal") bin = "Metales";

    document.getElementById("classification-result").textContent = `Resultado: ${material}`;
    document.getElementById("bin-suggestion").textContent = `Bótalo en: ${bin}`;

    const user = auth.currentUser;
    if (user) {
        const recordRef = db.ref(`usuarios/${user.uid}/residuos`).push();
        recordRef.set({
            material,
            bin,
            timestamp: new Date().toISOString()
        });
    }
}

document.getElementById("capture-btn").addEventListener("click", classifyImage);
