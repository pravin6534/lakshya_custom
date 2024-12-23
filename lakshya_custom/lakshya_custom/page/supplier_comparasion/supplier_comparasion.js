frappe.pages['supplier-comparasion'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Supplier Comparison Tool',
        single_column: true
    });

    // HTML structure
    $(page.body).html(`
        <div class="form-inline">
            <div id="quotation-selectors" class="form-group">
                <label>Quotations:</label>
            </div>
            <button class="btn btn-success" id="add-quotation" style="margin-left: 10px;">Add Quotation</button>
            <button class="btn btn-danger" id="remove-quotation" style="margin-left: 5px;">Remove Quotation</button>
            <button class="btn btn-primary" id="compare" style="margin-left: 10px;">Compare</button>
        </div>
        <br>
        <div id="comparison-table"></div>
        <br>
        <div id="terms-comparison" style="margin-top: 20px;"></div>
    `);

    let quotationCounter = 0;

    // Function to add a quotation selector
    function addQuotationSelector() {
        quotationCounter++;
        const selectorHtml = `
            <div class="quotation-group" id="quotation-group-${quotationCounter}" style="margin-top: 5px;">
                <label for="quotation${quotationCounter}">Quotation ${quotationCounter}:</label>
                <div id="quotation${quotationCounter}-link"></div>
            </div>
        `;
        $('#quotation-selectors').append(selectorHtml);
        new frappe.ui.form.ControlLink({
            parent: $(`#quotation${quotationCounter}-link`),
            df: {
                fieldtype: 'Link',
                options: 'Supplier Quotation',
                placeholder: `Select Quotation ${quotationCounter}`,
                onchange: function () {
                    console.log(`Quotation ${quotationCounter} selected`);
                }
            },
            render_input: true,
        });
    }

    // Initial two quotation selectors
    addQuotationSelector();
    addQuotationSelector();

    // Add and Remove button logic
    $('#add-quotation').on('click', function () {
        addQuotationSelector();
    });

    $('#remove-quotation').on('click', function () {
        if (quotationCounter > 1) {
            $(`#quotation-group-${quotationCounter}`).remove();
            quotationCounter--;
        } else {
            frappe.msgprint(__('At least one quotation is required.'));
        }
    });

    // Compare button logic
    $('#compare').on('click', function () {
        const quotations = [];
        $('.quotation-group').each(function () {
            const quotationId = $(this).find('input').val();
            if (quotationId) quotations.push(quotationId);
        });

        if (quotations.length < 2) {
            frappe.msgprint(__('Please select at least two quotations.'));
            return;
        }

        frappe.call({
            method: "lakshya_custom.lakshya_custom.get_quatation.quatation.get_item_wise_rate_comparison",
            args: { quotations },
            callback: function (r) {
                if (r.message) {
                    console.log('API Response:', r.message);  // Log the API response to verify data structure
                    render_rate_comparison_table(r.message);
                } else {
                    frappe.msgprint(__('No data available for the given quotations.'));
                }
            },
        });
    });

    // Rendering function for the table
    function render_rate_comparison_table(comparison) {
        let table_html = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>UOM</th>
        `;

        // Add merged headers for each supplier's rate and amount columns dynamically
        comparison.suppliers.forEach(supplier => {
            // Truncate or pad supplier names to be 12 characters from the left
            let supplierName = supplier.supplier_name;
            if (supplierName.length > 12) {
                supplierName = supplierName.substring(0, 12); // Truncate if longer than 12 characters
            } else if (supplierName.length < 12) {
                supplierName = supplierName.padEnd(12, ' '); // Pad with spaces if shorter than 12 characters
            }

            table_html += `
                <th colspan="2">${supplierName}</th>
            `;
        });

        table_html += `
                    </tr>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
        `;

        // Add Rate and Amount headers for each supplier dynamically
        comparison.suppliers.forEach(() => {
            table_html += `
                <th>Rate</th>
                <th>Amount</th>
            `;
        });

        table_html += `
                    </tr>
                </thead>
                <tbody>
        `;

        let totalAmounts = {}; // Store total amount separately for each supplier
        comparison.items.forEach(item => {
            table_html += `
                <tr>
                    <td>${item.item_code}</td>
                    <td>${item.item_name}</td>
                    <td>${item.qty}</td>
                    <td>${item.uom}</td>
            `;

            // Loop through each supplier to calculate the rate and amount
            comparison.suppliers.forEach((supplier, idx) => {
                let rate = 0;  // Initialize to 0 in case rate is missing
                let amount = 0; // Initialize to 0 in case amount calculation fails

                // Dynamically get rate and amount based on the supplier index
                rate = item[`rate_quotation${idx + 1}`] || 0;
                amount = rate !== 0 ? (rate * item.qty).toFixed(2) : 0;

                // Update total amounts for each supplier separately
                if (amount !== 0) {
                    if (!totalAmounts[supplier.supplier_name]) {
                        totalAmounts[supplier.supplier_name] = 0;
                    }
                    totalAmounts[supplier.supplier_name] += parseFloat(amount);
                }

                table_html += `
                    <td>${rate > 0 ? rate : ''}</td>
                    <td>${amount > 0 ? amount : ''}</td>
                `;
            });

            table_html += `
                </tr>
            `;
        });

        table_html += `</tbody></table>`;
        $('#comparison-table').html(table_html);

        // Render the totals row (sum per supplier)
        let totalsHtml = `
            <tr>
                <td colspan="4"><strong>Total:</strong></td>
        `;
        
        // Add total amounts for each supplier
        comparison.suppliers.forEach(supplier => {
            const total = totalAmounts[supplier.supplier_name] || 0;
            totalsHtml += `<td colspan="2"><strong>${total.toFixed(2)}</strong></td>`;
        });

        totalsHtml += `</tr>`;
        $('#comparison-table tbody').append(totalsHtml);

        // Render the terms comparison section
        render_terms_comparison(comparison);
    }

    // Function to render Terms and Conditions comparison
    function render_terms_comparison(comparison) {
        let terms_html = `
            <h4>Terms and Conditions Comparison:</h4>
            <div class="row">
                ${comparison.suppliers.map(q => `
                    <div class="col-md-4">
                        <h5>${q.supplier_name}</h5>
                        <p>${q.terms || 'No terms available.'}</p>
                    </div>
                `).join('')}
            </div>
        `;
        $('#terms-comparison').html(terms_html);
    }
};
