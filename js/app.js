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

// One array holds the application's state; localStorage keeps it across reloads.
const STORAGE_KEY = 'zed.applications.v1';
const form = document.querySelector('#application-form');
const list = document.querySelector('#application-list');
const message = document.querySelector('#form-message');
const storageMessage = document.querySelector('#storage-message');
const statuses = ['Work In Progress','Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];
const fields = ['company', 'position', 'link', 'applicationDate', 'status', 'contact', 'notes', 'followUpDate'];
let applications = [];
let storageReadable = true;

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
    if (!Array.isArray(parsed) || !parsed.every(validRecord)) throw new Error('Invalid saved data');
    applications = parsed;
  }
} catch {
  // Avoid overwriting existing data if it could not be read safely.
  storageReadable = false;
  storageMessage.textContent = 'Saved applications could not be loaded. Saving is disabled to protect existing data. Check browser storage settings or stored data, then reload.';
  form.querySelector('button').disabled = true;
}

function renderApplications() {
  list.replaceChildren();
  document.querySelector('#empty-message').hidden = applications.length > 0 || !storageReadable;
  for (const application of applications) {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    // textContent treats user input as text, preventing HTML injection.
    heading.textContent = `${application.position} at ${application.company}`;
    const details = document.createElement('dl');
    for (const [field, label] of [['status', 'Status'], ['link', 'Application link'], ['applicationDate', 'Application date'], ['contact', 'Contact'], ['notes', 'Notes'], ['followUpDate', 'Follow-up date']]) {
      const term = document.createElement('dt');
      term.textContent = label;
      const value = document.createElement('dd');
      if (field === 'link' && application.link) {
        const link = document.createElement('a');
        link.href = application.link;
        link.textContent = application.link;
        value.append(link);
      } else {
        value.textContent = application[field] || 'Not provided';
      }
      details.append(term, value);
    }
    item.append(heading, details);
    list.append(item);
  }
}

form.addEventListener('submit', event => {
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
  const updated = [...applications, application];
  try {
    // Commit to the screen only after storage succeeds; retain the form on failure.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    message.textContent = 'Application could not be saved. Browser storage may be full or unavailable. Your form entries are still here; try again.';
    return;
  }
  applications = updated;
  renderApplications();
  form.reset();
  message.textContent = 'Application saved in this browser.';
  form.elements.company.focus();
});

renderApplications();
