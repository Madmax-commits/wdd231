const courses = [
  { code: "WDD 130", name: "Web Fundamentals", credits: 3, completed: true },
  { code: "WDD 231", name: "Frontend Dev I", credits: 3, completed: false },
  { code: "CSE 121b", name: "JavaScript Language", credits: 3, completed: true },
  { code: "CSE 110", name: "Intro to Programming", credits: 2, completed: false }
];

const courseContainer = document.getElementById("courses");
const totalCredits = document.getElementById("totalCredits");

function renderCourses(list) {
  courseContainer.innerHTML = "";
  let credits = 0;
  list.forEach(course => {
    const card = document.createElement("div");
    card.className = course.completed ? "completed" : "incomplete";
    card.innerHTML = `<h3>${course.code}</h3><p>${course.name}</p><p>Credits: ${course.credits}</p>`;
    courseContainer.appendChild(card);
    credits += course.credits;
  });
  totalCredits.textContent = credits;
}

document.getElementById("all").addEventListener("click", () => renderCourses(courses));
document.getElementById("wdd").addEventListener("click", () => {
  renderCourses(courses.filter(c => c.code.startsWith("WDD")));
});
document.getElementById("cse").addEventListener("click", () => {
  renderCourses(courses.filter(c => c.code.startsWith("CSE")));
});

renderCourses(courses);
courses.forEach(course => {
  const card = document.createElement("div");
  card.textContent = `${course.code} - ${course.name}`;
  document.getElementById("courses").appendChild(card);
});

document.getElementById("wdd").onclick = () => {
  renderCourses(courses.filter(c => c.code.startsWith("WDD")));
};

const total = filteredCourses.reduce((sum, c) => sum + c.credits, 0);
document.getElementById("totalCredits").textContent = total;


card.className = course.completed ? "completed" : "incomplete";

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("lastModified").textContent = `Last Modified: ${document.lastModified}`;
