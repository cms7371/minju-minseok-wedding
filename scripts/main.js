import { invitation } from "./config.js?v=20260603-gallery-4col-1";

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

let galleryImages = [];
let activeGalleryIndex = 0;

const contactGroups = [
  {
    title: "신랑측",
    members: [
      { key: "groom", label: "신랑", name: invitation.couple.groomFull },
      { key: "groomFather", label: "아버지", name: "채규필" },
      { key: "groomMother", label: "어머니", name: "박미화" },
    ],
  },
  {
    title: "신부측",
    members: [
      { key: "bride", label: "신부", name: invitation.couple.brideFull },
      { key: "brideFather", label: "아버지", name: "김일회" },
      { key: "brideMother", label: "어머니", name: "이의진" },
    ],
  },
];

const icons = {
  copy: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8.5A2.5 2.5 0 0 1 10.5 6h7A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-7A2.5 2.5 0 0 1 8 15.5v-7Z"></path>
      <path d="M5 14.5V6.8A1.8 1.8 0 0 1 6.8 5h7.7"></path>
    </svg>
  `,
  phone: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.7 4.8 8.9 4a1.6 1.6 0 0 1 2 .9l1 2.4a1.6 1.6 0 0 1-.4 1.8l-1.2 1.1a9.2 9.2 0 0 0 4.5 4.5l1.1-1.2a1.6 1.6 0 0 1 1.8-.4l2.4 1a1.6 1.6 0 0 1 .9 2l-.8 2.2a2.2 2.2 0 0 1-2.3 1.5C9.9 19.3 4.7 14.1 4.2 6.1a2.2 2.2 0 0 1 1.5-2.3Z"></path>
    </svg>
  `,
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

function renderContacts() {
  const list = $('[data-list="contacts"]');
  if (!list) return;
  list.innerHTML = "";

  contactGroups.forEach((group, index) => {
    const panelId = `contact-panel-${index}`;
    const groupNode = document.createElement("section");
    groupNode.className = "contact-group";
    groupNode.innerHTML = `
      <button class="contact-group__toggle" type="button" aria-expanded="false" aria-controls="${panelId}" data-action="toggleContactGroup">
        <span>${group.title} 연락처 확인하기</span>
        <span class="contact-group__mark" aria-hidden="true">+</span>
      </button>
      <div class="contact-group__panel" id="${panelId}"></div>
    `;
    const panel = $(".contact-group__panel", groupNode);

    group.members.forEach((entry) => {
      const phone = invitation.contacts[entry.key];
      if (!phone) return;

      const item = document.createElement("div");
      item.className = "contact-item";
      item.innerHTML = `
        <span class="contact-item__role">${entry.label}</span>
        <strong>${entry.name}</strong>
        <span class="contact-item__phone">${phone}</span>
        <div class="contact-item__actions">
          <button class="contact-icon-button" type="button" data-copy-phone="${phone}" aria-label="${entry.label} 번호 복사">
            ${icons.copy}
          </button>
          <a class="contact-icon-button" href="tel:${phone.replaceAll("-", "")}" aria-label="${entry.label}에게 전화">
            ${icons.phone}
          </a>
        </div>
      `;
      panel.append(item);
    });

    list.append(groupNode);
  });
}

function renderGallery() {
  const list = $('[data-list="gallery"]');
  if (!list) return;
  list.innerHTML = "";
  galleryImages = getGalleryImages();

  galleryImages.forEach((image, index) => {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";
    button.dataset.galleryIndex = String(index);
    button.setAttribute("aria-label", `${image.alt} 크게 보기`);

    const img = document.createElement("img");
    img.src = image.thumbnail;
    if (image.width) img.width = image.width;
    if (image.height) img.height = image.height;
    img.alt = image.alt;
    img.loading = "lazy";
    button.append(img);
    list.append(button);
  });
}

function getGalleryImages() {
  const gallery = invitation.gallery;
  if (!gallery?.count) return [];

  const host = getGalleryHost();
  if (!host) return [];

  const baseUrl = [host, gallery.path].filter(Boolean).join("/");
  return Array.from({ length: gallery.count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      src: `${baseUrl}/gallery-${number}.webp`,
      thumbnail: `${baseUrl}/gallery-${number}-thumb.webp`,
      alt: `웨딩 갤러리 사진 ${index + 1}`,
    };
  });
}

function getGalleryHost() {
  const queryHost = new URLSearchParams(location.search).get("galleryHost")?.trim();
  const localHost = getLocalGalleryHost();
  return stripTrailingSlash(queryHost || localHost || invitation.gallery.productionHost);
}

function getLocalGalleryHost() {
  try {
    return localStorage.getItem("weddingGalleryHost")?.trim() || "";
  } catch {
    return "";
  }
}

function stripTrailingSlash(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

function renderMap() {
  const map = $("[data-map-embed]");
  const list = $('[data-list="mapLinks"]');
  if (!map || !list) return;

  const { latitude, longitude, venue, address } = invitation.wedding;
  const name = `${venue} ${invitation.wedding.hall}`;
  const encodedName = encodeURIComponent(name);
  const lat = Number(latitude);
  const lng = Number(longitude);

  renderNaverMap(map, lat, lng);

  const links = [
    {
      label: "티맵",
      icon: "assets/map/tmap.png",
      href: `tmap://route?goalname=${encodedName}&goalx=${lng}&goaly=${lat}`,
    },
    {
      label: "카카오내비",
      icon: "assets/map/kakao-navi.png",
      href: `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`,
    },
    {
      label: "네이버지도",
      icon: "assets/map/naver-map.png",
      href: "https://naver.me/xl0D3i0o",
    },
    {
      label: "카카오맵",
      icon: "assets/map/kakao-map.png",
      href: "https://place.map.kakao.com/404070599",
    },
  ];

  list.innerHTML = "";
  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "map-link";
    anchor.href = link.href;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.innerHTML = `
      <span class="map-link__icon" aria-hidden="true">
        <img src="${link.icon}" alt="" loading="lazy" />
      </span>
      <span>${link.label}</span>
    `;
    list.append(anchor);
  });
}

async function renderNaverMap(root, lat, lng) {
  try {
    await loadNaverMapScript();
    const position = new window.naver.maps.LatLng(lat, lng);
    const map = new window.naver.maps.Map(root, {
      center: position,
      zoom: 16,
      minZoom: 13,
      scaleControl: false,
      mapDataControl: false,
      logoControlOptions: {
        position: window.naver.maps.Position.BOTTOM_LEFT,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
        style: window.naver.maps.ZoomControlStyle.SMALL,
      },
    });

    const marker = new window.naver.maps.Marker({
      map,
      position,
      title: invitation.wedding.venue,
    });

    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div class="map-info-window">
          <strong>${invitation.wedding.venue}</strong>
          <span>${invitation.wedding.hall}</span>
        </div>
      `,
      borderWidth: 0,
      disableAnchor: true,
      backgroundColor: "transparent",
      pixelOffset: new window.naver.maps.Point(0, -12),
    });
    infoWindow.open(map, marker);
  } catch {
    root.classList.add("naver-map--error");
    root.textContent = "지도를 불러오지 못했습니다.";
  }
}

function loadNaverMapScript() {
  if (window.naver?.maps) return Promise.resolve();

  const existing = document.querySelector("[data-naver-map-script]");
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.dataset.naverMapScript = "true";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(invitation.wedding.naverMapClientId)}`;
    script.async = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.append(script);
  });
}

function renderCalendar() {
  const root = $("[data-calendar]");
  if (!root) return;

  const year = date.getFullYear();
  const month = date.getMonth();
  const targetDay = date.getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const timeText = `${date.getHours() < 12 ? "오전" : "오후"} ${date.getHours() % 12 || 12}시`;

  root.innerHTML = "";

  const header = document.createElement("div");
  header.className = "calendar-card__header";
  header.innerHTML = `
    <strong>${year}년 ${month + 1}월</strong>
    <span>${timeText}</span>
  `;
  root.append(header);

  const grid = document.createElement("div");
  grid.className = "calendar-card__grid";
  weekdays.forEach((weekday) => {
    const cell = document.createElement("span");
    cell.className = "calendar-card__weekday";
    cell.textContent = weekday;
    grid.append(cell);
  });

  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  for (let index = 0; index < totalCells; index++) {
    const day = index - firstWeekday + 1;
    const cell = document.createElement("span");
    cell.className = "calendar-card__day";
    if (day < 1 || day > daysInMonth) {
      cell.classList.add("calendar-card__day--empty");
      cell.setAttribute("aria-hidden", "true");
    } else {
      cell.textContent = String(day);
      if (day === targetDay) {
        cell.classList.add("calendar-card__day--wedding");
        cell.setAttribute("aria-label", `${day}일 예식일`);
      }
    }
    grid.append(cell);
  }

  root.append(grid);

  const footer = document.createElement("p");
  footer.className = "calendar-card__time-left";
  footer.textContent = makeTimeLeft(date);
  root.append(footer);
}

function wireActions() {
  $('[data-action="copyAddress"]').addEventListener("click", (event) => {
    event.preventDefault();
    copyText(invitation.wedding.address);
  });
  $('[data-action="toggleAccounts"]').addEventListener("click", (event) => {
    toggleList(event.currentTarget, $('[data-list="accounts"]'));
  });
  $$('[data-action="toggleContactGroup"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      const panel = document.getElementById(event.currentTarget.getAttribute("aria-controls"));
      toggleContactGroup(event.currentTarget, panel);
    });
  });

  $$("[data-copy-phone]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copyPhone));
  });

  $$("[data-gallery-index]").forEach((button) => {
    button.addEventListener("click", () => openGallery(Number(button.dataset.galleryIndex)));
  });
  $('[data-action="closeGallery"]')?.addEventListener("click", closeGallery);
  $('[data-action="prevGallery"]')?.addEventListener("click", () => moveGallery(-1));
  $('[data-action="nextGallery"]')?.addEventListener("click", () => moveGallery(1));
  $('[data-gallery-lightbox]')?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeGallery();
  });
  document.addEventListener("keydown", (event) => {
    const lightbox = $("[data-gallery-lightbox]");
    if (!lightbox || lightbox.hidden) return;
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") moveGallery(-1);
    if (event.key === "ArrowRight") moveGallery(1);
  });
}

function openGallery(index) {
  if (!galleryImages.length) return;
  activeGalleryIndex = index;
  updateGalleryLightbox();
  const lightbox = $("[data-gallery-lightbox]");
  lightbox.hidden = false;
  document.body.classList.add("is-gallery-open");
}

function closeGallery() {
  const lightbox = $("[data-gallery-lightbox]");
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove("is-gallery-open");
}

function moveGallery(offset) {
  if (!galleryImages.length) return;
  activeGalleryIndex = (activeGalleryIndex + offset + galleryImages.length) % galleryImages.length;
  updateGalleryLightbox();
}

function updateGalleryLightbox() {
  const image = galleryImages[activeGalleryIndex];
  const img = $("[data-gallery-lightbox-image]");
  const caption = $("[data-gallery-lightbox-caption]");
  img.src = image.src;
  img.alt = image.alt;
  caption.textContent = `${activeGalleryIndex + 1} / ${galleryImages.length}`;
}

function toggleList(button, list, collapsedText, expandedText) {
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  button.lastElementChild.textContent = expanded ? "+" : "-";
  if (collapsedText && expandedText) {
    button.firstElementChild.textContent = expanded ? collapsedText : expandedText;
  }
  list.hidden = expanded;
}

function toggleContactGroup(button, panel) {
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  $(".contact-group__mark", button).textContent = expanded ? "+" : "-";

  if (expanded) {
    panel.style.maxHeight = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.maxHeight = "0px";
      panel.dataset.open = "false";
    });
    return;
  }

  panel.dataset.open = "true";
  panel.style.maxHeight = `${panel.scrollHeight}px`;
}

function makeTimeLeft(targetDate) {
  const diff = targetDate.getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days > 0) return `예식까지 ${days.toLocaleString("ko-KR")}일 남았습니다.`;
  if (days === 0) return "오늘 결혼합니다.";
  return "함께해 주셔서 감사합니다.";
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  showToast("복사했습니다.");
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
renderContacts();
renderGallery();
renderMap();
renderCalendar();
wireActions();
