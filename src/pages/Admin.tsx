import { useState } from "react";
import { Logo, Button, Icon, Badge, Field, SectionHead } from "@/components/ui";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { Page } from "@/types";

// ─── Admin Login page ─────────────────────────────────────────────────────────
export function AdminLogin({ go }: { go: (p: Page) => void }) {
  const { login, loginError, loginLoading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) go("admin");
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <Logo />
        </div>
        <div className="admin-login-head">
          <span className="eyebrow">Staff portal</span>
          <h1>Sign in to your account</h1>
          <p>Access is restricted to authorised Vivadoxa staff only.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Field
            id="al-email"
            label="Email address"
            type="email"
            placeholder="admin@vivadoxa.ng"
            value={email}
            onChange={setEmail}
            required
          />
          <div className="password-field">
            <Field
              id="al-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={setPassword}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eyeoff" : "eye"} size={16} />
            </button>
          </div>

          {loginError && (
            <div className="login-error" role="alert">
              <Icon name="warning" size={16} />
              {loginError}
            </div>
          )}

          <Button type="submit" disabled={loginLoading} fullWidth>
            {loginLoading ? "Signing in…" : <>Sign in <Icon name="arrow" /></>}
          </Button>
        </form>

        <p className="login-footer">
          Not a staff member?{" "}
          <button type="button" onClick={() => go("home")}>
            Return to the website
          </button>
        </p>

        {/* Demo hint — remove before client handover */}
        <details className="login-hint">
          <summary>Demo credentials (remove before handover)</summary>
          <p>Email: admin@vivadoxa.ng</p>
          <p>Password: VivadoxaAdmin2025!</p>
        </details>
      </div>
    </main>
  );
}

// ─── Admin shell (only rendered when session is valid) ─────────────────────────
export function Admin({ go }: { go: (p: Page) => void }) {
  const { session, logout } = useAdminAuth();

  // Guard: if no session, send to login
  if (!session) {
    go("admin-login");
    return null;
  }

  const [active, setActive] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [saved, setSaved] = useState(false);

  const navGroups: [string, string[]][] = [
    ["Workspace", ["Dashboard", "Website Pages", "Navigation & Footer", "Media Library", "SEO & Analytics"]],
    ["School", ["Programs & Courses", "Study Modes", "Instructors", "Students", "Class Schedule"]],
    ["Admissions", ["Applications", "Payments", "Admission Letters", "Status Checker"]],
    ["Content", ["Testimonials", "Gallery", "FAQs", "Announcements", "Policies"]],
    ["Operations", ["Repairs", "Enquiries", "Forms", "Notifications", "Reports"]],
    ["System", ["Users & Roles", "Payment Settings", "Integrations", "Brand Settings", "General Settings"]],
  ];

  function closeNav(item: string) {
    setActive(item);
    setMobileNav(false);
    setSaved(false);
  }

  return (
    <main className="admin">
      {/* Sidebar */}
      <aside className={`admin-side ${mobileNav ? "show" : ""}`}>
        <div className="admin-brand">
          <Logo light />
          <button
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="admin-profile">
          <span aria-hidden="true">{session.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{session.name}</strong>
            <small>Super administrator</small>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          {navGroups.map(([group, items]) => (
            <div className="admin-nav-group" key={group}>
              <small>{group}</small>
              {items.map((item, i) => (
                <button
                  className={active === item ? "active" : ""}
                  onClick={() => closeNav(item)}
                  key={item}
                  aria-current={active === item ? "page" : undefined}
                >
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          className="signout"
          onClick={() => {
            logout();
            go("home");
          }}
        >
          Sign out
        </button>
      </aside>

      {/* Main content area */}
      <section className="admin-main">
        <header>
          <div className="admin-title">
            <button
              className="admin-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>
            <div>
              <h1>{active}</h1>
              <p>Manage and customise Vivadoxa Music School.</p>
            </div>
          </div>
          <div className="admin-tools">
            <button aria-label="Search">
              <Icon name="search" />
            </button>
            <button aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <span aria-hidden="true">{session.name.slice(0, 2).toUpperCase()}</span>
          </div>
        </header>

        <div className="admin-content">
          {active === "Dashboard" ? (
            <AdminOverview setActive={setActive} />
          ) : active === "Website Pages" ? (
            <AdminPages saved={saved} setSaved={setSaved} />
          ) : active === "Brand Settings" ? (
            <AdminBrand saved={saved} setSaved={setSaved} />
          ) : (
            <AdminManager title={active} />
          )}
        </div>
      </section>
    </main>
  );
}

// ─── Dashboard overview ────────────────────────────────────────────────────────
function AdminOverview({ setActive }: { setActive: (v: string) => void }) {
  const stats = [
    ["Applications", "284", "+18%"],
    ["Pending payments", "37", "Needs review"],
    ["Active students", "1,248", "+6%"],
    ["This month", "₦4.8m", "+12%"],
  ];

  return (
    <>
      <div className="welcome-panel">
        <div>
          <span className="eyebrow">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
          <h2>Welcome back 👋</h2>
          <p>Everything across admissions, lessons and the website—at a glance.</p>
        </div>
        <Button onClick={() => setActive("Website Pages")}>
          Customise website <Icon name="arrow" />
        </Button>
      </div>

      <div className="metric-grid" role="list" aria-label="Key metrics">
        {stats.map(([a, b, c]) => (
          <article key={a} role="listitem">
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </article>
        ))}
      </div>

      <div className="admin-panels">
        <section className="chart-panel">
          <div className="panel-title">
            <div>
              <h2>Revenue overview</h2>
              <p>Payments received in the last 6 months</p>
            </div>
            <select aria-label="Revenue period">
              <option>Last 6 months</option>
            </select>
          </div>
          <div className="chart" aria-label="Revenue bar chart">
            <div className="bars">
              {[42, 58, 48, 72, 64, 88].map((h, i) => (
                <div key={i}>
                  <i style={{ height: `${h}%` }} aria-hidden="true" />
                  <span>{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="todo">
          <div className="panel-title">
            <div>
              <h2>Needs attention</h2>
              <p>Priority tasks</p>
            </div>
          </div>
          {[
            ["12", "Payments to review"],
            ["08", "New applications"],
            ["05", "Repair estimates"],
            ["03", "Unread messages"],
          ].map(([n, l]) => (
            <button key={l}>
              <strong>{n}</strong>
              <span>{l}</span>
              <Icon name="arrow" />
            </button>
          ))}
        </section>
      </div>

      <section className="table-panel">
        <div className="panel-title">
          <div>
            <h2>Recent applications</h2>
            <p>Latest admission submissions</p>
          </div>
          <Button variant="ghost">View all</Button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Applicant</th>
                <th scope="col">Program</th>
                <th scope="col">Study mode</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Chidi Nwosu", "Guitar", "Onsite", "₦75,000", "Paid"],
                ["Zainab Bello", "Vocals", "Online", "₦70,000", "Review"],
                ["David Okoro", "Piano", "Home", "₦95,000", "Pending"],
                ["Maya Adekunle", "Violin", "Onsite", "₦82,000", "Paid"],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.slice(0, 4).map((c) => (
                    <td key={c}>{c}</td>
                  ))}
                  <td>
                    <Badge tone={r[4] === "Paid" ? "green" : r[4] === "Review" ? "gold" : "red"}>
                      {r[4]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ─── Admin page editor ─────────────────────────────────────────────────────────
import brandLogo from "@/assets/vivadoxa-logo.png";
import { guitarImg, trumpetImg, studioImg } from "@/lib/data";

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="editor-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function AdminPages({
  saved,
  setSaved,
}: {
  saved: boolean;
  setSaved: (v: boolean) => void;
}) {
  const [page, setPage] = useState("Home");
  const pages = [
    "Home", "About Us", "Programs & Courses", "Program Detail", "Study Modes",
    "Repairs & Maintenance", "Apply Now", "Payment", "Check Status",
    "Admission Letter", "Contact Us", "Privacy Policy", "Terms & Conditions", "404 Page",
  ];

  return (
    <div className="cms-layout">
      <aside className="cms-pages">
        <div>
          <strong>Website pages</strong>
          <button>+ New page</button>
        </div>
        {pages.map((item) => (
          <button
            key={item}
            className={page === item ? "active" : ""}
            onClick={() => setPage(item)}
            aria-current={page === item ? "page" : undefined}
          >
            <span className="page-dot" aria-hidden="true" />
            {item}
            <small>{["Privacy Policy", "Terms & Conditions"].includes(item) ? "Draft" : "Live"}</small>
          </button>
        ))}
      </aside>

      <section className="cms-editor">
        <div className="editor-head">
          <div>
            <span className="eyebrow">Page editor</span>
            <h2>{page}</h2>
            <p>Control every section, image, action and search setting on this page.</p>
          </div>
          <div className="editor-actions">
            <Button variant="ghost">Preview</Button>
            <Button onClick={() => setSaved(true)}>
              {saved ? <><Icon name="check" /> Saved</> : "Publish changes"}
            </Button>
          </div>
        </div>

        <div className="editor-grid">
          <div className="editor-main">
            <EditorSection title="Page visibility & navigation">
              <div className="switch-row">
                <div>
                  <strong>Published</strong>
                  <span>Visible to everyone</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked aria-label="Page published" />
                  <i aria-hidden="true" />
                </label>
              </div>
              <div className="form-grid">
                <Field id="pe-label" label="Navigation label" placeholder={page} />
                <Field
                  id="pe-url"
                  label="Page URL"
                  placeholder={`/${page.toLowerCase().replace(/\s+/g, "-")}`}
                />
              </div>
            </EditorSection>

            <EditorSection title="Hero section">
              <Field id="pe-eyebrow" label="Eyebrow" placeholder="Welcome to Vivadoxa" />
              <label className="field" htmlFor="pe-headline">
                <span>Headline</span>
                <textarea
                  id="pe-headline"
                  defaultValue={page === "Home" ? "Learn music. Master your craft." : page}
                />
              </label>
              <Field id="pe-subtext" label="Supporting text" placeholder="Add a short, compelling page introduction" />
              <div className="image-picker">
                <img
                  src={
                    page === "Programs & Courses"
                      ? guitarImg
                      : page === "Repairs & Maintenance"
                      ? trumpetImg
                      : studioImg
                  }
                  alt="Selected section visual"
                />
                <div>
                  <strong>Hero image</strong>
                  <span>Replace, crop or add alt text</span>
                  <Button variant="secondary">Choose from library</Button>
                </div>
              </div>
            </EditorSection>

            <EditorSection title="Content sections">
              <div className="block-list">
                {["Introduction", "Featured cards", "How it works", "Call to action"].map((x, i) => (
                  <div key={x}>
                    <span className="drag" aria-hidden="true">⋮⋮</span>
                    <div>
                      <strong>{x}</strong>
                      <small>{i % 2 ? "3 cards · Image + text" : "Rich text section"}</small>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked aria-label={`${x} visible`} />
                      <i aria-hidden="true" />
                    </label>
                    <button>Edit</button>
                  </div>
                ))}
              </div>
              <button className="add-block">+ Add content section</button>
            </EditorSection>
          </div>

          <aside className="editor-side">
            <EditorSection title="Page settings">
              <label className="field" htmlFor="pe-template">
                <span>Template</span>
                <select id="pe-template">
                  <option>Marketing page</option>
                  <option>Form page</option>
                  <option>Utility page</option>
                </select>
              </label>
              <Field id="pe-title" label="Browser title" placeholder={`${page} | Vivadoxa Music`} />
              <label className="field" htmlFor="pe-meta">
                <span>Meta description</span>
                <textarea id="pe-meta" placeholder="Describe this page for search engines" />
              </label>
            </EditorSection>

            <EditorSection title="Actions">
              <div className="stack-actions">
                <button>Duplicate page</button>
                <button>View revision history</button>
                <button>Schedule publishing</button>
                <button className="danger">Unpublish page</button>
              </div>
            </EditorSection>
          </aside>
        </div>
      </section>
    </div>
  );
}

// ─── Brand settings ────────────────────────────────────────────────────────────
function AdminBrand({
  saved,
  setSaved,
}: {
  saved: boolean;
  setSaved: (v: boolean) => void;
}) {
  return (
    <>
      <div className="editor-head standalone">
        <div>
          <span className="eyebrow">Design system</span>
          <h2>Brand settings</h2>
          <p>Update the visual identity used across every public page and email.</p>
        </div>
        <Button onClick={() => setSaved(true)}>{saved ? "Saved" : "Save brand"}</Button>
      </div>
      <div className="brand-settings">
        <EditorSection title="Primary logo">
          <div className="brand-logo-preview">
            <img src={brandLogo} alt="Current Vivadoxa brand logo" />
          </div>
          <div className="button-row">
            <Button variant="secondary">Replace logo</Button>
            <Button variant="ghost">Download original</Button>
          </div>
        </EditorSection>

        <EditorSection title="Brand colours">
          <div className="colour-grid">
            {[
              ["Primary (Gold)", "#C96B32"],
              ["Ink (Dark)", "#0B0B0B"],
              ["Background (Cream)", "#F7F5F0"],
              ["White", "#FFFFFF"],
            ].map(([n, c]) => (
              <label key={n}>
                <span>{n}</span>
                <div>
                  <i style={{ background: c }} aria-hidden="true" />
                  <input defaultValue={c} aria-label={`${n} hex value`} />
                </div>
              </label>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Contact details">
          <div className="form-grid">
            <Field id="br-phone" label="Phone number" placeholder="+234 803 130 8881" />
            <Field id="br-email" label="Email" placeholder="hello@vivadoxa.ng" />
            <label className="field full" htmlFor="br-address">
              <span>School address</span>
              <input
                id="br-address"
                defaultValue="U/Sunday, Television, Kaduna, Nigeria"
              />
            </label>
          </div>
        </EditorSection>
      </div>
    </>
  );
}

// ─── Generic manager table ─────────────────────────────────────────────────────
function AdminManager({ title }: { title: string }) {
  const isSettings =
    title.includes("Settings") ||
    title.includes("Integrations") ||
    title.includes("Analytics") ||
    title.includes("Navigation");

  const rows: Record<string, string[][]> = {
    "Programs & Courses": [
      ["Piano & Keyboard", "Instruments", "₦85,000", "Published"],
      ["Guitar", "Instruments", "₦75,000", "Published"],
      ["Music Production", "Production", "₦95,000", "Published"],
    ],
    Applications: [
      ["VIV-2025-01842", "Adaeze Okafor", "Piano", "Under review"],
      ["VIV-2025-01841", "Zainab Bello", "Vocals", "Confirmed"],
    ],
    Payments: [
      ["PAY-88421", "VIV-2025-01842", "₦85,000", "Review"],
      ["PAY-88420", "VIV-2025-01841", "₦70,000", "Confirmed"],
    ],
    Repairs: [
      ["REP-0142", "Yamaha Keyboard", "U/Sunday", "New"],
      ["REP-0141", "Acoustic Guitar", "Kaduna", "Estimate sent"],
    ],
    Students: [
      ["VD-1028", "Maya Adekunle", "Violin", "Active"],
      ["VD-1027", "Chidi Nwosu", "Guitar", "Active"],
    ],
  };

  const data =
    rows[title] || [
      ["Item 001", `Sample ${title} entry`, "Updated today", "Active"],
      ["Item 002", `Second ${title} entry`, "Updated yesterday", "Draft"],
    ];

  return (
    <>
      <div className="manager-head">
        <div>
          <span className="eyebrow">Administration</span>
          <h2>{title}</h2>
          <p>Manage, organise and publish all {title.toLowerCase()} content.</p>
        </div>
        <Button>+ Add new</Button>
      </div>

      {isSettings ? (
        <div className="settings-grid">
          {[
            "General configuration",
            "Display options",
            "Email notifications",
            "Permissions & access",
            "Automation rules",
            "Advanced settings",
          ].map((x, i) => (
            <EditorSection title={x} key={x}>
              <div className="switch-row">
                <div>
                  <strong>{i % 2 ? "Enable feature" : "Use recommended settings"}</strong>
                  <span>Applies across the website and staff portal</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    defaultChecked={i < 4}
                    aria-label={i % 2 ? "Enable feature" : "Use recommended settings"}
                  />
                  <i aria-hidden="true" />
                </label>
              </div>
              <Field id={`cfg-${i}`} label="Configuration value" placeholder="Enter value" />
            </EditorSection>
          ))}
        </div>
      ) : (
        <section className="table-panel manager-table">
          <div className="manager-filters">
            <div className="search-field">
              <Icon name="search" />
              <input
                placeholder={`Search ${title.toLowerCase()}…`}
                aria-label={`Search ${title}`}
              />
            </div>
            <select aria-label="Filter by status">
              <option>All statuses</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
            <Button variant="ghost">Export</Button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Reference / Name</th>
                  <th scope="col">Details</th>
                  <th scope="col">Category / Date</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={cell}>
                        {j === 3 ? (
                          <Badge
                            tone={
                              cell.includes("Active") ||
                              cell.includes("Published") ||
                              cell.includes("Confirmed")
                                ? "green"
                                : "gold"
                            }
                          >
                            {cell}
                          </Badge>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                    <td>
                      <button className="row-menu" aria-label={`Actions for ${row[0]}`}>
                        •••
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
