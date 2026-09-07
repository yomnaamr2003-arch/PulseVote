const STORAGE_KEY = "pulseVote.polls.v1";
const VOTES_KEY = "pulseVote.votes.v1";

const seedPolls = [
  {
    id: "seed-1",
    question: "Which frontend technology would you pick for your next project?",
    createdAt: Date.now() - 86400000 * 2,
    options: [
      { id: "a", text: "Vanilla JavaScript", votes: 18 },
      { id: "b", text: "React", votes: 27 },
      { id: "c", text: "Vue", votes: 11 },
      { id: "d", text: "Other", votes: 6 }
    ]
  },
  {
    id: "seed-2",
    question: "What makes a website feel instantly professional?",
    createdAt: Date.now() - 86400000,
    options: [
      { id: "a", text: "Clean visual design", votes: 32 },
      { id: "b", text: "Fast performance", votes: 24 },
      { id: "c", text: "Great mobile UX", votes: 19 },
      { id: "d", text: "Useful interactions", votes: 13 }
    ]
  }
];

let polls = loadJSON(STORAGE_KEY, null) || seedPolls;
let votedPolls = loadJSON(VOTES_KEY, {});
let currentFilter = "all";

const pollGrid = document.getElementById("pollGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("createModal");
const createForm = document.getElementById("createForm");
const optionInputs = document.getElementById("optionInputs");
const toast = document.getElementById("toast");

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  localStorage.setItem(VOTES_KEY, JSON.stringify(votedPolls));
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function totalVotes(poll) {
  return poll.options.reduce((sum, option) => sum + option.votes, 0);
}

function formatDate(timestamp) {
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function getVisiblePolls() {
  const term = searchInput.value.trim().toLowerCase();
  return polls.filter(poll => {
    const matchesSearch = !term || poll.question.toLowerCase().includes(term) ||
      poll.options.some(option => option.text.toLowerCase().includes(term));
    const voted = Boolean(votedPolls[poll.id]);
    const matchesFilter = currentFilter === "all" ||
      (currentFilter === "voted" && voted) ||
      (currentFilter === "unvoted" && !voted);
    return matchesSearch && matchesFilter;
  });
}

function render() {
  const visible = getVisiblePolls();
  pollGrid.innerHTML = visible.map(renderPoll).join("");
  emptyState.classList.toggle("hidden", visible.length !== 0);

  document.getElementById("heroPollCount").textContent = polls.length;
  document.getElementById("heroTotalVotes").textContent = polls.reduce((sum, poll) => sum + totalVotes(poll), 0);

  document.querySelectorAll(".poll-card").forEach(card => {
    card.querySelectorAll(".option.clickable").forEach(option => {
      option.addEventListener("click", () => {
        const input = card.querySelector(`[name="poll-${card.dataset.id}"]`);
        input.value = option.dataset.option;
        card.querySelectorAll(".option").forEach(el => el.classList.remove("selected"));
        option.classList.add("selected");
      });
    });

    const voteBtn = card.querySelector(".vote-btn");
    if (voteBtn) voteBtn.addEventListener("click", () => submitVote(card.dataset.id));
  });
}

function renderPoll(poll) {
  const total = totalVotes(poll);
  const hasVoted = Boolean(votedPolls[poll.id]);

  const options = poll.options.map(option => {
    const percent = total ? Math.round((option.votes / total) * 100) : 0;
    return `
      <div class="option ${hasVoted ? "" : "clickable"}" data-option="${escapeHTML(option.id)}" role="${hasVoted ? "img" : "button"}" tabindex="${hasVoted ? "-1" : "0"}">
        <div class="bar-fill" style="width:${percent}%"></div>
        <div class="option-row">
          <span class="option-name">${escapeHTML(option.text)}</span>
          <span class="option-percent">${percent}%</span>
        </div>
      </div>`;
  }).join("");

  return `
    <article class="poll-card" data-id="${escapeHTML(poll.id)}">
      <div class="poll-card-head">
        <span class="poll-tag">POLL</span>
        ${hasVoted ? '<span class="voted-badge">✓ VOTED</span>' : ""}
      </div>
      <h3>${escapeHTML(poll.question)}</h3>
      <div class="poll-meta">${formatDate(poll.createdAt)} · ${total} ${total === 1 ? "vote" : "votes"}</div>
      ${options}
      <div class="poll-footer">
        <span class="vote-count">${hasVoted ? "Results shown live" : "Select an option to vote once"}</span>
        <input type="hidden" name="poll-${escapeHTML(poll.id)}" value="">
        <button class="vote-btn" type="button" ${hasVoted ? "disabled" : ""}>${hasVoted ? "Vote recorded" : "Cast vote"}</button>
      </div>
    </article>`;
}

function submitVote(pollId) {
  if (votedPolls[pollId]) return;
  const card = document.querySelector(`.poll-card[data-id="${CSS.escape(pollId)}"]`);
  const selected = card?.querySelector(`[name="poll-${CSS.escape(pollId)}"]`)?.value;
  if (!selected) {
    showToast("Choose an option first.");
    return;
  }

  const poll = polls.find(item => item.id === pollId);
  const option = poll?.options.find(item => item.id === selected);
  if (!option) return;

  option.votes += 1;
  votedPolls[pollId] = selected;
  saveState();
  render();
  showToast("Vote recorded — results updated!");
}

function addOptionInput(value = "") {
  const row = document.createElement("div");
  row.className = "option-input-row";
  row.innerHTML = `
    <input class="option-edit" maxlength="80" required placeholder="Answer option" value="${escapeHTML(value)}">
    <button class="remove-option" type="button" aria-label="Remove option">×</button>`;
  row.querySelector(".remove-option").addEventListener("click", () => {
    if (optionInputs.children.length > 2) row.remove();
    else showToast("A poll needs at least two options.");
  });
  optionInputs.appendChild(row);
}

function openModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("questionInput").focus(), 50);
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function resetForm() {
  createForm.reset();
  optionInputs.innerHTML = "";
  addOptionInput();
  addOptionInput();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.getElementById("openCreateBtn").addEventListener("click", openModal);
document.getElementById("heroCreateBtn").addEventListener("click", openModal);
document.getElementById("emptyCreateBtn").addEventListener("click", openModal);
document.getElementById("closeCreateBtn").addEventListener("click", closeModal);
document.getElementById("cancelCreateBtn").addEventListener("click", closeModal);
document.getElementById("addOptionBtn").addEventListener("click", () => addOptionInput());

document.getElementById("scrollPollsBtn").addEventListener("click", () => {
  document.getElementById("polls").scrollIntoView({ behavior: "smooth" });
});

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

createForm.addEventListener("submit", event => {
  event.preventDefault();
  const question = document.getElementById("questionInput").value.trim();
  const optionTexts = [...document.querySelectorAll(".option-edit")]
    .map(input => input.value.trim())
    .filter(Boolean);

  const uniqueOptions = [...new Set(optionTexts.map(text => text.toLowerCase()))];
  if (uniqueOptions.length < 2) {
    showToast("Add at least two different options.");
    return;
  }

  const poll = {
    id: `poll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question,
    createdAt: Date.now(),
    options: optionTexts.map((text, index) => ({
      id: `${index}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      votes: 0
    }))
  };

  polls.unshift(poll);
  saveState();
  resetForm();
  closeModal();
  currentFilter = "all";
  document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === "all"));
  searchInput.value = "";
  render();
  document.getElementById("polls").scrollIntoView({ behavior: "smooth" });
  showToast("Poll published successfully!");
});

searchInput.addEventListener("input", render);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn === button));
    render();
  });
});

resetForm();
render();
