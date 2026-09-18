(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, opts) {
    const node = document.createElement(tag);
    if (opts) {
      if (opts.className) node.className = opts.className;
      if (opts.text != null) node.textContent = opts.text;
      if (opts.html != null) node.innerHTML = opts.html;
      if (opts.attrs) {
        for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
      }
    }
    return node;
  }

  function typeInto(node, text, speed, done) {
    if (prefersReducedMotion || !text) {
      node.textContent = text || "";
      if (done) done();
      return;
    }
    let i = 0;
    node.textContent = "";
    (function step() {
      if (i <= text.length) {
        node.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (done) {
        done();
      }
    })();
  }

  function renderSocials(socials) {
    const navSocials = document.getElementById("nav-socials");
    const contactLinks = document.getElementById("contact-links");
    navSocials.innerHTML = "";
    contactLinks.innerHTML = "";
    (socials || []).forEach((s) => {
      const li1 = el("li");
      const a1 = el("a", { text: s.label, attrs: { href: s.url } });
      li1.appendChild(a1);
      navSocials.appendChild(li1);

      const li2 = el("li");
      const a2 = el("a", { text: `${s.label} \u2013 ${s.url.replace(/^mailto:/, "")}`, attrs: { href: s.url } });
      li2.appendChild(a2);
      contactLinks.appendChild(li2);
    });
  }

  function renderManifest(stack) {
    const code = document.querySelector("#stack-manifest code");
    if (!code || !stack) return;

    function line(key, values, tone) {
      const items = (values || [])
        .map((v) => `<span class="tok-str${tone === "warn" ? " tok-str--warn" : ""}">"${escapeHtml(v)}"</span>`)
        .join('<span class="tok-punc">, </span>');
      return `<span class="tok-key">${escapeHtml(key)}</span><span class="tok-punc">: [</span>${items}<span class="tok-punc">]</span>`;
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[c]));
    }

    const lines = [
      line("languages", stack.languages, "signal"),
      line("focus", stack.focus, "warn"),
      line("tools", stack.tools, "signal"),
    ];
    code.innerHTML = lines.join("\n");
  }

  function renderProjects(projects) {
    const container = document.getElementById("projects-list");
    container.innerHTML = "";
    (projects || []).forEach((p) => {
      const entry = el("div", { className: "registry-entry" });

      const head = el("div", { className: "registry-entry__head" });
      head.appendChild(el("h3", { className: "registry-entry__name", text: p.name }));
      if (p.repo) {
        const repoLink = el("a", {
          className: "registry-entry__repo",
          text: "View repository",
          attrs: { href: p.repo, target: "_blank", rel: "noopener noreferrer" },
        });
        head.appendChild(repoLink);
      }
      entry.appendChild(head);

      if (p.description) {
        entry.appendChild(el("p", { className: "registry-entry__desc", text: p.description }));
      }

      if (p.stack && p.stack.length) {
        const tags = el("div", { className: "registry-entry__tags" });
        p.stack.forEach((t) => tags.appendChild(el("span", { className: "tag", text: t })));
        entry.appendChild(tags);
      }

      if (p.highlights && p.highlights.length) {
        const list = el("ul", { className: "registry-entry__highlights" });
        p.highlights.forEach((h) => list.appendChild(el("li", { text: h })));
        entry.appendChild(list);
      }

      container.appendChild(entry);
    });
  }

  function renderCertificates(certs) {
    const container = document.getElementById("certificates-list");
    container.innerHTML = "";
    if (!certs || !certs.length) {
      container.appendChild(
        el("li", { className: "cert-entry", text: "No certificates listed yet." })
      );
      return;
    }
    certs.forEach((c) => {
      const li = el("li", { className: "cert-entry" });

      const thumb = el("div", { className: "cert-entry__thumb" });
      if (c.image) {
        thumb.style.backgroundImage = `url("${c.image}")`;
      } else {
        thumb.textContent = (c.issuer || "?").slice(0, 2).toUpperCase();
      }
      li.appendChild(thumb);

      const body = el("div", { className: "cert-entry__body" });
      body.appendChild(el("span", { className: "cert-entry__title", text: c.title }));
      const metaText = [c.issuer, c.date].filter(Boolean).join(" \u00b7 ");
      body.appendChild(el("span", { className: "cert-entry__meta", text: metaText }));
      li.appendChild(body);

      if (c.url) {
        li.appendChild(
          el("a", {
            className: "cert-entry__link",
            text: "View certificate",
            attrs: { href: c.url, target: "_blank", rel: "noopener noreferrer" },
          })
        );
      }

      container.appendChild(li);
    });
  }

  function render(data) {
    document.title = `${data.name} \u2013 ${data.role}`;
    document.getElementById("nav-name").textContent = data.name || "";

    const heroName = document.getElementById("hero-name");
    const heroRole = document.getElementById("hero-role");
    const heroTagline = document.getElementById("hero-tagline");
    const heroBio = document.getElementById("hero-bio");

    heroName.textContent = data.name || "";
    heroBio.textContent = data.bio || "";

    typeInto(heroRole, data.role || "", 28, () => {
      typeInto(heroTagline, data.tagline || "", 14);
    });

    renderSocials(data.socials);
    renderManifest(data.stack);
    renderProjects(data.projects);
    renderCertificates(data.certificates);

    const contactText = document.getElementById("contact-text");
    contactText.textContent = data.location
      ? `Based in ${data.location}. Open to backend, DevOps, and AI engineering roles.`
      : "Open to backend, DevOps, and AI engineering roles.";
  }

  function renderError() {
    const heroBio = document.getElementById("hero-bio");
    heroBio.textContent =
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
