<script setup lang="ts">
import { useId } from 'vue'
import InputNumberComponent from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Select from 'primevue/select'
import FloatLabel from 'primevue/floatlabel'

const currencies = ['BRL', 'EUR', 'CHF', 'USD']

const price = defineModel<number>('price')
let initialPrice = price.value
const currency = defineModel<string>('currency')
let initialCurrency: string | undefined = currency.value

defineProps<{
  priceLabel?: string
  currenctyLabel?: string
}>()
const emit = defineEmits(['change'])
const id = useId()

const onChange = () => {
  if (price.value !== initialPrice || currency.value !== initialCurrency) {
    emit('change')
    initialPrice = price.value
    initialCurrency = currency.value
  }
}
</script>
<template>
  <InputGroup>
    <InputGroupAddon class="currency">
      <FloatLabel variant="in">
        <Select v-model="currency" :options="currencies" @change="onChange" />
        <label :for="id">{{ currenctyLabel ?? 'Currency' }}</label>
      </FloatLabel>
    </InputGroupAddon>
    <FloatLabel variant="in">
      <InputNumberComponent
        v-model="price"
        :min="0"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :currency="currency ?? currencies[0]"
        mode="currency"
        fluid
        @update:modelValue="onChange"
      />
      <label :for="id">{{ priceLabel ?? 'Price' }}</label>
    </FloatLabel>
  </InputGroup>
</template>

<style scoped>
.currency {
  min-width: 6rem;
}
:root {
  ::v-deep() {
    --p-select-border-color: none;
    --p-inputgroup-addon-padding: 0;
  }
}
</style>
