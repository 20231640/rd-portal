import { __commonJS, require_react } from "./react-BaqBjuxQ.js";

//#region node_modules/react-phone-input-2/lib/lib.js
var require_lib = /* @__PURE__ */ __commonJS({ "node_modules/react-phone-input-2/lib/lib.js": ((exports, module) => {
	module.exports = function(e) {
		var t = {};
		function r(n) {
			if (t[n]) return t[n].exports;
			var a = t[n] = {
				i: n,
				l: !1,
				exports: {}
			};
			return e[n].call(a.exports, a, a.exports, r), a.l = !0, a.exports;
		}
		return r.m = e, r.c = t, r.d = function(e$1, t$1, n) {
			r.o(e$1, t$1) || Object.defineProperty(e$1, t$1, {
				enumerable: !0,
				get: n
			});
		}, r.r = function(e$1) {
			"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e$1, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e$1, "__esModule", { value: !0 });
		}, r.t = function(e$1, t$1) {
			if (1 & t$1 && (e$1 = r(e$1)), 8 & t$1) return e$1;
			if (4 & t$1 && "object" == typeof e$1 && e$1 && e$1.__esModule) return e$1;
			var n = Object.create(null);
			if (r.r(n), Object.defineProperty(n, "default", {
				enumerable: !0,
				value: e$1
			}), 2 & t$1 && "string" != typeof e$1) for (var a in e$1) r.d(n, a, function(t$2) {
				return e$1[t$2];
			}.bind(null, a));
			return n;
		}, r.n = function(e$1) {
			var t$1 = e$1 && e$1.__esModule ? function() {
				return e$1.default;
			} : function() {
				return e$1;
			};
			return r.d(t$1, "a", t$1), t$1;
		}, r.o = function(e$1, t$1) {
			return Object.prototype.hasOwnProperty.call(e$1, t$1);
		}, r.p = "", r(r.s = 9);
	}([
		function(e, t) {
			e.exports = require_react();
		},
		function(e, t, r) {
			var n;
			/*!
			Copyright (c) 2017 Jed Watson.
			Licensed under the MIT License (MIT), see
			http://jedwatson.github.io/classnames
			*/ (function() {
				var r$1 = {}.hasOwnProperty;
				function a() {
					for (var e$1 = [], t$1 = 0; t$1 < arguments.length; t$1++) {
						var n$1 = arguments[t$1];
						if (n$1) {
							var o = typeof n$1;
							if ("string" === o || "number" === o) e$1.push(n$1);
							else if (Array.isArray(n$1) && n$1.length) {
								var i = a.apply(null, n$1);
								i && e$1.push(i);
							} else if ("object" === o) for (var u in n$1) r$1.call(n$1, u) && n$1[u] && e$1.push(u);
						}
					}
					return e$1.join(" ");
				}
				e.exports ? (a.default = a, e.exports = a) : void 0 === (n = function() {
					return a;
				}.apply(t, [])) || (e.exports = n);
			})();
		},
		function(e, t, r) {
			(function(t$1) {
				var r$1 = /^\s+|\s+$/g, n = /^[-+]0x[0-9a-f]+$/i, a = /^0b[01]+$/i, o = /^0o[0-7]+$/i, i = parseInt, u = "object" == typeof t$1 && t$1 && t$1.Object === Object && t$1, c = "object" == typeof self && self && self.Object === Object && self, s = u || c || Function("return this")(), l = Object.prototype.toString, f = s.Symbol, d = f ? f.prototype : void 0, p = d ? d.toString : void 0;
				function h(e$1) {
					if ("string" == typeof e$1) return e$1;
					if (y(e$1)) return p ? p.call(e$1) : "";
					var t$2 = e$1 + "";
					return "0" == t$2 && 1 / e$1 == -Infinity ? "-0" : t$2;
				}
				function m(e$1) {
					var t$2 = typeof e$1;
					return !!e$1 && ("object" == t$2 || "function" == t$2);
				}
				function y(e$1) {
					return "symbol" == typeof e$1 || function(e$2) {
						return !!e$2 && "object" == typeof e$2;
					}(e$1) && "[object Symbol]" == l.call(e$1);
				}
				function b(e$1) {
					return e$1 ? (e$1 = function(e$2) {
						if ("number" == typeof e$2) return e$2;
						if (y(e$2)) return NaN;
						if (m(e$2)) {
							var t$2 = "function" == typeof e$2.valueOf ? e$2.valueOf() : e$2;
							e$2 = m(t$2) ? t$2 + "" : t$2;
						}
						if ("string" != typeof e$2) return 0 === e$2 ? e$2 : +e$2;
						e$2 = e$2.replace(r$1, "");
						var u$1 = a.test(e$2);
						return u$1 || o.test(e$2) ? i(e$2.slice(2), u$1 ? 2 : 8) : n.test(e$2) ? NaN : +e$2;
					}(e$1)) === Infinity || e$1 === -Infinity ? 17976931348623157e292 * (e$1 < 0 ? -1 : 1) : e$1 == e$1 ? e$1 : 0 : 0 === e$1 ? e$1 : 0;
				}
				e.exports = function(e$1, t$2, r$2) {
					var n$1, a$1, o$1, i$1;
					return e$1 = null == (n$1 = e$1) ? "" : h(n$1), a$1 = function(e$2) {
						var t$3 = b(e$2), r$3 = t$3 % 1;
						return t$3 == t$3 ? r$3 ? t$3 - r$3 : t$3 : 0;
					}(r$2), o$1 = 0, i$1 = e$1.length, a$1 == a$1 && (void 0 !== i$1 && (a$1 = a$1 <= i$1 ? a$1 : i$1), void 0 !== o$1 && (a$1 = a$1 >= o$1 ? a$1 : o$1)), r$2 = a$1, t$2 = h(t$2), e$1.slice(r$2, r$2 + t$2.length) == t$2;
				};
			}).call(this, r(3));
		},
		function(e, t) {
			var r = function() {
				return this;
			}();
			try {
				r = r || new Function("return this")();
			} catch (e$1) {
				"object" == typeof window && (r = window);
			}
			e.exports = r;
		},
		function(e, t, r) {
			(function(t$1) {
				var r$1 = /^\[object .+?Constructor\]$/, n = "object" == typeof t$1 && t$1 && t$1.Object === Object && t$1, a = "object" == typeof self && self && self.Object === Object && self, o = n || a || Function("return this")();
				var i, u = Array.prototype, c = Function.prototype, s = Object.prototype, l = o["__core-js_shared__"], f = (i = /[^.]+$/.exec(l && l.keys && l.keys.IE_PROTO || "")) ? "Symbol(src)_1." + i : "", d = c.toString, p = s.hasOwnProperty, h = s.toString, m = RegExp("^" + d.call(p).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), y = u.splice, b = x(o, "Map"), g = x(Object, "create");
				function v(e$1) {
					var t$2 = -1, r$2 = e$1 ? e$1.length : 0;
					for (this.clear(); ++t$2 < r$2;) {
						var n$1 = e$1[t$2];
						this.set(n$1[0], n$1[1]);
					}
				}
				function C(e$1) {
					var t$2 = -1, r$2 = e$1 ? e$1.length : 0;
					for (this.clear(); ++t$2 < r$2;) {
						var n$1 = e$1[t$2];
						this.set(n$1[0], n$1[1]);
					}
				}
				function _(e$1) {
					var t$2 = -1, r$2 = e$1 ? e$1.length : 0;
					for (this.clear(); ++t$2 < r$2;) {
						var n$1 = e$1[t$2];
						this.set(n$1[0], n$1[1]);
					}
				}
				function w(e$1, t$2) {
					for (var r$2, n$1, a$1 = e$1.length; a$1--;) if ((r$2 = e$1[a$1][0]) === (n$1 = t$2) || r$2 != r$2 && n$1 != n$1) return a$1;
					return -1;
				}
				function S(e$1) {
					return !(!O(e$1) || (t$2 = e$1, f && f in t$2)) && (function(e$2) {
						var t$3 = O(e$2) ? h.call(e$2) : "";
						return "[object Function]" == t$3 || "[object GeneratorFunction]" == t$3;
					}(e$1) || function(e$2) {
						var t$3 = !1;
						if (null != e$2 && "function" != typeof e$2.toString) try {
							t$3 = !!(e$2 + "");
						} catch (e$3) {}
						return t$3;
					}(e$1) ? m : r$1).test(function(e$2) {
						if (null != e$2) {
							try {
								return d.call(e$2);
							} catch (e$3) {}
							try {
								return e$2 + "";
							} catch (e$3) {}
						}
						return "";
					}(e$1));
					var t$2;
				}
				function j(e$1, t$2) {
					var r$2, n$1, a$1 = e$1.__data__;
					return ("string" == (n$1 = typeof (r$2 = t$2)) || "number" == n$1 || "symbol" == n$1 || "boolean" == n$1 ? "__proto__" !== r$2 : null === r$2) ? a$1["string" == typeof t$2 ? "string" : "hash"] : a$1.map;
				}
				function x(e$1, t$2) {
					var r$2 = function(e$2, t$3) {
						return null == e$2 ? void 0 : e$2[t$3];
					}(e$1, t$2);
					return S(r$2) ? r$2 : void 0;
				}
				function N(e$1, t$2) {
					if ("function" != typeof e$1 || t$2 && "function" != typeof t$2) throw new TypeError("Expected a function");
					var r$2 = function() {
						var n$1 = arguments, a$1 = t$2 ? t$2.apply(this, n$1) : n$1[0], o$1 = r$2.cache;
						if (o$1.has(a$1)) return o$1.get(a$1);
						var i$1 = e$1.apply(this, n$1);
						return r$2.cache = o$1.set(a$1, i$1), i$1;
					};
					return r$2.cache = new (N.Cache || _)(), r$2;
				}
				function O(e$1) {
					var t$2 = typeof e$1;
					return !!e$1 && ("object" == t$2 || "function" == t$2);
				}
				v.prototype.clear = function() {
					this.__data__ = g ? g(null) : {};
				}, v.prototype.delete = function(e$1) {
					return this.has(e$1) && delete this.__data__[e$1];
				}, v.prototype.get = function(e$1) {
					var t$2 = this.__data__;
					if (g) {
						var r$2 = t$2[e$1];
						return "__lodash_hash_undefined__" === r$2 ? void 0 : r$2;
					}
					return p.call(t$2, e$1) ? t$2[e$1] : void 0;
				}, v.prototype.has = function(e$1) {
					var t$2 = this.__data__;
					return g ? void 0 !== t$2[e$1] : p.call(t$2, e$1);
				}, v.prototype.set = function(e$1, t$2) {
					return this.__data__[e$1] = g && void 0 === t$2 ? "__lodash_hash_undefined__" : t$2, this;
				}, C.prototype.clear = function() {
					this.__data__ = [];
				}, C.prototype.delete = function(e$1) {
					var t$2 = this.__data__, r$2 = w(t$2, e$1);
					return !(r$2 < 0) && (r$2 == t$2.length - 1 ? t$2.pop() : y.call(t$2, r$2, 1), !0);
				}, C.prototype.get = function(e$1) {
					var t$2 = this.__data__, r$2 = w(t$2, e$1);
					return r$2 < 0 ? void 0 : t$2[r$2][1];
				}, C.prototype.has = function(e$1) {
					return w(this.__data__, e$1) > -1;
				}, C.prototype.set = function(e$1, t$2) {
					var r$2 = this.__data__, n$1 = w(r$2, e$1);
					return n$1 < 0 ? r$2.push([e$1, t$2]) : r$2[n$1][1] = t$2, this;
				}, _.prototype.clear = function() {
					this.__data__ = {
						hash: new v(),
						map: new (b || C)(),
						string: new v()
					};
				}, _.prototype.delete = function(e$1) {
					return j(this, e$1).delete(e$1);
				}, _.prototype.get = function(e$1) {
					return j(this, e$1).get(e$1);
				}, _.prototype.has = function(e$1) {
					return j(this, e$1).has(e$1);
				}, _.prototype.set = function(e$1, t$2) {
					return j(this, e$1).set(e$1, t$2), this;
				}, N.Cache = _, e.exports = N;
			}).call(this, r(3));
		},
		function(e, t, r) {
			(function(t$1) {
				var r$1 = /^\s+|\s+$/g, n = /^[-+]0x[0-9a-f]+$/i, a = /^0b[01]+$/i, o = /^0o[0-7]+$/i, i = parseInt, u = "object" == typeof t$1 && t$1 && t$1.Object === Object && t$1, c = "object" == typeof self && self && self.Object === Object && self, s = u || c || Function("return this")(), l = Object.prototype.toString, f = Math.max, d = Math.min, p = function() {
					return s.Date.now();
				};
				function h(e$1) {
					var t$2 = typeof e$1;
					return !!e$1 && ("object" == t$2 || "function" == t$2);
				}
				function m(e$1) {
					if ("number" == typeof e$1) return e$1;
					if (function(e$2) {
						return "symbol" == typeof e$2 || function(e$3) {
							return !!e$3 && "object" == typeof e$3;
						}(e$2) && "[object Symbol]" == l.call(e$2);
					}(e$1)) return NaN;
					if (h(e$1)) {
						var t$2 = "function" == typeof e$1.valueOf ? e$1.valueOf() : e$1;
						e$1 = h(t$2) ? t$2 + "" : t$2;
					}
					if ("string" != typeof e$1) return 0 === e$1 ? e$1 : +e$1;
					e$1 = e$1.replace(r$1, "");
					var u$1 = a.test(e$1);
					return u$1 || o.test(e$1) ? i(e$1.slice(2), u$1 ? 2 : 8) : n.test(e$1) ? NaN : +e$1;
				}
				e.exports = function(e$1, t$2, r$2) {
					var n$1, a$1, o$1, i$1, u$1, c$1, s$1 = 0, l$1 = !1, y = !1, b = !0;
					if ("function" != typeof e$1) throw new TypeError("Expected a function");
					function g(t$3) {
						var r$3 = n$1, o$2 = a$1;
						return n$1 = a$1 = void 0, s$1 = t$3, i$1 = e$1.apply(o$2, r$3);
					}
					function v(e$2) {
						return s$1 = e$2, u$1 = setTimeout(_, t$2), l$1 ? g(e$2) : i$1;
					}
					function C(e$2) {
						var r$3 = e$2 - c$1;
						return void 0 === c$1 || r$3 >= t$2 || r$3 < 0 || y && e$2 - s$1 >= o$1;
					}
					function _() {
						var e$2 = p();
						if (C(e$2)) return w(e$2);
						u$1 = setTimeout(_, function(e$3) {
							var r$3 = t$2 - (e$3 - c$1);
							return y ? d(r$3, o$1 - (e$3 - s$1)) : r$3;
						}(e$2));
					}
					function w(e$2) {
						return u$1 = void 0, b && n$1 ? g(e$2) : (n$1 = a$1 = void 0, i$1);
					}
					function S() {
						var e$2 = p(), r$3 = C(e$2);
						if (n$1 = arguments, a$1 = this, c$1 = e$2, r$3) {
							if (void 0 === u$1) return v(c$1);
							if (y) return u$1 = setTimeout(_, t$2), g(c$1);
						}
						return void 0 === u$1 && (u$1 = setTimeout(_, t$2)), i$1;
					}
					return t$2 = m(t$2) || 0, h(r$2) && (l$1 = !!r$2.leading, o$1 = (y = "maxWait" in r$2) ? f(m(r$2.maxWait) || 0, t$2) : o$1, b = "trailing" in r$2 ? !!r$2.trailing : b), S.cancel = function() {
						void 0 !== u$1 && clearTimeout(u$1), s$1 = 0, n$1 = c$1 = a$1 = u$1 = void 0;
					}, S.flush = function() {
						return void 0 === u$1 ? i$1 : w(p());
					}, S;
				};
			}).call(this, r(3));
		},
		function(e, t, r) {
			(function(e$1, r$1) {
				var n = "[object Arguments]", a = "[object Map]", o = "[object Object]", i = "[object Set]", u = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, c = /^\w*$/, s = /^\./, l = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, f = /\\(\\)?/g, d = /^\[object .+?Constructor\]$/, p = /^(?:0|[1-9]\d*)$/, h = {};
				h["[object Float32Array]"] = h["[object Float64Array]"] = h["[object Int8Array]"] = h["[object Int16Array]"] = h["[object Int32Array]"] = h["[object Uint8Array]"] = h["[object Uint8ClampedArray]"] = h["[object Uint16Array]"] = h["[object Uint32Array]"] = !0, h[n] = h["[object Array]"] = h["[object ArrayBuffer]"] = h["[object Boolean]"] = h["[object DataView]"] = h["[object Date]"] = h["[object Error]"] = h["[object Function]"] = h[a] = h["[object Number]"] = h[o] = h["[object RegExp]"] = h[i] = h["[object String]"] = h["[object WeakMap]"] = !1;
				var m = "object" == typeof e$1 && e$1 && e$1.Object === Object && e$1, y = "object" == typeof self && self && self.Object === Object && self, b = m || y || Function("return this")(), g = t && !t.nodeType && t, v = g && "object" == typeof r$1 && r$1 && !r$1.nodeType && r$1, C = v && v.exports === g && m.process, _ = function() {
					try {
						return C && C.binding("util");
					} catch (e$2) {}
				}(), w = _ && _.isTypedArray;
				function S(e$2, t$1, r$2, n$1) {
					var a$1 = -1, o$1 = e$2 ? e$2.length : 0;
					for (n$1 && o$1 && (r$2 = e$2[++a$1]); ++a$1 < o$1;) r$2 = t$1(r$2, e$2[a$1], a$1, e$2);
					return r$2;
				}
				function j(e$2, t$1) {
					for (var r$2 = -1, n$1 = e$2 ? e$2.length : 0; ++r$2 < n$1;) if (t$1(e$2[r$2], r$2, e$2)) return !0;
					return !1;
				}
				function x(e$2, t$1, r$2, n$1, a$1) {
					return a$1(e$2, (function(e$3, a$2, o$1) {
						r$2 = n$1 ? (n$1 = !1, e$3) : t$1(r$2, e$3, a$2, o$1);
					})), r$2;
				}
				function N(e$2) {
					var t$1 = !1;
					if (null != e$2 && "function" != typeof e$2.toString) try {
						t$1 = !!(e$2 + "");
					} catch (e$3) {}
					return t$1;
				}
				function O(e$2) {
					var t$1 = -1, r$2 = Array(e$2.size);
					return e$2.forEach((function(e$3, n$1) {
						r$2[++t$1] = [n$1, e$3];
					})), r$2;
				}
				function k(e$2) {
					var t$1 = -1, r$2 = Array(e$2.size);
					return e$2.forEach((function(e$3) {
						r$2[++t$1] = e$3;
					})), r$2;
				}
				var E, T, I, A = Array.prototype, D = Function.prototype, P = Object.prototype, F = b["__core-js_shared__"], M = (E = /[^.]+$/.exec(F && F.keys && F.keys.IE_PROTO || "")) ? "Symbol(src)_1." + E : "", R = D.toString, L = P.hasOwnProperty, z = P.toString, B = RegExp("^" + R.call(L).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), G = b.Symbol, $ = b.Uint8Array, V = P.propertyIsEnumerable, K = A.splice, U = (T = Object.keys, I = Object, function(e$2) {
					return T(I(e$2));
				}), q = Ne(b, "DataView"), H = Ne(b, "Map"), W = Ne(b, "Promise"), J = Ne(b, "Set"), Z = Ne(b, "WeakMap"), Q = Ne(Object, "create"), Y = Pe(q), X = Pe(H), ee = Pe(W), te = Pe(J), re = Pe(Z), ne = G ? G.prototype : void 0, ae = ne ? ne.valueOf : void 0, oe = ne ? ne.toString : void 0;
				function ie(e$2) {
					var t$1 = -1, r$2 = e$2 ? e$2.length : 0;
					for (this.clear(); ++t$1 < r$2;) {
						var n$1 = e$2[t$1];
						this.set(n$1[0], n$1[1]);
					}
				}
				function ue(e$2) {
					var t$1 = -1, r$2 = e$2 ? e$2.length : 0;
					for (this.clear(); ++t$1 < r$2;) {
						var n$1 = e$2[t$1];
						this.set(n$1[0], n$1[1]);
					}
				}
				function ce(e$2) {
					var t$1 = -1, r$2 = e$2 ? e$2.length : 0;
					for (this.clear(); ++t$1 < r$2;) {
						var n$1 = e$2[t$1];
						this.set(n$1[0], n$1[1]);
					}
				}
				function se(e$2) {
					var t$1 = -1, r$2 = e$2 ? e$2.length : 0;
					for (this.__data__ = new ce(); ++t$1 < r$2;) this.add(e$2[t$1]);
				}
				function le(e$2) {
					this.__data__ = new ue(e$2);
				}
				function fe(e$2, t$1) {
					var r$2 = Le(e$2) || Re(e$2) ? function(e$3, t$2) {
						for (var r$3 = -1, n$2 = Array(e$3); ++r$3 < e$3;) n$2[r$3] = t$2(r$3);
						return n$2;
					}(e$2.length, String) : [], n$1 = r$2.length, a$1 = !!n$1;
					for (var o$1 in e$2) !t$1 && !L.call(e$2, o$1) || a$1 && ("length" == o$1 || ke(o$1, n$1)) || r$2.push(o$1);
					return r$2;
				}
				function de(e$2, t$1) {
					for (var r$2 = e$2.length; r$2--;) if (Me(e$2[r$2][0], t$1)) return r$2;
					return -1;
				}
				ie.prototype.clear = function() {
					this.__data__ = Q ? Q(null) : {};
				}, ie.prototype.delete = function(e$2) {
					return this.has(e$2) && delete this.__data__[e$2];
				}, ie.prototype.get = function(e$2) {
					var t$1 = this.__data__;
					if (Q) {
						var r$2 = t$1[e$2];
						return "__lodash_hash_undefined__" === r$2 ? void 0 : r$2;
					}
					return L.call(t$1, e$2) ? t$1[e$2] : void 0;
				}, ie.prototype.has = function(e$2) {
					var t$1 = this.__data__;
					return Q ? void 0 !== t$1[e$2] : L.call(t$1, e$2);
				}, ie.prototype.set = function(e$2, t$1) {
					return this.__data__[e$2] = Q && void 0 === t$1 ? "__lodash_hash_undefined__" : t$1, this;
				}, ue.prototype.clear = function() {
					this.__data__ = [];
				}, ue.prototype.delete = function(e$2) {
					var t$1 = this.__data__, r$2 = de(t$1, e$2);
					return !(r$2 < 0) && (r$2 == t$1.length - 1 ? t$1.pop() : K.call(t$1, r$2, 1), !0);
				}, ue.prototype.get = function(e$2) {
					var t$1 = this.__data__, r$2 = de(t$1, e$2);
					return r$2 < 0 ? void 0 : t$1[r$2][1];
				}, ue.prototype.has = function(e$2) {
					return de(this.__data__, e$2) > -1;
				}, ue.prototype.set = function(e$2, t$1) {
					var r$2 = this.__data__, n$1 = de(r$2, e$2);
					return n$1 < 0 ? r$2.push([e$2, t$1]) : r$2[n$1][1] = t$1, this;
				}, ce.prototype.clear = function() {
					this.__data__ = {
						hash: new ie(),
						map: new (H || ue)(),
						string: new ie()
					};
				}, ce.prototype.delete = function(e$2) {
					return xe(this, e$2).delete(e$2);
				}, ce.prototype.get = function(e$2) {
					return xe(this, e$2).get(e$2);
				}, ce.prototype.has = function(e$2) {
					return xe(this, e$2).has(e$2);
				}, ce.prototype.set = function(e$2, t$1) {
					return xe(this, e$2).set(e$2, t$1), this;
				}, se.prototype.add = se.prototype.push = function(e$2) {
					return this.__data__.set(e$2, "__lodash_hash_undefined__"), this;
				}, se.prototype.has = function(e$2) {
					return this.__data__.has(e$2);
				}, le.prototype.clear = function() {
					this.__data__ = new ue();
				}, le.prototype.delete = function(e$2) {
					return this.__data__.delete(e$2);
				}, le.prototype.get = function(e$2) {
					return this.__data__.get(e$2);
				}, le.prototype.has = function(e$2) {
					return this.__data__.has(e$2);
				}, le.prototype.set = function(e$2, t$1) {
					var r$2 = this.__data__;
					if (r$2 instanceof ue) {
						var n$1 = r$2.__data__;
						if (!H || n$1.length < 199) return n$1.push([e$2, t$1]), this;
						r$2 = this.__data__ = new ce(n$1);
					}
					return r$2.set(e$2, t$1), this;
				};
				var pe, he, me = (pe = function(e$2, t$1) {
					return e$2 && ye(e$2, t$1, qe);
				}, function(e$2, t$1) {
					if (null == e$2) return e$2;
					if (!ze(e$2)) return pe(e$2, t$1);
					for (var r$2 = e$2.length, n$1 = he ? r$2 : -1, a$1 = Object(e$2); (he ? n$1-- : ++n$1 < r$2) && !1 !== t$1(a$1[n$1], n$1, a$1););
					return e$2;
				}), ye = function(e$2) {
					return function(t$1, r$2, n$1) {
						for (var a$1 = -1, o$1 = Object(t$1), i$1 = n$1(t$1), u$1 = i$1.length; u$1--;) {
							var c$1 = i$1[e$2 ? u$1 : ++a$1];
							if (!1 === r$2(o$1[c$1], c$1, o$1)) break;
						}
						return t$1;
					};
				}();
				function be(e$2, t$1) {
					for (var r$2 = 0, n$1 = (t$1 = Ee(t$1, e$2) ? [t$1] : Se(t$1)).length; null != e$2 && r$2 < n$1;) e$2 = e$2[De(t$1[r$2++])];
					return r$2 && r$2 == n$1 ? e$2 : void 0;
				}
				function ge(e$2, t$1) {
					return null != e$2 && t$1 in Object(e$2);
				}
				function ve(e$2, t$1, r$2, u$1, c$1) {
					return e$2 === t$1 || (null == e$2 || null == t$1 || !$e(e$2) && !Ve(t$1) ? e$2 != e$2 && t$1 != t$1 : function(e$3, t$2, r$3, u$2, c$2, s$1) {
						var l$1 = Le(e$3), f$1 = Le(t$2), d$1 = "[object Array]", p$1 = "[object Array]";
						l$1 || (d$1 = (d$1 = Oe(e$3)) == n ? o : d$1);
						f$1 || (p$1 = (p$1 = Oe(t$2)) == n ? o : p$1);
						var h$1 = d$1 == o && !N(e$3), m$1 = p$1 == o && !N(t$2), y$1 = d$1 == p$1;
						if (y$1 && !h$1) return s$1 || (s$1 = new le()), l$1 || Ue(e$3) ? je(e$3, t$2, r$3, u$2, c$2, s$1) : function(e$4, t$3, r$4, n$1, o$1, u$3, c$3) {
							switch (r$4) {
								case "[object DataView]":
									if (e$4.byteLength != t$3.byteLength || e$4.byteOffset != t$3.byteOffset) return !1;
									e$4 = e$4.buffer, t$3 = t$3.buffer;
								case "[object ArrayBuffer]": return !(e$4.byteLength != t$3.byteLength || !n$1(new $(e$4), new $(t$3)));
								case "[object Boolean]":
								case "[object Date]":
								case "[object Number]": return Me(+e$4, +t$3);
								case "[object Error]": return e$4.name == t$3.name && e$4.message == t$3.message;
								case "[object RegExp]":
								case "[object String]": return e$4 == t$3 + "";
								case a: var s$2 = O;
								case i:
									var l$2 = 2 & u$3;
									if (s$2 || (s$2 = k), e$4.size != t$3.size && !l$2) return !1;
									var f$2 = c$3.get(e$4);
									if (f$2) return f$2 == t$3;
									u$3 |= 1, c$3.set(e$4, t$3);
									var d$2 = je(s$2(e$4), s$2(t$3), n$1, o$1, u$3, c$3);
									return c$3.delete(e$4), d$2;
								case "[object Symbol]": if (ae) return ae.call(e$4) == ae.call(t$3);
							}
							return !1;
						}(e$3, t$2, d$1, r$3, u$2, c$2, s$1);
						if (!(2 & c$2)) {
							var b$1 = h$1 && L.call(e$3, "__wrapped__"), g$1 = m$1 && L.call(t$2, "__wrapped__");
							if (b$1 || g$1) {
								var v$1 = b$1 ? e$3.value() : e$3, C$1 = g$1 ? t$2.value() : t$2;
								return s$1 || (s$1 = new le()), r$3(v$1, C$1, u$2, c$2, s$1);
							}
						}
						if (!y$1) return !1;
						return s$1 || (s$1 = new le()), function(e$4, t$3, r$4, n$1, a$1, o$1) {
							var i$1 = 2 & a$1, u$3 = qe(e$4), c$3 = u$3.length, s$2 = qe(t$3).length;
							if (c$3 != s$2 && !i$1) return !1;
							var l$2 = c$3;
							for (; l$2--;) {
								var f$2 = u$3[l$2];
								if (!(i$1 ? f$2 in t$3 : L.call(t$3, f$2))) return !1;
							}
							var d$2 = o$1.get(e$4);
							if (d$2 && o$1.get(t$3)) return d$2 == t$3;
							var p$2 = !0;
							o$1.set(e$4, t$3), o$1.set(t$3, e$4);
							var h$2 = i$1;
							for (; ++l$2 < c$3;) {
								f$2 = u$3[l$2];
								var m$2 = e$4[f$2], y$2 = t$3[f$2];
								if (n$1) var b$2 = i$1 ? n$1(y$2, m$2, f$2, t$3, e$4, o$1) : n$1(m$2, y$2, f$2, e$4, t$3, o$1);
								if (!(void 0 === b$2 ? m$2 === y$2 || r$4(m$2, y$2, n$1, a$1, o$1) : b$2)) {
									p$2 = !1;
									break;
								}
								h$2 || (h$2 = "constructor" == f$2);
							}
							if (p$2 && !h$2) {
								var g$2 = e$4.constructor, v$2 = t$3.constructor;
								g$2 == v$2 || !("constructor" in e$4) || !("constructor" in t$3) || "function" == typeof g$2 && g$2 instanceof g$2 && "function" == typeof v$2 && v$2 instanceof v$2 || (p$2 = !1);
							}
							return o$1.delete(e$4), o$1.delete(t$3), p$2;
						}(e$3, t$2, r$3, u$2, c$2, s$1);
					}(e$2, t$1, ve, r$2, u$1, c$1));
				}
				function Ce(e$2) {
					return !(!$e(e$2) || function(e$3) {
						return !!M && M in e$3;
					}(e$2)) && (Be(e$2) || N(e$2) ? B : d).test(Pe(e$2));
				}
				function _e(e$2) {
					return "function" == typeof e$2 ? e$2 : null == e$2 ? He : "object" == typeof e$2 ? Le(e$2) ? function(e$3, t$2) {
						if (Ee(e$3) && Te(t$2)) return Ie(De(e$3), t$2);
						return function(r$3) {
							var n$1 = function(e$4, t$3, r$4) {
								var n$2 = null == e$4 ? void 0 : be(e$4, t$3);
								return void 0 === n$2 ? r$4 : n$2;
							}(r$3, e$3);
							return void 0 === n$1 && n$1 === t$2 ? function(e$4, t$3) {
								return null != e$4 && function(e$5, t$4, r$4) {
									t$4 = Ee(t$4, e$5) ? [t$4] : Se(t$4);
									var n$2, a$1 = -1, o$1 = t$4.length;
									for (; ++a$1 < o$1;) {
										var i$1 = De(t$4[a$1]);
										if (!(n$2 = null != e$5 && r$4(e$5, i$1))) break;
										e$5 = e$5[i$1];
									}
									if (n$2) return n$2;
									return !!(o$1 = e$5 ? e$5.length : 0) && Ge(o$1) && ke(i$1, o$1) && (Le(e$5) || Re(e$5));
								}(e$4, t$3, ge);
							}(r$3, e$3) : ve(t$2, n$1, void 0, 3);
						};
					}(e$2[0], e$2[1]) : function(e$3) {
						var t$2 = function(e$4) {
							var t$3 = qe(e$4), r$3 = t$3.length;
							for (; r$3--;) {
								var n$1 = t$3[r$3], a$1 = e$4[n$1];
								t$3[r$3] = [
									n$1,
									a$1,
									Te(a$1)
								];
							}
							return t$3;
						}(e$3);
						if (1 == t$2.length && t$2[0][2]) return Ie(t$2[0][0], t$2[0][1]);
						return function(r$3) {
							return r$3 === e$3 || function(e$4, t$3, r$4, n$1) {
								var a$1 = r$4.length, o$1 = a$1, i$1 = !n$1;
								if (null == e$4) return !o$1;
								for (e$4 = Object(e$4); a$1--;) {
									var u$1 = r$4[a$1];
									if (i$1 && u$1[2] ? u$1[1] !== e$4[u$1[0]] : !(u$1[0] in e$4)) return !1;
								}
								for (; ++a$1 < o$1;) {
									var c$1 = (u$1 = r$4[a$1])[0], s$1 = e$4[c$1], l$1 = u$1[1];
									if (i$1 && u$1[2]) {
										if (void 0 === s$1 && !(c$1 in e$4)) return !1;
									} else {
										var f$1 = new le();
										if (n$1) var d$1 = n$1(s$1, l$1, c$1, e$4, t$3, f$1);
										if (!(void 0 === d$1 ? ve(l$1, s$1, n$1, 3, f$1) : d$1)) return !1;
									}
								}
								return !0;
							}(r$3, e$3, t$2);
						};
					}(e$2) : Ee(t$1 = e$2) ? (r$2 = De(t$1), function(e$3) {
						return null == e$3 ? void 0 : e$3[r$2];
					}) : function(e$3) {
						return function(t$2) {
							return be(t$2, e$3);
						};
					}(t$1);
					var t$1, r$2;
				}
				function we(e$2) {
					if (r$2 = (t$1 = e$2) && t$1.constructor, n$1 = "function" == typeof r$2 && r$2.prototype || P, t$1 !== n$1) return U(e$2);
					var t$1, r$2, n$1, a$1 = [];
					for (var o$1 in Object(e$2)) L.call(e$2, o$1) && "constructor" != o$1 && a$1.push(o$1);
					return a$1;
				}
				function Se(e$2) {
					return Le(e$2) ? e$2 : Ae(e$2);
				}
				function je(e$2, t$1, r$2, n$1, a$1, o$1) {
					var i$1 = 2 & a$1, u$1 = e$2.length, c$1 = t$1.length;
					if (u$1 != c$1 && !(i$1 && c$1 > u$1)) return !1;
					var s$1 = o$1.get(e$2);
					if (s$1 && o$1.get(t$1)) return s$1 == t$1;
					var l$1 = -1, f$1 = !0, d$1 = 1 & a$1 ? new se() : void 0;
					for (o$1.set(e$2, t$1), o$1.set(t$1, e$2); ++l$1 < u$1;) {
						var p$1 = e$2[l$1], h$1 = t$1[l$1];
						if (n$1) var m$1 = i$1 ? n$1(h$1, p$1, l$1, t$1, e$2, o$1) : n$1(p$1, h$1, l$1, e$2, t$1, o$1);
						if (void 0 !== m$1) {
							if (m$1) continue;
							f$1 = !1;
							break;
						}
						if (d$1) {
							if (!j(t$1, (function(e$3, t$2) {
								if (!d$1.has(t$2) && (p$1 === e$3 || r$2(p$1, e$3, n$1, a$1, o$1))) return d$1.add(t$2);
							}))) {
								f$1 = !1;
								break;
							}
						} else if (p$1 !== h$1 && !r$2(p$1, h$1, n$1, a$1, o$1)) {
							f$1 = !1;
							break;
						}
					}
					return o$1.delete(e$2), o$1.delete(t$1), f$1;
				}
				function xe(e$2, t$1) {
					var r$2, n$1, a$1 = e$2.__data__;
					return ("string" == (n$1 = typeof (r$2 = t$1)) || "number" == n$1 || "symbol" == n$1 || "boolean" == n$1 ? "__proto__" !== r$2 : null === r$2) ? a$1["string" == typeof t$1 ? "string" : "hash"] : a$1.map;
				}
				function Ne(e$2, t$1) {
					var r$2 = function(e$3, t$2) {
						return null == e$3 ? void 0 : e$3[t$2];
					}(e$2, t$1);
					return Ce(r$2) ? r$2 : void 0;
				}
				var Oe = function(e$2) {
					return z.call(e$2);
				};
				function ke(e$2, t$1) {
					return !!(t$1 = null == t$1 ? 9007199254740991 : t$1) && ("number" == typeof e$2 || p.test(e$2)) && e$2 > -1 && e$2 % 1 == 0 && e$2 < t$1;
				}
				function Ee(e$2, t$1) {
					if (Le(e$2)) return !1;
					var r$2 = typeof e$2;
					return !("number" != r$2 && "symbol" != r$2 && "boolean" != r$2 && null != e$2 && !Ke(e$2)) || c.test(e$2) || !u.test(e$2) || null != t$1 && e$2 in Object(t$1);
				}
				function Te(e$2) {
					return e$2 == e$2 && !$e(e$2);
				}
				function Ie(e$2, t$1) {
					return function(r$2) {
						return null != r$2 && r$2[e$2] === t$1 && (void 0 !== t$1 || e$2 in Object(r$2));
					};
				}
				(q && "[object DataView]" != Oe(new q(/* @__PURE__ */ new ArrayBuffer(1))) || H && Oe(new H()) != a || W && "[object Promise]" != Oe(W.resolve()) || J && Oe(new J()) != i || Z && "[object WeakMap]" != Oe(new Z())) && (Oe = function(e$2) {
					var t$1 = z.call(e$2), r$2 = t$1 == o ? e$2.constructor : void 0, n$1 = r$2 ? Pe(r$2) : void 0;
					if (n$1) switch (n$1) {
						case Y: return "[object DataView]";
						case X: return a;
						case ee: return "[object Promise]";
						case te: return i;
						case re: return "[object WeakMap]";
					}
					return t$1;
				});
				var Ae = Fe((function(e$2) {
					var t$1;
					e$2 = null == (t$1 = e$2) ? "" : function(e$3) {
						if ("string" == typeof e$3) return e$3;
						if (Ke(e$3)) return oe ? oe.call(e$3) : "";
						var t$2 = e$3 + "";
						return "0" == t$2 && 1 / e$3 == -Infinity ? "-0" : t$2;
					}(t$1);
					var r$2 = [];
					return s.test(e$2) && r$2.push(""), e$2.replace(l, (function(e$3, t$2, n$1, a$1) {
						r$2.push(n$1 ? a$1.replace(f, "$1") : t$2 || e$3);
					})), r$2;
				}));
				function De(e$2) {
					if ("string" == typeof e$2 || Ke(e$2)) return e$2;
					var t$1 = e$2 + "";
					return "0" == t$1 && 1 / e$2 == -Infinity ? "-0" : t$1;
				}
				function Pe(e$2) {
					if (null != e$2) {
						try {
							return R.call(e$2);
						} catch (e$3) {}
						try {
							return e$2 + "";
						} catch (e$3) {}
					}
					return "";
				}
				function Fe(e$2, t$1) {
					if ("function" != typeof e$2 || t$1 && "function" != typeof t$1) throw new TypeError("Expected a function");
					var r$2 = function() {
						var n$1 = arguments, a$1 = t$1 ? t$1.apply(this, n$1) : n$1[0], o$1 = r$2.cache;
						if (o$1.has(a$1)) return o$1.get(a$1);
						var i$1 = e$2.apply(this, n$1);
						return r$2.cache = o$1.set(a$1, i$1), i$1;
					};
					return r$2.cache = new (Fe.Cache || ce)(), r$2;
				}
				function Me(e$2, t$1) {
					return e$2 === t$1 || e$2 != e$2 && t$1 != t$1;
				}
				function Re(e$2) {
					return function(e$3) {
						return Ve(e$3) && ze(e$3);
					}(e$2) && L.call(e$2, "callee") && (!V.call(e$2, "callee") || z.call(e$2) == n);
				}
				Fe.Cache = ce;
				var Le = Array.isArray;
				function ze(e$2) {
					return null != e$2 && Ge(e$2.length) && !Be(e$2);
				}
				function Be(e$2) {
					var t$1 = $e(e$2) ? z.call(e$2) : "";
					return "[object Function]" == t$1 || "[object GeneratorFunction]" == t$1;
				}
				function Ge(e$2) {
					return "number" == typeof e$2 && e$2 > -1 && e$2 % 1 == 0 && e$2 <= 9007199254740991;
				}
				function $e(e$2) {
					var t$1 = typeof e$2;
					return !!e$2 && ("object" == t$1 || "function" == t$1);
				}
				function Ve(e$2) {
					return !!e$2 && "object" == typeof e$2;
				}
				function Ke(e$2) {
					return "symbol" == typeof e$2 || Ve(e$2) && "[object Symbol]" == z.call(e$2);
				}
				var Ue = w ? function(e$2) {
					return function(t$1) {
						return e$2(t$1);
					};
				}(w) : function(e$2) {
					return Ve(e$2) && Ge(e$2.length) && !!h[z.call(e$2)];
				};
				function qe(e$2) {
					return ze(e$2) ? fe(e$2) : we(e$2);
				}
				function He(e$2) {
					return e$2;
				}
				r$1.exports = function(e$2, t$1, r$2) {
					var n$1 = Le(e$2) ? S : x, a$1 = arguments.length < 3;
					return n$1(e$2, _e(t$1), r$2, a$1, me);
				};
			}).call(this, r(3), r(7)(e));
		},
		function(e, t) {
			e.exports = function(e$1) {
				return e$1.webpackPolyfill || (e$1.deprecate = function() {}, e$1.paths = [], e$1.children || (e$1.children = []), Object.defineProperty(e$1, "loaded", {
					enumerable: !0,
					get: function() {
						return e$1.l;
					}
				}), Object.defineProperty(e$1, "id", {
					enumerable: !0,
					get: function() {
						return e$1.i;
					}
				}), e$1.webpackPolyfill = 1), e$1;
			};
		},
		function(e, t) {
			String.prototype.padEnd || (String.prototype.padEnd = function(e$1, t$1) {
				return e$1 >>= 0, t$1 = String(void 0 !== t$1 ? t$1 : " "), this.length > e$1 ? String(this) : ((e$1 -= this.length) > t$1.length && (t$1 += t$1.repeat(e$1 / t$1.length)), String(this) + t$1.slice(0, e$1));
			});
		},
		function(e, t, r) {
			function n(e$1, t$1, r$1) {
				return t$1 in e$1 ? Object.defineProperty(e$1, t$1, {
					value: r$1,
					enumerable: !0,
					configurable: !0,
					writable: !0
				}) : e$1[t$1] = r$1, e$1;
			}
			function a(e$1) {
				if (Symbol.iterator in Object(e$1) || "[object Arguments]" === Object.prototype.toString.call(e$1)) return Array.from(e$1);
			}
			function o(e$1) {
				return function(e$2) {
					if (Array.isArray(e$2)) {
						for (var t$1 = 0, r$1 = new Array(e$2.length); t$1 < e$2.length; t$1++) r$1[t$1] = e$2[t$1];
						return r$1;
					}
				}(e$1) || a(e$1) || function() {
					throw new TypeError("Invalid attempt to spread non-iterable instance");
				}();
			}
			function i(e$1) {
				if (Array.isArray(e$1)) return e$1;
			}
			function u() {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
			function c(e$1, t$1) {
				if (!(e$1 instanceof t$1)) throw new TypeError("Cannot call a class as a function");
			}
			function s(e$1, t$1) {
				for (var r$1 = 0; r$1 < t$1.length; r$1++) {
					var n$1 = t$1[r$1];
					n$1.enumerable = n$1.enumerable || !1, n$1.configurable = !0, "value" in n$1 && (n$1.writable = !0), Object.defineProperty(e$1, n$1.key, n$1);
				}
			}
			function l(e$1) {
				return (l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e$2) {
					return typeof e$2;
				} : function(e$2) {
					return e$2 && "function" == typeof Symbol && e$2.constructor === Symbol && e$2 !== Symbol.prototype ? "symbol" : typeof e$2;
				})(e$1);
			}
			function f(e$1) {
				return (f = "function" == typeof Symbol && "symbol" === l(Symbol.iterator) ? function(e$2) {
					return l(e$2);
				} : function(e$2) {
					return e$2 && "function" == typeof Symbol && e$2.constructor === Symbol && e$2 !== Symbol.prototype ? "symbol" : l(e$2);
				})(e$1);
			}
			function d(e$1) {
				if (void 0 === e$1) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
				return e$1;
			}
			function p(e$1) {
				return (p = Object.setPrototypeOf ? Object.getPrototypeOf : function(e$2) {
					return e$2.__proto__ || Object.getPrototypeOf(e$2);
				})(e$1);
			}
			function h(e$1, t$1) {
				return (h = Object.setPrototypeOf || function(e$2, t$2) {
					return e$2.__proto__ = t$2, e$2;
				})(e$1, t$1);
			}
			r.r(t);
			var m = r(0), y = r.n(m), b = r(5), g = r.n(b), v = r(4), C = r.n(v), _ = r(6), w = r.n(_), S = r(2), j = r.n(S), x = r(1), N = r.n(x);
			r(8);
			function O(e$1, t$1) {
				return i(e$1) || function(e$2, t$2) {
					var r$1 = [], n$1 = !0, a$1 = !1, o$1 = void 0;
					try {
						for (var i$1, u$1 = e$2[Symbol.iterator](); !(n$1 = (i$1 = u$1.next()).done) && (r$1.push(i$1.value), !t$2 || r$1.length !== t$2); n$1 = !0);
					} catch (e$3) {
						a$1 = !0, o$1 = e$3;
					} finally {
						try {
							n$1 || null == u$1.return || u$1.return();
						} finally {
							if (a$1) throw o$1;
						}
					}
					return r$1;
				}(e$1, t$1) || u();
			}
			var k = [
				[
					"Afghanistan",
					["asia"],
					"af",
					"93"
				],
				[
					"Albania",
					["europe"],
					"al",
					"355"
				],
				[
					"Algeria",
					["africa", "north-africa"],
					"dz",
					"213"
				],
				[
					"Andorra",
					["europe"],
					"ad",
					"376"
				],
				[
					"Angola",
					["africa"],
					"ao",
					"244"
				],
				[
					"Antigua and Barbuda",
					["america", "carribean"],
					"ag",
					"1268"
				],
				[
					"Argentina",
					["america", "south-america"],
					"ar",
					"54",
					"(..) ........",
					0,
					[
						"11",
						"221",
						"223",
						"261",
						"264",
						"2652",
						"280",
						"2905",
						"291",
						"2920",
						"2966",
						"299",
						"341",
						"342",
						"343",
						"351",
						"376",
						"379",
						"381",
						"3833",
						"385",
						"387",
						"388"
					]
				],
				[
					"Armenia",
					["asia", "ex-ussr"],
					"am",
					"374",
					".. ......"
				],
				[
					"Aruba",
					["america", "carribean"],
					"aw",
					"297"
				],
				[
					"Australia",
					["oceania"],
					"au",
					"61",
					"(..) .... ....",
					0,
					[
						"2",
						"3",
						"4",
						"7",
						"8",
						"02",
						"03",
						"04",
						"07",
						"08"
					]
				],
				[
					"Austria",
					["europe", "eu-union"],
					"at",
					"43"
				],
				[
					"Azerbaijan",
					["asia", "ex-ussr"],
					"az",
					"994",
					"(..) ... .. .."
				],
				[
					"Bahamas",
					["america", "carribean"],
					"bs",
					"1242"
				],
				[
					"Bahrain",
					["middle-east"],
					"bh",
					"973"
				],
				[
					"Bangladesh",
					["asia"],
					"bd",
					"880"
				],
				[
					"Barbados",
					["america", "carribean"],
					"bb",
					"1246"
				],
				[
					"Belarus",
					["europe", "ex-ussr"],
					"by",
					"375",
					"(..) ... .. .."
				],
				[
					"Belgium",
					["europe", "eu-union"],
					"be",
					"32",
					"... .. .. .."
				],
				[
					"Belize",
					["america", "central-america"],
					"bz",
					"501"
				],
				[
					"Benin",
					["africa"],
					"bj",
					"229"
				],
				[
					"Bhutan",
					["asia"],
					"bt",
					"975"
				],
				[
					"Bolivia",
					["america", "south-america"],
					"bo",
					"591"
				],
				[
					"Bosnia and Herzegovina",
					["europe", "ex-yugos"],
					"ba",
					"387"
				],
				[
					"Botswana",
					["africa"],
					"bw",
					"267"
				],
				[
					"Brazil",
					["america", "south-america"],
					"br",
					"55",
					"(..) ........."
				],
				[
					"British Indian Ocean Territory",
					["asia"],
					"io",
					"246"
				],
				[
					"Brunei",
					["asia"],
					"bn",
					"673"
				],
				[
					"Bulgaria",
					["europe", "eu-union"],
					"bg",
					"359"
				],
				[
					"Burkina Faso",
					["africa"],
					"bf",
					"226"
				],
				[
					"Burundi",
					["africa"],
					"bi",
					"257"
				],
				[
					"Cambodia",
					["asia"],
					"kh",
					"855"
				],
				[
					"Cameroon",
					["africa"],
					"cm",
					"237"
				],
				[
					"Canada",
					["america", "north-america"],
					"ca",
					"1",
					"(...) ...-....",
					1,
					[
						"204",
						"226",
						"236",
						"249",
						"250",
						"289",
						"306",
						"343",
						"365",
						"387",
						"403",
						"416",
						"418",
						"431",
						"437",
						"438",
						"450",
						"506",
						"514",
						"519",
						"548",
						"579",
						"581",
						"587",
						"604",
						"613",
						"639",
						"647",
						"672",
						"705",
						"709",
						"742",
						"778",
						"780",
						"782",
						"807",
						"819",
						"825",
						"867",
						"873",
						"902",
						"905"
					]
				],
				[
					"Cape Verde",
					["africa"],
					"cv",
					"238"
				],
				[
					"Caribbean Netherlands",
					["america", "carribean"],
					"bq",
					"599",
					"",
					1
				],
				[
					"Central African Republic",
					["africa"],
					"cf",
					"236"
				],
				[
					"Chad",
					["africa"],
					"td",
					"235"
				],
				[
					"Chile",
					["america", "south-america"],
					"cl",
					"56"
				],
				[
					"China",
					["asia"],
					"cn",
					"86",
					"..-........."
				],
				[
					"Colombia",
					["america", "south-america"],
					"co",
					"57",
					"... ... ...."
				],
				[
					"Comoros",
					["africa"],
					"km",
					"269"
				],
				[
					"Congo",
					["africa"],
					"cd",
					"243"
				],
				[
					"Congo",
					["africa"],
					"cg",
					"242"
				],
				[
					"Costa Rica",
					["america", "central-america"],
					"cr",
					"506",
					"....-...."
				],
				[
					"Côte d’Ivoire",
					["africa"],
					"ci",
					"225",
					".. .. .. .."
				],
				[
					"Croatia",
					[
						"europe",
						"eu-union",
						"ex-yugos"
					],
					"hr",
					"385"
				],
				[
					"Cuba",
					["america", "carribean"],
					"cu",
					"53"
				],
				[
					"Curaçao",
					["america", "carribean"],
					"cw",
					"599",
					"",
					0
				],
				[
					"Cyprus",
					["europe", "eu-union"],
					"cy",
					"357",
					".. ......"
				],
				[
					"Czech Republic",
					["europe", "eu-union"],
					"cz",
					"420",
					"... ... ..."
				],
				[
					"Denmark",
					[
						"europe",
						"eu-union",
						"baltic"
					],
					"dk",
					"45",
					".. .. .. .."
				],
				[
					"Djibouti",
					["africa"],
					"dj",
					"253"
				],
				[
					"Dominica",
					["america", "carribean"],
					"dm",
					"1767"
				],
				[
					"Dominican Republic",
					["america", "carribean"],
					"do",
					"1",
					"",
					2,
					[
						"809",
						"829",
						"849"
					]
				],
				[
					"Ecuador",
					["america", "south-america"],
					"ec",
					"593"
				],
				[
					"Egypt",
					["africa", "north-africa"],
					"eg",
					"20"
				],
				[
					"El Salvador",
					["america", "central-america"],
					"sv",
					"503",
					"....-...."
				],
				[
					"Equatorial Guinea",
					["africa"],
					"gq",
					"240"
				],
				[
					"Eritrea",
					["africa"],
					"er",
					"291"
				],
				[
					"Estonia",
					[
						"europe",
						"eu-union",
						"ex-ussr",
						"baltic"
					],
					"ee",
					"372",
					".... ......"
				],
				[
					"Ethiopia",
					["africa"],
					"et",
					"251"
				],
				[
					"Fiji",
					["oceania"],
					"fj",
					"679"
				],
				[
					"Finland",
					[
						"europe",
						"eu-union",
						"baltic"
					],
					"fi",
					"358",
					".. ... .. .."
				],
				[
					"France",
					["europe", "eu-union"],
					"fr",
					"33",
					". .. .. .. .."
				],
				[
					"French Guiana",
					["america", "south-america"],
					"gf",
					"594"
				],
				[
					"French Polynesia",
					["oceania"],
					"pf",
					"689"
				],
				[
					"Gabon",
					["africa"],
					"ga",
					"241"
				],
				[
					"Gambia",
					["africa"],
					"gm",
					"220"
				],
				[
					"Georgia",
					["asia", "ex-ussr"],
					"ge",
					"995"
				],
				[
					"Germany",
					[
						"europe",
						"eu-union",
						"baltic"
					],
					"de",
					"49",
					".... ........"
				],
				[
					"Ghana",
					["africa"],
					"gh",
					"233"
				],
				[
					"Greece",
					["europe", "eu-union"],
					"gr",
					"30"
				],
				[
					"Grenada",
					["america", "carribean"],
					"gd",
					"1473"
				],
				[
					"Guadeloupe",
					["america", "carribean"],
					"gp",
					"590",
					"",
					0
				],
				[
					"Guam",
					["oceania"],
					"gu",
					"1671"
				],
				[
					"Guatemala",
					["america", "central-america"],
					"gt",
					"502",
					"....-...."
				],
				[
					"Guinea",
					["africa"],
					"gn",
					"224"
				],
				[
					"Guinea-Bissau",
					["africa"],
					"gw",
					"245"
				],
				[
					"Guyana",
					["america", "south-america"],
					"gy",
					"592"
				],
				[
					"Haiti",
					["america", "carribean"],
					"ht",
					"509",
					"....-...."
				],
				[
					"Honduras",
					["america", "central-america"],
					"hn",
					"504"
				],
				[
					"Hong Kong",
					["asia"],
					"hk",
					"852",
					".... ...."
				],
				[
					"Hungary",
					["europe", "eu-union"],
					"hu",
					"36"
				],
				[
					"Iceland",
					["europe"],
					"is",
					"354",
					"... ...."
				],
				[
					"India",
					["asia"],
					"in",
					"91",
					".....-....."
				],
				[
					"Indonesia",
					["asia"],
					"id",
					"62"
				],
				[
					"Iran",
					["middle-east"],
					"ir",
					"98",
					"... ... ...."
				],
				[
					"Iraq",
					["middle-east"],
					"iq",
					"964"
				],
				[
					"Ireland",
					["europe", "eu-union"],
					"ie",
					"353",
					".. ......."
				],
				[
					"Israel",
					["middle-east"],
					"il",
					"972",
					"... ... ...."
				],
				[
					"Italy",
					["europe", "eu-union"],
					"it",
					"39",
					"... .......",
					0
				],
				[
					"Jamaica",
					["america", "carribean"],
					"jm",
					"1876"
				],
				[
					"Japan",
					["asia"],
					"jp",
					"81",
					".. .... ...."
				],
				[
					"Jordan",
					["middle-east"],
					"jo",
					"962"
				],
				[
					"Kazakhstan",
					["asia", "ex-ussr"],
					"kz",
					"7",
					"... ...-..-..",
					1,
					[
						"310",
						"311",
						"312",
						"313",
						"315",
						"318",
						"321",
						"324",
						"325",
						"326",
						"327",
						"336",
						"7172",
						"73622"
					]
				],
				[
					"Kenya",
					["africa"],
					"ke",
					"254"
				],
				[
					"Kiribati",
					["oceania"],
					"ki",
					"686"
				],
				[
					"Kosovo",
					["europe", "ex-yugos"],
					"xk",
					"383"
				],
				[
					"Kuwait",
					["middle-east"],
					"kw",
					"965"
				],
				[
					"Kyrgyzstan",
					["asia", "ex-ussr"],
					"kg",
					"996",
					"... ... ..."
				],
				[
					"Laos",
					["asia"],
					"la",
					"856"
				],
				[
					"Latvia",
					[
						"europe",
						"eu-union",
						"ex-ussr",
						"baltic"
					],
					"lv",
					"371",
					".. ... ..."
				],
				[
					"Lebanon",
					["middle-east"],
					"lb",
					"961"
				],
				[
					"Lesotho",
					["africa"],
					"ls",
					"266"
				],
				[
					"Liberia",
					["africa"],
					"lr",
					"231"
				],
				[
					"Libya",
					["africa", "north-africa"],
					"ly",
					"218"
				],
				[
					"Liechtenstein",
					["europe"],
					"li",
					"423"
				],
				[
					"Lithuania",
					[
						"europe",
						"eu-union",
						"ex-ussr",
						"baltic"
					],
					"lt",
					"370"
				],
				[
					"Luxembourg",
					["europe", "eu-union"],
					"lu",
					"352"
				],
				[
					"Macau",
					["asia"],
					"mo",
					"853"
				],
				[
					"Macedonia",
					["europe", "ex-yugos"],
					"mk",
					"389"
				],
				[
					"Madagascar",
					["africa"],
					"mg",
					"261"
				],
				[
					"Malawi",
					["africa"],
					"mw",
					"265"
				],
				[
					"Malaysia",
					["asia"],
					"my",
					"60",
					"..-....-...."
				],
				[
					"Maldives",
					["asia"],
					"mv",
					"960"
				],
				[
					"Mali",
					["africa"],
					"ml",
					"223"
				],
				[
					"Malta",
					["europe", "eu-union"],
					"mt",
					"356"
				],
				[
					"Marshall Islands",
					["oceania"],
					"mh",
					"692"
				],
				[
					"Martinique",
					["america", "carribean"],
					"mq",
					"596"
				],
				[
					"Mauritania",
					["africa"],
					"mr",
					"222"
				],
				[
					"Mauritius",
					["africa"],
					"mu",
					"230"
				],
				[
					"Mexico",
					["america", "central-america"],
					"mx",
					"52",
					"... ... ....",
					0,
					[
						"55",
						"81",
						"33",
						"656",
						"664",
						"998",
						"774",
						"229"
					]
				],
				[
					"Micronesia",
					["oceania"],
					"fm",
					"691"
				],
				[
					"Moldova",
					["europe"],
					"md",
					"373",
					"(..) ..-..-.."
				],
				[
					"Monaco",
					["europe"],
					"mc",
					"377"
				],
				[
					"Mongolia",
					["asia"],
					"mn",
					"976"
				],
				[
					"Montenegro",
					["europe", "ex-yugos"],
					"me",
					"382"
				],
				[
					"Morocco",
					["africa", "north-africa"],
					"ma",
					"212"
				],
				[
					"Mozambique",
					["africa"],
					"mz",
					"258"
				],
				[
					"Myanmar",
					["asia"],
					"mm",
					"95"
				],
				[
					"Namibia",
					["africa"],
					"na",
					"264"
				],
				[
					"Nauru",
					["africa"],
					"nr",
					"674"
				],
				[
					"Nepal",
					["asia"],
					"np",
					"977"
				],
				[
					"Netherlands",
					["europe", "eu-union"],
					"nl",
					"31",
					".. ........"
				],
				[
					"New Caledonia",
					["oceania"],
					"nc",
					"687"
				],
				[
					"New Zealand",
					["oceania"],
					"nz",
					"64",
					"...-...-...."
				],
				[
					"Nicaragua",
					["america", "central-america"],
					"ni",
					"505"
				],
				[
					"Niger",
					["africa"],
					"ne",
					"227"
				],
				[
					"Nigeria",
					["africa"],
					"ng",
					"234"
				],
				[
					"North Korea",
					["asia"],
					"kp",
					"850"
				],
				[
					"Norway",
					["europe", "baltic"],
					"no",
					"47",
					"... .. ..."
				],
				[
					"Oman",
					["middle-east"],
					"om",
					"968"
				],
				[
					"Pakistan",
					["asia"],
					"pk",
					"92",
					"...-......."
				],
				[
					"Palau",
					["oceania"],
					"pw",
					"680"
				],
				[
					"Palestine",
					["middle-east"],
					"ps",
					"970"
				],
				[
					"Panama",
					["america", "central-america"],
					"pa",
					"507"
				],
				[
					"Papua New Guinea",
					["oceania"],
					"pg",
					"675"
				],
				[
					"Paraguay",
					["america", "south-america"],
					"py",
					"595"
				],
				[
					"Peru",
					["america", "south-america"],
					"pe",
					"51"
				],
				[
					"Philippines",
					["asia"],
					"ph",
					"63",
					".... ......."
				],
				[
					"Poland",
					[
						"europe",
						"eu-union",
						"baltic"
					],
					"pl",
					"48",
					"...-...-..."
				],
				[
					"Portugal",
					["europe", "eu-union"],
					"pt",
					"351"
				],
				[
					"Puerto Rico",
					["america", "carribean"],
					"pr",
					"1",
					"",
					3,
					["787", "939"]
				],
				[
					"Qatar",
					["middle-east"],
					"qa",
					"974"
				],
				[
					"Réunion",
					["africa"],
					"re",
					"262"
				],
				[
					"Romania",
					["europe", "eu-union"],
					"ro",
					"40"
				],
				[
					"Russia",
					[
						"europe",
						"asia",
						"ex-ussr",
						"baltic"
					],
					"ru",
					"7",
					"(...) ...-..-..",
					0
				],
				[
					"Rwanda",
					["africa"],
					"rw",
					"250"
				],
				[
					"Saint Kitts and Nevis",
					["america", "carribean"],
					"kn",
					"1869"
				],
				[
					"Saint Lucia",
					["america", "carribean"],
					"lc",
					"1758"
				],
				[
					"Saint Vincent and the Grenadines",
					["america", "carribean"],
					"vc",
					"1784"
				],
				[
					"Samoa",
					["oceania"],
					"ws",
					"685"
				],
				[
					"San Marino",
					["europe"],
					"sm",
					"378"
				],
				[
					"São Tomé and Príncipe",
					["africa"],
					"st",
					"239"
				],
				[
					"Saudi Arabia",
					["middle-east"],
					"sa",
					"966"
				],
				[
					"Senegal",
					["africa"],
					"sn",
					"221"
				],
				[
					"Serbia",
					["europe", "ex-yugos"],
					"rs",
					"381"
				],
				[
					"Seychelles",
					["africa"],
					"sc",
					"248"
				],
				[
					"Sierra Leone",
					["africa"],
					"sl",
					"232"
				],
				[
					"Singapore",
					["asia"],
					"sg",
					"65",
					"....-...."
				],
				[
					"Slovakia",
					["europe", "eu-union"],
					"sk",
					"421"
				],
				[
					"Slovenia",
					[
						"europe",
						"eu-union",
						"ex-yugos"
					],
					"si",
					"386"
				],
				[
					"Solomon Islands",
					["oceania"],
					"sb",
					"677"
				],
				[
					"Somalia",
					["africa"],
					"so",
					"252"
				],
				[
					"South Africa",
					["africa"],
					"za",
					"27"
				],
				[
					"South Korea",
					["asia"],
					"kr",
					"82",
					"... .... ...."
				],
				[
					"South Sudan",
					["africa", "north-africa"],
					"ss",
					"211"
				],
				[
					"Spain",
					["europe", "eu-union"],
					"es",
					"34",
					"... ... ..."
				],
				[
					"Sri Lanka",
					["asia"],
					"lk",
					"94"
				],
				[
					"Sudan",
					["africa"],
					"sd",
					"249"
				],
				[
					"Suriname",
					["america", "south-america"],
					"sr",
					"597"
				],
				[
					"Swaziland",
					["africa"],
					"sz",
					"268"
				],
				[
					"Sweden",
					[
						"europe",
						"eu-union",
						"baltic"
					],
					"se",
					"46",
					"(...) ...-..."
				],
				[
					"Switzerland",
					["europe"],
					"ch",
					"41",
					".. ... .. .."
				],
				[
					"Syria",
					["middle-east"],
					"sy",
					"963"
				],
				[
					"Taiwan",
					["asia"],
					"tw",
					"886"
				],
				[
					"Tajikistan",
					["asia", "ex-ussr"],
					"tj",
					"992"
				],
				[
					"Tanzania",
					["africa"],
					"tz",
					"255"
				],
				[
					"Thailand",
					["asia"],
					"th",
					"66"
				],
				[
					"Timor-Leste",
					["asia"],
					"tl",
					"670"
				],
				[
					"Togo",
					["africa"],
					"tg",
					"228"
				],
				[
					"Tonga",
					["oceania"],
					"to",
					"676"
				],
				[
					"Trinidad and Tobago",
					["america", "carribean"],
					"tt",
					"1868"
				],
				[
					"Tunisia",
					["africa", "north-africa"],
					"tn",
					"216"
				],
				[
					"Turkey",
					["europe"],
					"tr",
					"90",
					"... ... .. .."
				],
				[
					"Turkmenistan",
					["asia", "ex-ussr"],
					"tm",
					"993"
				],
				[
					"Tuvalu",
					["asia"],
					"tv",
					"688"
				],
				[
					"Uganda",
					["africa"],
					"ug",
					"256"
				],
				[
					"Ukraine",
					["europe", "ex-ussr"],
					"ua",
					"380",
					"(..) ... .. .."
				],
				[
					"United Arab Emirates",
					["middle-east"],
					"ae",
					"971"
				],
				[
					"United Kingdom",
					["europe", "eu-union"],
					"gb",
					"44",
					".... ......"
				],
				[
					"United States",
					["america", "north-america"],
					"us",
					"1",
					"(...) ...-....",
					0,
					[
						"907",
						"205",
						"251",
						"256",
						"334",
						"479",
						"501",
						"870",
						"480",
						"520",
						"602",
						"623",
						"928",
						"209",
						"213",
						"310",
						"323",
						"408",
						"415",
						"510",
						"530",
						"559",
						"562",
						"619",
						"626",
						"650",
						"661",
						"707",
						"714",
						"760",
						"805",
						"818",
						"831",
						"858",
						"909",
						"916",
						"925",
						"949",
						"951",
						"303",
						"719",
						"970",
						"203",
						"860",
						"202",
						"302",
						"239",
						"305",
						"321",
						"352",
						"386",
						"407",
						"561",
						"727",
						"772",
						"813",
						"850",
						"863",
						"904",
						"941",
						"954",
						"229",
						"404",
						"478",
						"706",
						"770",
						"912",
						"808",
						"319",
						"515",
						"563",
						"641",
						"712",
						"208",
						"217",
						"309",
						"312",
						"618",
						"630",
						"708",
						"773",
						"815",
						"847",
						"219",
						"260",
						"317",
						"574",
						"765",
						"812",
						"316",
						"620",
						"785",
						"913",
						"270",
						"502",
						"606",
						"859",
						"225",
						"318",
						"337",
						"504",
						"985",
						"413",
						"508",
						"617",
						"781",
						"978",
						"301",
						"410",
						"207",
						"231",
						"248",
						"269",
						"313",
						"517",
						"586",
						"616",
						"734",
						"810",
						"906",
						"989",
						"218",
						"320",
						"507",
						"612",
						"651",
						"763",
						"952",
						"314",
						"417",
						"573",
						"636",
						"660",
						"816",
						"228",
						"601",
						"662",
						"406",
						"252",
						"336",
						"704",
						"828",
						"910",
						"919",
						"701",
						"308",
						"402",
						"603",
						"201",
						"609",
						"732",
						"856",
						"908",
						"973",
						"505",
						"575",
						"702",
						"775",
						"212",
						"315",
						"516",
						"518",
						"585",
						"607",
						"631",
						"716",
						"718",
						"845",
						"914",
						"216",
						"330",
						"419",
						"440",
						"513",
						"614",
						"740",
						"937",
						"405",
						"580",
						"918",
						"503",
						"541",
						"215",
						"412",
						"570",
						"610",
						"717",
						"724",
						"814",
						"401",
						"803",
						"843",
						"864",
						"605",
						"423",
						"615",
						"731",
						"865",
						"901",
						"931",
						"210",
						"214",
						"254",
						"281",
						"325",
						"361",
						"409",
						"432",
						"512",
						"713",
						"806",
						"817",
						"830",
						"903",
						"915",
						"936",
						"940",
						"956",
						"972",
						"979",
						"435",
						"801",
						"276",
						"434",
						"540",
						"703",
						"757",
						"804",
						"802",
						"206",
						"253",
						"360",
						"425",
						"509",
						"262",
						"414",
						"608",
						"715",
						"920",
						"304",
						"307"
					]
				],
				[
					"Uruguay",
					["america", "south-america"],
					"uy",
					"598"
				],
				[
					"Uzbekistan",
					["asia", "ex-ussr"],
					"uz",
					"998",
					".. ... .. .."
				],
				[
					"Vanuatu",
					["oceania"],
					"vu",
					"678"
				],
				[
					"Vatican City",
					["europe"],
					"va",
					"39",
					".. .... ....",
					1
				],
				[
					"Venezuela",
					["america", "south-america"],
					"ve",
					"58"
				],
				[
					"Vietnam",
					["asia"],
					"vn",
					"84"
				],
				[
					"Yemen",
					["middle-east"],
					"ye",
					"967"
				],
				[
					"Zambia",
					["africa"],
					"zm",
					"260"
				],
				[
					"Zimbabwe",
					["africa"],
					"zw",
					"263"
				]
			], E = [
				[
					"American Samoa",
					["oceania"],
					"as",
					"1684"
				],
				[
					"Anguilla",
					["america", "carribean"],
					"ai",
					"1264"
				],
				[
					"Bermuda",
					["america", "north-america"],
					"bm",
					"1441"
				],
				[
					"British Virgin Islands",
					["america", "carribean"],
					"vg",
					"1284"
				],
				[
					"Cayman Islands",
					["america", "carribean"],
					"ky",
					"1345"
				],
				[
					"Cook Islands",
					["oceania"],
					"ck",
					"682"
				],
				[
					"Falkland Islands",
					["america", "south-america"],
					"fk",
					"500"
				],
				[
					"Faroe Islands",
					["europe"],
					"fo",
					"298"
				],
				[
					"Gibraltar",
					["europe"],
					"gi",
					"350"
				],
				[
					"Greenland",
					["america"],
					"gl",
					"299"
				],
				[
					"Jersey",
					["europe", "eu-union"],
					"je",
					"44",
					".... ......"
				],
				[
					"Montserrat",
					["america", "carribean"],
					"ms",
					"1664"
				],
				[
					"Niue",
					["asia"],
					"nu",
					"683"
				],
				[
					"Norfolk Island",
					["oceania"],
					"nf",
					"672"
				],
				[
					"Northern Mariana Islands",
					["oceania"],
					"mp",
					"1670"
				],
				[
					"Saint Barthélemy",
					["america", "carribean"],
					"bl",
					"590",
					"",
					1
				],
				[
					"Saint Helena",
					["africa"],
					"sh",
					"290"
				],
				[
					"Saint Martin",
					["america", "carribean"],
					"mf",
					"590",
					"",
					2
				],
				[
					"Saint Pierre and Miquelon",
					["america", "north-america"],
					"pm",
					"508"
				],
				[
					"Sint Maarten",
					["america", "carribean"],
					"sx",
					"1721"
				],
				[
					"Tokelau",
					["oceania"],
					"tk",
					"690"
				],
				[
					"Turks and Caicos Islands",
					["america", "carribean"],
					"tc",
					"1649"
				],
				[
					"U.S. Virgin Islands",
					["america", "carribean"],
					"vi",
					"1340"
				],
				[
					"Wallis and Futuna",
					["oceania"],
					"wf",
					"681"
				]
			];
			function T(e$1, t$1, r$1, n$1, a$1) {
				return !r$1 || a$1 ? e$1 + "".padEnd(t$1.length, ".") + " " + n$1 : e$1 + "".padEnd(t$1.length, ".") + " " + r$1;
			}
			function I(e$1, t$1, r$1, a$1, i$1) {
				var u$1, c$1, s$1 = [];
				return c$1 = !0 === t$1, [(u$1 = []).concat.apply(u$1, o(e$1.map((function(e$2) {
					var o$1 = {
						name: e$2[0],
						regions: e$2[1],
						iso2: e$2[2],
						countryCode: e$2[3],
						dialCode: e$2[3],
						format: T(r$1, e$2[3], e$2[4], a$1, i$1),
						priority: e$2[5] || 0
					}, u$2 = [];
					return e$2[6] && e$2[6].map((function(t$2) {
						var r$2 = function(e$3) {
							for (var t$3 = 1; t$3 < arguments.length; t$3++) {
								var r$3 = null != arguments[t$3] ? arguments[t$3] : {}, a$2 = Object.keys(r$3);
								"function" == typeof Object.getOwnPropertySymbols && (a$2 = a$2.concat(Object.getOwnPropertySymbols(r$3).filter((function(e$4) {
									return Object.getOwnPropertyDescriptor(r$3, e$4).enumerable;
								})))), a$2.forEach((function(t$4) {
									n(e$3, t$4, r$3[t$4]);
								}));
							}
							return e$3;
						}({}, o$1);
						r$2.dialCode = e$2[3] + t$2, r$2.isAreaCode = !0, r$2.areaCodeLength = t$2.length, u$2.push(r$2);
					})), u$2.length > 0 ? (o$1.mainCode = !0, c$1 || "Array" === t$1.constructor.name && t$1.includes(e$2[2]) ? (o$1.hasAreaCodes = !0, [o$1].concat(u$2)) : (s$1 = s$1.concat(u$2), [o$1])) : [o$1];
				})))), s$1];
			}
			function A(e$1, t$1, r$1, n$1) {
				if (null !== r$1) {
					var a$1 = Object.keys(r$1), o$1 = Object.values(r$1);
					a$1.forEach((function(r$2, a$2) {
						if (n$1) return e$1.push([r$2, o$1[a$2]]);
						var i$1 = e$1.findIndex((function(e$2) {
							return e$2[0] === r$2;
						}));
						if (-1 === i$1) {
							var u$1 = [r$2];
							u$1[t$1] = o$1[a$2], e$1.push(u$1);
						} else e$1[i$1][t$1] = o$1[a$2];
					}));
				}
			}
			function D(e$1, t$1) {
				return 0 === t$1.length ? e$1 : e$1.map((function(e$2) {
					var r$1 = t$1.findIndex((function(t$2) {
						return t$2[0] === e$2[2];
					}));
					if (-1 === r$1) return e$2;
					var n$1 = t$1[r$1];
					return n$1[1] && (e$2[4] = n$1[1]), n$1[3] && (e$2[5] = n$1[3]), n$1[2] && (e$2[6] = n$1[2]), e$2;
				}));
			}
			var P = function e$1(t$1, r$1, n$1, a$1, i$1, u$1, s$1, l$1, f$1, d$1, p$1, h$1, m$1, y$1) {
				c(this, e$1), this.filterRegions = function(e$2, t$2) {
					if ("string" == typeof e$2) {
						var r$2 = e$2;
						return t$2.filter((function(e$3) {
							return e$3.regions.some((function(e$4) {
								return e$4 === r$2;
							}));
						}));
					}
					return t$2.filter((function(t$3) {
						return e$2.map((function(e$3) {
							return t$3.regions.some((function(t$4) {
								return t$4 === e$3;
							}));
						})).some((function(e$3) {
							return e$3;
						}));
					}));
				}, this.sortTerritories = function(e$2, t$2) {
					var r$2 = [].concat(o(e$2), o(t$2));
					return r$2.sort((function(e$3, t$3) {
						return e$3.name < t$3.name ? -1 : e$3.name > t$3.name ? 1 : 0;
					})), r$2;
				}, this.getFilteredCountryList = function(e$2, t$2, r$2) {
					return 0 === e$2.length ? t$2 : r$2 ? e$2.map((function(e$3) {
						var r$3 = t$2.find((function(t$3) {
							return t$3.iso2 === e$3;
						}));
						if (r$3) return r$3;
					})).filter((function(e$3) {
						return e$3;
					})) : t$2.filter((function(t$3) {
						return e$2.some((function(e$3) {
							return e$3 === t$3.iso2;
						}));
					}));
				}, this.localizeCountries = function(e$2, t$2, r$2) {
					for (var n$2 = 0; n$2 < e$2.length; n$2++) void 0 !== t$2[e$2[n$2].iso2] ? e$2[n$2].localName = t$2[e$2[n$2].iso2] : void 0 !== t$2[e$2[n$2].name] && (e$2[n$2].localName = t$2[e$2[n$2].name]);
					return r$2 || e$2.sort((function(e$3, t$3) {
						return e$3.localName < t$3.localName ? -1 : e$3.localName > t$3.localName ? 1 : 0;
					})), e$2;
				}, this.getCustomAreas = function(e$2, t$2) {
					for (var r$2 = [], n$2 = 0; n$2 < t$2.length; n$2++) {
						var a$2 = JSON.parse(JSON.stringify(e$2));
						a$2.dialCode += t$2[n$2], r$2.push(a$2);
					}
					return r$2;
				}, this.excludeCountries = function(e$2, t$2) {
					return 0 === t$2.length ? e$2 : e$2.filter((function(e$3) {
						return !t$2.includes(e$3.iso2);
					}));
				};
				var b$1 = function(e$2, t$2, r$2) {
					var n$2 = [];
					return A(n$2, 1, e$2, !0), A(n$2, 3, t$2), A(n$2, 2, r$2), n$2;
				}(l$1, f$1, d$1), g$1 = D(JSON.parse(JSON.stringify(k)), b$1), v$1 = D(JSON.parse(JSON.stringify(E)), b$1), C$1 = O(I(g$1, t$1, h$1, m$1, y$1), 2), _$1 = C$1[0], w$1 = C$1[1];
				if (r$1) {
					var S$1 = O(I(v$1, t$1, h$1, m$1, y$1), 2), j$1 = S$1[0];
					S$1[1];
					_$1 = this.sortTerritories(j$1, _$1);
				}
				n$1 && (_$1 = this.filterRegions(n$1, _$1)), this.onlyCountries = this.localizeCountries(this.excludeCountries(this.getFilteredCountryList(a$1, _$1, s$1.includes("onlyCountries")), u$1), p$1, s$1.includes("onlyCountries")), this.preferredCountries = 0 === i$1.length ? [] : this.localizeCountries(this.getFilteredCountryList(i$1, _$1, s$1.includes("preferredCountries")), p$1, s$1.includes("preferredCountries")), this.hiddenAreaCodes = this.excludeCountries(this.getFilteredCountryList(a$1, w$1), u$1);
			}, F = function(e$1) {
				function t$1(e$2) {
					var r$2;
					c(this, t$1), (r$2 = function(e$3, t$2) {
						return !t$2 || "object" !== f(t$2) && "function" != typeof t$2 ? d(e$3) : t$2;
					}(this, p(t$1).call(this, e$2))).getProbableCandidate = C()((function(e$3) {
						return e$3 && 0 !== e$3.length ? r$2.state.onlyCountries.filter((function(t$2) {
							return j()(t$2.name.toLowerCase(), e$3.toLowerCase());
						}), d(d(r$2)))[0] : null;
					})), r$2.guessSelectedCountry = C()((function(e$3, t$2, n$1, a$1) {
						var o$1;
						if (!1 === r$2.props.enableAreaCodes && (a$1.some((function(t$3) {
							if (j()(e$3, t$3.dialCode)) return n$1.some((function(e$4) {
								if (t$3.iso2 === e$4.iso2 && e$4.mainCode) return o$1 = e$4, !0;
							})), !0;
						})), o$1)) return o$1;
						var i$1 = n$1.find((function(e$4) {
							return e$4.iso2 == t$2;
						}));
						if ("" === e$3.trim()) return i$1;
						var u$1 = n$1.reduce((function(t$3, r$3) {
							if (j()(e$3, r$3.dialCode)) {
								if (r$3.dialCode.length > t$3.dialCode.length) return r$3;
								if (r$3.dialCode.length === t$3.dialCode.length && r$3.priority < t$3.priority) return r$3;
							}
							return t$3;
						}), {
							dialCode: "",
							priority: 10001
						}, d(d(r$2)));
						return u$1.name ? u$1 : i$1;
					})), r$2.updateCountry = function(e$3) {
						var t$2, n$1 = r$2.state.onlyCountries;
						(t$2 = e$3.indexOf(0) >= "0" && e$3.indexOf(0) <= "9" ? n$1.find((function(t$3) {
							return t$3.dialCode == +e$3;
						})) : n$1.find((function(t$3) {
							return t$3.iso2 == e$3;
						}))) && t$2.dialCode && r$2.setState({
							selectedCountry: t$2,
							formattedNumber: r$2.props.disableCountryCode ? "" : r$2.formatNumber(t$2.dialCode, t$2)
						});
					}, r$2.scrollTo = function(e$3, t$2) {
						if (e$3) {
							var n$1 = r$2.dropdownRef;
							if (n$1 && document.body) {
								var a$1 = n$1.offsetHeight, o$1 = n$1.getBoundingClientRect().top + document.body.scrollTop, i$1 = o$1 + a$1, u$1 = e$3, c$1 = u$1.getBoundingClientRect(), s$2 = u$1.offsetHeight, l$3 = c$1.top + document.body.scrollTop, f$1 = l$3 + s$2, d$1 = l$3 - o$1 + n$1.scrollTop, p$1 = a$1 / 2 - s$2 / 2;
								if (r$2.props.enableSearch ? l$3 < o$1 + 32 : l$3 < o$1) t$2 && (d$1 -= p$1), n$1.scrollTop = d$1;
								else if (f$1 > i$1) {
									t$2 && (d$1 += p$1);
									var h$2 = a$1 - s$2;
									n$1.scrollTop = d$1 - h$2;
								}
							}
						}
					}, r$2.scrollToTop = function() {
						var e$3 = r$2.dropdownRef;
						e$3 && document.body && (e$3.scrollTop = 0);
					}, r$2.formatNumber = function(e$3, t$2) {
						if (!t$2) return e$3;
						var n$1, o$1 = t$2.format, c$1 = r$2.props, s$2 = c$1.disableCountryCode, l$3 = c$1.enableAreaCodeStretch, f$1 = c$1.enableLongNumbers, d$1 = c$1.autoFormat;
						if (s$2 ? ((n$1 = o$1.split(" ")).shift(), n$1 = n$1.join(" ")) : l$3 && t$2.isAreaCode ? ((n$1 = o$1.split(" "))[1] = n$1[1].replace(/\.+/, "".padEnd(t$2.areaCodeLength, ".")), n$1 = n$1.join(" ")) : n$1 = o$1, !e$3 || 0 === e$3.length) return s$2 ? "" : r$2.props.prefix;
						if (e$3 && e$3.length < 2 || !n$1 || !d$1) return s$2 ? e$3 : r$2.props.prefix + e$3;
						var p$1, h$2 = w()(n$1, (function(e$4, t$3) {
							if (0 === e$4.remainingText.length) return e$4;
							if ("." !== t$3) return {
								formattedText: e$4.formattedText + t$3,
								remainingText: e$4.remainingText
							};
							var r$3, n$2 = i(r$3 = e$4.remainingText) || a(r$3) || u(), o$2 = n$2[0], c$2 = n$2.slice(1);
							return {
								formattedText: e$4.formattedText + o$2,
								remainingText: c$2
							};
						}), {
							formattedText: "",
							remainingText: e$3.split("")
						});
						return (p$1 = f$1 ? h$2.formattedText + h$2.remainingText.join("") : h$2.formattedText).includes("(") && !p$1.includes(")") && (p$1 += ")"), p$1;
					}, r$2.cursorToEnd = function() {
						var e$3 = r$2.numberInputRef;
						if (document.activeElement === e$3) {
							e$3.focus();
							var t$2 = e$3.value.length;
							")" === e$3.value.charAt(t$2 - 1) && (t$2 -= 1), e$3.setSelectionRange(t$2, t$2);
						}
					}, r$2.getElement = function(e$3) {
						return r$2["flag_no_".concat(e$3)];
					}, r$2.getCountryData = function() {
						return r$2.state.selectedCountry ? {
							name: r$2.state.selectedCountry.name || "",
							dialCode: r$2.state.selectedCountry.dialCode || "",
							countryCode: r$2.state.selectedCountry.iso2 || "",
							format: r$2.state.selectedCountry.format || ""
						} : {};
					}, r$2.handleFlagDropdownClick = function(e$3) {
						if (e$3.preventDefault(), r$2.state.showDropdown || !r$2.props.disabled) {
							var t$2 = r$2.state, n$1 = t$2.preferredCountries, a$1 = t$2.onlyCountries, o$1 = t$2.selectedCountry, i$1 = r$2.concatPreferredCountries(n$1, a$1).findIndex((function(e$4) {
								return e$4.dialCode === o$1.dialCode && e$4.iso2 === o$1.iso2;
							}));
							r$2.setState({
								showDropdown: !r$2.state.showDropdown,
								highlightCountryIndex: i$1
							}, (function() {
								r$2.state.showDropdown && r$2.scrollTo(r$2.getElement(r$2.state.highlightCountryIndex));
							}));
						}
					}, r$2.handleInput = function(e$3) {
						var t$2 = e$3.target.value, n$1 = r$2.props, a$1 = n$1.prefix, o$1 = n$1.onChange, i$1 = r$2.props.disableCountryCode ? "" : a$1, u$1 = r$2.state.selectedCountry, c$1 = r$2.state.freezeSelection;
						if (!r$2.props.countryCodeEditable) {
							var s$2 = a$1 + (u$1.hasAreaCodes ? r$2.state.onlyCountries.find((function(e$4) {
								return e$4.iso2 === u$1.iso2 && e$4.mainCode;
							})).dialCode : u$1.dialCode);
							if (t$2.slice(0, s$2.length) !== s$2) return;
						}
						if (t$2 === a$1) return o$1 && o$1("", r$2.getCountryData(), e$3, ""), r$2.setState({ formattedNumber: "" });
						if (t$2.replace(/\D/g, "").length > 15) {
							if (!1 === r$2.props.enableLongNumbers) return;
							if ("number" == typeof r$2.props.enableLongNumbers && t$2.replace(/\D/g, "").length > r$2.props.enableLongNumbers) return;
						}
						if (t$2 !== r$2.state.formattedNumber) {
							e$3.preventDefault ? e$3.preventDefault() : e$3.returnValue = !1;
							var l$3 = r$2.props.country, f$1 = r$2.state, d$1 = f$1.onlyCountries, p$1 = f$1.selectedCountry, h$2 = f$1.hiddenAreaCodes;
							if (o$1 && e$3.persist(), t$2.length > 0) {
								var m$3 = t$2.replace(/\D/g, "");
								(!r$2.state.freezeSelection || p$1 && p$1.dialCode.length > m$3.length) && (u$1 = r$2.props.disableCountryGuess ? p$1 : r$2.guessSelectedCountry(m$3.substring(0, 6), l$3, d$1, h$2) || p$1, c$1 = !1), i$1 = r$2.formatNumber(m$3, u$1), u$1 = u$1.dialCode ? u$1 : p$1;
							}
							var y$1 = e$3.target.selectionStart, b$2 = e$3.target.selectionStart, g$1 = r$2.state.formattedNumber, v$2 = i$1.length - g$1.length;
							r$2.setState({
								formattedNumber: i$1,
								freezeSelection: c$1,
								selectedCountry: u$1
							}, (function() {
								v$2 > 0 && (b$2 -= v$2), ")" == i$1.charAt(i$1.length - 1) ? r$2.numberInputRef.setSelectionRange(i$1.length - 1, i$1.length - 1) : b$2 > 0 && g$1.length >= i$1.length ? r$2.numberInputRef.setSelectionRange(b$2, b$2) : y$1 < g$1.length && r$2.numberInputRef.setSelectionRange(y$1, y$1), o$1 && o$1(i$1.replace(/[^0-9]+/g, ""), r$2.getCountryData(), e$3, i$1);
							}));
						}
					}, r$2.handleInputClick = function(e$3) {
						r$2.setState({ showDropdown: !1 }), r$2.props.onClick && r$2.props.onClick(e$3, r$2.getCountryData());
					}, r$2.handleDoubleClick = function(e$3) {
						var t$2 = e$3.target.value.length;
						e$3.target.setSelectionRange(0, t$2);
					}, r$2.handleFlagItemClick = function(e$3, t$2) {
						var n$1 = r$2.state.selectedCountry, a$1 = r$2.state.onlyCountries.find((function(t$3) {
							return t$3 == e$3;
						}));
						if (a$1) {
							var o$1 = r$2.state.formattedNumber.replace(" ", "").replace("(", "").replace(")", "").replace("-", ""), i$1 = o$1.length > 1 ? o$1.replace(n$1.dialCode, a$1.dialCode) : a$1.dialCode, u$1 = r$2.formatNumber(i$1.replace(/\D/g, ""), a$1);
							r$2.setState({
								showDropdown: !1,
								selectedCountry: a$1,
								freezeSelection: !0,
								formattedNumber: u$1,
								searchValue: ""
							}, (function() {
								r$2.cursorToEnd(), r$2.props.onChange && r$2.props.onChange(u$1.replace(/[^0-9]+/g, ""), r$2.getCountryData(), t$2, u$1);
							}));
						}
					}, r$2.handleInputFocus = function(e$3) {
						r$2.numberInputRef && r$2.numberInputRef.value === r$2.props.prefix && r$2.state.selectedCountry && !r$2.props.disableCountryCode && r$2.setState({ formattedNumber: r$2.props.prefix + r$2.state.selectedCountry.dialCode }, (function() {
							r$2.props.jumpCursorToEnd && setTimeout(r$2.cursorToEnd, 0);
						})), r$2.setState({ placeholder: "" }), r$2.props.onFocus && r$2.props.onFocus(e$3, r$2.getCountryData()), r$2.props.jumpCursorToEnd && setTimeout(r$2.cursorToEnd, 0);
					}, r$2.handleInputBlur = function(e$3) {
						e$3.target.value || r$2.setState({ placeholder: r$2.props.placeholder }), r$2.props.onBlur && r$2.props.onBlur(e$3, r$2.getCountryData());
					}, r$2.handleInputCopy = function(e$3) {
						if (r$2.props.copyNumbersOnly) {
							var t$2 = window.getSelection().toString().replace(/[^0-9]+/g, "");
							e$3.clipboardData.setData("text/plain", t$2), e$3.preventDefault();
						}
					}, r$2.getHighlightCountryIndex = function(e$3) {
						var t$2 = r$2.state.highlightCountryIndex + e$3;
						return t$2 < 0 || t$2 >= r$2.state.onlyCountries.length + r$2.state.preferredCountries.length ? t$2 - e$3 : r$2.props.enableSearch && t$2 > r$2.getSearchFilteredCountries().length ? 0 : t$2;
					}, r$2.searchCountry = function() {
						var e$3 = r$2.getProbableCandidate(r$2.state.queryString) || r$2.state.onlyCountries[0], t$2 = r$2.state.onlyCountries.findIndex((function(t$3) {
							return t$3 == e$3;
						})) + r$2.state.preferredCountries.length;
						r$2.scrollTo(r$2.getElement(t$2), !0), r$2.setState({
							queryString: "",
							highlightCountryIndex: t$2
						});
					}, r$2.handleKeydown = function(e$3) {
						var t$2 = r$2.props.keys, n$1 = e$3.target.className;
						if (n$1.includes("selected-flag") && e$3.which === t$2.ENTER && !r$2.state.showDropdown) return r$2.handleFlagDropdownClick(e$3);
						if (n$1.includes("form-control") && (e$3.which === t$2.ENTER || e$3.which === t$2.ESC)) return e$3.target.blur();
						if (r$2.state.showDropdown && !r$2.props.disabled && (!n$1.includes("search-box") || e$3.which === t$2.UP || e$3.which === t$2.DOWN || e$3.which === t$2.ENTER || e$3.which === t$2.ESC && "" === e$3.target.value)) {
							e$3.preventDefault ? e$3.preventDefault() : e$3.returnValue = !1;
							var a$1 = function(e$4) {
								r$2.setState({ highlightCountryIndex: r$2.getHighlightCountryIndex(e$4) }, (function() {
									r$2.scrollTo(r$2.getElement(r$2.state.highlightCountryIndex), !0);
								}));
							};
							switch (e$3.which) {
								case t$2.DOWN:
									a$1(1);
									break;
								case t$2.UP:
									a$1(-1);
									break;
								case t$2.ENTER:
									r$2.props.enableSearch ? r$2.handleFlagItemClick(r$2.getSearchFilteredCountries()[r$2.state.highlightCountryIndex] || r$2.getSearchFilteredCountries()[0], e$3) : r$2.handleFlagItemClick([].concat(o(r$2.state.preferredCountries), o(r$2.state.onlyCountries))[r$2.state.highlightCountryIndex], e$3);
									break;
								case t$2.ESC:
								case t$2.TAB:
									r$2.setState({ showDropdown: !1 }, r$2.cursorToEnd);
									break;
								default: (e$3.which >= t$2.A && e$3.which <= t$2.Z || e$3.which === t$2.SPACE) && r$2.setState({ queryString: r$2.state.queryString + String.fromCharCode(e$3.which) }, r$2.state.debouncedQueryStingSearcher);
							}
						}
					}, r$2.handleInputKeyDown = function(e$3) {
						var t$2 = r$2.props, n$1 = t$2.keys, a$1 = t$2.onEnterKeyPress, o$1 = t$2.onKeyDown;
						e$3.which === n$1.ENTER && a$1 && a$1(e$3), o$1 && o$1(e$3);
					}, r$2.handleClickOutside = function(e$3) {
						r$2.dropdownRef && !r$2.dropdownContainerRef.contains(e$3.target) && r$2.state.showDropdown && r$2.setState({ showDropdown: !1 });
					}, r$2.handleSearchChange = function(e$3) {
						var t$2 = e$3.currentTarget.value, n$1 = r$2.state, a$1 = n$1.preferredCountries, o$1 = n$1.selectedCountry, i$1 = 0;
						if ("" === t$2 && o$1) {
							var u$1 = r$2.state.onlyCountries;
							i$1 = r$2.concatPreferredCountries(a$1, u$1).findIndex((function(e$4) {
								return e$4 == o$1;
							})), setTimeout((function() {
								return r$2.scrollTo(r$2.getElement(i$1));
							}), 100);
						}
						r$2.setState({
							searchValue: t$2,
							highlightCountryIndex: i$1
						});
					}, r$2.concatPreferredCountries = function(e$3, t$2) {
						return e$3.length > 0 ? o(new Set(e$3.concat(t$2))) : t$2;
					}, r$2.getDropdownCountryName = function(e$3) {
						return e$3.localName || e$3.name;
					}, r$2.getSearchFilteredCountries = function() {
						var e$3 = r$2.state, t$2 = e$3.preferredCountries, n$1 = e$3.onlyCountries, a$1 = e$3.searchValue, i$1 = r$2.props.enableSearch, u$1 = r$2.concatPreferredCountries(t$2, n$1), c$1 = a$1.trim().toLowerCase().replace("+", "");
						if (i$1 && c$1) {
							if (/^\d+$/.test(c$1)) return u$1.filter((function(e$4) {
								var t$3 = e$4.dialCode;
								return ["".concat(t$3)].some((function(e$5) {
									return e$5.toLowerCase().includes(c$1);
								}));
							}));
							var s$2 = u$1.filter((function(e$4) {
								var t$3 = e$4.iso2;
								return ["".concat(t$3)].some((function(e$5) {
									return e$5.toLowerCase().includes(c$1);
								}));
							})), l$3 = u$1.filter((function(e$4) {
								var t$3 = e$4.name, r$3 = e$4.localName;
								e$4.iso2;
								return ["".concat(t$3), "".concat(r$3 || "")].some((function(e$5) {
									return e$5.toLowerCase().includes(c$1);
								}));
							}));
							return r$2.scrollToTop(), o(new Set([].concat(s$2, l$3)));
						}
						return u$1;
					}, r$2.getCountryDropdownList = function() {
						var e$3 = r$2.state, t$2 = e$3.preferredCountries, a$1 = e$3.highlightCountryIndex, o$1 = e$3.showDropdown, i$1 = e$3.searchValue, u$1 = r$2.props, c$1 = u$1.disableDropdown, s$2 = u$1.prefix, l$3 = r$2.props, f$1 = l$3.enableSearch, d$1 = l$3.searchNotFound, p$1 = l$3.disableSearchIcon, h$2 = l$3.searchClass, m$3 = l$3.searchStyle, b$2 = l$3.searchPlaceholder, g$1 = l$3.autocompleteSearch, v$2 = r$2.getSearchFilteredCountries().map((function(e$4, t$3) {
							var n$1 = a$1 === t$3, o$2 = N()({
								country: !0,
								preferred: "us" === e$4.iso2 || "gb" === e$4.iso2,
								active: "us" === e$4.iso2,
								highlight: n$1
							}), i$2 = "flag ".concat(e$4.iso2);
							return y.a.createElement("li", Object.assign({
								ref: function(e$5) {
									return r$2["flag_no_".concat(t$3)] = e$5;
								},
								key: "flag_no_".concat(t$3),
								"data-flag-key": "flag_no_".concat(t$3),
								className: o$2,
								"data-dial-code": "1",
								tabIndex: c$1 ? "-1" : "0",
								"data-country-code": e$4.iso2,
								onClick: function(t$4) {
									return r$2.handleFlagItemClick(e$4, t$4);
								},
								role: "option"
							}, n$1 ? { "aria-selected": !0 } : {}), y.a.createElement("div", { className: i$2 }), y.a.createElement("span", { className: "country-name" }, r$2.getDropdownCountryName(e$4)), y.a.createElement("span", { className: "dial-code" }, e$4.format ? r$2.formatNumber(e$4.dialCode, e$4) : s$2 + e$4.dialCode));
						})), C$1 = y.a.createElement("li", {
							key: "dashes",
							className: "divider"
						});
						t$2.length > 0 && (!f$1 || f$1 && !i$1.trim()) && v$2.splice(t$2.length, 0, C$1);
						var _$2 = N()(n({
							"country-list": !0,
							hide: !o$1
						}, r$2.props.dropdownClass, !0));
						return y.a.createElement("ul", {
							ref: function(e$4) {
								return !f$1 && e$4 && e$4.focus(), r$2.dropdownRef = e$4;
							},
							className: _$2,
							style: r$2.props.dropdownStyle,
							role: "listbox",
							tabIndex: "0"
						}, f$1 && y.a.createElement("li", { className: N()(n({ search: !0 }, h$2, h$2)) }, !p$1 && y.a.createElement("span", {
							className: N()(n({ "search-emoji": !0 }, "".concat(h$2, "-emoji"), h$2)),
							role: "img",
							"aria-label": "Magnifying glass"
						}, "🔎"), y.a.createElement("input", {
							className: N()(n({ "search-box": !0 }, "".concat(h$2, "-box"), h$2)),
							style: m$3,
							type: "search",
							placeholder: b$2,
							autoFocus: !0,
							autoComplete: g$1 ? "on" : "off",
							value: i$1,
							onChange: r$2.handleSearchChange
						})), v$2.length > 0 ? v$2 : y.a.createElement("li", { className: "no-entries-message" }, y.a.createElement("span", null, d$1)));
					};
					var s$1, l$2 = new P(e$2.enableAreaCodes, e$2.enableTerritories, e$2.regions, e$2.onlyCountries, e$2.preferredCountries, e$2.excludeCountries, e$2.preserveOrder, e$2.masks, e$2.priority, e$2.areaCodes, e$2.localization, e$2.prefix, e$2.defaultMask, e$2.alwaysDefaultMask), h$1 = l$2.onlyCountries, m$2 = l$2.preferredCountries, b$1 = l$2.hiddenAreaCodes, v$1 = e$2.value ? e$2.value.replace(/\D/g, "") : "";
					s$1 = e$2.disableInitialCountryGuess ? 0 : v$1.length > 1 ? r$2.guessSelectedCountry(v$1.substring(0, 6), e$2.country, h$1, b$1) || 0 : e$2.country && h$1.find((function(t$2) {
						return t$2.iso2 == e$2.country;
					})) || 0;
					var _$1, S$1 = v$1.length < 2 && s$1 && !j()(v$1, s$1.dialCode) ? s$1.dialCode : "";
					_$1 = "" === v$1 && 0 === s$1 ? "" : r$2.formatNumber((e$2.disableCountryCode ? "" : S$1) + v$1, s$1.name ? s$1 : void 0);
					var x$1 = h$1.findIndex((function(e$3) {
						return e$3 == s$1;
					}));
					return r$2.state = {
						showDropdown: e$2.showDropdown,
						formattedNumber: _$1,
						onlyCountries: h$1,
						preferredCountries: m$2,
						hiddenAreaCodes: b$1,
						selectedCountry: s$1,
						highlightCountryIndex: x$1,
						queryString: "",
						freezeSelection: !1,
						debouncedQueryStingSearcher: g()(r$2.searchCountry, 250),
						searchValue: ""
					}, r$2;
				}
				var r$1, l$1, m$1;
				return function(e$2, t$2) {
					if ("function" != typeof t$2 && null !== t$2) throw new TypeError("Super expression must either be null or a function");
					e$2.prototype = Object.create(t$2 && t$2.prototype, { constructor: {
						value: e$2,
						writable: !0,
						configurable: !0
					} }), t$2 && h(e$2, t$2);
				}(t$1, e$1), r$1 = t$1, (l$1 = [
					{
						key: "componentDidMount",
						value: function() {
							document.addEventListener && this.props.enableClickOutside && document.addEventListener("mousedown", this.handleClickOutside), this.props.onMount && this.props.onMount(this.state.formattedNumber.replace(/[^0-9]+/g, ""), this.getCountryData(), this.state.formattedNumber);
						}
					},
					{
						key: "componentWillUnmount",
						value: function() {
							document.removeEventListener && this.props.enableClickOutside && document.removeEventListener("mousedown", this.handleClickOutside);
						}
					},
					{
						key: "componentDidUpdate",
						value: function(e$2, t$2, r$2) {
							e$2.country !== this.props.country ? this.updateCountry(this.props.country) : e$2.value !== this.props.value && this.updateFormattedNumber(this.props.value);
						}
					},
					{
						key: "updateFormattedNumber",
						value: function(e$2) {
							if (null === e$2) return this.setState({
								selectedCountry: 0,
								formattedNumber: ""
							});
							var t$2 = this.state, r$2 = t$2.onlyCountries, n$1 = t$2.selectedCountry, a$1 = t$2.hiddenAreaCodes, o$1 = this.props, i$1 = o$1.country, u$1 = o$1.prefix;
							if ("" === e$2) return this.setState({
								selectedCountry: n$1,
								formattedNumber: ""
							});
							var c$1, s$1, l$2 = e$2.replace(/\D/g, "");
							if (n$1 && j()(e$2, u$1 + n$1.dialCode)) s$1 = this.formatNumber(l$2, n$1), this.setState({ formattedNumber: s$1 });
							else {
								var f$1 = (c$1 = this.props.disableCountryGuess ? n$1 : this.guessSelectedCountry(l$2.substring(0, 6), i$1, r$2, a$1) || n$1) && j()(l$2, u$1 + c$1.dialCode) ? c$1.dialCode : "";
								s$1 = this.formatNumber((this.props.disableCountryCode ? "" : f$1) + l$2, c$1 || void 0), this.setState({
									selectedCountry: c$1,
									formattedNumber: s$1
								});
							}
						}
					},
					{
						key: "render",
						value: function() {
							var e$2, t$2, r$2, a$1 = this, o$1 = this.state, i$1 = o$1.onlyCountries, u$1 = o$1.selectedCountry, c$1 = o$1.showDropdown, s$1 = o$1.formattedNumber, l$2 = o$1.hiddenAreaCodes, f$1 = this.props, d$1 = f$1.disableDropdown, p$1 = f$1.renderStringAsFlag, h$1 = f$1.isValid, m$2 = f$1.defaultErrorMessage, b$1 = f$1.specialLabel;
							if ("boolean" == typeof h$1) t$2 = h$1;
							else {
								var g$1 = h$1(s$1.replace(/\D/g, ""), u$1, i$1, l$2);
								"boolean" == typeof g$1 ? !1 === (t$2 = g$1) && (r$2 = m$2) : (t$2 = !1, r$2 = g$1);
							}
							var v$1 = N()((n(e$2 = {}, this.props.containerClass, !0), n(e$2, "react-tel-input", !0), e$2)), C$1 = N()({
								arrow: !0,
								up: c$1
							}), _$1 = N()(n({
								"form-control": !0,
								"invalid-number": !t$2,
								open: c$1
							}, this.props.inputClass, !0)), w$1 = N()({
								"selected-flag": !0,
								open: c$1
							}), S$1 = N()(n({
								"flag-dropdown": !0,
								"invalid-number": !t$2,
								open: c$1
							}, this.props.buttonClass, !0)), j$1 = "flag ".concat(u$1 && u$1.iso2);
							return y.a.createElement("div", {
								className: "".concat(v$1, " ").concat(this.props.className),
								style: this.props.style || this.props.containerStyle,
								onKeyDown: this.handleKeydown
							}, b$1 && y.a.createElement("div", { className: "special-label" }, b$1), r$2 && y.a.createElement("div", { className: "invalid-number-message" }, r$2), y.a.createElement("input", Object.assign({
								className: _$1,
								style: this.props.inputStyle,
								onChange: this.handleInput,
								onClick: this.handleInputClick,
								onDoubleClick: this.handleDoubleClick,
								onFocus: this.handleInputFocus,
								onBlur: this.handleInputBlur,
								onCopy: this.handleInputCopy,
								value: s$1,
								onKeyDown: this.handleInputKeyDown,
								placeholder: this.props.placeholder,
								disabled: this.props.disabled,
								type: "tel"
							}, this.props.inputProps, { ref: function(e$3) {
								a$1.numberInputRef = e$3, "function" == typeof a$1.props.inputProps.ref ? a$1.props.inputProps.ref(e$3) : "object" == typeof a$1.props.inputProps.ref && (a$1.props.inputProps.ref.current = e$3);
							} })), y.a.createElement("div", {
								className: S$1,
								style: this.props.buttonStyle,
								ref: function(e$3) {
									return a$1.dropdownContainerRef = e$3;
								}
							}, p$1 ? y.a.createElement("div", { className: w$1 }, p$1) : y.a.createElement("div", {
								onClick: d$1 ? void 0 : this.handleFlagDropdownClick,
								className: w$1,
								title: u$1 ? "".concat(u$1.localName || u$1.name, ": + ").concat(u$1.dialCode) : "",
								tabIndex: d$1 ? "-1" : "0",
								role: "button",
								"aria-haspopup": "listbox",
								"aria-expanded": !!c$1 || void 0
							}, y.a.createElement("div", { className: j$1 }, !d$1 && y.a.createElement("div", { className: C$1 }))), c$1 && this.getCountryDropdownList()));
						}
					}
				]) && s(r$1.prototype, l$1), m$1 && s(r$1, m$1), t$1;
			}(y.a.Component);
			F.defaultProps = {
				country: "",
				value: "",
				onlyCountries: [],
				preferredCountries: [],
				excludeCountries: [],
				placeholder: "1 (702) 123-4567",
				searchPlaceholder: "search",
				searchNotFound: "No entries to show",
				flagsImagePath: "./flags.png",
				disabled: !1,
				containerStyle: {},
				inputStyle: {},
				buttonStyle: {},
				dropdownStyle: {},
				searchStyle: {},
				containerClass: "",
				inputClass: "",
				buttonClass: "",
				dropdownClass: "",
				searchClass: "",
				className: "",
				autoFormat: !0,
				enableAreaCodes: !1,
				enableTerritories: !1,
				disableCountryCode: !1,
				disableDropdown: !1,
				enableLongNumbers: !1,
				countryCodeEditable: !0,
				enableSearch: !1,
				disableSearchIcon: !1,
				disableInitialCountryGuess: !1,
				disableCountryGuess: !1,
				regions: "",
				inputProps: {},
				localization: {},
				masks: null,
				priority: null,
				areaCodes: null,
				preserveOrder: [],
				defaultMask: "... ... ... ... ..",
				alwaysDefaultMask: !1,
				prefix: "+",
				copyNumbersOnly: !0,
				renderStringAsFlag: "",
				autocompleteSearch: !1,
				jumpCursorToEnd: !0,
				enableAreaCodeStretch: !1,
				enableClickOutside: !0,
				showDropdown: !1,
				isValid: !0,
				defaultErrorMessage: "",
				specialLabel: "Phone",
				onEnterKeyPress: null,
				keys: {
					UP: 38,
					DOWN: 40,
					RIGHT: 39,
					LEFT: 37,
					ENTER: 13,
					ESC: 27,
					PLUS: 43,
					A: 65,
					Z: 90,
					SPACE: 32,
					TAB: 9
				}
			};
			t.default = F;
		}
	]);
}) });

//#endregion
export default require_lib();

//# sourceMappingURL=react-phone-input-2.js.map