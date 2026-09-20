"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Job } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type PlatformCopy = {
  skip: string; official: string; checked: string; jobs: string; advisory: string; process: string;
  account: string; member: string; language: string; eyebrow: string; title: string; titleAccent: string;
  lead: string; viewJobs: string; generalApply: string; statCountries: string; statProfiles: string;
  statOpportunities: string; routeTitle: string; routeText: string; all: string; country: string; sector: string;
  show: string; assessment: string; memberEyebrow: string; memberTitle: string; memberText: string;
  memberBenefit1: string; memberBenefit2: string; memberBenefit3: string; openMembership: string;
  currentEyebrow: string; currentTitle: string; currentText: string; officialSource: string; verify: string;
  interested: string; moreTitle: string; moreText: string; eures: string; advisoryTitle: string; advisoryText: string;
  skilledTitle: string; skilledText: string; countriesTitle: string; countriesText: string; processTitle: string;
  steps: string[]; footerLine: string; corporate: string; privacy: string; terms: string;
  membershipDialog: string; membershipDescription: string; fullName: string; email: string; phone: string;
  occupation: string; cv: string; cvHelp: string; consent: string; saveMembership: string; saving: string;
  membershipSuccess: string; applicationDialog: string; applicationDescription: string; targetRole: string;
  targetCountry: string; experience: string; sendApplication: string; applicationSuccess: string;
  error: string; invalidCv: string; signIn: string;
};

type Props = {
  locale: "tr" | "en";
  brand: string;
  languageHref: string;
  jobs: Job[];
  copy: PlatformCopy;
  user: { displayName: string; email: string } | null;
  signInPath: string;
};

export function CareerPlatform({ locale, brand, languageHref, jobs, copy, user, signInPath }: Props) {
  const [country, setCountry] = useState(copy.all);
  const [sector, setSector] = useState(copy.all);
  const [selected, setSelected] = useState<Job | null>(null);
  const [memberOpen, setMemberOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [memberState, setMemberState] = useState<"idle"|"loading"|"success"|"error"|"invalid">("idle");
  const [applyState, setApplyState] = useState<"idle"|"loading"|"success"|"error"|"invalid">("idle");

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const countries = useMemo(() => [copy.all, ...Array.from(new Set(jobs.map((j) => j.country)))], [copy.all, jobs]);
  const sectors = useMemo(() => [copy.all, ...Array.from(new Set(jobs.map((j) => j.sector)))], [copy.all, jobs]);
  const shown = jobs.filter((j) => (country === copy.all || j.country === country) && (sector === copy.all || j.sector === sector));

  async function submitForm(event: FormEvent<HTMLFormElement>, endpoint: string, setState: typeof setMemberState) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("cv");
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) {
      setState("invalid");
      return;
    }
    setState("loading");
    try {
      const response = await fetch(endpoint, { method: "POST", body: new FormData(form) });
      if (response.ok) {
        setState("success");
        form.reset();
      } else {
        const body = await response.json().catch(() => ({}));
        setState(body.error === "invalid_cv" ? "invalid" : "error");
      }
    } catch {
      setState("error");
    }
  }

  function startApplication(job?: Job) {
    setSelected(job ?? null);
    setApplyState("idle");
    setApplyOpen(true);
  }

  return <div>
    <a className="skip" href="#main">{copy.skip}</a>
    <div className="topbar"><div className="wrap"><span className="official"><i />{copy.official}</span><span>{copy.checked}</span></div></div>
    <header><nav className="nav wrap">
      <a className="brand" href="#"><img src="/logo.svg" alt="" /><span>{brand}</span></a>
      <div className="links">
        <a href="#jobs">{copy.jobs}</a><a href="#advisory">{copy.advisory}</a><a href="#process">{copy.process}</a>
        <a className="lang-switch" href={languageHref}>{copy.language}</a>
        {user ? <a className="btn secondary" href={locale === "tr" ? "/account" : "/en/account"}>{copy.account}</a> : <a className="btn secondary" href={signInPath}>{copy.signIn}</a>}
        <Button className="btn primary" onClick={() => { setMemberState("idle"); setMemberOpen(true); }}>{copy.member}</Button>
      </div>
    </nav></header>

    <main id="main">
      <section className="hero"><div className="wrap hero-grid"><div>
        <span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title} <span>{copy.titleAccent}</span></h1>
        <p className="lead">{copy.lead}</p>
        <div className="hero-actions"><a className="btn primary" href="#jobs">{copy.viewJobs}</a><Button className="btn secondary" onClick={() => startApplication()}>{copy.generalApply}</Button></div>
        <div className="trust-row"><div><strong>4+</strong><small>{copy.statCountries}</small></div><div><strong>360°</strong><small>{copy.statProfiles}</small></div><div><strong>{jobs.length}</strong><small>{copy.statOpportunities}</small></div></div>
      </div>
      <form className="search-panel" onSubmit={(e) => { e.preventDefault(); document.querySelector("#jobs")?.scrollIntoView(); }}>
        <h2>{copy.routeTitle}</h2><p>{copy.routeText}</p>
        <div className="field"><Label htmlFor="country">{copy.country}</Label><select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>{countries.map((v) => <option key={v}>{v}</option>)}</select></div>
        <div className="field"><Label htmlFor="sector">{copy.sector}</Label><select id="sector" value={sector} onChange={(e) => setSector(e.target.value)}>{sectors.map((v) => <option key={v}>{v}</option>)}</select></div>
        <Button className="btn teal" type="submit">{copy.show}</Button><p className="micro">{copy.assessment}</p>
      </form></div></section>

      <section className="membership" id="membership"><div className="wrap member-shell">
        <div><span className="eyebrow">{copy.memberEyebrow}</span><h2>{copy.memberTitle}</h2><p>{copy.memberText}</p></div>
        <div className="member-benefits"><span>✓ {copy.memberBenefit1}</span><span>✓ {copy.memberBenefit2}</span><span>✓ {copy.memberBenefit3}</span></div>
        <Button className="btn primary" onClick={() => setMemberOpen(true)}>{copy.openMembership}</Button>
      </div></section>

      <section id="jobs"><div className="wrap"><div className="section-head"><div><span className="eyebrow">{copy.currentEyebrow}</span><h2>{copy.currentTitle}</h2><p>{copy.currentText}</p></div><span className="count">{shown.length}</span></div>
        <div className="filters">{countries.map((v) => <button key={v} className="chip" aria-pressed={country === v} onClick={() => setCountry(v)}>{v}</button>)}</div>
        <div className="filters">{sectors.map((v) => <button key={v} className="chip" aria-pressed={sector === v} onClick={() => setSector(v)}>{v}</button>)}</div>
        <div className="jobs">{shown.map((job) => <article className="job" key={job.title + job.city}>
          <div className="job-top"><span className="flag">{job.flag}</span><span className="verified">{copy.officialSource}</span></div>
          <h3>{job.title}</h3><div className="company">{job.company}</div>
          <div className="meta"><span>{job.country}</span><span>{job.city}</span><span>{job.sector}</span><span>{job.type}</span></div>
          <footer><div><a href={job.url} target="_blank" rel="noopener noreferrer">{copy.verify} ↗</a><div className="source">{job.source}</div></div><Button className="btn secondary" onClick={() => startApplication(job)}>{copy.interested}</Button></footer>
        </article>)}</div>
        <div className="more"><div><h3>{copy.moreTitle}</h3><p>{copy.moreText}</p></div><a className="btn" target="_blank" rel="noopener noreferrer" href="https://eures.europa.eu/jobseekers_en">{copy.eures} ↗</a></div>
      </div></section>

      <section className="scope" id="advisory"><div className="wrap"><div className="section-head"><div><span className="eyebrow">{copy.advisory}</span><h2>{copy.advisoryTitle}</h2><p>{copy.advisoryText}</p></div></div>
        <div className="scope-grid"><article className="scope-card"><span className="scope-mark">01</span><h3>{copy.skilledTitle}</h3><p>{copy.skilledText}</p></article><article className="scope-card dark"><span className="scope-mark">02</span><h3>{copy.countriesTitle}</h3><p>{copy.countriesText}</p></article></div>
      </div></section>

      <section id="process"><div className="wrap"><div className="section-head"><div><span className="eyebrow">{copy.process}</span><h2>{copy.processTitle}</h2></div></div><div className="process-grid">{copy.steps.map((step) => <article className="step" key={step}><h3>{step}</h3></article>)}</div></div></section>
    </main>
    <footer className="site-footer"><div className="wrap"><div className="footer-grid"><div><a className="brand" href="#"><img src="/logo.svg" alt="" /><span>{brand}</span></a><p>{copy.footerLine}</p></div><div><h3>{copy.corporate}</h3><a href="#membership">{copy.member}</a><a href="#advisory">{copy.advisory}</a></div><div><h3>{copy.officialSource}</h3><a href="https://eures.europa.eu/jobseekers_en">EURES</a><a href="https://www.make-it-in-germany.com/en/working-in-germany/job-listings">Make it in Germany</a></div><div><h3>{copy.privacy}</h3><a href="#process">{copy.terms}</a></div></div><div className="legal-warning">© 2026 {brand}. {copy.footerLine}</div></div></footer>

    <Dialog open={memberOpen} onOpenChange={setMemberOpen}><DialogContent className="dialog-card"><DialogHeader><DialogTitle>{copy.membershipDialog}</DialogTitle><DialogDescription>{copy.membershipDescription}</DialogDescription></DialogHeader>
      {user ? <form onSubmit={(e) => submitForm(e, "/api/member", setMemberState)}>
        <input type="hidden" name="locale" value={locale} />
        <div className="form-grid"><div className="field"><Label htmlFor="member-name">{copy.fullName}</Label><Input id="member-name" name="fullName" defaultValue={user.displayName} required /></div><div className="field"><Label htmlFor="member-email">{copy.email}</Label><Input id="member-email" value={user.email} readOnly /></div><div className="field"><Label htmlFor="member-phone">{copy.phone}</Label><Input id="member-phone" name="phone" type="tel" required /></div><div className="field"><Label htmlFor="member-occupation">{copy.occupation}</Label><Input id="member-occupation" name="occupation" required /></div></div>
        <FileField id="member-cv" copy={copy} />
        <Consent copy={copy} id="member-consent" />
        <Button className="btn primary full" disabled={memberState === "loading"}>{memberState === "loading" ? copy.saving : copy.saveMembership}</Button>
        <FormMessage state={memberState} success={copy.membershipSuccess} copy={copy} />
      </form> : <a className="btn primary full" href={signInPath}>{copy.signIn}</a>}
    </DialogContent></Dialog>

    <Dialog open={applyOpen} onOpenChange={setApplyOpen}><DialogContent className="dialog-card"><DialogHeader><DialogTitle>{copy.applicationDialog}</DialogTitle><DialogDescription>{copy.applicationDescription}</DialogDescription></DialogHeader>
      {user ? <form onSubmit={(e) => submitForm(e, "/api/applications", setApplyState)}>
        <input type="hidden" name="jobTitle" value={selected?.title ?? copy.generalApply} />
        <input type="hidden" name="country" value={selected?.country ?? copy.all} />
        <div className="selected-role"><strong>{selected?.title ?? copy.generalApply}</strong><span>{selected?.country ?? copy.all}</span></div>
        <div className="field"><Label htmlFor="apply-profession">{copy.occupation}</Label><Input id="apply-profession" name="profession" required /></div>
        <div className="field"><Label htmlFor="apply-message">{copy.experience}</Label><Textarea id="apply-message" name="message" /></div>
        <FileField id="apply-cv" copy={copy} />
        <Consent copy={copy} id="apply-consent" />
        <Button className="btn primary full" disabled={applyState === "loading"}>{applyState === "loading" ? copy.saving : copy.sendApplication}</Button>
        <FormMessage state={applyState} success={copy.applicationSuccess} copy={copy} />
      </form> : <a className="btn primary full" href={signInPath}>{copy.signIn}</a>}
    </DialogContent></Dialog>
  </div>;
}

function FileField({ id, copy }: { id: string; copy: PlatformCopy }) {
  return <div className="field file-field"><Label htmlFor={id}>{copy.cv} *</Label><Input id={id} name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /><small>{copy.cvHelp}</small></div>;
}

function Consent({ id, copy }: { id: string; copy: PlatformCopy }) {
  return <div className="consent"><Checkbox id={id} required /><Label htmlFor={id}>{copy.consent}</Label></div>;
}

function FormMessage({ state, success, copy }: { state: string; success: string; copy: PlatformCopy }) {
  if (state === "success") return <div className="form-message success">{success}</div>;
  if (state === "invalid") return <div className="form-message error">{copy.invalidCv}</div>;
  if (state === "error") return <div className="form-message error">{copy.error}</div>;
  return null;
}
