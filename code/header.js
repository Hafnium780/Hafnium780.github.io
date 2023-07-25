(async () => {
  const headerDiv = document.createElement("div");
  headerDiv.id = "header";
  document.body.prepend(headerDiv);
  headerDiv.innerHTML = await (await fetch("../header.html")).text();

  if (sessionStorage.getItem("sidebar-open") == "true")
    document.getElementById("menu-toggle-checkbox").checked = true;
  document
    .getElementById("menu-toggle-checkbox")
    .addEventListener("change", () => {
      sessionStorage.setItem(
        "sidebar-open",
        document.getElementById("menu-toggle-checkbox").checked
      );
    });
})();
