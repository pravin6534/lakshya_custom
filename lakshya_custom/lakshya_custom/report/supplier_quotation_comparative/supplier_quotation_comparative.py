import frappe

def execute(filters=None):
    """
    Generate a pivot-style report to compare multiple supplier quotations with merged headers.

    Args:
        filters (dict): Filters passed from the report UI.

    Returns:
        columns (list): List of column headers for the report.
        data (list): Tabular data for the report in pivot format.
    """

    # Ensure filters are provided
    if not filters or not filters.get("supplier_quotations"):
        frappe.throw("Please select at least one Supplier Quotation to compare.")

    # Get the list of selected Supplier Quotations
    supplier_quotations = filters.get("supplier_quotations")

    # Validate that the list is not empty
    if not isinstance(supplier_quotations, list) or len(supplier_quotations) == 0:
        frappe.throw("Invalid input for Supplier Quotations. Provide a valid list.")

    # Fetch data for the selected Supplier Quotations
    supplier_data = frappe.db.sql("""
        SELECT
            sqi.item_code AS item_code,
            sqi.item_name AS item_name,
            sqi.description AS description,  -- Fetch the item description
            sq.supplier AS supplier,
            sqi.rate AS rate,
            sqi.qty AS qty,
            (sqi.rate * sqi.qty) AS amount
        FROM
            `tabSupplier Quotation` sq
        INNER JOIN
            `tabSupplier Quotation Item` sqi
        ON
            sq.name = sqi.parent
        WHERE
            sq.name IN (%s)
        ORDER BY
            sqi.item_code, sq.supplier
    """ % ", ".join(["%s"] * len(supplier_quotations)), tuple(supplier_quotations), as_dict=True)

    # Create a dictionary to organize data in pivot format
    pivot_data = {}
    suppliers = set()

    # Dictionary to store grand totals for each supplier
    grand_totals = {}

    for row in supplier_data:
        item_key = (row["item_name"], row["description"])  # Use a tuple of item name and description as the row key
        supplier = row["supplier"]

        # Abbreviate supplier name or use short form (e.g., initials)
        short_supplier = ''.join([word[0].upper() for word in supplier.split()])  # Example: "Supplier X" -> "SX"
        suppliers.add(short_supplier)

        # Initialize grand totals for the supplier if not already done
        if short_supplier not in grand_totals:
            grand_totals[short_supplier] = 0

        # Add to grand total for the supplier
        grand_totals[short_supplier] += row["amount"]

        if item_key not in pivot_data:
            pivot_data[item_key] = {}

        # Add data for the supplier under the item's row
        pivot_data[item_key][short_supplier] = {
            "rate": row["rate"],
            "qty": row["qty"],
            "amount": row["amount"]
        }

    # Prepare dynamic columns in pivot format (Rate, Qty, Amount under each supplier)
    columns = [
        {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 200},
        {"label": "Description", "fieldname": "description", "fieldtype": "Data", "width": 300},  # Add description column
    ]
    for supplier in sorted(suppliers):  # Dynamically add Rate, Qty, Amount for each supplier
        columns.extend([
            {"label": f"{supplier} - Rate", "fieldname": f"{supplier}_rate", "fieldtype": "Currency", "width": 100},
            {"label": f"{supplier} - Qty", "fieldname": f"{supplier}_qty", "fieldtype": "Float", "width": 100},
            {"label": f"{supplier} - Amount", "fieldname": f"{supplier}_amount", "fieldtype": "Currency", "width": 150}
        ])

    # Prepare data rows for the pivot
    data = []
    for (item_name, description), supplier_values in pivot_data.items():
        row = {
            "item_name": item_name,
            "description": description  # Include item description in the row
        }
        for supplier in suppliers:
            if supplier in supplier_values:  # If the supplier provided a quote for the item
                supplier_data = supplier_values[supplier]
                row[f"{supplier}_rate"] = supplier_data.get("rate")
                row[f"{supplier}_qty"] = supplier_data.get("qty")
                row[f"{supplier}_amount"] = supplier_data.get("amount")
            else:
                # Leave blank if no quotation for the item
                row[f"{supplier}_rate"] = None
                row[f"{supplier}_qty"] = None
                row[f"{supplier}_amount"] = None
        data.append(row)

    # Add a grand total row at the end
    grand_total_row = {"item_name": "Grand Total", "description": ""}
    for supplier in suppliers:
        grand_total_row[f"{supplier}_rate"] = None  # No rate for the total row
        grand_total_row[f"{supplier}_qty"] = None   # No qty for the total row
        grand_total_row[f"{supplier}_amount"] = grand_totals.get(supplier, 0)  # Total amount for each supplier

    # Append the grand total row to the data
    data.append(grand_total_row)

    return columns, data