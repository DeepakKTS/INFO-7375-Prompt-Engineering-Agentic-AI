# SEEDED fault injection. GATE.md section 1: an ERROR exit means state was not updated.
# Candidate 1. Written by Deepak before the patch.

# imports: jobwatch.tools; from js2kit: NOW, SeededTransport, run_loop, three_ok_routes, wd

# def test_error_exit_does_not_create_state(wd, monkeypatch, capsys):
#   keep the original jobwatch.tools.Tools.write_file
#   define wrapper(self, path, *args, **kwargs):
#       if str(path) ends with "summary.json": raise OSError("SEEDED: disk full")
#       otherwise return the original(self, path, *args, **kwargs)
#   monkeypatch.setattr the wrapper onto jobwatch.tools.Tools, "write_file"
#   run run_loop(SeededTransport(three_ok_routes())) and keep the exit code
#   assert the exit code == 1
#   assert (wd / "state" / "seen.json").exists() is False
#   assert "jobwatch: ERROR:" in capsys.readouterr().err
