# News Hub 🗞️

A simplified, no-nonsense newsreader application for the Courier Journal and other Gannett-owned news sources.

> **Note**
> This repository is for a personal application that runs on a private home network. It intentionally omits critical components required for public use, as those would enable bypassing publisher paywalls. Those details will not be provided.

---

## Features

- Built with Nuxt 4 for performance, portability, and ease of modification
- Removes ads
- Removes trackers
- Clean lightbox based inline photo galleries (no more redirects to seperate pages just to view a gallery of images)
- Eliminates distracting or unrelated embeds (e.g., newsletter signups, promotional blocks)
- Option to permanently disable inline videos (often unrelated to article content)
- Supports feed sorting by:
  - Newest
  - Curated (site-defined order)

---

## Screenshots

### Feed View
Clean, chronological or curated feed with no ads or distractions.

![Feed View](./docs/images/feed.png)

### Article View
Distraction-free reading experience with optional video suppression.

![Article View](./docs/images/article.png)

---

## Impetus

[Many users](https://www.reddit.com/r/newsboat/comments/168vt8t/usatoday_and_all_other_gannettowned_newspapers/) were frustrated when Gannett quietly discontinued its RSS feeds. I was also [directly affected](https://github.com/jwhazel/news-reader).

I’m willing to pay to support strong local journalism. However, the current experience across Gannett properties is difficult to use—heavy advertising, intrusive interstitials, unrelated autoplay videos, and overall poor UX make it unnecessarily hard consume news. Just pulling up a single article in Chrome can consume 2 GB's.

This project is a personal solution to that problem—a lightweight way to consume local news.

To build it, I used [HTTP Toolkit](https://httptoolkit.com/) to inspect requests made by the official mobile app. The implementation closely mirrors those requests to leverage the same cached content so as to not place additional burden on their infrastructure.

---

## Setup

### Development

Create a `.env` file with the following values:

```bash
CONTENT_ENDPOINT=   # Gannett API content URL
CONTENT_API_KEY=    # Associated API key
SITECODE=           # 4-letter site code identifier
USER_AGENT=         # User agent string used to mimic the mobile app
MEDIA_BASE_URL=     # Domain used to rewrite media CDN URLs
```

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

### Production / Deployment

Ensure Docker is installed, then run:

```bash
docker compose up --build
```

This builds and runs the Nuxt application in a container.

---

## TODO

- Improve image sizing to exactly match desktop responses (currently off by ~1–3px due to scaling calculations)
- Better understand “fronts” (e.g., why "lifestyle" is labeled as "life")
- Evaluate adding subsections and topics to navigation
- Add author landing pages with recent articles
