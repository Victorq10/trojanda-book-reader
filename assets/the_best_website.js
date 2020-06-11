(() => {
    "use strict";
    var site_init = {
        460: () => {
            var rainbow_elmt = document.getElementById("rbw"),
                rainbow_red_color = 0,
                eventName = ("ontouchstart" in window ? "touchend" : "click"),
                toggle_class_methods = ["remove", "add"],
                labels = ["Add more contrast", "Remove additional contrast", "Inverted mode", "Normal mode"];
            function init_toggle(elmt_id, toggle_txt_list, toggle_class_name, default_state) {
                var html = document.getElementsByTagName("html")[0],
                    elmt = document.getElementById(elmt_id),
                    text_elmt = elmt.firstChild,
                    prev_toggle_txt_idx = !1,
                    toggle_class = function () {
                        var toggle_txt_idx = Number(prev_toggle_txt_idx = !prev_toggle_txt_idx);
                        text_elmt.data = toggle_txt_list[toggle_txt_idx],
                            html.classList[toggle_class_methods[toggle_txt_idx]](toggle_class_name)
                    };
                    if (default_state) toggle_class();
                elmt.addEventListener(eventName, toggle_class, !1)
            }
            !function () {
                var contrast_elmt = document.createElement("div");
                contrast_elmt.id = "contrast",
                    contrast_elmt.innerText = labels[0];
                var invmode_elmt = document.createElement("div");
                invmode_elmt.id = "invmode",
                    invmode_elmt.innerText = labels[2],
                    document.body.appendChild(contrast_elmt),
                    document.body.appendChild(invmode_elmt)
            }();
            !function rainbow_text() {
                if (true || !rainbow_elmt) return;
                var color = "hsl(" + rainbow_red_color + ", 80%, 60%)",
                    d = rainbow_red_color + 5;
                rainbow_red_color = d > 360 ? 0 : d,
                    rainbow_elmt.style.color = color, setTimeout(rainbow_text, 40)
            }();
            init_toggle("contrast", [labels[0], labels[1]], "contrast");
            init_toggle("invmode", [labels[2], labels[3]], "inverted", true);
        }
    },
        new_object = {};
    function init(key) {
        if (new_object[key]) return new_object[key].exports;
        var value = new_object[key] = {
            exports: {
            }
        };
        return site_init[key](value, value.exports, init), value.exports
    }
    //init.p = "",
    site_init[460](),
        (() => {
            //init(460);
            //init.p
        })()
})();
