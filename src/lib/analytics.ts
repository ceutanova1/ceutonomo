export type AnalyticsEvent =
  | "advisor_contact_started"
  | "scenario_exported";

type Gtag = (command: "event", eventName: AnalyticsEvent, parameters?: Record<string, string>) => void;

export const ANALYTICS_PREFERENCE_KEY = "ceutonomo-cookie-preference-v2";

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export const trackAnalyticsEvent = (eventName: AnalyticsEvent, parameters?: Record<string, string>) => {
  if (window.localStorage.getItem(ANALYTICS_PREFERENCE_KEY) !== "ANALYTICS") return;
  window.gtag?.("event", eventName, parameters);
};
