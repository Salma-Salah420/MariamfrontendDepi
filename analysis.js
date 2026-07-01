/* ============================================================
   NEUROSCAN — analysis.html logic
   Runs a simulated processing sequence, then generates a
   deterministic MOCK result (not a real diagnosis) and stores
   it to the session before advancing to result.html.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  var statusEl = document.getElementById("analysisStatus");
  var fillEl = document.getElementById("progressFill");
  var listEl = document.getElementById("checklist");
  var scanThumb = document.getElementById("scanThumb");
  var goBtn = document.getElementById("goToResult");

  if (!listEl) return;

  var session = NS.getSession();
  if (!session.scan) {
    window.location.href = "upload.html";
    return;
  }
  if (scanThumb && session.scan.dataUrl) scanThumb.src = session.scan.dataUrl;

  var stages = [
    { label: "Loading image series", status: "Reading pixel data & orientation…" },
    { label: "Normalizing intensity + orientation", status: "Aligning slices to standard atlas space…" },
    { label: "Segmenting anatomical regions", status: "Isolating cortical and subcortical structures…" },
    { label: "Running convolutional feature extraction", status: "Scanning tissue texture across slices…" },
    { label: "Scoring regions of interest", status: "Weighing candidate regions against training patterns…" },
    { label: "Compiling findings summary", status: "Assembling report-ready output…" }
  ];

  var items = stages.map(function (s) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="tick"></span><span>' + s.label + '</span>';
    listEl.appendChild(li);
    return li;
  });

  var i = 0;
  var pct = 0;

  function tick() {
    if (i >= stages.length) {
      finish();
      return;
    }
    items.forEach(function (li, idx) {
      li.classList.toggle("active", idx === i);
      li.classList.toggle("complete", idx < i);
    });
    statusEl.textContent = stages[i].status;
    var target = Math.round(((i + 1) / stages.length) * 100);
    animateFill(pct, target);
    pct = target;
    i++;
    setTimeout(tick, 900 + Math.random() * 500);
  }

  function animateFill(from, to) {
    fillEl.style.width = to + "%";
  }

  function finish() {
    items.forEach(function (li) { li.classList.add("complete"); li.classList.remove("active"); });
    statusEl.textContent = "Analysis complete.";
    var result = generateMockResult(session);
    NS.setSession({ result: result });
    if (goBtn) {
      goBtn.disabled = false;
      goBtn.classList.add("pulse");
    }
    setTimeout(function () {
      window.location.href = "result.html";
    }, 1100);
  }

  /* ---- deterministic mock result generator ----
     This is a UI DEMONSTRATION ONLY. It does not run any real
     imaging model — it derives illustrative numbers from a hash
     of the uploaded file so the same upload yields a stable,
     repeatable mock output within the demo. */
  function generateMockResult(session) {
    var seedStr = (session.scan.fileName || "") + session.scan.fileSize + (session.patient ? session.patient.patientId : "");
    var seed = NS.hashString(seedStr);

    var regions = [
      "Left frontal lobe", "Right frontal lobe", "Left temporal lobe",
      "Right temporal lobe", "Left parietal lobe", "Right parietal lobe",
      "Cerebellum", "Left occipital lobe", "No focal region flagged"
    ];
    var region = regions[seed % regions.length];
    var noFinding = region === "No focal region flagged";

    // weight toward lower scores so most demo runs land "low likelihood"
    var base = seed % 100;
    var score = noFinding ? Math.round(base * 0.12) : Math.round(4 + (base % 61));
    var confidence = 78 + (seed % 18); // 78–95

    var category = score >= 55 ? "elevated" : "low";
    var verdictText = score >= 55
      ? "Elevated pattern score — recommend clinical follow-up"
      : "Low pattern score — no urgent indicators flagged";

    var findings = [
      { name: "Tissue density variance", value: (score >= 55 ? "Above baseline" : "Within baseline"), watch: score >= 55 },
      { name: "Signal symmetry (L/R)", value: (seed % 7 === 0 ? "Mild asymmetry" : "Symmetric"), watch: seed % 7 === 0 },
      { name: "Margin definition", value: (score >= 55 ? "Irregular border pattern" : "Well-defined / smooth"), watch: score >= 55 },
      { name: "Enhancement pattern", value: (score >= 70 ? "Heterogeneous" : "Homogeneous"), watch: score >= 70 },
      { name: "Midline shift", value: "None detected", watch: false }
    ];

    return {
      id: NS.genId("RPT"),
      generatedAt: new Date().toISOString(),
      region: region,
      score: score,
      confidence: confidence,
      category: category,
      verdictText: verdictText,
      findings: findings,
      modelVersion: "NeuroScan-Demo v0.9 (simulated)"
    };
  }

  goBtn && goBtn.addEventListener("click", function () {
    if (!goBtn.disabled) window.location.href = "result.html";
  });

  setTimeout(tick, 500);
});
