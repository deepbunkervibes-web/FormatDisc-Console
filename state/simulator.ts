import { Message, Role, Status } from "../simulator-types";
import { mulberry32, randInt } from "../utils/rng";
import { now } from "../utils/time";

export interface SimulatorOptions {
  seed?: number;
  baseDelayMin?: number;
  baseDelayMax?: number;
  warningPct?: number; // base chance
  errorPct?: number; // base chance
}

export class Simulator {
  private messages: Message[] = [];
  private rng: () => number;
  private options: Required<SimulatorOptions>;
  private chaosMode = false;
  private sessionId: string;

  constructor(opts?: SimulatorOptions) {
    const seed = opts?.seed ?? Math.floor(now() % 2 ** 31);
    this.rng = mulberry32(seed);
    this.options = {
      seed,
      baseDelayMin: opts?.baseDelayMin ?? 800,
      baseDelayMax: opts?.baseDelayMax ?? 2500,
      warningPct: opts?.warningPct ?? 0.10,
      errorPct: opts?.errorPct ?? 0.05
    };
    this.sessionId = `sess-${Math.abs(Math.floor(seed)).toString(36)}`;
    // session start system message
    this.pushSystem(`Session started: ${this.sessionId}`);
  }

  getSessionId() {
    return this.sessionId;
  }

  getMessages() {
    return this.messages.slice();
  }

  clear() {
    this.messages = [];
    this.pushSystem(`Session restarted: ${this.sessionId}`);
  }

  toggleChaosMode() {
    this.chaosMode = !this.chaosMode;
    this.pushSystem(`Chaos mode ${this.chaosMode ? "enabled" : "disabled"}`);
  }

  pushSystem(text: string) { // Made public to allow CommandPalette to inject messages
    const m: Message = {
      id: `m-${now()}-${Math.floor(this.rng() * 1e6)}`,
      role: "system",
      content: text,
      status: "success",
      startedAt: now()
    };
    this.messages.push(m);
  }

  sendUser(content: string) {
    // 1) user message rendered immediately
    const userMsg: Message = {
      id: `u-${now()}-${Math.floor(this.rng() * 1e6)}`,
      role: "user",
      content,
      status: "success",
      startedAt: now(),
      finishedAt: now()
    };
    this.messages.push(userMsg);

    // 2) spawn assistant message in executing state
    const assistant: Message = {
      id: `a-${now()}-${Math.floor(this.rng() * 1e6)}`,
      role: "assistant",
      content: "…", // placeholder; will be replaced when resolved
      status: "executing",
      startedAt: now()
    };
    this.messages.push(assistant);

    // simulate execution
    this.simulateResolve(assistant.id, content);
  }

  simulateResolve(assistantId: string, userPrompt: string) {
    const delay = randInt(this.rng, this.options.baseDelayMin, this.options.baseDelayMax);
    // chaosMode increases chances: multiplier
    const warningPct = this.options.warningPct * (this.chaosMode ? 2 : 1);
    const errorPct = this.options.errorPct * (this.chaosMode ? 2 : 1);

    setTimeout(() => {
      const r = this.rng();
      let finalStatus: Status = "success";
      if (r < errorPct) finalStatus = "error";
      else if (r < errorPct + warningPct) finalStatus = "warning";
      // find message and update
      const idx = this.messages.findIndex((m) => m.id === assistantId);
      if (idx === -1) return;
      const generated = this.generateAssistantContent(finalStatus, userPrompt);
      this.messages[idx] = {
        ...this.messages[idx],
        content: generated,
        status: finalStatus,
        finishedAt: now()
      };
      // Note: external UI must poll getMessages or subscribe — stateless simulator keeps messages
    }, delay);
  }

  private generateAssistantContent(status: Status, userPrompt: string) {
    if (status === "success") {
      return `Result: simulated OK for: "${userPrompt}"\n\n- exec: completed\n- duration: simulated\n\n(Deterministic seed: ${this.options.seed})`;
    }
    if (status === "warning") {
      return `Warning: non-fatal issue while processing: "${userPrompt}"\n\n- code: WARN_42\n- note: degraded performance expected; retry recommended`;
    }
    // error
    return `ERROR: failed to execute orchestration step for: "${userPrompt}"\n\n--- DIAGNOSTIC ---\n- stage: runtime.dispatch\n- trace: 0x${Math.floor(this.rng() * 1e9).toString(16)}\n- suggestion: inspect upstream connector and retry\n--- END ---`;
  }

  // helpers for test actions
  injectError() {
    const assistant: Message = {
      id: `a-${now()}-inject`,
      role: "assistant",
      content: `ERROR: injected error via control`,
      status: "error",
      startedAt: now(),
      finishedAt: now()
    };
    this.messages.push(assistant);
  }

  simulateLongRunning() {
    const assistant: Message = {
      id: `a-${now()}-long`,
      role: "assistant",
      content: `Long running task started`,
      status: "executing",
      startedAt: now()
    };
    this.messages.push(assistant);
    // resolve long after
    setTimeout(() => {
      const idx = this.messages.findIndex((m) => m.id === assistant.id);
      if (idx === -1) return;
      this.messages[idx] = {
        ...this.messages[idx],
        content: `Long task finished (simulated)`,
        status: "success",
        finishedAt: now()
      };
    }, 10000); // 10s long task
  }
}
