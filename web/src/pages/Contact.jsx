import { useState } from "react";
import { contact, site } from "../data/site";
import { Reveal, Eyebrow, Arrow } from "../components/ui";

const empty = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  topic: contact.topics[0],
  channel: contact.channels[0],
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // No backend: compose a pre-filled email the user can send.
    const body = encodeURIComponent(
      `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\nPhone: ${form.phone}\n` +
        `Topic: ${form.topic}\nPreferred contact: ${form.channel}\n\n${form.message}`
    );
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      "Counselling enquiry — " + form.topic
    )}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <section className="container-x pb-10 pt-12 md:pt-16">
        <Reveal>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="display-lg mt-6 max-w-3xl">{contact.heading}</h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">{contact.blurb}</p>
        </Reveal>
      </section>

      <section className="container-x grid gap-6 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Form */}
        <Reveal>
          <form onSubmit={onSubmit} className="card-brutal p-6 md:p-8">
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral text-white">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold">Your email is ready to send</h2>
                <p className="mt-3 max-w-sm text-ink-soft">
                  We've opened your mail app with the details filled in. Prefer chat? Reach us on
                  WhatsApp and we'll reply quickly.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <a href={`https://wa.me/${site.phones[0].raw}`} className="btn btn-primary">
                    WhatsApp us <Arrow />
                  </a>
                  <button type="button" onClick={() => setSent(false)} className="btn btn-ghost">
                    Edit details
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" required>
                    <input className="inp" required value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                  </Field>
                  <Field label="Last name">
                    <input className="inp" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Email" required>
                    <input type="email" className="inp" required value={form.email} onChange={set("email")} autoComplete="email" />
                  </Field>
                  <Field label="Phone" required>
                    <input type="tel" className="inp" required value={form.phone} onChange={set("phone")} autoComplete="tel" />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="I'm asking about">
                    <select className="inp" value={form.topic} onChange={set("topic")}>
                      {contact.topics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred reply via">
                    <select className="inp" value={form.channel} onChange={set("channel")}>
                      {contact.channels.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Your question" required>
                  <textarea rows={4} className="inp resize-none" required value={form.message} onChange={set("message")} placeholder="Write any doubt you have about design or design education…" />
                </Field>

                <button type="submit" className="btn btn-primary w-full justify-center">
                  Send enquiry <Arrow />
                </button>
              </div>
            )}
          </form>
        </Reveal>

        {/* Details */}
        <Reveal delay={0.1}>
          <div className="flex h-full flex-col gap-4">
            <div className="card-brutal flex-1 p-7">
              <Eyebrow className="mb-5">Reach us directly</Eyebrow>
              <a href={`mailto:${site.email}`} className="block font-display text-lg font-bold link-underline">
                {site.email}
              </a>
              <ul className="mt-5 space-y-3">
                {site.phones.map((p) => (
                  <li key={p.raw} className="flex items-center justify-between">
                    <a href={`tel:${p.raw}`} className="font-display font-semibold hover:text-coral">{p.number}</a>
                    <span className="text-xs text-ink-soft">{p.label}</span>
                  </li>
                ))}
              </ul>
              <a href={site.instagram.url} className="mt-5 inline-flex items-center gap-2 text-coral">
                {site.instagram.handle} <Arrow className="h-4 w-4" />
              </a>
            </div>

            <div className="card-brutal p-7">
              <Eyebrow className="mb-4">Studio</Eyebrow>
              <p className="text-ink-soft">{site.address.lines.join(" ")}</p>
              <div className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                {site.hours.map((h) => (
                  <div key={h.day} className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{h.day}</span>
                    <span className="font-display font-semibold">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block font-display text-sm font-semibold">
        {label} {required && <span className="text-coral">*</span>}
      </span>
      {children}
    </label>
  );
}
