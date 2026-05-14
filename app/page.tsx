"use client";

import { useState } from "react";

type Tab = "home" | "calendar" | "menu" | "prints" | "settings";

type DayData = {
  date: number;
  events: string[];
  menu: string;
};

const monthDays: DayData[] = [
  { date: 1, events: [], menu: "ごはん・みそ汁・魚の照り焼き" },
  { date: 2, events: [], menu: "パン・シチュー・バナナ" },
  { date: 3, events: [], menu: "休園日" },
  { date: 4, events: [], menu: "休園日" },
  { date: 5, events: [], menu: "カレーライス・サラダ" },
  { date: 6, events: [], menu: "ごはん・肉じゃが・すまし汁" },
  { date: 7, events: [], menu: "うどん・野菜かきあげ" },
  { date: 8, events: ["碧：体操服"], menu: "ごはん・ハンバーグ・野菜スープ" },
  { date: 9, events: [], menu: "パン・オムレツ・スープ" },
  { date: 10, events: [], menu: "休園日" },
  { date: 11, events: [], menu: "休園日" },
  { date: 12, events: ["土曜保育申込"], menu: "ごはん・からあげ・みそ汁" },
  { date: 13, events: [], menu: "焼きそば・スープ" },
  { date: 14, events: [], menu: "ごはん・鮭・野菜炒め" },
  { date: 15, events: ["碧：体操服"], menu: "パン・クリームシチュー" },
  { date: 16, events: [], menu: "ごはん・麻婆豆腐・スープ" },
  { date: 17, events: [], menu: "休園日" },
  { date: 18, events: [], menu: "休園日" },
  { date: 19, events: ["土曜保育申込"], menu: "ごはん・コロッケ・みそ汁" },
  { date: 20, events: ["親子遠足"], menu: "お弁当日" },
  { date: 21, events: [], menu: "ごはん・鶏の照り焼き・スープ" },
  { date: 22, events: ["碧：体操服"], menu: "パン・ポトフ・りんご" },
  { date: 23, events: ["衣替え開始"], menu: "ごはん・白身魚フライ・みそ汁" },
  { date: 24, events: [], menu: "休園日" },
  { date: 25, events: ["保護者会"], menu: "休園日" },
  { date: 26, events: ["土曜保育申込"], menu: "ごはん・豚汁・卵焼き" },
  { date: 27, events: [], menu: "カレーうどん・ヨーグルト" },
  { date: 28, events: [], menu: "ごはん・チキンカツ・スープ" },
  { date: 29, events: ["碧：体操服"], menu: "パン・ミートボール・サラダ" },
  { date: 30, events: [], menu: "ごはん・さばの味噌煮・すまし汁" },
  { date: 31, events: [], menu: "休園日" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(20);
  const [analyzed, setAnalyzed] = useState(false);

  const selectedDay = monthDays.find((day) => day.date === selectedDate);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setAnalyzed(false);
    setActiveTab("prints");
  };

  const analyzePrint = () => {
    setAnalyzed(true);
    setActiveTab("menu");
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

              <TodayCard selectedDay={selectedDay} />
            </>
          )}

          {activeTab === "calendar" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-xl font-black mb-3">📅 5月カレンダー</h2>

              <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-2">
                <div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div><div>日</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {monthDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`aspect-square rounded-2xl text-sm font-black ${
                      selectedDate === day.date
                        ? "bg-blue-600 text-white"
                        : day.events.length > 0
                        ? "bg-yellow-100 text-gray-800"
                        : "bg-sky-50 text-gray-700"
                    }`}
                  >
                    {day.date}
                  </button>
                ))}
              </div>

              <TodayCard selectedDay={selectedDay} />
            </div>
          )}

          {activeTab === "menu" && (
            <div className="rounded-3xl bg-yellow-50 p-4 shadow">
              <h2 className="text-xl font-black mb-3">🍚 献立表</h2>

              {analyzed && (
                <div className="mb-3 rounded-2xl bg-green-100 p-3 text-sm font-bold text-green-700">
                  ✅ スキャンした献立表を反映しました
                </div>
              )}

              <TodayCard selectedDay={selectedDay} />

              <div className="mt-4 space-y-2">
                {monthDays.slice(19, 24).map((day) => (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setActiveTab("calendar");
                    }}
                    className="w-full rounded-2xl bg-white p-3 text-left shadow-sm"
                  >
                    <p className="font-black">5/{day.date}</p>
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
                    className="mt-3 w-full rounded-2xl bg-pink-500 p-3 text-white font-black shadow"
                  >
                    🤖 AI解析する
                  </button>
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

function TodayCard({ selectedDay }: { selectedDay?: DayData }) {
  if (!selectedDay) return null;

  return (
    <div className="mt-4 rounded-3xl bg-white p-4 shadow">
      <h3 className="text-lg font-black">5/{selectedDay.date} の内容</h3>

      <div className="mt-3 rounded-2xl bg-yellow-50 p-3">
        <p className="font-black">🍚 献立</p>
        <p className="text-sm text-gray-700">{selectedDay.menu}</p>
      </div>

      <div className="mt-3 rounded-2xl bg-blue-50 p-3">
        <p className="font-black">📌 予定・持ち物</p>
        {selectedDay.events.length > 0 ? (
          selectedDay.events.map((event) => (
            <p key={event} className="text-sm text-gray-700">・{event}</p>
          ))
        ) : (
          <p className="text-sm text-gray-500">予定なし</p>
        )}
      </div>
    </div>
  );
}