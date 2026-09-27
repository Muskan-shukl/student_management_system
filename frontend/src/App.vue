<script setup lang="ts">
import AppToaster from '@/ui/AppToaster.vue'
import AppConfirm from '@/ui/AppConfirm.vue'
</script>

<template>
  <RouterView />
  <AppToaster />
  <AppConfirm />
</template>
