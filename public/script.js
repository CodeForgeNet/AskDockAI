// Helper for element selection
const $ = (id) => document.getElementById(id);

// Clear all user and generated content on page load
window.addEventListener("load", () => {
  if ($("file")) $("file").value = "";
  if ($("instruction")) $("instruction").value = "";
  if ($("text")) $("text").value = "";
  if ($("to")) $("to").value = "";
  if ($("subject")) $("subject").value = "";
  if ($("status")) $("status").textContent = "";
  if ($("summary")) $("summary").textContent = "";
});

$("form").onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData();
  const file = $("file").files[0];
  const instruction = $("instruction").value;
  const text = $("text").value;
  if (file) fd.append("transcript", file);
  if (instruction) fd.append("transcriptText", instruction); // instruction prompt
  if (text) fd.append("transcriptContent", text); // actual transcript text if pasted
  const resp = await fetch(`/api/summarize`, { method: "POST", body: fd });
  const data = await resp.json();
  const s = data.summary;
  let output = "";

  if (typeof s === "object") {
    if (s.executive_summary) {
      output += "Executive Summary:\n" + s.executive_summary + "\n\n";
    }
    if (s.key_points && s.key_points.length) {
      output += "Key Points:\n- " + s.key_points.join("\n- ") + "\n\n";
    }
    if (s.decisions && s.decisions.length) {
      output += "Decisions:\n- " + s.decisions.join("\n- ") + "\n\n";
    }
    if (s.action_items && s.action_items.length) {
      output += "Action Items:\n- " + s.action_items.join("\n- ") + "\n\n";
    }
  } else {
    output = s;
  }

  $("summary").textContent = output.trim();
};

$("send").onclick = async () => {
  const to = $("to").value;
  const subject = $("subject").value;
  const bodyHtml = $("summary").value || $("summary").textContent;
  const resp = await fetch(`/api/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, bodyHtml }),
  });
  const data = await resp.json();
  $("status").textContent = resp.ok ? "Sent ✓" : "Failed: " + data.error;
};
