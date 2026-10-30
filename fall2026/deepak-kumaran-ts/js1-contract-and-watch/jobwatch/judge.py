"""The Claude judge: CONTRACT.md In (Judge), Out › judgment, Interfaces › Judge defaults.

Its verdict is a judgment, labelled as one, and never merged into the rule's record.
"""
from jobwatch.evidence import utc_iso
from jobwatch.prompt import fill_user
from jobwatch.validator import Invalid, parse_output

DEFAULT_MODEL = "claude-sonnet-5-5"
TEMPERATURE = 1.0
MAX_TOKENS = 600
CLIENT_TIMEOUT_S = 60.0


def make_client():
    import anthropic

    return anthropic.Anthropic(max_retries=0, timeout=CLIENT_TIMEOUT_S)


def build_request(prompt, model, resume, posting_id, posting_doc):
    return {
        "model": model,
        "system": prompt.system,
        "messages": [{"role": "user", "content": fill_user(prompt, resume, posting_id, posting_doc)}],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS,
    }


def api_error_type(exc):
    try:
        import anthropic
    except ImportError:
        return "other"
    if isinstance(exc, anthropic.APITimeoutError):
        return "timeout"
    if isinstance(exc, anthropic.RateLimitError):
        return "rate_limit"
    if isinstance(exc, (anthropic.AuthenticationError, anthropic.PermissionDeniedError)):
        return "auth"
    if isinstance(exc, anthropic.InternalServerError) or (
        isinstance(exc, anthropic.APIStatusError) and getattr(exc, "status_code", 0) >= 500
    ):
        return "5xx"
    if isinstance(exc, anthropic.APIConnectionError):
        return "connection"
    if isinstance(exc, anthropic.APIStatusError):
        return f"http_{exc.status_code}"
    return "other"


def _judgment(status, reason, model=None, called_at=None, raw_path=None, verdict=None, citations=None):
    return {"status": status, "reason": reason, "verdict": verdict, "citations": citations,
            "model": model, "called_at": called_at, "raw_path": raw_path}


def not_run():
    return _judgment("not_run", "no_api_key")


def judge_posting(client, prompt, model, resume, posting_id, posting_doc, run_dir, clock):
    """One request, no retries. Every call leaves its request and exact response text on disk."""
    request = build_request(prompt, model, resume, posting_id, posting_doc)
    run_dir.write_json(f"claude/{posting_id}.request.json", request)
    called_at = utc_iso(clock())
    try:
        response = client.messages.create(**request)
    except Exception as exc:
        return _judgment("error", f"api_error:{api_error_type(exc)}", model, called_at)

    text = "".join(b.text for b in response.content if getattr(b, "type", None) == "text")
    raw_path = run_dir.write(f"claude/{posting_id}.response.txt", text)
    used_model = getattr(response, "model", None) or model
    run_dir.write_json(f"claude/{posting_id}.response.meta.json", {
        "id": getattr(response, "id", None),
        "model": used_model,
        "stop_reason": getattr(response, "stop_reason", None),
        "called_at": called_at,
    })
    if response.stop_reason == "max_tokens":
        return _judgment("rejected", "truncated", used_model, called_at, raw_path)
    try:
        out = parse_output(text, posting_id, resume, posting_doc)
    except Invalid as e:
        return _judgment("rejected", e.reason, used_model, called_at, raw_path)
    return _judgment("accepted", out["reason"], used_model, called_at, raw_path,
                     verdict=out["verdict"], citations=out["citations"])
