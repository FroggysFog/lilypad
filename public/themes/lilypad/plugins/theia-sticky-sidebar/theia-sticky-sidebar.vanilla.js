/*!
 * Theia Sticky Sidebar v1.7.0 (vanilla JS port, no jQuery dependency)
 * Original: https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues sidebars, making them permanently visible while scrolling.
 * Ported to preserve identical positioning behavior without jQuery.
 */

(function (window) {
    function TheiaStickySidebar(sidebar, options) {
        const defaults = {
            containerSelector: '',
            additionalMarginTop: 0,
            additionalMarginBottom: 0,
            updateSidebarHeight: true,
            minWidth: 0,
            disableOnResponsiveLayouts: true,
            sidebarBehavior: 'modern',
            defaultPosition: 'relative',
            namespace: 'TSS'
        };
        options = Object.assign({}, defaults, options || {});
        options.additionalMarginTop = parseInt(options.additionalMarginTop) || 0;
        options.additionalMarginBottom = parseInt(options.additionalMarginBottom) || 0;

        const self = this;
        this.options = options;
        this.sidebar = sidebar;
        this.initialized = false;
        this._scrollHandler = null;
        this._resizeHandler = null;

        tryInitOrHookIntoEvents();

        function tryInitOrHookIntoEvents() {
            const success = tryInit();
            if (!success) {
                self._scrollHandler = function () {
                    if (tryInit()) {
                        window.removeEventListener('scroll', self._scrollHandler);
                    }
                };
                self._resizeHandler = function () {
                    if (tryInit()) {
                        window.removeEventListener('resize', self._resizeHandler);
                    }
                };
                window.addEventListener('scroll', self._scrollHandler);
                window.addEventListener('resize', self._resizeHandler);
            }
        }

        function tryInit() {
            if (self.initialized) return true;
            if (document.body.getBoundingClientRect().width < options.minWidth) return false;
            init();
            return true;
        }

        function outerHeight(el, includeMargin) {
            const rect = el.getBoundingClientRect();
            if (!includeMargin) return rect.height;
            const style = window.getComputedStyle(el);
            return rect.height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        }

        function outerWidth(el, includeMargin) {
            const rect = el.getBoundingClientRect();
            if (!includeMargin) return rect.width;
            const style = window.getComputedStyle(el);
            return rect.width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        }

        function offsetTop(el) {
            return el.getBoundingClientRect().top + window.pageYOffset;
        }

        function offsetLeft(el) {
            return el.getBoundingClientRect().left + window.pageXOffset;
        }

        function getClearedHeight(el) {
            let height = el.getBoundingClientRect().height;
            Array.prototype.forEach.call(el.children, function (child) {
                height = Math.max(height, child.getBoundingClientRect().height);
            });
            return height;
        }

        function init() {
            self.initialized = true;

            const styleId = 'theia-sticky-sidebar-stylesheet-' + options.namespace;
            if (!document.getElementById(styleId)) {
                const styleEl = document.createElement('style');
                styleEl.id = styleId;
                styleEl.textContent = '.theiaStickySidebar:after {content: ""; display: table; clear: both;}';
                document.head.appendChild(styleEl);
            }

            const o = {};
            o.sidebar = sidebar;
            o.options = options;

            // Container
            o.container = options.containerSelector ? document.querySelector(options.containerSelector) : null;
            if (!o.container) o.container = sidebar.parentElement;

            // Fix for WebKit bug, apply to all ancestors
            let ancestor = sidebar.parentElement;
            while (ancestor) {
                ancestor.style.webkitTransform = 'none';
                ancestor = ancestor.parentElement;
            }

            sidebar.style.position = options.defaultPosition;
            sidebar.style.overflow = 'visible';
            sidebar.style.webkitBoxSizing = 'border-box';
            sidebar.style.MozBoxSizing = 'border-box';
            sidebar.style.boxSizing = 'border-box';

            // Get or create the sticky sidebar wrapper element
            o.stickySidebar = sidebar.querySelector('.theiaStickySidebar');
            if (!o.stickySidebar) {
                // Remove <script> tags so they don't re-run when moved
                const javaScriptMIMETypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
                Array.prototype.slice.call(sidebar.querySelectorAll('script')).forEach(function (script) {
                    if (script.type.length === 0 || javaScriptMIMETypes.test(script.type)) {
                        script.remove();
                    }
                });

                const wrap = document.createElement('div');
                wrap.className = 'theiaStickySidebar';
                while (sidebar.firstChild) {
                    wrap.appendChild(sidebar.firstChild);
                }
                sidebar.appendChild(wrap);
                o.stickySidebar = wrap;
            }

            const sidebarStyle = window.getComputedStyle(sidebar);
            o.marginBottom = parseInt(sidebarStyle.marginBottom) || 0;
            o.paddingTop = parseInt(sidebarStyle.paddingTop) || 0;
            o.paddingBottom = parseInt(sidebarStyle.paddingBottom) || 0;

            // Check for collapsible margins
            let collapsedTopHeight = offsetTop(o.stickySidebar);
            let collapsedBottomHeight = outerHeight(o.stickySidebar);
            o.stickySidebar.style.paddingTop = '1px';
            o.stickySidebar.style.paddingBottom = '1px';
            collapsedTopHeight -= offsetTop(o.stickySidebar);
            collapsedBottomHeight = outerHeight(o.stickySidebar) - collapsedBottomHeight - collapsedTopHeight;

            if (collapsedTopHeight === 0) {
                o.stickySidebar.style.paddingTop = '0px';
                o.stickySidebarPaddingTop = 0;
            } else {
                o.stickySidebarPaddingTop = 1;
            }

            if (collapsedBottomHeight === 0) {
                o.stickySidebar.style.paddingBottom = '0px';
                o.stickySidebarPaddingBottom = 0;
            } else {
                o.stickySidebarPaddingBottom = 1;
            }

            o.previousScrollTop = null;
            o.fixedScrollTop = 0;

            resetSidebar(o);

            o.onScroll = function (o) {
                if (window.getComputedStyle(o.stickySidebar).display === 'none') return;

                if (document.body.getBoundingClientRect().width < o.options.minWidth) {
                    resetSidebar(o);
                    return;
                }

                if (o.options.disableOnResponsiveLayouts) {
                    const floatNone = window.getComputedStyle(o.sidebar).float === 'none';
                    const sidebarWidth = outerWidth(o.sidebar, floatNone);
                    if (sidebarWidth + 50 > o.container.getBoundingClientRect().width) {
                        resetSidebar(o);
                        return;
                    }
                }

                const scrollTop = window.pageYOffset;
                let position = 'static';

                if (scrollTop >= offsetTop(o.sidebar) + (o.paddingTop - o.options.additionalMarginTop)) {
                    const offTop = o.paddingTop + o.options.additionalMarginTop;
                    const offBottom = o.paddingBottom + o.marginBottom + o.options.additionalMarginBottom;

                    const containerTop = offsetTop(o.sidebar);
                    const containerBottom = offsetTop(o.sidebar) + getClearedHeight(o.container);

                    const windowOffsetTop = 0 + o.options.additionalMarginTop;
                    let windowOffsetBottom;

                    const sidebarSmallerThanWindow = (outerHeight(o.stickySidebar) + offTop + offBottom) < window.innerHeight;
                    if (sidebarSmallerThanWindow) {
                        windowOffsetBottom = windowOffsetTop + outerHeight(o.stickySidebar);
                    } else {
                        windowOffsetBottom = window.innerHeight - o.marginBottom - o.paddingBottom - o.options.additionalMarginBottom;
                    }

                    const staticLimitTop = containerTop - scrollTop + o.paddingTop;
                    const staticLimitBottom = containerBottom - scrollTop - o.paddingBottom - o.marginBottom;

                    let top = offsetTop(o.stickySidebar) - scrollTop;
                    const scrollTopDiff = o.previousScrollTop - scrollTop;

                    if (window.getComputedStyle(o.stickySidebar).position === 'fixed') {
                        if (o.options.sidebarBehavior === 'modern') {
                            top += scrollTopDiff;
                        }
                    }

                    if (o.options.sidebarBehavior === 'stick-to-top') {
                        top = o.options.additionalMarginTop;
                    }

                    if (o.options.sidebarBehavior === 'stick-to-bottom') {
                        top = windowOffsetBottom - outerHeight(o.stickySidebar);
                    }

                    if (scrollTopDiff > 0) {
                        top = Math.min(top, windowOffsetTop);
                    } else {
                        top = Math.max(top, windowOffsetBottom - outerHeight(o.stickySidebar));
                    }

                    top = Math.max(top, staticLimitTop);
                    top = Math.min(top, staticLimitBottom - outerHeight(o.stickySidebar));

                    const sidebarSameHeightAsContainer = o.container.getBoundingClientRect().height === outerHeight(o.stickySidebar);

                    if (!sidebarSameHeightAsContainer && top === windowOffsetTop) {
                        position = 'fixed';
                    } else if (!sidebarSameHeightAsContainer && top === windowOffsetBottom - outerHeight(o.stickySidebar)) {
                        position = 'fixed';
                    } else if (scrollTop + top - offsetTop(o.sidebar) - o.paddingTop <= o.options.additionalMarginTop) {
                        position = 'static';
                    } else {
                        position = 'absolute';
                    }

                    if (position === 'fixed') {
                        const scrollLeft = window.pageXOffset;
                        const sidebarStyle2 = window.getComputedStyle(o.sidebar);
                        Object.assign(o.stickySidebar.style, {
                            position: 'fixed',
                            width: getWidthForObject(o.stickySidebar) + 'px',
                            transform: 'translateY(' + top + 'px)',
                            left: (offsetLeft(o.sidebar) + parseFloat(sidebarStyle2.paddingLeft) - scrollLeft) + 'px',
                            top: '0px'
                        });
                    } else if (position === 'absolute') {
                        if (window.getComputedStyle(o.stickySidebar).position !== 'absolute') {
                            o.stickySidebar.style.position = 'absolute';
                            o.stickySidebar.style.transform = 'translateY(' + (scrollTop + top - offsetTop(o.sidebar) - o.stickySidebarPaddingTop - o.stickySidebarPaddingBottom) + 'px)';
                            o.stickySidebar.style.top = '0px';
                        }
                        o.stickySidebar.style.width = getWidthForObject(o.stickySidebar) + 'px';
                        o.stickySidebar.style.left = '';
                    } else if (position === 'static') {
                        resetSidebar(o);
                    }

                    if (position !== 'static') {
                        if (o.options.updateSidebarHeight) {
                            o.sidebar.style.minHeight = (outerHeight(o.stickySidebar) + offsetTop(o.stickySidebar) - offsetTop(o.sidebar) + o.paddingBottom) + 'px';
                        }
                    }
                }

                o.previousScrollTop = scrollTop;
            };

            o.onScroll(o);

            window.addEventListener('scroll', function () {
                o.onScroll(o);
            });
            window.addEventListener('resize', function () {
                o.stickySidebar.style.position = 'static';
                o.onScroll(o);
            });

            if (typeof window.ResizeSensor !== 'undefined') {
                new window.ResizeSensor(o.stickySidebar, function () {
                    o.onScroll(o);
                });
            }

            function resetSidebar(o) {
                o.fixedScrollTop = 0;
                o.sidebar.style.minHeight = '1px';
                o.stickySidebar.style.position = 'static';
                o.stickySidebar.style.width = '';
                o.stickySidebar.style.transform = 'none';
            }
        }

        function getWidthForObject(el) {
            let width;
            try {
                width = el.getBoundingClientRect().width;
            } catch (err) { /* noop */ }
            return width;
        }
    }

    window.TheiaStickySidebar = TheiaStickySidebar;
})(window);
