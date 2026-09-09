"use client";

import { useState } from "react";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) {
          setSubmitted(true);
          setEmail("");
          setTimeout(() => setSubmitted(false), 3000);
        }
      }}
      className="flex gap-2"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <button type="submit" className="btn btn-primary">
        {submitted ? "✓ Subscribed" : "Subscribe"}
      </button>
    </form>
  );
};

export default NewsletterForm;
