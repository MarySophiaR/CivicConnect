import {
    Users,
    UserCheck,
    ShieldCheck,
    UserX
} from "lucide-react";

import "../../styles/systemAdminComponents.css";


function AdminDashboardCards({
    counts = {},
    loading = false
}) {

    const dashboardCards = [
        {
            title: "Total Officers",
            value: counts.totalOfficers ?? 0,
            icon: Users,
            className: "total"
        },

        {
            title: "Active Officers",
            value: counts.activeOfficers ?? 0,
            icon: UserCheck,
            className: "active"
        },
        {
            title: "Inactive Officers",
            value: counts.inactiveOfficers ?? 0,
            icon: UserX,
            className: "inactive"
        },
        {
            title: "Junior Engineers",
            value: counts.juniorEngineer ?? 0,
            icon: UserCheck,
            className: "junior"
        },
        {
            title: "Assistant Executive Engineers",
            value: counts.assistantExecutiveEngineer ?? 0,
            icon: UserCheck,
            className: "assistant"
        },
        {
            title: "Executive Engineers",
            value: counts.executiveEngineer ?? 0,
            icon: UserCheck,
            className: "executive"
        },
        {
            title: "Municipal Commissioners",
            value: counts.municipalCommissioner ?? 0,
            icon: ShieldCheck,
            className: "commissioner"
        }
        
    ];


    return (
        <div className="admin-stat-grid">

            {dashboardCards.map((card) => {

                const Icon = card.icon;

                return (
                    <div
                        className={`admin-stat-card ${card.className}`}
                        key={card.title}
                    >

                        <div className="admin-stat-icon">
                            <Icon
                                size={22}
                                strokeWidth={1.9}
                            />
                        </div>


                        <div className="admin-stat-content">

                            <span>
                                {card.title}
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : card.value
                                }
                            </strong>

                        </div>

                    </div>
                );

            })}

        </div>
    );
}


export default AdminDashboardCards;