"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ChatWindow } from "@/components/chat-window"
import { useEffect } from "react"
import { useChatStore } from "@/lib/store"

export default function Page() {
  const load = useChatStore((s) => s.loadConversations)
  const selectedId = useChatStore((s) => s.selectedId)
  const select = useChatStore((s) => s.select)
  const create = useChatStore((s) => s.createConversation)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    // Auto-select first conversation after loading if none is selected
    // This is handled within loadConversations too, but keep as a safety.
    // No-op here to avoid excess logic.
  }, [selectedId])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl sm:-left-10 sm:h-[22rem] sm:w-[22rem]" />
        <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl sm:-right-10 sm:h-[24rem] sm:w-[24rem]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.08),_transparent_60%)]" />
      </div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative z-10 flex min-h-screen flex-col">
          <main className="flex flex-1 flex-col px-4 pb-10 pt-6 sm:px-8 lg:px-14">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
              <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 px-5 py-5 shadow-[0_25px_80px_-35px_rgba(16,185,129,0.45)] backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200 shadow-inner shadow-emerald-500/20 sm:text-xs">
                    Takeshi AI
                  </span>
                  <h1 className="text-2xl font-semibold text-white sm:text-3xl">Percakapan cerdas dengan sentuhan futuristik</h1>
                  <p className="text-sm text-white/70 sm:text-base">
                    Nikmati pengalaman chat yang mulus di perangkat apa pun. Mulai percakapan baru atau lanjutkan yang sudah ada hanya dalam satu sentuhan.
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/80">
                    {selectedId ? "Percakapan aktif siap dilanjutkan" : "Belum ada percakapan dipilih"}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <SidebarTrigger className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20" />
                  <button
                    onClick={() =>
                      create().then((id) => {
                        select(id)
                      })
                    }
                    className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_15px_40px_-25px_rgba(16,185,129,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Chat Baru
                  </button>
                </div>
              </header>

              <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-[0_40px_120px_-40px_rgba(59,130,246,0.45)]">
                <ChatWindow />
              </section>

              <footer className="text-center text-xs text-white/60">
                Dibangun untuk menemani kreativitas dan produktivitas Anda setiap saat.
              </footer>
            </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}