import { useEffect, useState } from "react";

import {
  CheckCircle2,
  X,
  AlertCircle,
  FileCheck2,
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


  /* =========================================================
     RESET WHEN MODAL OPENS
  ========================================================= */

  useEffect(() => {

    if (isOpen) {

      setResolution("");

      setError("");

    }

  }, [isOpen]);


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
     HANDLE CONFIRM
  ========================================================= */

  const handleConfirm = async () => {

    const trimmedResolution =
      resolution.trim();


    /* -----------------------------------------
       REQUIRED VALIDATION
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
       *
       * Therefore we send resolutionRemarks here.
       */

      await onConfirm({

        resolutionRemarks:
          trimmedResolution,

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