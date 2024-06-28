frappe.ui.form.on('Request for Quotation', {
    refresh: function(frm) {
        if (frm.doc.docstatus === 0) {
            // Add custom button "Get Supplier From Item" within the "Tools" section
            frm.add_custom_button(
                __("Get Supplier From Item"),
                function () {
                    var items = frm.doc.items;

                    if (items.length > 0) {
                        items.forEach(function (item) {
                            var itemCode = item.item_code;
                            var qty = item.qty;

                            console.log(`Item Code: ${itemCode}, Quantity: ${qty}`);

                            fetch_supplier_items(frm, itemCode);
                        });
                    } else {
                        frappe.msgprint(__('No items found in the child table.'));
                    }
                },
                __("Tools")
            );

            function fetch_supplier_items(frm, item_code) {
                frappe.call({
                    method: 'lakshya_custom.request_for_quatation.get_supplier.get_child_table_data',
                    args: {
                        parent_doctype: 'Item',
                        parent_name: item_code,
                        child_table_fieldname: 'supplier_items'  // Replace with the actual child table field name
                    },
                    callback: function(r) {
                        if (r.message) {
                            console.log('Suppliers for item ' + item_code + ':', r.message);

                            frappe.model.clear_table(frm.doc, 'suppliers');

                            r.message.forEach(function(supplier) {
                                var row = frappe.model.add_child(frm.doc, 'suppliers');
                                row.supplier = supplier;  // Assuming supplier is just a name in the array
                            });

                            frm.refresh_field('suppliers');
                        } else {
                            console.log('No child table data found for item ' + item_code);
                        }
                    }
                });
            }
        }

        if (frm.doc.docstatus === 1) {
            // Add custom button "Send Whatsapp" within the "Tools" section
            frm.add_custom_button(
                __("Send Whatsapp"),
                function () {
                    frappe.call({
                        method: 'lakshya_custom.request_for_quatation.get_supplier.fetch_supplier_data',
                        args: {
                            docname: frm.doc.name  // Pass any necessary arguments to the server script
                        },
                        callback: function(r) {
                            if (r.message) {
                                frappe.msgprint(__('Supplier data fetched successfully.'));
                                // Handle the fetched data, e.g., send it via WhatsApp
                                console.log('Fetched supplier data:', r.message);
                            } else {
                                frappe.msgprint(__('Failed to fetch supplier data.'));
                            }
                        }
                    });
                },
                __("Tools")
            );
        }
    }
});
