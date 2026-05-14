"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "home" | "calendar" | "menu" | "prints" | "settings";
type ChildTarget = "碧" | "海未" | "共通";
type EventType = "予定" | "持ち物" | "提出物" | "その他";
type RepeatType = "なし" | "毎週" | "毎月";

type EventItem = {
  id: number;
  date: string;
  title: string;
  detail?: string;
  child: ChildTarget;
  type: EventType;
  source?: "manual" | "scan";
};

type MenuItem = {
  date: string;
  menu: string;
};

type RuleItem = {
  id: number;
  title: string;
  detail: string;
  child: ChildTarget;
  type: EventType;
  repeat: RepeatType;
  month: string;
  day: string;
  weekday: number;
};

type AnalyzeResult = {
  type: "menu" | "schedule";
  days?: MenuItem[];
  events?: EventItem[];
};

const STORAGE_KEY = "hoiku-paper-v5";
const YEAR = 2026;
const MONTHS = [5, 6, 7];
const WEEK_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const HOLIDAYS = ["5/3", "5/4", "5/5", "5/6", "7/20"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const currentMonth = MONTHS[currentMonthIndex];

  const [selectedChildren, setSelectedChildren] = useState<ChildTarget[]>([
    "碧",
    "海未",
  ]);

  const [selectedDate, setSelectedDate] = useState("5/18");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisRaw, setAnalysisRaw] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 1,
      date: "5/18",
      title: "5月の服装について",
      detail:
        "5月18日(月)から衣替えを開始します。5月1日(金)〜5月16日(土)は調整期間です。",
      child: "共通",
      type: "予定",
      source: "scan",
    },
  ]);

  const [menus, setMenus] = useState<MenuItem[]>([
    {
      date: "5/18",
      menu: "豚肉ケチャップ炒め、けんちん汁、麦ごはん、レモンケーキ",
    },
  ]);

  const [rules, setRules] = useState<RuleItem[]>([
    {
      id: 1,
      title: "体操服を着ていく",
      detail: "木曜は体操の日",
      child: "碧",
      type: "持ち物",
      repeat: "毎週",
      month: "5",
      day: "18",
      weekday: 4,
    },
    {
      id: 2,
      title: "土曜保育申込",
      detail: "忘れずに申込",
      child: "共通",
      type: "提出物",
      repeat: "毎週",
      month: "5",
      day: "18",
      weekday: 1,
    },
  ]);

  const [formTitle, setFormTitle] = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [formChild, setFormChild] = useState<ChildTarget>("共通");
  const [formType, setFormType] = useState<EventType>("予定");
  const [formRepeat, setFormRepeat] = useState<RepeatType>("なし");
  const [formMonth, setFormMonth] = useState("5");
  const [formDay, setFormDay] = useState("18");
  const [formWeekday, setFormWeekday] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setSelectedChildren(parsed.selectedChildren || ["碧", "海未"]);
      setSelectedDate(parsed.selectedDate || "5/18");
      setEvents(parsed.events || []);
      setMenus(parsed.menus || []);
      setRules(parsed.rules || []);
      setImagePreview(parsed.imagePreview || null);
      setImageBase64(parsed.imageBase64 || null);
      setAnalysisRaw(parsed.analysisRaw || "");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedChildren,
        selectedDate,
        events,
        menus,
        rules,
        imagePreview,
        imageBase64,
        analysisRaw,
      })
    );
  }, [
    selectedChildren,
    selectedDate,
    events,
    menus,
    rules,
    imagePreview,
    imageBase64,
    analysisRaw,
  ]);

  const ruleEvents = useMemo(() => {
    const result: EventItem[] = [];

    for (const rule of rules) {
      if (rule.repeat === "なし") {
        result.push({
          id: rule.id,
          date: `${rule.month}/${rule.day}`,
          title: rule.title,
          detail: rule.detail,
          child: rule.child,
          type: rule.type,
          source: "manual",
        });
      }

      if (rule.repeat === "毎月") {
        for (const month of MONTHS) {
          result.push({
            id: Number(`${rule.id}${month}`),
            date: `${month}/${rule.day}`,
            title: rule.title,
            detail: rule.detail,
            child: rule.child,
            type: rule.type,
            source: "manual",
          });
        }
      }

      if (rule.repeat === "毎週") {
        for (const month of MONTHS) {
          const daysInMonth = getDaysInMonth(YEAR, month);
          for (let day = 1; day <= daysInMonth; day++) {
            const week = new Date(YEAR, month - 1, day).getDay();
            if (week === rule.weekday) {
              result.push({
                id: Number(`${rule.id}${month}${day}`),
                date: `${month}/${day}`,
                title: rule.title,
                detail: rule.detail,
                child: rule.child,
                type: rule.type,
                source: "manual",
              });
            }
          }
        }
      }
    }

    return result;
  }, [rules]);

  const allEvents = useMemo(() => [...events, ...ruleEvents], [events, ruleEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (event.child === "共通") return true;
      return selectedChildren.includes(event.child);
    });
  }, [allEvents, selectedChildren]);

  const selectedEvents = filteredEvents.filter((e) => e.date === selectedDate);
  const selectedMenu = menus.find((m) => m.date === selectedDate);

  const todaySummary = filteredEvents.slice(0, 3);

  const toggleChild = (child: ChildTarget) => {
    setSelectedChildren((prev) => {
      if (prev.includes(child)) {
        const next = prev.filter((v) => v !== child);
        return next.length === 0 ? prev : next;
      }
      return [...prev, child];
    });
  };

  const addRule = () => {
    if (!formTitle.trim()) return;

    setRules([
      {
        id: Date.now(),
        title: formTitle,
        detail: formDetail,
        child: formChild,
        type: formType,
        repeat: formRepeat,
        month: formMonth,
        day: formDay,
        weekday: formWeekday,
      },
      ...rules,
    ]);

    setFormTitle("");
    setFormDetail("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisRaw("画像を圧縮中...");

    try {
      const result = await resizeImageToBase64(file, 1200, 0.75);
      setImagePreview(result.dataUrl);
      setImageBase64(result.base64);
      setAnalysisRaw("画像準備OK。AI解析できます。");
      setActiveTab("prints");
    } catch {
      setAnalysisRaw("画像の読み込みに失敗しました");
    }
  };

  const analyzePrint = async () => {
    if (!imageBase64) {
      setAnalysisRaw("画像データがありません。もう一度スキャンしてください。");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisRaw("AI解析中...");

    try {
      const res = await fetch("/api/analyze-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await res.json();

      if (!data.success) {
        setAnalysisRaw(`解析失敗：${data.error || "原因不明"}`);
        return;
      }

      const parsed = parseGeminiJson(data.raw);
      setAnalysisRaw(JSON.stringify(parsed, null, 2));

      if (parsed.type === "menu" && parsed.days) {
        setMenus(parsed.days);
        setActiveTab("menu");
      }

      if (parsed.type === "schedule" && parsed.events) {
        const scanEvents = parsed.events.map((event) => ({
          ...event,
          id: Date.now() + Math.random(),
          child: event.child || "共通",
          type: event.type || "予定",
          source: "scan" as const,
        }));
        setEvents(scanEvents);
        setActiveTab("calendar");
      }
    } catch {
      setAnalysisRaw("解析結果の処理に失敗しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef7ff] pb-24">
      <div className="mx-auto max-w-md bg-white min-h-screen shadow-2xl">
        <header className="bg-sky-200 p-5 text-center">
          <h1 className="text-3xl font-black text-blue-700">ほいく紙管理</h1>
          <p className="mt-1 text-xs font-bold text-blue-500">
            保育園プリントを一元管理
          </p>
        </header>

        <div className="space-y-4 p-4">
          {activeTab === "home" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleChild("碧")}
                  className={`rounded-2xl p-2 text-center shadow ${
                    selectedChildren.includes("碧")
                      ? "bg-blue-100 ring-2 ring-blue-300"
                      : "bg-gray-100 opacity-60"
                  }`}
                >
                  <img src="/hayabusa.png" className="mx-auto h-10 object-contain" />
                  <p className="text-lg font-black text-blue-700">碧</p>
                  <p className="text-xs font-bold text-gray-500">もも組</p>
                </button>

                <button
                  onClick={() => toggleChild("海未")}
                  className={`rounded-2xl p-2 text-center shadow ${
                    selectedChildren.includes("海未")
                      ? "bg-pink-100 ring-2 ring-pink-300"
                      : "bg-gray-100 opacity-60"
                  }`}
                >
                  <img src="/anpanman.png" className="mx-auto h-10 object-contain" />
                  <p className="text-lg font-black text-pink-600">海未</p>
                  <p className="text-xs font-bold text-gray-500">ひよこ組</p>
                </button>
              </div>

              <label className="block w-full rounded-3xl bg-blue-600 p-4 text-center font-black text-white shadow">
                📷 プリントをスキャン
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>

              <div className="rounded-3xl bg-white p-4 shadow">
                <h2 className="text-lg font-black">☀️ 今日やること</h2>
                <div className="mt-3 space-y-2">
                  {todaySummary.length > 0 ? (
                    todaySummary.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full rounded-2xl bg-blue-50 p-3 text-left"
                      >
                        <p className="font-black text-blue-700">
                          {event.child !== "共通" ? `${event.child}：` : ""}
                          {event.title}
                        </p>
                        <p className="truncate text-sm text-gray-600">
                          {event.detail || "詳細なし"}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">予定なし</p>
                  )}

                  <div className="rounded-2xl bg-yellow-50 p-3">
                    <p className="font-black text-yellow-700">🍚 献立</p>
                    <p className="truncate text-sm text-gray-700">
                      {selectedMenu?.menu || "献立なし"}
                    </p>
                  </div>
                </div>
              </div>

              <ScheduleForm
                formTitle={formTitle}
                setFormTitle={setFormTitle}
                formDetail={formDetail}
                setFormDetail={setFormDetail}
                formChild={formChild}
                setFormChild={setFormChild}
                formType={formType}
                setFormType={setFormType}
                formRepeat={formRepeat}
                setFormRepeat={setFormRepeat}
                formMonth={formMonth}
                setFormMonth={setFormMonth}
                formDay={formDay}
                setFormDay={setFormDay}
                formWeekday={formWeekday}
                setFormWeekday={setFormWeekday}
                addRule={addRule}
              />
            </>
          )}

          {activeTab === "calendar" && (
            <>
              <div className="rounded-3xl bg-white p-4 shadow">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
                    className="rounded-full bg-gray-100 px-4 py-2 font-black"
                  >
                    ←
                  </button>
                  <h2 className="text-2xl font-black">{currentMonth}月</h2>
                  <button
                    onClick={() =>
                      setCurrentMonthIndex(Math.min(MONTHS.length - 1, currentMonthIndex + 1))
                    }
                    className="rounded-full bg-gray-100 px-4 py-2 font-black"
                  >
                    →
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm font-black">
                  <div className="text-red-500">日</div>
                  <div>月</div>
                  <div>火</div>
                  <div>水</div>
                  <div>木</div>
                  <div>金</div>
                  <div className="text-blue-500">土</div>
                </div>

                <CalendarMonth
                  month={currentMonth}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  events={filteredEvents}
                  menus={menus}
                />
              </div>

              <DayDetail
                selectedDate={selectedDate}
                selectedMenu={selectedMenu}
                selectedEvents={selectedEvents}
                setSelectedEvent={setSelectedEvent}
              />
            </>
          )}

          {activeTab === "menu" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-2xl font-black">🍚 献立一覧</h2>
              <div className="mt-4 space-y-3">
                {menus.map((menu) => (
                  <button
                    key={menu.date}
                    onClick={() => {
                      setSelectedDate(menu.date);
                      setActiveTab("calendar");
                    }}
                    className="w-full rounded-2xl bg-yellow-50 p-4 text-left"
                  >
                    <p className="font-black">{menu.date}</p>
                    <p className="text-gray-700">{menu.menu}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "prints" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-2xl font-black">📄 プリント</h2>

              <label className="mt-3 block rounded-2xl bg-blue-600 p-4 text-center font-black text-white">
                新しくスキャンする
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>

              {imagePreview ? (
                <div className="mt-4 rounded-2xl bg-sky-50 p-3">
                  <img src={imagePreview} className="w-full rounded-xl border" />
                  <button
                    onClick={analyzePrint}
                    disabled={isAnalyzing}
                    className="mt-3 w-full rounded-2xl bg-pink-500 p-3 font-black text-white disabled:bg-gray-400"
                  >
                    {isAnalyzing ? "🤖 AI解析中..." : "🤖 AI解析する"}
                  </button>
                  {analysisRaw && (
                    <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-white p-3 text-xs text-gray-700">
                      {analysisRaw}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">まだプリントはありません。</p>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-2xl font-black">⚙️ 設定</h2>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  location.reload();
                }}
                className="mt-4 w-full rounded-2xl bg-red-500 p-4 font-black text-white"
              >
                保存データ削除
              </button>
            </div>
          )}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <h3 className="text-xl font-black">{selectedEvent.title}</h3>
            <p className="mt-2 text-sm text-gray-500">
              {selectedEvent.date} / {selectedEvent.child}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-gray-700">
              {selectedEvent.detail || "詳細なし"}
            </p>
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-5 w-full rounded-2xl bg-blue-600 p-3 font-black text-white"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function CalendarMonth({
  month,
  selectedDate,
  setSelectedDate,
  events,
  menus,
}: {
  month: number;
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  events: EventItem[];
  menus: MenuItem[];
}) {
  const firstDay = new Date(YEAR, month - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(YEAR, month);

  return (
    <div className="mt-2 grid grid-cols-7 gap-2">
      {Array.from({ length: firstDay }).map((_, i) => (
        <div key={i} />
      ))}

      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const date = `${month}/${day}`;
        const weekDay = new Date(YEAR, month - 1, day).getDay();
        const hasEvent = events.some((e) => e.date === date);
        const hasMenu = menus.some((m) => m.date === date);
        const isHoliday = HOLIDAYS.includes(date);
        const isSunOrHoliday = weekDay === 0 || isHoliday;
        const isSaturday = weekDay === 6;

        return (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`aspect-square rounded-2xl border text-lg font-black ${
              selectedDate === date
                ? "bg-blue-600 text-white"
                : hasEvent
                ? "bg-yellow-100"
                : hasMenu
                ? "bg-green-100"
                : isSunOrHoliday
                ? "bg-red-50"
                : isSaturday
                ? "bg-blue-50"
                : "bg-white"
            } ${
              selectedDate === date
                ? "text-white"
                : isSunOrHoliday
                ? "text-red-500"
                : isSaturday
                ? "text-blue-500"
                : "text-gray-700"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

function DayDetail({
  selectedDate,
  selectedMenu,
  selectedEvents,
  setSelectedEvent,
}: {
  selectedDate: string;
  selectedMenu?: MenuItem;
  selectedEvents: EventItem[];
  setSelectedEvent: (event: EventItem) => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow">
      <h2 className="text-xl font-black">{selectedDate} の内容</h2>

      <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
        <p className="font-black">🍚 献立</p>
        <p className="mt-1 text-gray-700">{selectedMenu?.menu || "献立なし"}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-blue-50 p-4">
        <p className="font-black">📌 予定・持ち物</p>
        <div className="mt-3 space-y-2">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full rounded-xl bg-white p-3 text-left"
              >
                <p className="font-black">
                  {event.child !== "共通" ? `${event.child}：` : ""}
                  {event.title}
                </p>
                <p className="truncate text-sm text-gray-600">
                  {event.detail || "詳細なし"}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500">予定なし</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleForm(props: {
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDetail: string;
  setFormDetail: (v: string) => void;
  formChild: ChildTarget;
  setFormChild: (v: ChildTarget) => void;
  formType: EventType;
  setFormType: (v: EventType) => void;
  formRepeat: RepeatType;
  setFormRepeat: (v: RepeatType) => void;
  formMonth: string;
  setFormMonth: (v: string) => void;
  formDay: string;
  setFormDay: (v: string) => void;
  formWeekday: number;
  setFormWeekday: (v: number) => void;
  addRule: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow">
      <h2 className="text-lg font-black">📌 予定追加</h2>

      <div className="mt-3 space-y-3">
        <input
          value={props.formTitle}
          onChange={(e) => props.setFormTitle(e.target.value)}
          placeholder="例：体操服を着ていく"
          className="w-full rounded-2xl border p-3"
        />

        <textarea
          value={props.formDetail}
          onChange={(e) => props.setFormDetail(e.target.value)}
          placeholder="詳細"
          rows={2}
          className="w-full rounded-2xl border p-3"
        />

        <div className="grid grid-cols-3 gap-2">
          <select
            value={props.formChild}
            onChange={(e) => props.setFormChild(e.target.value as ChildTarget)}
            className="rounded-2xl border p-3 text-sm"
          >
            <option>碧</option>
            <option>海未</option>
            <option>共通</option>
          </select>

          <select
            value={props.formType}
            onChange={(e) => props.setFormType(e.target.value as EventType)}
            className="rounded-2xl border p-3 text-sm"
          >
            <option>予定</option>
            <option>持ち物</option>
            <option>提出物</option>
            <option>その他</option>
          </select>

          <select
            value={props.formRepeat}
            onChange={(e) => props.setFormRepeat(e.target.value as RepeatType)}
            className="rounded-2xl border p-3 text-sm"
          >
            <option>なし</option>
            <option>毎週</option>
            <option>毎月</option>
          </select>
        </div>

        {props.formRepeat === "毎週" && (
          <select
            value={props.formWeekday}
            onChange={(e) => props.setFormWeekday(Number(e.target.value))}
            className="w-full rounded-2xl border p-3"
          >
            {WEEK_LABELS.map((label, index) => (
              <option key={label} value={index}>
                毎週{label}曜日
              </option>
            ))}
          </select>
        )}

        {(props.formRepeat === "なし" || props.formRepeat === "毎月") && (
          <div className="grid grid-cols-2 gap-2">
            {props.formRepeat === "なし" && (
              <select
                value={props.formMonth}
                onChange={(e) => props.setFormMonth(e.target.value)}
                className="rounded-2xl border p-3"
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            )}

            <select
              value={props.formDay}
              onChange={(e) => props.setFormDay(e.target.value)}
              className="rounded-2xl border p-3"
            >
              {Array.from({ length: 31 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}日
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={props.addRule}
          className="w-full rounded-2xl bg-pink-500 p-3 font-black text-white"
        >
          追加する
        </button>
      </div>
    </div>
  );
}

function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const items: { tab: Tab; icon: string; label: string }[] = [
    { tab: "home", icon: "🏠", label: "ホーム" },
    { tab: "calendar", icon: "📅", label: "予定" },
    { tab: "menu", icon: "🍚", label: "献立" },
    { tab: "prints", icon: "📄", label: "紙" },
    { tab: "settings", icon: "⚙️", label: "設定" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t bg-white px-2 py-2 shadow-2xl">
      {items.map((item) => (
        <button
          key={item.tab}
          onClick={() => setActiveTab(item.tab)}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black leading-none ${
            activeTab === item.tab ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <span className="text-2xl leading-none">{item.icon}</span>
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function parseGeminiJson(raw: string): AnalyzeResult {
  const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) throw new Error("JSONなし");
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as AnalyzeResult;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function resizeImageToBase64(
  file: File,
  maxWidth: number,
  quality: number
): Promise<{ dataUrl: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, 1);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas error"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const base64 = dataUrl.split(",")[1];

        resolve({ dataUrl, base64 });
      };

      img.onerror = () => reject(new Error("image load error"));
      img.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error("file read error"));
    reader.readAsDataURL(file);
  });
}