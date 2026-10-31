import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = 3100;
const origin = `http://127.0.0.1:${port}`;
const environment = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
delete environment.GEMINI_API_KEY;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    env: environment,
    stdio: "ignore",
  },
);

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) throw new Error("The production server exited before becoming ready.");
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      await pause(500);
      continue;
    }
    await pause(500);
  }
  throw new Error("The production server did not start in time.");
}

try {
  await waitForServer();
  const homepage = await fetch(origin);
  const page = await homepage.text();
  assert.equal(homepage.status, 200);
  assert.match(page, /Tell us what you.re celebrating/i);
  assert.match(page, /OPEN-WEIGHT AI/i);

  const scenarios = [
    {
      eventType: "Birthday",
      eventName: "Riley's picnic",
      date: "",
      location: "Portland",
      budget: 2400,
      guests: 36,
      style: "Colorful and relaxed",
      notes: "Include a low-cost craft table.",
    },
    {
      eventType: "Wedding",
      eventName: "Sam and Alex",
      date: "2027-06-12",
      location: "Austin",
      budget: 18_001,
      guests: 85,
      style: "Garden party",
      notes: "",
    },
    {
      eventType: "Community",
      eventName: "Summer block party",
      date: "",
      location: "North Park",
      budget: 6500,
      guests: 140,
      style: "Family friendly",
      notes: "Provide accessible seating.",
    },
  ];

  for (const scenario of scenarios) {
    const response = await fetch(`${origin}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario),
    });
    assert.equal(response.status, 200, `${scenario.eventType} planning should work without an API key.`);

    const result = await response.json();
    assert.equal(result.mode, "built-in");
    const plannedBudget = result.plan.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
    assert.ok(Math.abs(plannedBudget - scenario.budget) < 0.01, `${scenario.eventType} budget should balance.`);
    assert.equal(result.plan.timeline.length, 4);
    assert.equal(result.plan.vendorChecklist.length >= 6, true);
  }

  const birthdayResult = await fetch(`${origin}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenarios[0]),
  }).then((response) => response.json());
  assert.match(birthdayResult.plan.ideas[0].title, /colorful and relaxed/i);
  assert.match(birthdayResult.plan.ideas[1].detail, /low-cost craft table/i);

  const invalidResponse = await fetch(`${origin}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType: "Birthday" }),
  });
  assert.equal(invalidResponse.status, 400, "Invalid form submissions should be rejected.");

  const invalidDateResponse = await fetch(`${origin}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...scenarios[0], date: "2027-02-31" }),
  });
  assert.equal(invalidDateResponse.status, 400, "Impossible event dates should be rejected.");

  console.log("Production event planning works for all event types without an API key.");
} finally {
  server.kill();
}
