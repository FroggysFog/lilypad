/**
 * LilyPad ERP - Global Search Topbar Wiring
 * The topbar's search box is identical, duplicated boilerplate across
 * every page - this finds it and makes Enter (or clicking the search
 * icon) navigate to search-results.html, which does the actual
 * fetching/rendering. Nothing else lives here on purpose: no dropdown,
 * no fetch - keeping this script trivial means it's safe to load on
 * every page, including pages that will never be the results page.
 */
(function () {
  'use strict'

  function injectGlobalSearch () {
    const header = document.querySelector('header.navbar-header')
    if (!header) return
    const input = header.querySelector('.header-search input')
    if (!input) return

    function go () {
      const q = input.value.trim()
      if (!q) return
      window.location.href = 'search-results.html?q=' + encodeURIComponent(q)
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go()
    })

    const icon = header.querySelector('.header-search .input-icon-addon')
    if (icon) {
      icon.style.cursor = 'pointer'
      icon.addEventListener('click', go)
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectGlobalSearch)
    } else {
      injectGlobalSearch()
    }
  }
})()
