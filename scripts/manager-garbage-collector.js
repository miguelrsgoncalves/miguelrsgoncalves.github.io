var managerGarbageCollector = (function () {
    var _callbacks = []

    function register(func) {
        _callbacks.push(func)
    }

    function run() {
        _callbacks.forEach(func => { try { func(); } catch (e) {} })
    }

    return { register, run }
})()
