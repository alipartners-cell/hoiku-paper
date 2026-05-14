"use client";

import { useMemo, useState } from "react";

type Tab = "home" | "calendar" | "menu" | "prints" | "settings";
type ChildTarget = "碧" | "海未" | "共通";
type ManualType = "予定" | "持ち物" | "提出物" | "その他";
type RepeatType = "なし" | "毎週" | "毎月";

type AnalyzedDay = {
  date: string;
  menu?: string;
};

type AnalyzedEvent = {
  date: string;
  title: string;
  child?: ChildTarget;
  type?: ManualType;
  items?: string[];
};

type ManualRule = {
  id: number;
  title: string;
  child: ChildTarget;
  type: ManualType;
  repeat: RepeatType;
  dayOfWeek: string;
  monthDay: string;
  date: string;
  memo: string;
};

type AnalyzeResult = {
  type: "menu" | "schedule";
  days?: AnalyzedDay[];
  events?: AnalyzedEvent[];
};

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

const dayOfWeekMap: Record<number, string> = {
  1: "金",
  2: "土",
  3: "日",
  4: "月",
  5: "火",
  6: "水",
  7: "木",
  8: "金",
  9: "土",
  10: "日",
  11: "月",
  12: "火",
  13: "水",
  14: "木",
  15: "金",
  16: "土",
  17: "日",
  18: "月",
  19: "火",
  20: "水",
  21: "木",
  22: "金",
  23: "土",
  24: "日",
  25: "月",
  26: "火",
  27: "水",
  28: "木",
  29: "金",
  30: "土",
  31: "日",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("5/20");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisRaw, setAnalysisRaw] = useState("");

  const [menuDays, setMenuDays] = useState<AnalyzedDay[]>([
    { date: "5/20", menu: "ごはん・ハンバーグ・野菜スープ" },
  ]);

  const [events, setEvents] = useState<AnalyzedEvent[]>([
    { date: "5/20", title: "親子遠足", child: "共通", type: "予定", items: ["弁当", "水筒"] },
    { date: "5/23", title: "衣替え開始", child: "共通", type: "持ち物", items: ["夏服登園"] },
  ]);

  const [manualRules, setManualRules] = useState<ManualRule[]>([
    {
      id: 1,
      title: "体操服を着ていく",
      child: "碧",
      type: "持ち物",
      repeat: "毎週",
      dayOfWeek: "木",
      monthDay: "",
      date: "",
      memo: "木曜は体操の日",
    },
  ]);

  const [manualTitle, setManualTitle] = useState("");
  const [manualChild, setManualChild] = useState<ChildTarget>("碧");
  const [manualType, setManualType] = useState<ManualType>("持ち物");
  const [manualRepeat, setManualRepeat] = useState<RepeatType>("毎週");
  const [manualDayOfWeek, setManualDayOfWeek] = useState("木");
  const [manualMonthDay, setManualMonthDay] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualMemo, setManualMemo] = useState("");

  const expandedManualEvents = useMemo(() => {
    const result: AnalyzedEvent[] = [];

    manualRules.forEach((rule) => {
      if (rule.repeat === "毎週") {
        calendarDays.forEach((day) => {
          if (dayOfWeekMap[day] === rule.dayOfWeek) {
            result.push({
              date: `5/${day}`,
              title: rule.title,
              child: rule.child,
              type: rule.type,
              items: rule.memo ? [rule.memo] : [],
            });
          }
        });
      }

      if (rule.repeat === "毎月") {
        const day = Number(rule.monthDay);
        if (day >= 1 && day <= 31) {
          result.push({
            date: `5/${day}`,
            title: rule.title,
            child: rule.child,
            type: rule.type,
            items: rule.memo ? [rule.memo] : [],
          });
        }
      }

      if (rule.repeat === "なし" && rule.date) {
        result.push({
          date: rule.date,
          title: rule.title,
          child: rule.child,
          type: rule.type,
          items: rule.memo ? [rule.memo] : [],
        });
      }
    });

    return result;
  }, [manualRules]);

  const allEvents = [...events, ...expandedManualEvents];

  const selectedMenu = menuDays.find((d) => d.date === selectedDate);
  const selectedEvents = allEvents.filter((e) => e.date === selectedDate);

  const addManualRule = () => {
    if (!manualTitle.trim()) return;

    setManualRules([
      {
        id: Date.now(),
        title: manualTitle,
        child: manualChild,
        type: manualType,
        repeat: manualRepeat,
        dayOfWeek: manualDayOfWeek,
        monthDay: manualMonthDay,
        date: manualDate,
        memo: manualMemo,
      },
      ...manualRules,
    ]);

    setManualTitle("");
    setManualMemo("");
    setManualDate("");
    setManualMonthDay("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setAnalysisRaw("");

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setActiveTab("prints");
    };
    reader.readAsDataURL(file);
  };

  const analyzePrint = async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    setAnalysisRaw("");

    try {
      const res = await fetch("/api/analyze-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await res.json();

      if (!data.success) {
        setAnalysisRaw("解析に失敗しました");
        return;
      }

      const parsed = parseGeminiJson(data.raw);
      setAnalysisRaw(JSON.stringify(parsed, null, 2));

      if (parsed.type === "menu" && parsed.days) {
        setMenuDays(parsed.days);
        setActiveTab("menu");
      }

      if (parsed.type === "schedule" && parsed.events) {
        setEvents(parsed.events);
        setActiveTab("calendar");
      }
    } catch {
      setAnalysisRaw("通信エラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md rounded-[34px] bg-sky-50 shadow-2xl border border-sky-100 overflow-hidden">
        <section className="bg-sky-200 px-5 py-5 text-center">
          <h1 className="text-3xl font-black text-blue-800">ほいく紙管理</h1>
          <p className="text-sm font-bold text-blue-600">保育園プリントを一元管理</p>
        </section>

        <section className="p-4 space-y-4">
          {activeTab === "home" && (
            <>
              <ChildrenCards />

              <label className="block w-full rounded-3xl bg-blue-600 p-5 text-white text-center font-black shadow cursor-pointer">
                📷 プリントをスキャン
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>

              <DayDetail selectedDate={selectedDate} selectedMenu={selectedMenu} selectedEvents={selectedEvents} />

              <ManualForm
                manualTitle={manualTitle}
                setManualTitle={setManualTitle}
                manualChild={manualChild}
                setManualChild={setManualChild}
                manualType={manualType}
                setManualType={setManualType}
                manualRepeat={manualRepeat}
                setManualRepeat={setManualRepeat}
                manualDayOfWeek={manualDayOfWeek}
                setManualDayOfWeek={setManualDayOfWeek}
                manualMonthDay={manualMonthDay}
                setManualMonthDay={setManualMonthDay}
                manualDate={manualDate}
                setManualDate={setManualDate}
                manualMemo={manualMemo}
                setManualMemo={setManualMemo}
                addManualRule={addManualRule}
              />
            </>
          )}

          {activeTab === "calendar" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-xl font-black mb-3">📅 5月カレンダー</h2>

              <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-2">
                <div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div><div>日</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} />)}

                {calendarDays.map((day) => {
                  const date = `5/${day}`;
                  const hasEvent = allEvents.some((e) => e.date === date);
                  const hasMenu = menuDays.some((m) => m.date === date);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square rounded-2xl text-sm font-black ${
                        selectedDate === date
                          ? "bg-blue-600 text-white"
                          : hasEvent
                          ? "bg-yellow-100 text-gray-800"
                          : hasMenu
                          ? "bg-green-100 text-gray-800"
                          : "bg-sky-50 text-gray-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <DayDetail selectedDate={selectedDate} selectedMenu={selectedMenu} selectedEvents={selectedEvents} />
            </div>
          )}

          {activeTab === "menu" && (
            <div className="rounded-3xl bg-yellow-50 p-4 shadow">
              <h2 className="text-xl font-black mb-3">🍚 献立表</h2>

              <div className="space-y-2">
                {menuDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setActiveTab("calendar");
                    }}
                    className="w-full rounded-2xl bg-white p-3 text-left shadow-sm"
                  >
                    <p className="font-black">{day.date}</p>
                    <p className="text-sm text-gray-700">{day.menu}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "prints" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-xl font-black">📄 プリント一覧</h2>

              <label className="mt-3 block w-full rounded-2xl bg-blue-600 p-4 text-center text-white font-black shadow cursor-pointer">
                新しくスキャンする
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>

              {imageUrl ? (
                <div className="mt-4 rounded-2xl bg-sky-50 p-3">
                  <p className="mb-2 font-black">読み込んだプリント</p>
                  <img src={imageUrl} className="w-full rounded-xl border" alt="プリント" />

                  <button
                    onClick={analyzePrint}
                    disabled={isAnalyzing}
                    className="mt-3 w-full rounded-2xl bg-pink-500 p-3 text-white font-black shadow disabled:bg-gray-400"
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
              <h2 className="text-xl font-black">⚙️ 設定</h2>
              <p className="mt-2 text-sm text-gray-600">組名変更・通知設定は次で追加。</p>
            </div>
          )}

          <nav className="grid grid-cols-5 rounded-3xl bg-white p-3 shadow text-center text-[11px] font-bold">
            <button onClick={() => setActiveTab("home")} className={activeTab === "home" ? "text-blue-600" : "text-gray-500"}><div className="text-2xl">🏠</div>ホーム</button>
            <button onClick={() => setActiveTab("calendar")} className={activeTab === "calendar" ? "text-blue-600" : "text-gray-500"}><div className="text-2xl">📅</div>カレンダー</button>
            <button onClick={() => setActiveTab("menu")} className={activeTab === "menu" ? "text-blue-600" : "text-gray-500"}><div className="text-2xl">🍚</div>献立</button>
            <button onClick={() => setActiveTab("prints")} className={activeTab === "prints" ? "text-blue-600" : "text-gray-500"}><div className="text-2xl">📄</div>プリント</button>
            <button onClick={() => setActiveTab("settings")} className={activeTab === "settings" ? "text-blue-600" : "text-gray-500"}><div className="text-2xl">⚙️</div>設定</button>
          </nav>
        </section>
      </div>
    </main>
  );
}

function ChildrenCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-3xl bg-blue-50 p-4 text-center shadow">
        <img src="/hayabusa.png" className="mx-auto h-16 object-contain" alt="碧" />
        <p className="mt-2 text-xl font-black text-blue-700">碧</p>
        <p className="text-sm font-bold text-gray-600">もも組</p>
      </div>

      <div className="rounded-3xl bg-pink-50 p-4 text-center shadow">
        <img src="/anpanman.png" className="mx-auto h-16 object-contain" alt="海未" />
        <p className="mt-2 text-xl font-black text-pink-600">海未</p>
        <p className="text-sm font-bold text-gray-600">ひよこ組</p>
      </div>
    </div>
  );
}

function ManualForm(props: {
  manualTitle: string;
  setManualTitle: (v: string) => void;
  manualChild: ChildTarget;
  setManualChild: (v: ChildTarget) => void;
  manualType: ManualType;
  setManualType: (v: ManualType) => void;
  manualRepeat: RepeatType;
  setManualRepeat: (v: RepeatType) => void;
  manualDayOfWeek: string;
  setManualDayOfWeek: (v: string) => void;
  manualMonthDay: string;
  setManualMonthDay: (v: string) => void;
  manualDate: string;
  setManualDate: (v: string) => void;
  manualMemo: string;
  setManualMemo: (v: string) => void;
  addManualRule: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow">
      <h2 className="text-lg font-black mb-3">✏️ 予定を追加</h2>

      <div className="space-y-3">
        <input
          value={props.manualTitle}
          onChange={(e) => props.setManualTitle(e.target.value)}
          placeholder="例：体操服を着ていく"
          className="w-full rounded-2xl border p-3 text-sm"
        />

        <div className="grid grid-cols-3 gap-2">
          <select value={props.manualChild} onChange={(e) => props.setManualChild(e.target.value as ChildTarget)} className="rounded-2xl border p-3 text-sm">
            <option>碧</option>
            <option>海未</option>
            <option>共通</option>
          </select>

          <select value={props.manualType} onChange={(e) => props.setManualType(e.target.value as ManualType)} className="rounded-2xl border p-3 text-sm">
            <option>予定</option>
            <option>持ち物</option>
            <option>提出物</option>
            <option>その他</option>
          </select>

          <select value={props.manualRepeat} onChange={(e) => props.setManualRepeat(e.target.value as RepeatType)} className="rounded-2xl border p-3 text-sm">
            <option>なし</option>
            <option>毎週</option>
            <option>毎月</option>
          </select>
        </div>

        {props.manualRepeat === "毎週" && (
          <select value={props.manualDayOfWeek} onChange={(e) => props.setManualDayOfWeek(e.target.value)} className="w-full rounded-2xl border p-3 text-sm">
            <option>月</option><option>火</option><option>水</option><option>木</option><option>金</option><option>土</option><option>日</option>
          </select>
        )}

        {props.manualRepeat === "毎月" && (
          <input
            value={props.manualMonthDay}
            onChange={(e) => props.setManualMonthDay(e.target.value)}
            placeholder="毎月何日？ 例：10"
            className="w-full rounded-2xl border p-3 text-sm"
          />
        )}

        {props.manualRepeat === "なし" && (
          <input
            value={props.manualDate}
            onChange={(e) => props.setManualDate(e.target.value)}
            placeholder="日付 例：5/20"
            className="w-full rounded-2xl border p-3 text-sm"
          />
        )}

        <textarea
          value={props.manualMemo}
          onChange={(e) => props.setManualMemo(e.target.value)}
          placeholder="メモ 例：木曜は体操の日"
          rows={2}
          className="w-full rounded-2xl border p-3 text-sm"
        />

        <button onClick={props.addManualRule} className="w-full rounded-2xl bg-pink-500 p-3 text-white font-black shadow">
          追加する
        </button>
      </div>
    </div>
  );
}

function DayDetail({
  selectedDate,
  selectedMenu,
  selectedEvents,
}: {
  selectedDate: string;
  selectedMenu?: AnalyzedDay;
  selectedEvents: AnalyzedEvent[];
}) {
  return (
    <div className="mt-4 rounded-3xl bg-white p-4 shadow">
      <h3 className="text-lg font-black">{selectedDate} の内容</h3>

      <div className="mt-3 rounded-2xl bg-yellow-50 p-3">
        <p className="font-black">🍚 献立</p>
        <p className="text-sm text-gray-700">{selectedMenu?.menu || "献立なし"}</p>
      </div>

      <div className="mt-3 rounded-2xl bg-blue-50 p-3">
        <p className="font-black">📌 予定・持ち物</p>
        {selectedEvents.length > 0 ? (
          selectedEvents.map((event) => (
            <div key={`${event.date}-${event.title}`} className="mt-1 text-sm text-gray-700">
              <p>・{event.child ? `${event.child}：` : ""}{event.title}</p>
              {event.items && event.items.length > 0 && (
                <p className="ml-3 text-xs text-gray-600">{event.items.join("、")}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">予定なし</p>
        )}
      </div>
    </div>
  );
}

function parseGeminiJson(raw: string): AnalyzeResult {
  const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned) as AnalyzeResult;
}