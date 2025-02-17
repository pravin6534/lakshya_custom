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
            "get_data": function(txt) {
                return frappe.db.get_link_options("Supplier Quotation", txt);
            },
            "reqd": 1
        }
    ],

    // Add the formatter function for conditional formatting
    "formatter": function(value, row, column, data, default_formatter) {
        // Use default formatter to style the cell
        value = default_formatter(value, row, column, data);

        // Style the "Grand Total" row
        if (data && data.item_name === "Grand Total") {
            value = `<span style="
                font-weight: bold; 
                color: black;">
                ${value}
            </span>`;
        }

        // Check if the column is a rate column
        if (column.fieldname.endsWith("_rate")) {
            // Extract all rates for the current row (item)
            let rates = [];
            Object.keys(data).forEach((key) => {
                if (key.endsWith("_rate") && data[key] !== null) {
                    rates.push(data[key]);
                }
            });

            // Find the lowest rate in the row
            let lowest_rate = Math.min(...rates);

            // If the current value is the lowest rate, apply green highlight with visible white text
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