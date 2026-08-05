<script setup lang="ts">
import { Switch } from 'antdv-next'

const checked = defineModel<boolean>({ required: true })

defineProps<{
  label: string
  disabled?: boolean
}>()
</script>

<template>
  <span class="toolbar-switch" :class="{ 'is-on': checked, 'is-disabled': disabled }">
    <!-- 文字也可点:开关本体只有 28px 宽,点中文字比点开关容易得多 -->
    <span class="toolbar-switch-label" @click="disabled || (checked = !checked)">{{ label }}</span>
    <Switch v-model:checked="checked" :disabled="disabled" size="small" />
  </span>
</template>

<style scoped>
.toolbar-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--demo-chip-border);
  border-radius: 8px;
  background: var(--demo-card-bg);
  color: var(--demo-text-2);
  font-size: 13px;
  line-height: 1;
  user-select: none;
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
}

.toolbar-switch:hover {
  border-color: var(--demo-primary);
}

/* 打开态整个胶囊染成主色,一眼看清哪些开关是开着的 */
.toolbar-switch.is-on {
  border-color: var(--demo-primary);
  background: var(--demo-primary-soft);
  color: var(--demo-primary);
  font-weight: 500;
}

.toolbar-switch.is-disabled {
  opacity: 0.55;
}

.toolbar-switch.is-disabled:hover {
  border-color: var(--demo-chip-border);
}

.toolbar-switch-label {
  cursor: pointer;
}

.toolbar-switch.is-disabled .toolbar-switch-label {
  cursor: not-allowed;
}
</style>
