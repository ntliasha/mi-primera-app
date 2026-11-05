require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.use(express.json({ limit: "10mb" }));

app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post("/send-email", async (req, res) => {
  try {
    const { email, image } = req.body;

    if (!email || !image) {
      return res.status(400).json({
        message: "Correo e imagen son obligatorios."
      });
    }

    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Fotografía capturada desde la cámara web",
      text: "Adjunto encontrarás la fotografía capturada.",
      attachments: [
        {
          filename: "fotografia.jpg",
          content: imageBuffer,
          contentType: "image/jpeg"
        }
      ]
    });

    res.json({
      message: "Correo enviado correctamente."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al enviar el correo."
    });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

module.exports = app;