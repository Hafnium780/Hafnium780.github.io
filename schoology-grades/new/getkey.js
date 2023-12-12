const key = document.getElementById("edit-current-key");
const secret = document.getElementById("edit-current-secret");

if (key) chrome.storage.local.set({ sg_key: key.value });
if (secret && secret.value.indexOf("*") === -1)
  chrome.storage.local.set({ sg_signature: secret.value });
