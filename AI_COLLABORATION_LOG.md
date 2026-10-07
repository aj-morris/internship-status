# 10/7 conversation 
# placed my first AI prompt from zed planner

> I am building an internship and job application tracker for college students and recent graduates. Use vanilla HTML, CSS, and JavaScript. Help me build one feature at a time, starting with adding, displaying, and saving applications in localStorage. Each application should have a company, position, application link, application date, status, optional contact, notes, and optional follow-up date. Require a company and position, explain invalid inputs, and show a message when no applications are saved. Keep all fields labeled, preserve keyboard accessibility and visible focus outlines, and explain how the code works alongside the code. Start with one feature and wait before adding editing, deleting, or date calculations.

<details><summary>4 previous messages</summary>

> I’ll check the existing files, then build the application form, saved application list, and localStorage persistence. I’ll keep this first feature focused and explain how the code works.
>
> <details><summary>Edited 3 files, ran 3 commands</summary>
>
> - Ran `pwd && rg --files -g 'AGENTS.md' -g 'agent.md' -g 'index.html' -g '*.css' -g '*.js'`
> - Ran `cat agent.md index.html css/styles.css js/app.js`
> - Ran `git status --short && ls -l agent.md css/styles.css js/app.js`
> - Wrote `./css/styles.css` (+27 -0)
> - Wrote `./index.html` (+27 -3)
> - Wrote `./js/app.js` (+114 -0)
>
> </details>
>
> The form and saved list are implemented, including field-specific errors and messages for storage failures. I’m checking the JavaScript now. Application and follow-up dates are optional, and this feature does no date calculations.
>
> <details><summary>Ran 2 commands</summary>
>
> - Ran `node --check js/app.js`
> - Ran `wc -l index.html css/styles.css js/app.js agent.md`
>
> </details>
</details>

Implemented the first feature: add, display, and save applications in localStorage.

- [index.html](./index.html) contains labeled fields, validation messages, and the empty-list message.
- [styles.css](./css/styles.css) adds responsive styling and visible keyboard focus outlines.
- [app.js](./js/app.js) validates entries, saves the application array as JSON, and loads it when the page opens. Code comments explain the main steps.

Company and position are required. Other text and date fields are optional. Invalid links and dates show specific errors; failed saves preserve your form entries.

To check it, open `index.html`, submit an empty form, then add an application and reload to confirm persistence. Automated JavaScript checking was unavailable because Node.js isn’t installed.

Editing, deleting, and date calculations are left for a later feature.


# changed on my own 
looking over code I added more options to the status drop down  by adjusting and adding to <div><label for="status" in html and in const statuses in js 

