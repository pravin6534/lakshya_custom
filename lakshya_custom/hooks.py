app_name = "lakshya_custom"
app_title = "Lakshya_custom"
app_publisher = "Pravin Dewangan"
app_description = "this app is build for customisation of lakshya group erp"
app_email = "infopravin2@gmail.com"
app_license = "mit"
# required_apps = []

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/lakshya_custom/css/lakshya_custom.css"
# app_include_js = "/assets/lakshya_custom/js/lakshya_custom.js"

# include js, css files in header of web template
# web_include_css = "/assets/lakshya_custom/css/lakshya_custom.css"
# web_include_js = "/assets/lakshya_custom/js/lakshya_custom.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "lakshya_custom/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"Request for Quotation" : "public/js/request_for_quatation.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "lakshya_custom/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "lakshya_custom.utils.jinja_methods",
# 	"filters": "lakshya_custom.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "lakshya_custom.install.before_install"
# after_install = "lakshya_custom.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "lakshya_custom.uninstall.before_uninstall"
# after_uninstall = "lakshya_custom.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "lakshya_custom.utils.before_app_install"
# after_app_install = "lakshya_custom.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "lakshya_custom.utils.before_app_uninstall"
# after_app_uninstall = "lakshya_custom.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "lakshya_custom.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"lakshya_custom.tasks.all"
# 	],
# 	"daily": [
# 		"lakshya_custom.tasks.daily"
# 	],
# 	"hourly": [
# 		"lakshya_custom.tasks.hourly"
# 	],
# 	"weekly": [
# 		"lakshya_custom.tasks.weekly"
# 	],
# 	"monthly": [
# 		"lakshya_custom.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "lakshya_custom.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "lakshya_custom.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "lakshya_custom.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["lakshya_custom.utils.before_request"]
# after_request = ["lakshya_custom.utils.after_request"]

# Job Events
# ----------
# before_job = ["lakshya_custom.utils.before_job"]
# after_job = ["lakshya_custom.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"lakshya_custom.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

