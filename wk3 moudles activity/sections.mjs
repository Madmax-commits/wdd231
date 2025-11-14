// sections.mjs

// Named export for setSectionSelection
export function setSectionSelection(sections) {
  const sectionSelect = document.querySelector("#sectionNumber");
  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section.sectionNumber;
    option.textContent = `${section.sectionNumber}`;
    sectionSelect.appendChild(option);
  });
}

// Named export for populateSections
export function populateSections(sections) {
  const sectionTable = document.querySelector("#sections");
  const html = sections.map(
    (section) => `<tr>
      <td>${section.sectionNumber}</td>
      <td>${section.enrolled}</td>
      <td>${section.instructor}</td>
    </tr>`
  );
  sectionTable.innerHTML = html.join("");
}

