frappe.pages['supplier-comparasion'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Supplier Comparison Tool',
        single_column: true
    });

    // Create HTML structure for input fields and Compare button
    $(page.body).html(`
        <div class="form-inline">
            <div class="form-group">
                <label for="quotation1">Quotation 1:</label>
                <div id="quotation1-link"></div>
            </div>
            <div class="form-group">
                <label for="quotation2">Quotation 2:</label>
                <div id="quotation2-link"></div>
            </div>
            <div class="form-group">
                <label for="quotation3">Quotation 3:</label>
                <div id="quotation3-link"></div>
            </div>
            <button class="btn btn-primary" id="compare" style="margin-left: 10px;">Compare</button>
        </div>
        <br>
        <div id="comparison-table"></div>
        <br>
        <div id="terms-comparison" style="margin-top: 20px;"></div>
    `);

    // Render link fields for each quotation
    new frappe.ui.form.ControlLink({
        parent: $('#quotation1-link'),
        df: {
            fieldtype: 'Link',
            options: 'Supplier Quotation',
            placeholder: 'Select Quotation 1',
            onchange: function () { console.log('Quotation 1 selected'); }
        },
        render_input: true,
    });

    new frappe.ui.form.ControlLink({
        parent: $('#quotation2-link'),
        df: {
            fieldtype: 'Link',
            options: 'Supplier Quotation',
            placeholder: 'Select Quotation 2',
            onchange: function () { console.log('Quotation 2 selected'); }
        },
        render_input: true,
    });

    new frappe.ui.form.ControlLink({
        parent: $('#quotation3-link'),
        df: {
            fieldtype: 'Link',
            options: 'Supplier Quotation',
            placeholder: 'Select Quotation 3',
            onchange: function () { console.log('Quotation 3 selected'); }
        },
        render_input: true,
    });

    // Compare button logic
    $('#compare').on('click', function () {
        const quotation1 = $('#quotation1-link input').val();
        const quotation2 = $('#quotation2-link input').val();
        const quotation3 = $('#quotation3-link input').val();

        if (!quotation1 || !quotation2 || !quotation3) {
            frappe.msgprint(__('Please select all three quotations.'));
            return;
        }

        // Call server-side method for item-wise rate comparison
        frappe.call({
            method: "lakshya_custom.lakshya_custom.get_quatation.quatation.get_item_wise_rate_comparison",
            args: { quotation1, quotation2, quotation3 },
            callback: function (r) {
                if (r.message) {
                    render_rate_comparison_table(r.message);
                } else {
                    frappe.msgprint(__('No data available for the given quotations.'));
                }
            },
        });
    });

    // Function to render the comparison table dynamically
    function render_rate_comparison_table(comparison) {
        let table_html = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>UOM</th>
                        <th>Rate (Test)</th>
                        <th>Amount (Test)</th>
                        <th>Rate (Test2)</th>
                        <th>Amount (Test2)</th>
                        <th>Rate (Test3)</th>
                        <th>Amount (Test3)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let total_supplier1 = 0;
        let total_supplier2 = 0;
        let total_supplier3 = 0;

        comparison.items.forEach(item => {
            const amount1 = item.rate_quotation1 ? (item.qty * item.rate_quotation1) : 0;
            const amount2 = item.rate_quotation2 ? (item.qty * item.rate_quotation2) : 0;
            const amount3 = item.rate_quotation3 ? (item.qty * item.rate_quotation3) : 0;

            total_supplier1 += amount1;
            total_supplier2 += amount2;
            total_supplier3 += amount3;

            table_html += `
                <tr>
                    <td>${item.item_code}</td>
                    <td>${item.item_name}</td>
                    <td>${item.qty}</td>
                    <td>${item.uom}</td>
                    <td>${item.rate_quotation1 || '-'}</td>
                    <td>${amount1 || '-'}</td>
                    <td>${item.rate_quotation2 || '-'}</td>
                    <td>${amount2 || '-'}</td>
                    <td>${item.rate_quotation3 || '-'}</td>
                    <td>${amount3 || '-'}</td>
                </tr>
            `;
        });

        table_html += `</tbody></table>`;

        // Append table to the page body
        $('#comparison-table').html(table_html);

        // Render total amounts below the "Amount" columns
        render_total_amount_below_column(total_supplier1, total_supplier2, total_supplier3);

        // Render terms and conditions in column format
        render_terms_comparison(comparison);
    }

    // Function to render total amount block below "Amount" columns for each supplier
    function render_total_amount_below_column(total_supplier1, total_supplier2, total_supplier3) {
        const total_html = `
            <tr>
                <td colspan="5"><strong>Total:</strong></td>
                <td><strong>${total_supplier1.toFixed(2)}</strong></td>
                <td></td>
                <td><strong>${total_supplier2.toFixed(2)}</strong></td>
                <td></td>
                <td><strong>${total_supplier3.toFixed(2)}</strong></td>
            </tr>
        `;
        $('#comparison-table tbody').append(total_html);  // Append the totals at the end of the table
    }

    // Function to render the terms and conditions in column-wise format
    function render_terms_comparison(comparison) {
        let terms_html = `
            <h4>Terms and Conditions Comparison:</h4>
            <div class="row">
                <div class="col-md-4">
                    <h5>${comparison.supplier1_name}</h5>
                    <p>${comparison.supplier1_terms || 'No terms available.'}</p>
                </div>
                <div class="col-md-4">
                    <h5>${comparison.supplier2_name}</h5>
                    <p>${comparison.supplier2_terms || 'No terms available.'}</p>
                </div>
                <div class="col-md-4">
                    <h5>${comparison.supplier3_name}</h5>
                    <p>${comparison.supplier3_terms || 'No terms available.'}</p>
                </div>
            </div>
        `;
        $('#terms-comparison').html(terms_html);
    }
};
