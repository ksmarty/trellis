import {
  IconAgents,
  IconEvals,
  IconGateway,
  IconSearch,
  IconShield,
  IconTrace,
} from "../components/Icons";

/**
 * Icon lookup for the feature grid. Keys must match `site.features[].icon`.
 * Kept out of Icons.tsx so that file exports components only (fast-refresh).
 */
export const featureIcons = {
  gateway: IconGateway,
  agents: IconAgents,
  search: IconSearch,
  evals: IconEvals,
  trace: IconTrace,
  shield: IconShield,
} as const;

export type FeatureIconName = keyof typeof featureIcons;
