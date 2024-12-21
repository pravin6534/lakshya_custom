import frappe
import json

@frappe.whitelist(allow_guest=True)
def get_item_wise_rate_comparison(quotations):
    """
    Fetch and compare item-wise rates and terms from selected quotations.
    
    Args:
        quotations (str): JSON stringified list of quotation IDs.

    Returns:
        dict: A comparison dictionary with supplier names, terms, and item rates.
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
                q_doc = frappe.get_doc("Supplier Quotation", quotation_id)
                comparison["suppliers"].append({
                    "supplier_name": q_doc.supplier,
                    "terms": q_doc.terms or "No terms available."
                })
                
                for item in q_doc.items:
                    existing = next((x for x in comparison["items"] if x["item_code"] == item.item_code), None)
                    rate_field = f"rate_quotation{idx + 1}"
                    
                    if not existing:
                        item_data = {
                            "item_code": item.item_code,
                            "item_name": item.item_name,
                            "qty": item.qty,
                            "uom": item.uom,
                        }
                        for i in range(len(quotation_ids)):
                            item_data[f"rate_quotation{i + 1}"] = None
                        item_data[rate_field] = item.rate
                        
                        comparison["items"].append(item_data)
                    else:
                        existing[rate_field] = item.rate
            
            except frappe.DoesNotExistError:
                frappe.msgprint(f"Quotation '{quotation_id}' does not exist.")
            except Exception as e:
                frappe.log_error(f"Error processing quotation {quotation_id}: {e}")
                continue
        
        for item in comparison["items"]:
            for i in range(len(quotation_ids)):
                rate_field = f"rate_quotation{i + 1}"
                if rate_field not in item:
                    item[rate_field] = None
        
        return comparison
    
    except json.JSONDecodeError:
        frappe.throw("Invalid quotations format. Please provide a valid JSON stringified list of quotations.")
    except Exception as e:
        frappe.log_error(f"Error in get_item_wise_rate_comparison: {e}")
        frappe.throw("An unexpected error occurred while processing the quotations.")
