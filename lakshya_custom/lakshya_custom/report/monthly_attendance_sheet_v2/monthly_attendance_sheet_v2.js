

// Copyright (c) 2025, Pravin Dewangan and contributors
// For license information, please see license.txt

frappe.query_reports["Monthly Attendance Sheet V2"] = {
    filters: [
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
            reqd: 1,
            default: frappe.datetime.add_days(frappe.datetime.get_today(), -30),
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            reqd: 1,
            default: frappe.datetime.get_today(),
        },
        {
            fieldname: "employee",
            label: __("Employee"),
            fieldtype: "Link",
            options: "Employee",
            get_query: () => {
                const company = frappe.query_report.get_filter_value("company");
                if (!company) {
                    frappe.msgprint(__("Please select a company to filter employees."));
                    return {};
                }
                return {
                    filters: {
                        company: company,
                    },
                };
            },
        },
        {
            fieldname: "company",
            label: __("Company"),
            fieldtype: "Link",
            options: "Company",
            default: frappe.defaults.get_user_default("Company"),
            reqd: 1,
        },
        {
            fieldname: "group_by",
            label: __("Group By"),
            fieldtype: "Select",
            options: ["", "Branch", "Grade", "Department", "Designation"],
        },
        {
            fieldname: "include_company_descendants",
            label: __("Include Company Descendants"),
            fieldtype: "Check",
            default: 1,
        },
        {
            fieldname: "summarized_view",
            label: __("Summarized View"),
            fieldtype: "Check",
            default: 0,
        },
    ],

    /**
     * Formatter function to style the values in the report dynamically.
     * @param {string} value - The value to format.
     * @param {Object} row - The current row of the report.
     * @param {Object} column - The current column of the report.
     * @param {Object} data - The full data object of the current row.
     * @param {Function} default_formatter - The default formatter function.
     * @returns {string} - The formatted value as a string.
     */
    formatter: function (value, row, column, data, default_formatter) {
        // Apply the default formatting first
        value = default_formatter(value, row, column, data);

        // Get filter values to determine formatting rules
        const summarized_view = frappe.query_report.get_filter_value("summarized_view");
        const group_by = frappe.query_report.get_filter_value("group_by");

        // Bold the group_by column if grouping is enabled
        if (group_by && column.colIndex === 1) {
            value = `<strong>${value}</strong>`;
        }

        // Apply color formatting based on attendance statuses for detailed view
        if (!summarized_view) {
            if ((group_by && column.colIndex > 3) || (!group_by && column.colIndex > 2)) {
                if (value === "P" || value === "WFH") {
                    value = `<span style='color:green'>${value}</span>`;
                } else if (value === "A") {
                    value = `<span style='color:red'>${value}</span>`;
                } else if (value === "HD") {
                    value = `<span style='color:orange'>${value}</span>`;
                } else if (value === "L") {
                    value = `<span style='color:#318AD8'>${value}</span>`;
                }
            }
        }

        return value;
    },
};
