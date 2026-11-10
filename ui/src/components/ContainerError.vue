<template>
  <v-list density="compact">
    <v-list-item>
      <template v-slot:prepend>
        <v-icon color="secondary">mdi-tag</v-icon>
      </template>
      <v-list-item-title>{{ t('detail.errorTitle') }}</v-list-item-title>
      <v-list-item-subtitle>
        {{ error.message }}
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return { t };
  },
  props: {
    error: {
      type: Object,
    },
  },
});
</script>
