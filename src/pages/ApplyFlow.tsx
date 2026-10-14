import { useState, useRef } from "react";
import {
  Logo,
  Button,
  Icon,
  Badge,
  Field,
  SelectField,
  UploadZone,
  Success,
} from "@/components/ui";
import { programs } from "@/lib/data";
import { generateReference, isValidEmail, BANK_NAME, BANK_ACCOUNT_NO, BANK_ACCOUNT_NAME } from "@/lib/utils";
import type { ApplicationData } from "@/types";
import type { Page } from "@/types";

// ─── Multi-step stepper UI ────────────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  const steps = ["Personal", "Guardian", "Program", "Review"];
  return (
    <nav className="stepper" aria-label="Application steps">
      {steps.map((x, i) => (
        <div
          key={x}
          className={i + 1 <= step ? "done" : ""}
          aria-current={i + 1 === step ? "step" : undefined}
        >
          <span aria-hidden="true">
            {i + 1 < step ? <Icon name="check" size={14} /> : i + 1}
          </span>
          <small>{x}</small>
        </div>
      ))}
    </nav>
  );
}

function FormStep({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="form-step">
      <span className="eyebrow">Step details</span>
      <h2>{title}</h2>
      <p>{intro}</p>
      {children}
    </div>
  );
}

function ReviewRow({
  title,
  value,
  onEdit,
}: {
  title: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="review-row">
      <span>{title}</span>
      <strong>{value}</strong>
      <button type="button" onClick={onEdit} aria-label={`Edit ${title}`}>
        Edit
      </button>
    </div>
  );
}

// ─── Default form state ───────────────────────────────────────────────────────
const defaultData = (): ApplicationData => ({
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  state: "",
  address: "",
  guardianName: "",
  relationship: "",
  guardianPhone: "",
  guardianEmail: "",
  category: "Instruments",
  program: "Piano & Keyboard",
  level: "Beginner",
  schedule: "Weekday evenings",
  studyMode: "Onsite",
  referenceNo: generateReference(),
  amount: 85000,
});

// ─── Apply page ───────────────────────────────────────────────────────────────
export function Apply({ go }: { go: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ApplicationData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationData, string>>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  function set<K extends keyof ApplicationData>(k: K, v: ApplicationData[K]) {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  // When program changes, update the fee amount
  function handleProgramChange(name: string) {
    const prog = programs.find((p) => p.name === name);
    set("program", name);
    if (prog) set("amount", prog.feeAmount);
  }

  function validateStep(): boolean {
    const e: typeof errors = {};

    if (step === 1) {
      if (!data.fullName.trim()) e.fullName = "Full name is required.";
      if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
      if (!data.gender) e.gender = "Please select a gender.";
      if (!data.phone.trim()) e.phone = "Phone number is required.";
      if (!data.email.trim()) e.email = "Email is required.";
      else if (!isValidEmail(data.email)) e.email = "Enter a valid email address.";
      if (!data.state) e.state = "Please select your state.";
      if (!data.address.trim()) e.address = "Home address is required.";
    }

    if (step === 2) {
      // Guardian step is optional for adults; only validate if any guardian field is filled
      if (data.guardianEmail && !isValidEmail(data.guardianEmail)) {
        e.guardianEmail = "Enter a valid guardian email address.";
      }
    }

    if (step === 3) {
      if (!data.category) e.category = "Please select a category.";
      if (!data.program) e.program = "Please select a program.";
      if (!data.level) e.level = "Please select your level.";
      if (!data.schedule) e.schedule = "Please select a preferred schedule.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep()) {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setStep((s) => s + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function prev() {
    setStep((s) => s - 1);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function submit() {
    if (!termsAccepted) {
      setTermsError("You must agree to the terms before proceeding.");
      return;
    }
    setTermsError("");
    go("payment");
  }

  const selectedProgram = programs.find((p) => p.name === data.program);

  return (
    <main className="application">
      <div className="container">
        <div className="application-head">
          <button className="logo-button" onClick={() => go("home")} aria-label="Go to homepage">
            <Logo />
          </button>
          <span>Your progress is saved</span>
        </div>

        <div className="apply-layout">
          <aside>
            <span>Admissions {new Date().getFullYear()}</span>
            <h1>Begin your musical journey.</h1>
            <p>Complete your application in a few simple steps.</p>
            <div className="support">
              <strong>Need help?</strong>
              <a href="tel:+2348031308881">+234 803 130 8881</a>
              <a href="mailto:admissions@vivadoxa.ng">admissions@vivadoxa.ng</a>
            </div>
          </aside>

          <section className="apply-card" ref={formRef as React.RefObject<HTMLElement>}>
            <Stepper step={step} />

            {/* Step 1 — Personal */}
            {step === 1 && (
              <FormStep
                title="Personal details"
                intro="Let's start with some basic information about you."
              >
                <div className="form-grid">
                  <Field id="ap-name" label="Full name" placeholder="As shown on your ID" value={data.fullName} onChange={(v) => set("fullName", v)} required error={errors.fullName} />
                  <Field id="ap-dob" label="Date of birth" type="date" value={data.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} required error={errors.dateOfBirth} />
                  <SelectField id="ap-gender" label="Gender" value={data.gender} onChange={(v) => set("gender", v)} required>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </SelectField>
                  <Field id="ap-phone" label="Phone number" placeholder="+234" type="tel" value={data.phone} onChange={(v) => set("phone", v)} required error={errors.phone} />
                  <Field id="ap-email" label="Email address" type="email" placeholder="you@example.com" value={data.email} onChange={(v) => set("email", v)} required error={errors.email} />
                  <SelectField id="ap-state" label="State" value={data.state} onChange={(v) => set("state", v)} required>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Kano">Kano</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Other">Other</option>
                  </SelectField>
                  <label className="field full" htmlFor="ap-address">
                    <span>Home address <span className="required-star" aria-hidden="true"> *</span></span>
                    <input
                      id="ap-address"
                      placeholder="Street and city"
                      value={data.address}
                      onChange={(e) => set("address", e.target.value)}
                      required
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && <span className="field-hint error" role="alert">{errors.address}</span>}
                  </label>
                </div>
              </FormStep>
            )}

            {/* Step 2 — Guardian */}
            {step === 2 && (
              <FormStep
                title="Guardian details"
                intro="Required for applicants under the age of 18. Skip if you are an adult."
              >
                <div className="form-grid">
                  <Field id="ap-gname" label="Guardian name" value={data.guardianName} onChange={(v) => set("guardianName", v)} />
                  <Field id="ap-rel" label="Relationship" placeholder="e.g. Parent, Sibling" value={data.relationship} onChange={(v) => set("relationship", v)} />
                  <Field id="ap-gphone" label="Guardian phone" placeholder="+234" type="tel" value={data.guardianPhone} onChange={(v) => set("guardianPhone", v)} />
                  <Field id="ap-gemail" label="Guardian email" type="email" value={data.guardianEmail} onChange={(v) => set("guardianEmail", v)} error={errors.guardianEmail} />
                </div>
              </FormStep>
            )}

            {/* Step 3 — Program */}
            {step === 3 && (
              <FormStep
                title="Choose your program"
                intro="Tell us what and how you would like to learn."
              >
                <div className="form-grid">
                  <SelectField id="ap-cat" label="Category" value={data.category} onChange={(v) => set("category", v)} required>
                    <option value="Instruments">Instruments</option>
                    <option value="Vocals">Vocals</option>
                    <option value="Composition">Composition</option>
                    <option value="Music Production">Music Production</option>
                  </SelectField>
                  <SelectField id="ap-prog" label="Program / instrument" value={data.program} onChange={handleProgramChange} required>
                    {programs
                      .filter((p) => p.category === data.category)
                      .map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} — {p.fee}
                        </option>
                      ))}
                  </SelectField>
                  <SelectField id="ap-level" label="Current level" value={data.level} onChange={(v) => set("level", v)} required>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </SelectField>
                  <SelectField id="ap-sched" label="Preferred schedule" value={data.schedule} onChange={(v) => set("schedule", v)} required>
                    <option value="Weekday evenings">Weekday evenings</option>
                    <option value="Saturday mornings">Saturday mornings</option>
                    <option value="Saturday afternoons">Saturday afternoons</option>
                    <option value="Flexible (discuss with instructor)">Flexible</option>
                  </SelectField>
                  <div className="full">
                    <span className="field-label">
                      Study mode <span className="required-star" aria-hidden="true">*</span>
                    </span>
                    <div className="radio-cards" role="radiogroup" aria-label="Study mode">
                      {(["Onsite", "Online", "Home Lessons"] as const).map((x) => (
                        <label key={x}>
                          <input
                            type="radio"
                            name="mode"
                            value={x}
                            checked={data.studyMode === x}
                            onChange={() => set("studyMode", x)}
                          />
                          <span>
                            <strong>{x}</strong>
                            <small>
                              {x === "Onsite"
                                ? "At our Kaduna studio"
                                : x === "Online"
                                ? "Live video lessons"
                                : "Instructor visits you"}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </FormStep>
            )}

            {/* Step 4 — Review */}
            {step === 4 && (
              <FormStep
                title="Review & confirm"
                intro="Check your details before submitting."
              >
                <div className="review">
                  <ReviewRow title="Applicant" value={`${data.fullName} · ${data.email}`} onEdit={() => setStep(1)} />
                  <ReviewRow title="Phone" value={data.phone} onEdit={() => setStep(1)} />
                  <ReviewRow title="Program" value={`${data.program} · ${data.level}`} onEdit={() => setStep(3)} />
                  <ReviewRow title="Study mode" value={`${data.studyMode} · ${data.schedule}`} onEdit={() => setStep(3)} />
                  {data.guardianName && (
                    <ReviewRow title="Guardian" value={`${data.guardianName} · ${data.guardianPhone}`} onEdit={() => setStep(2)} />
                  )}
                  <div className="total">
                    <div>
                      <span>Program fee (one term)</span>
                      <small className="ref-small">Ref: {data.referenceNo}</small>
                    </div>
                    <strong>₦{data.amount.toLocaleString("en-NG")}</strong>
                  </div>
                  <label className="terms">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (e.target.checked) setTermsError("");
                      }}
                      aria-invalid={!!termsError}
                    />
                    I agree to the admission terms and privacy policy.
                  </label>
                  {termsError && (
                    <p className="field-hint error" role="alert">
                      {termsError}
                    </p>
                  )}
                </div>
              </FormStep>
            )}

            <div className="apply-actions">
              {step > 1 ? (
                <Button variant="ghost" onClick={prev}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              <Button onClick={step < 4 ? next : submit}>
                {step === 4 ? "Continue to payment" : "Save & continue"}{" "}
                <Icon name="arrow" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// ─── Payment page ─────────────────────────────────────────────────────────────
interface PaymentProofForm {
  payerName: string;
  paymentDate: string;
  amountPaid: string;
  transactionRef: string;
  receiptFile: FileList | null;
}

const emptyProof: PaymentProofForm = {
  payerName: "",
  paymentDate: "",
  amountPaid: "",
  transactionRef: "",
  receiptFile: null,
};

export function Payment({ go }: { go: (p: Page) => void }) {
  const [method, setMethod] = useState<"bank" | "online">("bank");
  const [proof, setProof] = useState<PaymentProofForm>(emptyProof);
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentProofForm, string>>>({});
  const [sent, setSent] = useState(false);

  // In production: pull these from the passed ApplicationData context/state.
  // For now we use a stable generated reference so it persists the session.
  const [refNo] = useState(() => generateReference());
  const amount = 85000; // TODO: pass from Apply state via context or URL param

  function setP<K extends keyof PaymentProofForm>(k: K, v: PaymentProofForm[K]) {
    setProof((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validateProof(): boolean {
    const e: typeof errors = {};
    if (!proof.payerName.trim()) e.payerName = "Payer name is required.";
    if (!proof.paymentDate) e.paymentDate = "Payment date is required.";
    if (!proof.amountPaid.trim()) e.amountPaid = "Amount paid is required.";
    if (!proof.transactionRef.trim()) e.transactionRef = "Transaction reference is required.";
    // receiptFile is optional client-side (file upload UX)
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  if (sent) {
    return (
      <main className="confirmation">
        <Success
          title="Application received. Payment pending confirmation."
          body="We will review your transfer and update your status within 2–24 hours. You will receive an email once your payment is confirmed."
          extra={`Application reference: ${refNo}`}
          onReset={() => go("status")}
          action="Check application status"
        />
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="container">
        <div className="payment-head">
          <button className="logo-button" onClick={() => go("home")} aria-label="Go to homepage">
            <Logo />
          </button>
          <Badge tone="green">Secure checkout</Badge>
        </div>

        <div className="pay-grid">
          <section>
            <span className="eyebrow">Payment</span>
            <h1>Complete your application</h1>
            <p>Choose a payment method and follow the instructions below.</p>

            {/* Method tabs */}
            <div className="payment-tabs" role="tablist" aria-label="Payment method">
              <button
                role="tab"
                aria-selected={method === "bank"}
                className={method === "bank" ? "active" : ""}
                onClick={() => setMethod("bank")}
              >
                <i aria-hidden="true" />
                <div>
                  <strong>Bank transfer</strong>
                  <small>Manual confirmation · 2–24 hours</small>
                </div>
                <Badge tone="green">Available</Badge>
              </button>
              <button
                role="tab"
                aria-selected={method === "online"}
                className={method === "online" ? "active" : ""}
                onClick={() => setMethod("online")}
              >
                <i aria-hidden="true" />
                <div>
                  <strong>Pay online</strong>
                  <small>Card, transfer or USSD</small>
                </div>
                <Badge tone="gold">Coming soon</Badge>
              </button>
            </div>

            {method === "bank" ? (
              <div className="bank-card">
                {/* Account details */}
                <div className="bank-title">
                  <div className="bank-logo" aria-hidden="true">M</div>
                  <div>
                    <strong>{BANK_NAME}</strong>
                    <span>Transfer exactly ₦{amount.toLocaleString("en-NG")}</span>
                  </div>
                </div>
                <div className="account-number">
                  <div>
                    <small>ACCOUNT NUMBER</small>
                    <strong>{BANK_ACCOUNT_NO}</strong>
                  </div>
                  {/* Only copy if it's a real number */}
                  {BANK_ACCOUNT_NO !== "TODO_REPLACE_WITH_REAL_ACCOUNT" && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(BANK_ACCOUNT_NO).catch(() => {});
                      }}
                    >
                      <Icon name="copy" /> Copy
                    </button>
                  )}
                </div>
                <dl>
                  <div>
                    <dt>Account name</dt>
                    <dd>{BANK_ACCOUNT_NAME}</dd>
                  </div>
                  <div>
                    <dt>Narration / Reference</dt>
                    <dd className="ref-highlight">{refNo}</dd>
                  </div>
                </dl>

                {/* Proof of payment form */}
                <div className="proof">
                  <h3>Submit proof of payment</h3>
                  <p>Already made the transfer? Send your details below for verification.</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (validateProof()) setSent(true);
                    }}
                    noValidate
                  >
                    <div className="form-grid">
                      <Field id="pay-payer" label="Payer name" value={proof.payerName} onChange={(v) => setP("payerName", v)} required error={errors.payerName} />
                      <Field id="pay-date" label="Payment date" type="date" value={proof.paymentDate} onChange={(v) => setP("paymentDate", v)} required error={errors.paymentDate} />
                      <Field id="pay-amount" label="Amount paid (₦)" placeholder={amount.toLocaleString("en-NG")} value={proof.amountPaid} onChange={(v) => setP("amountPaid", v)} required error={errors.amountPaid} />
                      <Field id="pay-ref" label="Transaction reference" value={proof.transactionRef} onChange={(v) => setP("transactionRef", v)} required error={errors.transactionRef} />
                    </div>
                    <UploadZone
                      label="Upload transfer receipt"
                      hint="JPG, PNG or PDF · Max 10MB"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(files) => setP("receiptFile", files)}
                      fileName={proof.receiptFile?.[0]?.name}
                    />
                    <Button type="submit" fullWidth>
                      I have made payment <Icon name="arrow" />
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="coming-card">
                <div className="lock" aria-hidden="true">◇</div>
                <h3>Online payments are coming soon</h3>
                <p>
                  Paystack and Flutterwave checkout is in preparation and will be enabled
                  shortly after launch.
                </p>
                <div className="gateway-row" aria-label="Payment gateways">
                  <span>PAYSTACK</span>
                  <span>flutterwave</span>
                </div>
                <Button disabled>
                  Pay ₦{amount.toLocaleString("en-NG")} securely
                </Button>
              </div>
            )}
          </section>

          {/* Order summary sidebar */}
          <aside className="order-card">
            <h3>Application summary</h3>
            <div className="applicant">
              <span aria-hidden="true">AP</span>
              <div>
                <strong>Applicant</strong>
                <small>{refNo}</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>Program</dt>
                <dd>Piano &amp; Keyboard</dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd>Beginner</dd>
              </div>
              <div>
                <dt>Study mode</dt>
                <dd>Onsite</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>Saturday morning</dd>
              </div>
            </dl>
            <div className="amount">
              <span>Amount due</span>
              <strong>₦{amount.toLocaleString("en-NG")}</strong>
              <small>For one 12-week term</small>
            </div>
            <p>
              <Icon name="check" size={16} /> Your application data is handled
              securely.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ─── Status checker ───────────────────────────────────────────────────────────
type StatusState = "pending" | "confirmed" | "issue";

export function Status() {
  const [email, setEmail] = useState("");
  const [refInput, setRefInput] = useState("");
  const [result, setResult] = useState(false);
  const [state, setState] = useState<StatusState>("pending");
  const [searchError, setSearchError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !refInput.trim()) {
      setSearchError("Please enter both your email address and application reference.");
      return;
    }
    if (!isValidEmail(email)) {
      setSearchError("Please enter a valid email address.");
      return;
    }
    setSearchError("");
    setResult(true);
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Application status</span>
            <h1>Track your admission journey.</h1>
            <p>
              Enter the email and reference number from your application to see the latest
              update.
            </p>
          </div>
        </div>
      </section>

      <section className="section status-section">
        <div className="container">
          <form className="status-search" onSubmit={handleSearch} noValidate>
            <Field
              id="status-email"
              label="Email address"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setSearchError(""); }}
            />
            <Field
              id="status-ref"
              label="Application reference"
              placeholder="e.g. VIV-2026-01842"
              value={refInput}
              onChange={(v) => { setRefInput(v); setSearchError(""); }}
            />
            <Button type="submit">Check status</Button>
            {searchError && (
              <p className="field-hint error full" role="alert">
                {searchError}
              </p>
            )}
          </form>

          {result && (
            <div className="status-result" role="region" aria-label="Application status">
              <div className="status-top">
                <div>
                  <span className="eyebrow">{refInput}</span>
                  <h2>Your application</h2>
                </div>
                <Badge
                  tone={
                    state === "confirmed" ? "green" : state === "issue" ? "red" : "gold"
                  }
                >
                  {state === "confirmed"
                    ? "Admission confirmed"
                    : state === "issue"
                    ? "Payment issue"
                    : "Payment under review"}
                </Badge>
              </div>

              {/* Demo controls — remove in production */}
              <div className="status-switch" aria-label="Demo: simulate status (remove in production)">
                <button type="button" onClick={() => setState("pending")}>Pending</button>
                <button type="button" onClick={() => setState("confirmed")}>Confirmed</button>
                <button type="button" onClick={() => setState("issue")}>Issue</button>
              </div>

              {state === "confirmed" ? (
                <div className="admitted">
                  <div className="success-icon">
                    <Icon name="check" size={30} />
                  </div>
                  <h3>Welcome to Vivadoxa!</h3>
                  <p>Your payment has been confirmed and your place is secured.</p>
                  {/*
                   * PRODUCTION: Replace these buttons with real download/email endpoints.
                   * The PDF is generated server-side when admin confirms payment.
                   */}
                  <Button>Download admission letter (PDF)</Button>
                  <Button variant="ghost">Resend to my email</Button>
                </div>
              ) : state === "issue" ? (
                <div className="issue">
                  <h3>We could not verify this payment</h3>
                  <p>
                    The amount on the uploaded receipt does not match your application fee.
                    Please contact admissions for help.
                  </p>
                  <a href="tel:+2348031308881">
                    <Button>Contact support</Button>
                  </a>
                </div>
              ) : (
                <>
                  <div className="timeline" role="list">
                    {[
                      ["Application submitted", `${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, 10:42 AM`],
                      ["Payment under review", "Verification usually takes 2–24 hours"],
                      ["Payment confirmed", "Pending"],
                      ["Admission complete", "Pending"],
                    ].map(([x, sub], i) => (
                      <div className={i < 2 ? "done" : ""} key={x} role="listitem">
                        <span aria-hidden="true">
                          {i === 0 ? <Icon name="check" size={14} /> : i + 1}
                        </span>
                        <div>
                          <strong>{x}</strong>
                          <small>{sub}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notice" role="note">
                    <strong>What happens next?</strong>
                    <p>
                      We are matching your transfer to our account. We&apos;ll send an email
                      as soon as it is confirmed.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
