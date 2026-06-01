"use client";

import React from "react";
import ActionButton from "./ActionButton";

export default function LoadingButton(props: {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const {
    children,
    isLoading = false,
    onClick,
    className = "",
    disabled,
  } = props;

  return (
    <ActionButton
      onClick={onClick}
      isLoading={isLoading}
      className={`px-4 py-2 cursor-pointer ${className}`}
      disabled={disabled}
    >
      {children}
    </ActionButton>
  );
}
