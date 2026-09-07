# PulseVote — Polling & Voting App

PulseVote is a modern, responsive polling app built for the Veda Technology web-development task.

## Features

- Create polls with multiple answer options
- Vote once per poll
- Live percentage bars and vote counts
- Separate **All**, **Not voted**, and **Voted** views
- Search polls by question or option
- Supports multiple simultaneous polls
- Persists polls and vote restrictions with `localStorage`
- Responsive layout for desktop, tablet, and mobile
- Accessible buttons, labels, focus states, and semantic structure
- No framework or build step required

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage

## Project Structure

```text
polling-voting-app/
├── index.html
├── styles.css
├── script.js
├── README.md
├── TASK-REPORT.md
└── LINKEDIN-POST.md
```

## Run Locally

No installation is required.

1. Download or clone the project.
2. Open `index.html` in a modern browser.
3. Create a poll and vote.
4. Refresh the page to verify that the poll data and vote restriction remain saved.

For a more production-like local server, you can also use VS Code Live Server or run:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## How Vote Restriction Works

Each poll receives a unique ID. After a user votes, the selected option is stored in a separate `pulseVote.votes.v1` LocalStorage object:

```js
{
  "poll-123": "option-456"
}
```

Before accepting a vote, the app checks whether that poll ID already exists in the object. This prevents a second vote from the same browser for that poll.

> Important: LocalStorage is suitable for a frontend demonstration, but it is **not a secure anti-cheating mechanism** for a real public voting system. A production application should enforce vote restrictions on a server and associate votes with authenticated users, sessions, or another trusted identity mechanism.

## How Percentages Work

For each option:

```text
percentage = optionVotes / totalVotes × 100
```

The UI rounds the result to the nearest whole percentage and uses the same value to control the width of each result bar.

## Multiple Polls

Polls are stored as an array, so the app can manage multiple independent polls at the same time. Each poll has:

- a unique ID
- a question
- creation timestamp
- an options array
- a vote count for every option

## Reset Demo Data

Open DevTools → Console and run:

```js
localStorage.removeItem("pulseVote.polls.v1");
localStorage.removeItem("pulseVote.votes.v1");
location.reload();
```

This restores the initial demo polls.

## Deployment

The project is static and can be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static hosting service.

## Task Checklist

- [x] Poll creation with multiple options
- [x] Voting interface
- [x] Live results with percentage bars
- [x] Prevent duplicate voting per poll
- [x] State/data stored as JavaScript objects
- [x] LocalStorage vote restriction
- [x] Dynamic percentage calculation
- [x] Multiple simultaneous polls
- [x] Responsive modern UI
