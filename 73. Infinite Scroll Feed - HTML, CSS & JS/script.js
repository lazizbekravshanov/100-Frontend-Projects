(() => {
  "use strict";

  // ---------- Configuration ----------
  const TOTAL_POSTS = 84;
  const BATCH_SIZE = 10;
  const FETCH_DELAY = 700; // simulated network latency in ms
  const SKELETON_COUNT = 4;

  // ---------- Content source ----------
  const AUTHORS = [
    "Mara Whitfield",
    "Devon Park",
    "Aisha Rahman",
    "Leon Novak",
    "Priya Menon",
    "Callum Reyes",
    "Ingrid Sato",
    "Theo Bennett",
    "Nadia Okafor",
    "Ravi Shankar",
    "Elena Fischer",
    "Marcus Cole",
  ];

  const TOPICS = [
    "Design",
    "Engineering",
    "Product",
    "Craft",
    "Notes",
    "Research",
  ];

  const POSTS = [
    {
      title: "Why I stopped chasing pixel-perfect handoffs",
      body: "Perfect specs assume the design is finished. It rarely is. I now share intent and constraints instead of frozen mockups, and the builds ship faster because engineers can make sensible calls in the gaps.",
    },
    {
      title: "The quiet cost of a loading spinner",
      body: "Spinners tell people to wait but never how long. Swapping ours for skeleton placeholders that mirror the real layout cut perceived wait time roughly in half, with no change to the actual response speed.",
    },
    {
      title: "A short defense of boring technology",
      body: "Every exciting new tool is also an unknown failure mode at 3 a.m. We keep a small budget for novelty and spend the rest on things we already know how to operate, debug, and hire for.",
    },
    {
      title: "Notes from a week of writing zero code",
      body: "I spent five days only reading the codebase and talking to the people who use it. The bug I was chasing turned out to be a misunderstanding, not a defect. The best fix was a paragraph of documentation.",
    },
    {
      title: "Whitespace is not empty space",
      body: "Cramming more onto a screen feels productive and reads as anxious. Generous margins give the eye somewhere to rest and quietly signal that each element was chosen on purpose.",
    },
    {
      title: "How we cut our build time in half",
      body: "No clever trick, just measurement. We profiled the pipeline, found a cache that never hit, and fixed one path. The lesson keeps repeating: you cannot optimize what you have never actually timed.",
    },
    {
      title: "The interface should apologize, not the user",
      body: "When someone hits an error, the tone matters as much as the message. We rewrote our error states to take responsibility and offer the next step. Support tickets dropped, and the copy was free.",
    },
    {
      title: "Small teams, sharp edges",
      body: "With four engineers you cannot build everything, so you build the two things that matter and say no gracefully to the rest. Constraint is not the enemy of ambition; it is how ambition stays focused.",
    },
    {
      title: "Reading the code before rewriting it",
      body: "That tangled function usually encodes years of edge cases someone met the hard way. Before you delete it, find out which production incident each strange branch is quietly preventing.",
    },
    {
      title: "Typography does most of the work",
      body: "Before reaching for color or shadow, I fix the type. A clear hierarchy of size and weight solves more layout problems than any decorative flourish, and it survives every theme change intact.",
    },
    {
      title: "What a good code review actually protects",
      body: "It is not about catching typos a linter would find. Review is where we share context, question assumptions early, and make sure no single person is the only one who understands a critical path.",
    },
    {
      title: "Ship the smallest honest version",
      body: "We almost delayed a launch for a feature nobody had asked for. Instead we shipped the core, watched how people used it, and let real behavior tell us what the next version should contain.",
    },
    {
      title: "Accessibility is a design constraint, not a checklist",
      body: "Bolted-on fixes feel bolted on. When contrast, focus order, and keyboard paths are part of the first sketch, the result is calmer for everyone, not just the people the audit was meant to satisfy.",
    },
    {
      title: "The meeting that should have been a diagram",
      body: "We argued in circles for an hour until someone drew the data flow on a whiteboard. The disagreement evaporated because we had all been picturing a different system the whole time.",
    },
    {
      title: "On naming things well",
      body: "A precise name is documentation that never drifts out of date. I will happily spend ten minutes renaming a variable if it saves the next reader from ten minutes of guessing what it holds.",
    },
    {
      title: "Latency you can feel, latency you can measure",
      body: "The numbers on our dashboard looked healthy while the app felt sluggish. The gap was animation janking on cheaper phones. We test on the slowest device our users actually carry now.",
    },
    {
      title: "Delete more than you add",
      body: "The healthiest quarter our codebase ever had, the net line count went down. Removing a dead feature freed us from maintaining its tests, its docs, and its subtle pull on every future decision.",
    },
    {
      title: "The first draft is for you, the second is for them",
      body: "I write the initial version to figure out what I think. Only on the rewrite do I consider the reader. Conflating those two jobs is why so many explanations stay confusing.",
    },
    {
      title: "Guardrails beat gates",
      body: "A process that blocks people teaches them to route around it. We replaced our approval gate with automated checks that catch the real risks and let everything safe pass through untouched.",
    },
    {
      title: "Design systems are a promise, not a library",
      body: "The components are the easy part. The hard part is the shared agreement about when and why to use them, kept alive by people who care more about consistency than about their own clever exception.",
    },
    {
      title: "The bug was in the assumption",
      body: "Two days chasing a race condition, and the real fault was a comment claiming the function was synchronous. It had not been for a year. Trust the code, verify the prose.",
    },
    {
      title: "Prototypes are questions, not answers",
      body: "The point of a rough build is to make a decision cheaply. If you are polishing a prototype, you have already answered the question it was meant to ask and are now just admiring your work.",
    },
    {
      title: "A calmer color palette",
      body: "We pulled saturation out of everything but the primary action. Suddenly people found the button they were meant to press, because it was the only thing on the page asking loudly for attention.",
    },
    {
      title: "Feedback loops shorter than a coffee break",
      body: "If I have to wait more than a few seconds to see whether a change worked, I start doing something else and lose the thread. Every second shaved off the loop pays itself back in focus.",
    },
    {
      title: "Documentation is a design surface",
      body: "The first place many people meet your product is a search result, not your homepage. Treating docs as an afterthought means treating that first impression as an afterthought too.",
    },
    {
      title: "Say no with a reason and an alternative",
      body: "A flat refusal breeds resentment; a considered no builds trust. When I decline a request I try to name the tradeoff and point at the path I would take instead if it were mine.",
    },
    {
      title: "The refactor nobody noticed",
      body: "The best structural cleanup leaves the behavior identical and the next feature obviously easier. If users can tell you refactored, something probably went sideways along the way.",
    },
    {
      title: "Measuring twice on the mobile edge",
      body: "Most layout bugs we ship live at the narrow end of the range. Testing at 375 pixels first, rather than last, catches the overflow before it ever reaches someone's actual phone.",
    },
  ];

  const AVATAR_COLORS = [
    "#334155",
    "#7c3aed",
    "#0f766e",
    "#b91c1c",
    "#1d4ed8",
    "#a16207",
    "#be185d",
    "#15803d",
    "#4338ca",
    "#0e7490",
  ];

  // ---------- Deterministic data generation ----------
  const feedData = buildFeed(TOTAL_POSTS);
  let renderedCount = 0;
  let isLoading = false;

  const feedEl = document.getElementById("feed");
  const skeletonsEl = document.getElementById("skeletons");
  const sentinelEl = document.getElementById("sentinel");
  const feedEndEl = document.getElementById("feed-end");
  const statusEl = document.getElementById("feed-status");

  function buildFeed(count) {
    const items = [];
    const now = Date.now();
    for (let i = 0; i < count; i += 1) {
      const source = POSTS[i % POSTS.length];
      const author = AUTHORS[i % AUTHORS.length];
      const minutesAgo = 4 + i * 37;
      items.push({
        id: i + 1,
        title: source.title,
        body: source.body,
        author,
        initials: toInitials(author),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        topic: TOPICS[i % TOPICS.length],
        timestamp: relativeTime(minutesAgo),
        datetime: new Date(now - minutesAgo * 60000).toISOString(),
      });
    }
    return items;
  }

  function toInitials(name) {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function relativeTime(minutes) {
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // ---------- Rendering ----------
  function createPost(item) {
    const article = document.createElement("article");
    article.className = "post";

    const meta = document.createElement("div");
    meta.className = "post__meta";

    const avatar = document.createElement("div");
    avatar.className = "post__avatar";
    avatar.style.backgroundColor = item.color;
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = item.initials;

    const byline = document.createElement("div");
    byline.className = "post__byline";

    const author = document.createElement("span");
    author.className = "post__author";
    author.textContent = item.author;

    const time = document.createElement("time");
    time.className = "post__time";
    time.dateTime = item.datetime;
    time.textContent = item.timestamp;

    byline.append(author, time);

    const topic = document.createElement("span");
    topic.className = "post__topic";
    topic.textContent = item.topic;

    meta.append(avatar, byline, topic);

    const title = document.createElement("h2");
    title.className = "post__title";
    title.textContent = item.title;

    const body = document.createElement("p");
    body.className = "post__body";
    body.textContent = item.body;

    article.append(meta, title, body);
    return article;
  }

  function buildSkeletons() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < SKELETON_COUNT; i += 1) {
      const card = document.createElement("div");
      card.className = "skeleton";
      card.innerHTML = `
        <div class="skeleton__meta">
          <div class="skeleton__avatar shimmer"></div>
          <div class="skeleton__byline">
            <div class="skeleton__line skeleton__line--author shimmer"></div>
            <div class="skeleton__line skeleton__line--time shimmer"></div>
          </div>
        </div>
        <div class="skeleton__title shimmer"></div>
        <div class="skeleton__line skeleton__line--body shimmer"></div>
        <div class="skeleton__line skeleton__line--body shimmer"></div>
        <div class="skeleton__line skeleton__line--body is-short shimmer"></div>
      `;
      fragment.appendChild(card);
    }
    skeletonsEl.replaceChildren(fragment);
  }

  function showSkeletons() {
    buildSkeletons();
    skeletonsEl.hidden = false;
    feedEl.setAttribute("aria-busy", "true");
  }

  function hideSkeletons() {
    skeletonsEl.hidden = true;
    skeletonsEl.replaceChildren();
    feedEl.setAttribute("aria-busy", "false");
  }

  function appendBatch() {
    const nextItems = feedData.slice(
      renderedCount,
      renderedCount + BATCH_SIZE
    );
    const fragment = document.createDocumentFragment();
    nextItems.forEach((item) => fragment.appendChild(createPost(item)));
    feedEl.appendChild(fragment);
    renderedCount += nextItems.length;
    statusEl.textContent = `Loaded ${nextItems.length} more posts. Showing ${renderedCount} of ${feedData.length}.`;
  }

  function loadMore() {
    if (isLoading || renderedCount >= feedData.length) {
      return;
    }
    isLoading = true;
    showSkeletons();

    window.setTimeout(() => {
      hideSkeletons();
      appendBatch();
      isLoading = false;

      if (renderedCount >= feedData.length) {
        finishFeed();
      }
    }, FETCH_DELAY);
  }

  function finishFeed() {
    observer.unobserve(sentinelEl);
    feedEndEl.hidden = false;
    statusEl.textContent = `You've reached the end of the feed. All ${feedData.length} posts are loaded.`;
  }

  // ---------- Infinite scroll via IntersectionObserver ----------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
    },
    { rootMargin: "300px 0px" }
  );

  // Initial batch, then start observing the sentinel.
  loadMore();
  observer.observe(sentinelEl);
})();
