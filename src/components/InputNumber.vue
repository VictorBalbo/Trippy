<script setup lang="ts">
import InputNumberComponent from 'primevue/inputnumber'
defineProps<{
  title?: string
  min?: number
  max?: number
  value: number
}>()
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <section variant="in" class="input-number">
    <InputNumberComponent
      showButtons
      buttonLayout="horizontal"
      inputId="nights"
      fluid
      :min="min"
      :max="max"
      :modelValue="value"
      @update:modelValue="value => emit('update:modelValue', value)"
    >
    </InputNumberComponent>
  </section>
</template>

<style>
:root {
  .input-number {
    --p-floatlabel-position-x: 3rem;
    --p-inputtext-border-color: none;
    --p-inputnumber-button-border-color: none;
    --p-inputtext-background: transparent;

    .p-inputnumber-horizontal .p-inputnumber-input {
      padding: var(--small-spacing) 0;
      border-radius: 2rem;
      text-align: center;
      box-shadow: 0 0px 4px var(--color-border);
      font-size: 0.875rem;
      width: 2.5rem;
      flex-grow: 0;
    }
    .p-inputnumber-horizontal .p-inputnumber-button {
      border-radius: 0.5rem;
    }
  }
}
</style>
