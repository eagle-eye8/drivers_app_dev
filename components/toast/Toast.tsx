"use client";

import { Transition } from "@headlessui/react";
import { Fragment } from "react";

export function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <Transition
      as={Fragment}
      appear
      show
      enter="transform transition duration-300"
      enterFrom="translate-y-4 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transform transition duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-white
          ${type === "success" ? "bg-green-600" : "bg-red-600"}
        `}
      >
        {message}
      </div>
    </Transition>
  );
}
