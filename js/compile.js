function Compile(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment(),
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    },

    init: function () {
        this.compileElement(this.$fragment);
    },

    compileElement: function (el) {
        var childNodes = el.childNodes,
            me = this;

        [].slice.call(childNodes).forEach(function (node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;

            if (me.isElementNode(node)) {
                me.compile(node);

            } else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    },

    compile: function (node) {
        var nodeAttrs = node.attributes,
            me = this;

        [].slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name;
            if (me.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);

                compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);

                node.removeAttribute(attrName);
            }
        });
    },

    compileText: function (node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isDirective: function (attr) {
        return attr.indexOf('v-') == 0;
    },

    isElementNode: function (node) {
        return node.nodeType == 1;
    },

    isTextNode: function (node) {
        return node.nodeType == 3;
    }
};

// 指令处理集合
var compileUtil = {
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    model: function (node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        var me = this,
            val = vm[exp];
        node.addEventListener('input', function (e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            vm[exp] = newValue;
            val = newValue;
        });
    },

    bind: function (node, vm, exp, dir) {
        let updaterFn = dir === 'model' ?
            (node, value) => (node.value = typeof value === 'undefined' ? '' : value) :
            (node, value) => (node.textContent = typeof value === 'undefined' ? '' : value)

        updaterFn(node, vm[exp]);

        new Watcher(vm, exp, function (value, oldValue) {
            updaterFn(node, value, oldValue);
        });
    },
}