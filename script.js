(function () {
  "use strict";

  function el(tag, opts) {
    const node = document.createElement(tag);
    if (opts) {
      if (opts.className) node.className = opts.className;
      if (opts.text != null) node.textContent = opts.text;
      if (opts.attrs) {
        for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
      }
    }
    return node;
  }

  function renderSkills(skills) {
    const list = document.getElementById("skills-list");
    list.innerHTML = "";
    (skills || []).forEach((s) => list.appendChild(el("li", { text: s })));
  }

  function renderCertificates(certs) {
    const grid = document.getElementById("cert-grid");
    grid.innerHTML = "";
    if (!certs || !certs.length) {
      grid.appendChild(el("div", { className: "cert-empty", text: "Credentials coming soon." }));
      return;
    }
    certs.forEach((c) => {
      const card = el("div", { className: "cert-card" });
      card.appendChild(el("div", { className: "cert-card__corner" }));

      const thumb = el("div", { className: "cert-card__thumb" });
      if (c.image) {
        thumb.style.backgroundImage = `url("${c.image}")`;
      } else {
        thumb.textContent = (c.issuer || c.title || "?").trim().charAt(0).toUpperCase();
      }
      card.appendChild(thumb);

      card.appendChild(el("h3", { className: "cert-card__title", text: c.title }));

      const metaText = [c.issuer, c.date].filter(Boolean).join(" \u00b7 ");
      card.appendChild(el("p", { className: "cert-card__meta", text: metaText }));

      if (c.url) {
        card.appendChild(
          el("a", {
            className: "cert-card__link",
            text: "View credential",
            attrs: { href: c.url, target: "_blank", rel: "noopener noreferrer" },
          })
        );
      }

      grid.appendChild(card);
    });
  }

  function renderContactLinks(email, socials) {
    const list = document.getElementById("contact-list");
    list.innerHTML = "";
    if (email) {
      const li = el("li");
      li.appendChild(el("a", { text: email, attrs: { href: `mailto:${email}` } }));
      list.appendChild(li);
    }
    (socials || []).forEach((s) => {
      const li = el("li");
      li.appendChild(el("a", { text: s.label, attrs: { href: s.url, target: "_blank", rel: "noopener noreferrer" } }));
      list.appendChild(li);
    });
  }

  function render(data) {
    document.title = `${data.name} \u2013 ${data.role}`;

    document.getElementById("nav-name").textContent = data.name || "";
    document.getElementById("nav-status").textContent = data.availability || "";

    document.getElementById("hero-role").textContent = data.role || "";
    document.getElementById("hero-name").textContent = data.name || "";
    document.getElementById("hero-tagline").textContent = data.tagline || "";
    document.getElementById("about-bio").textContent = data.bio || "";

    renderSkills(data.skills);
    renderCertificates(data.certificates);

    const contactText = document.getElementById("contact-text");
    contactText.textContent = data.location
      ? `Based in ${data.location}. Reach out at ${data.email || "the links below"} or through any of the channels below.`
      : `Reach out at ${data.email || "the links below"} or through any of the channels below.`;

    renderContactLinks(data.email, data.socials);

    document.getElementById("footer-name").textContent = data.name || "";
    document.getElementById("footer-location").textContent = data.location || "";
  }

  function renderError() {
    const bio = document.getElementById("about-bio");
    bio.textContent =
      "Could not load data.json. If you're opening this file directly, serve the folder with a local server (e.g. `python3 -m http.server`) so the browser can fetch it.";
  }

  fetch("data.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data.json");
      return res.json();
    })
    .then(render)
    .catch(renderError);
})();
