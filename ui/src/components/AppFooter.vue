<template>
  <v-footer app padless dark height="30px">
    <v-col cols="12" class="text-center text-caption pa-0">
      {{ year }} — WUD (version {{ version }})
    </v-col>
  </v-footer>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { getAppInfos } from "@/services/app";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return { t };
  },

  data() {
    return {
      version: "unknown",
      year: new Date().getFullYear(),
    };
  },

  async beforeMount() {
    try {
      const appInfos = await getAppInfos();
      this.version = appInfos.version || this.t("common.unknown");
    } catch (e: any) {
      (this as any).$eventBus.emit(
        "notify",
        this.t("app.errorVersion", { message: e.message }),
        "error",
      );
    }
  },
});
</script>
