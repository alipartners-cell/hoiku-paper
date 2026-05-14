"use client";

import { useState } from "react";

type Tab = "home" | "calendar" | "menu" | "prints" | "settings";

type AnalyzedDay = {
  date: string;
  menu?: string;
};

type AnalyzedEvent = {
  date: string;
  title: string;
  items?: string[];
};

type AnalyzeResult = {
  type: "menu" | "schedule";
  days?: AnalyzedDay[];
  events?: AnalyzedEvent[];
};

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

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
    { date: "5/20", title: "親子遠足", items: ["弁当", "水筒"] },
    { date: "5/23", title: "衣替え開始", items: ["夏服登園"] },
  ]);

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
        headers: {
          "Content-Type": "application/json",
        },
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

  const selectedMenu = menuDays.find((d) => d.date === selectedDate);
  const selectedEvents = events.filter((e) => e.date === selectedDate);

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md rounded-[34px] bg-sky-50 shadow-2xl border border-sky-100 overflow-hidden">
        <section className="bg-sky-200 px-5 py-5 text-center">
          <h1 className="text-3xl font-black text-blue-800">ほいく紙管理</h1>
          <p className="text-sm font-bold text-blue-600">
            保育園プリントを一元管理
          </p>
        </section>

        <section className="p-4 space-y-4">
          {activeTab === "home" && (
            <>
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

              <label className="block w-full rounded-3xl bg-blue-600 p-5 text-white text-center font-black shadow cursor-pointer">
                📷 プリントをスキャン
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>

              <DayDetail
                selectedDate={selectedDate}
                selectedMenu={selectedMenu}
                selectedEvents={selectedEvents}
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
                {Array.from({ length: 3 }).map((_, i) => <div key={i} />)}

                {calendarDays.map((day) => {
                  const date = `5/${day}`;
                  const hasEvent = events.some((e) => e.date === date);
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

              <DayDetail
                selectedDate={selectedDate}
                selectedMenu={selectedMenu}
                selectedEvents={selectedEvents}
              />
            </div>
          )}

          {activeTab === "menu" && (
            <div className="rounded-3xl bg-yellow-50 p-4 shadow">
              <h2 className="text-xl font-black mb-3">🍚 献立表</h2>

              <div className="space-y-2">
                {menuDays.length === 0 ? (
                  <p className="text-sm text-gray-600">まだ献立はありません。</p>
                ) : (
                  menuDays.map((day) => (
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
                  ))
                )}
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
              <p className="mt-2 text-sm text-gray-600">
                組名変更・通知設定は次で追加。
              </p>
            </div>
          )}

          <nav className="grid grid-cols-5 rounded-3xl bg-white p-3 shadow text-center text-[11px] font-bold">
            <button onClick={() => setActiveTab("home")} className={activeTab === "home" ? "text-blue-600" : "text-gray-500"}>
              <div className="text-2xl">🏠</div>ホーム
            </button>
            <button onClick={() => setActiveTab("calendar")} className={activeTab === "calendar" ? "text-blue-600" : "text-gray-500"}>
              <div className="text-2xl">📅</div>カレンダー
            </button>
            <button onClick={() => setActiveTab("menu")} className={activeTab === "menu" ? "text-blue-600" : "text-gray-500"}>
              <div className="text-2xl">🍚</div>献立
            </button>
            <button onClick={() => setActiveTab("prints")} className={activeTab === "prints" ? "text-blue-600" : "text-gray-500"}>
              <div className="text-2xl">📄</div>プリント
            </button>
            <button onClick={() => setActiveTab("settings")} className={activeTab === "settings" ? "text-blue-600" : "text-gray-500"}>
              <div className="text-2xl">⚙️</div>設定
            </button>
          </nav>
        </section>
      </div>
    </main>
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
        <p className="text-sm text-gray-700">
          {selectedMenu?.menu || "献立なし"}
        </p>
      </div>

      <div className="mt-3 rounded-2xl bg-blue-50 p-3">
        <p className="font-black">📌 予定・持ち物</p>
        {selectedEvents.length > 0 ? (
          selectedEvents.map((event) => (
            <div key={`${event.date}-${event.title}`} className="mt-1 text-sm text-gray-700">
              <p>・{event.title}</p>
              {event.items && event.items.length > 0 && (
                <p className="ml-3 text-xs text-gray-600">
                  持ち物：{event.items.join("、")}
                </p>
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
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned) as AnalyzeResult;
}