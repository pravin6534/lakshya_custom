import frappe
import requests


@frappe.whitelist(allow_guest=True)
def send_birthday_wishes():
    try:
        # Get today's date
        current_date = frappe.utils.today()
        
        # Use SQL query for more reliable birthday matching
        employees = frappe.db.sql("""
            SELECT name, employee_name, cell_number, date_of_birth 
            FROM tabEmployee 
            WHERE MONTH(date_of_birth) = MONTH(%(date)s) 
            AND DAY(date_of_birth) = DAY(%(date)s)
        """, {'date': current_date}, as_dict=1)
        
        if not employees:
            frappe.log_error("No employees with birthdays today.", "Birthday Wishes")
           

        for employee in employees:
            if not employee.get("cell_number"):
                frappe.log_error(
                    f"Employee {employee.get('employee_name')} does not have a phone number.", 
                    "Birthday Wishes"
                )
                
                continue

            # Single string message instead of concatenation
            message = f"Happy Birthday, {employee['employee_name']}! 🎉🎂 Wishing you a fantastic day filled with happiness and laughter. May this year bring you success, good health, and new opportunities. Best wishes for a bright and prosperous future from all of us at Lakshya Group. Enjoy your special day!"
            
            try:
                response = send_post_request(employee["cell_number"], message)
                
                if response.status_code == 201:
                    frappe.logger().info(f"Birthday message sent to {employee['employee_name']} ({employee['cell_number']}).")
                    return response
                else:
                    frappe.log_error(f"Failed to send message to {employee['employee_name']}: {response.text}", "Birthday Wishes")
                    failed_count += 1
            except Exception as e:
                frappe.log_error(f"Failed to send message to {employee['employee_name']}: {str(e)}", "Birthday Wishes")
                

        return response

    except Exception as e:
        error_msg = f"Unexpected error in birthday wishes: {str(e)}"
        frappe.log_error(error_msg, "Birthday Wishes Error")
        return error_msg
    
@frappe.whitelist(allow_guest=True)
def send_post_request(mobile_number, message_text):
   
    session_id="pravin"
   
    base_url = 'https://whatsapp.vidhie.com/api/'
    headers = {
        'accept': 'application/json',
        'X-Api-Key': '20dbd3381173d53fab7bc10c38c2157de849feba',
        'Content-Type': 'application/json'
    }

    url = f"{base_url}sendText"
    data = {
        "chatId": f"{mobile_number}@c.us",
        "text": message_text,
        "session": session_id
    }
    response = requests.post(url, headers=headers, json=data)
    return response
