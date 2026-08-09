import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/createComplaint.css";
import { toast } from "react-toastify";

function CreateComplaint() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    state: "",
    district: "",
    city: "",
    area: "",
    landmark: "",
    pincode: "",
    latitude: "",
    longitude: "",
    image: null,
  });

  const [prediction, setPrediction] = useState({
    category: "",
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [duplicateComplaint, setDuplicateComplaint] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const selectedImage = files[0];

      setPrediction({
        category: "",
      });

      setFormData((prev) => ({
        ...prev,
        image: selectedImage,
        category: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // ==========================================
          // 1. Get address from OpenStreetMap/Nominatim
          // ==========================================

          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          const nominatimData = await nominatimResponse.json();

          const addressData = nominatimData.address || {};

          // ==========================================
          // 2. Get pincode from Nominatim
          // ==========================================

          let pincode = addressData.postcode || "";

          // ==========================================
          // 3. If Nominatim doesn't give pincode,
          //    use BigDataCloud reverse geocoding
          // ==========================================

          if (!pincode) {
            try {
              const fallbackResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              );

              const fallbackData = await fallbackResponse.json();

              pincode = fallbackData.postcode || fallbackData.postalCode || "";
            } catch (fallbackError) {
              console.error("Pincode fallback error:", fallbackError);
            }
          }

          // ==========================================
          // 4. Update form
          // ==========================================

          setFormData((prev) => ({
            ...prev,

            latitude,
            longitude,

            state: addressData.state || prev.state,

            district:
              addressData.state_district || addressData.county || prev.district,

            city:
              addressData.city ||
              addressData.town ||
              addressData.village ||
              addressData.municipality ||
              prev.city,

            area:
              addressData.suburb ||
              addressData.neighbourhood ||
              addressData.hamlet ||
              addressData.quarter ||
              prev.area,

            pincode: pincode || prev.pincode,
          }));

          // ==========================================
          // 5. Inform user
          // ==========================================

          if (pincode) {
            toast.success("Location captured successfully.");
          } 
        } catch (error) {
          toast.error("Unable to fetch address from current location.");
        }
      },

      (error) => {
        console.error("Geolocation error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission was denied. Please allow location access.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error("Current location is unavailable.");
            break;

          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;

          default:
            toast.error("Unable to fetch current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const predictCategory = async () => {
    if (!formData.image) {
      toast.error("Please upload an image first.");
      return;
    }

    try {
      setIsPredicting(true);

      const data = new FormData();
      data.append("image", formData.image);

      const response = await API.post("/complaints/predict", data);

      setPrediction({
        category: response.data.category,
      });

      setFormData((prev) => ({
        ...prev,
        category: response.data.category,
      }));

      toast.success("Category detected successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Prediction failed.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);

      data.append("state", formData.state);
      data.append("district", formData.district);
      data.append("city", formData.city);
      data.append("area", formData.area);
      data.append("landmark", formData.landmark);
      data.append("pincode", formData.pincode);

      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);

      data.append("image", formData.image);

      const response = await API.post("/complaints/create", data);

      // -------------------------
      // Duplicate Complaint Check
      // -------------------------
      if (response.data.duplicate || response.data.isDuplicate) {
        setDuplicateComplaint({
          complaintId: response.data.complaintId,
          status: response.data.status || "Assigned",
          daysAgo: response.data.daysAgo ?? 0,
          message: response.data.message,
        });

        toast.info("Similar complaint already exists.", {
          autoClose: 4000,
        });

        return;
      }

      // -------------------------
      // New Complaint
      // -------------------------
      toast.success("Complaint submitted successfully.");

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        state: "",
        district: "",
        city: "",
        area: "",
        landmark: "",
        pincode: "",
        latitude: "",
        longitude: "",
        image: null,
      });

      setPrediction({
        category: "",
      });

      setDuplicateComplaint(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        navigate("/citizen/dashboard");
      });
    } catch (error) {
      console.error(error.response?.data || error.message);

      toast.error(
        error.response?.data?.message ||
          "Complaint submission failed."
      );
    }
  };

  // -------------------------
  // Format reported time
  // -------------------------
  const getReportedText = (daysAgo) => {
    if (daysAgo === 0) {
      return "Today";
    }

    if (daysAgo === 1) {
      return "1 day ago";
    }

    return `${daysAgo} days ago`;
  };

  // -------------------------
  // Form validation
  // -------------------------
  const isFormValid = Boolean(
    formData.title.trim() &&
      formData.description.trim() &&
      formData.category &&
      formData.image &&
      formData.area.trim() &&
      formData.city.trim() &&
      formData.district.trim() &&
      formData.state.trim() &&
      formData.pincode.trim()
  );

  return (
    <Layout>
      <h1 className="title">Report Complaint</h1>

      <div className="complaint-container">

        <form
          className="complaint-form"
          onSubmit={handleSubmit}
        >
          {/* Complaint Details */}

          <input
            type="text"
            name="title"
            placeholder="Complaint Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Complaint Description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
          />

          {/* Image */}

          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <button
            type="button"
            onClick={predictCategory}
            disabled={
              !formData.image ||
              isPredicting
            }
          >
            {isPredicting
              ? "Predicting..."
              : "Predict Category"}
          </button>

          {/* AI Prediction */}

          {prediction.category && (
            <div className="prediction-card">
              <h3>Detected Category</h3>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="prediction-select"
              >
                <option value="pothole">
                  Pothole
                </option>

                <option value="drainage">
                  Drainage
                </option>

                <option value="garbage">
                  Garbage
                </option>
              </select>

              <p className="prediction-note">
                If the detected category is incorrect,
                select the correct category before
                submitting.
              </p>
            </div>
          )}

          {/* Address Fields */}

          <input
            type="text"
            name="area"
            placeholder="Area / Locality"
            value={formData.area}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="landmark"
            placeholder="Landmark (Optional)"
            value={formData.landmark}
            onChange={handleChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City / Town"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="district"
            placeholder="District"
            value={formData.district}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
          />

          {/* Location */}

          <button
            type="button"
            onClick={getCurrentLocation}
          >
            Use Current Location
          </button>

          {/* Submit */}

          <button
            type="submit"
            disabled={!isFormValid}
          >
            Submit Complaint
          </button>

          {/* Duplicate Complaint Card */}

          {duplicateComplaint && (
            <div className="duplicate-card">
              <h3>
                Similar complaint already exists
              </h3>

              <p>
                {duplicateComplaint.message}
              </p>

              <p>
                <strong>Current Status:</strong>{" "}
                {duplicateComplaint.status}
              </p>

              <p>
                <strong>Reported:</strong>{" "}
                {getReportedText(
                  duplicateComplaint.daysAgo
                )}
              </p>

              <div className="duplicate-actions">
                <button
                  type="button"
                  className="duplicate-btn primary"
                  onClick={() =>
                    navigate(
                      `/citizen/complaint/${duplicateComplaint.complaintId}`
                    )
                  }
                >
                  View Existing Complaint
                </button>

                <button
                  type="button"
                  className="duplicate-btn secondary"
                  onClick={() =>
                    setDuplicateComplaint(null)
                  }
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}

export default CreateComplaint;