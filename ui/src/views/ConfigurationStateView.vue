<template>
  <v-container fluid>
    <v-row>
      <v-col :cols="12" class="pt-2 pb-2">
        <configuration-item :item="configurationItem" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import ConfigurationItem from "@/components/ConfigurationItem.vue";
import { getStore } from "@/services/store";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return { t };
  },
  components: {
    ConfigurationItem,
  },
  data() {
    return {
      state: {} as any,
    };
  },
  computed: {
    configurationItem() {
      return {
        name: this.t("configuration.sections.store"),
        icon: "mdi-content-save",
        configuration: this.state.configuration,
      };
    },
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const state = await getStore();
      next((vm: any) => (vm.state = state));
    } catch (e: any) {
      next((vm: any) => {
        vm.$eventBus.emit(
          "notify",
          vm.t("configuration.errors.state", { message: e.message }),
          "error",
        );
      });
    }
  },
});
</script>
