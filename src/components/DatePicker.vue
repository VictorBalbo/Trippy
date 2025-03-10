<script setup lang="ts">
import { useId, useTemplateRef, type Ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import { ButtonComponent, FloatLabel } from '.'

const model = defineModel<Date | null>()
let initialValue = model.value
defineProps<{
  label?: string
  minDate?: Date
  maxDate?: Date
}>()
const emit = defineEmits(['change'])
const id = useId()
const datePicker = useTemplateRef('datePicker') as Ref

const onClear = () => {
  model.value = null
}
const onOk = () => {
  if (model.value !== initialValue) {
    emit('change')
    initialValue = model.value
  }
  if (datePicker.value) {
    datePicker.value.overlayVisible = false
  }
}
</script>
<template>
  <FloatLabel variant="in">
    <DatePicker
      ref="datePicker"
      v-model="model"
      dateFormat="DD, dd/mm/yy -"
      :minDate="minDate"
      :maxDate="maxDate"
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
