import { execSync } from "node:child_process";

const testInput = JSON.stringify({
  model: { id: "claude-sonnet-4-6", display_name: "Sonnet 4.6" },
  cwd: "F:/claude_project/ClaudeHud",
  workspace: { current_dir: "F:/claude_project/ClaudeHud" },
  context_window: {
    context_window_size: 200000,
    current_usage: {
      input_tokens: 50000,
      output_tokens: 10000,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
    used_percentage: 25,
  },
  rate_limits: {
    five_hour: { used_percentage: 30 },
    seven_day: { used_percentage: 10 },
  },
  transcript_path: "",
});

try {
  const result = execSync(
    `echo '${testInput}' | node dist/index.js`,
    { cwd: "F:/claude_project/ClaudeHud", encoding: "utf-8", timeout: 5000 }
  );
  console.log("=== stdout ===");
  console.log(result);
} catch (err) {
  console.error("=== error ===");
  console.error(err.message || err);
  if (err.stdout) console.log("stdout:", err.stdout);
  if (err.stderr) console.log("stderr:", err.stderr);
}
