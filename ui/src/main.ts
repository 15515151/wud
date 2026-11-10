import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";
import { createVuetify } from "./plugins/vuetify";
import router from "./router";
import { registerGlobalProperties } from "./filters";
import { useEventBus } from "./composables/useEventBus";
import { detectLocale } from "./i18n/detect";
import { i18n, setLocale } from "./i18n";
import "./registerServiceWorker";

// Suppress benign ResizeObserver loop errors that trigger webpack dev overlay
window.addEventListener("error", (e) => {
  if (e.message && (e.message.includes("ResizeObserver") || e.message.includes("undelivered notifications"))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Resolve the initial locale (stored preference > browser language > default)
// before the app is mounted to avoid a flash of untranslated content.
setLocale(detectLocale());

const app = createApp(App);

// Register global properties (replacing filters)
registerGlobalProperties(app);

// Global event bus
const eventBus = useEventBus();
app.config.globalProperties.$eventBus = eventBus;
app.provide("eventBus", eventBus);

// Use plugins
app.use(i18n);
app.use(createVuetify(i18n));
app.use(router);

app.mount("#app");
