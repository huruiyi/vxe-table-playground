<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Card, Tag, Button, TypographyTitle, TypographyParagraph } from 'antdv-next'
import { RightOutlined } from '@antdv-next/icons'
import { demoIntros } from '@/data/demos'

const router = useRouter()

function goto(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="overview">
    <div class="overview-hero">
      <TypographyTitle :level="3" style="margin-bottom: 4px">vxe-table v4 功能演示</TypographyTitle>
      <TypographyParagraph type="secondary" style="margin-bottom: 0">
        Vite + Vue 3 + antdv-next + vxe-table,后端 Express + Prisma + MySQL 提供真实数据。点击卡片进入对应演示页。
      </TypographyParagraph>
    </div>
    <div class="overview-grid">
      <Card
        v-for="demo in demoIntros"
        :key="demo.path"
        hoverable
        class="overview-card"
        @click="goto(demo.path)"
      >
        <div class="card-head">
          <span class="card-icon"><component :is="demo.icon" /></span>
          <span class="card-title">{{ demo.title }}</span>
        </div>
        <div class="card-desc">{{ demo.desc }}</div>
        <div class="card-foot">
          <span class="card-tags">
            <Tag v-for="f in demo.features" :key="f" :bordered="false" color="blue">{{ f }}</Tag>
          </span>
          <Button type="link" size="small" @click.stop="goto(demo.path)">
            查看演示
            <RightOutlined />
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.overview-hero {
  padding: 8px 4px 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.overview-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.overview-card :deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #e6f4ff;
  color: #1677ff;
  font-size: 18px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.card-desc {
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
  line-height: 1.7;
  flex: 1;
  margin-bottom: 12px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
}
</style>
