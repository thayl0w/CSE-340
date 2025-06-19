document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("classificationDropdown");
  const wrapper = document.getElementById("classificationTableWrapper");
  const tbody = document.getElementById("classificationTableBody");
  const classifications = JSON.parse(document.getElementById("classificationData").textContent);

  dropdown.addEventListener("change", function () {
    const selectedId = this.value;
    tbody.innerHTML = "";

    if (!selectedId) {
      wrapper.style.display = "none";
      return;
    }

    const selected = classifications.find(c => c.classification_id == selectedId);
    if (!selected) return;

    wrapper.style.display = "block";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <form action="/inv/update-classification" method="post" style="display: flex; gap: 0.5rem;">
          <input type="hidden" name="classification_id" value="${selected.classification_id}">
          <input type="text" name="classification_name" value="${selected.classification_name}" required>
          <button type="submit">Update</button>
        </form>
      </td>
      <td>
        <form action="/inv/delete-classification" method="post" onsubmit="return confirm('Are you sure you want to delete this classification?');">
          <input type="hidden" name="classification_id" value="${selected.classification_id}">
          <button type="submit" style="background-color: red; color: white;">Delete</button>
        </form>
      </td>
    `;

    tbody.appendChild(row);
  });
});