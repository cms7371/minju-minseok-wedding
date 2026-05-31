import { invitation } from "./config.js?v=20260601-fiona-date";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const date = new Date(invitation.wedding.dateISO);
const heroMonthDay = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
}).format(date).replace("/", ". ");
const heroTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(date).replace(" ", " ");
const formatDate = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const fieldMap = {
  groom: invitation.couple.groom,
  bride: invitation.couple.bride,
  groomUpper: invitation.couple.groomEnglish || invitation.couple.groomFull.toUpperCase(),
  brideUpper: invitation.couple.brideEnglish || invitation.couple.brideFull.toUpperCase(),
  groomParents: invitation.families.groomParents,
  brideParents: invitation.families.brideParents,
  dateText: invitation.wedding.dateText,
  venue: invitation.wedding.venue,
  hall: invitation.wedding.hall,
  address: invitation.wedding.address,
  addressDetail: invitation.wedding.addressDetail,
  transit: invitation.wedding.transit,
  venueLine: `${invitation.wedding.venue} ${invitation.wedding.hall}`,
  venueUpper: (invitation.wedding.venueEnglish || invitation.wedding.venue).toUpperCase(),
  heroYear: String(date.getFullYear()),
  heroDate: heroMonthDay,
  heroTime,
  calendarDate: formatDate.format(date),
  timeLeft: makeTimeLeft(date),
};

function renderFields() {
  $$("[data-field]").forEach((node) => {
    node.textContent = fieldMap[node.dataset.field] || "";
  });

  $$("[data-field-link]").forEach((node) => {
    node.href = invitation.wedding[node.dataset.fieldLink] || "#";
  });

  document.title = `${invitation.couple.groom} · ${invitation.couple.bride} 결혼식`;
  $('meta[property="og:title"]').content = document.title;
  $('meta[property="og:description"]').content = invitation.wedding.dateText;
}

function renderMessage() {
  const message = $('[data-list="message"]');
  message.innerHTML = "";
  invitation.message.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    message.append(p);
  });
}

function renderAccounts() {
  const list = $('[data-list="accounts"]');
  list.innerHTML = "";
  invitation.accounts.forEach((account) => {
    const item = document.createElement("div");
    item.className = "account-item";
    item.innerHTML = `
      <strong>${account.side}</strong>
      <p>${account.bank} ${account.number}</p>
      <p>예금주 ${account.holder}</p>
      <button class="button button--ghost" type="button">계좌 복사</button>
    `;
    $("button", item).addEventListener("click", () => {
      copyText(`${account.bank} ${account.number} ${account.holder}`);
    });
    list.append(item);
  });
}

function renderGallery() {
  const list = $('[data-list="gallery"]');
  if (!list) return;
  list.innerHTML = "";
  invitation.gallery.forEach((image) => {
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = "lazy";
    list.append(img);
  });
}

function wireActions() {
  $('[data-action="calendar"]').href = makeCalendarUrl();
  $('[data-action="share"]').addEventListener("click", shareInvitation);
  $('[data-action="copyAddress"]').addEventListener("click", (event) => {
    event.preventDefault();
    copyText(invitation.wedding.address);
  });
  $('[data-action="toggleAccounts"]').addEventListener("click", (event) => {
    const button = event.currentTarget;
    const list = $('[data-list="accounts"]');
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.lastElementChild.textContent = expanded ? "+" : "-";
    list.hidden = expanded;
  });

  Object.entries(invitation.contacts).forEach(([key, phone]) => {
    const link = $(`[data-call="${key}"]`);
    if (link) link.href = `tel:${phone.replaceAll("-", "")}`;
  });

  $(".rsvp-form").addEventListener("submit", submitRsvp);
  if (!invitation.rsvp.enabled) $("[data-rsvp]").hidden = true;
}

function makeTimeLeft(targetDate) {
  const diff = targetDate.getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days > 0) return `예식까지 ${days.toLocaleString("ko-KR")}일 남았습니다.`;
  if (days === 0) return "오늘 결혼합니다.";
  return "함께해 주셔서 감사합니다.";
}

function makeCalendarUrl() {
  const start = toGoogleDate(date);
  const end = toGoogleDate(new Date(date.getTime() + 2 * 60 * 60 * 1000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: invitation.wedding.calendarTitle,
    dates: `${start}/${end}`,
    location: `${invitation.wedding.venue} ${invitation.wedding.address}`,
    details: invitation.message.join("\n"),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function toGoogleDate(value) {
  return value.toISOString().replaceAll("-", "").replaceAll(":", "").replace(".000", "");
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  showToast("복사했습니다.");
}

async function shareInvitation() {
  const shareData = {
    title: document.title,
    text: invitation.wedding.dateText,
    url: location.href,
  };
  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await copyText(location.href);
  }
}

function submitRsvp(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const body = [
    `이름: ${data.name}`,
    `참석 여부: ${data.attendance}`,
    `동행 인원: ${data.guests || 0}`,
    `메모: ${data.memo || "-"}`,
  ].join("\n");

  if (invitation.rsvp.submitMode === "mailto") {
    const params = new URLSearchParams({
      subject: `[청첩장 RSVP] ${data.name}`,
      body,
    });
    location.href = `mailto:${invitation.rsvp.email}?${params}`;
    return;
  }

  showToast("RSVP 연동 방식이 필요합니다.");
}

let toastTimer;
function showToast(text) {
  const toast = $(".toast");
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

renderFields();
renderMessage();
renderAccounts();
renderGallery();
wireActions();
