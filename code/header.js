(async () => {
  const headerDiv = document.createElement("div");
  headerDiv.id = "header";
  document.body.prepend(headerDiv);
  headerDiv.innerHTML = await (await fetch("../header.html")).text();

  if (sessionStorage.getItem("sidebar-open") == "true") {
    document.body.style.transition = "none";
    document.getElementById("menu-toggle-checkbox").checked = true;
    setTimeout(() => {
      document.body.style.transition = "";
    }, 20);
  }
  document
    .getElementById("menu-toggle-checkbox")
    .addEventListener("change", () => {
      sessionStorage.setItem(
        "sidebar-open",
        document.getElementById("menu-toggle-checkbox").checked
      );
    });
})();
