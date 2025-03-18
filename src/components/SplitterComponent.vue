<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const minPercentage: number = 25
const maxPercentage: number = 75

const topPercentage = ref<number>(30)
const isDragging = ref<boolean>(false)
const containerHeight = ref<number>(0)

const startDrag = (event: MouseEvent | TouchEvent): void => {
  isDragging.value = true
  document.body.style.userSelect = 'none'

  containerHeight.value =
    (event.target as HTMLElement).parentElement?.clientHeight || 0

  if (event instanceof MouseEvent) {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  } else if (event instanceof TouchEvent) {
    document.addEventListener('touchmove', onDrag, { passive: false })
    document.addEventListener('touchend', stopDrag)
  }
}

const onDrag = (event: MouseEvent | TouchEvent): void => {
  if (!isDragging.value) return

  const clientY =
    event instanceof MouseEvent ? event.clientY : event.touches[0].clientY
  const newHeight = (clientY / containerHeight.value) * 100

  // Enforce minimum and maximum percentage constraints
  if (newHeight >= minPercentage && newHeight <= maxPercentage) {
    topPercentage.value = newHeight
  }

  event.preventDefault()
}

const stopDrag = (): void => {
  isDragging.value = false
  document.body.style.userSelect = ''

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

onMounted(() => {
  // Ensure container height is set on mount
  containerHeight.value =
    document.querySelector('.splitter-container')?.clientHeight || 0
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<template>
  <div class="splitter-container">
    <!-- Top Pane -->
    <section class="panel map-panel" :style="{ height: topPercentage + '%' }">
      <slot name="top"></slot>
    </section>

    <!-- Resizable Divider -->
    <article class="splitter" @mousedown="startDrag" @touchstart="startDrag" />

    <!-- Bottom Pane -->
    <section
      class="panel main-panel"
      :style="{ height: 100 - topPercentage + '%' }"
    >
      <slot name="bottom"></slot>
    </section>
  </div>
</template>

<style scoped>
.splitter-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;

  /* screen bigger than 55rem */
  @media (min-width: 55rem) {
    flex-direction: row-reverse;
  }
}

.panel {
  /* screen bigger than 55rem */
  @media (min-width: 55rem) {
    &.map-panel {
      height: 100% !important;
      flex: auto 1 1;
    }
    &.main-panel {
      height: 100% !important;
      width: 45rem;
    }
  }
}

.splitter {
  height: var(--small-spacing);
  cursor: n-resize; /* Change cursor for vertical resizing */
  background: var(--color-gray);
  position: relative;
  transition: background var(--default-transition);
  @media (min-width: 55rem) {
    display: none;
  }
}
.splitter::before {
  content: '';
  position: absolute;
  top: -10px; /* Expands the touchable area */
  bottom: -10px;
  left: 0;
  right: 0;
}
</style>
