<script setup lang="ts">
const props = defineProps({
  header: {
    type: Array,
    required: true,
    // Example: [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }]
  },
  data: {
    type: Array,
    required: true,
  },
  executeFunction: {
    type: Function,
    required: false,
  },
  buttonLabel: {
    type: String,
    required: false,
  },
});

const { header, data, executeFunction, buttonLabel } = props;
const sortKey = ref("");
const sortOrder = ref(1);

const sortedData = computed(() => {
  if (!sortKey.value) return data;
  return [...data].sort((a, b) => {
    const aValue = a[sortKey.value];
    const bValue = b[sortKey.value];
    if (aValue < bValue) return -1 * sortOrder.value;
    if (aValue > bValue) return 1 * sortOrder.value;
    return 0;
  });
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value *= -1;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in header" :key="col.key" @click="sortBy(col.key)">
          {{ col.label }}
          <span v-if="sortKey === col.key">{{
            sortOrder === 1 ? "▲" : "▼"
          }}</span>
        </th>
        <th v-if="executeFunction"></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, index) in sortedData"
        :key="row.id"
        :class="{ 'alt-row': index % 2 === 1 }"
      >
        <td v-for="col in header" :key="col.key">{{ row[col.key] }}</td>
        <td v-if="executeFunction">
          <button @click="executeFunction(row)">
            {{ buttonLabel || "Execute" }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
  cursor: pointer;
}

.alt-row {
  background-color: #f9f9f9;
}
</style>
