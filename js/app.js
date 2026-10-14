// The button toggles a root attribute; CSS uses it to select theme colors.
const THEME_KEY = 'zed.theme';
const themeButton = document.getElementById('theme-toggle');


// Apply theme colors and update the button text
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  // Name the theme the button will switch to.
  themeButton.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121b27' : '#f3f6fa';
}

// Switch to the opposite theme and remember the choice
function toggleTheme() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  // The toggle still works if browser storage is unavailable.
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* Keep the theme for this visit. */ }
}
// Load
let savedTheme;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch { }
applyTheme(savedTheme === 'dark' ? 'dark' : 'light'); // Use dark if saved; otherwise start with light
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Run application code only on pages with a form or saved list.
if (document.querySelector("#application-form, #application-list")) initializeApplications(); 

// Compare calendar dates in the browser's timezone, including across daylight saving changes.
function applicationReminders(application, now = new Date()) {
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = localDate(now);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const reminders = [];
  if (application.applicationDate >= today && application.applicationDate <= localDate(nextWeek)) {
    reminders.push('Due soon');
  }
  if (application.followUpDate === today) reminders.push('Follow-up today');
  return reminders;
}

function initializeApplications() { // Set up saving, searching, editing, and deleting
  const STORAGE_KEY = 'zed.applications.v1';// Storage name for the saved applications
  const form = document.querySelector('#application-form');
  const list = document.querySelector('#application-list');
  const message = document.querySelector('#form-message');
  const storageMessage = document.querySelector('#storage-message') || message;
  const statuses = ['Work In Progress', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn']; // choices for application status

  if (form) {
    form.elements.status.replaceChildren();
    for (const status of statuses) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      form.elements.status.append(option);
    }
  }
  const fields = ['company', 'position', 'link', 'applicationDate', 'status', 'contact', 'notes', 'followUpDate']; // Field names used to read and fill the form
  let applications = []; // Holds all applications during this page visit
  let storageReadable = true; // Tracks whether saved data loaded safely
  let editingIndex = null; // null means adding; a number identifies the application being edited
  const saveButton = form?.querySelector('button[type="submit"]'); // ?. avoids an error if this page has no form
  const cancelEdit = document.querySelector('#cancel-edit');
  const formHeading = document.querySelector('#form-heading');
  const listMessage = document.querySelector('#list-message');
  const searchForm = document.querySelector('#search-form');
  const searchMessage = document.querySelector('#search-message');
  let searchQuery = ''; // Store the current search text and selected field
  let searchField = 'company';
  let searchStatus = '';


  if (searchForm) {
    for (const status of statuses) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      searchForm.elements.status.append(option);
    }
    function applySearch() {
      searchQuery = searchForm.elements.query.value.trim().toLowerCase();
      searchField = searchForm.elements.field.value;
      searchStatus = searchForm.elements.status.value;
      renderApplications();
    }
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      applySearch();
    });
    searchForm.elements.status.addEventListener('change', applySearch);
  }
// Return to saved applications when editing is canceled
  if (cancelEdit) cancelEdit.addEventListener('click', () => {
    window.location.href = 'saved-applications.html';
  });

// Save the new array; keep the old array if saving fails
  function saveApplications(updated, feedback) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      applications = updated;
      return true;
    } catch {
      feedback.textContent = 'Changes could not be saved. Browser storage may be full or unavailable. Your saved applications were kept; try again.';
      return false;
    }
  }

  // Allow blank links or valid http/https addresses
  function validLink(value) {
    if (!value) return true;
    try { return ['https:', 'http:'].includes(new URL(value).protocol); }
    catch { return false; }
  }


// Check whether the browser accepts the date
  function validDate(value) {
    if (!value) return true;
    // Let a date input validate the calendar value, without calculating dates.
    const input = document.createElement('input');
    input.type = 'date';
    input.value = value;
    return input.value === value && input.validity.valid;
  }

  // Check that a saved application has the expected fields and values
  function validRecord(record) {
    return record && fields.every(field => typeof record[field] === 'string') &&
      record.company.trim() && record.position.trim() && statuses.includes(record.status) &&
      validLink(record.link) && validDate(record.applicationDate) && validDate(record.followUpDate);
  }

  // Load saved records before adding, editing, or displaying applications.
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const records = stored === null ? [] : JSON.parse(stored);
    if (!Array.isArray(records) || !records.every(validRecord)) {
      throw new Error('Invalid saved applications');
    }
    applications = records;
  } catch {
    storageReadable = false;
    storageMessage.textContent = 'Saved applications could not be loaded. Existing data has been kept. Try again with browser storage available.';
    if (saveButton) saveButton.disabled = true;
  }

  // Confirm deletion, then remove and save one application
  function deleteApplication(index) {
    const application = applications[index];
    if (!confirm(`Delete application: "${application.position} at ${application.company}"?`)) return;

    // Copy the array so a failed save cannot remove the application from memory.
    const updated = [...applications];
    updated.splice(index, 1); // Remove one application at this index
    listMessage.textContent = '';
    if (!saveApplications(updated, listMessage)) return;


    // Build the visible list from the applications array
    renderApplications();
    listMessage.textContent = `Application deleted: ${application.position} at ${application.company}.`;
    const nextItem = list.children[Math.min(index, list.children.length - 1)];
    if (nextItem) nextItem.querySelector('button').focus();
    else document.querySelector('nav a[href="add-application.html"]').focus();
  }

  function renderApplications() {
    if (!list) return; // Stop if this page has no saved list
    list.replaceChildren(); // Clear the displayed list before rebuilding it
    document.querySelector('#empty-message').hidden = applications.length > 0 || !storageReadable;
    document.querySelector('#saved-hint').hidden = applications.length === 0;
    let matchCount = 0;
    const now = new Date();
    // Loop through each application and its original index
    for (const [index, application] of applications.entries()) {
    // Skip applications that do not match the search
    if (!application[searchField].toLowerCase().includes(searchQuery)) continue;
    if (searchStatus && application.status !== searchStatus) continue;
      matchCount += 1;
      const item = document.createElement('li');
      const heading = document.createElement('h3');
      // Display entered content as text, not HTML
      heading.textContent = `${application.position} at ${application.company}`;
      for (const reminder of applicationReminders(application, now)) {
        const badge = document.createElement('span');
        badge.className = 'application-reminder';
        badge.textContent = reminder;
        heading.append(badge);
      }
      const details = document.createElement('dl');
      for (const [field, label] of [['status', 'Status'], ['link', 'Application link'], ['applicationDate', 'Application deadline'], ['contact', 'Contact'], ['notes', 'Notes'], ['followUpDate', 'Follow-up date']]) {
        const term = document.createElement('dt');
        term.textContent = label;
        const value = document.createElement('dd');
        if (field === 'status') {
          const label = document.createElement('label');
          label.htmlFor = `saved-status-${index}`;
          label.textContent = `Status for ${application.position} at ${application.company}`;
          const select = document.createElement('select');
          select.id = label.htmlFor;
          for (const status of statuses) {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            select.append(option);
          }
          select.value = application.status;
          select.addEventListener('change', () => { // Save immediately when a status dropdown changes
            listMessage.textContent = '';
            const updated = applications.map((record, recordIndex) =>
              recordIndex === index ? { ...record, status: select.value } : record);
            if (saveApplications(updated, listMessage)) {
              renderApplications();
              (document.getElementById(select.id) || searchForm.elements.status).focus();
              listMessage.textContent = `Status saved for ${application.position} at ${application.company}.`;
            } else {
              select.value = applications[index].status; // Restore the old dropdown value if saving fails
            }
          });
          value.append(label, select);
        } else if (field === 'link' && application.link) { // Show a clickable link when one was provided
          const link = document.createElement('a');
          link.href = application.link;
          link.textContent = application.link;
          value.append(link);
        } else {
          value.textContent = application[field] || 'Not provided'; // Show a fallback for empty optional fields
        }
        details.append(term, value);
      }
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.setAttribute('aria-label', `Edit ${application.position} at ${application.company}`);
      editButton.addEventListener('click', () => {
        window.location.href = `add-application.html?edit=${index}`;
      });
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete ${application.position} at ${application.company}`);
      deleteButton.addEventListener('click', () => deleteApplication(index));
      item.append(heading, details, editButton, deleteButton);
      list.append(item);
    }
    if (searchMessage) {
      searchMessage.textContent = !storageReadable ? '' : (searchQuery || searchStatus)
        ? (matchCount ? `${matchCount} matching application${matchCount === 1 ? '' : 's'}.` : 'No applications match your search.')
        : '';
    }
  }

  if (form) form.addEventListener('submit', event => { // Check and save the form when submitted
    event.preventDefault();
    if (!storageReadable) return;
    message.textContent = '';
    const application = Object.fromEntries(fields.map(field => [field, form.elements[field].value.trim()])); // Build an application object from the form values
    const errors = {
      company: application.company ? '' : 'Enter a company name.',
      position: application.position ? '' : 'Enter a position title.',
      link: validLink(application.link) ? '' : 'Enter a full http:// or https:// application link.',
      applicationDate: validDate(application.applicationDate) && form.elements.applicationDate.validity.valid ? '' : 'Enter a valid application date.',
      followUpDate: validDate(application.followUpDate) && form.elements.followUpDate.validity.valid ? '' : 'Enter a valid follow-up date.'
    };
    let firstInvalid; // Remember the first field with an error
    for (const [field, error] of Object.entries(errors)) {
      const input = form.elements[field];
      document.getElementById(`${input.id}-error`).textContent = error;
      if (error) { input.setAttribute('aria-invalid', 'true'); firstInvalid ??= input; }
      else input.removeAttribute('aria-invalid');
    }
    if (firstInvalid) {
      message.textContent = 'Application was not saved. Correct the highlighted fields.';
      firstInvalid.focus();
      return;
    }
    const isEditing = editingIndex !== null; // Check whether we are editing an existing application
    const updated = isEditing // Replace one application when editing; append one when adding
      ? applications.map((record, index) => index === editingIndex ? application : record)
      : [...applications, application];
    if (!saveApplications(updated, message)) return;
    window.location.href = 'saved-applications.html';
  });

  const editParameter = new URLSearchParams(window.location.search).get('edit');
  if (form && storageReadable && editParameter !== null) {
    const index = Number(editParameter);
    if (/^\d+$/.test(editParameter) && Number.isSafeInteger(index) && applications[index]) {
      editingIndex = index;
      for (const field of fields) form.elements[field].value = applications[index][field]; // Copy the saved values into the form fields
      formHeading.textContent = 'Edit application';
      saveButton.textContent = 'Save changes';
      cancelEdit.hidden = false;
      form.elements.company.focus();
    } else {
      message.textContent = 'This application could not be found. Use Saved Applications to select it again.';
      saveButton.disabled = true;
      cancelEdit.hidden = false;
    }
  }
  renderApplications(); // Display saved applications when the page first loads
}
