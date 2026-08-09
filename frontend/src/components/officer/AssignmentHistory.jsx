import {
    History,
    UserRound,
    CalendarDays,
    ArrowUpCircle,
    ChevronDown,
    ArrowRight
} from "lucide-react";

import { useState } from "react";

import "../../styles/officerComponents.css";

function AssignmentHistory({ complaint }) {

    const [isExpanded, setIsExpanded] =
        useState(false);


    /* =====================================================
       SAFE DATA
    ===================================================== */

    const assignmentHistory =
        Array.isArray(
            complaint?.assignmentHistory
        )
            ? complaint.assignmentHistory
            : [];

    const escalationHistory =
        Array.isArray(
            complaint?.escalationHistory
        )
            ? complaint.escalationHistory
            : [];


    /* =====================================================
       COMBINE HISTORY
    ===================================================== */

    const events = [
        ...assignmentHistory.map(
            (item) => ({
                ...item,
                eventType: "assignment"
            })
        ),

        ...escalationHistory.map(
            (item) => ({
                ...item,
                eventType: "escalation"
            })
        )
    ];


    /* =====================================================
       SORT CHRONOLOGICALLY
    ===================================================== */

    events.sort((a, b) => {

        const dateA =
            new Date(
                a.createdAt ||
                a.assignedAt ||
                a.escalatedAt ||
                a.date ||
                0
            ).getTime();

        const dateB =
            new Date(
                b.createdAt ||
                b.assignedAt ||
                b.escalatedAt ||
                b.date ||
                0
            ).getTime();

        return dateA - dateB;
    });


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDateTime = (date) => {

        if (!date) {
            return "—";
        }

        const formatted =
            new Date(date);

        if (
            Number.isNaN(
                formatted.getTime()
            )
        ) {
            return "—";
        }

        return formatted.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    /* =====================================================
       FORMAT LEVEL
    ===================================================== */

    const formatLevel = (level) => {

        if (!level) {
            return "—";
        }

        switch (level) {

            case "juniorEngineer":
                return "Junior Engineer";

            case "assistantExecutiveEngineer":
                return "Assistant Executive Engineer";

            case "executiveEngineer":
                return "Executive Engineer";

            case "municipalCommissioner":
                return "Municipal Commissioner";

            default:
                return level;
        }
    };


    /* =====================================================
       GET OFFICER
    ===================================================== */

    const getOfficerName = (event) => {

        return (
            event?.officer?.name ||
            event?.assignedTo?.name ||
            event?.assignedOfficer?.name ||
            event?.officerName ||
            "Officer"
        );
    };


    const getOfficerRole = (event) => {

        return (
            event?.officer?.role ||
            event?.assignedTo?.role ||
            event?.assignedOfficer?.role ||
            event?.level ||
            event?.assignedLevel ||
            ""
        );
    };


    /* =====================================================
       GET EVENT DATE
    ===================================================== */

    const getEventDate = (event) => {

        return (
            event?.createdAt ||
            event?.assignedAt ||
            event?.escalatedAt ||
            event?.date
        );
    };


    /* =====================================================
       GET ASSIGNMENT LEVEL
    ===================================================== */

    const getAssignmentLevel = (event) => {

        return (
            event?.level ||
            event?.assignedLevel ||
            event?.toLevel ||
            event?.currentLevel ||
            event?.newLevel ||
            ""
        );
    };


    /* =====================================================
       GET PREVIOUS LEVEL FOR ESCALATION
    ===================================================== */

    const getPreviousLevel = (event, index) => {

        const explicitPreviousLevel =
            event?.fromLevel ||
            event?.previousLevel ||
            event?.oldLevel ||
            event?.from ||
            event?.previousLevelName ||
            event?.oldLevelName;

        if (explicitPreviousLevel) {
            return explicitPreviousLevel;
        }


        for (let i = index - 1; i >= 0; i--) {

            const previousEvent =
                events[i];

            const previousLevel =
                previousEvent?.level ||
                previousEvent?.assignedLevel ||
                previousEvent?.toLevel ||
                previousEvent?.newLevel ||
                previousEvent?.currentLevel;

            if (previousLevel) {
                return previousLevel;
            }
        }


        /*
         * Final fallback from complaint data.
         */

        return (
            complaint?.previousLevel ||
            complaint?.assignedLevel ||
            complaint?.currentLevel ||
            ""
        );
    };


    /* =====================================================
       GET NEW LEVEL FOR ESCALATION
    ===================================================== */

    const getNewLevel = (event) => {

        return (
            event?.toLevel ||
            event?.newLevel ||
            event?.assignedLevel ||
            event?.level ||
            event?.currentLevel ||
            event?.nextLevel ||
            event?.to ||
            complaint?.currentLevel ||
            complaint?.assignedLevel ||
            ""
        );
    };


    /* =====================================================
       HISTORY
    ===================================================== */

    return (

        <section
            className="officer-assignment-history-section"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="officer-assignment-history-header"
            >

                <div
                    className="officer-assignment-history-heading"
                >

                    <div
                        className="officer-assignment-history-icon"
                    >

                        <History
                            size={25}
                            strokeWidth={2}
                        />

                    </div>


                    <div
                        className="officer-assignment-history-title"
                    >

                        <span
                            className="officer-assignment-history-eyebrow"
                        >
                            Complaint Workflow
                        </span>

                        <h2>
                            Assignment History
                        </h2>

                    </div>

                </div>


                {/* =================================================
                    DROPDOWN
                ================================================= */}

                <button
                    type="button"
                    className="officer-assignment-history-toggle"
                    onClick={() =>
                        setIsExpanded(
                            (previous) =>
                                !previous
                        )
                    }
                    aria-expanded={isExpanded}
                >

                    <span>
                        {events.length}{" "}
                        {events.length === 1
                            ? "Event"
                            : "Events"}
                    </span>

                    <ChevronDown
                        size={20}
                        strokeWidth={2}
                        className={
                            isExpanded
                                ? "is-open"
                                : ""
                        }
                    />

                </button>

            </div>


            {/* =================================================
                HISTORY CONTENT
            ================================================= */}

            {isExpanded && (

                <div
                    className="officer-assignment-history-content"
                >

                    {events.length === 0 ? (

                        <div
                            className="officer-assignment-history-empty"
                        >

                            <History
                                size={38}
                                strokeWidth={1.7}
                            />

                            <h3>
                                No Assignment History
                            </h3>

                            <p>
                                No assignment or escalation
                                activity has been recorded
                                for this complaint yet.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="officer-assignment-timeline"
                        >

                            {events.map(
                                (event, index) => {

                                    const isEscalation =
                                        event.eventType ===
                                        "escalation";

                                    const isLast =
                                        index ===
                                        events.length - 1;

                                    const level =
                                        getAssignmentLevel(
                                            event
                                        );

                                    /*
                                     * FIX:
                                     * Determine both sides of
                                     * an escalation safely.
                                     */

                                    const previousLevel =
                                        isEscalation
                                            ? getPreviousLevel(
                                                event,
                                                index
                                            )
                                            : "";

                                    const newLevel =
                                        isEscalation
                                            ? getNewLevel(
                                                event
                                            )
                                            : "";

                                    return (

                                        <div
                                            className={`officer-assignment-event ${
                                                isLast
                                                    ? "last"
                                                    : ""
                                            }`}
                                            key={
                                                event._id ||
                                                event.id ||
                                                `${event.eventType}-${index}`
                                            }
                                        >

                                            {/* =================================
                                                TIMELINE COLUMN
                                            ================================= */}

                                            <div
                                                className="officer-assignment-timeline-column"
                                            >

                                                <div
                                                    className={`officer-assignment-event-dot ${
                                                        isEscalation
                                                            ? "escalation"
                                                            : ""
                                                    }`}
                                                >

                                                    {isEscalation ? (

                                                        <ArrowUpCircle
                                                            size={20}
                                                            strokeWidth={2}
                                                        />

                                                    ) : (

                                                        <UserRound
                                                            size={20}
                                                            strokeWidth={2}
                                                        />

                                                    )}

                                                </div>


                                                {!isLast && (

                                                    <div
                                                        className="officer-assignment-timeline-line"
                                                    />

                                                )}

                                            </div>


                                            {/* =================================
                                                EVENT CONTENT
                                            ================================= */}

                                            <div
                                                className="officer-assignment-event-content"
                                            >

                                                <div
                                                    className="officer-assignment-event-top"
                                                >

                                                    <div>

                                                        <span
                                                            className={`officer-assignment-event-type ${
                                                                isEscalation
                                                                    ? "escalation"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {isEscalation
                                                                ? "Escalation"
                                                                : "Assignment"}
                                                        </span>


                                                        <h3>

                                                            {isEscalation
                                                                ? `Escalated to ${formatLevel(
                                                                    newLevel
                                                                )}`
                                                                : `Assigned to ${formatLevel(
                                                                    level
                                                                )}`}

                                                        </h3>

                                                    </div>


                                                    <span
                                                        className="officer-assignment-event-date"
                                                    >

                                                        <CalendarDays
                                                            size={15}
                                                            strokeWidth={1.9}
                                                        />

                                                        {formatDateTime(
                                                            getEventDate(
                                                                event
                                                            )
                                                        )}

                                                    </span>

                                                </div>


                                                {/* =================================
                                                    OFFICER INFORMATION
                                                ================================= */}

                                                {!isEscalation && (

                                                    <div
                                                        className="officer-assignment-officer"
                                                    >

                                                        <div
                                                            className="officer-assignment-officer-icon"
                                                        >

                                                            <UserRound
                                                                size={17}
                                                                strokeWidth={1.9}
                                                            />

                                                        </div>


                                                        <div>

                                                            <span>
                                                                Officer
                                                            </span>

                                                            <strong>
                                                                {getOfficerName(
                                                                    event
                                                                )}
                                                            </strong>

                                                            {getOfficerRole(
                                                                event
                                                            ) && (

                                                                <small>
                                                                    {formatLevel(
                                                                        getOfficerRole(
                                                                            event
                                                                        )
                                                                    )}
                                                                </small>

                                                            )}

                                                        </div>

                                                    </div>

                                                )}


                                                {/* =================================
                                                    ESCALATION TRANSITION
                                                ================================= */}

                                                {isEscalation && (

                                                    <div
                                                        className="officer-assignment-transition"
                                                    >

                                                        <div>

                                                            <span>
                                                                Previous Level
                                                            </span>

                                                            <strong>
                                                                {formatLevel(
                                                                    previousLevel
                                                                )}
                                                            </strong>

                                                        </div>


                                                        <ArrowRight
                                                            size={19}
                                                            strokeWidth={2}
                                                        />


                                                        <div>

                                                            <span>
                                                                New Level
                                                            </span>

                                                            <strong>
                                                                {formatLevel(
                                                                    newLevel
                                                                )}
                                                            </strong>

                                                        </div>

                                                    </div>

                                                )}


                                                {/* =================================
                                                    REASON
                                                ================================= */}

                                                {isEscalation &&
                                                    (
                                                        event.reason ||
                                                        event.reasonText ||
                                                        event.escalationReason ||
                                                        event.note
                                                    ) && (

                                                        <p
                                                            className="officer-assignment-event-description"
                                                        >
                                                            <strong>
                                                                Reason:
                                                            </strong>{" "}
                                                            {event.reason ||
                                                                event.reasonText ||
                                                                event.escalationReason ||
                                                                event.note}
                                                        </p>

                                                    )}


                                                {/* =================================
                                                    DESCRIPTION
                                                ================================= */}

                                                {!isEscalation &&
                                                    (
                                                        event.description ||
                                                        event.note ||
                                                        event.remarks
                                                    ) && (

                                                        <p
                                                            className="officer-assignment-event-description"
                                                        >
                                                            {event.description ||
                                                                event.note ||
                                                                event.remarks}
                                                        </p>

                                                    )}

                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

            )}

        </section>
    );
}

export default AssignmentHistory;




