/* ============================================================
   Sell.do CRM — push a website enquiry into the CRM (client-side).
   Uses a GET beacon to the create-lead endpoint (no CORS preflight).
   Config (API key + default SRD) lives in selldo-config.js.
   ============================================================ */
window.iDreamSellDoPush = function (data) {
  var cfg = window.IDREAM_SELLDO || {};
  if (!cfg.apiKey) { console.warn("Sell.do: apiKey missing (selldo-config.js)"); return; }
  var qp = [];
  var add = function (k, v) { if (v != null && String(v) !== "") qp.push(encodeURIComponent(k) + "=" + encodeURIComponent(v)); };
  add("sell_do[form][lead][name]",  data.name);
  add("sell_do[form][lead][email]", data.email);
  add("sell_do[form][lead][phone]", data.phone);
  add("sell_do[form][note][content]", data.message);
  add("sell_do[campaign][srd]", data.srd || cfg.srd || "");
  add("api_key", cfg.apiKey);
  var url = "https://app.sell.do/api/leads/create?" + qp.join("&");
  try {
    fetch(url, { method: "GET", mode: "no-cors", keepalive: true }).catch(function () { new Image().src = url; });
  } catch (e) { new Image().src = url; }
};

/* ============================================================
   iDream Group — Luxury Estates interactions
   ============================================================ */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
  };
  navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) { setTimeout(() => e.target.classList.add("in"), (i % 3) * 100); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  /* ---------- Count-up ---------- */
  const counters = $$("[data-count]");
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const decimals = (String(el.dataset.count).split(".")[1] || "").length;
    let start = null;
    const tick = (now) => {
      if (!start) start = now;
      const p = Math.min((now - start) / 1800, 1);
      const val = target * easeOut(p);
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else counters.forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || "")));

  /* ---------- Property slider ---------- */
  (function slider() {
    const track = $("#sliderTrack");
    if (!track) return;
    const slides = $$(".slide", track);
    const dotsWrap = $("#dots");
    let idx = 0, timer;

    slides.forEach((_, i) => {
      const b = document.createElement("button");
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = $$("button", dotsWrap);

    const go = (n, manual) => {
      idx = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      if (manual) restart();
    };
    const next = () => go(idx + 1);
    const prev = () => go(idx - 1);
    $("#next").addEventListener("click", () => go(idx + 1, true));
    $("#prev").addEventListener("click", () => go(idx - 1, true));

    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(next, 6000); };
    restart();
    $("#slider").addEventListener("mouseenter", () => clearInterval(timer));
    $("#slider").addEventListener("mouseleave", restart);
  })();

  /* ---------- Gallery filter + lightbox ---------- */
  (function gallery() {
    const grid = $("#galleryGrid");
    if (!grid) return;
    const tiles = $$(".gtile", grid);
    $$("#filters .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$("#filters .chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const f = chip.dataset.filter;
        tiles.forEach((t) => t.classList.toggle("hide", f !== "all" && t.dataset.cat !== f));
      });
    });

    const lb = $("#lightbox"), lbImg = $("#lbImg");
    tiles.forEach((t) => t.addEventListener("click", () => {
      lbImg.src = t.dataset.img;
      lbImg.alt = $("figcaption", t)?.textContent || "";
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    }));
    const close = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); lbImg.src = ""; };
    $("#lbClose").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  })();

  /* ---------- Investment calculator ---------- */
  (function calc() {
    const price = $("#price"), down = $("#down"), years = $("#years"), growth = $("#growth");
    if (!price) return;
    const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

    const update = () => {
      const P = +price.value, D = +down.value, Y = +years.value, G = +growth.value / 100;
      $("#priceOut").textContent = usd(P);
      $("#downOut").textContent = D + "%";
      $("#yearsOut").textContent = Y + (Y === 1 ? " year" : " years");
      $("#growthOut").textContent = (G * 100) + "%";

      const future = P * Math.pow(1 + G, Y);
      const gain = future - P;
      const rentalYield = P * 0.05; // ~5% indicative gross annual yield

      $("#resValue").textContent = usd(future);
      $("#resGain").textContent = "+" + usd(gain);
      $("#resYield").textContent = usd(rentalYield);
    };
    [price, down, years, growth].forEach((el) => el.addEventListener("input", update));
    update();
  })();

  /* ---------- Testimonials carousel (handled by shared module) ---------- */
  (function voices() {
    const track = null; // disabled: shared clients carousel manages #voicesTrack
    if (!track) return;
    const items = $$(".voice", track);
    const dotsWrap = $("#vDots");
    let idx = 0, timer;
    items.forEach((_, i) => {
      const b = document.createElement("button");
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = $$("button", dotsWrap);
    const go = (n, manual) => {
      idx = (n + items.length) % items.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      if (manual) restart();
    };
    $("#vNext").addEventListener("click", () => go(idx + 1, true));
    $("#vPrev").addEventListener("click", () => go(idx - 1, true));
    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(idx + 1), 7000); };
    restart();
  })();
})();

/* ============================================================
   iDream Groups — shared sections (hero slider, clients
   carousel, contact form). Self-contained IIFE.
   ============================================================ */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hero slider */
  (function heroSlider() {
    const slides = Array.from(document.querySelectorAll(".hero__slide"));
    const dotsWrap = document.getElementById("heroDots");
    if (!slides.length || !dotsWrap) return;
    let idx = 0, timer;
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);
    const go = (n, manual) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      if (manual) restart();
    };
    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(idx + 1), 3500); };
    const nx = document.getElementById("heroNext"), pv = document.getElementById("heroPrev");
    if (nx) nx.addEventListener("click", () => go(idx + 1, true));
    if (pv) pv.addEventListener("click", () => go(idx - 1, true));

    /* Swipe to change slides on touch devices. CSS sets touch-action: pan-y on the
       stage, so vertical page scrolling still works while we handle the horizontal. */
    // Listen on the .hero section, not .hero__slider — the slider sits at z-index:-2
    // and won't reliably receive touches.
    const stage = document.getElementById("hero") || slides[0].parentElement;
    const SWIPE_MIN = 45; // px of horizontal travel before it counts as a swipe
    let x0 = null, y0 = null;
    stage.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      x0 = t.clientX; y0 = t.clientY;
      clearInterval(timer); // hold autoplay while the finger is down
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      // horizontal intent only — ignore vertical scrolls and taps
      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? idx + 1 : idx - 1, true);
      else restart();
      x0 = y0 = null;
    }, { passive: true });
    stage.addEventListener("touchcancel", () => { x0 = y0 = null; restart(); }, { passive: true });

    restart();
  })();

  /* Clients carousel */
  (function voices() {
    const track = document.getElementById("voicesTrack");
    if (!track) return;
    const testimonials = [
      { img: "assets/testimonial-1.jpg", quote: "iDream is the most trustworthy builder we have come across. From our very first site visit to registration, the team was honest, friendly, and transparent at every step. Our family finally has a home we are proud of!", name: "Karthikeyan R.", role: "Happy Homeowner, Chennai" },
      { img: "assets/testimonial-2.jpg", quote: "What made us choose iDream was their authentic DTCP approval and clear documentation. No hidden charges, no surprises. We felt safe and satisfied from day one. Truly the most reliable builder in Madurai.", name: "Priya Senthil", role: "Satisfied Homeowner, Madurai" },
      { img: "assets/testimonial-3.jpg", quote: "They delivered exactly what they promised \u2014 on time, top quality, and a beautifully planned neighbourhood. Our kids love the community and we feel so happy we trusted iDream with our biggest investment.", name: "Mohammed Ashiq", role: "Happy Family, Tondiarpet" },
      { img: "assets/testimonial-1.jpg", quote: "The iDream team is like family! They kept us updated at every step, helped us with our home loan, and even after handover they are just one call away. This is what reliable, friendly service looks like.", name: "Lakshmi Narayanan", role: "Satisfied Customer, Royapuram" },
      { img: "assets/testimonial-2.jpg", quote: "We visited five developers before choosing iDream Vistara. The honest pricing, the neighbourhood, the on-time completion promise \u2014 they stood out as the most trustworthy option. Best decision our family ever made.", name: "Deepa Ramesh", role: "Happy Homeowner, Madurai" },
      { img: "assets/testimonial-3.jpg", quote: "My parents bought their plot from iDream five years ago and they are still happy with the community. The property value has grown beautifully. Now I have booked my own plot too \u2014 that is how much our family trusts this builder!", name: "Suresh Kumar V.", role: "2nd Generation Customer, Chennai" },
    ];
    var html = "";
    testimonials.forEach(function(t) {
      html += '<blockquote class="voice"><div class="voice__card"><div class="voice__inner">' +
        '<span class="voice__mark" aria-hidden="true">\u201C</span>' +
        '<div class="voice__stars" aria-label="Rated 5 out of 5">\u2605\u2605\u2605\u2605\u2605</div>' +
        '<p class="voice__quote">' + t.quote + '</p>' +
        '<div class="voice__who"><img src="' + t.img + '" alt="' + t.name + '" />' +
        '<span><strong>' + t.name + '</strong><small>' + t.role + '</small></span></div>' +
        '</div></div></blockquote>';
    });
    track.innerHTML = html;
    const items = Array.from(track.children);
    const dotsWrap = document.getElementById("vDots");
    let idx = 0, timer;
    items.forEach((_, i) => {
      const b = document.createElement("button");
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);
    const go = (n, manual) => {
      idx = (n + items.length) % items.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      if (manual) restart();
    };
    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(idx + 1), 6000); };
    const nx = document.getElementById("vNext"), pv = document.getElementById("vPrev");
    if (nx) nx.addEventListener("click", () => go(idx + 1, true));
    if (pv) pv.addEventListener("click", () => go(idx - 1, true));
    restart();
  })();

  /* Contact / enquiry forms — push the lead into Sell.do CRM */
  (function contactForms() {
    const forms = Array.from(document.querySelectorAll("form.contact__form, form#contactForm"));
    if (!forms.length) return;

    forms.forEach((form) => {
      let status = form.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        form.appendChild(status);
      }
      const legacyThanks = form.querySelector(".contact__thanks");
      const val = (n) => { const el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const consent = form.querySelector('input[name="consent"]');
        if (!form.checkValidity() || (consent && !consent.checked)) {
          if (consent && !consent.checked) {
            status.textContent = "Please tick the consent box so we can contact you back.";
            status.className = "form-status show is-error";
          }
          form.reportValidity();
          return;
        }

        window.iDreamSellDoPush({
          name: val("name"), email: val("email"), phone: val("phone"),
          message: val("message") || ("Website enquiry — " + document.title)
        });

        status.className = "form-status show is-ok";
        status.textContent = "Thank you! Our team will get back to you shortly.";
        if (legacyThanks) legacyThanks.classList.add("show");
        form.querySelectorAll("input, textarea").forEach((el) => {
          if (el.type === "checkbox") el.checked = false; else el.value = "";
        });
      });
    });
  })();

  /* Projects tabs */
  (function projectTabs() {
    const tabs = Array.from(document.querySelectorAll(".ptab"));
    const panels = Array.from(document.querySelectorAll(".projects__panel"));
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));
      });
    });
  })();

  /* Insights marquee — seamless auto-scroll */
  (function insightsMarquee() {
    const track = document.getElementById("insightsTrack");
    if (!track) return;
    if (reduceMotion) { track.classList.add("insights__track--static"); return; }
    track.innerHTML += track.innerHTML; // duplicate for seamless -50% loop
  })();

  /* Businesses 3D carousel */
  (function biz3d() {
    const wrap = document.getElementById("biz3d");
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll(".bizcard"));
    const dots = Array.from(document.querySelectorAll("#biz3dDots button"));
    const positions = ["biz--center", "biz--right", "biz--left"];
    let idx = 0, timer;

    const place = () => {
      cards.forEach((c, i) => {
        c.classList.remove("biz--center", "biz--left", "biz--right");
        const offset = (i - idx + cards.length) % cards.length;
        c.classList.add(positions[offset]);
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    };

    const go = (n, manual) => {
      idx = (n + cards.length) % cards.length;
      place();
      if (manual) restart();
    };

    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(idx + 1), 3500); };

    dots.forEach((d, i) => d.addEventListener("click", () => go(i, true)));
    cards.forEach((c) => c.addEventListener("click", () => {
      if (!c.classList.contains("biz--center")) go(+c.dataset.biz, true);
    }));

    wrap.addEventListener("mouseenter", () => clearInterval(timer));
    wrap.addEventListener("mouseleave", restart);

    place();
    restart();
  })();

  /* FAQ accordion — open one at a time */
  (function faq() {
    const items = Array.from(document.querySelectorAll(".faq__item"));
    if (!items.length) return;
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  })();
})();

/* ============================================================
   Lead-capture popup — opens after 10s on page, once per visit.
   Injected from JS so every page gets it without markup changes.
   ============================================================ */
(function leadPopup() {
  "use strict";
  var DELAY = 10000;                 // 10 seconds on page
  var SEEN = "idreamLeadSeen";       // once per browser session
  var DONE = "idreamLeadDone";       // don't re-ask someone who submitted

  try {
    if (sessionStorage.getItem(SEEN) || localStorage.getItem(DONE)) return;
  } catch (e) { /* storage blocked — still show once */ }

  var wrap = document.createElement("div");
  wrap.className = "lead";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-label", "Request a callback");
  wrap.innerHTML =
    '<div class="lead__card">' +
      '<button class="lead__close" aria-label="Close">&times;</button>' +
      '<h3>Looking for your <span class="serif-italic">dream property</span>?</h3>' +
      '<p>Leave your details and our team will call you back with the best options.</p>' +
      '<form class="lead__form" novalidate>' +
        '<input type="text" name="name" placeholder="Your Name" required />' +
        '<input type="tel" name="phone" placeholder="Your Phone Number" required />' +
        '<label class="consent"><input type="checkbox" name="consent" required />' +
          '<span>I authorize <strong>iDream Properties</strong> &amp; its representatives to contact me via ' +
          'Email / SMS / WhatsApp / Call. This overrides DND / NDNC. ' +
          '<a href="privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>' +
        '<span class="lead__err"></span>' +
        '<button type="submit" class="btn btn--solid">Request Callback</button>' +
      '</form>' +
      '<p class="lead__thanks">Thank you! Our team will call you shortly.</p>' +
    '</div>';
  document.body.appendChild(wrap);

  var form  = wrap.querySelector(".lead__form");
  var err   = wrap.querySelector(".lead__err");
  var close = wrap.querySelector(".lead__close");

  function open() {
    wrap.classList.add("open");
    document.body.classList.add("lead-open");
    try { sessionStorage.setItem(SEEN, "1"); } catch (e) {}
  }
  function hide() {
    wrap.classList.remove("open");
    document.body.classList.remove("lead-open");
  }

  var timer = setTimeout(open, DELAY);

  close.addEventListener("click", hide);
  wrap.addEventListener("click", function (e) { if (e.target === wrap) hide(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && wrap.classList.contains("open")) hide();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name  = form.name.value.trim();
    var phone = form.phone.value.replace(/\D/g, "");   // digits only
    var consent = form.querySelector('input[name="consent"]');

    if (name.length < 2)  { err.textContent = "Please enter your name.";                err.classList.add("show"); return; }
    if (phone.length < 10) { err.textContent = "Please enter a valid 10-digit number.";  err.classList.add("show"); return; }
    if (consent && !consent.checked) { err.textContent = "Please tick the consent box so we can call you back."; err.classList.add("show"); return; }
    err.classList.remove("show");

    // Push the callback request into Sell.do CRM.
    window.iDreamSellDoPush({
      name: name, phone: phone, email: "",
      message: "Callback request (popup) — " + document.title
    });

    try { localStorage.setItem(DONE, "1"); } catch (e2) {}
    wrap.classList.add("done");
    setTimeout(hide, 2500);
  });

  window.addEventListener("pagehide", function () { clearTimeout(timer); });
})();

/* ============================================================
   Project page photo marquee — seamless auto-scroll.
   Duplicates the track so the -50% loop has no visible seam.
   ============================================================ */
(function pdMarquee() {
  "use strict";
  var track = document.getElementById("pdMarqueeTrack");
  if (!track) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    track.classList.add("pdmarquee__track--static");
    return;
  }
  track.innerHTML += track.innerHTML;
  // pace the scroll to the number of slides so speed feels constant across projects
  var shots = track.children.length / 2;
  track.style.animationDuration = Math.max(18, shots * 4.5) + "s";
})();

/* ============================================================
   Enquire button -> enquiry popup (with close X).
   If the current page already has an inline enquiry form,
   the Enquire button scrolls to it instead of opening a popup.
   ============================================================ */
(function enquiryPopup() {
  "use strict";
  var triggers = Array.prototype.slice.call(document.querySelectorAll(".nav__cta"));
  if (!triggers.length) return;

  // Build the popup modal (reuses the .lead modal styling)
  var wrap = document.createElement("div");
  wrap.className = "lead";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-label", "Submit an enquiry");
  wrap.innerHTML =
    '<div class="lead__card">' +
      '<button class="lead__close" aria-label="Close">&times;</button>' +
      '<h3>Submit an <span class="serif-italic">enquiry</span></h3>' +
      '<p>Share your details and our team will get back to you shortly.</p>' +
      '<form class="contact__form lead__form" novalidate>' +
        '<input type="text" name="name" placeholder="Your Name" required />' +
        '<input type="email" name="email" placeholder="Your Email" required />' +
        '<input type="tel" name="phone" placeholder="Your Phone Number" required />' +
        '<textarea name="message" rows="3" placeholder="Your Message (optional)"></textarea>' +
        '<label class="consent"><input type="checkbox" name="consent" required />' +
          '<span>I authorize <strong>iDream Properties</strong> &amp; its representatives to contact me with ' +
          'updates and notifications via Email / SMS / WhatsApp / Call. This will override DND / NDNC. ' +
          '<a href="privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>' +
        '<button type="submit" class="btn btn--solid">Submit Enquiry</button>' +
        '<p class="form-status"></p>' +
      '</form>' +
    '</div>';
  document.body.appendChild(wrap);

  var form   = wrap.querySelector("form");
  var status = wrap.querySelector(".form-status");
  var closeB = wrap.querySelector(".lead__close");

  function open() { wrap.classList.add("open"); document.body.classList.add("lead-open");
    setTimeout(function () { form.name.focus(); }, 300); }
  function hide() { wrap.classList.remove("open"); document.body.classList.remove("lead-open"); }

  closeB.addEventListener("click", hide);
  wrap.addEventListener("click", function (e) { if (e.target === wrap) hide(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && wrap.classList.contains("open")) hide();
  });

  // Wire the Enquire buttons — always open the enquiry popup
  triggers.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  });

  // Submit -> push the lead into Sell.do CRM
  var val = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var consent = form.querySelector('input[name="consent"]');
    if (!form.checkValidity() || (consent && !consent.checked)) {
      if (consent && !consent.checked) { status.textContent = "Please tick the consent box so we can contact you back."; status.className = "form-status show is-error"; }
      form.reportValidity();
      return;
    }
    window.iDreamSellDoPush({
      name: val("name"), email: val("email"), phone: val("phone"),
      message: val("message") || ("Enquiry popup — " + document.title)
    });
    status.className = "form-status show is-ok";
    status.textContent = "Thank you! Our team will get back to you shortly.";
    form.querySelectorAll("input, textarea").forEach(function (el) { if (el.type === "checkbox") el.checked = false; else el.value = ""; });
    setTimeout(hide, 2500);
  });
})();
