"use client";

import { useId, useState } from "react";
import { LuCircleUserRound, LuLogOut } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import styles from "./account-menu.module.css";

export function AccountMenu({ name }: { name: string }) {
  const menuId = useId();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  /** 현재 세션을 종료하고 실패하면 같은 메뉴에서 재시도할 수 있게 한다. */
  async function handleSignOut() {
    setPending(true);
    setFailed(false);

    try {
      const { error } = await authClient.signOut();
      if (error) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className={styles.trigger}
        aria-label="Account options"
        popoverTarget={menuId}
      >
        <LuCircleUserRound aria-hidden="true" />
      </Button>
      <div id={menuId} popover="auto" role="group" aria-label="Account options" className={styles.menu}>
        <p className={styles.name}>{name}</p>
        <Button variant="ghost" className={styles.signOut} onClick={handleSignOut} disabled={pending}>
          <LuLogOut aria-hidden="true" />
          {pending ? "Signing out…" : "Sign out"}
        </Button>
        {failed && <p className={styles.error} role="alert">Couldn’t sign out. Please try again.</p>}
      </div>
    </>
  );
}
