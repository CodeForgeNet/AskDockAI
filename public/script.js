// Helper function to select an element by its ID
const $ = (id) => document.getElementById(id);

// When the page loads, clear all input and output fields
window.addEventListener("load", () => {
  // Clear file input
  if ($("file")) $("file").value = "";
  // Clear instruction input
  if ($("instruction")) $("instruction").value = "";
  // Clear transcript text input
  if ($("text")) $("text").value = "";
  // Clear recipient email input
  if ($("to")) $("to").value = "";
  // Clear subject input
  if ($("subject")) $("subject").value = "";
  // Clear status message
  if ($("status")) $("status").textContent = "";
  // Clear summary output
  if ($("summary")) $("summary").textContent = "";
});

// Handle form submission for summarization
$("form").onsubmit = async (e) => {
  // Prevent default form submission behavior
  e.preventDefault();
  // Create a new FormData object to send data to the server
  const fd = new FormData();
  // Get the uploaded file from the file input
  const file = $("file").files[0];
  // Get the instruction prompt from the input
  const instruction = $("instruction").value;
  // Get the transcript text from the input
  const text = $("text").value;
  // If a file is uploaded, append it to the FormData
  if (file) fd.append("transcript", file);
  // If instruction is provided, append it to the FormData
  if (instruction) fd.append("transcriptText", instruction); // instruction prompt
  // If transcript text is provided, append it to the FormData
  if (text) fd.append("transcriptContent", text); // actual transcript text if pasted
  // Send a POST request to the /api/summarize endpoint with the FormData
  const resp = await fetch(`/api/summarize`, { method: "POST", body: fd });
  // Parse the JSON response from the server
  const data = await resp.json();
  // Extract the summary from the response
  const s = data.summary;
  // Initialize output string
  let output = "";

  // If the summary is an object, format its sections
  if (typeof s === "object") {
    // Add executive summary if present
    if (s.executive_summary) {
      output += "Executive Summary:\n" + s.executive_summary + "\n\n";
    }
    // Add key points if present
    if (s.key_points && s.key_points.length) {
      output += "Key Points:\n- " + s.key_points.join("\n- ") + "\n\n";
    }
    // Add decisions if present
    if (s.decisions && s.decisions.length) {
      output += "Decisions:\n- " + s.decisions.join("\n- ") + "\n\n";
    }
    // Add action items if present
    if (s.action_items && s.action_items.length) {
      output += "Action Items:\n- " + s.action_items.join("\n- ") + "\n\n";
    }
  } else {
    // If summary is a string, use it directly
    output = s;
  }

  // Display the formatted summary in the summary element
  $("summary").textContent = output.trim();
};

// Handle click event for sending the summary via email
$("send").onclick = async () => {
  // Get recipient email from input
  const to = $("to").value;
  // Get email subject from input
  const subject = $("subject").value;
  // Get the summary content to send (from value or textContent)
  const bodyHtml = $("summary").value || $("summary").textContent;
  // Send a POST request to the /api/send endpoint with email details
  const resp = await fetch(`/api/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, bodyHtml }),
  });
  // Parse the JSON response from the server
  const data = await resp.json();
  // Update the status element to show if the email was sent successfully or failed
  $("status").textContent = resp.ok ? "Sent ✓" : "Failed: " + data.error;
};
