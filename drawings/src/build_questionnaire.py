"""Build a self-contained HTML questionnaire for Grahame to complete on his iPhone."""
from pathlib import Path
import base64
import json

ROOT = Path("/home/user/grahame_planning")
THUMB = ROOT / "drawings/output/thumb"
OUT = ROOT / "drawings/output/Hornton_Questions_for_Grahame.html"


def img_data_url(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode()
    return "data:image/jpeg;base64," + data


QUESTIONS = [
    ("02", "02_courtyard_plan_proposed.jpg", "Sheet 02 — Rear Courtyard Plan", [
        ("Q02-1", "Position of the EXISTING DOWNPIPE on the side (kitchen) wall — how far from the inside corner of the L (south end)? Currently estimated 1500 mm from north corner.", "tape-measure from the inside L corner along the kitchen wall", "num"),
        ("Q02-2", "Position of EACH DOWNPIPE on the rear wall — distance from the east (L-corner) end of the rear wall?", "we have estimated left 250 mm (L-corner) + right 2900 mm", "long"),
        ("Q02-3", "Is there a drainage gully/grate in the courtyard slab? If yes, roughly where? (affects spiral staircase base plate)", "any iron grate or stone-covered channel", "long"),
        ("Q02-4", "Courtyard slab — what is the surface (concrete, paving, gravel)? Any falls?", "currently noted as loose gravel/brick dust", "long"),
    ]),
    ("03", "03_side_wall_elevation_proposed.jpg", "Sheet 03 — Side (Kitchen) Wall Elevation", [
        ("Q03-1", "Position of the upper KITCHEN WINDOW (the one to become the doorway) — how far is its centre from the INSIDE L CORNER (south end of the side wall)? Currently 950 mm so it lines up with the staircase top.", "we need this to align with the spiral staircase top", "num"),
        ("Q03-2", "EXACT RECESS WIDTH of the existing kitchen window (the masonry opening — wider than the 660 mm glass). Currently estimated 900 mm.", "tape-measure the brick reveal width", "num"),
        ("Q03-3", "HEAD HEIGHT of the existing kitchen window above the kitchen floor (we have sill at 720 mm; head not given).", "from kitchen floor to top of window opening", "num"),
        ("Q03-4", "EXISTING side-wall downpipe — confirm route: comes down vertical from hopper, then turns ~40° to between the lower windows, then vertical down to slab?", "we have drawn it running straight; please confirm the swan-neck per the photo", "long"),
        ("Q03-5", "PROPOSED — happy with the downpipe being rerouted to run straight down in the L corner clear of the new doorway and staircase?", "yes/no + any preference", "long"),
        ("Q03-6", "The 400 mm window-extension vs. dropping the sill all the way to kitchen-floor level (720 mm drop) — which is intended? A real door needs sill at floor level.", "the 400 mm only would leave a 320 mm step into the kitchen — awkward", "long"),
    ]),
    ("04", "04_rear_wall_elevation_existing.jpg", "Sheet 04 — Rear Wall Elevation (Existing)", [
        ("Q04-1", "CENTRAL DOOR width on the rear-wall door bay. Currently estimated 900 mm.", "the single central timber door in the recessed bay", "num"),
        ("Q04-2", "EACH SIDE-SASH width (the two windows flanking the central door). Currently estimated 450 mm each.", "tape-measure each side window opening", "num"),
        ("Q04-3", "RAISED BRICK SILL height under each side window — from courtyard slab to the underside of the window sill. Currently estimated 600 mm.", "the bricked section below the side windows", "num"),
        ("Q04-4", "HEAD HEIGHT of the door/window assembly above courtyard slab. Currently estimated 2300 mm.", "from threshold to top of door/window — arch is above that", "num"),
        ("Q04-5", "Confirm: the LEFT downpipe sits TIGHT to the L corner. Should it be shown on the SIDE-wall elevation only?", "yes/no — we have currently removed it from the rear-wall elevation", "choice"),
        ("Q04-6", "Is the rear-wall RIGHT downpipe to be retained as-existing or rerouted as part of the works?", "currently shown as retained", "long"),
    ]),
    ("04B", "04_rear_wall_elevation_proposed.jpg", "Sheet 04 (Proposed) — Spiral Staircase Superimposed", [
        ("Q04B-1", "Is the staircase silhouette now in the right position (tight to LEFT side = inside L corner)?", "yes/no", "choice"),
        ("Q04B-2", "Should the staircase silhouette extend HIGHER on the elevation? Suggest a finished height (e.g. handrail-cap level).", "currently extends to handrail top ~3720 mm; you can ask for taller", "long"),
        ("Q04B-3", "Any further requirements on the rear-wall proposal — make-good, repointing, painting of the cheeks, etc?", "", "long"),
    ]),
    ("05", "05_courtyard_section_proposed.jpg", "Sheet 05 — Section A-A through Courtyard with Staircase", [
        ("Q05-1", "Rear boundary wall height (estimated 3500 mm from slab). Please tape-measure.", "behind the courtyard, the brick wall to neighbour beyond", "num"),
        ("Q05-2", "Threshold of the new upper doorway: OK to set at ground-floor FFL (+2820 above slab) so door is flush with kitchen floor?", "this is the cleanest detail — no step into the kitchen", "choice"),
        ("Q05-3", "Confirm 14 risers × 201 mm = 2814 mm staircase rise is acceptable (matches FFL within 6 mm — a tiny spacer at top fixes it).", "alternative is a slightly larger landing pad", "choice"),
    ]),
    ("06", "06_staircase_detail.jpg", "Sheet 06 — Spiral Staircase Detail", [
        ("Q06-1", "Is the 1750 mm envelope diameter realistic? You quoted 160 cm + tolerance.", "to confirm with installer", "choice"),
        ("Q06-2", "Black painted ironwork finish — confirmed?", "or a specific finish (galvanise-and-paint, blackened wax, etc.)", "long"),
        ("Q06-3", "Handrail height of 900 mm — does the reclaimed staircase already have a handrail, or will a new one be added?", "Victorian originals often have rails at 800-850 mm", "long"),
    ]),
    ("07", "07_internal_opening_proposed.jpg", "Sheet 07 — Internal Opening Between Reception Rooms", [
        ("Q07-1", "Tape-measure the EXISTING opening — width and height as found?", "currently estimated 1120 × 2100", "long"),
        ("Q07-2", "Proposed CLEAR opening width — we have 2400 mm based on 700 + 600 nibs. Confirm?", "nibs (700 mm one side, 600 the other) are from your earlier email", "num"),
        ("Q07-3", "Proposed head height 2950 mm — confirm? (You said 290-300 cm.)", "", "num"),
        ("Q07-4", "Has a structural engineer been instructed? (Required before signing off the beam.)", "name + contact if so", "long"),
    ]),
    ("08", "08_kitchen_bathroom_proposed.jpg", "Sheet 08 — Kitchen + Compact Shower-Room Layout", [
        ("Q08-1", "Confirm the four-zone strip (shower 1000 / WC 600 / basin 500 / laundry 600) along the south side of the kitchen?", "we can flip the order or swap any zone", "long"),
        ("Q08-2", "Pocket/sliding door — confirm preferred (we've assumed a single sliding door)?", "alternative: standard hinged door swinging into kitchen", "long"),
        ("Q08-3", "Are you planning to use the on-hand glazed doors (1245 × 2245) here? Or for a separate location?", "they don't fit cleanly into the bathroom strip widths above", "long"),
        ("Q08-4", "Do you want the kitchen hob/sink/fridge layout shown on the plan? If yes, sketch positions or describe.", "currently we show residual zone as empty", "long"),
    ]),
    ("09", "09_site_plan.jpg", "Sheet 09 — Site & Street-Context Plan", [
        ("Q09-1", "Confirm address is correctly 20 Hornton Street, London W8 4NR?", "file naming '24' was confusing", "choice"),
        ("Q09-2", "Is the property in Kensington Conservation Area?", "RBKC conservation-area schedule", "choice"),
        ("Q09-3", "Is the building Grade II listed?", "if so we need the Historic England list entry number", "long"),
        ("Q09-4", "Confirm building's REAR wall (with the door bay) faces NE? (i.e. courtyard is NE of building, kitchen is on the SE side.)", "this affects the north arrow on the plans", "choice"),
    ]),
    ("10", "10_courtyard_3d.jpg", "Sheet 10 — 3D Axonometric of Courtyard", [
        ("Q10-1", "Do you want a fuller PHOTOREALISTIC render for board use? (Slower to produce.)", "current view is functional; ChatGPT-style render would be slower iteration", "choice"),
        ("Q10-2", "Any specific view angle you want? (E.g. from courtyard floor looking up at the doorway; or from kitchen looking out and down.)", "", "long"),
    ]),
    ("11", "11_bathroom_3d.jpg", "Sheet 11 — Bathroom 3D", [
        ("Q11-1", "Any changes wanted to the shower-room fittings or arrangement before detailed design?", "", "long"),
    ]),
    ("12", "12_opening_3d.jpg", "Sheet 12 — Internal Opening 3D", [
        ("Q12-1", "Preference on the head detail — squared opening (as shown) vs. arched / segmental?", "", "long"),
    ]),
    ("REV-C", None, "Rev-C corrections — please confirm", [
        ("QC-1", "Slab-to-ground-floor FFL: I've used 3000 mm in Rev C (re-derived from your sill heights). Confirm this is correct, or what's the measured value?", "Rev A was 2820 (basement-ceiling figure — wrong). Rev C uses 3000.", "num"),
        ("QC-2", "Spiral staircase rise: 15 risers × 200 mm = 3000 mm exactly. Does the reclaimed artefact actually have 15 risers carrying the 3000 mm rise, or do we need a different combination?", "previous email suggested 15 pads with 200-210 mm rise each", "long"),
        ("QC-3", "Building orientation — back wall of house (with the door bay) faces NE. Is this still correct? (We rotate the N arrow 45° on all plans accordingly.)", "yes/no — affects N arrow rotation", "choice"),
        ("QC-4", "Right-side downpipe on rear wall — is there ACTUALLY one? In Rev A I added one but no source photo shows it. Rev B/C only show the L-corner downpipe. Confirm there's just ONE rear-wall downpipe (L-corner)?", "if there are two please confirm", "choice"),
        ("QC-5", "Central door width — Rev C uses 820 mm per your '82 cm doorway' email. Confirm? (Rev A had 900.)", "", "num"),
        ("QC-6", "Side window widths in the door bay — Rev C uses 465 mm each (so arithmetic closes: 25+465+25+820+25+465+25 = 1850 ✓). Confirm or correct.", "", "num"),
        ("QC-7", "Internal-opening clear width: Rev C uses 1350 mm (front-lounge 2650 − nibs 700+600). Confirm the proposed opening should be that narrow?", "Rev A had 2400 which was the flat envelope not the room width", "num"),
        ("QC-8", "Shower-room zones: Rev C is 900 (shower) + 500 (WC) + 400 (basin) + 400 (laundry, single front-loader, NOT stacked) + 3 × 100 partitions = 2500 mm exactly. Confirm?", "Rev A was 1000+600+500+600 which overflowed by 300 mm", "long"),
        ("QC-9", "Handrail termination at top of staircase: should the handrail connect to the wall to the LEFT or to the RIGHT of the new doorway? (Currently we show it terminating at the LEFT edge of the doorway with a newel-post stub.)", "yes/no/preference", "long"),
    ]),
    ("GEN", None, "General / cross-cutting", [
        ("QG-1", "Heritage Statement / Design & Access Statement — do you have these in draft, or shall we draft from these drawings?", "", "long"),
        ("QG-2", "Are neighbours (No. 18, No. 22) likely to object? Any prior conversations?", "", "long"),
        ("QG-3", "Target submission date to RBKC planning?", "", "short"),
        ("QG-4", "Photos requested — phone-camera shots of: (a) the LEFT-corner downpipe close-up, (b) the kitchen window from inside, (c) the courtyard slab + drainage, (d) inside corner of the L from below, (e) the central rear door and 2 flanking sashes (full elevation). Upload via WhatsApp.", "we'll re-render with corrections once received", "long"),
        ("QG-5", "For the photoreal 3D image — we've included a `Photoreal_Render_Prompt_for_ChatGPT.md` file with 5 ready-to-paste prompts. Do you want to try generating those yourself, or would you prefer we provide the prompts in a different format?", "the prompts use your exact measured dimensions", "long"),
        ("QG-6", "Anything else not covered?", "", "long"),
    ]),
]


def field_html(qid: str, ft: str) -> str:
    if ft == "short":
        return f'<input type="text" id="{qid}" name="{qid}" />'
    if ft == "num":
        return f'<input type="text" inputmode="numeric" id="{qid}" name="{qid}" placeholder="mm" />'
    if ft == "choice":
        return f'<input type="text" id="{qid}" name="{qid}" placeholder="Yes / No + any notes" />'
    return f'<textarea id="{qid}" name="{qid}" rows="3"></textarea>'


def render():
    sections_html = []
    section_titles = []
    question_manifest = []   # list of lists of qids
    question_texts = {}
    for sheet_id, img_fn, title, qs in QUESTIONS:
        section_titles.append(title)
        qids = [q[0] for q in qs]
        question_manifest.append(qids)
        for q in qs:
            question_texts[q[0]] = q[1]

        img_tag = ""
        if img_fn:
            url = img_data_url(THUMB / img_fn)
            img_tag = f'<img src="{url}" alt="{title}" />'
        items = []
        for qid, qtext, hint, ft in qs:
            hint_html = f'<div class="hint">{hint}</div>' if hint else ""
            items.append(
                f'<li class="q">'
                f'<label for="{qid}"><strong>{qid}</strong> &nbsp; {qtext}</label>'
                f'{hint_html}'
                f'{field_html(qid, ft)}'
                f'</li>'
            )
        sections_html.append(
            f'<section class="sheet" id="sheet_{sheet_id}">'
            f'<h2>{title}</h2>'
            f'{img_tag}'
            f'<ol class="qs">{"".join(items)}</ol>'
            f'</section>'
        )

    n_questions = sum(len(qs) for _, _, _, qs in QUESTIONS)

    css = """
:root { --accent:#aa3322; --bg:#faf7f0; --card:#fff; --line:#d8d2c4; --muted:#666; }
* { box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  background:var(--bg); color:#222; margin:0; padding:0 12px 90px; line-height:1.45; font-size:16px; }
header { background:var(--accent); color:#fff; padding:18px 16px; margin:0 -12px 16px;
  box-shadow:0 1px 4px rgba(0,0,0,0.1); }
header h1 { margin:0 0 4px; font-size:1.3em; }
header p { margin:4px 0; font-size:0.92em; opacity:0.92; }
.intro { background:#fff; border:1px solid var(--line); border-radius:8px; padding:14px;
  margin-bottom:16px; }
.intro h2 { margin-top:0; font-size:1.05em; }
.who { display:grid; gap:8px; margin-bottom:16px; }
.who label { font-weight:600; font-size:0.92em; }
.who input { padding:10px; font-size:16px; border:1px solid var(--line); border-radius:6px;
  width:100%; }
section.sheet { background:var(--card); border:1px solid var(--line); border-radius:8px;
  padding:12px 14px 18px; margin-bottom:18px; }
section.sheet h2 { color:var(--accent); font-size:1.05em; border-bottom:1px solid var(--line);
  padding-bottom:6px; margin-top:0; }
section.sheet img { width:100%; height:auto; border:1px solid var(--line);
  margin:8px 0 12px; border-radius:4px; }
ol.qs { padding-left:22px; margin:0; }
li.q { margin-bottom:14px; }
li.q label { display:block; margin-bottom:4px; font-size:0.95em; }
li.q .hint { font-size:0.82em; color:var(--muted); margin-bottom:6px; font-style:italic; }
li.q input[type=text], li.q textarea { width:100%; font-size:16px; padding:10px;
  border:1px solid var(--line); border-radius:6px; font-family:inherit; background:#fffdf8; }
li.q textarea { min-height:70px; resize:vertical; }
.actions { position:sticky; bottom:0; background:var(--bg); padding:12px 0; margin:0 -12px;
  border-top:2px solid var(--accent); text-align:center; z-index:10; }
.btn { background:var(--accent); color:#fff; border:none; padding:14px 22px; font-size:17px;
  font-weight:600; border-radius:10px; margin:6px; cursor:pointer;
  -webkit-tap-highlight-color:transparent; }
.btn.secondary { background:#555; }
.btn:active { transform:scale(0.97); }
.status { text-align:center; color:var(--muted); margin-top:8px; font-size:0.88em; min-height:1.5em; }
.small { font-size:0.85em; color:var(--muted); }
"""

    head = (
        '<!DOCTYPE html><html lang="en"><head>'
        '<meta charset="UTF-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<title>Hornton Street — Questions for Grahame</title>'
        f'<style>{css}</style></head><body>'
    )

    header_html = (
        f'<header><h1>Hornton Street — Questions for Grahame McGirr</h1>'
        f'<p>Flat 1, 20 Hornton Street, London W8 4NR · Drawing pack Rev. C · {n_questions} questions</p>'
        f'</header>'
    )

    intro = (
        '<div class="intro">'
        '<h2>How this works</h2>'
        '<p>Scroll through each drawing. Below each is a small set of questions — tap the field and type the answer (a number, a yes/no, or a longer note). When you\'re done, tap <strong>"Generate PDF answer sheet"</strong> at the bottom and your iPhone will offer to save the PDF (Files / WhatsApp / Email). Send the PDF back to Craig.</p>'
        '<p class="small">Answers auto-save in your browser as you type. You don\'t need to answer everything — partial answers are fine. Anything you skip will appear as "—" in the PDF.</p>'
        '</div>'
    )

    who = (
        '<div class="who">'
        '<div><label for="responder_name">Your name</label>'
        '<input type="text" id="responder_name" value="Grahame McGirr" /></div>'
        '<div><label for="responder_date">Date</label>'
        '<input type="text" id="responder_date" placeholder="e.g. 26 May 2026" /></div>'
        '</div>'
    )

    actions = (
        '<div class="actions">'
        '<button class="btn" onclick="generatePDF()">📄 Generate PDF answer sheet</button>'
        '<button class="btn secondary" onclick="clearAll()">Clear answers</button>'
        '<div class="status" id="status"></div>'
        '</div>'
    )

    # JS — use raw strings + JSON for data substitution
    js_data = (
        f'window.QUESTION_MANIFEST = {json.dumps(question_manifest)};\n'
        f'window.SECTION_TITLES = {json.dumps(section_titles)};\n'
        f'window.QUESTION_TEXTS = {json.dumps(question_texts)};\n'
    )

    js_logic = r"""
// Auto-save / restore
document.querySelectorAll('input, textarea').forEach(function(el) {
  var key = 'hornton_' + el.id;
  var saved = localStorage.getItem(key);
  if (saved !== null && el.id !== 'responder_name') el.value = saved;
  el.addEventListener('input', function() { localStorage.setItem(key, el.value); });
});

function clearAll() {
  if (!confirm('Clear all answers?')) return;
  document.querySelectorAll('input, textarea').forEach(function(el) {
    if (el.id === 'responder_name') return;
    el.value = '';
    localStorage.removeItem('hornton_' + el.id);
  });
  document.getElementById('status').textContent = 'Cleared.';
}

function generatePDF() {
  var status = document.getElementById('status');
  status.textContent = 'Building PDF…';
  if (!window.jspdf) {
    status.textContent = '⚠️ PDF library not loaded — check internet connection and try again.';
    return;
  }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ unit: 'mm', format: 'a4' });
  var margin = 14, pageW = 210, pageH = 297, lineW = pageW - 2 * margin;
  var y = margin;

  function addText(text, opts) {
    opts = opts || {};
    var size = opts.size || 10, bold = opts.bold || false;
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    var lines = doc.splitTextToSize(text, lineW);
    for (var i = 0; i < lines.length; i++) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(lines[i], margin, y);
      y += size * 0.42 + 1;
    }
  }
  function hr() {
    if (y > pageH - margin) { doc.addPage(); y = margin; }
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 3;
  }

  var name = document.getElementById('responder_name').value.trim() || '—';
  var date = document.getElementById('responder_date').value.trim() || '—';

  addText('Hornton Street — Answers', { size: 16, bold: true });
  addText('Flat 1, 20 Hornton Street, London W8 4NR', { size: 10 });
  addText('Respondent: ' + name + '    Date: ' + date, { size: 10 });
  y += 2; hr();

  window.SECTION_TITLES.forEach(function(sect, i) {
    y += 2;
    addText(sect, { size: 12, bold: true });
    var qids = window.QUESTION_MANIFEST[i];
    qids.forEach(function(qid) {
      var el = document.getElementById(qid);
      var val = el ? (el.value.trim() || '—') : '—';
      addText(qid + '. ' + window.QUESTION_TEXTS[qid], { size: 9, bold: true });
      addText('   →  ' + val, { size: 10 });
      y += 1;
    });
    hr();
  });

  var filename = 'Hornton_Answers_' + name.replace(/\s+/g, '_') + '.pdf';
  try {
    var blob = doc.output('blob');
    var file = new File([blob], filename, { type: 'application/pdf' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Hornton answers', text: 'Planning-application answers from Grahame' })
        .then(function() { status.textContent = '✅ PDF shared.'; })
        .catch(function() {
          // user dismissed share — fall back to download
          doc.save(filename);
          status.textContent = '✅ PDF downloaded.';
        });
    } else {
      doc.save(filename);
      status.textContent = '✅ PDF generated — check Downloads / Files.';
    }
  } catch (e) {
    status.textContent = '⚠️ ' + e.message + ' — falling back to direct download';
    doc.save(filename);
  }
}
"""

    js_block = (
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
        f'<script>{js_data}{js_logic}</script>'
    )

    html = (
        head + header_html + intro + who
        + "".join(sections_html)
        + actions + js_block
        + '</body></html>'
    )

    OUT.write_text(html, encoding="utf-8")
    sz_kb = OUT.stat().st_size // 1024
    print(f"Wrote {OUT} ({sz_kb} KB)")


if __name__ == "__main__":
    render()
