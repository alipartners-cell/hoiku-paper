"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "home" | "calendar" | "menu" | "prints" | "settings";
type ChildTarget = "碧" | "海未" | "共通";

type EventItem = {
  id: number;
  date: string;
  title: string;
  detail?: string;
  child?: ChildTarget;
};

type MenuItem = {
  date: string;
  menu: string;
};

const STORAGE_KEY = "hoiku-paper-v4";

const YEAR = 2026;
const months = [5, 6, 7];

const HOLIDAYS = [
  "5/3",
  "5/4",
  "5/5",
  "5/6",
  "7/20",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const [selectedChildren, setSelectedChildren] = useState<
    ChildTarget[]
  >(["碧", "海未"]);

  const [selectedDate, setSelectedDate] = useState("5/18");

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 1,
      date: "5/18",
      title: "5月の服装について",
      detail:
        "5月18日(月)から衣替えを開始します。5月1日(金)〜5月16日(土)は調整期間です。",
      child: "共通",
    },
    {
      id: 2,
      date: "5/18",
      title: "土曜保育申込",
      detail: "忘れずに申込",
      child: "共通",
    },
    {
      id: 3,
      date: "5/21",
      title: "体操服を着ていく",
      detail: "木曜は体操の日",
      child: "碧",
    },
  ]);

  const [menus, setMenus] = useState<MenuItem[]>([
    {
      date: "5/18",
      menu:
        "豚肉ケチャップ炒め、けんちん汁、麦ごはん、レモンケーキ",
    },
  ]);

  const [spotTitle, setSpotTitle] = useState("");
  const [spotDetail, setSpotDetail] = useState("");

  const [spotMonth, setSpotMonth] = useState("5");
  const [spotDay, setSpotDay] = useState("18");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      setEvents(parsed.events || []);
      setMenus(parsed.menus || []);
      setSelectedDate(parsed.selectedDate || "5/18");
      setSelectedChildren(
        parsed.selectedChildren || ["碧", "海未"]
      );
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        events,
        menus,
        selectedDate,
        selectedChildren,
      })
    );
  }, [events, menus, selectedDate, selectedChildren]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.child === "共通") return true;

      return selectedChildren.includes(
        event.child as ChildTarget
      );
    });
  }, [events, selectedChildren]);

  const selectedEvents = useMemo(() => {
    return filteredEvents.filter(
      (e) => e.date === selectedDate
    );
  }, [filteredEvents, selectedDate]);

  const selectedMenu = useMemo(() => {
    return menus.find((m) => m.date === selectedDate);
  }, [menus, selectedDate]);

  const homeSummary = useMemo(() => {
    return filteredEvents.slice(0, 3);
  }, [filteredEvents]);

  const addSpotEvent = () => {
    if (!spotTitle) return;

    const newEvent: EventItem = {
      id: Date.now(),
      date: `${spotMonth}/${spotDay}`,
      title: spotTitle,
      detail: spotDetail,
      child: "共通",
    };

    setEvents([newEvent, ...events]);

    setSpotTitle("");
    setSpotDetail("");
  };

  const toggleChild = (child: ChildTarget) => {
    setSelectedChildren((prev) => {
      if (prev.includes(child)) {
        const next = prev.filter((c) => c !== child);

        if (next.length === 0) return prev;

        return next;
      }

      return [...prev, child];
    });
  };

  return (
    <main className="min-h-screen bg-[#eef7ff] p-4">
      <div className="mx-auto max-w-md overflow-hidden rounded-[36px] border border-sky-100 bg-white shadow-2xl">
        <header className="bg-sky-200 p-5 text-center">
          <h1 className="text-4xl font-black text-blue-700">
            ほいく紙管理
          </h1>

          <p className="mt-1 text-sm font-bold text-blue-500">
            保育園プリントを一元管理
          </p>
        </header>

        <div className="space-y-4 p-4">
          {activeTab === "home" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleChild("碧")}
                  className={`rounded-3xl p-4 text-center shadow transition ${
                    selectedChildren.includes("碧")
                      ? "bg-blue-100 ring-4 ring-blue-300"
                      : "bg-gray-100 opacity-60"
                  }`}
                >
                  <img
                    src="/hayabusa.png"
                    className="mx-auto h-20 object-contain"
                  />

                  <p className="mt-2 text-2xl font-black text-blue-700">
                    碧
                  </p>

                  <p className="font-bold text-gray-500">
                    もも組
                  </p>
                </button>

                <button
                  onClick={() => toggleChild("海未")}
                  className={`rounded-3xl p-4 text-center shadow transition ${
                    selectedChildren.includes("海未")
                      ? "bg-pink-100 ring-4 ring-pink-300"
                      : "bg-gray-100 opacity-60"
                  }`}
                >
                  <img
                    src="/anpanman.png"
                    className="mx-auto h-20 object-contain"
                  />

                  <p className="mt-2 text-2xl font-black text-pink-600">
                    海未
                  </p>

                  <p className="font-bold text-gray-500">
                    ひよこ組
                  </p>
                </button>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow">
                <h2 className="text-xl font-black">
                  ☀️ 今日やること
                </h2>

                <div className="mt-3 space-y-2">
                  {homeSummary.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-blue-50 p-3"
                    >
                      <p className="font-black text-blue-700">
                        {event.child !== "共通"
                          ? `${event.child}：`
                          : ""}
                        {event.title}
                      </p>

                      <p className="line-clamp-1 text-sm text-gray-600">
                        {event.detail}
                      </p>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-yellow-50 p-3">
                    <p className="font-black text-yellow-700">
                      🍚 今日の献立
                    </p>

                    <p className="line-clamp-1 text-sm text-gray-700">
                      {selectedMenu?.menu || "献立なし"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow">
                <h2 className="text-xl font-black">
                  📌 スポット予定追加
                </h2>

                <div className="mt-3 space-y-3">
                  <input
                    value={spotTitle}
                    onChange={(e) =>
                      setSpotTitle(e.target.value)
                    }
                    placeholder="予定タイトル"
                    className="w-full rounded-2xl border p-3"
                  />

                  <textarea
                    value={spotDetail}
                    onChange={(e) =>
                      setSpotDetail(e.target.value)
                    }
                    placeholder="詳細"
                    rows={3}
                    className="w-full rounded-2xl border p-3"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={spotMonth}
                      onChange={(e) =>
                        setSpotMonth(e.target.value)
                      }
                      className="rounded-2xl border p-3"
                    >
                      <option value="5">5月</option>
                      <option value="6">6月</option>
                      <option value="7">7月</option>
                    </select>

                    <select
                      value={spotDay}
                      onChange={(e) =>
                        setSpotDay(e.target.value)
                      }
                      className="rounded-2xl border p-3"
                    >
                      {Array.from({ length: 31 }).map(
                        (_, i) => (
                          <option
                            key={i + 1}
                            value={i + 1}
                          >
                            {i + 1}日
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    onClick={addSpotEvent}
                    className="w-full rounded-2xl bg-pink-500 p-3 font-black text-white shadow"
                  >
                    予定を追加
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-4">
              {months.map((month) => {
                const firstDay = new Date(
                  YEAR,
                  month - 1,
                  1
                ).getDay();

                return (
                  <div
                    key={month}
                    className="rounded-3xl bg-white p-4 shadow"
                  >
                    <h2 className="text-2xl font-black">
                      {month}月
                    </h2>

                    <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm font-black">
                      <div className="text-red-500">日</div>
                      <div>月</div>
                      <div>火</div>
                      <div>水</div>
                      <div>木</div>
                      <div>金</div>
                      <div className="text-blue-500">土</div>
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-2">
                      {Array.from({
                        length: firstDay,
                      }).map((_, i) => (
                        <div key={i} />
                      ))}

                      {Array.from({ length: 31 }).map(
                        (_, i) => {
                          const day = i + 1;

                          const date = `${month}/${day}`;

                          const hasEvent =
                            filteredEvents.some(
                              (e) => e.date === date
                            );

                          const hasMenu = menus.some(
                            (m) => m.date === date
                          );

                          const weekDay = new Date(
                            YEAR,
                            month - 1,
                            day
                          ).getDay();

                          const isSunday =
                            weekDay === 0 ||
                            HOLIDAYS.includes(date);

                          const isSaturday =
                            weekDay === 6;

                          return (
                            <button
                              key={date}
                              onClick={() =>
                                setSelectedDate(date)
                              }
                              className={`aspect-square rounded-2xl border text-lg font-black transition ${
                                selectedDate === date
                                  ? "bg-blue-600 text-white"
                                  : hasEvent
                                  ? "bg-yellow-100"
                                  : hasMenu
                                  ? "bg-green-100"
                                  : "bg-slate-50"
                              } ${
                                isSunday
                                  ? "text-red-500"
                                  : isSaturday
                                  ? "text-blue-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="rounded-3xl bg-white p-4 shadow">
                <h2 className="text-2xl font-black">
                  {selectedDate} の内容
                </h2>

                <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
                  <p className="text-2xl font-black">
                    🍚 献立
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-lg text-gray-700">
                    {selectedMenu?.menu || "献立なし"}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                  <p className="text-2xl font-black">
                    📌 予定・持ち物
                  </p>

                  <div className="mt-3 space-y-4">
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map((event) => (
                        <div key={event.id}>
                          <p className="text-xl font-black">
                            {event.child !== "共通"
                              ? `${event.child}：`
                              : ""}
                            {event.title}
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-gray-700">
                            {event.detail}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        予定なし
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-2xl font-black">
                🍚 献立一覧
              </h2>

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
                    <p className="font-black">
                      {menu.date}
                    </p>

                    <p className="mt-1 text-gray-700">
                      {menu.menu}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "prints" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-2xl font-black">
                📄 プリント
              </h2>

              <div className="mt-4 rounded-2xl bg-sky-50 p-5 text-center">
                Gemini解析プリント管理エリア
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-2xl font-black">
                ⚙️ 設定
              </h2>

              <button
                onClick={() => {
                  localStorage.removeItem(
                    STORAGE_KEY
                  );
                  location.reload();
                }}
                className="mt-4 w-full rounded-2xl bg-red-500 p-4 font-black text-white"
              >
                保存データ削除
              </button>
            </div>
          )}

          <nav className="grid grid-cols-5 rounded-3xl bg-white p-3 text-center shadow">
            <button
              onClick={() => setActiveTab("home")}
              className={
                activeTab === "home"
                  ? "text-blue-600"
                  : "text-gray-500"
              }
            >
              <div className="text-3xl">🏠</div>
              ホーム
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={
                activeTab === "calendar"
                  ? "text-blue-600"
                  : "text-gray-500"
              }
            >
              <div className="text-3xl">📅</div>
              カレンダー
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={
                activeTab === "menu"
                  ? "text-blue-600"
                  : "text-gray-500"
              }
            >
              <div className="text-3xl">🍚</div>
              献立
            </button>

            <button
              onClick={() => setActiveTab("prints")}
              className={
                activeTab === "prints"
                  ? "text-blue-600"
                  : "text-gray-500"
              }
            >
              <div className="text-3xl">📄</div>
              プリント
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={
                activeTab === "settings"
                  ? "text-blue-600"
                  : "text-gray-500"
              }
            >
              <div className="text-3xl">⚙️</div>
              設定
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
}