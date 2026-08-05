<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider, theme } from 'antdv-next'
import zhCN from 'antdv-next/locale/zh_CN'
import { useAppStore } from '@/stores/app'
import BasicLayout from '@/layouts/BasicLayout.vue'

const appStore = useAppStore()

const themeConfig = computed(() => ({
  algorithm: appStore.dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    colorBgLayout: appStore.dark ? '#0d0d0f' : '#f4f6fa',
    // antd 组件的字体由 token 决定,不跟随 body,得在这里同步一份
    fontFamily: appStore.fontStack
  }
}))
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="themeConfig">
    <BasicLayout />
  </ConfigProvider>
</template>
