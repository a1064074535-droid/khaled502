import React, { useState, useEffect } from "react";
import { ResumeData } from "./resume-data";

const AR_FONT = "'Cairo', 'Arial', sans-serif";
const SAVED_KEY = "ats_saved_resumes";

export interface SavedResume {
  id: string;
  name: string;
  pinHash: string;
  data: ResumeData;
  template: string;
  savedAt: string;
}

function hashPin(pin: string): string {
  // تشفير بسيط للرمز (للحماية الأساسية - ليس للبيانات الحساسة)
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = (h << 5) - h + pin.charCodeAt(i);
    h |= 0;
  }
  return "h" + Math.abs(h).toString(36) + "_" + pin.length;
}

export function loadSavedResumes(): SavedResume[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list: SavedResume[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

interface Props {
  open: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  template?: string;
  defaultName?: string;
  onRestore?: (data: ResumeData, template: string) => void;
}

export function SaveResumeModal({ open, onClose, resumeData, template = "classic-minimal", defaultName = "سيرتي الذاتية", onRestore }: Props) {
  const [tab, setTab] = useState<"save" | "manage">("save");
  const [name, setName] = useState(defaultName);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saved, setSaved] = useState<SavedResume[]>([]);
  const [unlockId, setUnlockId] = useState<string | null>(null);
  const [unlockPin, setUnlockPin] = useState("");
  const [showUnlockPin, setShowUnlockPin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      const list = loadSavedResumes();
      setSaved(list);
      setTab(list.length > 0 ? "manage" : "save");
      setError("");
      setSuccess("");
      setPin("");
      setConfirmPin("");
      setUnlockId(null);
      setUnlockPin("");
    }
  }, [open]);

  if (!open) return null;

  function handleSave() {
    setError("");
    setSuccess("");
    if (!/^[0-9]{4,8}$/.test(pin)) {
      setError("يجب أن يكون رمز القفل من 4 إلى 8 أرقام");
      return;
    }
    if (pin !== confirmPin) {
      setError("الرمزان غير متطابقين");
      return;
    }
    const item: SavedResume = {
      id: "res-" + Date.now(),
      name: name.trim() || "سيرتي الذاتية",
      pinHash: hashPin(pin),
      data: resumeData,
      template,
      savedAt: new Date().toISOString(),
    };
    const list = [...saved, item];
    persist(list);
    setSaved(list);
    setSuccess("تم حفظ السيرة الذاتية بشكل دائم ومحمية برمز قفل 🔒");
    setPin("");
    setConfirmPin("");
    setTimeout(() => setTab("manage"), 900);
  }

  function handleUnlock(item: SavedResume) {
    setError("");
    if (hashPin(unlockPin) === item.pinHash) {
      setSuccess("تم فتح القفل بنجاح ✓");
      if (onRestore) onRestore(item.data, item.template);
      setUnlockPin("");
      setUnlockId(null);
      setTimeout(() => onClose(), 800);
    } else {
      setError("رمز القفل غير صحيح");
    }
  }

  function handleDelete(id: string) {
    const list = saved.filter((r) => r.id !== id);
    persist(list);
    setSaved(list);
    if (list.length === 0) setTab("save");
  }

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, fontFamily: AR_FONT, direction: "rtl",
  };
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 16, width: 440, maxWidth: "92vw",
    maxHeight: "88vh", overflowY: "auto", padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid #E5E7EB", fontSize: 14, fontFamily: AR_FONT,
    boxSizing: "border-box", outline: "none",
  };
  const pinInputStyle: React.CSSProperties = {
    ...inputStyle, letterSpacing: 6, fontWeight: 700, textAlign: "center",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block",
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A2540", margin: 0 }}>
              {tab === "save" ? "حفظ السيرة الذاتية" : "السير الذاتية المحفوظة"}
            </h2>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>

        {saved.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setTab("save")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: AR_FONT, fontWeight: 700, fontSize: 13, background: tab === "save" ? "#0A2540" : "#F3F4F6", color: tab === "save" ? "#fff" : "#374151" }}>حفظ جديد</button>
            <button onClick={() => setTab("manage")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: AR_FONT, fontWeight: 700, fontSize: 13, background: tab === "manage" ? "#0A2540" : "#F3F4F6", color: tab === "manage" ? "#fff" : "#374151" }}>المحفوظة ({saved.length})</button>
          </div>
        )}

        {error && <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ background: "#DCFCE7", color: "#15803D", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{success}</div>}

        {tab === "save" ? (
          <div>
            <label style={labelStyle}>اسم السيرة الذاتية</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سيرتي الذاتية" />

            <label style={{ ...labelStyle, marginTop: 14 }}>رمز القفل (4-8 أرقام)</label>
            <div style={{ position: "relative" }}>
              <input style={pinInputStyle} type={showPin ? "text" : "password"} inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))} placeholder="••••" />
              <button type="button" onClick={() => setShowPin((s) => !s)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", fontSize: 16 }}>{showPin ? "🙈" : "👁️"}</button>
            </div>

            <label style={{ ...labelStyle, marginTop: 14 }}>تأكيد رمز القفل</label>
            <input style={pinInputStyle} type={showPin ? "text" : "password"} inputMode="numeric" maxLength={8} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))} placeholder="••••" />

            <div style={{ background: "#EFF6FF", color: "#1D4ED8", padding: "10px 12px", borderRadius: 8, fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
              ℹ️ سيتم حفظ السيرة بشكل دائم على هذا الجهاز، ولن تُفتح إلا بإدخال رمز القفل يدوياً. احفظ الرمز في مكان آمن.
            </div>

            <button onClick={handleSave} style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 10, border: "none", background: "#0A2540", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: AR_FONT }}>💾 حفظ السيرة الذاتية</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {saved.length === 0 && <div style={{ textAlign: "center", color: "#9CA3AF", padding: 20 }}>لا توجد سير محفوظة</div>}
            {saved.map((item) => (
              <div key={item.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🔒</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{new Date(item.savedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} style={{ border: "none", background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: AR_FONT, fontSize: 12, fontWeight: 700 }}>حذف</button>
                </div>

                {unlockId === item.id ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ position: "relative" }}>
                      <input style={pinInputStyle} type={showUnlockPin ? "text" : "password"} inputMode="numeric" maxLength={8} value={unlockPin} onChange={(e) => setUnlockPin(e.target.value.replace(/[^0-9]/g, ""))} placeholder="أدخل رمز القفل" autoFocus />
                      <button type="button" onClick={() => setShowUnlockPin((s) => !s)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", fontSize: 16 }}>{showUnlockPin ? "🙈" : "👁️"}</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => handleUnlock(item)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#065F46", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: AR_FONT, fontSize: 13 }}>🔓 فتح وتحميل</button>
                      <button onClick={() => { setUnlockId(null); setUnlockPin(""); setError(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 700, cursor: "pointer", fontFamily: AR_FONT, fontSize: 13 }}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setUnlockId(item.id); setUnlockPin(""); setError(""); setSuccess(""); }} style={{ width: "100%", marginTop: 12, padding: "9px 0", borderRadius: 8, border: "1px solid #0A2540", background: "#fff", color: "#0A2540", fontWeight: 700, cursor: "pointer", fontFamily: AR_FONT, fontSize: 13 }}>🔓 فتح السيرة (يتطلب الرمز)</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
