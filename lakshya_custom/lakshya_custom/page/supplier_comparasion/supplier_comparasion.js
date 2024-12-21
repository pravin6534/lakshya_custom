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
                console.log('API Response:', r.message);  // Log response to inspect data format

                if (r.message) {
                    render_rate_comparison_table(r.message);
                } else {
                    frappe.msgprint(__('No data available for the given quotations.'));
                }
            },
            error: function (err) {
                console.error('Error fetching comparison data:', err);
                frappe.msgprint(__('Failed to fetch data for comparison. Please try again.'));
            }
        });
    });

    // Render rate comparison table dynamically based on response format
    function render_rate_comparison_table(comparison) {
        // Check if comparison object and necessary fields are present
        if (!comparison || !Array.isArray(comparison.items) || !Array.isArray(comparison.suppliers)) {
            frappe.msgprint(__('Invalid data format received. Missing items or suppliers.'));
            return;
        }

        let table_html = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>UOM</th>
        `;

        // Create table headers dynamically for each supplier
        comparison.suppliers.forEach(supplier => {
            table_html += `<th>Rate (${supplier.supplier_name})</th><th>Amount (${supplier.supplier_name})</th>`;
        });

        table_html += `</tr></thead><tbody>`;

        const totalAmounts = {};

        comparison.items.forEach(item => {
            table_html += `
                <tr>
                    <td>${item.item_code}</td>
                    <td>${item.item_name}</td>
                    <td>${item.qty}</td>
                    <td>${item.uom}</td>
            `;

            // For each supplier, show rate and amount dynamically
            comparison.suppliers.forEach(supplier => {
                const rateField = `rate_${supplier.supplier_name.replace(' ', '')}`;  // Example: rate_SupplierA
                const amountField = `amount_${supplier.supplier_name.replace(' ', '')}`;
                const rate = item[rateField] || '-';
                const amount = item[amountField] || '-';
                
                totalAmounts[supplier.supplier_name] = (totalAmounts[supplier.supplier_name] || 0) + (amount !== '-' ? parseFloat(amount) : 0);
                table_html += `<td>${rate}</td><td>${amount}</td>`;
            });

            table_html += `</tr>`;
        });

        table_html += `</tbody></table>`;
        $('#comparison-table').html(table_html);

        // Add total calculation row
        const totalsHtml = `
            <tr>
                <td colspan="4"><strong>Total:</strong></td>
                ${Object.entries(totalAmounts).map(([supplier, total]) => `<td></td><td><strong>${total.toFixed(2)}</strong></td>`).join('')}
            </tr>
        `;
        $('#comparison-table tbody').append(totalsHtml);

        render_terms_comparison(comparison);
    }

    function render_terms_comparison(comparison) {
        let terms_html = `
            <h4>Terms and Conditions Comparison:</h4>
            <div class="row">
                ${comparison.suppliers.map(supplier => `
                    <div class="col-md-4">
                        <h5>${supplier.supplier_name}</h5>
                        <p>${supplier.terms || 'No terms available.'}</p>
                    </div>
                `).join('')}
            </div>
        `;
        $('#terms-comparison').html(terms_html);
    }
};
