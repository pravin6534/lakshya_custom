import frappe
from frappe.utils import nowdate, add_days, add_months

def execute(filters=None):
    filters = filters or {}
    # Get the selected year or default to the current year.
    year = filters.get("year") if filters.get("year") else nowdate()[:4]

    # Define core columns for employee details.
    columns = [
        {"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data", "width": 150},
        {"label": "Employee ID", "fieldname": "employee", "fieldtype": "Link", "options": "Employee", "width": 150},
    ]

    # List of months.
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    # For each month add two columns: one for Earned Leave (EL) and one for Casual Leave (CL).
    for month in months:
        columns.append({
            "label": "{} (EL)".format(month),
            "fieldname": "{}_el".format(month.lower()),
            "fieldtype": "Float",
            "width": 80
        })
        columns.append({
            "label": "{} (CL)".format(month),
            "fieldname": "{}_cl".format(month.lower()),
            "fieldtype": "Float",
            "width": 80
        })

    # Append total columns.
    columns += [
        {"label": "Total EL Taken", "fieldname": "total_el_taken", "fieldtype": "Float", "width": 100},
        {"label": "Total EL Balance", "fieldname": "total_el_balance", "fieldtype": "Float", "width": 100},
        {"label": "Total CL Taken", "fieldname": "total_cl_taken", "fieldtype": "Float", "width": 100},
        {"label": "Total CL Balance", "fieldname": "total_cl_balance", "fieldtype": "Float", "width": 100},
    ]

    data = []

    # Build conditions based on filters.
    conditions = ""
    values = []

    # Employee filter: if selected, fetch only that employee.
    if filters.get("employee"):
        conditions += " AND name = %s"
        values.append(filters.get("employee"))

    # Branch filter: works independently of the employee filter.
    if filters.get("branch"):
        conditions += " AND branch = %s"
        values.append(filters.get("branch"))

    # When no employee filter is provided, add additional filters.
    if not filters.get("employee"):
        if filters.get("department"):
            conditions += " AND department = %s"
            values.append(filters.get("department"))
        if filters.get("company"):
            conditions += " AND company = %s"
            values.append(filters.get("company"))

    # Fetch employees from the Employee doctype.
    employees = frappe.db.sql(f"""
        SELECT name, employee_name
        FROM `tabEmployee`
        WHERE 1=1 {conditions}
    """, tuple(values), as_dict=True)

    for emp in employees:
        row = {
            "employee": emp.name,
            "employee_name": emp.employee_name
        }
        total_el_taken = 0
        total_cl_taken = 0

        # For each month, calculate leave days taken for EL and CL.
        for i, month in enumerate(months, start=1):
            # Note that we now use 'from_date' instead of posting_date.
            el = get_leave_taken(emp.name, i, "Earned Leave", year)
            cl = get_leave_taken(emp.name, i, "Casual Leave", year)

            row["{}_el".format(month.lower())] = el
            row["{}_cl".format(month.lower())] = cl

            total_el_taken += el
            total_cl_taken += cl

        row["total_el_taken"] = total_el_taken
        row["total_el_balance"] = get_leave_balance(emp.name, "Earned Leave")
        row["total_cl_taken"] = total_cl_taken
        row["total_cl_balance"] = get_leave_balance(emp.name, "Casual Leave")

        data.append(row)

    return columns, data

def get_leave_taken(employee, month, leave_type, year):
    """
    Returns the total leave days taken by the employee in the specified month
    for the given leave type (Earned Leave or Casual Leave) based on the 'from_date'.
    For example, if an employee takes leave on 1st January, that leave is counted in January.
    """
    # Construct start and end dates for the month.
    start_date = "{}-{:02d}-01".format(year, month)
    end_date = add_days(add_months(start_date, 1), -1)

    result = frappe.db.sql("""
        SELECT SUM(total_leave_days) AS leave_taken
        FROM `tabLeave Application`
        WHERE employee = %s
          AND leave_type = %s
          AND from_date BETWEEN %s AND %s
          AND docstatus = 1
    """, (employee, leave_type, start_date, end_date), as_dict=True)

    return result[0]["leave_taken"] if result and result[0]["leave_taken"] else 0

def get_leave_balance(employee, leave_type):
    """
    Returns the leave balance for the given employee and leave type.
    The balance is computed by subtracting total leave taken from the allocated leave.
    """
    allocation_result = frappe.db.sql("""
        SELECT SUM(total_leaves_allocated) AS allocated
        FROM `tabLeave Allocation`
        WHERE employee = %s
          AND leave_type = %s
          AND docstatus = 1
    """, (employee, leave_type), as_dict=True)
    allocated = allocation_result[0]["allocated"] if allocation_result and allocation_result[0]["allocated"] else 0

    taken_result = frappe.db.sql("""
        SELECT SUM(total_leave_days) AS taken
        FROM `tabLeave Application`
        WHERE employee = %s
          AND leave_type = %s
          AND docstatus = 1
    """, (employee, leave_type), as_dict=True)
    taken = taken_result[0]["taken"] if taken_result and taken_result[0]["taken"] else 0

    return allocated - taken