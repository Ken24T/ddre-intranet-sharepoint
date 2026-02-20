export const DEFAULT_AGENT_NAME = "Doug Disher Real Estate";

const DEFAULT_AGENT_NAME_STORAGE_KEY =
  "ddre-marketing-budget-default-agent-name";

export const normaliseDefaultAgentName = (value: string): string => {
  const trimmed = value.trim();
  return trimmed || DEFAULT_AGENT_NAME;
};

export const loadDefaultAgentName = (): string => {
  try {
    const stored = localStorage.getItem(DEFAULT_AGENT_NAME_STORAGE_KEY);
    return stored ? normaliseDefaultAgentName(stored) : DEFAULT_AGENT_NAME;
  } catch {
    return DEFAULT_AGENT_NAME;
  }
};

export const saveDefaultAgentName = (value: string): string => {
  const normalised = normaliseDefaultAgentName(value);
  try {
    localStorage.setItem(DEFAULT_AGENT_NAME_STORAGE_KEY, normalised);
  } catch {
    // Ignore storage errors.
  }
  return normalised;
};