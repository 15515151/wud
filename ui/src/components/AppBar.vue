<template>
  <v-app-bar app flat density="compact" color="surface" class="border-b">
    <div class="d-flex align-center px-4 w-100">
      <v-toolbar-title
        v-if="viewName && 'home'.toLowerCase() !== viewName.toLowerCase()"
        class="text-subtitle-1 font-weight-bold text-capitalize ma-0 text-high-emphasis"
      >
        {{ viewTitle }}
      </v-toolbar-title>
      <v-spacer />
      <ConnectionStatusPill class="mr-4" />
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import ConnectionStatusPill from "./ConnectionStatusPill.vue";

export default defineComponent({
  components: {
    ConnectionStatusPill
  },
  props: {
    user: {
      type: Object,
      default: undefined,
    },
  },
  setup() {
    const route = useRoute();
    const { t } = useI18n();

    const viewName = computed(() => {
      return route ? (route.name as string) : "";
    });

    /**
     * Localized title of the current view. Unknown route names fall back to
     * the raw route name so custom/plugin routes are never rendered blank.
     */
    const viewTitle = computed(() => {
      const name = viewName.value;
      if (!name) {
        return "";
      }
      const key = `nav.${name}`;
      return t(key) === key ? name : t(key);
    });

    return {
      viewName,
      viewTitle,
      t,
    };
  },
});
</script>
