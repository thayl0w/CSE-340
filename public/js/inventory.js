'use strict';

document.addEventListener("DOMContentLoaded", () => {
  const sel = document.querySelector("#classificationList select");
//   const inventoryDisplay = document.getElementById("inventoryDisplay");
  
  sel.addEventListener("change", () => {
    const cid = sel.value;
    console.log(`classification_id is: ${cid}`);
    fetch(`/inv/getInventory/${cid}`)
      .then(r => {
        if (r.ok) return r.json();
        throw Error("Network response was not OK");
      })
      .then(data => {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(e => console.log('There was a problem: ', e.message));
  });

  function buildInventoryList(data) {
    const inventoryDisplay = document.getElementById("inventoryDisplay");
    let dataTable = '<thead><tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr></thead><tbody>';
    data.forEach(el => {
      console.log(el.inv_id + ", " + el.inv_model);
      dataTable += `
        <tr>
          <td>${el.inv_make} ${el.inv_model}</td>
          <td><a href='/inv/edit/${el.inv_id}'>Modify</a></td>
          <td><a href='/inv/delete/${el.inv_id}'>Delete</a></td>
        </tr>`;
    });
    dataTable += '</tbody>';
    inventoryDisplay.innerHTML = dataTable;
  }
});