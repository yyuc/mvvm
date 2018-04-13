function Watcher(vm, exp, updateFn) {
    this.updateFn = updateFn;
    this.vm = vm;
    this.exp = exp;
    this.depIds = {};
    this.value = this.get();
}

Watcher.prototype = {
    update: function () {
        var value = this.get();
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.updateFn.call(this.vm, value, oldVal);
        }
    },
    addDep: function (dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    get: function () {
        Dep.target = this;
        var value = this.vm[this.exp];
        Dep.target = null;
        return value;
    }
};