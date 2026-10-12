// The button toggles a root attribute; CSS uses it to select theme colors.
const THEME_KEY = 'zed.theme';
const themeButton = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  // Name the theme the button will switch to.
  themeButton.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121b27' : '#f3f6fa';
}

function toggleTheme() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  // The toggle still works if browser storage is unavailable.
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* Keep the theme for this visit. */ }
}

let savedTheme;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch { /* Use the default light theme. */ }
applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Run application code only on pages with a form or saved list.
if (document.querySelector("#application-form, #application-list")) initializeApplications();

function initializeApplications() {
  // One array holds the application's state; localStorage keeps it across reloads.
  const STORAGE_KEY = 'zed.applications.v1';
  const form = document.querySelector('#application-form');
  const list = document.querySelector('#application-list');
  const message = document.querySelector('#form-message');
  const storageMessage = document.querySelector('#storage-message') || message;
  // One shared list supplies both the form and saved status dropdowns.
  const statuses = ['Work in Progress', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];
  if (form) {
    form.elements.status.replaceChildren();
    for (const status of statuses) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      form.elements.status.append(option);
    }
  }
  const fields = ['company', 'position', 'link', 'applicationDate', 'status', 'contact', 'notes', 'followUpDate'];
  let applications = [];
  let storageReadable = true;
  // null means adding; a number identifies the application being edited.
  let editingIndex = null;
  const saveButton = form?.querySelector('button[type="submit"]');
  const cancelEdit = document.querySelector('#cancel-edit');
  const formHeading = document.querySelector('#form-heading');
  const listMessage = document.querySelector('#list-message');
  const searchForm = document.querySelector('#search-form');
  const searchMessage = document.querySelector('#search-message');
  let searchQuery = '';
  let searchField = 'company';

  if (searchForm) searchForm.addEventListener('submit', event => {
    event.preventDefault();
    searchQuery = searchForm.elements.query.value.trim().toLowerCase();
    searchField = searchForm.elements.field.value;
    renderApplications();
  });

  function clearErrors() {
    form.querySelectorAll('.error').forEach(error => { error.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  }

  function resetForm() {
    editingIndex = null;
    form.reset();
    clearErrors();
    formHeading.textContent = 'Add an application';
    saveButton.textContent = 'Save application';
    cancelEdit.hidden = true;
  }

  if (cancelEdit) cancelEdit.addEventListener('click', () => {
    window.location.href = 'saved-applications.html';
  });

  // Both kinds of updates use this: only change memory after storage succeeds.
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

  function validLink(value) {
    if (!value) return true;
    try { return ['https:', 'http:'].includes(new URL(value).protocol); }
    catch { return false; }
  }

  function validDate(value) {
    if (!value) return true;
    // Let a date input validate the calendar value, without calculating dates.
    const input = document.createElement('input');
    input.type = 'date';
    input.value = value;
    return input.value === value && input.validity.valid;
  }

  function validRecord(record) {
    return record && fields.every(field => typeof record[field] === 'string') &&
      record.company.trim() && record.position.trim() && statuses.includes(record.status) &&
      validLink(record.link) && validDate(record.applicationDate) && validDate(record.followUpDate);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      // Keep applications saved with the older capitalization readable.
      if (Array.isArray(parsed)) {
        for (const application of parsed) {
          if (application && application.status === 'Work In Progress') {
            application.status = 'Work in Progress';
          }
        }
      }
      if (!Array.isArray(parsed) || !parsed.every(validRecord)) throw new Error('Invalid saved data');
      applications = parsed;
    }
  } catch {
    // Avoid overwriting existing data if it could not be read safely.
    storageReadable = false;
    storageMessage.textContent = 'Saved applications could not be loaded. Saving is disabled to protect existing data. Check browser storage settings or stored data, then reload.';
    if (saveButton) saveButton.disabled = true;
  }

  function deleteApplication(index) {
    const application = applications[index];
    if (!confirm(`Delete application: "${application.position} at ${application.company}"?`)) return;

    // Copy the array so a failed save cannot remove the application from memory.
    const updated = [...applications];
    updated.splice(index, 1);
    listMessage.textContent = '';
    if (!saveApplications(updated, listMessage)) return;

    renderApplications();
    listMessage.textContent = `Application deleted: ${application.position} at ${application.company}.`;
    // The clicked button is gone; move keyboard focus to a remaining control.
    const nextItem = list.children[Math.min(index, list.children.length - 1)];
    if (nextItem) nextItem.querySelector('button').focus();
    else document.querySelector('nav a[href="add-application.html"]').focus();
  }

  function renderApplications() {
    if (!list) return;
    list.replaceChildren();
    document.querySelector('#empty-message').hidden = applications.length > 0 || !storageReadable;
    document.querySelector('#saved-hint').hidden = applications.length === 0;
    let matchCount = 0;
    for (const [index, application] of applications.entries()) {
      // Skip nonmatches while keeping the original index for edit/delete.
      if (!application[searchField].toLowerCase().includes(searchQuery)) continue;
      matchCount += 1;
      const item = document.createElement('li');
      const heading = document.createElement('h3');
      // textContent treats user input as text, preventing HTML injection.
      heading.textContent = `${application.position} at ${application.company}`;
      const details = document.createElement('dl');
      for (const [field, label] of [['status', 'Status'], ['link', 'Application link'], ['applicationDate', 'Application date'], ['contact', 'Contact'], ['notes', 'Notes'], ['followUpDate', 'Follow-up date']]) {
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
          select.addEventListener('change', () => {
            listMessage.textContent = '';
            const updated = applications.map((record, recordIndex) =>
              recordIndex === index ? { ...record, status: select.value } : record);
            if (saveApplications(updated, listMessage)) {
              listMessage.textContent = `Status saved for ${application.position} at ${application.company}.`;
            } else {
              select.value = applications[index].status;
            }
          });
          value.append(label, select);
        } else if (field === 'link' && application.link) {
          const link = document.createElement('a');
          link.href = application.link;
          link.textContent = application.link;
          value.append(link);
        } else {
          value.textContent = application[field] || 'Not provided';
        }
        details.append(term, value);
      }
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.setAttribute('aria-label', `Edit ${application.position} at ${application.company}`);
      editButton.addEventListener('click', () => {
        // The add page also handles editing the selected saved application.
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
      searchMessage.textContent = !storageReadable ? '' : searchQuery
        ? (matchCount ? `${matchCount} matching application${matchCount === 1 ? '' : 's'}.` : 'No applications match your search.')
        : '';
    }
  }

  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    if (!storageReadable) return;
    message.textContent = '';
    const application = Object.fromEntries(fields.map(field => [field, form.elements[field].value.trim()]));
    const errors = {
      company: application.company ? '' : 'Enter a company name.',
      position: application.position ? '' : 'Enter a position title.',
      link: validLink(application.link) ? '' : 'Enter a full http:// or https:// application link.',
      applicationDate: validDate(application.applicationDate) && form.elements.applicationDate.validity.valid ? '' : 'Enter a valid application date.',
      followUpDate: validDate(application.followUpDate) && form.elements.followUpDate.validity.valid ? '' : 'Enter a valid follow-up date.'
    };
    let firstInvalid;
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
    const isEditing = editingIndex !== null;
    // Replace one record when editing; append a record when adding.
    const updated = isEditing
      ? applications.map((record, index) => index === editingIndex ? application : record)
      : [...applications, application];
    if (!saveApplications(updated, message)) return;
    renderApplications();
    resetForm();
    if (listMessage) listMessage.textContent = '';
    if (isEditing) {
      window.location.href = 'saved-applications.html';
      return;
    }
    message.textContent = 'Application saved in this browser.';
    form.elements.company.focus();
  });

  // Load an edit into the form when arriving from the saved applications page.
  const editParameter = new URLSearchParams(window.location.search).get('edit');
  if (form && storageReadable && editParameter !== null) {
    const index = Number(editParameter);
    if (/^\d+$/.test(editParameter) && Number.isSafeInteger(index) && applications[index]) {
      editingIndex = index;
      for (const field of fields) form.elements[field].value = applications[index][field];
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
  renderApplications();
}
