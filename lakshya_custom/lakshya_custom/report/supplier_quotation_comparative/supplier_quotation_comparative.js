// Copyright (c) 2025, Pravin Dewangan and contributors
// For license information, please see license.txt
// File location: <your_app>/your_module/report/supplier_quotation_comparison/supplier_quotation_comparison.js


frappe.query_reports["Supplier Quotation Comparative"] = {
    "filters": [
        {
            "fieldname": "supplier_quotations",
            "label": "Supplier Quotations",
            "fieldtype": "MultiSelectList",
            "options": "Supplier Quotation",
            "get_data": function (txt) {
                return frappe.db.get_link_options("Supplier Quotation", txt);
            },
            "reqd": 1
        }
    ],

    // Add the formatter function for conditional formatting
    "formatter": function (value, row, column, data, default_formatter) {
        // Use default formatter to style the cell
        value = default_formatter(value, row, column, data);

        // Exclude Last Purchase Rate column from being highlighted
        if (column.fieldname === "last_purchase_rate") {
            return value; // Do nothing for this column
        }

        // Check if the column is a supplier rate column (ends with '_rate')
        if (column.fieldname.endsWith("_rate")) {
            // Extract all supplier rates for the current row (exclude nulls)
            let rates = [];
            Object.keys(data).forEach((key) => {
                if (key.endsWith("_rate") && key !== "last_purchase_rate" && data[key] !== null) {
                    rates.push(data[key]);
                }
            });

            // Find the lowest rate among supplier rates
            let lowest_rate = Math.min(...rates);

            // If the current value matches the lowest rate, apply green highlight
            if (data[column.fieldname] === lowest_rate) {
                value = `<span style="
                    background-color: green; 
                    color: white; 
                    padding: 3px; 
                    border-radius: 3px; 
                    display: inline-block;
                ">
                    ${value}
                </span>`;
            }
        }

        return value;
    }
};