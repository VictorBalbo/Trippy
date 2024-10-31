<template>
  <article class="card">
    <slot />
  </article>
</template>

<style scoped>
.card {
  background-color: var(--color-background);
  box-shadow: 0 1px 5px #0000001f;
  border-radius: var(--small-spacing);
  transition: var(--default-transition);
  overflow: hidden;
}
.card:hover {
  box-shadow: 0 1px 5px #0000004a;
}
</style>
