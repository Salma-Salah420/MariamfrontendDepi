/* ============================================================
   NEUROSCAN — upload.html logic
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  var dz = document.getElementById("dropzone");
  var input = document.getElementById("fileInput");
  var preview = document.getElementById("previewWrap");
  var previewImg = document.getElementById("previewImg");
  var previewName = document.getElementById("previewName");
  var previewSize = document.getElementById("previewSize");
  var previewType = document.getElementById("previewType");
  var previewSlices = document.getElementById("previewSlices");
  var continueBtn = document.getElementById("continueBtn");
  var clearBtn = document.getElementById("clearBtn");
  var patientNotice = document.getElementById("patientNotice");

  if (!dz) return;

  var session = NS.getSession();
  if (!session.patient && patientNotice) {
    patientNotice.style.display = "flex";
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function handleFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.(dcm)$/i.test(file.name)) {
      alert("Please upload an image file (JPG, PNG) exported from an MRI series, or a .dcm file.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var dataUrl = e.target.result;
      previewImg.src = dataUrl;
      previewName.textContent = file.name;
      previewSize.textContent = humanSize(file.size);
      previewType.textContent = file.type || "DICOM";
      var slices = 24 + (NS.hashString(file.name + file.size) % 40);
      previewSlices.textContent = slices + " slices";
      preview.classList.add("show");
      continueBtn.disabled = false;

      NS.setSession({
        scan: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "DICOM",
          dataUrl: dataUrl,
          slices: slices,
          uploadedAt: new Date().toISOString()
        }
      });
    };
    reader.readAsDataURL(file);
  }

  continueBtn && continueBtn.addEventListener("click", function () {
    window.location.href = "analysis.html";
  });

  dz.addEventListener("click", function () { input.click(); });
  dz.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
  });
  input.addEventListener("change", function (e) { handleFile(e.target.files[0]); });

  ["dragenter", "dragover"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) {
      e.preventDefault(); e.stopPropagation();
      dz.classList.add("drag");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) {
      e.preventDefault(); e.stopPropagation();
      dz.classList.remove("drag");
    });
  });
  dz.addEventListener("drop", function (e) {
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  clearBtn && clearBtn.addEventListener("click", function () {
    preview.classList.remove("show");
    continueBtn.disabled = true;
    input.value = "";
    var s = NS.getSession();
    delete s.scan;
    localStorage.setItem("neuroscan_session_v1", JSON.stringify(s));
  });

  // restore prior selection within this session, if any
  if (session.scan && session.scan.dataUrl) {
    previewImg.src = session.scan.dataUrl;
    previewName.textContent = session.scan.fileName;
    previewSize.textContent = humanSize(session.scan.fileSize);
    previewType.textContent = session.scan.fileType;
    previewSlices.textContent = session.scan.slices + " slices";
    preview.classList.add("show");
    continueBtn.disabled = false;
  }
});
