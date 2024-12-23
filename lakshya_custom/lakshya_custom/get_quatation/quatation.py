import frappe
import json

@frappe.whitelist(allow_guest=True)
def get_item_wise_rate_comparison(quotations):
    """
    Fetch and compare item-wise rates, terms, last purchase rate, and description from selected quotations.

    Args:
        quotations (str): JSON stringified list of quotation IDs.

    Returns:
        dict: A comparison dictionary with supplier names, terms, item rates, last purchase rate, and item description.
    """
    try:
        # Parse quotations argument from stringified JSON to Python list
        quotation_ids = json.loads(quotations)

        if not quotation_ids or len(quotation_ids) < 2:
            frappe.throw("Please select at least two quotations for comparison.")
        
        comparison = {
            "suppliers": [],
            "items": []
        }

        for idx, quotation_id in enumerate(quotation_ids):
            try:
                # Fetch Supplier Quotation document
                q_doc = frappe.get_doc("Supplier Quotation", quotation_id)
                
                # Add supplier and terms information to the comparison result
                comparison["suppliers"].append({
                    "supplier_name": q_doc.supplier,
                    "terms": q_doc.terms or "No terms available."
                })
                
                for item in q_doc.items:
                    existing = next((x for x in comparison["items"] if x["item_code"] == item.item_code), None)
                    rate_field = f"rate_quotation{idx + 1}"
                    description_field = f"description_quotation{idx + 1}"

                    # Get Last Purchase Rate from the Item doctype
                    item_doc = frappe.get_doc("Item", item.item_code)
                    last_purchase_rate = item_doc.last_purchase_rate if item_doc.last_purchase_rate else None
                    
                    # Fetch description directly from the Supplier Quotation item
                    description = item.description if item.description else "No description available."
                    
                    if not existing:
                        # Create new item entry in comparison list
                        item_data = {
                            "item_code": item.item_code,
                            "item_name": item.item_name,
                            "qty": item.qty,
                            "uom": item.uom,
                            "last_purchase_rate": last_purchase_rate
                        }

                        for i in range(len(quotation_ids)):
                            item_data[f"rate_quotation{i + 1}"] = None
                            item_data[f"description_quotation{i + 1}"] = None  # Add description for each quotation
                        
                        item_data[rate_field] = item.rate
                        item_data[description_field] = description
                        
                        # Add the item to the comparison items
                        comparison["items"].append(item_data)
                    else:
                        # Update existing item with the current rate and any missing information
                        existing[rate_field] = item.rate
                        existing[description_field] = description  # Update the description field
                        # Update the last purchase rate only if not set before
                        existing["last_purchase_rate"] = existing["last_purchase_rate"] or last_purchase_rate

            except frappe.DoesNotExistError:
                frappe.msgprint(f"Quotation '{quotation_id}' does not exist.")
            except Exception as e:
                frappe.log_error(f"Error processing quotation {quotation_id}: {e}")
                continue
        
        # Fill empty rate fields and description fields for all quotations (if not set)
        for item in comparison["items"]:
            # Ensure that rate and description fields are included for all quotations
            for i in range(len(quotation_ids)):
                rate_field = f"rate_quotation{i + 1}"
                description_field = f"description_quotation{i + 1}"

                if rate_field not in item:
                    item[rate_field] = None
                if description_field not in item:
                    item[description_field] = None

        return comparison

    except json.JSONDecodeError:
        frappe.throw("Invalid quotations format. Please provide a valid JSON stringified list of quotations.")
    except Exception as e:
        frappe.log_error(f"Error in get_item_wise_rate_comparison: {e}")
        frappe.throw("An unexpected error occurred while processing the quotations.")
