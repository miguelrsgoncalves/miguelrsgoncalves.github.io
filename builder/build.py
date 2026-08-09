import os
import sys
import json
import re
import shutil
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring

ROOT = Path(__file__).parent.parent.resolve()
SHELL = ROOT / "index.html"

CNAME_PATH = ROOT / "CNAME"

BUILDER_DIR = Path(__file__).parent.resolve()
MANIFEST_FILE = BUILDER_DIR / ".build-manifest.json"


def get_domain() -> str:
    if CNAME_PATH.exists():
        return f"https://{CNAME_PATH.read_text().strip()}"
    return "http://localhost:5500"


def get_default_route() -> str:
    router = ROOT / "scripts" / "router.js"
    if router.exists():
        match = re.search(r"DEFAULT_ROUTE\s*=\s*'([^']+)'", router.read_text(encoding="utf-8"))
        if match:
            return match.group(1)
    return "home"


def discover_tab_routes() -> dict[str, str]:
    routes: dict[str, str] = {}
    tabs_dir = ROOT / "pages" / "tabs"
    if not tabs_dir.exists():
        return routes
    root_tab = get_default_route()
    for f in sorted(tabs_dir.glob("*.html")):
        name = f.stem
        if name == root_tab:
            routes[""] = str(f.relative_to(ROOT))
        routes[name] = str(f.relative_to(ROOT))
    return routes


class RouteDataParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title: str | None = None
        self.description: str = ""
        self.hide_route_title: bool = False

    def handle_starttag(self, tag, attrs):
        if tag == "route-data":
            d = dict(attrs)
            self.title = d.get("data-title")
            self.description = d.get("data-description", "")
            self.hide_route_title = "data-hide-route-title" in d


def extract_metadata(html_text: str) -> tuple[str | None, str, bool]:
    parser = RouteDataParser()
    parser.feed(html_text)
    return parser.title, parser.description, parser.hide_route_title


def extract_data_attr(html_text: str, attr: str) -> list[str]:
    rd_match = re.search(rf"<route-data[^>]*{attr}='([^']*)'", html_text)
    if rd_match:
        try:
            return json.loads(rd_match.group(1))
        except json.JSONDecodeError:
            pass
    return []


def extract_data_js(html_text: str) -> list[str]:
    return extract_data_attr(html_text, "data-js")


def extract_data_css(html_text: str) -> list[str]:
    return extract_data_attr(html_text, "data-css")


def process_fragment(html_text: str) -> tuple[str, list[str]]:
    scripts: list[str] = []

    def extract_script(m: re.Match) -> str:
        inner = m.group(1).strip()
        if inner:
            scripts.append(inner)
        return ""

    clean = re.sub(
        r"<script\s*(?:defer\s*)?>(.*?)</script>",
        extract_script,
        html_text,
        flags=re.DOTALL,
    )

    clean = re.sub(r"<route-data[\s\S]*?</route-data>\s*", "", clean)

    return clean.strip(), scripts


def escape_attr(s: str) -> str:
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def build_page(
    shell_html: str,
    content_html: str,
    inline_scripts: list[str],
    title: str | None,
    description: str,
    route: str,
    domain: str,
    og_image_path: str | None = None,
    data_js: list[str] | None = None,
    data_css: list[str] | None = None,
) -> str:
    page = shell_html
    full_title = f"MRSG | {title}" if title else "MRSG"
    desc = description or "All there is about MRSG"

    # Strip old OG / Twitter / canonical block from shell
    page = re.sub(r'\n\t\t<meta property="og:[^>]*>', '', page)
    page = re.sub(r'\n\t\t<meta name="twitter:[^>]*>', '', page)
    page = re.sub(r'\n\t\t<link rel="canonical"[^>]*>', '', page)
    page = re.sub(r'\n\n\n+', '\n\n', page)

    # Title
    page = re.sub(
        r"<title>.*?</title>",
        f"<title>{escape_attr(full_title)}</title>",
        page,
    )

    # Meta description
    page = re.sub(
        r'<meta name="description" content=".*?">',
        f'<meta name="description" content="{escape_attr(desc)}">',
        page,
    )

    # OG / Twitter / canonical
    route_url = f"{domain}/{route}/" if route else f"{domain}/"
    og_image_url = (
        f"{domain}{og_image_path}"
        if og_image_path
        else f"{domain}/assets/logo/mrsg_logo.png"
    )

    og_block = f"""\t\t<meta property="og:title" content="{escape_attr(full_title)}">
\t\t<meta property="og:description" content="{escape_attr(desc)}">
\t\t<meta property="og:url" content="{route_url}">
\t\t<meta property="og:type" content="website">
\t\t<meta property="og:image" content="{og_image_url}">
\t\t<meta name="twitter:card" content="summary_large_image">
\t\t<meta name="twitter:title" content="{escape_attr(full_title)}">
\t\t<meta name="twitter:description" content="{escape_attr(desc)}">
\t\t<meta name="twitter:image" content="{og_image_url}">
\t\t<link rel="canonical" href="{route_url}">"""

    page_head_parts = []
    if data_css:
        page_head_parts.extend(f'\t\t<link rel="stylesheet" href="{p}">' for p in data_css)
    if data_js:
        page_head_parts.extend(f'\t\t<script src="{p}" defer></script>' for p in data_js)

    if page_head_parts:
        tags = "\n".join(page_head_parts)
        head_block = f"""\n\t\t<!--- Page Head -->
{tags}
\t\t<!--- End Page Head -->

{og_block}
\t</head>"""
    else:
        head_block = f"{og_block}\n\t</head>"

    head_block = re.sub(r'\n\n\n+', '\n\n', head_block)
    page = page.replace("\n\t</head>", "\n" + head_block)

    page = page.replace(
        '<main></main>',
        f'<main>\n{content_html}\n\t\t</main>',
    )

    if inline_scripts:
        safe_scripts = []
        for s in inline_scripts:
            lines = []
            for ln in s.strip().split("\n"):
                stripped = ln.strip()
                if stripped:
                    lines.append(f"\t\t\t\t{stripped}")
            safe_scripts.append("\n".join(lines))
        combined = "\n\n".join(safe_scripts)
        script_block = (
            f'\n\t\t<!-- Page Scripts -->\n'
            f'\t\t<script>\n'
            f'\t\t\tdocument.addEventListener("DOMContentLoaded", function() {{\n'
            f'{combined}\n'
            f'\t\t\t}});\n'
            f'\t\t</script>\n'
            f'\t\t<!-- End Page Scripts -->\n'
        )
        page = page.replace("\t</body>", f"{script_block}\n\t</body>")

    return page


def generate_sitemap(tab_routes: list[str], sub_routes: list[str], domain: str) -> str:
    urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    def add_url(path: str):
        url_el = SubElement(urlset, "url")
        SubElement(url_el, "loc").text = f"{domain}{path}"

    add_url("/")
    for route in tab_routes:
        if route:
            add_url(f"/{route}/")
    for route in sub_routes:
        add_url(f"/{route}/")

    import xml.dom.minidom

    raw = tostring(urlset, encoding="unicode")
    dom = xml.dom.minidom.parseString(raw)
    return dom.toprettyxml(indent="  ")

#region .gitignore

GITIGNORE_START = "# === Generated by builder ==="
GITIGNORE_END = "# === End generated ==="


def update_gitignore(manifest: dict):
    gi_path = ROOT / ".gitignore"

    if not gi_path.exists():
        return

    content = gi_path.read_text(encoding="utf-8")

    entries: set[str] = set()
    for d in manifest.get("directories", []):
        top = d.split("/")[0]
        entries.add(f"/{top}/")

    entries.add("/robots.txt")
    entries.add("/sitemap.xml")

    generated_block = "\n".join(sorted(entries))

    pattern = re.compile(
        re.escape(GITIGNORE_START) + r".*?" + re.escape(GITIGNORE_END),
        re.DOTALL,
    )
    new_section = f"{GITIGNORE_START}\n{generated_block}\n{GITIGNORE_END}"

    if pattern.search(content):
        new_content = pattern.sub(new_section, content)
    else:
        new_content = content.rstrip() + f"\n\n{new_section}\n"

    if new_content != content:
        gi_path.write_text(new_content, encoding="utf-8")
        print("  Updated: .gitignore")

#endregion

#region Main build

def build(local_port: int = 0):
    if not SHELL.exists():
        print(f"ERROR: Shell template not found at {SHELL}")
        return

    domain = f"http://localhost:{local_port}" if local_port else get_domain()
    shell_html = SHELL.read_text(encoding="utf-8")

    manifest: dict[str, list[str]] = {"files": [], "directories": []}
    all_project_ids: list[str] = []

    tab_routes = discover_tab_routes()

    # Tab routes
    for route, fragment_rel in tab_routes.items():
        if route == "":
            continue

        fragment_path = ROOT / fragment_rel
        if not fragment_path.exists():
            print(f"  WARNING: Fragment not found: {fragment_path}")
            continue

        fragment_html = fragment_path.read_text(encoding="utf-8")
        title, description, _hide_route_title = extract_metadata(fragment_html)
        data_js = extract_data_js(fragment_html)
        data_css = extract_data_css(fragment_html)
        clean_html, scripts = process_fragment(fragment_html)

        page = build_page(
            shell_html, clean_html, scripts,
            title=title, description=description,
            route=route, domain=domain,
            data_js=data_js,
            data_css=data_css,
        )

        out_dir = ROOT / route
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "index.html"
        manifest["directories"].append(str(out_dir.relative_to(ROOT)))
        out_path.write_text(page, encoding="utf-8")
        manifest["files"].append(str(out_path.relative_to(ROOT)))
        print(f"  Built: {out_path.relative_to(ROOT)}")

    # Non-tab subdirectory routes
    pages_dir = ROOT / "pages"
    if pages_dir.exists():
        for subdir in sorted(pages_dir.iterdir()):
            if not subdir.is_dir() or subdir.name == "tabs":
                continue

            for fragment_path in sorted(subdir.glob("*.html")):
                pid = fragment_path.stem
                route = f"{subdir.name}/{pid}"

                fragment_html = fragment_path.read_text(encoding="utf-8")
                title, description, _hide_route_title = extract_metadata(fragment_html)
                data_js = extract_data_js(fragment_html)
                data_css = extract_data_css(fragment_html)
                clean_html, scripts = process_fragment(fragment_html)

                og_image = f"/assets/{subdir.name}/{pid}/images/thumbnail.png"

                page = build_page(
                    shell_html, clean_html, scripts,
                    title=title, description=description,
                    route=route, domain=domain,
                    og_image_path=og_image,
                    data_js=data_js,
                    data_css=data_css,
                )

                out_dir = ROOT / subdir.name / pid
                out_dir.mkdir(parents=True, exist_ok=True)
                out_path = out_dir / "index.html"
                out_path.write_text(page, encoding="utf-8")
                manifest["files"].append(str(out_path.relative_to(ROOT)))
                manifest["directories"].append(str(out_dir.relative_to(ROOT)))
                all_project_ids.append(route)
                print(f"  Built: {out_path.relative_to(ROOT)}")

    # Sitemap
    sitemap = generate_sitemap(list(tab_routes.keys()), all_project_ids, domain)
    (ROOT / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    manifest["files"].append("sitemap.xml")
    print("  Built: sitemap.xml")

    # robots.txt
    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {domain}/sitemap.xml\n",
        encoding="utf-8",
    )
    manifest["files"].append("robots.txt")
    print("  Built: robots.txt")

    # .gitignore
    update_gitignore(manifest)

    # Manifest
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nBuild complete! {len(manifest['files'])} generated files in {ROOT}")


def clean():
    if not MANIFEST_FILE.exists():
        print("No build manifest found. Nothing else to clean.")
        return

    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))

    for f in manifest.get("files", []):
        p = ROOT / f
        if p.exists():
            p.unlink()
            print(f"  Deleted: {f}")

    for d in sorted(manifest.get("directories", []), key=len, reverse=True):
        p = ROOT / d
        if p.exists() and not any(p.iterdir()):
            p.rmdir()
            print(f"  Deleted dir: {d}")

    MANIFEST_FILE.unlink()
    print("Clean complete.")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "clean":
        clean()
    else:
        local_port = 0
        if "--local" in sys.argv:
            idx = sys.argv.index("--local")
            local_port = int(sys.argv[idx + 1]) if idx + 1 < len(sys.argv) and sys.argv[idx + 1].isdigit() else 5500
        build(local_port=local_port)

#endregion