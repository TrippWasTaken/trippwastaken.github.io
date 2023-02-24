
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * anime.js v3.2.1
     * (c) 2020 Julian Garnier
     * Released under the MIT license
     * animejs.com
     */

    // Defaults

    var defaultInstanceSettings = {
      update: null,
      begin: null,
      loopBegin: null,
      changeBegin: null,
      change: null,
      changeComplete: null,
      loopComplete: null,
      complete: null,
      loop: 1,
      direction: 'normal',
      autoplay: true,
      timelineOffset: 0
    };

    var defaultTweenSettings = {
      duration: 1000,
      delay: 0,
      endDelay: 0,
      easing: 'easeOutElastic(1, .5)',
      round: 0
    };

    var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

    // Caching

    var cache$1 = {
      CSS: {},
      springs: {}
    };

    // Utils

    function minMax(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    function stringContains(str, text) {
      return str.indexOf(text) > -1;
    }

    function applyArguments(func, args) {
      return func.apply(null, args);
    }

    var is = {
      arr: function (a) { return Array.isArray(a); },
      obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
      pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
      svg: function (a) { return a instanceof SVGElement; },
      inp: function (a) { return a instanceof HTMLInputElement; },
      dom: function (a) { return a.nodeType || is.svg(a); },
      str: function (a) { return typeof a === 'string'; },
      fnc: function (a) { return typeof a === 'function'; },
      und: function (a) { return typeof a === 'undefined'; },
      nil: function (a) { return is.und(a) || a === null; },
      hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
      rgb: function (a) { return /^rgb/.test(a); },
      hsl: function (a) { return /^hsl/.test(a); },
      col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
      key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; },
    };

    // Easings

    function parseEasingParameters(string) {
      var match = /\(([^)]+)\)/.exec(string);
      return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
    }

    // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

    function spring(string, duration) {

      var params = parseEasingParameters(string);
      var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
      var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
      var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
      var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
      var w0 = Math.sqrt(stiffness / mass);
      var zeta = damping / (2 * Math.sqrt(stiffness * mass));
      var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
      var a = 1;
      var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

      function solver(t) {
        var progress = duration ? (duration * t) / 1000 : t;
        if (zeta < 1) {
          progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
        } else {
          progress = (a + b * progress) * Math.exp(-progress * w0);
        }
        if (t === 0 || t === 1) { return t; }
        return 1 - progress;
      }

      function getDuration() {
        var cached = cache$1.springs[string];
        if (cached) { return cached; }
        var frame = 1/6;
        var elapsed = 0;
        var rest = 0;
        while(true) {
          elapsed += frame;
          if (solver(elapsed) === 1) {
            rest++;
            if (rest >= 16) { break; }
          } else {
            rest = 0;
          }
        }
        var duration = elapsed * frame * 1000;
        cache$1.springs[string] = duration;
        return duration;
      }

      return duration ? solver : getDuration;

    }

    // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

    function steps(steps) {
      if ( steps === void 0 ) steps = 10;

      return function (t) { return Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps); };
    }

    // BezierEasing https://github.com/gre/bezier-easing

    var bezier = (function () {

      var kSplineTableSize = 11;
      var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

      function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
      function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
      function C(aA1)      { return 3.0 * aA1 }

      function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
      function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

      function binarySubdivide(aX, aA, aB, mX1, mX2) {
        var currentX, currentT, i = 0;
        do {
          currentT = aA + (aB - aA) / 2.0;
          currentX = calcBezier(currentT, mX1, mX2) - aX;
          if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
        } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
        return currentT;
      }

      function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (var i = 0; i < 4; ++i) {
          var currentSlope = getSlope(aGuessT, mX1, mX2);
          if (currentSlope === 0.0) { return aGuessT; }
          var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
      }

      function bezier(mX1, mY1, mX2, mY2) {

        if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
        var sampleValues = new Float32Array(kSplineTableSize);

        if (mX1 !== mY1 || mX2 !== mY2) {
          for (var i = 0; i < kSplineTableSize; ++i) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
          }
        }

        function getTForX(aX) {

          var intervalStart = 0;
          var currentSample = 1;
          var lastSample = kSplineTableSize - 1;

          for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += kSampleStepSize;
          }

          --currentSample;

          var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
          var guessForT = intervalStart + dist * kSampleStepSize;
          var initialSlope = getSlope(guessForT, mX1, mX2);

          if (initialSlope >= 0.001) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
          } else if (initialSlope === 0.0) {
            return guessForT;
          } else {
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
          }

        }

        return function (x) {
          if (mX1 === mY1 && mX2 === mY2) { return x; }
          if (x === 0 || x === 1) { return x; }
          return calcBezier(getTForX(x), mY1, mY2);
        }

      }

      return bezier;

    })();

    var penner = (function () {

      // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

      var eases = { linear: function () { return function (t) { return t; }; } };

      var functionEasings = {
        Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
        Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
        Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
        Bounce: function () { return function (t) {
          var pow2, b = 4;
          while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
          return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
        }; },
        Elastic: function (amplitude, period) {
          if ( amplitude === void 0 ) amplitude = 1;
          if ( period === void 0 ) period = .5;

          var a = minMax(amplitude, 1, 10);
          var p = minMax(period, .1, 2);
          return function (t) {
            return (t === 0 || t === 1) ? t : 
              -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
          }
        }
      };

      var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

      baseEasings.forEach(function (name, i) {
        functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
      });

      Object.keys(functionEasings).forEach(function (name) {
        var easeIn = functionEasings[name];
        eases['easeIn' + name] = easeIn;
        eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
        eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
          1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
        eases['easeOutIn' + name] = function (a, b) { return function (t) { return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : 
          (easeIn(a, b)(t * 2 - 1) + 1) / 2; }; };
      });

      return eases;

    })();

    function parseEasings(easing, duration) {
      if (is.fnc(easing)) { return easing; }
      var name = easing.split('(')[0];
      var ease = penner[name];
      var args = parseEasingParameters(easing);
      switch (name) {
        case 'spring' : return spring(easing, duration);
        case 'cubicBezier' : return applyArguments(bezier, args);
        case 'steps' : return applyArguments(steps, args);
        default : return applyArguments(ease, args);
      }
    }

    // Strings

    function selectString(str) {
      try {
        var nodes = document.querySelectorAll(str);
        return nodes;
      } catch(e) {
        return;
      }
    }

    // Arrays

    function filterArray(arr, callback) {
      var len = arr.length;
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      var result = [];
      for (var i = 0; i < len; i++) {
        if (i in arr) {
          var val = arr[i];
          if (callback.call(thisArg, val, i, arr)) {
            result.push(val);
          }
        }
      }
      return result;
    }

    function flattenArray(arr) {
      return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
    }

    function toArray(o) {
      if (is.arr(o)) { return o; }
      if (is.str(o)) { o = selectString(o) || o; }
      if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
      return [o];
    }

    function arrayContains(arr, val) {
      return arr.some(function (a) { return a === val; });
    }

    // Objects

    function cloneObject(o) {
      var clone = {};
      for (var p in o) { clone[p] = o[p]; }
      return clone;
    }

    function replaceObjectProps(o1, o2) {
      var o = cloneObject(o1);
      for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
      return o;
    }

    function mergeObjects(o1, o2) {
      var o = cloneObject(o1);
      for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
      return o;
    }

    // Colors

    function rgbToRgba(rgbValue) {
      var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
      return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
    }

    function hexToRgba(hexValue) {
      var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
      var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      var r = parseInt(rgb[1], 16);
      var g = parseInt(rgb[2], 16);
      var b = parseInt(rgb[3], 16);
      return ("rgba(" + r + "," + g + "," + b + ",1)");
    }

    function hslToRgba(hslValue) {
      var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
      var h = parseInt(hsl[1], 10) / 360;
      var s = parseInt(hsl[2], 10) / 100;
      var l = parseInt(hsl[3], 10) / 100;
      var a = hsl[4] || 1;
      function hue2rgb(p, q, t) {
        if (t < 0) { t += 1; }
        if (t > 1) { t -= 1; }
        if (t < 1/6) { return p + (q - p) * 6 * t; }
        if (t < 1/2) { return q; }
        if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
        return p;
      }
      var r, g, b;
      if (s == 0) {
        r = g = b = l;
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
    }

    function colorToRgb(val) {
      if (is.rgb(val)) { return rgbToRgba(val); }
      if (is.hex(val)) { return hexToRgba(val); }
      if (is.hsl(val)) { return hslToRgba(val); }
    }

    // Units

    function getUnit(val) {
      var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
      if (split) { return split[1]; }
    }

    function getTransformUnit(propName) {
      if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
      if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
    }

    // Values

    function getFunctionValue(val, animatable) {
      if (!is.fnc(val)) { return val; }
      return val(animatable.target, animatable.id, animatable.total);
    }

    function getAttribute(el, prop) {
      return el.getAttribute(prop);
    }

    function convertPxToUnit(el, value, unit) {
      var valueUnit = getUnit(value);
      if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
      var cached = cache$1.CSS[value + unit];
      if (!is.und(cached)) { return cached; }
      var baseline = 100;
      var tempEl = document.createElement(el.tagName);
      var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
      parentEl.appendChild(tempEl);
      tempEl.style.position = 'absolute';
      tempEl.style.width = baseline + unit;
      var factor = baseline / tempEl.offsetWidth;
      parentEl.removeChild(tempEl);
      var convertedUnit = factor * parseFloat(value);
      cache$1.CSS[value + unit] = convertedUnit;
      return convertedUnit;
    }

    function getCSSValue(el, prop, unit) {
      if (prop in el.style) {
        var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
        return unit ? convertPxToUnit(el, value, unit) : value;
      }
    }

    function getAnimationType(el, prop) {
      if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))) { return 'attribute'; }
      if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
      if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
      if (el[prop] != null) { return 'object'; }
    }

    function getElementTransforms(el) {
      if (!is.dom(el)) { return; }
      var str = el.style.transform || '';
      var reg  = /(\w+)\(([^)]*)\)/g;
      var transforms = new Map();
      var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
      return transforms;
    }

    function getTransformValue(el, propName, animatable, unit) {
      var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
      var value = getElementTransforms(el).get(propName) || defaultVal;
      if (animatable) {
        animatable.transforms.list.set(propName, value);
        animatable.transforms['last'] = propName;
      }
      return unit ? convertPxToUnit(el, value, unit) : value;
    }

    function getOriginalTargetValue(target, propName, unit, animatable) {
      switch (getAnimationType(target, propName)) {
        case 'transform': return getTransformValue(target, propName, animatable, unit);
        case 'css': return getCSSValue(target, propName, unit);
        case 'attribute': return getAttribute(target, propName);
        default: return target[propName] || 0;
      }
    }

    function getRelativeValue(to, from) {
      var operator = /^(\*=|\+=|-=)/.exec(to);
      if (!operator) { return to; }
      var u = getUnit(to) || 0;
      var x = parseFloat(from);
      var y = parseFloat(to.replace(operator[0], ''));
      switch (operator[0][0]) {
        case '+': return x + y + u;
        case '-': return x - y + u;
        case '*': return x * y + u;
      }
    }

    function validateValue(val, unit) {
      if (is.col(val)) { return colorToRgb(val); }
      if (/\s/g.test(val)) { return val; }
      var originalUnit = getUnit(val);
      var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
      if (unit) { return unitLess + unit; }
      return unitLess;
    }

    // getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
    // adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

    function getDistance(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    function getCircleLength(el) {
      return Math.PI * 2 * getAttribute(el, 'r');
    }

    function getRectLength(el) {
      return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
    }

    function getLineLength(el) {
      return getDistance(
        {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
        {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
      );
    }

    function getPolylineLength(el) {
      var points = el.points;
      var totalLength = 0;
      var previousPos;
      for (var i = 0 ; i < points.numberOfItems; i++) {
        var currentPos = points.getItem(i);
        if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
        previousPos = currentPos;
      }
      return totalLength;
    }

    function getPolygonLength(el) {
      var points = el.points;
      return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
    }

    // Path animation

    function getTotalLength(el) {
      if (el.getTotalLength) { return el.getTotalLength(); }
      switch(el.tagName.toLowerCase()) {
        case 'circle': return getCircleLength(el);
        case 'rect': return getRectLength(el);
        case 'line': return getLineLength(el);
        case 'polyline': return getPolylineLength(el);
        case 'polygon': return getPolygonLength(el);
      }
    }

    function setDashoffset(el) {
      var pathLength = getTotalLength(el);
      el.setAttribute('stroke-dasharray', pathLength);
      return pathLength;
    }

    // Motion path

    function getParentSvgEl(el) {
      var parentEl = el.parentNode;
      while (is.svg(parentEl)) {
        if (!is.svg(parentEl.parentNode)) { break; }
        parentEl = parentEl.parentNode;
      }
      return parentEl;
    }

    function getParentSvg(pathEl, svgData) {
      var svg = svgData || {};
      var parentSvgEl = svg.el || getParentSvgEl(pathEl);
      var rect = parentSvgEl.getBoundingClientRect();
      var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
      var width = rect.width;
      var height = rect.height;
      var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
      return {
        el: parentSvgEl,
        viewBox: viewBox,
        x: viewBox[0] / 1,
        y: viewBox[1] / 1,
        w: width,
        h: height,
        vW: viewBox[2],
        vH: viewBox[3]
      }
    }

    function getPath$1(path, percent) {
      var pathEl = is.str(path) ? selectString(path)[0] : path;
      var p = percent || 100;
      return function(property) {
        return {
          property: property,
          el: pathEl,
          svg: getParentSvg(pathEl),
          totalLength: getTotalLength(pathEl) * (p / 100)
        }
      }
    }

    function getPathProgress(path, progress, isPathTargetInsideSVG) {
      function point(offset) {
        if ( offset === void 0 ) offset = 0;

        var l = progress + offset >= 1 ? progress + offset : 0;
        return path.el.getPointAtLength(l);
      }
      var svg = getParentSvg(path.el, path.svg);
      var p = point();
      var p0 = point(-1);
      var p1 = point(+1);
      var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
      var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
      switch (path.property) {
        case 'x': return (p.x - svg.x) * scaleX;
        case 'y': return (p.y - svg.y) * scaleY;
        case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
      }
    }

    // Decompose value

    function decomposeValue(val, unit) {
      // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
      // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
      var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
      var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
      return {
        original: value,
        numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
        strings: (is.str(val) || unit) ? value.split(rgx) : []
      }
    }

    // Animatables

    function parseTargets(targets) {
      var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
      return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
    }

    function getAnimatables(targets) {
      var parsed = parseTargets(targets);
      return parsed.map(function (t, i) {
        return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
      });
    }

    // Properties

    function normalizePropertyTweens(prop, tweenSettings) {
      var settings = cloneObject(tweenSettings);
      // Override duration if easing is a spring
      if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
      if (is.arr(prop)) {
        var l = prop.length;
        var isFromTo = (l === 2 && !is.obj(prop[0]));
        if (!isFromTo) {
          // Duration divided by the number of tweens
          if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
        } else {
          // Transform [from, to] values shorthand to a valid tween value
          prop = {value: prop};
        }
      }
      var propArray = is.arr(prop) ? prop : [prop];
      return propArray.map(function (v, i) {
        var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
        // Default delay value should only be applied to the first tween
        if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
        // Default endDelay value should only be applied to the last tween
        if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
        return obj;
      }).map(function (k) { return mergeObjects(k, settings); });
    }


    function flattenKeyframes(keyframes) {
      var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
      .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
      var properties = {};
      var loop = function ( i ) {
        var propName = propertyNames[i];
        properties[propName] = keyframes.map(function (key) {
          var newKey = {};
          for (var p in key) {
            if (is.key(p)) {
              if (p == propName) { newKey.value = key[p]; }
            } else {
              newKey[p] = key[p];
            }
          }
          return newKey;
        });
      };

      for (var i = 0; i < propertyNames.length; i++) loop( i );
      return properties;
    }

    function getProperties(tweenSettings, params) {
      var properties = [];
      var keyframes = params.keyframes;
      if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
      for (var p in params) {
        if (is.key(p)) {
          properties.push({
            name: p,
            tweens: normalizePropertyTweens(params[p], tweenSettings)
          });
        }
      }
      return properties;
    }

    // Tweens

    function normalizeTweenValues(tween, animatable) {
      var t = {};
      for (var p in tween) {
        var value = getFunctionValue(tween[p], animatable);
        if (is.arr(value)) {
          value = value.map(function (v) { return getFunctionValue(v, animatable); });
          if (value.length === 1) { value = value[0]; }
        }
        t[p] = value;
      }
      t.duration = parseFloat(t.duration);
      t.delay = parseFloat(t.delay);
      return t;
    }

    function normalizeTweens(prop, animatable) {
      var previousTween;
      return prop.tweens.map(function (t) {
        var tween = normalizeTweenValues(t, animatable);
        var tweenValue = tween.value;
        var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
        var toUnit = getUnit(to);
        var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
        var previousValue = previousTween ? previousTween.to.original : originalValue;
        var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
        var fromUnit = getUnit(from) || getUnit(originalValue);
        var unit = toUnit || fromUnit;
        if (is.und(to)) { to = previousValue; }
        tween.from = decomposeValue(from, unit);
        tween.to = decomposeValue(getRelativeValue(to, from), unit);
        tween.start = previousTween ? previousTween.end : 0;
        tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
        tween.easing = parseEasings(tween.easing, tween.duration);
        tween.isPath = is.pth(tweenValue);
        tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
        tween.isColor = is.col(tween.from.original);
        if (tween.isColor) { tween.round = 1; }
        previousTween = tween;
        return tween;
      });
    }

    // Tween progress

    var setProgressValue = {
      css: function (t, p, v) { return t.style[p] = v; },
      attribute: function (t, p, v) { return t.setAttribute(p, v); },
      object: function (t, p, v) { return t[p] = v; },
      transform: function (t, p, v, transforms, manual) {
        transforms.list.set(p, v);
        if (p === transforms.last || manual) {
          var str = '';
          transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
          t.style.transform = str;
        }
      }
    };

    // Set Value helper

    function setTargetsValue(targets, properties) {
      var animatables = getAnimatables(targets);
      animatables.forEach(function (animatable) {
        for (var property in properties) {
          var value = getFunctionValue(properties[property], animatable);
          var target = animatable.target;
          var valueUnit = getUnit(value);
          var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
          var unit = valueUnit || getUnit(originalValue);
          var to = getRelativeValue(validateValue(value, unit), originalValue);
          var animType = getAnimationType(target, property);
          setProgressValue[animType](target, property, to, animatable.transforms, true);
        }
      });
    }

    // Animations

    function createAnimation(animatable, prop) {
      var animType = getAnimationType(animatable.target, prop.name);
      if (animType) {
        var tweens = normalizeTweens(prop, animatable);
        var lastTween = tweens[tweens.length - 1];
        return {
          type: animType,
          property: prop.name,
          animatable: animatable,
          tweens: tweens,
          duration: lastTween.end,
          delay: tweens[0].delay,
          endDelay: lastTween.endDelay
        }
      }
    }

    function getAnimations(animatables, properties) {
      return filterArray(flattenArray(animatables.map(function (animatable) {
        return properties.map(function (prop) {
          return createAnimation(animatable, prop);
        });
      })), function (a) { return !is.und(a); });
    }

    // Create Instance

    function getInstanceTimings(animations, tweenSettings) {
      var animLength = animations.length;
      var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
      var timings = {};
      timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
      timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
      timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
      return timings;
    }

    var instanceID = 0;

    function createNewInstance(params) {
      var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
      var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
      var properties = getProperties(tweenSettings, params);
      var animatables = getAnimatables(params.targets);
      var animations = getAnimations(animatables, properties);
      var timings = getInstanceTimings(animations, tweenSettings);
      var id = instanceID;
      instanceID++;
      return mergeObjects(instanceSettings, {
        id: id,
        children: [],
        animatables: animatables,
        animations: animations,
        duration: timings.duration,
        delay: timings.delay,
        endDelay: timings.endDelay
      });
    }

    // Core

    var activeInstances = [];

    var engine = (function () {
      var raf;

      function play() {
        if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) {
          raf = requestAnimationFrame(step);
        }
      }
      function step(t) {
        // memo on algorithm issue:
        // dangerous iteration over mutable `activeInstances`
        // (that collection may be updated from within callbacks of `tick`-ed animation instances)
        var activeInstancesLength = activeInstances.length;
        var i = 0;
        while (i < activeInstancesLength) {
          var activeInstance = activeInstances[i];
          if (!activeInstance.paused) {
            activeInstance.tick(t);
            i++;
          } else {
            activeInstances.splice(i, 1);
            activeInstancesLength--;
          }
        }
        raf = i > 0 ? requestAnimationFrame(step) : undefined;
      }

      function handleVisibilityChange() {
        if (!anime.suspendWhenDocumentHidden) { return; }

        if (isDocumentHidden()) {
          // suspend ticks
          raf = cancelAnimationFrame(raf);
        } else { // is back to active tab
          // first adjust animations to consider the time that ticks were suspended
          activeInstances.forEach(
            function (instance) { return instance ._onDocumentVisibility(); }
          );
          engine();
        }
      }
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }

      return play;
    })();

    function isDocumentHidden() {
      return !!document && document.hidden;
    }

    // Public Instance

    function anime(params) {
      if ( params === void 0 ) params = {};


      var startTime = 0, lastTime = 0, now = 0;
      var children, childrenLength = 0;
      var resolve = null;

      function makePromise(instance) {
        var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
        instance.finished = promise;
        return promise;
      }

      var instance = createNewInstance(params);
      makePromise(instance);

      function toggleInstanceDirection() {
        var direction = instance.direction;
        if (direction !== 'alternate') {
          instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
        }
        instance.reversed = !instance.reversed;
        children.forEach(function (child) { return child.reversed = instance.reversed; });
      }

      function adjustTime(time) {
        return instance.reversed ? instance.duration - time : time;
      }

      function resetTime() {
        startTime = 0;
        lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
      }

      function seekChild(time, child) {
        if (child) { child.seek(time - child.timelineOffset); }
      }

      function syncInstanceChildren(time) {
        if (!instance.reversePlayback) {
          for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
        } else {
          for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
        }
      }

      function setAnimationsProgress(insTime) {
        var i = 0;
        var animations = instance.animations;
        var animationsLength = animations.length;
        while (i < animationsLength) {
          var anim = animations[i];
          var animatable = anim.animatable;
          var tweens = anim.tweens;
          var tweenLength = tweens.length - 1;
          var tween = tweens[tweenLength];
          // Only check for keyframes if there is more than one tween
          if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
          var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
          var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
          var strings = tween.to.strings;
          var round = tween.round;
          var numbers = [];
          var toNumbersLength = tween.to.numbers.length;
          var progress = (void 0);
          for (var n = 0; n < toNumbersLength; n++) {
            var value = (void 0);
            var toNumber = tween.to.numbers[n];
            var fromNumber = tween.from.numbers[n] || 0;
            if (!tween.isPath) {
              value = fromNumber + (eased * (toNumber - fromNumber));
            } else {
              value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
            }
            if (round) {
              if (!(tween.isColor && n > 2)) {
                value = Math.round(value * round) / round;
              }
            }
            numbers.push(value);
          }
          // Manual Array.reduce for better performances
          var stringsLength = strings.length;
          if (!stringsLength) {
            progress = numbers[0];
          } else {
            progress = strings[0];
            for (var s = 0; s < stringsLength; s++) {
              strings[s];
              var b = strings[s + 1];
              var n$1 = numbers[s];
              if (!isNaN(n$1)) {
                if (!b) {
                  progress += n$1 + ' ';
                } else {
                  progress += n$1 + b;
                }
              }
            }
          }
          setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
          anim.currentValue = progress;
          i++;
        }
      }

      function setCallback(cb) {
        if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
      }

      function countIteration() {
        if (instance.remaining && instance.remaining !== true) {
          instance.remaining--;
        }
      }

      function setInstanceProgress(engineTime) {
        var insDuration = instance.duration;
        var insDelay = instance.delay;
        var insEndDelay = insDuration - instance.endDelay;
        var insTime = adjustTime(engineTime);
        instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
        instance.reversePlayback = insTime < instance.currentTime;
        if (children) { syncInstanceChildren(insTime); }
        if (!instance.began && instance.currentTime > 0) {
          instance.began = true;
          setCallback('begin');
        }
        if (!instance.loopBegan && instance.currentTime > 0) {
          instance.loopBegan = true;
          setCallback('loopBegin');
        }
        if (insTime <= insDelay && instance.currentTime !== 0) {
          setAnimationsProgress(0);
        }
        if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
          setAnimationsProgress(insDuration);
        }
        if (insTime > insDelay && insTime < insEndDelay) {
          if (!instance.changeBegan) {
            instance.changeBegan = true;
            instance.changeCompleted = false;
            setCallback('changeBegin');
          }
          setCallback('change');
          setAnimationsProgress(insTime);
        } else {
          if (instance.changeBegan) {
            instance.changeCompleted = true;
            instance.changeBegan = false;
            setCallback('changeComplete');
          }
        }
        instance.currentTime = minMax(insTime, 0, insDuration);
        if (instance.began) { setCallback('update'); }
        if (engineTime >= insDuration) {
          lastTime = 0;
          countIteration();
          if (!instance.remaining) {
            instance.paused = true;
            if (!instance.completed) {
              instance.completed = true;
              setCallback('loopComplete');
              setCallback('complete');
              if (!instance.passThrough && 'Promise' in window) {
                resolve();
                makePromise(instance);
              }
            }
          } else {
            startTime = now;
            setCallback('loopComplete');
            instance.loopBegan = false;
            if (instance.direction === 'alternate') {
              toggleInstanceDirection();
            }
          }
        }
      }

      instance.reset = function() {
        var direction = instance.direction;
        instance.passThrough = false;
        instance.currentTime = 0;
        instance.progress = 0;
        instance.paused = true;
        instance.began = false;
        instance.loopBegan = false;
        instance.changeBegan = false;
        instance.completed = false;
        instance.changeCompleted = false;
        instance.reversePlayback = false;
        instance.reversed = direction === 'reverse';
        instance.remaining = instance.loop;
        children = instance.children;
        childrenLength = children.length;
        for (var i = childrenLength; i--;) { instance.children[i].reset(); }
        if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
        setAnimationsProgress(instance.reversed ? instance.duration : 0);
      };

      // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
      instance._onDocumentVisibility = resetTime;

      // Set Value helper

      instance.set = function(targets, properties) {
        setTargetsValue(targets, properties);
        return instance;
      };

      instance.tick = function(t) {
        now = t;
        if (!startTime) { startTime = now; }
        setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
      };

      instance.seek = function(time) {
        setInstanceProgress(adjustTime(time));
      };

      instance.pause = function() {
        instance.paused = true;
        resetTime();
      };

      instance.play = function() {
        if (!instance.paused) { return; }
        if (instance.completed) { instance.reset(); }
        instance.paused = false;
        activeInstances.push(instance);
        resetTime();
        engine();
      };

      instance.reverse = function() {
        toggleInstanceDirection();
        instance.completed = instance.reversed ? false : true;
        resetTime();
      };

      instance.restart = function() {
        instance.reset();
        instance.play();
      };

      instance.remove = function(targets) {
        var targetsArray = parseTargets(targets);
        removeTargetsFromInstance(targetsArray, instance);
      };

      instance.reset();

      if (instance.autoplay) { instance.play(); }

      return instance;

    }

    // Remove targets from animation

    function removeTargetsFromAnimations(targetsArray, animations) {
      for (var a = animations.length; a--;) {
        if (arrayContains(targetsArray, animations[a].animatable.target)) {
          animations.splice(a, 1);
        }
      }
    }

    function removeTargetsFromInstance(targetsArray, instance) {
      var animations = instance.animations;
      var children = instance.children;
      removeTargetsFromAnimations(targetsArray, animations);
      for (var c = children.length; c--;) {
        var child = children[c];
        var childAnimations = child.animations;
        removeTargetsFromAnimations(targetsArray, childAnimations);
        if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
      }
      if (!animations.length && !children.length) { instance.pause(); }
    }

    function removeTargetsFromActiveInstances(targets) {
      var targetsArray = parseTargets(targets);
      for (var i = activeInstances.length; i--;) {
        var instance = activeInstances[i];
        removeTargetsFromInstance(targetsArray, instance);
      }
    }

    // Stagger helpers

    function stagger(val, params) {
      if ( params === void 0 ) params = {};

      var direction = params.direction || 'normal';
      var easing = params.easing ? parseEasings(params.easing) : null;
      var grid = params.grid;
      var axis = params.axis;
      var fromIndex = params.from || 0;
      var fromFirst = fromIndex === 'first';
      var fromCenter = fromIndex === 'center';
      var fromLast = fromIndex === 'last';
      var isRange = is.arr(val);
      var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
      var val2 = isRange ? parseFloat(val[1]) : 0;
      var unit = getUnit(isRange ? val[1] : val) || 0;
      var start = params.start || 0 + (isRange ? val1 : 0);
      var values = [];
      var maxValue = 0;
      return function (el, i, t) {
        if (fromFirst) { fromIndex = 0; }
        if (fromCenter) { fromIndex = (t - 1) / 2; }
        if (fromLast) { fromIndex = t - 1; }
        if (!values.length) {
          for (var index = 0; index < t; index++) {
            if (!grid) {
              values.push(Math.abs(fromIndex - index));
            } else {
              var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
              var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
              var toX = index%grid[0];
              var toY = Math.floor(index/grid[0]);
              var distanceX = fromX - toX;
              var distanceY = fromY - toY;
              var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              if (axis === 'x') { value = -distanceX; }
              if (axis === 'y') { value = -distanceY; }
              values.push(value);
            }
            maxValue = Math.max.apply(Math, values);
          }
          if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
          if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
        }
        var spacing = isRange ? (val2 - val1) / maxValue : val1;
        return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
      }
    }

    // Timeline

    function timeline(params) {
      if ( params === void 0 ) params = {};

      var tl = anime(params);
      tl.duration = 0;
      tl.add = function(instanceParams, timelineOffset) {
        var tlIndex = activeInstances.indexOf(tl);
        var children = tl.children;
        if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
        function passThrough(ins) { ins.passThrough = true; }
        for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
        var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
        insParams.targets = insParams.targets || params.targets;
        var tlDuration = tl.duration;
        insParams.autoplay = false;
        insParams.direction = tl.direction;
        insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
        passThrough(tl);
        tl.seek(insParams.timelineOffset);
        var ins = anime(insParams);
        passThrough(ins);
        children.push(ins);
        var timings = getInstanceTimings(children, params);
        tl.delay = timings.delay;
        tl.endDelay = timings.endDelay;
        tl.duration = timings.duration;
        tl.seek(0);
        tl.reset();
        if (tl.autoplay) { tl.play(); }
        return tl;
      };
      return tl;
    }

    anime.version = '3.2.1';
    anime.speed = 1;
    // TODO:#review: naming, documentation
    anime.suspendWhenDocumentHidden = true;
    anime.running = activeInstances;
    anime.remove = removeTargetsFromActiveInstances;
    anime.get = getOriginalTargetValue;
    anime.set = setTargetsValue;
    anime.convertPx = convertPxToUnit;
    anime.path = getPath$1;
    anime.setDashoffset = setDashoffset;
    anime.stagger = stagger;
    anime.timeline = timeline;
    anime.easing = parseEasings;
    anime.penner = penner;
    anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

    /* src\Navbar.svelte generated by Svelte v3.48.0 */
    const file$b = "src\\Navbar.svelte";

    function create_fragment$b(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let nav0;
    	let a0;
    	let t3;
    	let nav1;
    	let a1;
    	let t5;
    	let nav2;
    	let a2;
    	let t7;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "TRIPPMEDIA.TECH";
    			t1 = space();
    			div1 = element("div");
    			nav0 = element("nav");
    			a0 = element("a");
    			a0.textContent = "HOME.";
    			t3 = space();
    			nav1 = element("nav");
    			a1 = element("a");
    			a1.textContent = "PROJECTS.";
    			t5 = space();
    			nav2 = element("nav");
    			a2 = element("a");
    			a2.textContent = "MEDIA.";
    			t7 = space();
    			div2 = element("div");
    			add_location(h1, file$b, 16, 6, 414);
    			attr_dev(div0, "class", "header-heading-container svelte-cnkm5t");
    			add_location(div0, file$b, 15, 4, 368);
    			attr_dev(a0, "href", "#home");
    			add_location(a0, file$b, 19, 28, 523);
    			attr_dev(nav0, "class", "nav-item");
    			add_location(nav0, file$b, 19, 6, 501);
    			attr_dev(a1, "href", "#projects");
    			add_location(a1, file$b, 20, 28, 584);
    			attr_dev(nav1, "class", "nav-item");
    			add_location(nav1, file$b, 20, 6, 562);
    			attr_dev(a2, "href", "#media");
    			add_location(a2, file$b, 21, 28, 653);
    			attr_dev(nav2, "class", "nav-item");
    			add_location(nav2, file$b, 21, 6, 631);
    			attr_dev(div1, "class", "header-center-container svelte-cnkm5t");
    			add_location(div1, file$b, 18, 4, 456);
    			attr_dev(div2, "class", "header-end-container svelte-cnkm5t");
    			add_location(div2, file$b, 23, 4, 704);
    			attr_dev(div3, "class", "trippmedia-header svelte-cnkm5t");
    			add_location(div3, file$b, 14, 2, 331);
    			attr_dev(div4, "id", "nav-bar");
    			attr_dev(div4, "class", "svelte-cnkm5t");
    			add_location(div4, file$b, 13, 0, 309);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, nav0);
    			append_dev(nav0, a0);
    			append_dev(div1, t3);
    			append_dev(div1, nav1);
    			append_dev(nav1, a1);
    			append_dev(div1, t5);
    			append_dev(div1, nav2);
    			append_dev(nav2, a2);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let scrollPos;
    	let viewHeight;
    	let changeBG = false;
    	let runAnim = true;

    	onMount(() => {
    		anime.set("div#nav-bar", { opacity: 0 });

    		anime({
    			targets: "div#nav-bar",
    			duration: 2000,
    			opacity: 1
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		anime,
    		onMount,
    		scrollPos,
    		viewHeight,
    		changeBG,
    		runAnim
    	});

    	$$self.$inject_state = $$props => {
    		if ('scrollPos' in $$props) scrollPos = $$props.scrollPos;
    		if ('viewHeight' in $$props) viewHeight = $$props.viewHeight;
    		if ('changeBG' in $$props) changeBG = $$props.changeBG;
    		if ('runAnim' in $$props) runAnim = $$props.runAnim;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\Projects.svelte generated by Svelte v3.48.0 */
    const file$a = "src\\Projects.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (57:10) {#each project.tech as tech}
    function create_each_block_1(ctx) {
    	let div;
    	let t_value = /*tech*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tech-item-container svelte-nlx174");
    			add_location(div, file$a, 57, 12, 1999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(57:10) {#each project.tech as tech}",
    		ctx
    	});

    	return block;
    }

    // (67:10) {#if project.liveLink}
    function create_if_block_1$1(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("live");
    			attr_dev(a, "href", /*project*/ ctx[3].liveLink);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			add_location(a, file$a, 67, 10, 2309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(67:10) {#if project.liveLink}",
    		ctx
    	});

    	return block;
    }

    // (72:10) {#if project.liveLink && project.gitLink}
    function create_if_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("||");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(72:10) {#if project.liveLink && project.gitLink}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#each projects as project, index}
    function create_each_block$3(ctx) {
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let h2;
    	let t1_value = /*project*/ ctx[3].name + "";
    	let t1;
    	let t2;
    	let span0;
    	let t3;
    	let div2;
    	let span1;
    	let t4_value = /*project*/ ctx[3].description + "";
    	let t4;
    	let t5;
    	let span2;
    	let br0;
    	let t6;
    	let br1;
    	let t7;
    	let t8;
    	let t9;
    	let a;
    	let t10;
    	let t11;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*project*/ ctx[3].tech;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block0 = /*project*/ ctx[3].liveLink && create_if_block_1$1(ctx);
    	let if_block1 = /*project*/ ctx[3].liveLink && /*project*/ ctx[3].gitLink && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			span0 = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div2 = element("div");
    			span1 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span2 = element("span");
    			br0 = element("br");
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			a = element("a");
    			t10 = text("git");
    			t11 = space();
    			attr_dev(div0, "class", "animeTarget");
    			add_location(div0, file$a, 46, 4, 1632);
    			attr_dev(h2, "class", "heading-project svelte-nlx174");
    			add_location(h2, file$a, 54, 8, 1859);
    			attr_dev(span0, "class", "tech-container svelte-nlx174");
    			add_location(span0, file$a, 55, 8, 1916);
    			attr_dev(div1, "class", "container-left svelte-nlx174");
    			add_location(div1, file$a, 53, 6, 1821);
    			add_location(span1, file$a, 62, 8, 2141);
    			add_location(br0, file$a, 64, 10, 2227);
    			add_location(br1, file$a, 65, 10, 2245);
    			attr_dev(a, "href", /*project*/ ctx[3].gitLink);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			add_location(a, file$a, 74, 10, 2525);
    			attr_dev(span2, "class", "links-container svelte-nlx174");
    			add_location(span2, file$a, 63, 8, 2185);
    			attr_dev(div2, "class", "container-right svelte-nlx174");
    			add_location(div2, file$a, 61, 6, 2102);
    			attr_dev(div3, "class", "project-container-box svelte-nlx174");
    			attr_dev(div3, "id", "project-" + /*index*/ ctx[5]);
    			add_location(div3, file$a, 47, 4, 1665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			append_dev(div1, span0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span0, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    			append_dev(span1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, span2);
    			append_dev(span2, br0);
    			append_dev(span2, t6);
    			append_dev(span2, br1);
    			append_dev(span2, t7);
    			if (if_block0) if_block0.m(span2, null);
    			append_dev(span2, t8);
    			if (if_block1) if_block1.m(span2, null);
    			append_dev(span2, t9);
    			append_dev(span2, a);
    			append_dev(a, t10);
    			append_dev(div3, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "mouseenter", /*projectEnter*/ ctx[1], false, false, false),
    					listen_dev(div3, "mouseleave", /*projectLeave*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projects*/ 1) {
    				each_value_1 = /*project*/ ctx[3].tech;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*project*/ ctx[3].liveLink) if_block0.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(46:2) {#each projects as project, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let h1;
    	let span;
    	let t1;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			span = element("span");
    			span.textContent = "PROJECTS";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(span, file$a, 44, 31, 1562);
    			attr_dev(h1, "class", "projects-heading svelte-nlx174");
    			add_location(h1, file$a, 44, 2, 1533);
    			attr_dev(div, "class", "projects-container svelte-nlx174");
    			attr_dev(div, "id", "projects");
    			add_location(div, file$a, 43, 0, 1483);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, span);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projectEnter, projectLeave, projects*/ 7) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);

    	const projects = [
    		{
    			name: "Tunnel Vision",
    			description: "An Audio visualizer featuring a 3D tunnel made up of continously changing lines, featuring 4 songs by me to choose from.",
    			liveLink: "https://trippwastaken.github.io/music-visualizer/",
    			gitLink: "https://github.com/TrippWasTaken/music-visualizer",
    			tech: ["Svelte", "Web Audio API", "ThreeJS", "SCSS"]
    		},
    		{
    			name: "Personal Portfolio",
    			description: "My own personal site that you are currently viewing, here I show off any projects from all the creative fields I practice",
    			liveLink: "https://trippmedia.tech/",
    			gitLink: "https://github.com/TrippWasTaken/trippwastaken.github.io",
    			tech: ["Svelte", "AnimeJS", "SCSS"]
    		},
    		{
    			name: "React clipping tool",
    			description: "An ongoing attempt to create a small clipping tool so I dont have to open davinci resolve everytime I want to show the boys something cool I did in apex legends, Its build in React using DaisyUI ontop of TailwindCSS",
    			gitLink: 'https://github.com/TrippWasTaken/Video-editor',
    			tech: ["React", "TailwindCSS", "Web Audio API", "WasmFFMPEG"]
    		}
    	];

    	const projectEnter = e => {
    		anime({ targets: e.target, scale: 1.1 });
    	};

    	const projectLeave = e => {
    		anime({ targets: e.target, scale: 1 });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		anime,
    		projects,
    		projectEnter,
    		projectLeave
    	});

    	return [projects, projectEnter, projectLeave];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\CircleHover.svelte generated by Svelte v3.48.0 */
    const file$9 = "src\\CircleHover.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "id", "images-banner");
    			if (!src_url_equal(img.src, img_src_value = /*images*/ ctx[1][/*currIndex*/ ctx[0]])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "images");
    			attr_dev(img, "class", "svelte-1477ue1");
    			add_location(img, file$9, 40, 2, 842);
    			attr_dev(div, "class", "banner-circle-hover-container  svelte-1477ue1");
    			add_location(div, file$9, 39, 0, 794);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currIndex*/ 1 && !src_url_equal(img.src, img_src_value = /*images*/ ctx[1][/*currIndex*/ ctx[0]])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CircleHover', slots, []);
    	let { show } = $$props;
    	let currIndex = 0;

    	const images = [
    		"/images/1.jpg",
    		"/images/2.jpg",
    		"/images/3.jpg",
    		"/images/4.jpg",
    		"/images/5.jpg"
    	];

    	const setIndex = () => {
    		$$invalidate(0, currIndex += 1);

    		if (currIndex > 4) {
    			$$invalidate(0, currIndex = 0);
    		}
    	};

    	onMount(() => {
    		setInterval(setIndex, 2000);
    		anime.set("div.banner-circle-hover-container", { opacity: 0 });
    	});

    	const writable_props = ['show'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CircleHover> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(2, show = $$props.show);
    	};

    	$$self.$capture_state = () => ({
    		anime,
    		onMount,
    		show,
    		currIndex,
    		images,
    		setIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('show' in $$props) $$invalidate(2, show = $$props.show);
    		if ('currIndex' in $$props) $$invalidate(0, currIndex = $$props.currIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show*/ 4) {
    			{
    				if (show) {
    					anime({
    						targets: "div.banner-circle-hover-container",
    						opacity: 1
    					});
    				} else {
    					anime({
    						targets: "div.banner-circle-hover-container",
    						opacity: 0
    					});
    				}
    			}
    		}
    	};

    	return [currIndex, images, show];
    }

    class CircleHover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { show: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CircleHover",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*show*/ ctx[2] === undefined && !('show' in props)) {
    			console.warn("<CircleHover> was created without expected prop 'show'");
    		}
    	}

    	get show() {
    		throw new Error("<CircleHover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<CircleHover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const matchName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const iconDefaults = Object.freeze({
      left: 0,
      top: 0,
      width: 16,
      height: 16,
      rotate: 0,
      vFlip: false,
      hFlip: false
    });
    function fullIcon(data) {
      return { ...iconDefaults, ...data };
    }

    const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
      const colonSeparated = value.split(":");
      if (value.slice(0, 1) === "@") {
        if (colonSeparated.length < 2 || colonSeparated.length > 3) {
          return null;
        }
        provider = colonSeparated.shift().slice(1);
      }
      if (colonSeparated.length > 3 || !colonSeparated.length) {
        return null;
      }
      if (colonSeparated.length > 1) {
        const name2 = colonSeparated.pop();
        const prefix = colonSeparated.pop();
        const result = {
          provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
          prefix,
          name: name2
        };
        return validate && !validateIcon(result) ? null : result;
      }
      const name = colonSeparated[0];
      const dashSeparated = name.split("-");
      if (dashSeparated.length > 1) {
        const result = {
          provider,
          prefix: dashSeparated.shift(),
          name: dashSeparated.join("-")
        };
        return validate && !validateIcon(result) ? null : result;
      }
      if (allowSimpleName && provider === "") {
        const result = {
          provider,
          prefix: "",
          name
        };
        return validate && !validateIcon(result, allowSimpleName) ? null : result;
      }
      return null;
    };
    const validateIcon = (icon, allowSimpleName) => {
      if (!icon) {
        return false;
      }
      return !!((icon.provider === "" || icon.provider.match(matchName)) && (allowSimpleName && icon.prefix === "" || icon.prefix.match(matchName)) && icon.name.match(matchName));
    };

    function mergeIconData(icon, alias) {
      const result = { ...icon };
      for (const key in iconDefaults) {
        const prop = key;
        if (alias[prop] !== void 0) {
          const value = alias[prop];
          if (result[prop] === void 0) {
            result[prop] = value;
            continue;
          }
          switch (prop) {
            case "rotate":
              result[prop] = (result[prop] + value) % 4;
              break;
            case "hFlip":
            case "vFlip":
              result[prop] = value !== result[prop];
              break;
            default:
              result[prop] = value;
          }
        }
      }
      return result;
    }

    function getIconData$1(data, name, full = false) {
      function getIcon(name2, iteration) {
        if (data.icons[name2] !== void 0) {
          return Object.assign({}, data.icons[name2]);
        }
        if (iteration > 5) {
          return null;
        }
        const aliases = data.aliases;
        if (aliases && aliases[name2] !== void 0) {
          const item = aliases[name2];
          const result2 = getIcon(item.parent, iteration + 1);
          if (result2) {
            return mergeIconData(result2, item);
          }
          return result2;
        }
        const chars = data.chars;
        if (!iteration && chars && chars[name2] !== void 0) {
          return getIcon(chars[name2], iteration + 1);
        }
        return null;
      }
      const result = getIcon(name, 0);
      if (result) {
        for (const key in iconDefaults) {
          if (result[key] === void 0 && data[key] !== void 0) {
            result[key] = data[key];
          }
        }
      }
      return result && full ? fullIcon(result) : result;
    }

    function isVariation(item) {
      for (const key in iconDefaults) {
        if (item[key] !== void 0) {
          return true;
        }
      }
      return false;
    }
    function parseIconSet(data, callback, options) {
      options = options || {};
      const names = [];
      if (typeof data !== "object" || typeof data.icons !== "object") {
        return names;
      }
      if (data.not_found instanceof Array) {
        data.not_found.forEach((name) => {
          callback(name, null);
          names.push(name);
        });
      }
      const icons = data.icons;
      Object.keys(icons).forEach((name) => {
        const iconData = getIconData$1(data, name, true);
        if (iconData) {
          callback(name, iconData);
          names.push(name);
        }
      });
      const parseAliases = options.aliases || "all";
      if (parseAliases !== "none" && typeof data.aliases === "object") {
        const aliases = data.aliases;
        Object.keys(aliases).forEach((name) => {
          if (parseAliases === "variations" && isVariation(aliases[name])) {
            return;
          }
          const iconData = getIconData$1(data, name, true);
          if (iconData) {
            callback(name, iconData);
            names.push(name);
          }
        });
      }
      return names;
    }

    const optionalProperties = {
      provider: "string",
      aliases: "object",
      not_found: "object"
    };
    for (const prop in iconDefaults) {
      optionalProperties[prop] = typeof iconDefaults[prop];
    }
    function quicklyValidateIconSet(obj) {
      if (typeof obj !== "object" || obj === null) {
        return null;
      }
      const data = obj;
      if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
        return null;
      }
      for (const prop in optionalProperties) {
        if (obj[prop] !== void 0 && typeof obj[prop] !== optionalProperties[prop]) {
          return null;
        }
      }
      const icons = data.icons;
      for (const name in icons) {
        const icon = icons[name];
        if (!name.match(matchName) || typeof icon.body !== "string") {
          return null;
        }
        for (const prop in iconDefaults) {
          if (icon[prop] !== void 0 && typeof icon[prop] !== typeof iconDefaults[prop]) {
            return null;
          }
        }
      }
      const aliases = data.aliases;
      if (aliases) {
        for (const name in aliases) {
          const icon = aliases[name];
          const parent = icon.parent;
          if (!name.match(matchName) || typeof parent !== "string" || !icons[parent] && !aliases[parent]) {
            return null;
          }
          for (const prop in iconDefaults) {
            if (icon[prop] !== void 0 && typeof icon[prop] !== typeof iconDefaults[prop]) {
              return null;
            }
          }
        }
      }
      return data;
    }

    const storageVersion = 1;
    let storage$1 = /* @__PURE__ */ Object.create(null);
    try {
      const w = window || self;
      if (w && w._iconifyStorage.version === storageVersion) {
        storage$1 = w._iconifyStorage.storage;
      }
    } catch (err) {
    }
    function shareStorage() {
      try {
        const w = window || self;
        if (w && !w._iconifyStorage) {
          w._iconifyStorage = {
            version: storageVersion,
            storage: storage$1
          };
        }
      } catch (err) {
      }
    }
    function newStorage(provider, prefix) {
      return {
        provider,
        prefix,
        icons: /* @__PURE__ */ Object.create(null),
        missing: /* @__PURE__ */ Object.create(null)
      };
    }
    function getStorage(provider, prefix) {
      if (storage$1[provider] === void 0) {
        storage$1[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerStorage = storage$1[provider];
      if (providerStorage[prefix] === void 0) {
        providerStorage[prefix] = newStorage(provider, prefix);
      }
      return providerStorage[prefix];
    }
    function addIconSet(storage2, data) {
      if (!quicklyValidateIconSet(data)) {
        return [];
      }
      const t = Date.now();
      return parseIconSet(data, (name, icon) => {
        if (icon) {
          storage2.icons[name] = icon;
        } else {
          storage2.missing[name] = t;
        }
      });
    }
    function addIconToStorage(storage2, name, icon) {
      try {
        if (typeof icon.body === "string") {
          storage2.icons[name] = Object.freeze(fullIcon(icon));
          return true;
        }
      } catch (err) {
      }
      return false;
    }
    function getIconFromStorage(storage2, name) {
      const value = storage2.icons[name];
      return value === void 0 ? null : value;
    }
    function listIcons(provider, prefix) {
      let allIcons = [];
      let providers;
      if (typeof provider === "string") {
        providers = [provider];
      } else {
        providers = Object.keys(storage$1);
      }
      providers.forEach((provider2) => {
        let prefixes;
        if (typeof provider2 === "string" && typeof prefix === "string") {
          prefixes = [prefix];
        } else {
          prefixes = storage$1[provider2] === void 0 ? [] : Object.keys(storage$1[provider2]);
        }
        prefixes.forEach((prefix2) => {
          const storage2 = getStorage(provider2, prefix2);
          const icons = Object.keys(storage2.icons).map((name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name);
          allIcons = allIcons.concat(icons);
        });
      });
      return allIcons;
    }

    let simpleNames = false;
    function allowSimpleNames(allow) {
      if (typeof allow === "boolean") {
        simpleNames = allow;
      }
      return simpleNames;
    }
    function getIconData(name) {
      const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
      return icon ? getIconFromStorage(getStorage(icon.provider, icon.prefix), icon.name) : null;
    }
    function addIcon(name, data) {
      const icon = stringToIcon(name, true, simpleNames);
      if (!icon) {
        return false;
      }
      const storage = getStorage(icon.provider, icon.prefix);
      return addIconToStorage(storage, icon.name, data);
    }
    function addCollection(data, provider) {
      if (typeof data !== "object") {
        return false;
      }
      if (typeof provider !== "string") {
        provider = typeof data.provider === "string" ? data.provider : "";
      }
      if (simpleNames && provider === "" && (typeof data.prefix !== "string" || data.prefix === "")) {
        let added = false;
        if (quicklyValidateIconSet(data)) {
          data.prefix = "";
          parseIconSet(data, (name, icon) => {
            if (icon && addIcon(name, icon)) {
              added = true;
            }
          });
        }
        return added;
      }
      if (typeof data.prefix !== "string" || !validateIcon({
        provider,
        prefix: data.prefix,
        name: "a"
      })) {
        return false;
      }
      const storage = getStorage(provider, data.prefix);
      return !!addIconSet(storage, data);
    }
    function iconExists(name) {
      return getIconData(name) !== null;
    }
    function getIcon(name) {
      const result = getIconData(name);
      return result ? { ...result } : null;
    }

    const defaults = Object.freeze({
      inline: false,
      width: null,
      height: null,
      hAlign: "center",
      vAlign: "middle",
      slice: false,
      hFlip: false,
      vFlip: false,
      rotate: 0
    });
    function mergeCustomisations(defaults2, item) {
      const result = {};
      for (const key in defaults2) {
        const attr = key;
        result[attr] = defaults2[attr];
        if (item[attr] === void 0) {
          continue;
        }
        const value = item[attr];
        switch (attr) {
          case "inline":
          case "slice":
            if (typeof value === "boolean") {
              result[attr] = value;
            }
            break;
          case "hFlip":
          case "vFlip":
            if (value === true) {
              result[attr] = !result[attr];
            }
            break;
          case "hAlign":
          case "vAlign":
            if (typeof value === "string" && value !== "") {
              result[attr] = value;
            }
            break;
          case "width":
          case "height":
            if (typeof value === "string" && value !== "" || typeof value === "number" && value || value === null) {
              result[attr] = value;
            }
            break;
          case "rotate":
            if (typeof value === "number") {
              result[attr] += value;
            }
            break;
        }
      }
      return result;
    }

    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    function calculateSize(size, ratio, precision) {
      if (ratio === 1) {
        return size;
      }
      precision = precision === void 0 ? 100 : precision;
      if (typeof size === "number") {
        return Math.ceil(size * ratio * precision) / precision;
      }
      if (typeof size !== "string") {
        return size;
      }
      const oldParts = size.split(unitsSplit);
      if (oldParts === null || !oldParts.length) {
        return size;
      }
      const newParts = [];
      let code = oldParts.shift();
      let isNumber = unitsTest.test(code);
      while (true) {
        if (isNumber) {
          const num = parseFloat(code);
          if (isNaN(num)) {
            newParts.push(code);
          } else {
            newParts.push(Math.ceil(num * ratio * precision) / precision);
          }
        } else {
          newParts.push(code);
        }
        code = oldParts.shift();
        if (code === void 0) {
          return newParts.join("");
        }
        isNumber = !isNumber;
      }
    }

    function preserveAspectRatio(props) {
      let result = "";
      switch (props.hAlign) {
        case "left":
          result += "xMin";
          break;
        case "right":
          result += "xMax";
          break;
        default:
          result += "xMid";
      }
      switch (props.vAlign) {
        case "top":
          result += "YMin";
          break;
        case "bottom":
          result += "YMax";
          break;
        default:
          result += "YMid";
      }
      result += props.slice ? " slice" : " meet";
      return result;
    }
    function iconToSVG(icon, customisations) {
      const box = {
        left: icon.left,
        top: icon.top,
        width: icon.width,
        height: icon.height
      };
      let body = icon.body;
      [icon, customisations].forEach((props) => {
        const transformations = [];
        const hFlip = props.hFlip;
        const vFlip = props.vFlip;
        let rotation = props.rotate;
        if (hFlip) {
          if (vFlip) {
            rotation += 2;
          } else {
            transformations.push("translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")");
            transformations.push("scale(-1 1)");
            box.top = box.left = 0;
          }
        } else if (vFlip) {
          transformations.push("translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")");
          transformations.push("scale(1 -1)");
          box.top = box.left = 0;
        }
        let tempValue;
        if (rotation < 0) {
          rotation -= Math.floor(rotation / 4) * 4;
        }
        rotation = rotation % 4;
        switch (rotation) {
          case 1:
            tempValue = box.height / 2 + box.top;
            transformations.unshift("rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")");
            break;
          case 2:
            transformations.unshift("rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")");
            break;
          case 3:
            tempValue = box.width / 2 + box.left;
            transformations.unshift("rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")");
            break;
        }
        if (rotation % 2 === 1) {
          if (box.left !== 0 || box.top !== 0) {
            tempValue = box.left;
            box.left = box.top;
            box.top = tempValue;
          }
          if (box.width !== box.height) {
            tempValue = box.width;
            box.width = box.height;
            box.height = tempValue;
          }
        }
        if (transformations.length) {
          body = '<g transform="' + transformations.join(" ") + '">' + body + "</g>";
        }
      });
      let width, height;
      if (customisations.width === null && customisations.height === null) {
        height = "1em";
        width = calculateSize(height, box.width / box.height);
      } else if (customisations.width !== null && customisations.height !== null) {
        width = customisations.width;
        height = customisations.height;
      } else if (customisations.height !== null) {
        height = customisations.height;
        width = calculateSize(height, box.width / box.height);
      } else {
        width = customisations.width;
        height = calculateSize(width, box.height / box.width);
      }
      if (width === "auto") {
        width = box.width;
      }
      if (height === "auto") {
        height = box.height;
      }
      width = typeof width === "string" ? width : width.toString() + "";
      height = typeof height === "string" ? height : height.toString() + "";
      const result = {
        attributes: {
          width,
          height,
          preserveAspectRatio: preserveAspectRatio(customisations),
          viewBox: box.left.toString() + " " + box.top.toString() + " " + box.width.toString() + " " + box.height.toString()
        },
        body
      };
      if (customisations.inline) {
        result.inline = true;
      }
      return result;
    }

    function buildIcon(icon, customisations) {
      return iconToSVG(fullIcon(icon), customisations ? mergeCustomisations(defaults, customisations) : defaults);
    }

    const regex = /\sid="(\S+)"/g;
    const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
    let counter = 0;
    function replaceIDs(body, prefix = randomPrefix) {
      const ids = [];
      let match;
      while (match = regex.exec(body)) {
        ids.push(match[1]);
      }
      if (!ids.length) {
        return body;
      }
      ids.forEach((id) => {
        const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
        const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        body = body.replace(new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"), "$1" + newID + "$3");
      });
      return body;
    }

    const storage = /* @__PURE__ */ Object.create(null);
    function setAPIModule(provider, item) {
      storage[provider] = item;
    }
    function getAPIModule(provider) {
      return storage[provider] || storage[""];
    }

    function createAPIConfig(source) {
      let resources;
      if (typeof source.resources === "string") {
        resources = [source.resources];
      } else {
        resources = source.resources;
        if (!(resources instanceof Array) || !resources.length) {
          return null;
        }
      }
      const result = {
        resources,
        path: source.path === void 0 ? "/" : source.path,
        maxURL: source.maxURL ? source.maxURL : 500,
        rotate: source.rotate ? source.rotate : 750,
        timeout: source.timeout ? source.timeout : 5e3,
        random: source.random === true,
        index: source.index ? source.index : 0,
        dataAfterTimeout: source.dataAfterTimeout !== false
      };
      return result;
    }
    const configStorage = /* @__PURE__ */ Object.create(null);
    const fallBackAPISources = [
      "https://api.simplesvg.com",
      "https://api.unisvg.com"
    ];
    const fallBackAPI = [];
    while (fallBackAPISources.length > 0) {
      if (fallBackAPISources.length === 1) {
        fallBackAPI.push(fallBackAPISources.shift());
      } else {
        if (Math.random() > 0.5) {
          fallBackAPI.push(fallBackAPISources.shift());
        } else {
          fallBackAPI.push(fallBackAPISources.pop());
        }
      }
    }
    configStorage[""] = createAPIConfig({
      resources: ["https://api.iconify.design"].concat(fallBackAPI)
    });
    function addAPIProvider(provider, customConfig) {
      const config = createAPIConfig(customConfig);
      if (config === null) {
        return false;
      }
      configStorage[provider] = config;
      return true;
    }
    function getAPIConfig(provider) {
      return configStorage[provider];
    }
    function listAPIProviders() {
      return Object.keys(configStorage);
    }

    const mergeParams = (base, params) => {
      let result = base, hasParams = result.indexOf("?") !== -1;
      function paramToString(value) {
        switch (typeof value) {
          case "boolean":
            return value ? "true" : "false";
          case "number":
            return encodeURIComponent(value);
          case "string":
            return encodeURIComponent(value);
          default:
            throw new Error("Invalid parameter");
        }
      }
      Object.keys(params).forEach((key) => {
        let value;
        try {
          value = paramToString(params[key]);
        } catch (err) {
          return;
        }
        result += (hasParams ? "&" : "?") + encodeURIComponent(key) + "=" + value;
        hasParams = true;
      });
      return result;
    };

    const maxLengthCache = {};
    const pathCache = {};
    const detectFetch = () => {
      let callback;
      try {
        callback = fetch;
        if (typeof callback === "function") {
          return callback;
        }
      } catch (err) {
      }
      return null;
    };
    let fetchModule = detectFetch();
    function setFetch(fetch2) {
      fetchModule = fetch2;
    }
    function getFetch() {
      return fetchModule;
    }
    function calculateMaxLength(provider, prefix) {
      const config = getAPIConfig(provider);
      if (!config) {
        return 0;
      }
      let result;
      if (!config.maxURL) {
        result = 0;
      } else {
        let maxHostLength = 0;
        config.resources.forEach((item) => {
          const host = item;
          maxHostLength = Math.max(maxHostLength, host.length);
        });
        const url = mergeParams(prefix + ".json", {
          icons: ""
        });
        result = config.maxURL - maxHostLength - config.path.length - url.length;
      }
      const cacheKey = provider + ":" + prefix;
      pathCache[provider] = config.path;
      maxLengthCache[cacheKey] = result;
      return result;
    }
    function shouldAbort(status) {
      return status === 404;
    }
    const prepare = (provider, prefix, icons) => {
      const results = [];
      let maxLength = maxLengthCache[prefix];
      if (maxLength === void 0) {
        maxLength = calculateMaxLength(provider, prefix);
      }
      const type = "icons";
      let item = {
        type,
        provider,
        prefix,
        icons: []
      };
      let length = 0;
      icons.forEach((name, index) => {
        length += name.length + 1;
        if (length >= maxLength && index > 0) {
          results.push(item);
          item = {
            type,
            provider,
            prefix,
            icons: []
          };
          length = name.length;
        }
        item.icons.push(name);
      });
      results.push(item);
      return results;
    };
    function getPath(provider) {
      if (typeof provider === "string") {
        if (pathCache[provider] === void 0) {
          const config = getAPIConfig(provider);
          if (!config) {
            return "/";
          }
          pathCache[provider] = config.path;
        }
        return pathCache[provider];
      }
      return "/";
    }
    const send = (host, params, callback) => {
      if (!fetchModule) {
        callback("abort", 424);
        return;
      }
      let path = getPath(params.provider);
      switch (params.type) {
        case "icons": {
          const prefix = params.prefix;
          const icons = params.icons;
          const iconsList = icons.join(",");
          path += mergeParams(prefix + ".json", {
            icons: iconsList
          });
          break;
        }
        case "custom": {
          const uri = params.uri;
          path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
          break;
        }
        default:
          callback("abort", 400);
          return;
      }
      let defaultError = 503;
      fetchModule(host + path).then((response) => {
        const status = response.status;
        if (status !== 200) {
          setTimeout(() => {
            callback(shouldAbort(status) ? "abort" : "next", status);
          });
          return;
        }
        defaultError = 501;
        return response.json();
      }).then((data) => {
        if (typeof data !== "object" || data === null) {
          setTimeout(() => {
            callback("next", defaultError);
          });
          return;
        }
        setTimeout(() => {
          callback("success", data);
        });
      }).catch(() => {
        callback("next", defaultError);
      });
    };
    const fetchAPIModule = {
      prepare,
      send
    };

    function sortIcons(icons) {
      const result = {
        loaded: [],
        missing: [],
        pending: []
      };
      const storage = /* @__PURE__ */ Object.create(null);
      icons.sort((a, b) => {
        if (a.provider !== b.provider) {
          return a.provider.localeCompare(b.provider);
        }
        if (a.prefix !== b.prefix) {
          return a.prefix.localeCompare(b.prefix);
        }
        return a.name.localeCompare(b.name);
      });
      let lastIcon = {
        provider: "",
        prefix: "",
        name: ""
      };
      icons.forEach((icon) => {
        if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
          return;
        }
        lastIcon = icon;
        const provider = icon.provider;
        const prefix = icon.prefix;
        const name = icon.name;
        if (storage[provider] === void 0) {
          storage[provider] = /* @__PURE__ */ Object.create(null);
        }
        const providerStorage = storage[provider];
        if (providerStorage[prefix] === void 0) {
          providerStorage[prefix] = getStorage(provider, prefix);
        }
        const localStorage = providerStorage[prefix];
        let list;
        if (localStorage.icons[name] !== void 0) {
          list = result.loaded;
        } else if (prefix === "" || localStorage.missing[name] !== void 0) {
          list = result.missing;
        } else {
          list = result.pending;
        }
        const item = {
          provider,
          prefix,
          name
        };
        list.push(item);
      });
      return result;
    }

    const callbacks = /* @__PURE__ */ Object.create(null);
    const pendingUpdates = /* @__PURE__ */ Object.create(null);
    function removeCallback(sources, id) {
      sources.forEach((source) => {
        const provider = source.provider;
        if (callbacks[provider] === void 0) {
          return;
        }
        const providerCallbacks = callbacks[provider];
        const prefix = source.prefix;
        const items = providerCallbacks[prefix];
        if (items) {
          providerCallbacks[prefix] = items.filter((row) => row.id !== id);
        }
      });
    }
    function updateCallbacks(provider, prefix) {
      if (pendingUpdates[provider] === void 0) {
        pendingUpdates[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerPendingUpdates = pendingUpdates[provider];
      if (!providerPendingUpdates[prefix]) {
        providerPendingUpdates[prefix] = true;
        setTimeout(() => {
          providerPendingUpdates[prefix] = false;
          if (callbacks[provider] === void 0 || callbacks[provider][prefix] === void 0) {
            return;
          }
          const items = callbacks[provider][prefix].slice(0);
          if (!items.length) {
            return;
          }
          const storage = getStorage(provider, prefix);
          let hasPending = false;
          items.forEach((item) => {
            const icons = item.icons;
            const oldLength = icons.pending.length;
            icons.pending = icons.pending.filter((icon) => {
              if (icon.prefix !== prefix) {
                return true;
              }
              const name = icon.name;
              if (storage.icons[name] !== void 0) {
                icons.loaded.push({
                  provider,
                  prefix,
                  name
                });
              } else if (storage.missing[name] !== void 0) {
                icons.missing.push({
                  provider,
                  prefix,
                  name
                });
              } else {
                hasPending = true;
                return true;
              }
              return false;
            });
            if (icons.pending.length !== oldLength) {
              if (!hasPending) {
                removeCallback([
                  {
                    provider,
                    prefix
                  }
                ], item.id);
              }
              item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
            }
          });
        });
      }
    }
    let idCounter = 0;
    function storeCallback(callback, icons, pendingSources) {
      const id = idCounter++;
      const abort = removeCallback.bind(null, pendingSources, id);
      if (!icons.pending.length) {
        return abort;
      }
      const item = {
        id,
        icons,
        callback,
        abort
      };
      pendingSources.forEach((source) => {
        const provider = source.provider;
        const prefix = source.prefix;
        if (callbacks[provider] === void 0) {
          callbacks[provider] = /* @__PURE__ */ Object.create(null);
        }
        const providerCallbacks = callbacks[provider];
        if (providerCallbacks[prefix] === void 0) {
          providerCallbacks[prefix] = [];
        }
        providerCallbacks[prefix].push(item);
      });
      return abort;
    }

    function listToIcons(list, validate = true, simpleNames = false) {
      const result = [];
      list.forEach((item) => {
        const icon = typeof item === "string" ? stringToIcon(item, false, simpleNames) : item;
        if (!validate || validateIcon(icon, simpleNames)) {
          result.push({
            provider: icon.provider,
            prefix: icon.prefix,
            name: icon.name
          });
        }
      });
      return result;
    }

    // src/config.ts
    var defaultConfig = {
      resources: [],
      index: 0,
      timeout: 2e3,
      rotate: 750,
      random: false,
      dataAfterTimeout: false
    };

    // src/query.ts
    function sendQuery(config, payload, query, done) {
      const resourcesCount = config.resources.length;
      const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
      let resources;
      if (config.random) {
        let list = config.resources.slice(0);
        resources = [];
        while (list.length > 1) {
          const nextIndex = Math.floor(Math.random() * list.length);
          resources.push(list[nextIndex]);
          list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
        }
        resources = resources.concat(list);
      } else {
        resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
      }
      const startTime = Date.now();
      let status = "pending";
      let queriesSent = 0;
      let lastError;
      let timer = null;
      let queue = [];
      let doneCallbacks = [];
      if (typeof done === "function") {
        doneCallbacks.push(done);
      }
      function resetTimer() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      function abort() {
        if (status === "pending") {
          status = "aborted";
        }
        resetTimer();
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function subscribe(callback, overwrite) {
        if (overwrite) {
          doneCallbacks = [];
        }
        if (typeof callback === "function") {
          doneCallbacks.push(callback);
        }
      }
      function getQueryStatus() {
        return {
          startTime,
          payload,
          status,
          queriesSent,
          queriesPending: queue.length,
          subscribe,
          abort
        };
      }
      function failQuery() {
        status = "failed";
        doneCallbacks.forEach((callback) => {
          callback(void 0, lastError);
        });
      }
      function clearQueue() {
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function moduleResponse(item, response, data) {
        const isError = response !== "success";
        queue = queue.filter((queued) => queued !== item);
        switch (status) {
          case "pending":
            break;
          case "failed":
            if (isError || !config.dataAfterTimeout) {
              return;
            }
            break;
          default:
            return;
        }
        if (response === "abort") {
          lastError = data;
          failQuery();
          return;
        }
        if (isError) {
          lastError = data;
          if (!queue.length) {
            if (!resources.length) {
              failQuery();
            } else {
              execNext();
            }
          }
          return;
        }
        resetTimer();
        clearQueue();
        if (!config.random) {
          const index = config.resources.indexOf(item.resource);
          if (index !== -1 && index !== config.index) {
            config.index = index;
          }
        }
        status = "completed";
        doneCallbacks.forEach((callback) => {
          callback(data);
        });
      }
      function execNext() {
        if (status !== "pending") {
          return;
        }
        resetTimer();
        const resource = resources.shift();
        if (resource === void 0) {
          if (queue.length) {
            timer = setTimeout(() => {
              resetTimer();
              if (status === "pending") {
                clearQueue();
                failQuery();
              }
            }, config.timeout);
            return;
          }
          failQuery();
          return;
        }
        const item = {
          status: "pending",
          resource,
          callback: (status2, data) => {
            moduleResponse(item, status2, data);
          }
        };
        queue.push(item);
        queriesSent++;
        timer = setTimeout(execNext, config.rotate);
        query(resource, payload, item.callback);
      }
      setTimeout(execNext);
      return getQueryStatus;
    }

    // src/index.ts
    function setConfig(config) {
      if (typeof config !== "object" || typeof config.resources !== "object" || !(config.resources instanceof Array) || !config.resources.length) {
        throw new Error("Invalid Reduncancy configuration");
      }
      const newConfig = /* @__PURE__ */ Object.create(null);
      let key;
      for (key in defaultConfig) {
        if (config[key] !== void 0) {
          newConfig[key] = config[key];
        } else {
          newConfig[key] = defaultConfig[key];
        }
      }
      return newConfig;
    }
    function initRedundancy(cfg) {
      const config = setConfig(cfg);
      let queries = [];
      function cleanup() {
        queries = queries.filter((item) => item().status === "pending");
      }
      function query(payload, queryCallback, doneCallback) {
        const query2 = sendQuery(config, payload, queryCallback, (data, error) => {
          cleanup();
          if (doneCallback) {
            doneCallback(data, error);
          }
        });
        queries.push(query2);
        return query2;
      }
      function find(callback) {
        const result = queries.find((value) => {
          return callback(value);
        });
        return result !== void 0 ? result : null;
      }
      const instance = {
        query,
        find,
        setIndex: (index) => {
          config.index = index;
        },
        getIndex: () => config.index,
        cleanup
      };
      return instance;
    }

    function emptyCallback$1() {
    }
    const redundancyCache = /* @__PURE__ */ Object.create(null);
    function getRedundancyCache(provider) {
      if (redundancyCache[provider] === void 0) {
        const config = getAPIConfig(provider);
        if (!config) {
          return;
        }
        const redundancy = initRedundancy(config);
        const cachedReundancy = {
          config,
          redundancy
        };
        redundancyCache[provider] = cachedReundancy;
      }
      return redundancyCache[provider];
    }
    function sendAPIQuery(target, query, callback) {
      let redundancy;
      let send;
      if (typeof target === "string") {
        const api = getAPIModule(target);
        if (!api) {
          callback(void 0, 424);
          return emptyCallback$1;
        }
        send = api.send;
        const cached = getRedundancyCache(target);
        if (cached) {
          redundancy = cached.redundancy;
        }
      } else {
        const config = createAPIConfig(target);
        if (config) {
          redundancy = initRedundancy(config);
          const moduleKey = target.resources ? target.resources[0] : "";
          const api = getAPIModule(moduleKey);
          if (api) {
            send = api.send;
          }
        }
      }
      if (!redundancy || !send) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      return redundancy.query(query, send, callback)().abort;
    }

    const cache = {};

    function emptyCallback() {
    }
    const pendingIcons = /* @__PURE__ */ Object.create(null);
    const iconsToLoad = /* @__PURE__ */ Object.create(null);
    const loaderFlags = /* @__PURE__ */ Object.create(null);
    const queueFlags = /* @__PURE__ */ Object.create(null);
    function loadedNewIcons(provider, prefix) {
      if (loaderFlags[provider] === void 0) {
        loaderFlags[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerLoaderFlags = loaderFlags[provider];
      if (!providerLoaderFlags[prefix]) {
        providerLoaderFlags[prefix] = true;
        setTimeout(() => {
          providerLoaderFlags[prefix] = false;
          updateCallbacks(provider, prefix);
        });
      }
    }
    const errorsCache = /* @__PURE__ */ Object.create(null);
    function loadNewIcons(provider, prefix, icons) {
      function err() {
        const key = (provider === "" ? "" : "@" + provider + ":") + prefix;
        const time = Math.floor(Date.now() / 6e4);
        if (errorsCache[key] < time) {
          errorsCache[key] = time;
          console.error('Unable to retrieve icons for "' + key + '" because API is not configured properly.');
        }
      }
      if (iconsToLoad[provider] === void 0) {
        iconsToLoad[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerIconsToLoad = iconsToLoad[provider];
      if (queueFlags[provider] === void 0) {
        queueFlags[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerQueueFlags = queueFlags[provider];
      if (pendingIcons[provider] === void 0) {
        pendingIcons[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerPendingIcons = pendingIcons[provider];
      if (providerIconsToLoad[prefix] === void 0) {
        providerIconsToLoad[prefix] = icons;
      } else {
        providerIconsToLoad[prefix] = providerIconsToLoad[prefix].concat(icons).sort();
      }
      if (!providerQueueFlags[prefix]) {
        providerQueueFlags[prefix] = true;
        setTimeout(() => {
          providerQueueFlags[prefix] = false;
          const icons2 = providerIconsToLoad[prefix];
          delete providerIconsToLoad[prefix];
          const api = getAPIModule(provider);
          if (!api) {
            err();
            return;
          }
          const params = api.prepare(provider, prefix, icons2);
          params.forEach((item) => {
            sendAPIQuery(provider, item, (data, error) => {
              const storage = getStorage(provider, prefix);
              if (typeof data !== "object") {
                if (error !== 404) {
                  return;
                }
                const t = Date.now();
                item.icons.forEach((name) => {
                  storage.missing[name] = t;
                });
              } else {
                try {
                  const parsed = addIconSet(storage, data);
                  if (!parsed.length) {
                    return;
                  }
                  const pending = providerPendingIcons[prefix];
                  parsed.forEach((name) => {
                    delete pending[name];
                  });
                  if (cache.store) {
                    cache.store(provider, data);
                  }
                } catch (err2) {
                  console.error(err2);
                }
              }
              loadedNewIcons(provider, prefix);
            });
          });
        });
      }
    }
    const loadIcons = (icons, callback) => {
      const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
      const sortedIcons = sortIcons(cleanedIcons);
      if (!sortedIcons.pending.length) {
        let callCallback = true;
        if (callback) {
          setTimeout(() => {
            if (callCallback) {
              callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
            }
          });
        }
        return () => {
          callCallback = false;
        };
      }
      const newIcons = /* @__PURE__ */ Object.create(null);
      const sources = [];
      let lastProvider, lastPrefix;
      sortedIcons.pending.forEach((icon) => {
        const provider = icon.provider;
        const prefix = icon.prefix;
        if (prefix === lastPrefix && provider === lastProvider) {
          return;
        }
        lastProvider = provider;
        lastPrefix = prefix;
        sources.push({
          provider,
          prefix
        });
        if (pendingIcons[provider] === void 0) {
          pendingIcons[provider] = /* @__PURE__ */ Object.create(null);
        }
        const providerPendingIcons = pendingIcons[provider];
        if (providerPendingIcons[prefix] === void 0) {
          providerPendingIcons[prefix] = /* @__PURE__ */ Object.create(null);
        }
        if (newIcons[provider] === void 0) {
          newIcons[provider] = /* @__PURE__ */ Object.create(null);
        }
        const providerNewIcons = newIcons[provider];
        if (providerNewIcons[prefix] === void 0) {
          providerNewIcons[prefix] = [];
        }
      });
      const time = Date.now();
      sortedIcons.pending.forEach((icon) => {
        const provider = icon.provider;
        const prefix = icon.prefix;
        const name = icon.name;
        const pendingQueue = pendingIcons[provider][prefix];
        if (pendingQueue[name] === void 0) {
          pendingQueue[name] = time;
          newIcons[provider][prefix].push(name);
        }
      });
      sources.forEach((source) => {
        const provider = source.provider;
        const prefix = source.prefix;
        if (newIcons[provider][prefix].length) {
          loadNewIcons(provider, prefix, newIcons[provider][prefix]);
        }
      });
      return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
    };
    const loadIcon = (icon) => {
      return new Promise((fulfill, reject) => {
        const iconObj = typeof icon === "string" ? stringToIcon(icon) : icon;
        loadIcons([iconObj || icon], (loaded) => {
          if (loaded.length && iconObj) {
            const storage = getStorage(iconObj.provider, iconObj.prefix);
            const data = getIconFromStorage(storage, iconObj.name);
            if (data) {
              fulfill(data);
              return;
            }
          }
          reject(icon);
        });
      });
    };

    const cacheVersion = "iconify2";
    const cachePrefix = "iconify";
    const countKey = cachePrefix + "-count";
    const versionKey = cachePrefix + "-version";
    const hour = 36e5;
    const cacheExpiration = 168;
    const config = {
      local: true,
      session: true
    };
    let loaded = false;
    const count = {
      local: 0,
      session: 0
    };
    const emptyList = {
      local: [],
      session: []
    };
    let _window = typeof window === "undefined" ? {} : window;
    function getGlobal(key) {
      const attr = key + "Storage";
      try {
        if (_window && _window[attr] && typeof _window[attr].length === "number") {
          return _window[attr];
        }
      } catch (err) {
      }
      config[key] = false;
      return null;
    }
    function setCount(storage, key, value) {
      try {
        storage.setItem(countKey, value.toString());
        count[key] = value;
        return true;
      } catch (err) {
        return false;
      }
    }
    function getCount(storage) {
      const count2 = storage.getItem(countKey);
      if (count2) {
        const total = parseInt(count2);
        return total ? total : 0;
      }
      return 0;
    }
    function initCache(storage, key) {
      try {
        storage.setItem(versionKey, cacheVersion);
      } catch (err) {
      }
      setCount(storage, key, 0);
    }
    function destroyCache(storage) {
      try {
        const total = getCount(storage);
        for (let i = 0; i < total; i++) {
          storage.removeItem(cachePrefix + i.toString());
        }
      } catch (err) {
      }
    }
    const loadCache = () => {
      if (loaded) {
        return;
      }
      loaded = true;
      const minTime = Math.floor(Date.now() / hour) - cacheExpiration;
      function load(key) {
        const func = getGlobal(key);
        if (!func) {
          return;
        }
        const getItem = (index) => {
          const name = cachePrefix + index.toString();
          const item = func.getItem(name);
          if (typeof item !== "string") {
            return false;
          }
          let valid = true;
          try {
            const data = JSON.parse(item);
            if (typeof data !== "object" || typeof data.cached !== "number" || data.cached < minTime || typeof data.provider !== "string" || typeof data.data !== "object" || typeof data.data.prefix !== "string") {
              valid = false;
            } else {
              const provider = data.provider;
              const prefix = data.data.prefix;
              const storage = getStorage(provider, prefix);
              valid = addIconSet(storage, data.data).length > 0;
            }
          } catch (err) {
            valid = false;
          }
          if (!valid) {
            func.removeItem(name);
          }
          return valid;
        };
        try {
          const version = func.getItem(versionKey);
          if (version !== cacheVersion) {
            if (version) {
              destroyCache(func);
            }
            initCache(func, key);
            return;
          }
          let total = getCount(func);
          for (let i = total - 1; i >= 0; i--) {
            if (!getItem(i)) {
              if (i === total - 1) {
                total--;
              } else {
                emptyList[key].push(i);
              }
            }
          }
          setCount(func, key, total);
        } catch (err) {
        }
      }
      for (const key in config) {
        load(key);
      }
    };
    const storeCache = (provider, data) => {
      if (!loaded) {
        loadCache();
      }
      function store(key) {
        if (!config[key]) {
          return false;
        }
        const func = getGlobal(key);
        if (!func) {
          return false;
        }
        let index = emptyList[key].shift();
        if (index === void 0) {
          index = count[key];
          if (!setCount(func, key, index + 1)) {
            return false;
          }
        }
        try {
          const item = {
            cached: Math.floor(Date.now() / hour),
            provider,
            data
          };
          func.setItem(cachePrefix + index.toString(), JSON.stringify(item));
        } catch (err) {
          return false;
        }
        return true;
      }
      if (!Object.keys(data.icons).length) {
        return;
      }
      if (data.not_found) {
        data = Object.assign({}, data);
        delete data.not_found;
      }
      if (!store("local")) {
        store("session");
      }
    };

    function toggleBrowserCache(storage, value) {
      switch (storage) {
        case "local":
        case "session":
          config[storage] = value;
          break;
        case "all":
          for (const key in config) {
            config[key] = value;
          }
          break;
      }
    }

    const separator = /[\s,]+/;
    function flipFromString(custom, flip) {
      flip.split(separator).forEach((str) => {
        const value = str.trim();
        switch (value) {
          case "horizontal":
            custom.hFlip = true;
            break;
          case "vertical":
            custom.vFlip = true;
            break;
        }
      });
    }
    function alignmentFromString(custom, align) {
      align.split(separator).forEach((str) => {
        const value = str.trim();
        switch (value) {
          case "left":
          case "center":
          case "right":
            custom.hAlign = value;
            break;
          case "top":
          case "middle":
          case "bottom":
            custom.vAlign = value;
            break;
          case "slice":
          case "crop":
            custom.slice = true;
            break;
          case "meet":
            custom.slice = false;
        }
      });
    }

    function rotateFromString(value, defaultValue = 0) {
      const units = value.replace(/^-?[0-9.]*/, "");
      function cleanup(value2) {
        while (value2 < 0) {
          value2 += 4;
        }
        return value2 % 4;
      }
      if (units === "") {
        const num = parseInt(value);
        return isNaN(num) ? 0 : cleanup(num);
      } else if (units !== value) {
        let split = 0;
        switch (units) {
          case "%":
            split = 25;
            break;
          case "deg":
            split = 90;
        }
        if (split) {
          let num = parseFloat(value.slice(0, value.length - units.length));
          if (isNaN(num)) {
            return 0;
          }
          num = num / split;
          return num % 1 === 0 ? cleanup(num) : 0;
        }
      }
      return defaultValue;
    }

    /**
     * Default SVG attributes
     */
    const svgDefaults = {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'aria-hidden': true,
        'role': 'img',
    };
    /**
     * Generate icon from properties
     */
    function render(
    // Icon must be validated before calling this function
    icon, 
    // Properties
    props) {
        const customisations = mergeCustomisations(defaults, props);
        const componentProps = { ...svgDefaults };
        // Create style if missing
        let style = typeof props.style === 'string' ? props.style : '';
        // Get element properties
        for (let key in props) {
            const value = props[key];
            if (value === void 0) {
                continue;
            }
            switch (key) {
                // Properties to ignore
                case 'icon':
                case 'style':
                case 'onLoad':
                    break;
                // Boolean attributes
                case 'inline':
                case 'hFlip':
                case 'vFlip':
                    customisations[key] =
                        value === true || value === 'true' || value === 1;
                    break;
                // Flip as string: 'horizontal,vertical'
                case 'flip':
                    if (typeof value === 'string') {
                        flipFromString(customisations, value);
                    }
                    break;
                // Alignment as string
                case 'align':
                    if (typeof value === 'string') {
                        alignmentFromString(customisations, value);
                    }
                    break;
                // Color: copy to style, add extra ';' in case style is missing it
                case 'color':
                    style =
                        style +
                            (style.length > 0 && style.trim().slice(-1) !== ';'
                                ? ';'
                                : '') +
                            'color: ' +
                            value +
                            '; ';
                    break;
                // Rotation as string
                case 'rotate':
                    if (typeof value === 'string') {
                        customisations[key] = rotateFromString(value);
                    }
                    else if (typeof value === 'number') {
                        customisations[key] = value;
                    }
                    break;
                // Remove aria-hidden
                case 'ariaHidden':
                case 'aria-hidden':
                    if (value !== true && value !== 'true') {
                        delete componentProps['aria-hidden'];
                    }
                    break;
                default:
                    if (key.slice(0, 3) === 'on:') {
                        // Svelte event
                        break;
                    }
                    // Copy missing property if it does not exist in customisations
                    if (defaults[key] === void 0) {
                        componentProps[key] = value;
                    }
            }
        }
        // Generate icon
        const item = iconToSVG(icon, customisations);
        // Add icon stuff
        for (let key in item.attributes) {
            componentProps[key] =
                item.attributes[key];
        }
        if (item.inline) {
            // Style overrides it
            style = 'vertical-align: -0.125em; ' + style;
        }
        // Style
        if (style !== '') {
            componentProps.style = style;
        }
        // Counter for ids based on "id" property to render icons consistently on server and client
        let localCounter = 0;
        let id = props.id;
        if (typeof id === 'string') {
            // Convert '-' to '_' to avoid errors in animations
            id = id.replace(/-/g, '_');
        }
        // Generate HTML
        return {
            attributes: componentProps,
            body: replaceIDs(item.body, id ? () => id + 'ID' + localCounter++ : 'iconifySvelte'),
        };
    }

    /**
     * Enable cache
     */
    function enableCache(storage) {
        toggleBrowserCache(storage, true);
    }
    /**
     * Disable cache
     */
    function disableCache(storage) {
        toggleBrowserCache(storage, false);
    }
    /**
     * Initialise stuff
     */
    // Enable short names
    allowSimpleNames(true);
    // Set API module
    setAPIModule('', fetchAPIModule);
    /**
     * Browser stuff
     */
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        // Set cache and load existing cache
        cache.store = storeCache;
        loadCache();
        const _window = window;
        // Load icons from global "IconifyPreload"
        if (_window.IconifyPreload !== void 0) {
            const preload = _window.IconifyPreload;
            const err = 'Invalid IconifyPreload syntax.';
            if (typeof preload === 'object' && preload !== null) {
                (preload instanceof Array ? preload : [preload]).forEach((item) => {
                    try {
                        if (
                        // Check if item is an object and not null/array
                        typeof item !== 'object' ||
                            item === null ||
                            item instanceof Array ||
                            // Check for 'icons' and 'prefix'
                            typeof item.icons !== 'object' ||
                            typeof item.prefix !== 'string' ||
                            // Add icon set
                            !addCollection(item)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                });
            }
        }
        // Set API from global "IconifyProviders"
        if (_window.IconifyProviders !== void 0) {
            const providers = _window.IconifyProviders;
            if (typeof providers === 'object' && providers !== null) {
                for (let key in providers) {
                    const err = 'IconifyProviders[' + key + '] is invalid.';
                    try {
                        const value = providers[key];
                        if (typeof value !== 'object' ||
                            !value ||
                            value.resources === void 0) {
                            continue;
                        }
                        if (!addAPIProvider(key, value)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                }
            }
        }
    }
    /**
     * Check if component needs to be updated
     */
    function checkIconState(icon, state, mounted, callback, onload) {
        // Abort loading icon
        function abortLoading() {
            if (state.loading) {
                state.loading.abort();
                state.loading = null;
            }
        }
        // Icon is an object
        if (typeof icon === 'object' &&
            icon !== null &&
            typeof icon.body === 'string') {
            // Stop loading
            state.name = '';
            abortLoading();
            return { data: fullIcon(icon) };
        }
        // Invalid icon?
        let iconName;
        if (typeof icon !== 'string' ||
            (iconName = stringToIcon(icon, false, true)) === null) {
            abortLoading();
            return null;
        }
        // Load icon
        const data = getIconData(iconName);
        if (data === null) {
            // Icon needs to be loaded
            // Do not load icon until component is mounted
            if (mounted && (!state.loading || state.loading.name !== icon)) {
                // New icon to load
                abortLoading();
                state.name = '';
                state.loading = {
                    name: icon,
                    abort: loadIcons([iconName], callback),
                };
            }
            return null;
        }
        // Icon data is available
        abortLoading();
        if (state.name !== icon) {
            state.name = icon;
            if (onload && !state.destroyed) {
                onload(icon);
            }
        }
        // Add classes
        const classes = ['iconify'];
        if (iconName.prefix !== '') {
            classes.push('iconify--' + iconName.prefix);
        }
        if (iconName.provider !== '') {
            classes.push('iconify--' + iconName.provider);
        }
        return { data, classes };
    }
    /**
     * Generate icon
     */
    function generateIcon(icon, props) {
        return icon ? render(icon, props) : null;
    }
    /**
     * Internal API
     */
    const _api = {
        getAPIConfig,
        setAPIModule,
        sendAPIQuery,
        setFetch,
        getFetch,
        listAPIProviders,
        mergeParams,
    };

    /* node_modules\@iconify\svelte\dist\Icon.svelte generated by Svelte v3.48.0 */
    const file$8 = "node_modules\\@iconify\\svelte\\dist\\Icon.svelte";

    // (110:0) {#if data !== null}
    function create_if_block$1(ctx) {
    	let svg;
    	let raw_value = /*data*/ ctx[0].body + "";
    	let svg_levels = [/*data*/ ctx[0].attributes];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$8, 110, 0, 1954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			svg.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(110:0) {#if data !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let if_block = /*data*/ ctx[0] !== null && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);

    	const state = {
    		// Last icon name
    		name: '',
    		// Loading status
    		loading: null,
    		// Destroyed status
    		destroyed: false
    	};

    	// Mounted status
    	let mounted = false;

    	// Callback counter
    	let counter = 0;

    	// Generated data
    	let data;

    	const onLoad = icon => {
    		// Legacy onLoad property
    		if (typeof $$props.onLoad === 'function') {
    			$$props.onLoad(icon);
    		}

    		// on:load event
    		const dispatch = createEventDispatcher();

    		dispatch('load', { icon });
    	};

    	// Increase counter when loaded to force re-calculation of data
    	function loaded() {
    		$$invalidate(3, counter++, counter);
    	}

    	// Force re-render
    	onMount(() => {
    		$$invalidate(2, mounted = true);
    	});

    	// Abort loading when component is destroyed
    	onDestroy(() => {
    		$$invalidate(1, state.destroyed = true, state);

    		if (state.loading) {
    			state.loading.abort();
    			$$invalidate(1, state.loading = null, state);
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		enableCache,
    		disableCache,
    		iconExists,
    		getIcon,
    		listIcons,
    		shareStorage,
    		addIcon,
    		addCollection,
    		calculateSize,
    		replaceIDs,
    		buildIcon,
    		loadIcons,
    		loadIcon,
    		addAPIProvider,
    		_api,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		checkIconState,
    		generateIcon,
    		state,
    		mounted,
    		counter,
    		data,
    		onLoad,
    		loaded
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ('mounted' in $$props) $$invalidate(2, mounted = $$new_props.mounted);
    		if ('counter' in $$props) $$invalidate(3, counter = $$new_props.counter);
    		if ('data' in $$props) $$invalidate(0, data = $$new_props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		{
    			const iconData = checkIconState($$props.icon, state, mounted, loaded, onLoad);
    			$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

    			if (data && iconData.classes) {
    				// Add classes
    				$$invalidate(
    					0,
    					data.attributes['class'] = (typeof $$props['class'] === 'string'
    					? $$props['class'] + ' '
    					: '') + iconData.classes.join(' '),
    					data
    				);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [data, state, mounted, counter];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\sideButtons.svelte generated by Svelte v3.48.0 */
    const file$7 = "src\\sideButtons.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let span0;
    	let a0;
    	let icon0;
    	let t0;
    	let span1;
    	let a1;
    	let icon1;
    	let t1;
    	let span2;
    	let a2;
    	let icon2;
    	let t2;
    	let span3;
    	let a3;
    	let icon3;
    	let t3;
    	let span4;
    	let a4;
    	let icon4;
    	let t4;
    	let span5;
    	let a5;
    	let icon5;
    	let current;

    	icon0 = new Icon({
    			props: {
    				icon: "entypo-social:github",
    				style: "font-size: 2rem"
    			},
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: {
    				icon: "entypo-social:soundcloud",
    				style: "font-size: 2rem"
    			},
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: {
    				icon: "entypo-social:youtube",
    				style: "font-size: 2rem"
    			},
    			$$inline: true
    		});

    	icon3 = new Icon({
    			props: {
    				icon: "entypo-social:linkedin",
    				style: "font-size: 2rem"
    			},
    			$$inline: true
    		});

    	icon4 = new Icon({
    			props: {
    				icon: "akar-icons:behance-fill",
    				style: "font-size: 2rem"
    			},
    			$$inline: true
    		});

    	icon5 = new Icon({
    			props: {
    				icon: "entypo:email",
    				style: "font-size: 2rem"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			a0 = element("a");
    			create_component(icon0.$$.fragment);
    			t0 = space();
    			span1 = element("span");
    			a1 = element("a");
    			create_component(icon1.$$.fragment);
    			t1 = space();
    			span2 = element("span");
    			a2 = element("a");
    			create_component(icon2.$$.fragment);
    			t2 = space();
    			span3 = element("span");
    			a3 = element("a");
    			create_component(icon3.$$.fragment);
    			t3 = space();
    			span4 = element("span");
    			a4 = element("a");
    			create_component(icon4.$$.fragment);
    			t4 = space();
    			span5 = element("span");
    			a5 = element("a");
    			create_component(icon5.$$.fragment);
    			attr_dev(a0, "href", "https://github.com/TrippWasTaken");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			attr_dev(a0, "class", "link svelte-2gb7o0");
    			add_location(a0, file$7, 16, 4, 403);
    			attr_dev(span0, "class", "icon-btn svelte-2gb7o0");
    			add_location(span0, file$7, 15, 2, 374);
    			attr_dev(a1, "href", "https://soundcloud.com/solyeong");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "class", "link svelte-2gb7o0");
    			add_location(a1, file$7, 26, 4, 657);
    			attr_dev(span1, "class", "icon-btn svelte-2gb7o0");
    			add_location(span1, file$7, 25, 2, 628);
    			attr_dev(a2, "href", "https://www.youtube.com/channel/UC_vnpxE0e2PO3Yb7LGAKxIw");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener noreferrer");
    			attr_dev(a2, "class", "link svelte-2gb7o0");
    			add_location(a2, file$7, 36, 4, 914);
    			attr_dev(span2, "class", "icon-btn svelte-2gb7o0");
    			add_location(span2, file$7, 35, 2, 885);
    			attr_dev(a3, "href", "https://www.linkedin.com/in/konrad-knecht/");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "rel", "noopener noreferrer");
    			attr_dev(a3, "class", "link svelte-2gb7o0");
    			add_location(a3, file$7, 46, 4, 1193);
    			attr_dev(span3, "class", "icon-btn svelte-2gb7o0");
    			add_location(span3, file$7, 45, 2, 1164);
    			attr_dev(a4, "href", "https://www.behance.net/konradknecht");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "rel", "noopener noreferrer");
    			attr_dev(a4, "class", "link svelte-2gb7o0");
    			add_location(a4, file$7, 56, 4, 1459);
    			attr_dev(span4, "class", "icon-btn svelte-2gb7o0");
    			add_location(span4, file$7, 55, 2, 1430);
    			attr_dev(a5, "href", "mailto:tripp@trippmedia.tech");
    			attr_dev(a5, "target", "_blank");
    			attr_dev(a5, "rel", "noopener noreferrer");
    			attr_dev(a5, "class", "link svelte-2gb7o0");
    			add_location(a5, file$7, 66, 4, 1720);
    			attr_dev(span5, "class", "icon-btn svelte-2gb7o0");
    			add_location(span5, file$7, 65, 2, 1691);
    			attr_dev(div, "id", "side-nav-container");
    			attr_dev(div, "class", "svelte-2gb7o0");
    			add_location(div, file$7, 14, 0, 341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, a0);
    			mount_component(icon0, a0, null);
    			append_dev(div, t0);
    			append_dev(div, span1);
    			append_dev(span1, a1);
    			mount_component(icon1, a1, null);
    			append_dev(div, t1);
    			append_dev(div, span2);
    			append_dev(span2, a2);
    			mount_component(icon2, a2, null);
    			append_dev(div, t2);
    			append_dev(div, span3);
    			append_dev(span3, a3);
    			mount_component(icon3, a3, null);
    			append_dev(div, t3);
    			append_dev(div, span4);
    			append_dev(span4, a4);
    			mount_component(icon4, a4, null);
    			append_dev(div, t4);
    			append_dev(div, span5);
    			append_dev(span5, a5);
    			mount_component(icon5, a5, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			transition_in(icon4.$$.fragment, local);
    			transition_in(icon5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			transition_out(icon4.$$.fragment, local);
    			transition_out(icon5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			destroy_component(icon4);
    			destroy_component(icon5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SideButtons', slots, []);

    	onMount(() => {
    		anime.set("#side-nav-container", { opacity: 0 });

    		anime({
    			targets: "#side-nav-container",
    			opacity: 1,
    			delay: 1000,
    			duration: 1000
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SideButtons> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Icon, anime, onMount });
    	return [];
    }

    class SideButtons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideButtons",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.48.0 */

    const file$6 = "src\\Footer.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (9:6) {#each loopText as item}
    function create_each_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `© Konrad Knecht ${/*dateYear*/ ctx[0]}  `;
    			attr_dev(span, "class", "copyright-cont svelte-p2ta3w");
    			add_location(span, file$6, 9, 8, 258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(9:6) {#each loopText as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let span;
    	let p;
    	let each_value = /*loopText*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "loop svelte-p2ta3w");
    			add_location(p, file$6, 7, 4, 200);
    			attr_dev(span, "class", "text-container");
    			add_location(span, file$6, 6, 2, 165);
    			attr_dev(div, "class", "footer-container svelte-p2ta3w");
    			add_location(div, file$6, 5, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, p);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dateYear*/ 1) {
    				each_value = /*loopText*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const dateYear = new Date().getFullYear();
    	const loopText = [1, 1, 1, ,1, 1, 1, 1, 1, ,1, 1, ,1, 1];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ dateYear, loopText });
    	return [dateYear, loopText];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /*! Fast Average Color | © 2022 Denis Seleznev | MIT License | https://github.com/fast-average-color/fast-average-color */
    function toHex(num) {
        var str = num.toString(16);
        return str.length === 1 ? '0' + str : str;
    }
    function arrayToHex(arr) {
        return '#' + arr.map(toHex).join('');
    }
    function isDark(color) {
        // http://www.w3.org/TR/AERT#color-contrast
        var result = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
        return result < 128;
    }
    function prepareIgnoredColor(color) {
        if (!color) {
            return [];
        }
        return isRGBArray(color) ? color : [color];
    }
    function isRGBArray(value) {
        return Array.isArray(value[0]);
    }
    function isIgnoredColor(data, index, ignoredColor) {
        for (var i = 0; i < ignoredColor.length; i++) {
            if (isIgnoredColorAsNumbers(data, index, ignoredColor[i])) {
                return true;
            }
        }
        return false;
    }
    function isIgnoredColorAsNumbers(data, index, ignoredColor) {
        switch (ignoredColor.length) {
            case 3:
                // [red, green, blue]
                if (isIgnoredRGBColor(data, index, ignoredColor)) {
                    return true;
                }
                break;
            case 4:
                // [red, green, blue, alpha]
                if (isIgnoredRGBAColor(data, index, ignoredColor)) {
                    return true;
                }
                break;
            case 5:
                // [red, green, blue, alpha, threshold]
                if (isIgnoredRGBAColorWithThreshold(data, index, ignoredColor)) {
                    return true;
                }
                break;
            default:
                return false;
        }
    }
    function isIgnoredRGBColor(data, index, ignoredColor) {
        // Ignore if the pixel are transparent.
        if (data[index + 3] !== 255) {
            return true;
        }
        if (data[index] === ignoredColor[0] &&
            data[index + 1] === ignoredColor[1] &&
            data[index + 2] === ignoredColor[2]) {
            return true;
        }
        return false;
    }
    function isIgnoredRGBAColor(data, index, ignoredColor) {
        if (data[index + 3] && ignoredColor[3]) {
            return data[index] === ignoredColor[0] &&
                data[index + 1] === ignoredColor[1] &&
                data[index + 2] === ignoredColor[2] &&
                data[index + 3] === ignoredColor[3];
        }
        // Ignore rgb components if the pixel are fully transparent.
        return data[index + 3] === ignoredColor[3];
    }
    function inRange(colorComponent, ignoredColorComponent, value) {
        return colorComponent >= (ignoredColorComponent - value) &&
            colorComponent <= (ignoredColorComponent + value);
    }
    function isIgnoredRGBAColorWithThreshold(data, index, ignoredColor) {
        var redIgnored = ignoredColor[0];
        var greenIgnored = ignoredColor[1];
        var blueIgnored = ignoredColor[2];
        var alphaIgnored = ignoredColor[3];
        var threshold = ignoredColor[4];
        var alphaData = data[index + 3];
        var alphaInRange = inRange(alphaData, alphaIgnored, threshold);
        if (!alphaIgnored) {
            return alphaInRange;
        }
        if (!alphaData && alphaInRange) {
            return true;
        }
        if (inRange(data[index], redIgnored, threshold) &&
            inRange(data[index + 1], greenIgnored, threshold) &&
            inRange(data[index + 2], blueIgnored, threshold) &&
            alphaInRange) {
            return true;
        }
        return false;
    }

    function dominantAlgorithm(arr, len, options) {
        var colorHash = {};
        var divider = 24;
        var ignoredColor = options.ignoredColor;
        var step = options.step;
        var max = [0, 0, 0, 0, 0];
        for (var i = 0; i < len; i += step) {
            var red = arr[i];
            var green = arr[i + 1];
            var blue = arr[i + 2];
            var alpha = arr[i + 3];
            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }
            var key = Math.round(red / divider) + ',' +
                Math.round(green / divider) + ',' +
                Math.round(blue / divider);
            if (colorHash[key]) {
                colorHash[key] = [
                    colorHash[key][0] + red * alpha,
                    colorHash[key][1] + green * alpha,
                    colorHash[key][2] + blue * alpha,
                    colorHash[key][3] + alpha,
                    colorHash[key][4] + 1
                ];
            }
            else {
                colorHash[key] = [red * alpha, green * alpha, blue * alpha, alpha, 1];
            }
            if (max[4] < colorHash[key][4]) {
                max = colorHash[key];
            }
        }
        var redTotal = max[0];
        var greenTotal = max[1];
        var blueTotal = max[2];
        var alphaTotal = max[3];
        var count = max[4];
        return alphaTotal ? [
            Math.round(redTotal / alphaTotal),
            Math.round(greenTotal / alphaTotal),
            Math.round(blueTotal / alphaTotal),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function simpleAlgorithm(arr, len, options) {
        var redTotal = 0;
        var greenTotal = 0;
        var blueTotal = 0;
        var alphaTotal = 0;
        var count = 0;
        var ignoredColor = options.ignoredColor;
        var step = options.step;
        for (var i = 0; i < len; i += step) {
            var alpha = arr[i + 3];
            var red = arr[i] * alpha;
            var green = arr[i + 1] * alpha;
            var blue = arr[i + 2] * alpha;
            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }
            redTotal += red;
            greenTotal += green;
            blueTotal += blue;
            alphaTotal += alpha;
            count++;
        }
        return alphaTotal ? [
            Math.round(redTotal / alphaTotal),
            Math.round(greenTotal / alphaTotal),
            Math.round(blueTotal / alphaTotal),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function sqrtAlgorithm(arr, len, options) {
        var redTotal = 0;
        var greenTotal = 0;
        var blueTotal = 0;
        var alphaTotal = 0;
        var count = 0;
        var ignoredColor = options.ignoredColor;
        var step = options.step;
        for (var i = 0; i < len; i += step) {
            var red = arr[i];
            var green = arr[i + 1];
            var blue = arr[i + 2];
            var alpha = arr[i + 3];
            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }
            redTotal += red * red * alpha;
            greenTotal += green * green * alpha;
            blueTotal += blue * blue * alpha;
            alphaTotal += alpha;
            count++;
        }
        return alphaTotal ? [
            Math.round(Math.sqrt(redTotal / alphaTotal)),
            Math.round(Math.sqrt(greenTotal / alphaTotal)),
            Math.round(Math.sqrt(blueTotal / alphaTotal)),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function getDefaultColor(options) {
        return getOption(options, 'defaultColor', [0, 0, 0, 0]);
    }
    function getOption(options, name, defaultValue) {
        return (options[name] === undefined ? defaultValue : options[name]);
    }

    var MIN_SIZE = 10;
    var MAX_SIZE = 100;
    function isSvg(filename) {
        return filename.search(/\.svg(\?|$)/i) !== -1;
    }
    function getOriginalSize(resource) {
        if (isInstanceOfHTMLImageElement(resource)) {
            var width = resource.naturalWidth;
            var height = resource.naturalHeight;
            // For SVG images with only viewBox attribute
            if (!resource.naturalWidth && isSvg(resource.src)) {
                width = height = MAX_SIZE;
            }
            return {
                width: width,
                height: height,
            };
        }
        if (isInstanceOfHTMLVideoElement(resource)) {
            return {
                width: resource.videoWidth,
                height: resource.videoHeight
            };
        }
        return {
            width: resource.width,
            height: resource.height
        };
    }
    function getSrc(resource) {
        if (isInstanceOfHTMLCanvasElement(resource)) {
            return 'canvas';
        }
        if (isInstanceOfOffscreenCanvas(resource)) {
            return 'offscreencanvas';
        }
        if (isInstanceOfImageBitmap(resource)) {
            return 'imagebitmap';
        }
        return resource.src;
    }
    function isInstanceOfHTMLImageElement(resource) {
        return typeof HTMLImageElement !== 'undefined' && resource instanceof HTMLImageElement;
    }
    var hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
    function isInstanceOfOffscreenCanvas(resource) {
        return hasOffscreenCanvas && resource instanceof OffscreenCanvas;
    }
    function isInstanceOfHTMLVideoElement(resource) {
        return typeof HTMLVideoElement !== 'undefined' && resource instanceof HTMLVideoElement;
    }
    function isInstanceOfHTMLCanvasElement(resource) {
        return typeof HTMLCanvasElement !== 'undefined' && resource instanceof HTMLCanvasElement;
    }
    function isInstanceOfImageBitmap(resource) {
        return typeof ImageBitmap !== 'undefined' && resource instanceof ImageBitmap;
    }
    function prepareSizeAndPosition(originalSize, options) {
        var srcLeft = getOption(options, 'left', 0);
        var srcTop = getOption(options, 'top', 0);
        var srcWidth = getOption(options, 'width', originalSize.width);
        var srcHeight = getOption(options, 'height', originalSize.height);
        var destWidth = srcWidth;
        var destHeight = srcHeight;
        if (options.mode === 'precision') {
            return {
                srcLeft: srcLeft,
                srcTop: srcTop,
                srcWidth: srcWidth,
                srcHeight: srcHeight,
                destWidth: destWidth,
                destHeight: destHeight
            };
        }
        var factor;
        if (srcWidth > srcHeight) {
            factor = srcWidth / srcHeight;
            destWidth = MAX_SIZE;
            destHeight = Math.round(destWidth / factor);
        }
        else {
            factor = srcHeight / srcWidth;
            destHeight = MAX_SIZE;
            destWidth = Math.round(destHeight / factor);
        }
        if (destWidth > srcWidth || destHeight > srcHeight ||
            destWidth < MIN_SIZE || destHeight < MIN_SIZE) {
            destWidth = srcWidth;
            destHeight = srcHeight;
        }
        return {
            srcLeft: srcLeft,
            srcTop: srcTop,
            srcWidth: srcWidth,
            srcHeight: srcHeight,
            destWidth: destWidth,
            destHeight: destHeight
        };
    }
    var isWebWorkers = typeof window === 'undefined';
    function makeCanvas() {
        if (isWebWorkers) {
            return hasOffscreenCanvas ? new OffscreenCanvas(1, 1) : null;
        }
        return document.createElement('canvas');
    }

    var ERROR_PREFIX = 'FastAverageColor: ';
    function getError(message) {
        return Error(ERROR_PREFIX + message);
    }
    function outputError(error, silent) {
        if (!silent) {
            console.error(error);
        }
    }

    var FastAverageColor = /** @class */ (function () {
        function FastAverageColor() {
            this.canvas = null;
            this.ctx = null;
        }
        /**
         * Get asynchronously the average color from not loaded image.
         */
        FastAverageColor.prototype.getColorAsync = function (resource, options) {
            if (!resource) {
                return Promise.reject(getError('call .getColorAsync() without resource.'));
            }
            if (typeof resource === 'string') {
                // Web workers
                if (typeof Image === 'undefined') {
                    return Promise.reject(getError('resource as string is not supported in this environment'));
                }
                var img = new Image();
                img.crossOrigin = options && options.crossOrigin || '';
                img.src = resource;
                return this.bindImageEvents(img, options);
            }
            else if (isInstanceOfHTMLImageElement(resource) && !resource.complete) {
                return this.bindImageEvents(resource, options);
            }
            else {
                var result = this.getColor(resource, options);
                return result.error ? Promise.reject(result.error) : Promise.resolve(result);
            }
        };
        /**
         * Get the average color from images, videos and canvas.
         */
        FastAverageColor.prototype.getColor = function (resource, options) {
            options = options || {};
            var defaultColor = getDefaultColor(options);
            if (!resource) {
                var error = getError('call .getColor(null) without resource');
                outputError(error, options.silent);
                return this.prepareResult(defaultColor, error);
            }
            var originalSize = getOriginalSize(resource);
            var size = prepareSizeAndPosition(originalSize, options);
            if (!size.srcWidth || !size.srcHeight || !size.destWidth || !size.destHeight) {
                var error = getError("incorrect sizes for resource \"".concat(getSrc(resource), "\""));
                outputError(error, options.silent);
                return this.prepareResult(defaultColor, error);
            }
            if (!this.canvas) {
                this.canvas = makeCanvas();
                if (!this.canvas) {
                    var error = getError('OffscreenCanvas is not supported in this browser');
                    outputError(error, options.silent);
                    return this.prepareResult(defaultColor, error);
                }
            }
            if (!this.ctx) {
                this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
                if (!this.ctx) {
                    var error = getError('Canvas Context 2D is not supported in this browser');
                    outputError(error, options.silent);
                    return this.prepareResult(defaultColor);
                }
                this.ctx.imageSmoothingEnabled = false;
            }
            this.canvas.width = size.destWidth;
            this.canvas.height = size.destHeight;
            try {
                this.ctx.clearRect(0, 0, size.destWidth, size.destHeight);
                this.ctx.drawImage(resource, size.srcLeft, size.srcTop, size.srcWidth, size.srcHeight, 0, 0, size.destWidth, size.destHeight);
                var bitmapData = this.ctx.getImageData(0, 0, size.destWidth, size.destHeight).data;
                return this.prepareResult(this.getColorFromArray4(bitmapData, options));
            }
            catch (originalError) {
                var error = getError("security error (CORS) for resource ".concat(getSrc(resource), ".\nDetails: https://developer.mozilla.org/en/docs/Web/HTML/CORS_enabled_image"));
                outputError(error, options.silent);
                !options.silent && console.error(originalError);
                return this.prepareResult(defaultColor, error);
            }
        };
        /**
         * Get the average color from a array when 1 pixel is 4 bytes.
         */
        FastAverageColor.prototype.getColorFromArray4 = function (arr, options) {
            options = options || {};
            var bytesPerPixel = 4;
            var arrLength = arr.length;
            var defaultColor = getDefaultColor(options);
            if (arrLength < bytesPerPixel) {
                return defaultColor;
            }
            var len = arrLength - arrLength % bytesPerPixel;
            var step = (options.step || 1) * bytesPerPixel;
            var algorithm;
            switch (options.algorithm || 'sqrt') {
                case 'simple':
                    algorithm = simpleAlgorithm;
                    break;
                case 'sqrt':
                    algorithm = sqrtAlgorithm;
                    break;
                case 'dominant':
                    algorithm = dominantAlgorithm;
                    break;
                default:
                    throw getError("".concat(options.algorithm, " is unknown algorithm"));
            }
            return algorithm(arr, len, {
                defaultColor: defaultColor,
                ignoredColor: prepareIgnoredColor(options.ignoredColor),
                step: step
            });
        };
        /**
         * Get color data from value ([r, g, b, a]).
         */
        FastAverageColor.prototype.prepareResult = function (value, error) {
            var rgb = value.slice(0, 3);
            var rgba = [value[0], value[1], value[2], value[3] / 255];
            var isDarkColor = isDark(value);
            return {
                value: [value[0], value[1], value[2], value[3]],
                rgb: 'rgb(' + rgb.join(',') + ')',
                rgba: 'rgba(' + rgba.join(',') + ')',
                hex: arrayToHex(rgb),
                hexa: arrayToHex(value),
                isDark: isDarkColor,
                isLight: !isDarkColor,
                error: error,
            };
        };
        /**
         * Destroy the instance.
         */
        FastAverageColor.prototype.destroy = function () {
            if (this.canvas) {
                this.canvas.width = 1;
                this.canvas.height = 1;
                this.canvas = null;
            }
            this.ctx = null;
        };
        FastAverageColor.prototype.bindImageEvents = function (resource, options) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var onload = function () {
                    unbindEvents();
                    var result = _this.getColor(resource, options);
                    if (result.error) {
                        reject(result.error);
                    }
                    else {
                        resolve(result);
                    }
                };
                var onerror = function () {
                    unbindEvents();
                    reject(getError("Error loading image \"".concat(resource.src, "\".")));
                };
                var onabort = function () {
                    unbindEvents();
                    reject(getError("Image \"".concat(resource.src, "\" loading aborted")));
                };
                var unbindEvents = function () {
                    resource.removeEventListener('load', onload);
                    resource.removeEventListener('error', onerror);
                    resource.removeEventListener('abort', onabort);
                };
                resource.addEventListener('load', onload);
                resource.addEventListener('error', onerror);
                resource.addEventListener('abort', onabort);
            });
        };
        return FastAverageColor;
    }());

    /* src\ImageContainer.svelte generated by Svelte v3.48.0 */
    const file$5 = "src\\ImageContainer.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let img_1;
    	let img_1_src_value;
    	let img_1_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img_1 = element("img");
    			if (!src_url_equal(img_1.src, img_1_src_value = /*src*/ ctx[0])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", img_1_alt_value = `Image number ${/*index*/ ctx[1]}`);
    			attr_dev(img_1, "class", "svelte-jgk5sf");
    			add_location(img_1, file$5, 24, 2, 689);
    			attr_dev(div, "class", "photo-template svelte-jgk5sf");
    			add_location(div, file$5, 23, 0, 635);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img_1);
    			/*img_1_binding*/ ctx[5](img_1);
    			/*div_binding*/ ctx[6](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 1 && !src_url_equal(img_1.src, img_1_src_value = /*src*/ ctx[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (dirty & /*index*/ 2 && img_1_alt_value !== (img_1_alt_value = `Image number ${/*index*/ ctx[1]}`)) {
    				attr_dev(img_1, "alt", img_1_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*img_1_binding*/ ctx[5](null);
    			/*div_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ImageContainer', slots, []);
    	let { src } = $$props;
    	let { index } = $$props;
    	let { sizing } = $$props;
    	let img;
    	let container;
    	const colors = new FastAverageColor();

    	const getColor = () => {
    		colors.getColorAsync(img).then(({ hex }) => {
    			$$invalidate(3, container.style.backgroundColor = hex, container);
    		});
    	};

    	onMount(() => {
    		if (img.src) getColor();
    		$$invalidate(3, container.style.height = `${sizing.height}%`, container);
    		$$invalidate(3, container.style.width = `${sizing.width}%`, container);
    		$$invalidate(3, container.style.left = `${sizing.left}%`, container);
    		$$invalidate(3, container.style.top = `${sizing.top}%`, container);
    	});

    	const writable_props = ['src', 'index', 'sizing'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ImageContainer> was created with unknown prop '${key}'`);
    	});

    	function img_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			img = $$value;
    			$$invalidate(2, img);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('sizing' in $$props) $$invalidate(4, sizing = $$props.sizing);
    	};

    	$$self.$capture_state = () => ({
    		FastAverageColor,
    		onMount,
    		src,
    		index,
    		sizing,
    		img,
    		container,
    		colors,
    		getColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('sizing' in $$props) $$invalidate(4, sizing = $$props.sizing);
    		if ('img' in $$props) $$invalidate(2, img = $$props.img);
    		if ('container' in $$props) $$invalidate(3, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, index, img, container, sizing, img_1_binding, div_binding];
    }

    class ImageContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { src: 0, index: 1, sizing: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageContainer",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !('src' in props)) {
    			console.warn("<ImageContainer> was created without expected prop 'src'");
    		}

    		if (/*index*/ ctx[1] === undefined && !('index' in props)) {
    			console.warn("<ImageContainer> was created without expected prop 'index'");
    		}

    		if (/*sizing*/ ctx[4] === undefined && !('sizing' in props)) {
    			console.warn("<ImageContainer> was created without expected prop 'sizing'");
    		}
    	}

    	get src() {
    		throw new Error("<ImageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<ImageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<ImageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ImageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizing() {
    		throw new Error("<ImageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizing(value) {
    		throw new Error("<ImageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Media.svelte generated by Svelte v3.48.0 */
    const file$4 = "src\\Media.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (86:6) {#each photos as photo, index}
    function create_each_block$1(ctx) {
    	let imagecontainer;
    	let current;

    	imagecontainer = new ImageContainer({
    			props: {
    				src: /*photo*/ ctx[13],
    				index: /*index*/ ctx[15],
    				sizing: /*sizing*/ ctx[6][/*index*/ ctx[15]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(imagecontainer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(imagecontainer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(imagecontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(imagecontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(imagecontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(86:6) {#each photos as photo, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div1;
    	let h1;
    	let span;
    	let t1;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*photos*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			span = element("span");
    			span.textContent = "MEDIA";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(span, file$4, 83, 53, 2091);
    			attr_dev(h1, "class", "projects-heading svelte-93ign2");
    			add_location(h1, file$4, 83, 4, 2042);
    			attr_dev(div0, "class", "gallery-box svelte-93ign2");
    			set_style(div0, "min-height", /*galleryY*/ ctx[2] + "px");
    			set_style(div0, "min-width", /*galleryX*/ ctx[1] + "px");
    			add_location(div0, file$4, 84, 4, 2120);
    			attr_dev(div1, "class", "photos-container svelte-93ign2");
    			add_location(div1, file$4, 82, 2, 1959);
    			attr_dev(div2, "class", "media-container svelte-93ign2");
    			attr_dev(div2, "id", "media");
    			add_location(div2, file$4, 80, 0, 1911);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, span);
    			/*h1_binding*/ ctx[8](h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			/*div0_binding*/ ctx[9](div0);
    			/*div1_binding*/ ctx[10](div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "mousemove", /*mouseMove*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*photos, sizing*/ 96) {
    				each_value = /*photos*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*galleryY*/ 4) {
    				set_style(div0, "min-height", /*galleryY*/ ctx[2] + "px");
    			}

    			if (!current || dirty & /*galleryX*/ 2) {
    				set_style(div0, "min-width", /*galleryX*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*h1_binding*/ ctx[8](null);
    			destroy_each(each_blocks, detaching);
    			/*div0_binding*/ ctx[9](null);
    			/*div1_binding*/ ctx[10](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Media', slots, []);

    	const photos = [
    		"/images/media/1.jpg",
    		"/images/media/2.jpg",
    		"/images/media/3.jpg",
    		"/images/media/4.jpg",
    		"/images/media/5.jpg",
    		"/images/media/6.jpg"
    	];

    	const sizing = [
    		{ height: 23, width: 20, left: 5, top: 5 },
    		{ height: 30, width: 14, left: 51, top: 7 },
    		{ height: 19, width: 14, left: 16, top: 39 },
    		{ height: 27, width: 27, left: 8, top: 70 },
    		{ height: 22, width: 20, left: 49, top: 74 },
    		{ height: 24, width: 18, left: 72, top: 40 }
    	];

    	let container, galleryX, galleryY, gallery, mouseX = 0, mouseY = 0, heading;

    	const mouseMove = e => {
    		const border = container.getBoundingClientRect();
    		mouseX = Math.floor(e.clientX - border.left);
    		mouseY = Math.floor(e.clientY - border.top);
    		const xPer = mouseX / container.offsetWidth;
    		const yPer = mouseY / container.offsetHeight;

    		// console.log(xPer, yPer)
    		const panX = (galleryX - container.offsetWidth) * xPer * -1;

    		const panY = (galleryY - container.offsetHeight) * yPer * -1;

    		gallery.animate(
    			{
    				transform: `translate(${panX}px, ${panY}px)`
    			},
    			{
    				duration: 200,
    				fill: "forwards",
    				easing: 'ease'
    			}
    		);

    		heading.animate(
    			{
    				transform: `translate(${panX * 0.1}px, ${panY * 0.1}px)`
    			},
    			{
    				duration: 200,
    				fill: "forwards",
    				easing: 'ease'
    			}
    		);
    	};

    	onMount(() => {
    		$$invalidate(1, galleryX = container.offsetWidth * 2);
    		$$invalidate(2, galleryY = container.offsetHeight * 2);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Media> was created with unknown prop '${key}'`);
    	});

    	function h1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			heading = $$value;
    			$$invalidate(4, heading);
    		});
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			gallery = $$value;
    			$$invalidate(3, gallery);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		ImageContainer,
    		photos,
    		sizing,
    		container,
    		galleryX,
    		galleryY,
    		gallery,
    		mouseX,
    		mouseY,
    		heading,
    		mouseMove
    	});

    	$$self.$inject_state = $$props => {
    		if ('container' in $$props) $$invalidate(0, container = $$props.container);
    		if ('galleryX' in $$props) $$invalidate(1, galleryX = $$props.galleryX);
    		if ('galleryY' in $$props) $$invalidate(2, galleryY = $$props.galleryY);
    		if ('gallery' in $$props) $$invalidate(3, gallery = $$props.gallery);
    		if ('mouseX' in $$props) mouseX = $$props.mouseX;
    		if ('mouseY' in $$props) mouseY = $$props.mouseY;
    		if ('heading' in $$props) $$invalidate(4, heading = $$props.heading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		galleryX,
    		galleryY,
    		gallery,
    		heading,
    		photos,
    		sizing,
    		mouseMove,
    		h1_binding,
    		div0_binding,
    		div1_binding
    	];
    }

    class Media extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Media",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Main.svelte generated by Svelte v3.48.0 */
    const file$3 = "src\\Main.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (105:2) {#if mountNav}
    function create_if_block_1(ctx) {
    	let navbar;
    	let t;
    	let sidebuttons;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	sidebuttons = new SideButtons({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(sidebuttons.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(sidebuttons, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(sidebuttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(sidebuttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(sidebuttons, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(105:2) {#if mountNav}",
    		ctx
    	});

    	return block;
    }

    // (137:12) {#each titles as title, index}
    function create_each_block(ctx) {
    	let span;
    	let t_value = /*title*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "title-text svelte-22vk3p");
    			attr_dev(span, "id", `title-${/*index*/ ctx[8]}`);
    			add_location(span, file$3, 137, 14, 4127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(137:12) {#each titles as title, index}",
    		ctx
    	});

    	return block;
    }

    // (147:2) {#if mountNav}
    function create_if_block(ctx) {
    	let projects;
    	let t0;
    	let media;
    	let t1;
    	let footer;
    	let current;
    	projects = new Projects({ $$inline: true });
    	media = new Media({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(projects.$$.fragment);
    			t0 = space();
    			create_component(media.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(media, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects.$$.fragment, local);
    			transition_in(media.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projects.$$.fragment, local);
    			transition_out(media.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projects, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(media, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(147:2) {#if mountNav}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let t0;
    	let div12;
    	let div11;
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let t1;
    	let div2;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let div7;
    	let div6;
    	let div5;
    	let span1;
    	let t7;
    	let t8;
    	let div10;
    	let div9;
    	let span2;
    	let t9;
    	let div8;
    	let t10;
    	let circlehover;
    	let t11;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*mountNav*/ ctx[0] && create_if_block_1(ctx);
    	let each_value = /*titles*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	circlehover = new CircleHover({
    			props: { show: /*showHover*/ ctx[1] },
    			$$inline: true
    		});

    	let if_block1 = /*mountNav*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = text("MY ");
    			span0 = element("span");
    			span0.textContent = "NAME";
    			t4 = text(" IS");
    			t5 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			span1 = element("span");
    			span1.textContent = "KONRAD";
    			t7 = text(" KNECHT");
    			t8 = space();
    			div10 = element("div");
    			div9 = element("div");
    			span2 = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div8 = element("div");
    			t10 = space();
    			create_component(circlehover.$$.fragment);
    			t11 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "hover-dot dot-left svelte-22vk3p");
    			add_location(div0, file$3, 113, 12, 3349);
    			attr_dev(div1, "class", "hover-dot-action-wrapper svelte-22vk3p");
    			add_location(div1, file$3, 112, 10, 3297);
    			attr_dev(span0, "class", "white-box svelte-22vk3p");
    			add_location(span0, file$3, 120, 15, 3602);
    			attr_dev(div2, "id", "my-name-is-container");
    			attr_dev(div2, "class", "svelte-22vk3p");
    			add_location(div2, file$3, 119, 10, 3554);
    			attr_dev(div3, "class", "banner-item svelte-22vk3p");
    			add_location(div3, file$3, 111, 8, 3260);
    			attr_dev(div4, "class", "transition-banner svelte-22vk3p");
    			add_location(div4, file$3, 110, 6, 3219);
    			attr_dev(span1, "class", "white-box svelte-22vk3p");
    			add_location(span1, file$3, 128, 12, 3824);
    			attr_dev(div5, "id", "konrad-knecht-container");
    			attr_dev(div5, "class", "svelte-22vk3p");
    			add_location(div5, file$3, 127, 10, 3776);
    			attr_dev(div6, "class", "banner-item svelte-22vk3p");
    			add_location(div6, file$3, 126, 8, 3739);
    			attr_dev(div7, "class", "transition-banner svelte-22vk3p");
    			add_location(div7, file$3, 125, 6, 3698);
    			attr_dev(span2, "id", "banner-item-titles-elements");
    			attr_dev(span2, "class", "svelte-22vk3p");
    			add_location(span2, file$3, 135, 10, 4028);
    			attr_dev(div8, "class", "hover-dot dot-right svelte-22vk3p");
    			add_location(div8, file$3, 140, 10, 4240);
    			attr_dev(div9, "class", "banner-item svelte-22vk3p");
    			attr_dev(div9, "id", "banner-item-titles");
    			add_location(div9, file$3, 134, 8, 3967);
    			attr_dev(div10, "class", "transition-banner svelte-22vk3p");
    			add_location(div10, file$3, 133, 6, 3926);
    			attr_dev(div11, "id", "home-banner-container");
    			attr_dev(div11, "class", "svelte-22vk3p");
    			add_location(div11, file$3, 109, 4, 3179);
    			attr_dev(div12, "id", "content-render");
    			attr_dev(div12, "class", "svelte-22vk3p");
    			add_location(div12, file$3, 108, 2, 3148);
    			attr_dev(main, "class", "main-content svelte-22vk3p");
    			attr_dev(main, "id", "home");
    			add_location(main, file$3, 102, 0, 3002);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, t2);
    			append_dev(div2, span0);
    			append_dev(div2, t4);
    			append_dev(div11, t5);
    			append_dev(div11, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, span1);
    			append_dev(div5, t7);
    			append_dev(div11, t8);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, span2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span2, null);
    			}

    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(main, t10);
    			mount_component(circlehover, main, null);
    			append_dev(main, t11);
    			if (if_block1) if_block1.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "mouseenter", /*mouseenter_handler*/ ctx[3], false, false, false),
    					listen_dev(div0, "mouseleave", /*mouseleave_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*mountNav*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*mountNav*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*titles*/ 4) {
    				each_value = /*titles*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const circlehover_changes = {};
    			if (dirty & /*showHover*/ 2) circlehover_changes.show = /*showHover*/ ctx[1];
    			circlehover.$set(circlehover_changes);

    			if (/*mountNav*/ ctx[0]) {
    				if (if_block1) {
    					if (dirty & /*mountNav*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(circlehover.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(circlehover.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(circlehover);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let mountNav = false;
    	let showHover = false;

    	const mainTransition = () => {
    		const titlesAnim = () => {
    			const titleTL = anime.timeline({ duration: 2000, easing: "easeOutExpo" });

    			titleTL.add({
    				targets: "#title-0",
    				translateY: "0%",
    				complete(anim) {
    					anime({
    						targets: "#title-0",
    						duration: 1000,
    						translateY: "100%",
    						easing: "easeOutExpo"
    					});
    				}
    			}).add({
    				targets: "#title-1",
    				translateY: "0%",
    				complete(anim) {
    					anime({
    						targets: "#title-1",
    						duration: 1000,
    						translateY: "100%",
    						easing: "easeOutExpo"
    					});
    				}
    			}).add({
    				targets: "#title-2",
    				translateY: "0%",
    				complete(anim) {
    					anime({
    						targets: "#title-2",
    						duration: 1000,
    						translateY: "100%",
    						easing: "easeOutExpo",
    						complete(anim) {
    							titlesAnim();
    						}
    					});
    				}
    			});
    		};

    		anime.set("div.banner-item", { translateY: "-100%" });

    		anime.timeline({ easing: "cubicBezier(.12,.67,.3,.9)" }).add(
    			{
    				targets: "div#intro",
    				duration: 500,
    				opacity: 0
    			},
    			500
    		).add(
    			{
    				targets: "div#intro-line",
    				height: "0%",
    				complete(anim) {
    					$$invalidate(0, mountNav = true);
    					anime.set("body", { overflowY: "scroll" });

    					anime({
    						targets: "div.banner-item",
    						duration: 1000,
    						translateY: "0%",
    						easeing: "cubicBezier(.1,.67,.3,.9)",
    						delay(el, i, l) {
    							return i * 500;
    						},
    						complete(anim) {
    							titlesAnim();
    						}
    					});
    				}
    			},
    			500
    		);
    	};

    	const titles = [`Frontend Developer`, `Music Producer`, `Videographer`];

    	onMount(() => {
    		anime.set(["#title-0", "#title-1", "#title-2"], { translateY: "100%", width: "500px" });
    		mainTransition();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => $$invalidate(1, showHover = true);
    	const mouseleave_handler = () => $$invalidate(1, showHover = false);

    	$$self.$capture_state = () => ({
    		onMount,
    		anime,
    		Navbar,
    		Projects,
    		CircleHover,
    		SideButtons,
    		Footer,
    		Media,
    		mountNav,
    		showHover,
    		mainTransition,
    		titles
    	});

    	$$self.$inject_state = $$props => {
    		if ('mountNav' in $$props) $$invalidate(0, mountNav = $$props.mountNav);
    		if ('showHover' in $$props) $$invalidate(1, showHover = $$props.showHover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mountNav, showHover, titles, mouseenter_handler, mouseleave_handler];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Welcome.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\Welcome.svelte";

    function create_fragment$2(ctx) {
    	let main1;
    	let main0;
    	let current;
    	main0 = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			main1 = element("main");
    			create_component(main0.$$.fragment);
    			attr_dev(main1, "class", "container svelte-1n7735z");
    			add_location(main1, file$2, 54, 0, 1296);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main1, anchor);
    			mount_component(main0, main1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main0.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main0.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main1);
    			destroy_component(main0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Welcome', slots, []);
    	let mainReady = false;

    	const welcomeAnim = () => {
    		anime.set("div#intro", {
    			translateX: "-50%",
    			translateY: "-50%",
    			letterSpacing: "-1rem",
    			opacity: 0,
    			overflow: "hidden"
    		});

    		anime({
    			targets: "div#intro",
    			duration: 1000,
    			letterSpacing: "1rem",
    			opacity: 1,
    			easing: "cubicBezier(.12,.67,.3,.9)"
    		});
    	};

    	const finalAnim = () => {
    		anime.set("div#intro-line", { height: "0%" });
    	};

    	const lineAnim = () => {
    		anime.set("div#intro-line", {
    			translateX: "-50%",
    			translateY: "-50%",
    			opacity: 0
    		});

    		anime({
    			targets: "div#intro-line",
    			duration: 1000,
    			opacity: 1,
    			width: "50%",
    			easing: "cubicBezier(0, 0.69, 0.28, 0.99)",
    			height: {
    				value: "50%",
    				duration: 1000,
    				delay: 1000,
    				easing: "cubicBezier(.12,.67,.3,.9)"
    			},
    			complete(anim) {
    				mainReady = true;
    			}
    		});
    	};

    	onMount(() => {
    		welcomeAnim();
    		lineAnim();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Welcome> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		anime,
    		Main,
    		mainReady,
    		welcomeAnim,
    		finalAnim,
    		lineAnim
    	});

    	$$self.$inject_state = $$props => {
    		if ('mainReady' in $$props) mainReady = $$props.mainReady;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Welcome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Welcome",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Cursor.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\Cursor.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "cursor svelte-8ht8kb");
    			add_location(div, file$1, 15, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(window, "mousemove", /*moveCur*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cursor', slots, []);
    	let y;

    	const moveCur = e => {
    		y = e.pageX;

    		anime({
    			targets: "div.cursor",
    			translateX: e.pageX - 4,
    			translateY: e.pageY - 4,
    			duration: 100,
    			easeing: "easeInSine"
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cursor> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ anime, y, moveCur });

    	$$self.$inject_state = $$props => {
    		if ('y' in $$props) y = $$props.y;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [moveCur];
    }

    class Cursor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cursor",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let main;
    	let div;
    	let t0;
    	let cursor;
    	let t1;
    	let welcome;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	add_render_callback(/*onwindowresize*/ ctx[4]);
    	cursor = new Cursor({ $$inline: true });
    	welcome = new Welcome({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t0 = space();
    			create_component(cursor.$$.fragment);
    			t1 = space();
    			create_component(welcome.$$.fragment);
    			attr_dev(div, "class", "color-body svelte-irvfc8");
    			add_location(div, file, 45, 2, 1027);
    			add_location(main, file, 44, 0, 1018);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(main, t0);
    			mount_component(cursor, main, null);
    			append_dev(main, t1);
    			mount_component(welcome, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", /*scrollFunc*/ ctx[2], false, false, false),
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[3]();
    					}),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollPos*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollPos*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cursor.$$.fragment, local);
    			transition_in(welcome.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cursor.$$.fragment, local);
    			transition_out(welcome.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(cursor);
    			destroy_component(welcome);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let scrollPos;
    	let viewHeight;
    	let changeBG = false;
    	let runAnim = true;

    	const scrollFunc = e => {
    		if (scrollPos > viewHeight / 4) {
    			changeBG = true;
    		} else {
    			changeBG = false;
    		}

    		if (changeBG) {
    			if (runAnim) {
    				runAnim = false;

    				anime({
    					targets: ".color-body",
    					opacity: 0,
    					duration: 2000,
    					easeing: "easeInExpo"
    				});
    			}
    		}

    		if (!changeBG) {
    			if (!runAnim) {
    				runAnim = true;

    				anime({
    					targets: ".color-body",
    					opacity: 1,
    					duration: 2000,
    					easeing: "easeInExpo"
    				});
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollPos = window.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(1, viewHeight = window.innerHeight);
    	}

    	$$self.$capture_state = () => ({
    		Welcome,
    		Cursor,
    		anime,
    		scrollPos,
    		viewHeight,
    		changeBG,
    		runAnim,
    		scrollFunc
    	});

    	$$self.$inject_state = $$props => {
    		if ('scrollPos' in $$props) $$invalidate(0, scrollPos = $$props.scrollPos);
    		if ('viewHeight' in $$props) $$invalidate(1, viewHeight = $$props.viewHeight);
    		if ('changeBG' in $$props) changeBG = $$props.changeBG;
    		if ('runAnim' in $$props) runAnim = $$props.runAnim;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scrollPos, viewHeight, scrollFunc, onwindowscroll, onwindowresize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
