import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AIConfig,
  MockAmplitudeAI,
  PROP_COST_USD,
  PROP_INPUT_TOKENS,
  PROP_LATENCY_MS,
  PROP_MODEL_NAME,
  PROP_OUTPUT_TOKENS,
  PROP_PROVIDER,
  PROP_SESSION_ID,
} from "@amplitude/ai";

test("culpeo agent emits a closed session with required AI fields", async () => {
  const mock = new MockAmplitudeAI(new AIConfig({ contentMode: "full" }));
  const agent = mock.agent("culpeo", { userId: "u1" });

  await agent.session({ sessionId: "s1" }).run(async (s) => {
    s.trackUserMessage("hola");
    s.trackAiMessage("Hola, soy Culpeo.", "grok-4.5", "xai", 150, {
      inputTokens: 42,
      outputTokens: 96,
      totalCostUsd: 0,
    });
  });

  mock.assertEventTracked("[Agent] User Message", { userId: "u1" });
  mock.assertSessionClosed("s1");

  const aiEvents = mock.getEvents("[Agent] AI Response");
  assert.ok(aiEvents.length >= 1);
  for (const event of aiEvents) {
    const props = event.event_properties ?? {};
    assert.ok(event.user_id || event.device_id);
    assert.ok(props[PROP_SESSION_ID]);
    assert.ok(props[PROP_MODEL_NAME]);
    assert.ok(props[PROP_PROVIDER]);
    assert.ok(Number(props[PROP_LATENCY_MS]) > 0);
    assert.ok(Number(props[PROP_INPUT_TOKENS]) > 0);
    assert.ok(Number(props[PROP_OUTPUT_TOKENS]) > 0);
    assert.notEqual(props[PROP_COST_USD], undefined);
  }
});
