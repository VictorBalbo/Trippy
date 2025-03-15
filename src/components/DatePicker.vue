<script setup lang="ts">
import { computed, useId, useTemplateRef, type Ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import { ButtonComponent, FloatLabel } from '.'

import dayjs from 'dayjs'

const model = defineModel<Date>()
let initialValue = model.value
const utcModel = computed({
  get: () => toUtc(model.value),
  set: (newValue?: Date) => {
    model.value = fromUtc(newValue)
  },
})

defineProps<{
  label?: string
  minDate?: Date
  maxDate?: Date
}>()
const emit = defineEmits(['change'])
const id = useId()
const datePicker = useTemplateRef('datePicker') as Ref

const onClear = () => {
  utcModel.value = undefined
}
const onOk = () => {
  if (utcModel.value !== initialValue) {
    emit('change')
    initialValue = utcModel.value
  }
  if (datePicker.value) {
    datePicker.value.overlayVisible = false
  }
}

const toUtc = (date?: Date) =>
  date
    ? dayjs(date).subtract(dayjs(date).utcOffset(), 'minute').toDate()
    : undefined
const fromUtc = (date?: Date) =>
  date ? dayjs(date).add(dayjs(date).utcOffset(), 'minute').toDate() : undefined
</script>
<template>
  <FloatLabel variant="in">
    <DatePicker
      ref="datePicker"
      v-model="utcModel"
      dateFormat="DD, dd/mm/yy -"
      :minDate="toUtc(minDate)"
      :maxDate="toUtc(maxDate)"
      showTime
      fluid
      showIcon
      :id="id"
      @hide="onOk"
    >
      <template #footer>
        <section class="footer">
          <ButtonComponent
            label="Clear"
            severity="secondary"
            @click="onClear"
          />
          <ButtonComponent
            label="Ok"
            severity="secondary"
            class="text"
            @click="onOk"
          />
        </section>
      </template>
    </DatePicker>
    <label :for="id">{{ label ?? 'Date' }}</label>
  </FloatLabel>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
:root {
  ::v-deep() {
    --p-button-secondary-background: none;
    --p-button-secondary-border-color: none;
    --p-button-secondary-hover-border-color: none;
  }
}
</style>
