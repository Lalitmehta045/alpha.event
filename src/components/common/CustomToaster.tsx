"use client";

import { Toaster, toast } from "react-hot-toast";

export default function CustomToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 80,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          maxWidth: "500px",
          width: "100%",
        },
        success: {
          duration: 4000,
          icon: null,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
          },
        },
        error: {
          duration: 5000,
          icon: null,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
          },
        },
        loading: {
          icon: null,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
          },
        },
      }}
    >
      {(t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const isLoading = t.type === "loading";

        const borderColor = isSuccess
          ? "bg-green-500"
          : isError
          ? "bg-red-500"
          : "bg-blue-500";

        const rawMessage =
          typeof t.message === "function" ? t.message(t) : t.message;

        const sanitizeMessage = (msg: string) =>
          msg.replace(/(✅|⚠️|❌|🎉|📧|🔐|🔒|🗑️|👋|🔄|🛡️|🚫)/g, "").trim();

        const message =
          typeof rawMessage === "string" ? sanitizeMessage(rawMessage) : rawMessage;

        return (
          <div
            className={`flex items-center gap-4 p-4 relative rounded-md shadow-[0_2px_16px_-3px_rgba(144,144,144,0.4)] bg-white transition-all ${
              t.visible ? "animate-enter" : "animate-leave"
            }`}
            role="alert"
          >
            <span
              className={`block absolute w-1 rounded-full h-[80%] my-auto top-0 bottom-0 left-2 ${borderColor}`}
            ></span>
            <div className="flex items-center gap-4 ml-3">
              {isSuccess && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="shrink-0 w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
              )}
              {isError && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="shrink-0 w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9 9 15" />
                  <path d="M9 9l6 6" />
                </svg>
              )}
              {isLoading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="shrink-0 w-6 h-6 text-blue-500 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              )}
              <div className="flex-1">
                {typeof message === "string" ? (
                  <div className="text-slate-900 text-sm font-medium">
                    {message}
                  </div>
                ) : (
                  message
                )}
              </div>
            </div>
            {!isLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 w-[14px] h-[14px] ml-auto cursor-pointer fill-gray-400 hover:fill-red-400 transition-colors"
                viewBox="0 0 320.591 320.591"
                onClick={() => toast.dismiss(t.id)}
              >
                <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
                <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
              </svg>
            )}
          </div>
        );
      }}
    </Toaster>
  );
}
