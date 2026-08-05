<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider, theme } from 'antdv-next'
import zhCN from 'antdv-next/locale/zh_CN'
import { useAppStore } from '@/stores/app'
import BasicLayout from '@/layouts/BasicLayout.vue'

const appStore = useAppStore()

const themeConfig = computed(() => ({
  algorithm: appStore.dark ? theme.darkAlgorithm : theme.defaultAlgorithm
}))
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="themeConfig">
    <BasicLayout />
  </ConfigProvider>
</template>
