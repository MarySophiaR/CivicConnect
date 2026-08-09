import { useEffect, useState } from "react";
import { Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import API from "../../api/axios";

function OfficerNotification() {

    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [open, setOpen] = useState(false);


    const getRolePath = () => {

        const user =
            JSON.parse(
                localStorage.getItem("user") || "{}"
            );

        switch (user.role) {

            case "juniorEngineer":
                return "junior-engineer";

            case "assistantExecutiveEngineer":
                return "assistant-executive-engineer";

            case "executiveEngineer":
                return "executive-engineer";

            case "municipalCommissioner":
                return "municipal-commissioner";

            default:
                return null;
        }
    };


    const fetchAlerts = async () => {

        try {

            const response =
                await API.get("/alerts");

            setAlerts(
                response.data.alerts || []
            );

        } catch {
            setAlerts([]);
        }
    };


    useEffect(() => {

        fetchAlerts();

        const interval =
            setInterval(
                fetchAlerts,
                60000
            );

        return () =>
            clearInterval(interval);

    }, []);


    const unreadCount =
        alerts.filter(
            (alert) => !alert.isRead
        ).length;


    const handleAlertClick =
        async (alert) => {

            try {

                if (!alert.isRead) {

                    await API.patch(
                        `/alerts/${alert._id}/read`
                    );

                }

            } catch {
                // Continue navigation.
            }


            const rolePath =
                getRolePath();


            if (
                rolePath &&
                alert.complaint?._id
            ) {

                navigate(
                    `/${rolePath}/complaints/${alert.complaint._id}`
                );

            }

            setOpen(false);

            fetchAlerts();
        };


    return (

        <div className="officer-notification">

            <button
                type="button"
                className="officer-notification-button"
                aria-label="Notifications"
                onClick={() =>
                    setOpen(!open)
                }
            >

                <Bell
                    size={22}
                    strokeWidth={1.8}
                />

                {unreadCount > 0 && (

                    <span className="officer-notification-count">
                        {unreadCount > 9
                            ? "9+"
                            : unreadCount}
                    </span>

                )}

            </button>


            {open && (

                <div className="officer-notification-dropdown">

                    <div className="officer-notification-header">

                        <strong>
                            Notifications
                        </strong>

                    </div>


                    {alerts.length === 0 ? (

                        <div className="officer-no-notifications">

                            No notifications

                        </div>

                    ) : (

                        <div className="officer-notification-list">

                            {alerts.map(
                                (alert) => (

                                    <button
                                        key={alert._id}
                                        type="button"
                                        className={`officer-notification-item ${
                                            alert.isRead
                                                ? ""
                                                : "unread"
                                        }`}
                                        onClick={() =>
                                            handleAlertClick(
                                                alert
                                            )
                                        }
                                    >

                                        <div className="officer-notification-content">

                                            <strong>
                                                {alert.title}
                                            </strong>

                                            <p>
                                                {alert.message}
                                            </p>

                                        </div>


                                        <ArrowRight
                                            size={17}
                                            strokeWidth={1.8}
                                        />

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}

export default OfficerNotification;