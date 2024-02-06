from dataclasses import dataclass


@dataclass(frozen=True)
class HistoryType:
    CREATE = "+"
    EDIT = "~"
    DELETE = "-"
