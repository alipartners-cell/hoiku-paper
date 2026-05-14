import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  return Response.json({
    ok: true,
    hasKey: !!process.env.GEMINI_API_KEY,
    message: "analyze-print API is alive",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageBase64 = body.image;

    if (!imageBase64) {
      return Response.json({ success: false, error: "画像がありません" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ success: false, error: "GEMINI_API_KEYがありません" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
あなたは保育園プリント解析AIです。
画像を解析して、献立表か予定表かを判定してください。

必ずJSONのみ返してください。

献立表なら：
{
  "type": "menu",
  "days": [
    { "date": "5/20", "menu": "ごはん、ハンバーグ、スープ" }
  ]
}

予定表なら：
{
  "type": "schedule",
  "events": [
    { "date": "5/20", "title": "親子遠足", "items": ["弁当", "水筒"] }
  ]
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ]);

    return Response.json({
      success: true,
      raw: result.response.text(),
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      error: "解析失敗",
    });
  }
}