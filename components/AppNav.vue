<template>
  <header class="sticky top-0 z-50 bg-stone-950 text-white shadow-md">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <NuxtLink
          to="/"
          class="font-serif text-xl font-semibold tracking-tight hover:text-stone-300 transition-colors"
        >
          News Hub
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink
            v-for="section in sections"
            :key="section.slug"
            :to="`/?section=${section.slug}`"
            class="text-sm font-medium tracking-wide text-stone-400 hover:text-white transition-colors uppercase"
            active-class="text-white"
          >
            {{ section.label }}
          </NuxtLink>
        </nav>

        <!-- Desktop: Options dropdown -->
        <div ref="dropdownRef" class="relative hidden md:block">
          <button
            class="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors p-1"
            :class="{ 'text-white': open }"
            @click="open = !open"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h10M4 18h7"
              />
            </svg>
            <svg
              class="w-3 h-3 transition-transform"
              :class="open ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            v-if="open"
            class="absolute right-0 top-full mt-2 w-72 bg-stone-900 border border-stone-700 rounded-md shadow-xl py-1"
          >
            <div class="px-3 pt-2 pb-3 border-b border-stone-700">
              <form @submit.prevent="submitSearch">
                <div class="flex gap-2">
                  <input
                    v-model="searchInput"
                    type="search"
                    placeholder="Search…"
                    class="flex-1 px-3 py-1.5 rounded bg-stone-800 border border-stone-600 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    class="px-3 py-1.5 rounded bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
            <div class="flex items-center justify-between px-4 py-3 border-b border-stone-700">
              <span class="text-sm text-stone-300">Hide Videos</span>
              <ToggleSwitch v-model="hideVideos" />
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-stone-300">Curated View</span>
              <ToggleSwitch v-model="curatedView" />
            </div>
          </div>
        </div>

        <!-- Mobile: hamburger -->
        <button
          class="md:hidden text-stone-400 hover:text-white p-1"
          @click="mobileOpen = !mobileOpen"
        >
          <svg
            v-if="!mobileOpen"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Section indicator bar -->
    <div v-if="activeSection && !mobileOpen" class="bg-brand-600 px-4 py-1.5">
      <div class="max-w-6xl mx-auto">
        <span class="text-xs font-semibold uppercase tracking-widest text-white/90">{{
          activeSection
        }}</span>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="md:hidden border-t border-stone-800 bg-stone-950">
      <!-- Sections -->
      <nav class="px-4 py-3 border-b border-stone-800 flex flex-col gap-1">
        <NuxtLink
          v-for="section in sections"
          :key="section.slug"
          :to="`/?section=${section.slug}`"
          class="text-sm font-medium tracking-wide text-stone-400 hover:text-white transition-colors uppercase py-2"
        >
          {{ section.label }}
        </NuxtLink>
      </nav>

      <!-- Search -->
      <div class="px-4 py-3 border-b border-stone-800">
        <form @submit.prevent="submitSearch">
          <div class="flex gap-2">
            <input
              v-model="searchInput"
              type="search"
              placeholder="Search…"
              class="flex-1 px-3 py-2 rounded bg-stone-800 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-transparent"
            />
            <button
              type="submit"
              class="px-4 py-2 rounded bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors"
            >
              Go
            </button>
          </div>
        </form>
      </div>

      <!-- Toggles -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <span class="text-sm text-stone-300">Hide Videos</span>
        <ToggleSwitch v-model="hideVideos" />
      </div>
      <div class="flex items-center justify-between px-4 py-3">
        <span class="text-sm text-stone-300">Curated View</span>
        <ToggleSwitch v-model="curatedView" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { hideVideos, curatedView } = usePreferences()

const open = ref(false)
const mobileOpen = ref(false)
const searchInput = ref('')
const dropdownRef = ref<HTMLElement | null>(null)

const activeSection = computed(() => {
  const s = route.query.section as string | undefined
  return s ? sections.find((x) => x.slug === s)?.label : null
})

function submitSearch() {
  const q = searchInput.value.trim()
  if (!q) return
  open.value = false
  mobileOpen.value = false
  searchInput.value = ''
  router.push({ path: '/search', query: { q } })
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

watch(
  () => route.fullPath,
  () => {
    open.value = false
    mobileOpen.value = false
  }
)
</script>
