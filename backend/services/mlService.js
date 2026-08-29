const axios = require("axios");
const FormData = require("form-data");


const ML_SERVICE_URL="https://civicconnect-ml-2b2a.onrender.com/predict";

const predictImage = async (fileBuffer, originalname, mimetype) => {
  try {
    if (!fileBuffer) {
      throw new Error("No image buffer provided to ML service.");
    }

    const form = new FormData();

    form.append("image", fileBuffer, {
      filename: originalname || "uploaded_image.jpg",
      contentType: mimetype || "image/jpeg",
    });

    const response = await axios.post(ML_SERVICE_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "ML Prediction Error Details:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "ML prediction service failed."
    );
  }
};

module.exports = predictImage;