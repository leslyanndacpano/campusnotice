import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();
const categories = ["All", "Academic", "Events", "Deadlines", "Emergency"];
const emptyDraft = { title: "", organization: "", category: "Academic", content: "", expiresOn: "" };

function App() {
  const [announcements, setAnnouncements] = useState<Array<Schema["Announcement"]["type"]>>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("Connecting to the live campus feed...");
  const [hideExpired, setHideExpired] = useState(false);

  useEffect(() => {
    const subscription = client.models.Announcement.observeQuery().subscribe({
      next: ({ items }) => {
        setAnnouncements([...items]);
        setStatus("Live campus feed connected.");
      },
    });
    return () => subscription.unsubscribe();
  }, []);
  async function publishAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Publishing announcement...");
    const { errors } = await client.models.Announcement.create(draft);
    if (errors) {
      setStatus("The announcement could not be published. Check the browser console.");
      console.error(errors);
      return;
    }
    setDraft(emptyDraft);
    setStatus("Announcement published.");
  }
  const normalizedQuery = query.trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);
  const filteredAnnouncements = [...announcements]
    .filter((announcement) => {
      const matchesCategory = category === "All" || announcement.category === category;
      const matchesExpiry = !hideExpired || announcement.expiresOn >= today;
      const searchableText = [announcement.title, announcement.content, announcement.organization]
        .join(" ")
        .toLowerCase();
      return matchesCategory && matchesExpiry && searchableText.includes(normalizedQuery);
    })
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

 return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Campus information in one place</p>
          <h1>CampusNotice</h1>
          <p className="hero-copy">
            Find timely updates from campus offices, organizations, and student services.
          </p>
        </div>
        <div className="connection-status" aria-live="polite">
          {status}
        </div>
      </header>

      <section className="workspace">
        <form className="publish-panel" onSubmit={publishAnnouncement}>
          <div>
            <p className="section-kicker">Prototype publisher</p>
            <h2>Post an announcement</h2>
            <p className="panel-note">
              Authentication is intentionally deferred. Use sample campus information only.
            </p>
          </div>

          <label>
            Title
            <input
              required
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              placeholder="Library hours extended"
            />
          </label>

          <label>
            Organization
            <input
              required
              value={draft.organization}
              onChange={(event) =>
                setDraft({ ...draft, organization: event.target.value })
              }
              placeholder="University Library"
            />
          </label>

          <label>
            Category
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value })
              }
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
            <label>
              <span>Expiry</span>
              <span>
                <input
                  className="inline-checkbox"
                  type="checkbox"
                  checked={hideExpired}
                  onChange={(event) => setHideExpired(event.target.checked)}
                />{" "}
                Hide expired
              </span>
            </label>
            
          <label>
            Message
            <textarea
              required
              rows={5}
              value={draft.content}
              onChange={(event) =>
                setDraft({ ...draft, content: event.target.value })
              }
              placeholder="Add the details students need to know."
            />
          </label>

          <label>
            Expires on
            <input
              required
              type="date"
              value={draft.expiresOn}
              onChange={(event) =>
                setDraft({ ...draft, expiresOn: event.target.value })
              }
            />
          </label>

          <button type="submit">Publish announcement</button>
        </form>

        <section className="feed-panel">
          <div className="feed-heading">
            <div>
              <p className="section-kicker">Live feed</p>
              <h2>Campus announcements</h2>
            </div>

            <span className="result-count">
              {filteredAnnouncements.length} shown
            </span>

            <div className="filters">
              <label>
                Search
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notices"
                />
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="announcement-list" aria-live="polite">
            {filteredAnnouncements.length === 0 ? (
              <div className="empty-state">
                <h3>No matching announcements</h3>
                <p>Publish a notice or change the current search filters.</p>
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <article
                  className="announcement-card"
                  key={announcement.id}
                >
                  <div className="card-meta">
                    <span
                      className={`badge badge-${announcement.category.toLowerCase()}`}
                    >
                      {announcement.category}
                    </span>
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3>{announcement.title}</h3>

                  <p className="organization">
                    {announcement.organization}
                  </p>

                  <p>{announcement.content}</p>

                  <p className="expiry">
                    Expires {announcement.expiresOn}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;