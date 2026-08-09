const ESCALATION_REASONS = [
  {
    code: "SPECIALIZED_RESOURCES_REQUIRED",
    label:
      "Specialized resources or technical expertise are required.",
  },

  {
    code: "EQUIPMENT_UNAVAILABLE",
    label:
      "Required equipment or machinery is currently unavailable.",
  },

  {
    code: "INSUFFICIENT_MANPOWER",
    label:
      "Additional manpower is required to handle the complaint.",
  },

  {
    code: "SAFETY_OR_ACCESS_CONSTRAINT",
    label:
      "Safety or site-access constraints are preventing the work.",
  },

  {
    code: "WORK_REQUIRES_HIGHER_AUTHORITY",
    label:
      "The complaint requires approval or action from a higher authority.",
  },
];

module.exports = ESCALATION_REASONS;