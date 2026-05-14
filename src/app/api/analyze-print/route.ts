import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const imageBase64 = body.image;

    if (!imageBase64) {
      return Response.json({
        success: false,
        error: "画像がありません",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
あなたは保育園プリント解析AIです。

画像を解析して、
以下のどちらかを判定してください。

1. 献立表
2. 行事予定表・お知らせ

JSONのみ返してください。

献立表なら：

{
  "type": "menu",
  "days": [
    {
      "date": "5/20",
      "menu": "ごはん、ハンバーグ、スープ"
    }
  ]
}

予定表なら：

{
  "type": "schedule",
  "events": [
    {
      "date": "5/20",
      "title": "親子遠足",
      "items": ["弁当", "水筒"]
    }
  ]
}

JSON以外は返さないでください。
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

    const text = result.response.text();

    return Response.json({
      success: true,
      raw: text,
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      error: "解析失敗",
    });
  }
}