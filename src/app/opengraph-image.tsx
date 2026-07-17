import { ImageResponse } from "next/og";

export const alt =
  "JeevanDwaar — direct work, farm markets and reusable books";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fbfaf6",
          color: "#102a43",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 80,
          textAlign: "center",
          width: "100%",
        }}
      >
        <div style={{ color: "#177245", fontSize: 28, fontWeight: 800 }}>
          OPENAI BUILD WEEK
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 86,
            fontWeight: 900,
            letterSpacing: -5,
            marginTop: 24,
          }}
        >
          JeevanDwaar
        </div>
        <div style={{ fontSize: 34, lineHeight: 1.4, marginTop: 24 }}>
          One multilingual doorway to local work, direct farm markets and
          reusable books.
        </div>
      </div>
    ),
    size,
  );
}
