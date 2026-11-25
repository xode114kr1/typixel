"use client";

import Image from "next/image";
import { startTransition, useEffect, useRef, useState } from "react";
import { LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import styles from "./sign-in-dialog.module.css";

export function SignInDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  // Google에서 인증이 취소되거나 실패하면 스튜디오에서 다시 시도할 수 있게 한다.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("signIn") !== "failed") return;

    url.searchParams.delete("signIn");
    url.searchParams.delete("error");
    url.searchParams.delete("error_description");
    window.history.replaceState(null, "", url);
    dialog.current?.showModal();
    startTransition(() => setFailed(true));
  }, []);

  /** Google 인증을 시작하고 요청에 실패하면 재시도 안내를 표시한다. */
  async function handleSignIn() {
    setPending(true);
    setFailed(false);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/?signIn=failed",
      });
      if (error) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  /** 모달을 닫으면 오류 표시를 지우고 헤더 버튼에 포커스를 돌려준다. */
  function handleClose() {
    setFailed(false);
    trigger.current?.focus();
  }

  return (
    <>
      <Button
        ref={trigger}
        variant="secondary"
        aria-haspopup="dialog"
        aria-controls="studio-sign-in"
        onClick={() => dialog.current?.showModal()}
      >
        Sign in
      </Button>
      <dialog
        id="studio-sign-in"
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="studio-sign-in-title"
        aria-describedby="studio-sign-in-description"
        onClose={handleClose}
        onClick={(event) => {
          // 패널 바깥의 배경을 클릭했을 때만 닫는다.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className={styles.content}>
          <Button
            variant="ghost"
            className={styles.close}
            aria-label="Close sign in"
            onClick={() => dialog.current?.close()}
          >
            <LuX aria-hidden="true" />
          </Button>
          <div className={styles.intro}>
            <h2 id="studio-sign-in-title">Welcome to Typixel</h2>
            <p id="studio-sign-in-description">
              Sign in to manage your ASCII videos.
            </p>
          </div>
          <div className={styles.signIn}>
            <Button
              variant="secondary"
              onClick={handleSignIn}
              disabled={pending}
            >
              <Image
                src="/google-g.png"
                alt=""
                width={18}
                height={18}
                className={styles.logo}
                unoptimized
              />
              {pending ? "Connecting to Google…" : "Continue with Google"}
            </Button>
            {failed && (
              <p role="alert">
                Couldn’t sign in with Google. Please try again.
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            className={styles.guest}
            onClick={() => dialog.current?.close()}
          >
            Continue as guest
          </Button>
        </div>
      </dialog>
    </>
  );
}
