const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");

const startCameraBtn = document.getElementById("startCamera");
const takePhotoBtn = document.getElementById("takePhoto");
const retakePhotoBtn = document.getElementById("retakePhoto");
const sendEmailBtn = document.getElementById("sendEmail");

let stream = null;
let photoData = null;

// Activar cámara
startCameraBtn.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    message.textContent = "Cámara activada.";
  } catch (error) {
    console.error(error);
    message.textContent = "No se pudo acceder a la cámara.";
  }
});

// Tomar fotografía
takePhotoBtn.addEventListener("click", () => {
  if (!stream) {
    message.textContent = "Primero debes activar la cámara.";
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  photoData = canvas.toDataURL("image/jpeg", 0.9);
  photo.src = photoData;

  message.textContent = "Fotografía capturada.";
});

// Volver a tomar fotografía
retakePhotoBtn.addEventListener("click", () => {
  photoData = null;
  photo.src = "";
  message.textContent = "Puedes tomar una nueva fotografía.";
});

// Enviar fotografía por correo
sendEmailBtn.addEventListener("click", async () => {
  if (!photoData) {
    message.textContent = "Primero debes tomar una fotografía.";
    return;
  }

  const email = emailInput.value.trim();

  if (!email) {
    message.textContent = "Ingresa un correo destinatario.";
    return;
  }

  try {
    message.textContent = "Enviando fotografía...";

    const response = await fetch("/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        image: photoData
      })
    });

    const result = await response.json();

    if (response.ok) {
      message.textContent = "Fotografía enviada correctamente.";
    } else {
      message.textContent = result.message || "No se pudo enviar la fotografía.";
    }
  } catch (error) {
    console.error(error);
    message.textContent = "Ocurrió un error al enviar la fotografía.";
  }
});