import { useState } from "react";
import type { FormEvent } from "react";
type Announcement = { id: number; title: string; organization: string; category: string; content: string; expiresOn: string; createdAt: string };
const categories = ["Academic", "Events", "Deadlines", "Emergency"];
const emptyDraft = { title: "", organization: "", category: "Academic", content: "", expiresOn: "" };
const initialAnnouncements: Announcement[] = [{ id: 1, title: "Library hours extended", organization: "University Library", category: "Academic", content: "The main library will stay open until midnight during exam week.", expiresOn: "2026-12-18", createdAt: "2026-09-21" }, { id: 2, title: "Student club showcase", organization: "Student Activities", category: "Events", content: "Meet campus organizations in the student center this Friday.", expiresOn: "2026-11-06", createdAt: "2026-09-20" }];
function App() {
  // Keep temporary notices and form values in component state.
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [draft, setDraft] = useState(emptyDraft);
  const [status, setStatus] = useState("Local demo ready.");
  // Build a temporary record when the publishing form is submitted.
  function publishAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const announcement = { ...draft, id: Date.now(), createdAt: new Date().toISOString() };
    setAnnouncements([announcement, ...announcements]);
    setDraft(emptyDraft);
    setStatus("Announcement added.");
  }
  return (
    <main className="app-shell">
      <header className="hero"><div><p className="eyebrow">Campus information in one place</p><h1>CampusNotice</h1><p className="hero-copy">Find timely updates from campus offices, organizations, and student services.</p></div><div className="connection-status" aria-live="polite">{status}</div></header>
      <section className="workspace"><form className="publish-panel" onSubmit={publishAnnouncement}><div><p className="section-kicker">Prototype publisher</p><h2>Post an announcement</h2><p className="panel-note">Authentication is intentionally deferred. Use sample campus information only.</p></div><label>Title<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Library hours extended" /></label><label>Organization<input required value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} placeholder="University Library" /></label><label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Message<textarea required rows={5} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Add the details students need to know." /></label><label>Expires on<input required type="date" value={draft.expiresOn} onChange={(event) => setDraft({ ...draft, expiresOn: event.target.value })} /></label><button type="submit">Publish announcement</button></form>
      <section className="feed-panel"><div className="feed-heading"><div><p className="section-kicker">Local feed</p><h2>Campus announcements</h2></div><span className="result-count">{announcements.length} shown</span></div><div className="announcement-list" aria-live="polite">{announcements.length === 0 ? <div className="empty-state"><h3>No announcements yet</h3><p>Publish a notice to start the local feed.</p></div> : announcements.map((announcement) => <article className="announcement-card" key={announcement.id}><div className="card-meta"><span className={`badge badge-${announcement.category.toLowerCase()}`}>{announcement.category}</span><span>{new Date(announcement.createdAt).toLocaleDateString()}</span></div><h3>{announcement.title}</h3><p className="organization">{announcement.organization}</p><p>{announcement.content}</p><p className="expiry">Expires {announcement.expiresOn}</p></article>)}</div></section></section>
    </main>
  );
}
export default App;