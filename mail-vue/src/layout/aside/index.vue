<template>
  <el-scrollbar class="scroll">
    <div class="aside-inner">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-mark"></div>
        <div class="brand-name">{{settingStore.settings.title}}</div>
      </div>

      <!-- Compose -->
      <button class="compose-btn-new" @click="openSend">
        <span class="compose-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
        Compose
      </button>

      <!-- Main Nav -->
      <div class="sidebar-section">Mail</div>
      <div
        v-for="item in mainNav"
        :key="item.route"
        class="nav-item-new"
        :class="{ active: route.meta.name === item.route }"
        @click="router.push({ name: item.route })"
      >
        <span class="nav-icon">
          <Icon :icon="item.icon" width="18" height="18" />
        </span>
        {{ item.label }}
        <span v-if="item.count !== null" class="nav-count">{{ item.count }}</span>
      </div>

      <!-- Labels -->
      <div class="sidebar-section">Labels</div>
      <div
        v-for="label in labels"
        :key="label.name"
        class="nav-item-new"
        :class="{ active: false }"
      >
        <span class="label-dot" :style="{ background: label.color }"></span>
        {{ label.name }}
        <span class="nav-count">{{ label.count }}</span>
      </div>

      <!-- Manage -->
      <template v-if="hasManage">
        <div class="sidebar-section">Manage</div>
        <div
          v-for="item in manageNav"
          :key="item.route"
          class="nav-item-new"
          :class="{ active: route.meta.name === item.route }"
          @click="router.push({ name: item.route })"
        >
          <span class="nav-icon">
            <Icon :icon="item.icon" width="18" height="18" />
          </span>
          {{ item.label }}
        </div>
      </template>

      <!-- Weather Card -->
      <div class="weather-card">
        <div class="weather-icon"></div>
        <div class="weather-meta">
          <div class="temp">{{ weatherTemp }}</div>
          <div class="label">Inbox feels light today</div>
        </div>
      </div>

      <!-- User -->
      <div class="user-chip" @click="toggleUserMenu">
        <Avatar :name="userStore.user?.name || 'User'" :size="32" :radius="10" />
        <div class="meta">
          <div class="name">{{ userStore.user?.name || 'User' }}</div>
          <div class="email">{{ userStore.user?.email || '' }}</div>
        </div>
        <Icon icon="mingcute:down-small-fill" width="16" />
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import { useSettingStore } from "@/store/setting.js";
import { useUserStore } from "@/store/user.js";
import { useUiStore } from "@/store/ui.js";
import { hasPerm } from "@/perm/perm.js";
import { computed, ref } from "vue";

const settingStore = useSettingStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const route = useRoute();

const weatherTemp = ref('14°');

const mainNav = [
  { route: 'email',    label: 'Inbox',   icon: 'hugeicons:mailbox-01',     count: null },
  { route: 'send',     label: 'Sent',    icon: 'cil:send',                  count: null },
  { route: 'draft',    label: 'Drafts', icon: 'ep:document',               count: null },
  { route: 'star',     label: 'Starred', icon: 'solar:star-line-duotone', count: null },
  { route: 'setting',  label: 'Settings', icon: 'fluent:settings-48-regular', count: null },
];

const labels = [
  { name: 'Work',     color: '#5E8FB8', count: 0 },
  { name: 'Personal', color: '#E8B89A', count: 0 },
  { name: 'Travel',   color: '#A8C0A4', count: 0 },
  { name: 'Finance',  color: '#B8A8C8', count: 0 },
];

const manageNav = [
  { route: 'user',         label: 'All Users',      icon: 'si:user-alt-2-line',        route2: 'user' },
  { route: 'role',         label: 'Permissions',   icon: 'fluent:lock-closed-16-regular', route2: 'role' },
  { route: 'all-email',    label: 'All Mail',       icon: 'fluent:mail-list-28-regular', route2: 'all-email' },
  { route: 'analysis',    label: 'Analytics',      icon: 'fluent:data-pie-20-regular', route2: 'analysis' },
  { route: 'reg-key',     label: 'Invite Code',    icon: 'fluent:fingerprint-20-filled', route2: 'reg-key' },
  { route: 'sys-setting', label: 'System Settings',icon: 'eos-icons:system-ok-outlined', route2: 'sys-setting' },
];

const hasManage = computed(() =>
  hasPerm('all-email:query') || hasPerm('user:query') || hasPerm('role:query') ||
  hasPerm('setting:query') || hasPerm('analysis:query') || hasPerm('reg-key:query')
);

function openSend() {
  uiStore.writerRef?.open?.();
}

function toggleUserMenu() {
  // toggle user dropdown if needed
}

// Avatar helper
const Avatar = {
  props: ['name', 'size', 'radius'],
  setup(props) {
    const COLORS = ['#5E8FB8','#D87856','#7AA078','#8A78B0','#B86A82','#D8A856','#78B0A8'];
    const initial = computed(() => (props.name?.[0] || '?').toUpperCase());
    const bg = computed(() => {
      let hash = 0;
      for (const c of (props.name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
      return COLORS[Math.abs(hash) % COLORS.length];
    });
    return { initial, bg };
  },
  template: `
    <div :style="{
      width: (size||32)+'px',
      height: (size||32)+'px',
      borderRadius: (radius||10)+'px',
      background: bg,
      display: 'grid',
      placeItems: 'center',
      fontWeight: 700,
      fontSize: ((size||32) * 0.38)+'px',
      color: 'white',
      flexShrink: 0
    }">{{ initial }}</div>
  `
};
</script>

<style lang="scss" scoped>
.aside-inner {
  padding: 8px 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 100%;
}

.scroll {
  height: 100%;
  :deep(.el-scrollbar__wrap) {
    background: transparent !important;
  }
}
</style>
