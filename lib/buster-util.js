if (typeof buster == "undefined") {
    var buster = {};
}

buster.util = (function () {
    var div = typeof document != "undefined" && document.createElement("div");

    return {
        isNode: function (obj) {
            if (!div) {
                return false;
            }

            try {
                div.appendChild(obj);
                div.removeChild(obj);
            } catch (e) {
                return false;
            }

            return true;
        },

        isElement: function (obj) {
            return obj && this.isNode(obj) && obj.nodeType === 1;
        }
    };
}());

if (typeof module != "undefined") {
    module.exports = buster.util;
}
