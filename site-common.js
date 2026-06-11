const SITE_META = {
  title: "14서버 미소의세상 · KINGSHOT",
  description: "14서버 미소의세상 KINGSHOT 계산기 사이트",
  image: "main.jpg",
  favicon: "favicon.jpg",
};

function ensureLink(rel, href, type) {
  if (document.head.querySelector(`link[rel="${rel}"]`)) return;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (type) link.type = type;
  document.head.appendChild(link);
}

function ensureMeta(property, content) {
  if (document.head.querySelector(`meta[property="${property}"]`)) return;
  const meta = document.createElement("meta");
  meta.setAttribute("property", property);
  meta.content = content;
  document.head.appendChild(meta);
}

ensureLink("icon", SITE_META.favicon, "image/jpeg");
ensureMeta("og:type", "website");
ensureMeta("og:title", SITE_META.title);
ensureMeta("og:description", SITE_META.description);
ensureMeta("og:image", SITE_META.image);
