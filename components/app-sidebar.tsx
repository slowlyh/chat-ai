"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MessageSquare } from "lucide-react"
import { useChatStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const conversations = useChatStore((s) => s.conversations)
  const selectedId = useChatStore((s) => s.selectedId)
  const select = useChatStore((s) => s.select)
  const create = useChatStore((s) => s.createConversation)
  const remove = useChatStore((s) => s.deleteConversation)
  const [query, setQuery] = useState("")

  useEffect(() => {
    // ensure conversations sorted on every update
  }, [conversations])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => (c.title || "Untitled").toLowerCase().includes(q))
  }, [conversations, query])

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-white/10 bg-black/70 text-white backdrop-blur">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/40">
            <MessageSquare className="h-5 w-5 text-emerald-300" />
           </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.35em] text-white/50">Takeshi</div>
            <div className="text-base font-semibold text-white">Chat Studio</div>
           </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-xl border border-emerald-400/30 bg-emerald-500/20 text-emerald-100 transition hover:bg-emerald-500/30 hover:text-white"
            onClick={() => create().then((id) => select(id))}
            aria-label="Percakapan baru"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wide text-white/60">Riwayat</SidebarGroupLabel>
          <div className="px-4 pb-3">
            <Input
              placeholder="Search chats..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
             />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.id === selectedId}
                    className={cn(
                      "data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-100 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        select(item.id)
                      }}
                      aria-current={item.id === selectedId ? "page" : undefined}
                      title={item.title || "Untitled"}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="truncate text-sm">{item.title || "Untitled"}</span>
                     </a>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    title="Delete chat"
                    className="rounded-xl hover:bg-red-500/20 hover:text-red-200"
                     onClick={() => remove(item.id)}
                    aria-label={`Delete ${item.title || "Untitled"}`}
                  >
                    <Trash2 />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
              {filtered.length === 0 && <div className="px-4 py-3 text-xs text-white/50">Tidak ada percakapan.</div>}
             </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarContent>

      <SidebarFooter className="px-4 pb-6 text-[11px] text-white/50">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          Percakapan Anda tersimpan secara lokal di browser dengan aman.
         </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}