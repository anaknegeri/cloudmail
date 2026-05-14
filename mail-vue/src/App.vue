<template>
  <el-config-provider :locale="null">
    <router-view />
  </el-config-provider>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import {useSettingStore} from "@/store/setting.js";
const settingStore = useSettingStore()
import('@/icons/index.js')
const { locale } = useI18n()
locale.value = settingStore.lang || 'en'
</script>
