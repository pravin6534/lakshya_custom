import frappe
import requests
import base64
import io
from frappe.utils.print_format import download_pdf


# this is for getting supplier based on items


@frappe.whitelist()
def get_child_table_data(parent_doctype, parent_name, child_table_fieldname):
    try:
        # Load the parent document
        doc = frappe.get_doc(parent_doctype, parent_name)
    except frappe.DoesNotExistError:
        frappe.throw(f"Document {parent_doctype} with name {parent_name} does not exist.")
    except Exception as e:
        frappe.throw(f"Error loading document: {e}")

    # Check if the child table exists in the parent document
    if doc.get(child_table_fieldname):
        # Retrieve and return the child table data
        child_table_data = doc.get(child_table_fieldname)
        return [row.supplier for row in child_table_data]
    else:
        frappe.throw(f"{child_table_fieldname} not added for {parent_doctype} {parent_name}.")

# this is for getting supplier based on items




#this for sending whatsapp to supplier

@frappe.whitelist()
def fetch_supplier_data(docname):
    # Fetch the document
    doc = frappe.get_doc('Request for Quotation', docname)
    
    # Get suppliers list from the document
    suppliers = doc.get('suppliers')

    if suppliers:
        for supplier in suppliers:
            supplier_name = supplier.get('supplier')
            email = supplier.get('email_id')
            mobile = supplier.get('custom_mobile')
            # Send WhatsApp message
            print(supplier_name, mobile)
            send_whatsapp_to_supplier(doc, mobile, supplier_name, email)
    else:
        frappe.msgprint('No suppliers found in the child table.')


def send_whatsapp_to_supplier(doc, mobile, supplier_name, email):
    settings = frappe.get_doc("Four Whats Net Configuration")
    rfq_link = get_link(doc)
    
    # Constructing the message with placeholders
    message_template = """
Dear Sir/Madam,

{supplier_name},

Please submit your best possible rates for the items.
The request for the quotation can be accessed by clicking on the following link and the attachment is also sent to your email.
You can login with your registered email: {email}

{rfq_link}

Thanks and Regards,
Lakshya Group of Companies
"""
    
    # Replace placeholders with actual values
    message = message_template.format(supplier_name=supplier_name, rfq_link=rfq_link, email=email)
    
    phone_number = get_receiver_phone_number(mobile)
    try:
        memory_url = get_pdf_for_supplier(doc, supplier_name)
    except Exception as e:
        print(e)    
    # Send the WhatsApp message directly
    response = send_post_request(settings.api_url, phone_number, message, settings.instance_id, doc, memory_url, settings.token)
    
    # Check response status and print appropriate message
    if response.status_code == 201:
        frappe.msgprint(f"WhatsApp message sent to {phone_number}")
    else:
        frappe.msgprint("Failed to send WhatsApp message")


def send_post_request(url, mobile_number, message_text, session, doc, memory_url, api):
    print(mobile_number)
    headers = {
        'accept': 'application/json',
        'X-Api-Key': api,
        'Content-Type': 'application/json'
    }
    data = {
        "chatId": f"{mobile_number}@c.us",
        "file": {
            "mimetype": "application/pdf",
            "filename": doc.name,
            "data": memory_url
        },
        "caption": message_text,
        "session": session
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(response)
    return response


def get_receiver_phone_number(number):
    phone_number = number.replace("+", "").replace("-", "")
    if phone_number.startswith("+"):
        phone_number = phone_number[1:]
    elif phone_number.startswith("00"):
        phone_number = phone_number[2:]
    elif phone_number.startswith("0"):
        if len(phone_number) == 10:
            phone_number = "966" + phone_number[1:]
    else:
        if len(phone_number) < 10:
            phone_number = "966" + phone_number
    if phone_number.startswith("0"):
        phone_number = phone_number[1:]
    
    return phone_number


def get_pdf_for_supplier(doc, supplier_name):
    supplier_name=supplier_name
    try:
        pdf_base64 = get_print_as_base64(doc.doctype, doc.name,supplier_name, print_format="Standard")
        return pdf_base64
    except Exception as e:
        frappe.log_error(message=str(e), title="Error in get_pdf_for_supplier")
        return None

def get_print_as_base64(doctype, name,supplier_name, print_format=None):
    # Validate inputs
    if not (doctype and name):
        frappe.throw("Document type and name must be provided.")

    # Fetch document
    doc = frappe.get_doc(doctype, name)
    doc.vendor = supplier_name
    
    # Determine print format
    print_format = print_format or "Standard"

    # Get print content as HTML string
    print_content = frappe.get_print(doctype, name, print_format=print_format, doc=doc,as_pdf=True)

    # Convert HTML content to Base64 string
    # encoded_output = base64.b64encode(print_content.encode('utf-8')).decode('utf-8')
    encoded_output = base64.b64encode(print_content).decode('utf-8')

    return encoded_output




def get_link(doc):
    # RFQ link for supplier portal
    route = frappe.db.get_value(
        "Portal Menu Item", {"reference_doctype": "Request for Quotation"}, ["route"]
    )
    if not route:
        frappe.throw(_("Please add Request for Quotation to the sidebar in Portal Settings."))

    return frappe.utils.get_url(f"{route}/{doc.name}")


#this for sending whatsapp to supplier