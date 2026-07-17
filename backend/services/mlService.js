const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const predictImage = async (imagePath) => {

    const form = new FormData();

    form.append(
        "image",
        fs.createReadStream(imagePath)
    );

    const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        form,
        {
            headers: form.getHeaders()
        }
    );

    return response.data;
};

module.exports = predictImage;