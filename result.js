/* ============================================================
   NEUROSCAN — result.html logic
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("resultRoot");
  if (!root) return;

  var session = NS.getSession();
  if (!session.result || !session.scan) {
    window.location.href = "upload.html";
    return;
  }

  var r = session.result;
  var patient = session.patient || {};

  document.getElementById("scanImg").src = session.scan.dataUrl;
  document.getElementById("reportId").textContent = r.id;
  document.getElementById("generatedAt").textContent = NS.fmtDate(r.generatedAt);
  document.getElementById("patientNameOut").textContent = patient.fullName || "Unnamed demo patient";
  document.getElementById("patientIdOut").textContent = patient.patientId || "—";
  document.getElementById("regionOut").textContent = r.region;
  document.getElementById("scoreOut").textContent = r.score + " / 100";
  document.getElementById("confidenceOut").textContent = r.confidence + "%";

  var banner = document.getElementById("verdictBanner");
  banner.classList.add(r.category);
  document.getElementById("verdictLabel").textContent = r.category === "elevated"
    ? "Elevated pattern score"
    : "Low pattern score";
  document.getElementById("verdictValue").textContent = r.verdictText;

  var list = document.getElementById("findingsList");
  r.findings.forEach(function (f) {
    var row = document.createElement("div");
    row.className = "finding-row";
    row.innerHTML =
      '<span class="fname">' + f.name + '</span>' +
      '<span class="fval">' + f.value +
      ' <span class="tag ' + (f.watch ? "watch" : "ok") + '">' + (f.watch ? "review" : "nominal") + '</span></span>';
    list.appendChild(row);
  });

  // record to history once per generated result id
  var history = NS.getHistory();
  var already = history.some(function (h) { return h.id === r.id; });
  if (!already) {
    NS.addHistoryEntry({
      id: r.id,
      date: r.generatedAt,
      patientName: patient.fullName || "Unnamed demo patient",
      patientId: patient.patientId || "—",
      region: r.region,
      score: r.score,
      category: r.category,
      thumb: session.scan.dataUrl
    });
  }
});
