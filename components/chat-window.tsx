"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import type { Message } from "@/types/chat"

function NeonTyping() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-3xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
    >
      <span className="block h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
      <span className="flex items-center gap-2 text-xs">
        <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-emerald-100/80">
          Takeshi mengetik
        </span>
        <span className="relative inline-flex h-3 w-5 overflow-hidden">
          <span className="absolute inset-0 animate-[typing_1.2s_infinite_steps(3)]">
            <span className="pr-1">.</span>
            <span className="pr-1">.</span>
            <span className="pr-1">.</span>
          </span>
        </span>
      </span>
      <style>
        {`@keyframes typing { 
            0% { transform: translateX(-100%); } 
            100% { transform: translateX(0%); } 
          }`}
      </style>
    </div>
  )
}

export function ChatWindow() {
  const selectedId = useChatStore((s) => s.selectedId)
  const conversations = useChatStore((s) => s.conversations)
  const addMessage = useChatStore((s) => s.addMessage)
  const rename = useChatStore((s) => s.renameConversation)
  const create = useChatStore((s) => s.createConversation)
  const select = useChatStore((s) => s.select)

  const convo = useMemo(() => conversations.find((c) => c.id === selectedId), [conversations, selectedId])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedId && conversations.length === 0) {
      create().then((id) => select(id))
    }
  }, [selectedId, conversations.length, create, select])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [convo?.messages?.length, isLoading])

  const send = async () => {
    const text = input.trim()
    if (!text) return

    let targetId = selectedId
    if (!targetId) {
      targetId = await create()
      select(targetId)
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    }
    await addMessage(targetId!, userMsg)

    const current = conversations.find((c) => c.id === targetId)
    if (current && (!current.title || current.title === "New Chat")) {
      const title = text.slice(0, 48)
      await rename(targetId!, title)
    }

    setInput("")
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const apiUrl = new URL("https://api.nekolabs.my.id/ai/gpt/4o")
      apiUrl.searchParams.set("text", text)

      const res = await fetch(apiUrl.toString(), { method: "GET", signal: controller.signal })
      clearTimeout(timeout)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format")
      }

      let answer = ""

      if (data.status === true && typeof (data as { result?: string }).result === "string") {
        answer = (data as { result: string }).result
      } else if (typeof (data as { result?: string }).result === "string") {
        answer = (data as { result: string }).result
      } else if (typeof (data as { message?: string }).message === "string") {
        answer = (data as { message: string }).message
      } else if (typeof (data as { answer?: string }).answer === "string") {
        answer = (data as { answer: string }).answer
      } else if (typeof (data as { output?: string }).output === "string") {
        answer = (data as { output: string }).output
      } else {
        throw new Error("No valid response content found")
      }

      const cleanAnswer = String(answer).trim()
      if (!cleanAnswer) {
        throw new Error("Empty response received")
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: cleanAnswer,
        createdAt: Date.now(),
      }
      await addMessage(targetId!, aiMsg)
    } catch (err: any) {
      console.error("Chat API Error:", err)

      let errorMessage = "There was an error fetching a response. Please try again in a moment."

      if (err.name === "AbortError") {
        errorMessage = "Request timed out. Please try again with a shorter message."
      } else if (err.message?.includes("HTTP")) {
        errorMessage = "Server error occurred. Please try again later."
      } else if (err.message?.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMessage,
        createdAt: Date.now(),
      }

      if (targetId) {
        await addMessage(targetId, aiMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!convo) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center p-4">
        <div className="max-w-md text-center text-white/70">
          <div className="text-lg font-semibold text-emerald-300">Welcome to Takeshi - Chat</div>
          <p className="mt-2 text-sm">Start a conversation using the input below or create a new chat from the sidebar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[420px] flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8" aria-label="Riwayat percakapan">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {convo.messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}
          {isLoading && (
            <div className="flex w-full justify-start">
              <NeonTyping />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/5 px-3 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Tanyakan apa saja..."
              className="min-h-[3.25rem] flex-1 rounded-2xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
              aria-label="Pesan Anda"
              disabled={isLoading}
            />
            <Button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Kirim
            </Button>
          </div>
          <p className="mt-2 text-xs text-white/40">
            Tekan <span className="rounded-md bg-white/10 px-1 py-0.5 text-[11px]">Enter</span> untuk mengirim,{" "}
            <span className="rounded-md bg-white/10 px-1 py-0.5 text-[11px]">Shift + Enter</span> untuk baris baru.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble(props: { role: Message["role"]; content: string }) {
  const isUser = props.role === "user"
  return (
    <div className={"group flex w-full " + (isUser ? "justify-end" : "justify-start")}>
      <div
        className={
          "relative max-w-[88%] rounded-3xl px-5 py-4 text-sm shadow-lg transition md:max-w-[70%] " +
          (isUser
            ? "border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/40 via-fuchsia-500/30 to-indigo-500/30 text-fuchsia-50"
            : "border border-emerald-400/40 bg-gradient-to-br from-emerald-500/40 via-emerald-500/25 to-cyan-500/20 text-emerald-50")
        }
      >
        <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wide text-white/70">
          {isUser ? "Anda" : "Takeshi"}
        </span>
        <div className="whitespace-pre-wrap text-white/90">{props.content}</div>
      </div>
    </div>
  )
}