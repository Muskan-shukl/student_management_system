<script setup lang="ts">
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'
import { confirmState, settleConfirm } from '@/core/composables/useConfirm'
</script>

<template>
  <AppModal :open="confirmState.open" :title="confirmState.title" :description="confirmState.description" size="sm" @close="settleConfirm(false)">
    <template #footer>
      <AppButton variant="secondary" @click="settleConfirm(false)">{{ confirmState.cancelLabel }}</AppButton>
      <AppButton :variant="confirmState.tone === 'danger' ? 'danger' : 'primary'" @click="settleConfirm(true)">{{ confirmState.confirmLabel }}</AppButton>
    </template>
  </AppModal>
</template>
