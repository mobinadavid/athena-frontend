"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function OtpInput({
  value,
  onChange,
  length = 5,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}) {
  return (
    <InputOTP
      maxLength={length}
      value={value}
      onChange={onChange}
      disabled={disabled}
      pattern={REGEXP_ONLY_DIGITS}
      containerClassName="justify-center"
    >
      <InputOTPGroup>
        {Array.from({ length }).map((_, index) => (
          <InputOTPSlot key={index} index={index} className="size-10 text-base" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
