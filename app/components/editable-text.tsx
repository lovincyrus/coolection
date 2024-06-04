import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function EditableText({
  fieldName,
  value: initialValue,
  inputClassName,
  inputLabel,
  buttonClassName,
  buttonLabel,
  onSubmit,
}: {
  fieldName: string;
  value: string;
  inputClassName?: string;
  inputLabel: string;
  buttonClassName?: string;
  buttonLabel: string;
  onSubmit: (_newValue: string) => void;
}) {
  let [edit, setEdit] = useState(false);
  let [value, setValue] = useState(initialValue);
  let inputRef = useRef<HTMLInputElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);

  return edit ? (
    <form
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        // Early return if the value hasn't changed
        if (value === initialValue) {
          flushSync(() => {
            setEdit(false);
          });
          return;
        }
        onSubmit(value);
        flushSync(() => {
          setEdit(false);
        });
        buttonRef.current?.focus();
      }}
    >
      <Input
        required
        ref={inputRef}
        type="text"
        aria-label={inputLabel}
        name={fieldName}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        className={cn(
          "flex h-6 select-none items-center justify-center rounded-full border bg-gray-50 px-3 text-center text-xs font-medium",
          inputClassName,
        )}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === "Escape") {
            flushSync(() => {
              setEdit(false);
              setValue(initialValue);
            });
            buttonRef.current?.focus();
          }
        }}
        onBlur={() => {
          if (
            inputRef.current?.value !== initialValue &&
            inputRef.current?.value.trim() !== ""
          ) {
            onSubmit(value);
          }
          setEdit(false);
        }}
      />
    </form>
  ) : (
    <Button
      aria-label={buttonLabel}
      type="button"
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEdit(true);
        });
        inputRef.current?.select();
      }}
      className={cn(
        "flex h-6 max-w-[240px] cursor-text select-none items-center justify-center truncate rounded-full border bg-gray-50 px-3 text-center text-xs font-medium hover:bg-gray-200",
        buttonClassName,
      )}
    >
      <span className="inline-block max-w-[240px] truncate whitespace-nowrap">
        {value}
      </span>
    </Button>
  );
}
