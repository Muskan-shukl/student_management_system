import { reactive } from 'vue'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: ((value: boolean) => void) | null
}

export const confirmState = reactive<ConfirmState>({ open: false, title: '', resolve: null })

/** Promise-based confirm dialog: `if (await confirm({ title })) …` */
export const useConfirm = () => (options: ConfirmOptions) =>
  new Promise<boolean>((resolve) => {
    Object.assign(confirmState, { confirmLabel: 'Confirm', cancelLabel: 'Cancel', tone: 'primary', description: '' }, options, {
      open: true,
      resolve,
    })
  })

export const settleConfirm = (value: boolean) => {
  confirmState.resolve?.(value)
  confirmState.open = false
  confirmState.resolve = null
}
