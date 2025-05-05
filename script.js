let model, maxPredictions;
let modelLoaded = false; // 🔴 NUEVO: Control de carga

const classifyBtn = document.getElementById("capture-btn");
classifyBtn.disabled = true; // 🔴 Desactiva botón hasta que se cargue el modelo

async function loadModel() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        modelLoaded = true;
        classifyBtn.disabled = false; // ✅ Activa el botón al cargar
        console.log("✅ Modelo cargado correctamente");
    } catch (error) {
        console.error("❌ Error cargando el modelo:", error);
    }
}
loadModel();

async function classifyImage() {
    if (!modelLoaded) {
        alert("El modelo aún no se ha cargado.");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const prediction = await model.predict(canvas);

    let topPrediction = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > topPrediction.probability) {
            topPrediction = prediction[i];
        }
    }

    const material = topPrediction.className;
    let bin = "Desconocido";
    if (material === "Papel") bin = "Papel";
    else if (material === "Plástico") bin = "Plásticos";
    else if (material === "Metal") bin = "Metales";

    document.getElementById("classification-result").textContent = `Resultado: ${material}`;
    document.getElementById("bin-suggestion").textContent = `Bótalo en: ${bin}`;

    const user = auth.currentUser;
    if (user) {
        const ref = db.ref(`usuarios/${user.uid}/residuos`).push();
        ref.set({
            material,
            bin,
            timestamp: new Date().toISOString()
        });
    }
}

classifyBtn.addEventListener("click", classifyImage);


