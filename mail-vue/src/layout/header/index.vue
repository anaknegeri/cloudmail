<template>
  <div class="header-new">
    <!-- Left: hamburger + breadcrumb -->
    <div class="header-left">
      <div class="hamburger" @click="changeAside">
        <Icon icon="mingcute:menu-fill" width="18" height="18" />
      </div>
      <span class="breadcrumb-item">{{ $t(route.meta.title) }}</span>
    </div>

    <!-- Right: icons + user -->
    <div class="header-right">
      <!-- Theme toggle -->
      <button
        class="icon-btn"
        :title="uiStore.dark ? 'Switch to light' : 'Switch to dark'"
        @click="openDark($event)"
      >
        <Icon v-if="uiStore.dark" icon="mingcute:sun-fill" width="18" height="18" />
        <Icon v-else icon="solar:moon-linear" width="18" height="18" />
      </button>

      <!-- Notice -->
      <button class="icon-btn" title="Notice" @click="openNotice">
        <Icon icon="streamline-plump:announcement-megaphone" width="18" height="18" />
      </button>

      <!-- Compose -->
      <div v-perm="'email:send'" class="compose-btn-header" @click="openSend" title="Compose">
        <Icon icon="material-symbols:edit-outline-sharp" width="16" height="16" />
      </div>

      <!-- User dropdown -->
      <el-dropdown ref="userinfoRef" @visible-change="e => userInfoShow = e" :teleported="false" popper-class="detail-dropdown">
        <div class="avatar-chip">
          <div class="avatar-initial">{{ formatName(userStore.user?.email) }}</div>
          <div class="avatar-meta">
            <div class="avatar-name">{{ userStore.user?.name || 'User' }}</div>
            <div class="avatar-email">{{ userStore.user?.email || '' }}</div>
          </div>
          <Icon icon="mingcute:down-small-fill" width="14" />
        </div>
        <template #dropdown>
          <div class="user-details">
            <div class="details-avatar">{{ formatName(userStore.user?.email) }}</div>
            <div class="user-name">{{ userStore.user?.name }}</div>
            <div class="detail-email" @click="copyEmail(userStore.user.email)">
              {{ userStore.user?.email }}
            </div>
            <div class="detail-user-type">
              <el-tag>{{ userStore.user?.role?.name }}</el-tag>
            </div>
            <div class="action-info">
              <div>
                <span style="margin-right: 10px">{{ $t('sendCount') }}</span>
                <span style="margin-right: 10px">{{ $t('accountCount') }}</span>
              </div>
              <div>
                <div>
                  <span v-if="sendCount" style="margin-right: 5px">{{ sendCount }}</span>
                  <el-tag v-if="!hasPerm('email:send')">{{ sendType }}</el-tag>
                  <el-tag v-else>{{ sendType }}</el-tag>
                </div>
                <div>
                  <el-tag v-if="settingStore.settings.manyEmail || settingStore.settings.addEmail">
                    {{ $t('disabled') }}
                  </el-tag>
                  <span v-else-if="accountCount && hasPerm('account:add')"
                        style="margin-right: 5px">{{ $t('totalUserAccount', {msg: accountCount}) }}</span>
                  <el-tag v-else-if="!accountCount && hasPerm('account:add')">{{ $t('unlimited') }}</el-tag>
                  <el-tag v-else-if="!hasPerm('account:add')">{{ $t('unauthorized') }}</el-tag>
                </div>
              </div>
            </div>
            <div class="logout">
              <el-button type="primary" :loading="logoutLoading" @click="clickLogout">
                {{ $t('logOut') }}
              </el-button>
            </div>
          </div>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import { Icon } from "@iconify/vue";
import { useUiStore } from "@/store/ui.js";
import { useUserStore } from "@/store/user.js";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import { useSettingStore } from "@/store/setting.js";
import { hasPerm } from "@/perm/perm.js";
import { useI18n } from "vue-i18n";
import { setExtend } from "@/utils/day.js";
import { logout } from "@/request/login.js";

const { t } = useI18n();
const route = useRoute();
const settingStore = useSettingStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const logoutLoading = ref(false);
const userInfoShow = ref(false);
const userinfoRef = ref({});

const accountCount = computed(() => userStore.user?.role?.accountCount);

const sendType = computed(() => {
  if (settingStore.settings.send === 1) return t('disabled');
  if (!hasPerm('email:send')) return t('unauthorized');
  if (userStore.user?.role?.sendType === 'ban') return t('sendBanned');
  if (userStore.user?.role?.sendType === 'internal') return t('sendInternal');
  if (!userStore.user?.role?.sendCount) return t('unlimited');
  if (userStore.user?.role?.sendType === 'day') return t('daily');
  if (userStore.user?.role?.sendType === 'count') return t('total');
});

const sendCount = computed(() => {
  if (!hasPerm('email:send')) return null;
  if (userStore.user?.role?.sendType === 'ban' || userStore.user?.role?.sendType === 'internal') return null;
  if (!userStore.user?.role?.sendCount) return null;
  if (settingStore.settings.send === 1) return null;
  return `${userStore.user?.sendCount || 0}/${userStore.user?.role?.sendCount}`;
});

function userInfoHide() {
  if (userInfoShow.value) {
    userinfoRef.value.handleClose();
  } else {
    userinfoRef.value.handleOpen();
  }
}

async function copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    ElMessage({ message: t('copySuccessMsg'), type: 'success', plain: true });
  } catch (err) {
    ElMessage({ message: t('copyFailMsg'), type: 'error', plain: true });
  }
}

function openNotice() { uiStore.showNotice(); }

function openDark(e) {
  const nextIsDark = !uiStore.dark;
  const root = document.documentElement;
  if (!document.startViewTransition) {
    switchDark(nextIsDark, root);
    return;
  }
  const x = e.clientX, y = e.clientY;
  const maxX = Math.max(x, window.innerWidth - x);
  const maxY = Math.max(y, window.innerHeight - y);
  const endRadius = Math.hypot(maxX, maxY);
  root.setAttribute('data-theme-to', nextIsDark ? 'dark' : 'light');
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-end-radius', `${endRadius + 10}px`);
  document.startViewTransition(() => { switchDark(nextIsDark, root); }).finished.finally(() => {
    root.removeAttribute('data-theme-to');
  });
}

function switchDark(nextIsDark, root) {
  root.setAttribute('class', nextIsDark ? 'dark' : '');
  const isMobile = !window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  document.getElementById('theme-color-meta')?.setAttribute(
    'content', nextIsDark ? (isMobile ? '#141414' : '#000000') : (isMobile ? '#FFFFFF' : '#F1F1F1')
  );
  uiStore.dark = nextIsDark;
}

function openSend() { uiStore.writerRef?.open?.(); }
function changeAside() { uiStore.asideShow = !uiStore.asideShow; }

function clickLogout() {
  logoutLoading.value = true;
  logout().then(() => {
    localStorage.removeItem("token");
    router.replace('/login');
  }).finally(() => { logoutLoading.value = false; });
}

function formatName(email) { return (email?.[0] || '?').toUpperCase(); }
</script>

<style lang="scss" scoped>
.header-new {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background: var(--bg);
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--ink-2);
  transition: background 0.15s;
  &:hover { background: var(--surface-3); }
}

.breadcrumb-item {
  font-weight: 600;
  font-size: 14px;
  color: var(--ink);
  white-space: nowrap;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.compose-btn-header {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--ink);
  color: var(--surface);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { box-shadow: var(--shadow-2); transform: translateY(-1px); }
}

.avatar-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: var(--surface-3); }
}

.avatar-initial {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
}

.avatar-meta { text-align: left; }

.avatar-name {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--ink);
  white-space: nowrap;
}

.avatar-email {
  font-size: 11px;
  color: var(--ink-3);
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style>
.detail-dropdown {
  color: var(--el-text-color-primary) !important;
}

.user-details {
  width: 250px;
  font-size: 14px;
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
}

.user-details .user-name {
  font-weight: bold;
  margin-top: 10px;
  padding: 0 20px;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
}

.user-details .detail-user-type { margin-top: 10px; }

.user-details .action-info {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  margin-top: 10px;
}

.user-details .action-info > div:first-child {
  display: grid;
  align-items: center;
  gap: 10px;
}

.user-details .action-info > div:last-child {
  display: grid;
  gap: 10px;
  text-align: center;
}

.user-details .action-info > div:last-child > div {
  display: flex;
  align-items: center;
}

.user-details .detail-email {
  padding: 0 20px;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  color: var(--el-text-color-regular);
  cursor: pointer;
}

.user-details .logout {
  margin-top: 20px;
  width: 100%;
  padding: 0 10px 10px;
}

.user-details .logout .el-button {
  border-radius: 6px;
  height: 28px;
  width: 100%;
}

.user-details .details-avatar {
  margin-top: 20px;
  height: 40px;
  width: 40px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid var(--dark-border);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}
</style>