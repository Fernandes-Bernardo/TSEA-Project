import io
import os
import time
import requests
import urllib3
import psycopg2
from PIL import Image

urllib3.disable_warnings()

UPLOAD_DIR = r"C:\Users\Bernardo\Documents\code\ws-vscode\tsea\TSEA-Project\api\uploads\tools"
UA = {"User-Agent": "ZaikoInventoryDemo/1.0 (https://github.com/Fernandes-Bernardo/TSEA-Project; academic project) requests/2.32"}

DB = dict(host="localhost", port=5432, dbname="apiTsea", user="postgres", password="0108")

ITEMS = {
    "5a2313d4-9361-4916-8328-b68359a0a0e4": "Pliers",
    "139f05c6-0f2a-4103-8045-f34081289bf9": "Power cord",
    "0cd773eb-4780-4437-b87a-91b0ac12c4bb": "Hex key",
    "0d12f814-b614-453b-8f74-1d8fb7b4503c": "Impact wrench",
    "a0518747-74aa-45b1-9d8c-c014c0d0b544": "Adjustable spanner",
    "42757a89-6203-41e1-abdf-624a224a43a1": "Angle grinder",
    "3517422e-4d7a-4e17-8c2d-7eeda1f1da48": "Utility knife",
    "39176972-f40f-4eba-94f1-7abf8880b50a": "Electrical tape",
    "fccd2460-3ce4-4a9c-aa20-bbf6b428b6fb": "Drill",
    "4703a0e1-53ba-4677-9888-a0c3a7758aa0": "Hammer drill",
    "e8b2b510-cde8-45de-960d-240a411a81b4": "Random orbital sander",
    "390fbcf1-6b5f-4494-abc7-d404f446e44c": "Glove",
    "838e8481-a904-4784-b3a3-0bb92821e446": "Medical glove",
    "1dec62c6-50d0-456a-9f0e-5ed28864d531": "Gas metal arc welding",
    "a9a5ee02-e7ed-439a-bac0-c0c5d7273ea9": "Hammer",
    "86ee33b5-fe9f-4c7e-931a-bbfbff2fc800": "Surgical mask",
    "b76921b7-7683-4d17-8044-539d61cc6960": "Multimeter",
    "4ac3e94b-5dce-471b-9dc0-bd0aba1b012f": "Multimeter",
    "cd814038-0442-4dd8-99dd-014cfd88061f": "Goggles",
    "c989720c-cad3-4a09-930a-690ee67c3209": "Screwdriver",
    "a3c8a521-a0f1-400a-9a21-a1ef66fe0045": "Screw",
    "03460aab-ebda-45a8-a808-7628b486b906": "Screw",
    "92312d15-0a8b-4c18-86db-5ccc23e02c3a": "Thermal grease",
    "e16ab157-77b8-43d3-9ad9-95a1b9a18103": "Circular saw",
    "93986ad3-3164-42d9-933d-ff2864751422": "WD-40",
    "973bcf37-a1e6-404f-9b3a-c0d6bc04cfe2": "Spray painting",
    "dc1b2925-ed32-4906-9029-968e500c1916": "Torque wrench",
    "72575a3c-ce1b-4c32-ae1e-ea9cf0104436": "Laser rangefinder",
}


def get_json(url, params, attempts=4):
    for i in range(attempts):
        r = requests.get(url, params=params, headers=UA, timeout=25, verify=False)
        if r.status_code == 200 and r.headers.get("content-type", "").startswith("application/json"):
            return r.json()
        time.sleep(4 * (i + 1))
    return None


def thumb_url(title):
    for lang in ("en", "pt"):
        data = get_json(
            f"https://{lang}.wikipedia.org/w/api.php",
            {
                "action": "query", "titles": title, "prop": "pageimages",
                "piprop": "thumbnail", "pithumbsize": "800",
                "redirects": "1", "format": "json",
            },
        )
        if not data:
            continue
        pages = data.get("query", {}).get("pages", {})
        for _, p in pages.items():
            src = p.get("thumbnail", {}).get("source")
            if src:
                return src
    return None


def download_jpeg(url, dest, attempts=4):
    last = None
    for i in range(attempts):
        r = requests.get(url, headers=UA, timeout=30, verify=False)
        if r.status_code == 200:
            im = Image.open(io.BytesIO(r.content)).convert("RGB")
            im.save(dest, "JPEG", quality=86)
            return im.size
        last = r.status_code
        time.sleep(5 * (i + 1))
    raise RuntimeError(f"HTTP {last}")


def main():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    conn = psycopg2.connect(**DB)
    conn.autocommit = True
    cur = conn.cursor()
    ok, fail = 0, 0
    for tool_id, title in ITEMS.items():
        cur.execute("SELECT image_path FROM tools WHERE id=%s", (tool_id,))
        row = cur.fetchone()
        if row and row[0]:
            continue
        url = thumb_url(title)
        if not url:
            print(f"FAIL  {title:24} (sem imagem)")
            fail += 1
            time.sleep(3)
            continue
        try:
            fname = f"{tool_id}.jpg"
            dest = os.path.join(UPLOAD_DIR, fname)
            size = download_jpeg(url, dest)
            cur.execute("UPDATE tools SET image_path=%s WHERE id=%s", (fname, tool_id))
            print(f"OK    {title:24} {size}")
            ok += 1
        except Exception as ex:
            print(f"FAIL  {title:24} {ex}")
            fail += 1
        time.sleep(3)
    cur.close()
    conn.close()
    print(f"\n=== {ok} OK, {fail} falhas ===")


if __name__ == "__main__":
    main()
