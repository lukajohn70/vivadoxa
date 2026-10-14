// ─── Shared primitive UI components ──────────────────────────────────────────

import React, { useState } from "react";
import brandLogo from "@/assets/vivadoxa-logo.png";
import type { Page } from "@/types";


// ── Icon ──────────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu:  <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/>,
    mail:  <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    pin:   <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2"/></>,
    upload:<><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell:  <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    copy:  <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    lock:  <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    eye:   <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff:<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    warning:<><path d="m10.29 3.86-8.26 14.22A1 1 0 0 0 2.89 20h16.22a1 1 0 0 0 .86-1.5L11.71 3.86a1 1 0 0 0-1.72-.86z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  };
  return (
    <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <img src={brandLogo} alt="VivaDoxa Music School — Actualize your passion" />
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  fullWidth = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant}${fullWidth ? " btn-full" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Form field primitives ─────────────────────────────────────────────────────
export const Field = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  error,
  id,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  error?: string;
  id?: string;
}) => (
  <label className={`field${error ? " field-error" : ""}`} htmlFor={id}>
    <span>
      {label}
      {required && <span className="required-star" aria-hidden="true"> *</span>}
    </span>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
      aria-describedby={error ? `${id}-err` : undefined}
      aria-invalid={!!error}
    />
    {error && (
      <span id={`${id}-err`} className="field-hint error" role="alert">
        {error}
      </span>
    )}
  </label>
);

export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  id,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  id?: string;
}) => (
  <label className="field full" htmlFor={id}>
    <span>
      {label}
      {required && <span className="required-star" aria-hidden="true"> *</span>}
    </span>
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
    />
  </label>
);

export const SelectField = ({
  label,
  value,
  onChange,
  required = false,
  id,
  children,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  id?: string;
  children: React.ReactNode;
}) => (
  <label className="field" htmlFor={id}>
    <span>
      {label}
      {required && <span className="required-star" aria-hidden="true"> *</span>}
    </span>
    <select
      id={id}
      value={value ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
    >
      <option value="" disabled>
        Select an option
      </option>
      {children}
    </select>
  </label>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({
  children,
  tone = "navy",
}: {
  children: React.ReactNode;
  tone?: "navy" | "gold" | "green" | "red";
}) => <span className={`badge badge-${tone}`}>{children}</span>;

// ── Section heading ───────────────────────────────────────────────────────────
export const SectionHead = ({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  center?: boolean;
}) => (
  <div className={`section-head ${center ? "center" : ""}`}>
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {body && <p>{body}</p>}
  </div>
);

// ── Page hero banner ──────────────────────────────────────────────────────────
export function PageHero({
  eyebrow,
  title,
  body,
  image,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image?: string;
}) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{body}</p>
        </div>
        {image && <img src={image} alt="Vivadoxa music school" />}
      </div>
    </section>
  );
}

// ── Success / confirmation state ──────────────────────────────────────────────
export function Success({
  title,
  body,
  onReset,
  extra,
  action = "Send another request",
}: {
  title: string;
  body: string;
  onReset: () => void;
  extra?: string;
  action?: string;
}) {
  return (
    <div className="success-state" role="status">
      <div className="success-icon">
        <Icon name="check" size={30} />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      {extra && <strong className="ref-display">{extra}</strong>}
      <Button onClick={onReset}>{action}</Button>
    </div>
  );
}

// ── CTA strip ─────────────────────────────────────────────────────────────────
export function Cta({ go }: { go: (p: Page) => void }) {
  return (
    <section className="cta">
      <div className="container">
        <div>
          <span className="eyebrow">Your next chapter</span>
          <h2>
            There is music in you.
            <br />
            Let&apos;s bring it out.
          </h2>
        </div>
        <Button onClick={() => go("apply")}>
          Apply for admission <Icon name="arrow" />
        </Button>
      </div>
    </section>
  );
}

// ── Upload dropzone ───────────────────────────────────────────────────────────
export function UploadZone({
  label,
  hint,
  accept,
  onChange,
  fileName,
}: {
  label: string;
  hint: string;
  accept?: string;
  onChange?: (files: FileList | null) => void;
  fileName?: string;
}) {
  return (
    <label className={`upload full${fileName ? " upload-has-file" : ""}`}>
      <Icon name="upload" />
      <strong>{fileName ? fileName : label}</strong>
      <span>{fileName ? "Click to replace" : hint}</span>
      <input
        type="file"
        accept={accept}
        onChange={onChange ? (e) => onChange(e.target.files) : undefined}
      />
    </label>
  );
}

// ── Copy-to-clipboard button ───────────────────────────────────────────────────
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }}
      aria-label={copied ? "Copied!" : `Copy ${text}`}
    >
      <Icon name="copy" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
