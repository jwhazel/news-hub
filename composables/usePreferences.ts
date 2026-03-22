let watchersSetup = false

export const usePreferences = () => {
  const hideVideos = useState<boolean>('pref:hideVideos', () =>
    import.meta.client ? localStorage.getItem('pref:hideVideos') === 'true' : false
  )
  const curatedView = useState<boolean>('pref:curatedView', () =>
    import.meta.client ? localStorage.getItem('pref:curatedView') === 'true' : false
  )

  if (import.meta.client && !watchersSetup) {
    watchersSetup = true
    watch(hideVideos, (val) => localStorage.setItem('pref:hideVideos', String(val)))
    watch(curatedView, (val) => localStorage.setItem('pref:curatedView', String(val)))
  }

  return { hideVideos, curatedView }
}
