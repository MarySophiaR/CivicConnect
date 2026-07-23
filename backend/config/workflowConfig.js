const WORKFLOW = {
    juniorEngineer: {
        next: "assistantExecutiveEngineer",
        slaDays: 3
    },

    assistantExecutiveEngineer: {
        next: "executiveEngineer",
        slaDays: 5
    },

    executiveEngineer: {
        next: null,
        slaDays: 7
    }
};

module.exports = WORKFLOW;