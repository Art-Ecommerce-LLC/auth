# permit_payload.py
import json
from copy import deepcopy

class EncinitasSearchPayload:
    def __init__(self):
        self.payload = {
            "Keyword": "",
            "ExactMatch": True,
            "SearchModule": 2,
            "FilterModule": 1,
            "SearchMainAddress": False,
            "PlanCriteria": {},
            "PermitCriteria": {
                "PermitNumber": None,
                "PermitTypeId": "none",
                "PermitWorkclassId": None,
                "PermitStatusId": "none",
                "ProjectName": None,
                "IssueDateFrom": None,
                "IssueDateTo": None,
                "Address": None,
                "Description": None,
                "ExpireDateFrom": None,
                "ExpireDateTo": None,
                "FinalDateFrom": None,
                "FinalDateTo": None,
                "ApplyDateFrom": None,
                "ApplyDateTo": None,
                "SearchMainAddress": False,
                "ContactId": None,
                "TypeId": None,
                "WorkClassIds": None,
                "ParcelNumber": None,
                "ExcludeCases": None,
                "EnableDescriptionSearch": False,
                "PageNumber": 1,
                "PageSize": 10,
                "SortBy": "relevance",
                "SortAscending": False
            },
            "InspectionCriteria": {},
            "CodeCaseCriteria": {},
            "RequestCriteria": {},
            "BusinessLicenseCriteria": {},
            "ProfessionalLicenseCriteria": {},
            "LicenseCriteria": {},
            "ProjectCriteria": {},
            "PlanSortList": [],
            "PermitSortList": [],
            "InspectionSortList": [],
            "CodeCaseSortList": [],
            "RequestSortList": [],
            "LicenseSortList": [],
            "ProjectSortList": [],
            "ExcludeCases": None,
            "SortOrderList": [],
            "HiddenInspectionTypeIDs": None,
            "PageNumber": 0,
            "PageSize": 0,
            "SortBy": "relevance",
            "SortAscending": True
        }

    def set_permit_field(self, key: str, value):
        if key in self.payload["PermitCriteria"]:
            self.payload["PermitCriteria"][key] = value
        else:
            raise KeyError(f"Invalid field name for PermitCriteria: {key}")

    def set_date_range(self, date_from: str, date_to: str):
        self.payload["PermitCriteria"]["IssueDateFrom"] = date_from
        self.payload["PermitCriteria"]["IssueDateTo"] = date_to

    def set_page_info(self, page_size=50, page_number=1):
        self.payload["PermitCriteria"]["PageSize"] = page_size
        self.payload["PermitCriteria"]["PageNumber"] = page_number

    def sort_by(self, field="IssueDate", ascending=False):
        self.payload["PermitCriteria"]["SortBy"] = field
        self.payload["PermitCriteria"]["SortAscending"] = ascending

    def to_dict(self):
        return deepcopy(self.payload)

    def to_json(self):
        return json.dumps(self.payload, indent=2)
