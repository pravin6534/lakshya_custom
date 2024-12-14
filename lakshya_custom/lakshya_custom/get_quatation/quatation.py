import frappe

@frappe.whitelist()
def get_item_wise_rate_comparison(quotation1, quotation2, quotation3):
    quotations = [quotation1, quotation2, quotation3]
    comparison = {
        "supplier1_name": "",
        "supplier2_name": "",
        "supplier3_name": "",
        "supplier1_terms": "",
        "supplier2_terms": "",
        "supplier3_terms": "",
        "items": []
    }
    
    # Iterate through the quotations
    for idx, doc in enumerate(quotations):
        q_doc = frappe.get_doc("Supplier Quotation", doc)
        supplier_name = q_doc.supplier
        terms = q_doc.terms  # Updated to fetch the terms field
        
        if idx == 0:
            comparison["supplier1_name"] = supplier_name
            comparison["supplier1_terms"] = terms
        elif idx == 1:
            comparison["supplier2_name"] = supplier_name
            comparison["supplier2_terms"] = terms
        elif idx == 2:
            comparison["supplier3_name"] = supplier_name
            comparison["supplier3_terms"] = terms
        
        for item in q_doc.items:
            existing = next((x for x in comparison["items"] if x["item_code"] == item.item_code), None)
            if not existing:
                comparison["items"].append({
                    "item_code": item.item_code,
                    "item_name": item.item_name,
                    "qty": item.qty,
                    "uom": item.uom,
                    "rate_quotation1": item.rate if idx == 0 else None,
                    "rate_quotation2": item.rate if idx == 1 else None,
                    "rate_quotation3": item.rate if idx == 2 else None
                })
            else:
                if idx == 0:
                    existing["rate_quotation1"] = item.rate
                elif idx == 1:
                    existing["rate_quotation2"] = item.rate
                elif idx == 2:
                    existing["rate_quotation3"] = item.rate

    return comparison
