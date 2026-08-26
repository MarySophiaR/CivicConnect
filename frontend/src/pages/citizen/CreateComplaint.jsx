import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/citizen/Layout";
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
    wardNumber: "",
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [duplicateComplaint, setDuplicateComplaint] = useState(null);

  const [locationValidationMessage, setLocationValidationMessage] =
    useState("");

  const [locationValidationType, setLocationValidationType] =
    useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const selectedImage = files?.[0] || null;

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

    if (
      name === "district" ||
      name === "city" ||
      name === "wardNumber"
    ) {
      setLocationValidationMessage("");
      setLocationValidationType("");
    }
  };

  // =========================================================
  // CURRENT LOCATION
  // =========================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setIsGettingLocation(true);

    setLocationValidationMessage("");
    setLocationValidationType("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const nominatimUrl =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=json` +
            `&lat=${latitude}` +
            `&lon=${longitude}` +
            `&accept-language=en` +
            `&addressdetails=1`;

          const response = await fetch(nominatimUrl, {
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(
              "Unable to reverse geocode location."
            );
          }

          const data = await response.json();
          const address = data.address || {};

          let pincode = address.postcode || "";

          // Fallback only for pincode
          if (!pincode) {
            try {
              const fallbackUrl =
                `https://api.bigdatacloud.net/data/reverse-geocode-client` +
                `?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&localityLanguage=en`;

              const fallbackResponse =
                await fetch(fallbackUrl);

              if (fallbackResponse.ok) {
                const fallbackData =
                  await fallbackResponse.json();

                pincode =
                  fallbackData.postcode ||
                  fallbackData.postalCode ||
                  "";
              }
            } catch (error) {
              console.error(
                "Pincode fallback error:",
                error
              );
            }
          }

          setFormData((prev) => ({
            ...prev,

            latitude,
            longitude,

            state:
              address.state ||
              prev.state,

            district:
              address.state_district ||
              address.county ||
              address.district ||
              prev.district,

            city:
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              prev.city,

            area:
              address.suburb ||
              address.neighbourhood ||
              address.hamlet ||
              address.quarter ||
              prev.area,

            pincode:
              pincode ||
              prev.pincode,

            wardNumber:
              prev.wardNumber,
          }));

          toast.success(
            "Current location captured successfully."
          );

          toast.info(
            "Please enter your Ward Number / Name manually."
          );
        } catch (error) {
          console.error(
            "Location/address error:",
            error
          );

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          toast.error(
            "Unable to fetch address details, but coordinates were saved."
          );
        } finally {
          setIsGettingLocation(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission was denied. Please allow location access."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error(
              "Current location is unavailable."
            );
            break;

          case error.TIMEOUT:
            toast.error(
              "Location request timed out. Please try again."
            );
            break;

          default:
            toast.error(
              "Unable to fetch current location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =========================================================
  // AI CATEGORY PREDICTION
  // =========================================================

  const predictCategory = async () => {
    if (!formData.image) {
      toast.error(
        "Please upload an image first."
      );
      return;
    }

    try {
      setIsPredicting(true);

      const data = new FormData();

      data.append(
        "image",
        formData.image
      );

      const response = await API.post(
        "/complaints/predict",
        data
      );

      setPrediction({
        category:
          response.data.category,
      });

      setFormData((prev) => ({
        ...prev,
        category:
          response.data.category,
      }));

      toast.success(
        "Category detected successfully."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Prediction failed."
      );
    } finally {
      setIsPredicting(false);
    }
  };

  // =========================================================
  // LOCATION VALIDATION ERROR
  // =========================================================

  const handleLocationValidationError = (error) => {
    const responseData =
      error.response?.data || {};

    if (
      responseData.locationUnsupported === true &&
      responseData.reason ===
        "MUNICIPALITY_NOT_SUPPORTED"
    ) {
      const message =
        responseData.message ||
        "This district/municipality is currently outside the supported municipal complaint service area.";

      setLocationValidationType(
        "unsupported-municipality"
      );

      setLocationValidationMessage(
        message
      );

      toast.error(message);

      return true;
    }

    if (
      responseData.locationUnsupported === true &&
      responseData.reason ===
        "WARD_NOT_SUPPORTED"
    ) {
      const ward =
        responseData.wardNumber ||
        formData.wardNumber ||
        "";

      const message =
        responseData.message ||
        `Ward ${ward} is currently not onboarded to the digital complaint service.`;

      setLocationValidationType(
        "unsupported-ward"
      );

      setLocationValidationMessage(
        message
      );

      toast.error(message);

      return true;
    }

    return false;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocationValidationMessage("");
    setLocationValidationType("");

    try {
      const data = new FormData();

      // Complaint details
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);

      // Address fields
      data.append("state", formData.state);
      data.append("district", formData.district);
      data.append("city", formData.city);
      data.append("wardNumber", formData.wardNumber);
      data.append("area", formData.area);
      data.append("landmark", formData.landmark);
      data.append("pincode", formData.pincode);

      // GPS Coordinates (Sending clean lat/lng; backend handles GeoJSON object assembly)
      if (formData.latitude && formData.longitude) {
        data.append("latitude", formData.latitude);
        data.append("longitude", formData.longitude);
      }

      // Image
      data.append("image", formData.image);

      const response = await API.post("/complaints/create", data);

      // =====================================================
      // MUNICIPALITY NOT SUPPORTED
      // =====================================================

      if (
        response.data.locationUnsupported === true &&
        response.data.reason ===
          "MUNICIPALITY_NOT_SUPPORTED"
      ) {
        const message =
          response.data.message ||
          "This district/municipality is currently outside the supported municipal complaint service area.";

        setLocationValidationType(
          "unsupported-municipality"
        );

        setLocationValidationMessage(
          message
        );

        toast.error(message);

        return;
      }

      // =====================================================
      // WARD NOT SUPPORTED
      // =====================================================

      if (
        response.data.locationUnsupported === true &&
        response.data.reason ===
          "WARD_NOT_SUPPORTED"
      ) {
        const ward =
          response.data.wardNumber ||
          formData.wardNumber ||
          "";

        const message =
          response.data.message ||
          `Ward ${ward} is currently not onboarded to the digital complaint service.`;

        setLocationValidationType(
          "unsupported-ward"
        );

        setLocationValidationMessage(
          message
        );

        toast.error(message);

        return;
      }

      // =====================================================
      // DUPLICATE COMPLAINT
      // =====================================================

      if (
        response.data.duplicate ||
        response.data.isDuplicate
      ) {
        setDuplicateComplaint({
          complaintId:
            response.data.complaintId,

          status:
            response.data.status ||
            "Assigned",

          daysAgo:
            response.data.daysAgo ?? 0,

          message:
            response.data.message,
        });

        toast.info(
          "Similar complaint already exists.",
          {
            autoClose: 4000,
          }
        );

        return;
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      toast.success(
        "Complaint submitted successfully."
      );

      setFormData({
        title: "",
        description: "",
        category: "",

        state: "",
        district: "",
        city: "",
        wardNumber: "",
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

      setLocationValidationMessage("");
      setLocationValidationType("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        navigate(
          "/citizen/dashboard"
        );
      }, 0);

    } catch (error) {
      console.error(
        error.response?.data ||
          error.message
      );

      const handled =
        handleLocationValidationError(
          error
        );

      if (handled) {
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Complaint submission failed."
      );
    }
  };

  // =========================================================
  // REPORTED TIME
  // =========================================================

  const getReportedText = (daysAgo) => {
    if (daysAgo === 0) {
      return "Today";
    }

    if (daysAgo === 1) {
      return "1 day ago";
    }

    return `${daysAgo} days ago`;
  };

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  const isFormValid = Boolean(
    formData.title.trim() &&
      formData.description.trim() &&
      formData.category &&
      formData.image &&
      formData.area.trim() &&
      formData.city.trim() &&
      formData.district.trim() &&
      formData.state.trim() &&
      formData.pincode.trim() &&
      formData.wardNumber.trim()
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout>

      <h1 className="title">
        Report Complaint
      </h1>

      <div className="complaint-container">

        <form
          className="complaint-form"
          onSubmit={handleSubmit}
        >

          {/* COMPLAINT DETAILS */}

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

          {/* IMAGE */}

          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <p style={{ fontSize: "13px", color: "#666", fontStyle: "italic", marginTop: "-10px", marginBottom: "8px" }}>
            Please ensure the issue is clearly visible
          </p>

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

          {/* AI CATEGORY */}

          {prediction.category && (
            <div className="prediction-card">

              <h3>
                Detected Category
              </h3>

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
                If the detected category is
                incorrect, select the correct
                category before submitting.
              </p>

            </div>
          )}

          {/* ADDRESS */}

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
            name="wardNumber"
            placeholder="Ward Number / Name"
            value={formData.wardNumber}
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
            placeholder="City / Town / Taluk"
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

          {/* CURRENT LOCATION */}

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation
              ? "Getting Current Location..."
              : "Use Current Location"}
          </button>

          {/* LOCATION VALIDATION */}

          {locationValidationMessage && (
            <div
              className={`location-validation-message ${
                locationValidationType ===
                "unsupported-municipality"
                  ? "unsupported-municipality"
                  : "unsupported-ward"
              }`}
            >

              <h3>
                {locationValidationType ===
                "unsupported-municipality"
                  ? "Outside Supported Municipalities"
                  : "Unsupported Ward"}
              </h3>

              <p>
                {locationValidationMessage}
              </p>

            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={!isFormValid}
          >
            Submit Complaint
          </button>

          {/* DUPLICATE COMPLAINT */}

          {duplicateComplaint && (
            <div className="duplicate-card">

              <h3>
                Similar complaint already exists
              </h3>

              <p>
                {duplicateComplaint.message}
              </p>

              <p>
                <strong>
                  Current Status:
                </strong>{" "}
                {duplicateComplaint.status}
              </p>

              <p>
                <strong>
                  Reported:
                </strong>{" "}
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