# KEYORA · Off-plan Calculator · (c) 2026 Hassan Abu El-Leil. See LICENSE.
"""Build one report:  python3 build.py data/<name>.json  ->  out/<name>.html

config/agent.json      the broker's own details for the footer (filled once)
config/premiums.json   the premium table, caps, target yield and holding period
brand/                 optional logo.png and agent.jpg|png|webp (embedded into the page)
data/<name>.json       one unit's data (start from data/example-binghatti-hillviews-studio.json)
data/<name>-photos/    optional photos named in the data file; copied next to the page
Add --fragment to write the page without the outer <html> wrapper and without the print button
(for hosts that add their own wrapper and block printing).
"""
import sys, json, base64, pathlib, shutil

here = pathlib.Path(__file__).parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
fragment = "--fragment" in sys.argv
data_path = pathlib.Path(args[0])
load = lambda p: json.loads(p.read_text(encoding="utf-8"))
data = load(data_path)
agent = load(here / "config" / "agent.json") if (here / "config" / "agent.json").exists() else {}
prem = load(here / "config" / "premiums.json")

MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
def embed(*names):
    for n in names:
        p = here / "brand" / n
        if p.exists():
            return "data:%s;base64,%s" % (MIME[p.suffix.lower()], base64.b64encode(p.read_bytes()).decode())
    return ""
agent["_logo"] = embed("logo.png", "logo.webp", "logo.jpg")
agent["_photo"] = embed("agent.jpg", "agent.jpeg", "agent.png", "agent.webp")
data["_photoDir"] = data_path.stem + "-photos"
data["_print"] = not fragment

def js(obj):  # safe to place inside a <script> block
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")

body = (here / "template.html").read_text(encoding="utf-8")
for mark in ("/*@CALC@*/", "/*@DATA@*/", "/*@AGENT@*/", "/*@PREMIUMS@*/", "@TITLE@"):
    assert body.count(mark) == 1, "template marker missing: " + mark
title = "%s · %s" % (data["project"]["name"], data["unit"]["type"]["en"])
body = (body.replace("/*@CALC@*/", (here / "calc.js").read_text(encoding="utf-8"))
            .replace("/*@DATA@*/", js(data)).replace("/*@AGENT@*/", js(agent)).replace("/*@PREMIUMS@*/", js(prem))
            .replace("@TITLE@", title.replace("<", "")))
if not fragment:
    body = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n'
            + body + "\n</body>\n</html>\n")
out = here / "out"; out.mkdir(exist_ok=True)
target = out / (data_path.stem + (".fragment" if fragment else "") + ".html")
target.write_text(body, encoding="utf-8")
photos = data_path.parent / data["_photoDir"]
if photos.is_dir():
    shutil.copytree(photos, out / data["_photoDir"], dirs_exist_ok=True)
print("built", target.relative_to(here))
