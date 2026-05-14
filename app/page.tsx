"use client";

import { useState } from "react";

type Tab = "home" | "calendar" | "menu" | "prints" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setActiveTab("prints");
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
                  <img src="/hayabusa.png" className="mx-auto h-16 object-contain" />
                  <p className="mt-2 text-xl font-black text-blue-700">碧</p>
                  <p className="text-sm font-bold text-gray-600">もも組</p>
                </div>

                <div className="rounded-3xl bg-pink-50 p-4 text-center shadow">
                  <img src="/anpanman.png" className="mx-auto h-16 object-contain" />
                  <p className="mt-2 text-xl font-black text-pink-600">海未</p>
                  <p className="text-sm font-bold text-gray-600">ひよこ組</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow">
                <h2 className="text-lg font-black">☀️ 今日やること</h2>
                <div className="mt-3 space-y-2">
                  <div className="rounded-2xl bg-orange-50 p-3">
                    <p className="font-black text-orange-600">📅 土曜保育申込</p>
                    <p className="text-xs text-gray-600">毎週月曜に確認</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <p className="font-black text-blue-700">碧：体操服</p>
                    <p className="text-xs text-gray-600">木曜は体操の日</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow">
                <h2 className="mb-3 text-lg font-black">📷 プリントスキャン</h2>

                <label className="block w-full rounded-2xl bg-blue-600 p-4 text-center text-white font-black shadow cursor-pointer">
                  カメラ・写真を開く
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>

                <p className="mt-2 text-xs text-gray-500">
                  撮影後、プリント一覧に表示されます
                </p>
              </div>

              <div className="rounded-3xl bg-yellow-50 p-4 shadow">
                <h2 className="text-lg font-black">🍚 今日の献立</h2>
                <p className="mt-2 font-bold">ごはん・ハンバーグ・野菜スープ</p>
              </div>
            </>
          )}

          {activeTab === "calendar" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-xl font-black">📅 カレンダー</h2>
              <div className="mt-3 space-y-2">
                <div className="rounded-2xl bg-blue-50 p-3">
                  <p className="font-black">毎週木曜：体操服</p>
                  <p className="text-sm text-gray-600">碧 / 持ち物 / 毎週</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-3">
                  <p className="font-black">5/20：親子遠足</p>
                  <p className="text-sm text-gray-600">共通 / 行事</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="rounded-3xl bg-yellow-50 p-4 shadow">
              <h2 className="text-xl font-black">🍚 献立表</h2>
              <div className="mt-3 space-y-2">
                <div className="rounded-2xl bg-white p-3">
                  <p className="font-black">今日</p>
                  <p className="text-sm">ごはん・ハンバーグ・野菜スープ</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="font-black">明日</p>
                  <p className="text-sm">パン・クリームシチュー・バナナ</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "prints" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-xl font-black">📄 プリント一覧</h2>

              <label className="mt-3 block w-full rounded-2xl bg-blue-600 p-4 text-center text-white font-black shadow cursor-pointer">
                新しくスキャンする
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>

              {imageUrl ? (
                <div className="mt-4 rounded-2xl bg-sky-50 p-3">
                  <p className="mb-2 font-black">読み込んだプリント</p>
                  <img src={imageUrl} className="w-full rounded-xl border" />
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  まだプリントはありません。
                </p>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-3xl bg-white p-4 shadow">
              <h2 className="text-xl font-black">⚙️ 設定</h2>
              <p className="mt-2 text-sm text-gray-600">ここで組名変更などを追加予定。</p>
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