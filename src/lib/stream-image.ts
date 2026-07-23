import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

type ImageEventPayload =
  | { type: "image_generation.partial_image"; b64_json: string; partial_image_index: number }
  | { type: "image_generation.completed"; b64_json: string }
  | { type: "error"; error: { message: string } };

export async function streamImage(
  prompt: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  onStatus?: (status: string) => void,
): Promise<string> {
  onStatus?.("Applying your prompt...");
  const res = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Image generation failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  onStatus?.("Generating image...");

  let finalUrl = "";
  let sawCompleted = false;
  let streamError: string | undefined;
  const parser = createParser({
    onEvent(event) {
      let payload: ImageEventPayload | undefined;
      try {
        payload = JSON.parse(event.data) as ImageEventPayload;
      } catch {
        return;
      }
      if (event.event === "error" || payload?.type === "error") {
        streamError =
          (payload as { error?: { message?: string } })?.error?.message ??
          "Image generation failed";
        return;
      }
      if (
        event.event !== "image_generation.partial_image" &&
        event.event !== "image_generation.completed"
      )
        return;
      const isFinal = event.event === "image_generation.completed";
      const url = `data:image/png;base64,${(payload as { b64_json: string }).b64_json}`;
      flushSync(() => {
        onFrame(url, isFinal);
      });
      if (isFinal) {
        finalUrl = url;
        sawCompleted = true;
        onStatus?.("Rendering final image...");
      } else {
        onStatus?.("Rendering preview...");
      }
    },
  });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  if (streamError) throw new Error(streamError);
  if (!sawCompleted) throw new Error("Image stream ended without a completed event");
  return finalUrl;
}
