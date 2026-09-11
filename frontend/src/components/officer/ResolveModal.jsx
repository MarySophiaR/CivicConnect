import { useEffect, useRef, useState } from "react";

import {
  CheckCircle2,
  X,
  AlertCircle,
  FileCheck2,
  ImagePlus,
  Trash2,
} from "lucide-react";

import "../../styles/officerComponents.css";


function ResolveModal({
  complaint,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {

  /* =========================================================
     STATE
  ========================================================= */

  const [resolution, setResolution] =
    useState("");

  const [error, setError] =
    useState("");

  const [resolutionImage, setResolutionImage] =
    useState(null);

  const [resolutionImagePreview, setResolutionImagePreview] =
    useState("");

  const fileInputRef = useRef(null);


  /* =========================================================
     RESET WHEN MODAL OPENS
  ========================================================= */

  useEffect(() => {

    if (isOpen) {

      setResolution("");

      setError("");

      setResolutionImage(null);

      setResolutionImagePreview("");

      if (fileInputRef.current) {

        fileInputRef.current.value = "";

      }

    }

  }, [isOpen]);


  /* =========================================================
     CLEAN UP OBJECT URL ON CHANGE / UNMOUNT
  ========================================================= */

  useEffect(() => {

    return () => {

      if (resolutionImagePreview) {

        URL.revokeObjectURL(resolutionImagePreview);

      }

    };

  }, [resolutionImagePreview]);


  /* =========================================================
     HANDLE ESCAPE KEY
  ========================================================= */

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (
        event.key === "Escape" &&
        isOpen &&
        !loading
      ) {

        onClose();

      }

    };


    if (isOpen) {

      document.addEventListener(
        "keydown",
        handleKeyDown
      );

    }


    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    isOpen,
    loading,
    onClose,
  ]);


  /* =========================================================
     SAFETY CHECK
  ========================================================= */

  if (!isOpen || !complaint) {

    return null;

  }


  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleResolutionChange = (
    event
  ) => {

    const value =
      event.target.value;


    setResolution(value);


    if (error) {

      setError("");

    }

  };


  /* =========================================================
     HANDLE EVIDENCE IMAGE SELECT
  ========================================================= */

  const handleImageChange = (event) => {

    const file = event.target.files?.[0];

    if (!file) {

      return;

    }


    if (!file.type.startsWith("image/")) {

      setError("Please select a valid image file.");

      event.target.value = "";

      return;

    }


    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSizeBytes) {

      setError("Image must be smaller than 5MB.");

      event.target.value = "";

      return;

    }


    if (error) {

      setError("");

    }


    if (resolutionImagePreview) {

      URL.revokeObjectURL(resolutionImagePreview);

    }


    setResolutionImage(file);

    setResolutionImagePreview(URL.createObjectURL(file));

  };


  /* =========================================================
     HANDLE REMOVE EVIDENCE IMAGE
  ========================================================= */

  const handleRemoveImage = () => {

    if (resolutionImagePreview) {

      URL.revokeObjectURL(resolutionImagePreview);

    }

    setResolutionImage(null);

    setResolutionImagePreview("");

    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  };


  /* =========================================================
     HANDLE CONFIRM
  ========================================================= */

  const handleConfirm = async () => {

    const trimmedResolution =
      resolution.trim();


    /* -----------------------------------------
       REQUIRED VALIDATION — REMARKS
    ----------------------------------------- */

    if (!trimmedResolution) {

      setError(
        "Please provide details about how the complaint was resolved."
      );

      return;

    }


    /* -----------------------------------------
       MINIMUM LENGTH
    ----------------------------------------- */

    if (
      trimmedResolution.length < 10
    ) {

      setError(
        "Please provide a little more detail about the resolution."
      );

      return;

    }


    /* -----------------------------------------
       REQUIRED VALIDATION — EVIDENCE IMAGE
    ----------------------------------------- */

    if (!resolutionImage) {

      setError(
        "Please upload a photo showing the resolved issue as proof."
      );

      return;

    }


    /* -----------------------------------------
       HANDLER CHECK
    ----------------------------------------- */

    if (
      typeof onConfirm !==
      "function"
    ) {

      setError(
        "Resolution handler is not available."
      );

      console.error(
        "ResolveModal: onConfirm prop is not a function."
      );

      return;

    }


    try {

      setError("");


      /*
       * IMPORTANT:
       * The parent component expects:
       *
       * resolutionData.resolutionRemarks
       * resolutionData.resolutionImage (required File)
       *
       * Therefore we send both here.
       */

      await onConfirm({

        resolutionRemarks:
          trimmedResolution,

        resolutionImage:
          resolutionImage,

      });

    } catch (submitError) {

      console.error(
        "Resolution submission error:",
        submitError
      );


      setError(
        submitError?.message ||
        "Failed to resolve the complaint."
      );

    }

  };


  /* =========================================================
     HANDLE BACKDROP CLICK
  ========================================================= */

  const handleBackdropClick = (
    event
  ) => {

    if (
      event.target ===
        event.currentTarget &&
      !loading
    ) {

      onClose();

    }

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div
      className="officer-modal-overlay"
      onMouseDown={handleBackdropClick}
    >

      <div
        className="officer-resolve-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolve-modal-title"
        onMouseDown={(event) => {

          event.stopPropagation();

        }}
      >


        {/* ===================================================
            MODAL HEADER
        =================================================== */}

        <div className="officer-modal-header">

          <div className="officer-modal-heading">

            <div
              className="
                officer-modal-icon
                officer-modal-icon-success
              "
            >

              <CheckCircle2
                size={24}
                strokeWidth={2}
              />

            </div>


            <div>

              <span className="officer-modal-eyebrow">

                Complaint Resolution

              </span>


              <h2 id="resolve-modal-title">

                Resolve Complaint

              </h2>

            </div>

          </div>


          <button
            type="button"
            className="officer-modal-close-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close resolution modal"
          >

            <X
              size={20}
              strokeWidth={2}
            />

          </button>

        </div>


        {/* ===================================================
            COMPLAINT INFORMATION
        =================================================== */}

        <div className="officer-resolve-complaint-info">

          <div className="officer-resolve-info-icon">

            <FileCheck2
              size={19}
              strokeWidth={1.9}
            />

          </div>


          <div>

            <span>
              Complaint
            </span>


            <strong>

              {complaint.title ||
                "Untitled Complaint"}

            </strong>

          </div>

        </div>


        {/* ===================================================
            RESOLUTION FORM
        =================================================== */}

        <div className="officer-resolve-form">

          <label
            htmlFor="complaint-resolution"
            className="officer-resolve-label"
          >

            Resolution Details

            <span>
              *
            </span>

          </label>


          <p className="officer-resolve-help">

            Describe the work completed and how the
            reported issue was resolved.

          </p>


          <textarea
            id="complaint-resolution"
            className={`
              officer-resolve-textarea
              ${
                error
                  ? "officer-resolve-textarea-error"
                  : ""
              }
            `}
            value={resolution}
            onChange={
              handleResolutionChange
            }
            placeholder="Example: The damaged road section was repaired and the pothole was filled and levelled."
            rows={6}
            maxLength={1000}
            disabled={loading}
          />


          <div
            className="
              officer-resolve-textarea-footer
            "
          >

            <span>
              {resolution.length}/1000
            </span>


            <span>
              Minimum 10 characters
            </span>

          </div>


          {/* =================================================
              EVIDENCE IMAGE UPLOAD (REQUIRED)
          ================================================= */}

          <label
            htmlFor="complaint-resolution-image"
            className="officer-resolve-label"
            style={{ marginTop: "16px" }}
          >

            Resolution Evidence

            <span>
              *
            </span>

          </label>


          <p className="officer-resolve-help">

            Upload a photo showing the resolved issue. This
            is required as proof of resolution.

          </p>


          {!resolutionImagePreview ? (

            <label
              htmlFor="complaint-resolution-image"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: error && !resolutionImage
                  ? "1.5px dashed #d92d20"
                  : "1.5px dashed #c7c7c7",
                borderRadius: "8px",
                padding: "18px",
                cursor: loading ? "not-allowed" : "pointer",
                color: "#555",
                fontSize: "14px",
                opacity: loading ? 0.6 : 1,
              }}
            >

              <ImagePlus size={18} strokeWidth={1.9} />

              Click to upload an image

            </label>

          ) : (

            <div
              style={{
                position: "relative",
                display: "inline-block",
                width: "220px",
                marginTop: "4px",
              }}
            >

              <img
                src={resolutionImagePreview}
                alt="Resolution evidence preview"
                style={{
                  maxWidth: "220px",
                  maxHeight: "160px",
                  borderRadius: "8px",
                  display: "block",
                  objectFit: "cover",
                }}
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={loading}
                aria-label="Remove uploaded image"
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "28px",
                  height: "28px",
                  minWidth: "28px",
                  maxWidth: "28px",
                  boxSizing: "border-box",
                  background: "rgba(0,0,0,0.65)",
                  border: "none",
                  borderRadius: "50%",
                  padding: "0",
                  margin: 0,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >

                <Trash2 size={14} color="#fff" strokeWidth={2} />

              </button>

            </div>

          )}


          <input
            id="complaint-resolution-image"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={loading}
            style={{ display: "none" }}
          />


          {/* =================================================
              VALIDATION ERROR
          ================================================= */}

          {error && (

            <div
              className="
                officer-resolve-error
              "
              role="alert"
            >

              <AlertCircle
                size={17}
                strokeWidth={2}
              />

              <span>
                {error}
              </span>

            </div>

          )}

        </div>


        {/* ===================================================
            WARNING
        =================================================== */}

        <div
          className="
            officer-resolve-warning
          "
        >

          <AlertCircle
            size={18}
            strokeWidth={2}
          />


          <p>

            Once you confirm the resolution, this complaint
            will be marked as <strong>Resolved</strong>.
            Make sure the reported issue has actually been
            addressed before continuing.

          </p>

        </div>


        {/* ===================================================
            FOOTER ACTIONS
        =================================================== */}

        <div className="officer-modal-footer">

          <button
            type="button"
            className="
              officer-modal-cancel-button
            "
            onClick={onClose}
            disabled={loading}
          >

            Cancel

          </button>


          <button
            type="button"
            className="
              officer-modal-confirm-button
            "
            onClick={handleConfirm}
            disabled={loading}
          >

            {loading ? (

              <>

                <span
                  className="
                    officer-button-spinner
                  "
                />

                Resolving...

              </>

            ) : (

              <>

                <CheckCircle2
                  size={18}
                  strokeWidth={2}
                />

                Confirm Resolution

              </>

            )}

          </button>

        </div>


      </div>

    </div>

  );

}


export default ResolveModal;