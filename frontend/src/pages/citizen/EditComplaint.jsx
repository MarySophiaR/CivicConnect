import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/EditComplaint.css";

function EditComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complaint, setComplaint] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // =========================================
  // FETCH COMPLAINT
  // =========================================
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5001/api/complaints/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load complaint."
          );
        }

        const item = data.complaint;

        setComplaint(item);
        setTitle(item.title || "");
        setDescription(item.description || "");
      } catch (error) {
        console.error("Fetch complaint error:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  // =========================================
  // SAVE CHANGES
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Complaint title is required.");
      return;
    }

    if (!description.trim()) {
      alert("Complaint description is required.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/complaints/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update complaint."
        );
      }

      navigate("/citizen/my-complaints");
    } catch (error) {
      console.error("Update complaint error:", error);
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // CANCEL
  // =========================================
  const handleCancel = () => {
    // Do not save anything
    navigate("/citizen/my-complaints");
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div className="edit-complaint-page">
        <div className="edit-loading">
          Loading complaint...
        </div>
      </div>
    );
  }

  // =========================================
  // COMPLAINT NOT FOUND
  // =========================================
  if (!complaint) {
    return (
      <div className="edit-complaint-page">
        <div className="edit-complaint-container">
          <div className="edit-error">
            <h2>Complaint Not Found</h2>

            <button
              type="button"
              onClick={() => navigate("/citizen/complaints")}
            >
              Back to My Complaints
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================
  return (
    <div className="edit-complaint-page">
      <div className="edit-complaint-container">

        {/* =====================================
            PAGE HEADER
        ===================================== */}
        <div className="edit-complaint-header">
          <h1>Edit Complaint</h1>

          <p>
            Update the title or description of your complaint.
          </p>
        </div>

        {/* =====================================
            FORM CARD
        ===================================== */}
        <div className="edit-complaint-card">
          <form onSubmit={handleSubmit}>

            {/* =================================
                TITLE
            ================================= */}
            <div className="edit-form-group">
              <label htmlFor="complaint-title">
                Title
                <span className="edit-required">*</span>
              </label>

              <input
                id="complaint-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter complaint title"
                maxLength={150}
                disabled={saving}
              />

              <span className="edit-character-count">
                {title.length}/150
              </span>
            </div>

            {/* =================================
                DESCRIPTION
            ================================= */}
            <div className="edit-form-group">
              <label htmlFor="complaint-description">
                Description
                <span className="edit-required">*</span>
              </label>

              <textarea
                id="complaint-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe the issue clearly"
                rows={7}
                maxLength={1000}
                disabled={saving}
              />

              <span className="edit-character-count">
                {description.length}/1000
              </span>
            </div>

            {/* =================================
                BUTTONS
            ================================= */}
            <div className="edit-button-row">


              <button
                type="submit"
                className="edit-save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="edit-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditComplaint;