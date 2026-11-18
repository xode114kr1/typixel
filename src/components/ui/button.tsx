import type { ComponentPropsWithRef } from "react";
import styles from "./button.module.css";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
};

/** 공통 버튼 스타일을 적용하고, 별도 타입을 지정하지 않으면 폼 제출을 방지한다. */
export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
    />
  );
}
