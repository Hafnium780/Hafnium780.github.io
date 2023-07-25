(async () => {
  const headerDiv = document.createElement("div");
  headerDiv.id = "header";
  document.body.prepend(headerDiv);
  headerDiv.innerHTML = await (await fetch("../header.html")).text();
})();
