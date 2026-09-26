"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Camera, 
  Globe, 
  FileText, 
  Scale, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { ParsedClause } from "@/lib/pdfParser";
import { ContextOrchestrator } from "@/lib/context/contextOrchestrator";
import { askNyayaText } from "@/lib/ai/text";
import { analyzeDocumentImage } from "@/lib/ai/vision";
import { AudioCaptureManager } from "@/lib/live/audioCapture";
import { CameraManager } from "@/lib/live/cameraStream";
import { ScreenCaptureManager } from "@/lib/live/screenCapture";
import { 
  saveMessage, 
  getSessionMessages, 
  saveTimelineItem, 
  getSessionTimeline,
  StoredMessage,
  StoredTimelineItem
} from "@/lib/db";

interface NyayaLiveProps {
  document: {
    id: string;
    title: string;
    type?: string;
    clauses: ParsedClause[];
  } | null;
  selectedClause: ParsedClause | null;
  languageMode: "english" | "hinglish" | "hindi";
  onLanguageChange: (mode: "english" | "hinglish" | "hindi") => void;
  onContextChange: (ctx: {
    voiceActive: boolean;
    cameraActive: boolean;
    screenShareActive: boolean;
  }) => void;
}

export function NyayaLive({
  document,
  selectedClause,
  languageMode,
  onLanguageChange,
  onContextChange,
}: NyayaLiveProps) {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Multimodal states
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [voiceInterimText, setVoiceInterimText] = useState("");
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // Evidence Timeline extraction state
  const [timelineItems, setTimelineItems] = useState<StoredTimelineItem[]>([]);

  // Refs
  const audioManagerRef = useRef<AudioCaptureManager | null>(null);
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const screenManagerRef = useRef<ScreenCaptureManager | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const sessionId = document ? `session-${document.id}` : "session-general";

  // Load chat and timeline from IndexedDB
  useEffect(() => {
    async function loadSessionData() {
      const storedMsgs = await getSessionMessages(sessionId);
      if (storedMsgs && storedMsgs.length > 0) {
        setMessages(storedMsgs);
      } else {
        // Welcome initial message
        const welcome: StoredMessage = {
          id: `msg-${Date.now()}`,
          sessionId,
          role: "assistant",
          content: document 
            ? `Namaste! I am NyayaDrishti (न्यायदृष्टि), your Indian legal companion. I have indexed "${document.title}". You can ask me questions by typing, speak via voice (🎙), show a printed notice via camera (📹), or share your screen (🖥).`
            : "Namaste! I am NyayaDrishti, your Indian legal companion. Upload a contract, choose a sample, or ask any legal question to begin.",
          timestamp: Date.now()
        };
        setMessages([welcome]);
        await saveMessage(welcome);
      }

      const storedTimeline = await getSessionTimeline(sessionId);
      if (storedTimeline) {
        setTimelineItems(storedTimeline);
      }
    }

    loadSessionData();
  }, [sessionId, document?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, voiceInterimText]);

  // Synchronize with ContextOrchestrator
  useEffect(() => {
    const orchestrator = ContextOrchestrator.getInstance();
    orchestrator.updateContext({
      docId: document?.id,
      docTitle: document?.title,
      docType: document?.type,
      selectedClause: selectedClause,
      languageMode,
      voiceActive: isVoiceActive,
      cameraActive: isCameraActive,
      screenShareActive: isScreenActive,
      recentCameraSnapshot: capturedSnapshot,
    });

    onContextChange({
      voiceActive: isVoiceActive,
      cameraActive: isCameraActive,
      screenShareActive: isScreenActive,
    });
  }, [document, selectedClause, languageMode, isVoiceActive, isCameraActive, isScreenActive, capturedSnapshot]);

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text && !capturedSnapshot) return;

    const userMsg: StoredMessage = {
      id: `usr-${Date.now()}`,
      sessionId,
      role: "user",
      content: text || (capturedSnapshot ? "[Sent Document Image for Analysis]" : ""),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);
    await saveMessage(userMsg);

    try {
      let responseText = "";

      // If camera/screen snapshot is active, use vision
      if (capturedSnapshot) {
        const visionResult = await analyzeDocumentImage(
          capturedSnapshot,
          text || "Analyze this document image for key legal terms, dates, and Indian statutory implications.",
          document?.title
        );
        responseText = visionResult.text;
        setCapturedSnapshot(null); // Reset snapshot
      } else {
        // Standard text / voice Q&A
        const aiResponse = await askNyayaText(text, {
          activeDocTitle: document?.title,
          activeClauseText: selectedClause ? selectedClause.text : undefined,
          languageMode,
        });
        responseText = aiResponse.text;
      }

      const assistantMsg: StoredMessage = {
        id: `ast-${Date.now()}`,
        sessionId,
        role: "assistant",
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await saveMessage(assistantMsg);

      // Check if user is narrating a timeline event
      detectAndAddTimelineItem(text);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract timeline events from narrative
  const detectAndAddTimelineItem = async (text: string) => {
    const lower = text.toLowerCase();
    const dateMatch = text.match(/\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/i);

    if (dateMatch || lower.includes("bought") || lower.includes("signed") || lower.includes("vacated") || lower.includes("notice") || lower.includes("complaint")) {
      const newItem: StoredTimelineItem = {
        id: `time-${Date.now()}`,
        sessionId,
        date: dateMatch ? dateMatch[0] : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        event: text.slice(0, 120),
        parties: document?.title ? "Parties under review" : "Disputed Parties",
        evidence: lower.includes("receipt") ? "Receipt / Invoice" : lower.includes("email") ? "Email record" : "User statement",
      };
      setTimelineItems((prev) => [newItem, ...prev]);
      await saveTimelineItem(newItem);
    }
  };

  // Toggle Voice
  const handleToggleVoice = async () => {
    if (isVoiceActive) {
      audioManagerRef.current?.stopAudio();
      setIsVoiceActive(false);
      setAudioVolume(0);
      setVoiceInterimText("");
    } else {
      audioManagerRef.current = new AudioCaptureManager();
      const started = await audioManagerRef.current.startAudio(
        (transcript, isFinal) => {
          if (isFinal) {
            setVoiceInterimText("");
            handleSendMessage(transcript);
          } else {
            setVoiceInterimText(transcript);
          }
        },
        (err) => {
          console.error("Audio error:", err);
          setIsVoiceActive(false);
        }
      );

      if (started) {
        setIsVoiceActive(true);
        // Start volume loop
        const interval = setInterval(() => {
          if (!audioManagerRef.current) {
            clearInterval(interval);
            return;
          }
          setAudioVolume(audioManagerRef.current.getVolumeLevel());
        }, 100);
      }
    }
  };

  // Toggle Camera
  const handleToggleCamera = async () => {
    if (isCameraActive) {
      cameraManagerRef.current?.stopCamera();
      setIsCameraActive(false);
    } else {
      if (isScreenActive) handleToggleScreen();
      cameraManagerRef.current = new CameraManager();
      setIsCameraActive(true);
      setTimeout(async () => {
        if (cameraVideoRef.current && cameraManagerRef.current) {
          await cameraManagerRef.current.startCamera(cameraVideoRef.current);
        }
      }, 200);
    }
  };

  // Capture Camera Snapshot
  const handleTakeSnapshot = () => {
    if (cameraManagerRef.current) {
      const frame = cameraManagerRef.current.captureFrame();
      if (frame) {
        setCapturedSnapshot(frame);
      }
    }
  };

  // Toggle Screen Share
  const handleToggleScreen = async () => {
    if (isScreenActive) {
      screenManagerRef.current?.stopScreenShare();
      setIsScreenActive(false);
    } else {
      if (isCameraActive) handleToggleCamera();
      screenManagerRef.current = new ScreenCaptureManager();
      setIsScreenActive(true);
      setTimeout(async () => {
        if (screenVideoRef.current && screenManagerRef.current) {
          await screenManagerRef.current.startScreenShare(screenVideoRef.current);
        }
      }, 200);
    }
  };

  // Capture Screen Snapshot
  const handleTakeScreenSnapshot = () => {
    if (screenManagerRef.current) {
      const frame = screenManagerRef.current.captureScreenFrame();
      if (frame) {
        setCapturedSnapshot(frame);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 8 Columns: Live Chat & Multimodal Stage */}
      <div className="lg:col-span-8 flex flex-col h-[760px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Multimodal Live Header */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">NyayaLive Multimodal Companion</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {selectedClause 
                  ? `Focusing on: ${selectedClause.clauseNumber} (${selectedClause.title})`
                  : document ? `Context: ${document.title}` : "General Legal Context"}
              </span>
            </div>
          </div>

          {/* Quick Multimodal Action Toggles */}
          <div className="flex items-center gap-1.5">
            {/* Voice Button */}
            <button
              onClick={handleToggleVoice}
              title={isVoiceActive ? "Mute Voice" : "Talk to Nyaya (Voice)"}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isVoiceActive
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline">{isVoiceActive ? "Listening" : "Talk"}</span>
            </button>

            {/* Camera Button */}
            <button
              onClick={handleToggleCamera}
              title="Show Nyaya (Camera)"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isCameraActive
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {isCameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-blue-400" />}
              <span className="hidden sm:inline">Camera</span>
            </button>

            {/* Screen Share Button */}
            <button
              onClick={handleToggleScreen}
              title="Share Screen with Nyaya"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isScreenActive
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {isScreenActive ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4 text-purple-400" />}
              <span className="hidden sm:inline">Screen</span>
            </button>
          </div>
        </div>

        {/* Video / Camera Preview Overlay if Active */}
        {isCameraActive && (
          <div className="bg-black/90 p-4 border-b border-slate-800 flex flex-col items-center gap-3 relative">
            <video ref={cameraVideoRef} autoPlay playsInline muted className="h-44 rounded-xl border border-slate-700 shadow-md" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleTakeSnapshot}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <Camera className="w-3.5 h-3.5" />
                Capture Document Snapshot
              </button>
              <button
                onClick={handleToggleCamera}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
              >
                Close Camera
              </button>
            </div>
          </div>
        )}

        {/* Screen Share Preview Overlay if Active */}
        {isScreenActive && (
          <div className="bg-black/90 p-4 border-b border-slate-800 flex flex-col items-center gap-3 relative">
            <video ref={screenVideoRef} autoPlay playsInline muted className="h-44 rounded-xl border border-slate-700 shadow-md" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleTakeScreenSnapshot}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <Camera className="w-3.5 h-3.5" />
                Inspect Screen Frame
              </button>
              <button
                onClick={handleToggleScreen}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
              >
                Stop Sharing
              </button>
            </div>
          </div>
        )}

        {/* Live Audio Visualizer Banner */}
        {isVoiceActive && (
          <div className="px-4 py-2 bg-gradient-to-r from-rose-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold">Live Speech Recognition Active</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, Math.min(24, (audioVolume * (i + 1)) / 4))}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message Transcript Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xs font-bold">
                    न्या
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? "bg-amber-500 text-slate-950 font-medium"
                      : "bg-slate-800/80 border border-slate-700/80 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  <div className={`text-[10px] ${isUser ? "text-slate-800" : "text-slate-400"} flex items-center justify-between pt-1`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {!isUser && <span className="text-[10px] text-emerald-400">🔒 Grounded in Indian Law</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Interim Realtime Speech Bubble */}
          {voiceInterimText && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl p-3 bg-amber-500/30 border border-amber-500/40 text-amber-100 text-xs italic animate-pulse">
                🎙 "{voiceInterimText}..."
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-xs animate-spin">
                ⚖️
              </div>
              <div className="p-3 bg-slate-800/60 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <span>Nyaya is analyzing Indian statutory precedents...</span>
              </div>
            </div>
          )}

          <div ref={chatScrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-400 scrollbar-none">
            <span className="shrink-0 text-slate-500">Quick prompts:</span>
            <button
              onClick={() => handleSendMessage("Is my non-compete clause legally enforceable under Section 27?")}
              className="shrink-0 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/60"
            >
              Non-compete validity?
            </button>
            <button
              onClick={() => handleSendMessage("Can my landlord deduct painting charges from my deposit?")}
              className="shrink-0 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/60"
            >
              Painting deduction?
            </button>
            <button
              onClick={() => handleSendMessage("Explain this contract in simple Hinglish.")}
              className="shrink-0 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/60"
            >
              Explain in Hinglish
            </button>
          </div>

          {/* Captured Image indicator */}
          {capturedSnapshot && (
            <div className="p-2 bg-slate-800 rounded-xl flex items-center justify-between border border-amber-500/40">
              <span className="text-xs text-amber-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Snapshot ready to send for visual legal inspection!
              </span>
              <button
                onClick={() => setCapturedSnapshot(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Remove
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Nyaya about any clause, risk, or statutory next step..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isLoading || (!inputPrompt.trim() && !capturedSnapshot)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 4 Columns: Evidence Timeline & Chronology Extractor */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[760px] overflow-hidden">
        <div className="border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Case Timeline & Evidence Tracker
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {timelineItems.length} Events
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Narrate your dispute history via voice or text. Nyaya extracts dates, amounts, and evidence into an auditable timeline.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {timelineItems.length > 0 ? (
            timelineItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-[11px]">{item.date}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {item.evidence}
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{item.event}</p>
              </div>
            ))
          ) : (
            <div className="h-64 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-500 text-xs">
              <Clock className="w-6 h-6 mb-2 text-slate-600" />
              <span>No timeline events recorded yet.</span>
              <span className="text-[11px] text-slate-500 mt-1">
                Say: "I paid deposit on 1st Aug, requested refund on 15th Sep..."
              </span>
            </div>
          )}
        </div>

        {/* Manual Event Add */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              const eventStr = prompt("Enter a key event (e.g. '14 March: Product stopped working'):");
              if (eventStr) detectAndAddTimelineItem(eventStr);
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/80 transition-colors"
          >
            + Add Chronology Entry
          </button>
        </div>
      </div>
    </div>
  );
}
