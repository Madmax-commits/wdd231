/**
 * Unified Footer Utility
 * Handles footer initialization across all pages
 * Updates year and last modified date dynamically
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Update last modified date
  const lastModElement = document.getElementById('lastModified');
  if (lastModElement) {
    lastModElement.textContent = new Date(document.lastModified).toLocaleString();
  }
});
