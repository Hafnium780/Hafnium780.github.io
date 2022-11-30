const key = document.getElementById("edit-current-key");
const secret = document.getElementById("edit-current-secret");

if (key) chrome.storage.sync.set({ key: key.value });
if (secret && secret.value.indexOf("*") === -1)
  chrome.storage.sync.set({ signature: secret.value });
