"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      closeButton
      position="bottom-right"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-white shrink-0 stroke-[2.5]" />
        ),
        info: (
          <InfoIcon className="size-5 text-white shrink-0 stroke-[2.5]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-slate-950 shrink-0 stroke-[2.5]" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-white shrink-0 stroke-[2.5]" />
        ),
        loading: (
          <Loader2Icon className="size-5 text-white shrink-0 animate-spin stroke-[2.5]" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:font-sans group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:p-4 group-[.toaster]:shadow-2xl",
          title: "font-extrabold text-sm leading-snug tracking-tight",
          description: "text-xs font-medium opacity-95 leading-relaxed mt-1",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-slate-900 font-bold text-xs rounded-xl px-3.5 py-1.5 shadow-md hover:bg-slate-100 transition-colors",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white font-semibold text-xs rounded-xl px-3 py-1.5",
          success:
            "!bg-emerald-600 !text-white !border-emerald-400 shadow-xl shadow-emerald-600/30",
          error:
            "!bg-rose-600 !text-white !border-rose-400 shadow-xl shadow-rose-600/30",
          warning:
            "!bg-amber-400 !text-slate-950 !border-amber-300 shadow-xl shadow-amber-400/30 font-medium",
          info:
            "!bg-sky-600 !text-white !border-sky-400 shadow-xl shadow-sky-600/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
