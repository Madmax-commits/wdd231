// modules.mjs

// Import the course object (default export)
import byuiCourse from "./course.mjs";

// Import section-related function (named export)
import { setSectionSelection } from "./sections.mjs";

// Import output-related functions (named exports)
import { setTitle, renderSections } from "./output.mjs";

// Event listeners
document.querySelector("#enrollStudent").addEventListener("click", function () {
  const sectionNum = Number(document.querySelector("#sectionNumber").value);
  byuiCourse.changeEnrollment(sectionNum);
  renderSections(byuiCourse.sections); // ✅ update after enrollment
});

document.querySelector("#dropStudent").addEventListener("click", function () {
  const sectionNum = Number(document.querySelector("#sectionNumber").value);
  byuiCourse.changeEnrollment(sectionNum, false);
  renderSections(byuiCourse.sections); // ✅ update after drop
});

// Initial setup calls
setTitle(byuiCourse);
setSectionSelection(byuiCourse.sections);
renderSections(byuiCourse.sections);
