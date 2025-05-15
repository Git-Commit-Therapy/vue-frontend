<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  header: { key: string; label: string }[];
  data: Record<string, any>[];
  executeFunction?: (row: Record<string, any>) => void;
  buttonLabel?: string;
}>();

const { t } = useI18n();

const sortBy = ref<{ key: string; order: boolean }[]>([]);
const sortDesc = ref(false);

const headers = computed(() =>
  props.header.map((h) => ({
    text: t(h.label),
    value: h.key,
    sortable: true,
  })),
);
if (props.executeFunction) {
  headers.value.push({ text: "", value: "actions", sortable: false });
}
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="data"
    :sort-by.sync="sortBy"
    :sort-desc.sync="sortDesc"
    class="elevation-1"
    item-value="id"
  >
    <template v-slot:item.actions="{ item }" v-if="executeFunction">
      <v-btn color="primary" @click="() => executeFunction?.(item)">
        {{ buttonLabel }}
      </v-btn>
    </template>
  </v-data-table>
</template>
