
frappe.query_reports["Leave Report"] = {
    "filters": [
        {
            "fieldname": "employee",
            "label": __("Employee"),
            "fieldtype": "Link",
            "options": "Employee",
            "default": ""
        },
        {
            "fieldname": "branch",
            "label": __("Branch"),
            "fieldtype": "Link",
            "options": "Branch",
            "default": ""
        },
        {
            "fieldname": "department",
            "label": __("Department"),
            "fieldtype": "Link",
            "options": "Department",
            "default": ""
        },
        {
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "default": frappe.defaults.get_user_default("Company")
        },
        {
            "fieldname": "year",
            "label": __("Year"),
            "fieldtype": "Select",
            "options": get_year_options(),
            "default": (new Date()).getFullYear().toString()
        }
    ],
    "onload": function(report) {
        console.log("Employee Leave Ledger report loaded");
    }
};

function get_year_options() {
    let currentYear = new Date().getFullYear();
    let options = "";
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
        options += y + "\n";
    }
    return options;
}