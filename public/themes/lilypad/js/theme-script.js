! function() {
    const THEME_PRESET_COLORS = {
        primary: '#0d6efd',
        emerald: '#047d24',
        teal: '#0E9384',
        purple: '#800080',
        orange: '#ea580c',
        indigo: '#3538CD',
        crimson: '#dc2626',
        secondary: '#FFA201',
        info: '#2F80ED'
    };

    function hexToRgb(hex) {
        if (!hex) return "13, 110, 253";
        hex = hex.replace('#', '').trim();
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (hex.length !== 6) return "13, 110, 253";
        const num = parseInt(hex, 16);
        return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    }

    function applyThemeColorAccent(colorVal) {
        if (!colorVal) return;
        let hex = THEME_PRESET_COLORS[colorVal] || colorVal;
        if (!hex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(hex)) hex = '#' + hex;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
            const rgb = hexToRgb(hex);
            document.documentElement.style.setProperty('--bs-primary', hex);
            document.documentElement.style.setProperty('--primary', hex);
            document.documentElement.style.setProperty('--bs-primary-rgb', rgb);
        }
    }

    function applyThemeButtonTextColor(colorVal) {
        if (!colorVal) return;
        let hex = colorVal;
        if (!hex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(hex)) hex = '#' + hex;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
            document.documentElement.style.setProperty('--btn-text-color', hex);
        }
    }

    window.applyThemeColorAccent = applyThemeColorAccent;
    window.applyThemeButtonTextColor = applyThemeButtonTextColor;
    window.THEME_PRESET_COLORS = THEME_PRESET_COLORS;

	var t = localStorage.getItem("__THEME_CONFIG__") || sessionStorage.getItem("__THEME_CONFIG__"),
		e = document.getElementsByTagName("html")[0],
		i = {
			theme: "light",
			nav: "vertical",
			color: {
				color: "primary"
			},
            customColor: "#0d6efd",
            customTextColor: "#ffffff",
			layout: {
				mode: "fluid"
			},
			topbar: {
				color: "white"
			},
			menu: {
				color: "light"
			},
			sidenav: {
				size: "default",
				user: !1
			}
		};
    var config;
    var html = document.getElementsByTagName("html")[0];

    config = Object.assign({}, i);

    var attrTheme = html.getAttribute("data-bs-theme");
    config.theme = attrTheme !== null ? attrTheme : i.theme;

    var attrLayoutMode = html.getAttribute("data-layout");
    config.layout.mode = attrLayoutMode !== null ? attrLayoutMode : i.layout.mode;

    var attrColor = html.getAttribute("data-color");
    config.color.color = attrColor !== null ? attrColor : i.color.color;

    var attrTopbar = html.getAttribute("data-topbar");
    config.topbar.color = attrTopbar !== null ? attrTopbar : i.topbar.color;

    var attrSidenavSize = html.getAttribute("data-layout");
    config.sidenav.size = attrSidenavSize !== null ? attrSidenavSize : i.sidenav.size;

    var attrSidenavUser = html.getAttribute("data-sidenav-user");
    config.sidenav.user = attrSidenavUser !== null ? attrSidenavUser : i.sidenav.user;

    var attrMenuColor = html.getAttribute("data-sidebar");
    config.menu.color = attrMenuColor !== null ? attrMenuColor : i.menu.color;

    window.defaultConfig = JSON.parse(JSON.stringify(config));

    if (null !== t) {
        try { config = JSON.parse(t); } catch(e) {}
    }

    window.config = config;
    if ("vertical" == config.nav) {
        let t = config.sidenav.size;
        window.innerWidth <= 767 ? t = "full-width" : 767 <= window.innerWidth && window.innerWidth <= 1140 && "full-width" !== self.config.sidenav.size && "hidden" !== self.config.sidenav.size && (t = "condensed"), e.setAttribute("data-layout", t), config.sidenav.user && "true" === config.sidenav.user.toString() ? e.setAttribute("data-sidenav-user", !0) : e.removeAttribute("data-sidenav-user")
    }
    e.setAttribute("data-bs-theme", config.theme);
    e.setAttribute("data-sidebar", config.menu.color);
    e.setAttribute("data-topbar", config.topbar.color);
    e.setAttribute("data-color", config.color.color);

    if (config.customColor) {
        applyThemeColorAccent(config.customColor);
    } else if (config.color && config.color.color) {
        applyThemeColorAccent(config.color.color);
    }

    if (config.customTextColor) {
        applyThemeButtonTextColor(config.customTextColor);
    }
}();

class ThemeCustomizer {
	constructor() {
		this.html = document.getElementsByTagName("html")[0];
        this.config = {};
        this.defaultConfig = window.config;
	}
	initConfig() {
		this.defaultConfig = JSON.parse(JSON.stringify(window.defaultConfig));
        this.config = JSON.parse(JSON.stringify(window.config));
        this.setSwitchFromConfig();
	}
	changeMenuColor(e) {
		this.config.menu.color = e;
        this.html.setAttribute("data-sidebar", e);
        this.setSwitchFromConfig();
	}
	changeLeftbarSize(e, t = !0) {
		this.html.setAttribute("data-layout", e);
		if (document.body) {
			if (e === "mini") {
			    document.body.classList.add("mini-sidebar");
			} else {
			    document.body.classList.remove("mini-sidebar");
			}
		}
		t && (this.config.sidenav.size = e, this.setSwitchFromConfig());
	}	
	changeThemeColor(e) {
		this.config.color.color = e;
        this.config.customColor = window.THEME_PRESET_COLORS[e] || e;
        this.html.setAttribute("data-color", e);
        window.applyThemeColorAccent(this.config.customColor);
        this.setSwitchFromConfig();
	}
    setCustomColor(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex) && !/^#[0-9A-Fa-f]{3}$/.test(hex)) return;
        this.config.color.color = 'custom';
        this.config.customColor = hex;
        this.html.setAttribute("data-color", "custom");
        window.applyThemeColorAccent(hex);
        this.setSwitchFromConfig();
    }
    setCustomTextColor(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex) && !/^#[0-9A-Fa-f]{3}$/.test(hex)) return;
        this.config.customTextColor = hex;
        window.applyThemeButtonTextColor(hex);
        this.setSwitchFromConfig();
    }
	changeLayoutColor(e) {
		this.config.theme = e;
        this.html.setAttribute("data-bs-theme", e);
        this.setSwitchFromConfig();
	}
	changeTopbarColor(e) {
		this.config.topbar.color = e;
        this.html.setAttribute("data-topbar", e);
        this.setSwitchFromConfig();
	}
	resetTheme() {
		this.config = JSON.parse(JSON.stringify(window.defaultConfig));
        this.config.customColor = "#0d6efd";
        this.config.customTextColor = "#ffffff";
        this.changeMenuColor(this.config.menu.color);
        this.changeLeftbarSize(this.config.sidenav.size);
        this.changeLayoutColor(this.config.theme);
        this.changeTopbarColor(this.config.topbar.color);
        this.changeThemeColor(this.config.color.color);
        this.setCustomTextColor("#ffffff");
        this._adjustLayout();
	}
	initSwitchListener() {
		var a = this;
        document.querySelectorAll("input[name=data-sidebar]").forEach(function(t) {
            t.addEventListener("change", function(e) {
                a.changeMenuColor(t.value);
            });
        });
        document.querySelectorAll("input[name=data-color]").forEach(function(t) {
            t.addEventListener("change", function(e) {
                a.changeThemeColor(t.value);
            });
        });
        document.querySelectorAll("input[name=data-layout]").forEach(function(t) {
            t.addEventListener("change", function(e) {
                a.changeLeftbarSize(t.value);
            });
        });
        document.querySelectorAll("input[name=data-bs-theme]").forEach(function(t) {
            t.addEventListener("change", function(e) {
                a.changeLayoutColor(t.value);
            });
        });
        document.querySelectorAll("input[name=data-topbar]").forEach(function(t) {
            t.addEventListener("change", function(e) {
                a.changeTopbarColor(t.value);
            });
        });

        // Custom Button Background Color Picker & Hex Input
        const picker = document.getElementById("customThemeColorPicker");
        const hexInput = document.getElementById("customThemeColorHex");
        const btnApply = document.getElementById("btnApplyCustomColor");

        if (picker && hexInput) {
            picker.addEventListener("input", function() {
                hexInput.value = picker.value.toUpperCase();
                a.setCustomColor(picker.value);
            });
            if (btnApply) {
                btnApply.addEventListener("click", function() {
                    const val = hexInput.value.trim();
                    if (val) {
                        picker.value = val.startsWith('#') ? val : '#' + val;
                        a.setCustomColor(val);
                    }
                });
            }
            hexInput.addEventListener("keyup", function(e) {
                if (e.key === "Enter") {
                    const val = hexInput.value.trim();
                    if (val) {
                        picker.value = val.startsWith('#') ? val : '#' + val;
                        a.setCustomColor(val);
                    }
                }
            });
        }

        // Custom Button Text Color Picker & Hex Input
        const textPicker = document.getElementById("customBtnTextColorPicker");
        const textHexInput = document.getElementById("customBtnTextColorHex");
        const btnApplyText = document.getElementById("btnApplyCustomTextColor");

        if (textPicker && textHexInput) {
            textPicker.addEventListener("input", function() {
                textHexInput.value = textPicker.value.toUpperCase();
                a.setCustomTextColor(textPicker.value);
            });
            if (btnApplyText) {
                btnApplyText.addEventListener("click", function() {
                    const val = textHexInput.value.trim();
                    if (val) {
                        textPicker.value = val.startsWith('#') ? val : '#' + val;
                        a.setCustomTextColor(val);
                    }
                });
            }
            textHexInput.addEventListener("keyup", function(e) {
                if (e.key === "Enter") {
                    const val = textHexInput.value.trim();
                    if (val) {
                        textPicker.value = val.startsWith('#') ? val : '#' + val;
                        a.setCustomTextColor(val);
                    }
                }
            });
        }

        // Button text quick preset chips
        document.querySelectorAll(".btn-text-preset-chip").forEach(function(chip) {
            chip.addEventListener("click", function() {
                const color = chip.getAttribute("data-color");
                if (color) {
                    if (textPicker) textPicker.value = color;
                    if (textHexInput) textHexInput.value = color.toUpperCase();
                    a.setCustomTextColor(color);
                }
            });
        });

        var e = document.getElementById("light-dark-mode");
        if (e) {
            e.addEventListener("click", function(e) {
                "light" === a.config.theme ? a.changeLayoutColor("dark") : a.changeLayoutColor("light");
            });
        }

        var resetBtn = document.querySelector("#reset-layout");
        if (resetBtn) {
            resetBtn.addEventListener("click", function(e) {
                a.resetTheme();
            });
        }

        var navToggle = document.querySelector(".sidenav-toggle-button");
        if (navToggle) {
            navToggle.addEventListener("click", function() {
                var e = a.config.sidenav.size,
                    t = a.html.getAttribute("data-layout", e);
                "full-width" === t ? a.showBackdrop() : "hidden" == e ? "hidden" === t ? a.changeLeftbarSize("hidden" == e ? "default" : e, !1) : a.changeLeftbarSize("hidden", !1) : "condensed" === t ? a.changeLeftbarSize("condensed" == e ? "default" : e, !1) : a.changeLeftbarSize("condensed", !1);
                a.html.classList.toggle("sidebar-enable");
            });
        }

        var closeFull = document.querySelector(".button-close-fullsidebar");
        if (closeFull) {
            closeFull.addEventListener("click", function() {
                a.html.classList.remove("sidebar-enable");
                a.hideBackdrop();
            });
        }

        document.querySelectorAll(".button-sm-hover").forEach(function(e) {
            e.addEventListener("click", function() {
                var e = a.config.sidenav.size;
                "sm-hover-active" === a.html.getAttribute("data-layout", e) ? a.changeLeftbarSize("hover-view", !1) : a.changeLeftbarSize("sm-hover-active", !1);
            });
        });
	}
	showBackdrop() {
		const e = document.createElement("div"),
			t = (e.id = "custom-backdrop", e.classList = "offcanvas-backdrop fade show", document.body.appendChild(e), document.body.style.overflow = "hidden", 767 < window.innerWidth && (document.body.style.paddingRight = "15px"), this);
		e.addEventListener("click", function(e) {
			t.html.classList.remove("sidebar-enable"), t.hideBackdrop();
		});
	}
	hideBackdrop() {
		var e = document.getElementById("custom-backdrop");
		e && (document.body.removeChild(e), document.body.style.overflow = null, document.body.style.paddingRight = null);
	}
	initWindowSize() {
		var t = this;
		window.addEventListener("resize", function(e) {
			t._adjustLayout();
		});
	}
	_adjustLayout() {
		var e = this;
		window.innerWidth <= 767.98 ? e.changeLeftbarSize("full-width", !1) : 767 <= window.innerWidth && window.innerWidth <= 1140 ? "full-width" !== e.config.sidenav.size && "hidden" !== e.config.sidenav.size && ("hover-view" === e.config.sidenav.size ? e.changeLeftbarSize("condensed") : e.changeLeftbarSize("condensed", !1)) : (e.changeLeftbarSize(e.config.sidenav.size));
	}
	setSwitchFromConfig() {
		try { localStorage.setItem("__THEME_CONFIG__", JSON.stringify(this.config)); } catch(e) {}
		try { sessionStorage.setItem("__THEME_CONFIG__", JSON.stringify(this.config)); } catch(e) {}
		document.querySelectorAll(".right-bar input[type=checkbox]").forEach(function(e) {
			e.checked = !1;
		});
		var e, t, a, n, i, o = this.config;
		if (o) {
            e = document.querySelector("input[type=radio][name=data-layout][value=" + o.nav + "]");
            t = document.querySelector("input[type=radio][name=data-bs-theme][value=" + o.theme + "]");
            a = document.querySelector("input[type=radio][name=data-color][value=" + o.color.color + "]");
            n = document.querySelector("input[type=radio][name=data-topbar][value=" + o.topbar.color + "]");
            i = document.querySelector("input[type=radio][name=data-sidebar][value=" + o.menu.color + "]");
            var s = document.querySelector("input[type=radio][name=data-layout][value=" + o.sidenav.size + "]");
            e && (e.checked = !0);
            t && (t.checked = !0);
            a && (a.checked = !0);
            n && (n.checked = !0);
            i && (i.checked = !0);
            s && (s.checked = !0);

            // Sync button background color picker
            const picker = document.getElementById("customThemeColorPicker");
            const hexInput = document.getElementById("customThemeColorHex");
            if (picker && hexInput && o.customColor) {
                picker.value = o.customColor;
                hexInput.value = o.customColor.toUpperCase();
            }

            // Sync button text color picker
            const textPicker = document.getElementById("customBtnTextColorPicker");
            const textHexInput = document.getElementById("customBtnTextColorHex");
            if (textPicker && textHexInput && o.customTextColor) {
                textPicker.value = o.customTextColor;
                textHexInput.value = o.customTextColor.toUpperCase();
            }
        }
	}
	init() {
		this.initConfig();
        this.initSwitchListener();
        this.initWindowSize();
        this._adjustLayout();
        this.setSwitchFromConfig();
	}
}

document.addEventListener("DOMContentLoaded", function(e) {
	let themesetting = `
	<div class="sidebar-contact">
    	<div class="toggle-theme" data-bs-toggle="offcanvas" data-bs-target="#theme-settings-offcanvas" title="Customize Theme & Colors"><i class="ti ti-settings"></i></div>
    </div>
	<div class="sidebar-themesettings offcanvas offcanvas-end" tabindex="-1" id="theme-settings-offcanvas">
        <div class="d-flex align-items-center gap-2 px-3 py-3 offcanvas-header border-bottom bg-primary text-white">
            <h5 class="flex-grow-1 mb-0 text-white"><i class="ti ti-palette me-2"></i>Theme & Color Customizer</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body h-100" data-simplebar>
			
            <div class="accordion accordion-bordered">  

				<div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button fw-semibold fs-16" type="button" data-bs-toggle="collapse" data-bs-target="#modesetting" aria-expanded="true">
                            <i class="ti ti-sun-moon me-2 text-primary"></i> Color Mode
                        </button>
                    </h2>
                    <div id="modesetting" class="accordion-collapse collapse show">
						<div class="accordion-body">
							<div class="row g-3">
								<div class="col-6">
									<div class="form-check card-radio">
										<input class="form-check-input" type="radio" name="data-bs-theme" id="layout-color-light" value="light">
										<label class="form-check-label p-2 w-100 d-flex justify-content-center align-items-center" for="layout-color-light">
											<i class="ti ti-sun me-1"></i>Light
										</label>
									</div>
								</div>
								<div class="col-6">
									<div class="form-check card-radio">
										<input class="form-check-input" type="radio" name="data-bs-theme" id="layout-color-dark" value="dark">
										<label class="form-check-label p-2 w-100 d-flex justify-content-center align-items-center" for="layout-color-dark">
											<i class="ti ti-moon me-1"></i>Dark
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

                <!-- Custom Button & Accent Color -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button fw-semibold fs-16" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarcolor" aria-expanded="true">
                            <i class="ti ti-color-filter me-2 text-primary"></i> Button & Accent Color
                        </button>
                    </h2>
                    <div id="sidebarcolor" class="accordion-collapse collapse show">
                        <div class="accordion-body">
                            <div class="theme-content">
                                <p class="fs-12 text-muted mb-2">Select a popular color palette or pick your custom hex shade:</p>
                                <div class="d-flex align-items-center flex-wrap gap-2 mb-3">
                                    <div class="theme-colorsset" title="Classic Ocean Blue (#0D6EFD)">
                                        <input type="radio" name="data-color" id="primaryColor" value="primary">
                                        <label for="primaryColor" style="background:#0d6efd; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>
                                    <div class="theme-colorsset" title="Froggy's Emerald (#047D24)">
                                        <input type="radio" name="data-color" id="emeraldColor" value="emerald">
                                        <label for="emeraldColor" style="background:#047d24; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>  
                                    <div class="theme-colorsset" title="Teal Cyan (#0E9384)">
                                        <input type="radio" name="data-color" id="tealColor" value="teal">
                                        <label for="tealColor" style="background:#0E9384; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>  
                                    <div class="theme-colorsset" title="Royal Purple (#800080)">
                                        <input type="radio" name="data-color" id="purpleColor" value="purple">
                                        <label for="purpleColor" style="background:#800080; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>
                                    <div class="theme-colorsset" title="Sunset Orange (#EA580C)">
                                        <input type="radio" name="data-color" id="orangeColor" value="orange">
                                        <label for="orangeColor" style="background:#ea580c; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>
                                    <div class="theme-colorsset" title="Electric Indigo (#3538CD)">
                                        <input type="radio" name="data-color" id="indigoColor" value="indigo">
                                        <label for="indigoColor" style="background:#3538CD; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>
                                    <div class="theme-colorsset" title="Crimson Red (#DC2626)">
                                        <input type="radio" name="data-color" id="crimsonColor" value="crimson">
                                        <label for="crimsonColor" style="background:#dc2626; width:30px; height:30px; border-radius:8px; cursor:pointer; display:inline-block; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></label>
                                    </div>
                                </div>

                                <div class="p-3 bg-light rounded-3 border">
                                    <label class="form-label fs-12 fw-bold text-dark mb-2 d-flex align-items-center gap-1">
                                        <i class="ti ti-color-swatch text-primary"></i> Custom Button Color:
                                    </label>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="color" id="customThemeColorPicker" class="form-control form-control-color border-0 p-0 shadow-sm" value="#0d6efd" style="width:40px; height:36px; cursor:pointer; border-radius:6px;" title="Pick custom button color">
                                        <input type="text" id="customThemeColorHex" class="form-control form-control-sm font-monospace text-uppercase" placeholder="#0D6EFD" style="max-width:120px;" maxlength="7">
                                        <button type="button" class="btn btn-sm btn-primary px-3 shadow-sm" id="btnApplyCustomColor">Apply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 

                <!-- Custom Button Text / Active Element Text Color -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button fw-semibold fs-16" type="button" data-bs-toggle="collapse" data-bs-target="#buttontextcolor" aria-expanded="true">
                            <i class="ti ti-typography me-2 text-primary"></i> Button & Active Text Color
                        </button>
                    </h2>
                    <div id="buttontextcolor" class="accordion-collapse collapse show">
                        <div class="accordion-body">
                            <div class="theme-content">
                                <p class="fs-12 text-muted mb-2">Change the text and icon color for selected buttons and active elements:</p>
                                <div class="d-flex align-items-center flex-wrap gap-2 mb-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary btn-text-preset-chip d-flex align-items-center gap-1 py-1 px-2 fs-12 rounded-2" data-color="#ffffff">
                                        <span class="rounded-circle border" style="background:#ffffff; width:12px; height:12px; display:inline-block;"></span> White
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary btn-text-preset-chip d-flex align-items-center gap-1 py-1 px-2 fs-12 rounded-2" data-color="#0f172a">
                                        <span class="rounded-circle" style="background:#0f172a; width:12px; height:12px; display:inline-block;"></span> Dark
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary btn-text-preset-chip d-flex align-items-center gap-1 py-1 px-2 fs-12 rounded-2" data-color="#fef08a">
                                        <span class="rounded-circle" style="background:#fef08a; width:12px; height:12px; display:inline-block;"></span> Yellow
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary btn-text-preset-chip d-flex align-items-center gap-1 py-1 px-2 fs-12 rounded-2" data-color="#86efac">
                                        <span class="rounded-circle" style="background:#86efac; width:12px; height:12px; display:inline-block;"></span> Lime
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary btn-text-preset-chip d-flex align-items-center gap-1 py-1 px-2 fs-12 rounded-2" data-color="#bae6fd">
                                        <span class="rounded-circle" style="background:#bae6fd; width:12px; height:12px; display:inline-block;"></span> Ice Blue
                                    </button>
                                </div>

                                <div class="p-3 bg-light rounded-3 border">
                                    <label class="form-label fs-12 fw-bold text-dark mb-2 d-flex align-items-center gap-1">
                                        <i class="ti ti-brush text-primary"></i> Custom Text Color:
                                    </label>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="color" id="customBtnTextColorPicker" class="form-control form-control-color border-0 p-0 shadow-sm" value="#ffffff" style="width:40px; height:36px; cursor:pointer; border-radius:6px;" title="Pick custom text color">
                                        <input type="text" id="customBtnTextColorHex" class="form-control form-control-sm font-monospace text-uppercase" placeholder="#FFFFFF" style="max-width:120px;" maxlength="7">
                                        <button type="button" class="btn btn-sm btn-primary px-3 shadow-sm" id="btnApplyCustomTextColor">Apply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button fw-semibold fs-16" type="button" data-bs-toggle="collapse" data-bs-target="#layoutsetting" aria-expanded="false">
                            <i class="ti ti-layout-grid me-2 text-primary"></i> Sidenav Layout Mode
                        </button>
                    </h2>
                    <div id="layoutsetting" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="theme-content">
                                <div class="row g-3">
                                    <div class="col-4">
                                        <div class="theme-layout">
                                            <input type="radio" name="data-layout" id="defaultLayout" value="default" checked>
                                            <label for="defaultLayout">
                                                <span class="d-block mb-2 layout-img">
                                                    <span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
                                                    <img src="assets/img/theme/default.svg" alt="img">
                                                </span>                                     
                                                <span class="layout-type">Default</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="theme-layout">
                                            <input type="radio" name="data-layout" id="miniLayout" value="mini">
                                            <label for="miniLayout">
                                                <span class="d-block mb-2 layout-img">
                                                <span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
                                                    <img src="assets/img/theme/mini.svg" alt="img">
                                                </span>                                    
                                                <span class="layout-type">Mini</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="theme-layout">
                                            <input type="radio" name="data-layout" id="hoverviewLayout" value="hoverview">
                                            <label for="hoverviewLayout">
                                                <span class="d-block mb-2 layout-img">
                                                <span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
                                                    <img src="assets/img/theme/mini.svg" alt="img">
                                                </span>                                    
                                                <span class="layout-type">Hover View</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="theme-layout">
                                            <input type="radio" name="data-layout" id="hiddenLayout" value="hidden">
                                            <label for="hiddenLayout">
                                                <span class="d-block mb-2 layout-img">
                                                <span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
                                                    <img src="assets/img/theme/full-width.svg" alt="img">
                                                </span>                                    
                                                <span class="layout-type">Hidden</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="theme-layout">
                                            <input type="radio" name="data-layout" id="full-widthLayout" value="full-width">
                                            <label for="full-widthLayout">
                                                <span class="d-block mb-2 layout-img">
                                                <span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
                                                    <img src="assets/img/theme/full-width.svg" alt="img">
                                                </span>                                    
                                                <span class="layout-type">Full Width</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button fw-semibold fs-16" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarcolorsetting" aria-expanded="false">
                            <i class="ti ti-layout-sidebar me-2 text-primary"></i> Sidebar Color
                        </button>
                    </h2>
                    <div id="sidebarcolorsetting" class="accordion-collapse collapse">
                        <div class="accordion-body">
                        	<div class="theme-content">
								<h6 class="fs-14 fw-medium mb-2">Solid Colors</h6>
								<div class="d-flex align-items-center flex-wrap mb-3 gap-3">
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="lightSidebar" value="light" checked>
										<label for="lightSidebar" class="d-block rounded">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="sidebar2Sidebar" value="sidebar2">
										<label for="sidebar2Sidebar" class="d-block rounded bg-light">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="sidebar3Sidebar" value="sidebar3">
										<label for="sidebar3Sidebar" class="d-block rounded bg-dark">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="sidebar4Sidebar" value="sidebar4">
										<label for="sidebar4Sidebar" class="d-block rounded bg-primary">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="sidebar5Sidebar" value="sidebar5">
										<label for="sidebar5Sidebar" class="d-block rounded bg-secondary">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="sidebar6Sidebar" value="sidebar6">
										<label for="sidebar6Sidebar" class="d-block rounded bg-info">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>    
									<div class="theme-colorselect">
										<input type="radio" name="data-sidebar" id="sidebar7Sidebar" value="sidebar7">
										<label for="sidebar7Sidebar" class="d-block rounded bg-indigo">
											<span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
										</label>
									</div>      
								</div>
							</div>
                        </div>
                    </div>
                </div>   

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button fw-semibold fs-16" type="button" data-bs-toggle="collapse" data-bs-target="#colorsetting" aria-expanded="false">
                            <i class="ti ti-layout-navbar me-2 text-primary"></i> Top Bar Color
                        </button>
                    </h2>
                    <div id="colorsetting" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="theme-content">
                                <h6 class="fs-14 fw-medium mb-2">Solid Colors</h6>
                                <div class="d-flex align-items-center flex-wrap topbar-background mb-3 gap-3">
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="whiteTopbar" value="white" checked>
                                        <label for="whiteTopbar" class="white-topbar">
                                            <span class="theme-check rounded-circle"><i class="ti ti-check"></i></span>
                                        </label>
                                    </div>
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="topbar1Topbar" value="topbar1">
                                        <label for="topbar1Topbar" class="bg-light"><span class="theme-check rounded-circle"><i class="ti ti-check"></i></span></label>
                                    </div>
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="topbar2Topbar" value="topbar2">
                                        <label for="topbar2Topbar" class="bg-dark"><span class="theme-check rounded-circle"><i class="ti ti-check"></i></span></label>
                                    </div>
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="topbar3Topbar" value="topbar3">
                                        <label for="topbar3Topbar" class="bg-primary"><span class="theme-check rounded-circle"><i class="ti ti-check"></i></span></label>
                                    </div>
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="topbar4Topbar" value="topbar4">
                                        <label for="topbar4Topbar" class="bg-secondary"><span class="theme-check rounded-circle"><i class="ti ti-check"></i></span></label>
                                    </div>                   
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="topbar5Topbar" value="topbar5">
                                        <label for="topbar5Topbar" class="bg-info"><span class="theme-check rounded-circle"><i class="ti ti-check"></i></span></label>
                                    </div>                   
                                    <div class="theme-colorselect">
                                        <input type="radio" name="data-topbar" id="topbar6Topbar" value="topbar6">
                                        <label for="topbar6Topbar" class="bg-indigo"><span class="theme-check rounded-circle"><i class="ti ti-check"></i></span></label>
                                    </div> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
            </div>

        </div>

        <div class="d-flex align-items-center gap-2 px-3 py-3 offcanvas-header border-top">
            <button type="button" class="btn w-100 btn-light shadow-sm fw-semibold" id="reset-layout"><i class="ti ti-restore me-1"></i>Reset to Default Theme</button>
        </div>

    </div>`;
	let wrapper = document.createElement("div");
	wrapper.innerHTML = themesetting;

	while (wrapper.firstChild) {
		document.body.appendChild(wrapper.firstChild);
	}
	(new ThemeCustomizer).init();
});
