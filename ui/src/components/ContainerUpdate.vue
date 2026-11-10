<template>
  <div>
    <v-alert
      v-if="isCoolingDown"
      color="info"
      variant="tonal"
      density="compact"
      icon="mdi-timer-sand"
      class="mb-3"
    >
      <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 8px">
        <div>
          <div class="font-weight-medium">{{ t('update.inCoolDown') }}</div>
          <div class="text-caption">
            {{ coolingDownUntil
              ? t('update.coolDownUntil', { date: formatDateTime(coolingDownUntil) })
              : t('update.coolDownNoDate') }}
          </div>
        </div>
        <v-btn
          v-if="canWrite"
          color="primary"
          variant="flat"
          size="small"
          prepend-icon="mdi-lightning-bolt"
          @click="$emit('override-cooldown')"
        >
          {{ t('update.updateNow') }}
        </v-btn>
      </div>
    </v-alert>

    <v-alert
      v-if="isSnoozed || snoozedVersion"
      color="warning"
      variant="tonal"
      density="compact"
      icon="mdi-bell-sleep"
      class="mb-3"
    >
      <div class="font-weight-medium">{{ t('update.snoozed') }}</div>
      <div class="text-caption">
        {{ snoozedUntil
          ? t('update.snoozedUntil', { version: snoozedVersion, date: formatDateTime(snoozedUntil) })
          : t('update.snoozedIndefinitely', { version: snoozedVersion }) }}
      </div>
    </v-alert>

    <v-list density="compact" v-if="updateAvailable || isCoolingDown || isSnoozed || snoozedVersion">
      <v-list-item v-if="result.tag">
        <template v-slot:prepend>
          <v-icon color="secondary">mdi-tag</v-icon>
        </template>
        <v-list-item-title>
          {{ t('update.tag') }}
          <v-chip v-if="semver" size="x-small" variant="outlined" color="success" label
            >semver</v-chip
          >
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ result.tag }}
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn
                variant="text"
                size="small"
                icon
                v-bind="props"
                @click="copyToClipboard(t('update.tag'), result.tag)"
              >
                <v-icon size="small">mdi-clipboard</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">{{ t('common.copyToClipboard') }}</span>
          </v-tooltip>
        </v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="result.version">
        <template v-slot:prepend>
          <v-icon color="secondary">mdi-package-variant</v-icon>
        </template>
        <v-list-item-title>{{ t('update.version') }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ result.version }}
        </v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="result.created">
        <template v-slot:prepend>
          <v-icon color="secondary">mdi-calendar-clock</v-icon>
        </template>
        <v-list-item-title>{{ t('update.built') }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ $filters.dateTime(result.created) }}
        </v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="result.link">
        <template v-slot:prepend>
          <v-icon color="secondary">mdi-link</v-icon>
        </template>
        <v-list-item-title>{{ t('update.link') }}</v-list-item-title>
        <v-list-item-subtitle
          ><a :href="result.link" target="_blank">{{ result.link }}</a>
        </v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="result.digest">
        <template v-slot:prepend>
          <v-icon color="secondary">mdi-function-variant</v-icon>
        </template>
        <v-list-item-title>{{ t('update.digest') }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ result.digest }}
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn
                variant="text"
                size="small"
                icon
                v-bind="props"
                @click="copyToClipboard(t('update.digest'), result.digest)"
              >
                <v-icon size="small">mdi-clipboard</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">{{ t('common.copyToClipboard') }}</span>
          </v-tooltip>
        </v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="updateKind && updateKind.kind && updateKind.kind !== 'unknown'">
        <template v-slot:prepend>
          <v-icon v-if="updateKind.semverDiff === 'patch'" color="success"
            >mdi-information</v-icon
          >
          <v-icon v-else-if="updateKind.semverDiff === 'major'" color="error"
            >mdi-alert-decagram</v-icon
          >
          <v-icon
            v-else-if="updateKind.semverDiff === 'rebuild' || updateKind.semverDiff === 'same'"
            color="info"
            >mdi-refresh</v-icon
          >
          <v-icon v-else color="warning">mdi-alert</v-icon>
        </template>
        <v-list-item-title>{{ t('update.updateKindLabel') }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ updateKindFormatted }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <v-card-text v-else>{{ t('update.noUpdateAvailable') }}</v-card-text>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { copyToClipboard } from "@/services/clipboard";
import { intlLocale, currentLocale } from "@/i18n";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return { t };
  },
  emits: ["override-cooldown"],
  props: {
    canWrite: {
      type: Boolean,
      default: true,
    },
    semver: {
      type: Boolean,
    },
    result: {
      type: Object,
    },
    updateKind: {
      type: Object,
    },
    updateAvailable: {
      type: Boolean,
    },
    isCoolingDown: {
      type: Boolean,
      default: false,
    },
    coolingDownUntil: {
      type: Number,
      default: null,
    },
    isSnoozed: {
      type: Boolean,
      default: false,
    },
    snoozedVersion: {
      type: String,
      default: "",
    },
    snoozedUntil: {
      type: Number,
      default: null,
    },
  },
  computed: {
    updateKindFormatted() {
      let kind = this.t("common.unknown");
      if (this.updateKind) {
        kind = this.updateKind.kind;
      }
      if (this.updateKind?.semverDiff) {
        kind = this.updateKind.semverDiff;
      }
      // Translate known backend enum values, keep unknown ones as-is.
      const key = `status.${kind}`;
      const translated = this.t(key);
      return translated === key ? kind : translated;
    },
  },
  methods: {
    /**
     * Format a timestamp according to the current UI locale.
     * @param value epoch millis
     */
    formatDateTime(value: number | string): string {
      return new Date(value).toLocaleString(intlLocale(currentLocale()));
    },

    async copyToClipboard(kind: string, value: string) {
      const copied = await copyToClipboard(value);
      if (copied) {
        (this as any).$eventBus.emit(
          "notify",
          this.t("common.copiedToClipboard", { what: kind })
        );
      } else {
        (this as any).$eventBus.emit(
          "notify",
          this.t("common.copyFailed", { what: kind }),
          "warning"
        );
      }
    },
  },
});
</script>
