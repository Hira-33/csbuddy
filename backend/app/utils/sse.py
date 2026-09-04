import json


def sse_event(event: str, data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False)
    lines = "".join(f"data: {line}\n" for line in payload.split("\n"))
    return f"event: {event}\n{lines}\n"
