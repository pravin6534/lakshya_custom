frappe.pages['supplier-comparasion'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Supplier Comparison Tool',
        single_column: true
    });

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
        <div id="supplier-summary"></div>
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
                    console.log('API Response:', r.message);
                    render_rate_comparison_table(r.message);
                } else {
                    frappe.msgprint(__('No data available for the given quotations.'));
                }
            },
        });
    });


    
    function render_rate_comparison_table(comparison) {
        let table_html = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Last Rate</th>
                        <th>Qty</th>
                        <th>UOM</th>
        `;
        // comparison.suppliers.forEach(supplier => {
        //     table_html += `<th colspan="3">${supplier.supplier_name}</th>`;
        // });
        comparison.suppliers.forEach(supplier => {
            let supplier_name = supplier.supplier_name;
            if (supplier_name.length > 12) {
                supplier_name = supplier_name.substring(0, 12) + '...';  // Truncate name if it exceeds 12 characters
            }
            table_html += `
                <th colspan="3">${supplier_name}</th>
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
        comparison.suppliers.forEach(() => {
            table_html += `<th>Description</th><th>Rate</th><th>Amount</th>`;
        });
        table_html += `</tr></thead><tbody>`;

        const totalAmounts = {};
        comparison.items.forEach(item => {
            table_html += `<tr><td>${item.item_code}</td><td>${item.last_purchase_rate || ''}</td><td>${item.qty}</td><td>${item.uom}</td>`;

            let minRate = Infinity;
            let minRateIndex = -1;

            comparison.suppliers.forEach((supplier, idx) => {
                const rate = item[`rate_quotation${idx + 1}`] || 0;
                const amount = rate > 0 ? rate * item.qty : 0;
                const description = item[`description_quotation${idx + 1}`] || 'No Description';

                if (rate > 0 && rate < minRate) {
                    minRate = rate;
                    minRateIndex = idx;
                }

                totalAmounts[supplier.supplier_name] = (totalAmounts[supplier.supplier_name] || 0) + amount;

                table_html += `<td>${description}</td><td${idx === minRateIndex ? ' style="background-color:#d4edda;"' : ''}>${rate > 0 ? rate : ''}</td><td>${amount > 0 ? amount : ''}</td>`;
            });

            table_html += `</tr>`;
        });

        table_html += `<tr><td colspan="4"><strong>Total:</strong></td>`;
        comparison.suppliers.forEach(supplier => {
            table_html += `<td colspan="3"><strong>${(totalAmounts[supplier.supplier_name] || 0).toFixed(2)}</strong></td>`;
        });
        table_html += `</tr></tbody></table>`;

        $('#comparison-table').html(table_html);
        render_supplier_summary(totalAmounts);
    }

    // function render_supplier_summary(totalAmounts) {
    //     const summaryHtml = Object.keys(totalAmounts).map(supplierName => `
    //         <div><strong>${supplierName}:</strong> ${totalAmounts[supplierName].toFixed(2)}</div>
    //     `).join('');
    //     $('#supplier-summary').html(`<h4>Supplier Summary:</h4>${summaryHtml}`);
    // }
};
