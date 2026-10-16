# AI Collaboration Log

## Tools Used
    - Codex within VS Code: helped implement features, adjust layouts, and review code.
    - ChatGPT in a browser: helped with Github struggles and understanding larger committing/pushing messaging 

## Overview
    - I started by sharing my initial project statement from my project planner with AI and explaining what I wanted my Job & Internship Application Tracker to do.
    - I used code from previous projects and worked with AI to integrate it into this project.
    - I made decisions about the wording, appearance, and features throughout the process.
    - I requested AI not to make direct changes, but sometimes it would directly changee my code, I made sure to click “View Changes” to review the edits before moving forward.

## Changes I Made Fully Myself
    - Changed colors, including the backgrounds, buttons, and text. 
    - Changed descriptions and labels to fit the language I wanted. 
    - Decided which application fields were required or optional.
    - Went through the code to add more application status options.
    - Adjusted the HTML so each page had different wording and placement. 
    - Moved sections around to change their order on the page to make easier to understand or view. 
    - Added the additional pages and set-up the navigation links from one page to another. 

## AI Assistance/How I Communicated

    ### Integrating Previous Code
        - I gave AI code from my previous projects for the theme toggle and delete confirmation pop-up.
        - AI helped integrate those features into the right spot in this project.
        - AI also helped me update the theme button label when switching themes instead of just staying same label. 
        - I used AI to help find sections of code I wanted to edit or change.

    ### Navigation and Layout

        - After creating the nav cards, I asked AI to help make the navigation cards smaller and place them in different locations. 
        - I followed up by asking for the theme toggle in the top left and for the toggle and navigation cards to have the same size and shape.
        - After reviewing the result, I wanted larger navigation cards below the description on the home page, so I adjusted. 
        - AI added styling for the home page while keeping the navigation on the other pages in place. I then editted the code to what I understood it did. 
        - I then asked for the theme toggle beside the title on the home page only, and in same place on other 2 pages. 

    ### Editing Applications and Displaying Instructions

        - I wanted saved applications to have a status dropdown and an Edit button for other details.
        - I noticed that the instructions did not make sense when no applications were saved, so I changed that. 
        - I had AI help for the editing instructions to appear only when applications existed and for the empty-list message to appear otherwise.

    ### Search and Filters

        - I asked for a search card with a text box, Search button, and dropdown to choose between company and position.
        - AI added the search feature and explained how it matched text. I then edited it to make sense to my project. 
        - I later moved the location of the search controls above the saved applications.
        - I later added a status filter that worked alongside search

    ### Debugging
        - I noticed that saving an application did not take me to the saved applications page, so I asked AI to look for bugs in my code.
        - AI reported fixing the redirect and how saved records loaded from browser storage.
        -I asked to see the code and worked through what the issue had been. AI had correctly fixed it, so I left code once I understood it. 

    ### Deadline Reminders
        - I wanted to add “Due soon” and “Follow-up today” badges beside relevant applications because I thought having it send reminders was too complex for my abilities right now. 
        - AI helped me add code that compares application dates with the current date.
        - AI worked with me to add these options with the “Due soon” including deadlines today or within seven days and “Follow-up today” matching today’s date.

    ###  Reviewing Unused Code
        - I asked AI to review all the code for errors or unnecessary parts without changing anything.
        - AI listed possible issues and unused functions.
        - I went through and read that code and deleted it if I agreeded it didn't connect with anything or serve any fucntion. 


    ### Improving the CSS
        - After seeing classmates’ projects, I wanted to improve the design because my earlier versions felt too basic.
        - I worked with AI to get a design I liked.I went back and forth with ideas that I did and did not like until one design was created. 
        - I chose the font and gave directions about colors, card sizes, and placement.

    ### How My Prompts Changed
        - My prompts became more specific about which page to change, where something should appear, and how it should work.
        - I reviewed results and gave follow-up directions when they did not match what I wanted.
        - I also asked AI to review code without changing it so I could look at its findings first.

## Concepts I Learned
    ### Deadline Reminders
        - All of this code occurs in java script. The code newDate() takes the current date and time from the user's device. The code localDate() turns it into a consitent format such as "2026-10-16" using the users local timezone. Then the code will copy todays date and moves it forward 7 days using a setDate +7 code. Then it will use and if/else condition by pulling the application date that was inputted. This compares the two dates and pushes due soon if it its in that +7 timeline. All dates use the same format of year/month. date. The list runs when the saved application page is re-run, so it won't automatically update. 
        - The tracker uses this to update the users on when their applications are due and when the follow up deadline is there. The follow up works similarly, but it is just +1 instead because it needs to happen today instead of in the next week. 
        - I thought this was an important concept to add to my tracker, so that people could stay on top of what they need to be doing. I think the code to send alerts is way too complex for me right now, so this was a great way to do it. AI definitely helped me figure it out in the first place, but now I feel I confidently understand it. 
        - If I removed the deadline reminder code, my tracker would stop checking dates and displaying the "Due soon" and "Follow-up today" reminders. The dates would still be saved and shown, but users would have to check them themselves. 

## Teach Me Concepts
    ### Search/Status Function
        - What I asked: can you explain to me how the search and staus filter work together in the search section of saved applications?
        
        -AI’s explanation: The search text and status filter work together by requiring an application to match both conditions before it appears. When you search, the code reads three values:
        searchQuery = searchForm.elements.query.value.trim().toLowerCase();
        searchField = searchForm.elements.field.value;
        searchStatus = searchForm.elements.status.value;
        - searchQuery is your search text. .trim() removes spaces at the beginning and end, and .toLowerCase() makes matching ignore capitalization.
        - searchField chooses whether to search the company or position.
        - searchStatus is the selected status, such as “Applied.”
        The code then rebuilds the displayed list using renderApplications(). It checks each application:
        if (!application[searchField].toLowerCase().includes(searchQuery)) continue;
        if (searchStatus && application.status !== searchStatus) continue;
        The first line skips applications whose selected field does not contain your search text. The second skips applications whose status does not match the chosen status. continue means “skip this application and check the next one.”
        For example, if you search for “software” in Position and choose “Applied,” you will see only applications that have “software” somewhere in their position title and have the status “Applied.”
        Leaving the search box empty lets every application pass the text check. Choosing the option for all statuses lets every application pass the status check.
        Clicking Search applies both controls. Changing the status dropdown also applies both controls immediately, using whatever text is currently in the search box. Your saved applications stay in storage; filtering only changes which ones appear on the page. 
        
        - My follow-up: Why does leaving the search box empty show all applications, and what does searchStatus && do when ‘All statuses’ is selected?
        - AI response: An empty search box matches every application because JavaScript’s .includes('') returns true for any string:
        'software intern'.includes('') // true
        Your code skips an application only when it does not contain the search text:
        if (!application[searchField].toLowerCase().includes(searchQuery)) continue;
        With an empty search, nothing gets skipped by this check. A selected status can still limit the results.
        “All statuses” sets searchStatus to an empty string (''). Look at the status check:
        if (searchStatus && application.status !== searchStatus) continue;
        && means AND. Both sides must be truthy for the application to be skipped:
        A specific status must be selected.
        The application’s status must differ from that selection.
        An empty string is falsy, so when “All statuses” is selected, JavaScript stops at searchStatus and does not evaluate the comparison. No applications are skipped by the status check.
        With an empty search box and “All statuses,” every application passes both checks.

        - What I learned:I learned that the search and status filter work together, so an application has to match both to appear. Leaving the search box empty or choosing “All statuses” keeps that filter open. I also learned that filtering only changes what appears on the page and does not delete or change my saved applications.

## Update in the ftuture
    - Right now the deadline due option comes up even if you have moved the status to submitted application. I want to add code, so that the deadline reminder only shows if the application has not been submitted. 
   