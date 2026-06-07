import React, { useState } from "react";
import snbLogo from "./snb-logo.png";
import rajhiLogo from "./rajhi-logo.png";
import libraryLogo from "./library-logo.png";
const CK = "ats_access_codes";
const SK = "ats_subscription";
const ADMIN_USER = "khaled";
const ADMIN_PASS = "khaled1593*";
const BANK_INFO = "SA54 8000 0245 6080 1616 1270";
const BANK_NAME = "خالد ماجد الدوسري";
const ALAHLI_IBAN = "SA62 1000 0024 2000 0006 6707";
const RAJHI_IBAN = "SA54 8000 0245 6080 1616 1270";
const WHATSAPP_NUM = "0545888559";
const WHATSAPP_LINK = "https://wa.me/966545888559";
const WHATSAPP_ICON = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.752-.985 1.226.728z'/></svg>";
const PLANS = [
  { months: 0, days: 3, price: 0, label: "تجربة مجانية 3 أيام" },
  { months: 1, price: 20, label: "شهر واحد" },
  { months: 2, price: 35, label: "شهرين" },
  { months: 3, price: 50, label: "ثلاثة أشهر" },
];
const loadCodes = () => {
  try {
    return JSON.parse(localStorage.getItem(CK) || "[]");
  } catch {
    return [];
  }
};
const saveCodes = (c) =>
  localStorage.setItem(CK, JSON.stringify(c));
const loadSub = () => {
  try {
    return JSON.parse(localStorage.getItem(SK) || "null");
  } catch {
    return null;
  }
};
const saveSub = (s) =>
  localStorage.setItem(SK, JSON.stringify(s));
const genCode = () => {
  const existing = loadCodes().map((c) => c.code);
  let s = "";
  do {
    s = "";
    for (let i = 0; i < 10; i++)
      s += Math.floor(Math.random() * 10);
  } while (existing.includes(s));
  return s;
};
const isSubActive = () => {
  const s = loadSub();
  return !!(s && s.expiresAt && Date.now() < s.expiresAt);
};
const fmtDate = (ms) =>
  ms ? new Date(ms).toLocaleDateString("ar-SA") : "-";

export function AccessGate() {
  const [unlocked, setUnlocked] = useState(isSubActive());
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(
    typeof window !== "undefined" &&
      window.location.hash.toLowerCase().indexOf("admin") !==
        -1,
  );
  const [authed, setAuthed] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [codes, setCodes] = useState(loadCodes());
  const [newPlan, setNewPlan] = useState(0);
  const applyCode = () => {
    if (!agreed) {
      setError("يجب الموافقة على الإقرار والتعهد أولاً");
      return;
    }
    const val = codeInput.trim();
    if (!/^[0-9]{10}$/.test(val)) {
      setError("الكود يجب أن يكون 10 أرقام");
      return;
    }
    const all = loadCodes();
    const i = all.findIndex((c) => c.code === val);
    if (i === -1) {
      setError("كود غير صحيح");
      return;
    }
    if (all[i].used) {
      setError("هذا الكود مستخدم مسبقا");
      return;
    }
    const m = all[i].months || 0;
    const d = all[i].days || 0;
    let durMs;
    if (typeof all[i].durationMs === "number" && all[i].durationMs > 0) {
      durMs = all[i].durationMs;
    } else if (d > 0) {
      durMs = d * 24 * 60 * 60 * 1000;
    } else if (m > 0) {
      durMs = m * 30 * 24 * 60 * 60 * 1000;
    } else {
      durMs = 3 * 24 * 60 * 60 * 1000;
    }
    const exp = Date.now() + durMs;
    all[i].used = true;
    all[i].activatedAt = Date.now();
    saveCodes(all);
    saveSub({ code: val, months: m, days: d, expiresAt: exp });
    setError("");
    setUnlocked(true);
  };
  const login = () => {
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      setAuthed(true);
      setError("");
    } else {
      setError("بيانات الدخول غير صحيحة");
    }
  };
  const addCode = () => {
    const all = loadCodes();
    const pl = PLANS[newPlan] || PLANS[0];
    const planDays = pl.days || 0;
    const planMonths = pl.months || 0;
    const durationMs =
      planDays > 0
        ? planDays * 24 * 60 * 60 * 1000
        : planMonths * 30 * 24 * 60 * 60 * 1000;
    all.push({
      code: genCode(),
      months: planMonths,
      days: planDays,
      durationMs: durationMs,
      label: pl.label,
      used: false,
      createdAt: Date.now(),
    });
    saveCodes(all);
    setCodes(all);
  };
  const deleteCode = (code) => {
    const all = loadCodes().filter((c) => c.code !== code);
    saveCodes(all);
    setCodes(all);
  };
  const clearSub = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "هل تريد إنهاء الاشتراك الحالي وإغلاق الوصول؟",
      )
    )
      return;
    try {
      localStorage.removeItem(SK);
    } catch (e) {}
    setUnlocked(false);
  };
  const wrap = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    direction: "rtl",
    fontFamily: "Cairo, Arial, sans-serif",
    background: "linear-gradient(135deg,#0A2540,#2E5C7F)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    overflow: "auto",
  };
  const card = {
    background: "#fff",
    borderRadius: 20,
    maxWidth: 480,
    width: "100%",
    padding: 30,
    boxShadow: "0 20px 60px rgba(0,0,0,.3)",
    maxHeight: "90vh",
    overflow: "auto",
  };
  const inp = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    boxSizing: "border-box",
    textAlign: "center",
    marginBottom: 10,
  };
  const btn = {
    width: "100%",
    padding: "13px",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 6,
  };
  const h = React.createElement;
  if (unlocked && !adminOpen) return null;
  const planRows = PLANS.map((pl) =>
    h(
      "div",
      {
        key: pl.months,
        style: {
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 14px",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          marginBottom: 8,
        },
      },
      h("span", null, pl.label),
      h("b", null, pl.price + " ريال"),
    ),
  );
  const codeRows = codes.map((c) =>
    h(
      "div",
      {
        key: c.code,
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          borderBottom: "1px solid #eee",
          fontSize: 14,
        },
      },
      h(
        "span",
        { style: { fontFamily: "monospace", fontWeight: 700 } },
        c.code,
      ),
      h("span", null, c.label || (c.days ? c.days + " يوم" : c.months + " شهر")),
      h(
        "span",
        { style: { color: c.used ? "#dc2626" : "#16a34a" } },
        c.used ? "مستخدم" : "متاح",
      ),
      h(
        "button",
        {
          onClick: () => deleteCode(c.code),
          style: {
            color: "#dc2626",
            border: "none",
            background: "none",
            cursor: "pointer",
          },
        },
        "حذف",
      ),
    ),
  );
  if (adminOpen && !authed)
    return h(
      "div",
      { style: wrap },
      h(
        "div",
        { style: card },
        h(
          "h2",
          { style: { textAlign: "center", marginTop: 0 } },
          "دخول الأدمن",
        ),
        h("input", {
          style: inp,
          placeholder: "اسم المستخدم",
          value: u,
          onChange: (e) => setU(e.target.value),
        }),
        h("input", {
          style: inp,
          type: "password",
          placeholder: "كلمة المرور",
          value: p,
          onChange: (e) => setP(e.target.value),
        }),
        error
          ? h(
              "p",
              {
                style: {
                  color: "#dc2626",
                  textAlign: "center",
                },
              },
              error,
            )
          : null,
        h(
          "button",
          {
            style: { ...btn, background: "#0A2540" },
            onClick: login,
          },
          "دخول",
        ),
      ),
    );
  if (adminOpen && authed)
    return h(
      "div",
      { style: wrap },
      h(
        "div",
        { style: { ...card, maxWidth: 640 } },
        h(
          "h2",
          { style: { textAlign: "center", marginTop: 0 } },
          "إدارة الأكواد",
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              gap: 8,
              margin: "14px 0",
            },
          },
          h(
            "select",
            {
              style: { ...inp, flex: 1, marginBottom: 0 },
              value: newPlan,
              onChange: (e) =>
                setNewPlan(Number(e.target.value)),
            },
            PLANS.map((pl, idx) =>
              h(
                "option",
                { key: idx, value: idx },
                pl.label + " - " + pl.price + " ريال",
              ),
            ),
          ),
          h(
            "button",
            {
              style: {
                ...btn,
                background: "#16a34a",
                marginTop: 0,
                width: "auto",
                padding: "0 18px",
              },
              onClick: addCode,
            },
            "توليد كود",
          ),
        ),
        h(
          "div",
          {
            style: {
              maxHeight: 360,
              overflow: "auto",
              border: "1px solid #eee",
              borderRadius: 10,
            },
          },
          codeRows.length
            ? codeRows
            : h(
                "p",
                {
                  style: {
                    textAlign: "center",
                    padding: 16,
                    color: "#94a3b8",
                  },
                },
                "لا توجد أكواد",
              ),
        ),
        h(
          "button",
          {
            style: { ...btn, background: "#dc2626" },
            onClick: clearSub,
          },
          "إنهاء / إلغاء الاشتراك الحالي",
        ),
        h(
          "button",
          {
            style: { ...btn, background: "#64748b" },
            onClick: () => {
              setAdminOpen(false);
              setAuthed(false);
            },
          },
          "خروج",
        ),
      ),
    );
  return h(
    "div",
    { style: wrap },
    h(
      "div",
      { style: card },
      h("img", { src: libraryLogo, alt: "المكتبة الرقمية", style: { display: "block", width: 150, height: "auto", margin: "0 auto 14px" } }),
      h(
        "h2",
        {
          style: {
            textAlign: "center",
            marginTop: 0,
            color: "#0A2540",
          },
        },
        "اشتراك المنصة",
      ),
      h(
        "p",
        {
          style: {
            textAlign: "center",
            color: "#64748b",
            marginBottom: 16,
          },
        },
        "اختر الباقة وحوّل المبلغ ثم أدخل الكود",
      ),
      planRows,
      h(
        "div",
        {
          style: {
            background: "#f1f5f9",
            borderRadius: 10,
            padding: 12,
            margin: "12px 0",
            fontSize: 14,
            textAlign: "center",
          },
        },
h("div", { style: { fontWeight: 700, marginBottom: 10 } }, "حوّل المبلغ إلى أحد الحسابين:"), h("div", { style: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 8, textAlign: "right" } }, h("img", { src: snbLogo, alt: "البنك الأهلي", style: { height: 40, borderRadius: 6 } }), h("div", null, h("b", null, "البنك الأهلي SNB"), h("div", { style: { direction: "ltr", fontSize: 13 } }, ALAHLI_IBAN))), h("div", { style: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 8, textAlign: "right" } }, h("img", { src: rajhiLogo, alt: "مصرف الراجحي", style: { height: 40, borderRadius: 6 } }), h("div", null, h("b", null, "مصرف الراجحي"), h("div", { style: { direction: "ltr", fontSize: 13 } }, RAJHI_IBAN))), h("div", { style: { marginTop: 4 } }, "المستفيد: ", h("b", null, BANK_NAME)),
      ),
      h("a", { href: WHATSAPP_LINK, target: "_blank", rel: "noreferrer", style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "12px 0", background: "#25D366", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 700 } }, h("img", { src: WHATSAPP_ICON, alt: "واتساب", style: { height: 22 } }), h("span", null, "أرسل إيصال التحويل عبر واتساب"), h("span", { style: { direction: "ltr" } }, WHATSAPP_NUM)),
      h("input", {
        style: inp,
        placeholder: "أدخل الكود المكوّن من 10 أرقام",
        value: codeInput,
        onChange: (e) => setCodeInput(e.target.value),
        maxLength: 10,
      }),
      error
        ? h(
            "p",
            {
              style: {
                color: "#dc2626",
                textAlign: "center",
                marginTop: 8,
              },
            },
            error,
          )
        : null,
      h(
        "label",
        {
          style: {
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            textAlign: "right",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 10,
            padding: 12,
            margin: "12px 0",
            fontSize: 13,
            lineHeight: 1.7,
            color: "#7c2d12",
            cursor: "pointer",
          },
        },
        h("input", {
          type: "checkbox",
          checked: agreed,
          onChange: (e) => setAgreed(e.target.checked),
          style: { marginTop: 3, width: 18, height: 18, flexShrink: 0, cursor: "pointer" },
        }),
        h(
          "span",
          null,
          h("b", null, "إقرار وتعهد: "),
          "أقرّ وأتعهّد بأن استخدام المنصة يكون على جهاز واحد فقط، وألّا أقوم بنشر المنصة أو الكود أو مشاركته أو استخدامه على أكثر من جهاز، وأتحمّل كامل المسؤولية في حال مخالفة ذلك ويحق لإدارة المنصة إيقاف الاشتراك دون إشعار.",
        ),
      ),
      h(
        "button",
        {
          style: { ...btn, background: "#16a34a" },
          onClick: applyCode,
        },
        "تفعيل والدخول",
      ),
      h(
        "button",
        {
          style: {
            width: "100%",
            marginTop: 14,
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: 12,
            cursor: "pointer",
          },
          onClick: () => setAdminOpen(true),
        },
        "دخول الأدمن",
      ),
    ),
  );
}