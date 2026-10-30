"""Entry point and test seam: CONTRACT.md Interfaces.

    cli.main(argv, *, opener=None, anthropic_client=None, now=None) -> int
"""
import argparse
import sys

from jobwatch.errors import OTHER, REFUSED, Stop
from jobwatch.judge import DEFAULT_MODEL
from jobwatch.run import run


def build_parser():
    parser = argparse.ArgumentParser(
        prog="python -m jobwatch",
        description="Watch one Greenhouse board for new postings and judge them against a fictional résumé.",
    )
    sub = parser.add_subparsers(dest="command", required=True)
    r = sub.add_parser("run", help="fetch the board (or read --from-file), report new postings, update state")
    r.add_argument("--board", required=True, help="Greenhouse board token, e.g. stripe")
    r.add_argument("--resume", required=True, help="path to a fictional résumé JSON")
    r.add_argument("--from-file", dest="from_file", help="read a saved raw response instead of fetching (seeded)")
    r.add_argument("--prompt", default="prompts/v1.md", help="prompt contract, used only when ANTHROPIC_API_KEY is set")
    r.add_argument("--model", default=DEFAULT_MODEL, help=f"judge model (default {DEFAULT_MODEL})")
    return parser


def main(argv=None, *, opener=None, anthropic_client=None, now=None):
    try:
        args = build_parser().parse_args(argv)
    except SystemExit as e:
        return e.code if isinstance(e.code, int) else REFUSED
    try:
        return run(args, opener=opener, client=anthropic_client, now=now)
    except Stop as e:
        print(f"jobwatch: {e}", file=sys.stderr)
        return e.code
    except Exception as e:
        print(f"jobwatch: unexpected error: {type(e).__name__}: {e}", file=sys.stderr)
        return OTHER
