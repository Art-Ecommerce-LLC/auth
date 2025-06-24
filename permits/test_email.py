from fetch_and_save_permits import PermitNotifier  # or adjust the import to match your file structure

notifier = PermitNotifier()
notifier.send("myersben9@gmail.com", {
    "address": "123 Testing Lane",
    "description": "Test plumbing permit",
    "CaseType": "Plumbing",
    "status": "Issued",
    "issue_date": "2025-06-15",
    "guide": "Follow up with the homeowner promptly to offer your services."
})