<script setup lang="ts">
import Chart from 'primevue/chart'
import { computed } from 'vue'

const { dataOptions } = defineProps<{
  dataOptions: {
    type: string
    title?: string
    dataset: number[][]
    dataLabels: string[]
    yAxisLabels: string[]
    unit?: string
  }
}>()

const data = computed(() => {
  return {
    labels: dataOptions.yAxisLabels,
    datasets: dataOptions.dataset.map((d, index) => ({
      label: dataOptions.dataLabels[index],
      data: d,
      tension: 0.4,
    })),
  }
})

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: !!dataOptions.title,
      text: dataOptions.title,
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: number) =>
          dataOptions.unit ? `${value} ${dataOptions.unit}` : value,
      },
    },
  },
}
</script>
<template>
  <Chart :type="dataOptions.type" :data :options />
</template>
