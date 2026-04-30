from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttendanceCreate(BaseModel):
    member_id: str
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    date: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: str
    member_id: str
    member_name: str
    check_in_time: datetime
    check_out_time: Optional[datetime]
    date: str