"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "./store-provider";
import styles from "./account-panel.module.css";

export function AccountPanel() {
  const { state, hydrated, signIn, signOut } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated) return;
    setError(signIn(email, password) ?? "");
    setPassword("");
  }
  return <section className={`wrap ${styles.page}`}>
    <h1>Account</h1>
    {hydrated && state.session ? <div className={styles.panel}>
      <p>Signed in as {state.session.name}</p>
      <div className={styles.links}><Link href="/orders">Your orders</Link><Link href="/wishlist">Your wishlist</Link></div>
      <button className={styles.button} type="button" onClick={() => { signOut(); setEmail(""); setError(""); }}>Sign out</button>
    </div> : <div className={styles.panel}>
      <p>Demo account: alex@deskdrop.demo / deskdrop123. This is fixture data; there is no real sign-in.</p>
      <form method="post" onSubmit={submit} className={styles.form}>
        <label htmlFor="account-email">Email</label>
        <input id="account-email" name="email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} />
        <label htmlFor="account-password">Password</label>
        <input id="account-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} />
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.button} type="submit" disabled={!hydrated}>Sign in</button>
      </form>
    </div>}
  </section>;
}
