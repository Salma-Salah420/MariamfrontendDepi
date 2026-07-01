/* ============================================================
   NEUROSCAN — report.html logic
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  var sheet = document.getElementById("reportSheet");
  if (!sheet) return;

  var session = NS.getSession();
  if (!session.result || !session.scan) {
    window.location.href = "upload.html";
    return;
  }

  var r = session.result;
  var p = session.patient || {};

  document.getElementById("rIdTop").textContent = r.id;
  document.getElementById("rDateTop").textContent = NS.fmtDate(r.generatedAt);
  document.getElementById("rName").textContent = p.fullName || "Unnamed demo patient";
  document.getElementById("rPid").textContent = p.patientId || "—";
  document.getElementById("rAge").textContent = p.age || "—";
  document.getElementById("rSex").textContent = p.sex || "—";
  document.getElementById("rScanType").textContent = p.scanType || "MRI (unspecified sequence)";
  document.getElementById("rReferrer").textContent = p.referrer || "Self-referred (demo)";
  document.getElementById("rFileName").textContent = session.scan.fileName;
  document.getElementById("rSlices").textContent = session.scan.slices;
  document.getElementById("rRegion").textContent = r.region;
  document.getElementById("rScore").textContent = r.score + " / 100";
  document.getElementById("rConfidence").textContent = r.confidence + "%";
  document.getElementById("rVerdict").textContent = r.verdictText;
  document.getElementById("rModel").textContent = r.modelVersion;

  var fList = document.getElementById("rFindings");
  r.findings.forEach(function (f) {
    var li = document.createElement("li");
    li.textContent = f.name + ": " + f.value;
    fList.appendChild(li);
  });

  var printBtn = document.getElementById("printBtn");
  printBtn && printBtn.addEventListener("click", function () { window.print(); });

  var newCaseBtn = document.getElementById("newCaseBtn");
  newCaseBtn && newCaseBtn.addEventListener("click", function () {
    NS.clearSession();
    window.location.href = "patient.html";
  });
});
