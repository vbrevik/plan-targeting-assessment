"use client"

import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, X } from "lucide-react"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(function ({ id, title, description, variant, action, ...props }) {
                return (
                    <div
                        key={id}
                        className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all 
              ${variant === 'destructive'
                                ? 'border-red-900 bg-red-950 text-red-50'
                                : 'border-slate-800 bg-slate-950 text-slate-50'
                            }`}
                        {...props}
                    >
                        <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                                {variant === 'destructive' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                {title && <div className="text-sm font-semibold">{title}</div>}
                            </div>
                            {description && (
                                <div className="text-xs opacity-90">{description}</div>
                            )}
                        </div>
                        {action}
                        <button
                            onClick={() => dismiss(id)}
                            className="absolute right-2 top-2 rounded-md p-1 text-slate-50/50 opacity-0 transition-opacity hover:text-slate-50 focus:opacity-100 focus:outline-none group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
