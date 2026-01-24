from typing import Annotated, Any
from pydantic import BeforeValidator

def convert_to_string(v: Any) -> str | None:
    if v is None:
        return None
    return str(v)

PyObjectId = Annotated[str, BeforeValidator(convert_to_string)]