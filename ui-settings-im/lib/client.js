window.__ModuleLoader__.load({
	id: "@dsh-extra/dsh-client-ui-settings-im",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/platform-marks.tsx
		function MarkImg({ src, size = 26 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src,
				width: size,
				height: size,
				alt: "",
				"aria-hidden": "true",
				draggable: false,
				style: { objectFit: "contain" }
			});
		}
		const FEISHU_PNG = "data:image/png;base64,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";
		function WechatMark({ size = 26 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					fill: "#07C160",
					d: "M9.3 4C5.3 4 2 6.8 2 10.2c0 1.9 1 3.5 2.7 4.6l-.7 2.1 2.4-1.2c.6.2 1.3.3 2 .4-.2-.5-.3-1.1-.3-1.6 0-3.2 3.1-5.7 6.8-5.7h.4C14.7 6 12.2 4 9.3 4zM7.1 8.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm4.5 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					fill: "#07C160",
					d: "M22 14.4c0-2.8-2.8-5.1-6.1-5.1s-6.1 2.3-6.1 5.1 2.8 5.1 6.1 5.1c.6 0 1.2-.1 1.8-.3l2.1 1-.6-1.8c1.7-.9 2.8-2.4 2.8-4.1zm-8.1-.8c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8zm4 0c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8z"
				})]
			});
		}
		function FeishuMark(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkImg, {
				...props,
				src: FEISHU_PNG
			});
		}
		//#endregion
		//#region node_modules/.pnpm/qrcode-generator@2.0.4/node_modules/qrcode-generator/dist/qrcode.mjs
		/**
		* qrcode
		* @param typeNumber 1 to 40
		* @param errorCorrectionLevel 'L','M','Q','H'
		*/
		const qrcode = function(typeNumber, errorCorrectionLevel) {
			const PAD0 = 236;
			const PAD1 = 17;
			let _typeNumber = typeNumber;
			const _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
			let _modules = null;
			let _moduleCount = 0;
			let _dataCache = null;
			const _dataList = [];
			const _this = {};
			const makeImpl = function(test, maskPattern) {
				_moduleCount = _typeNumber * 4 + 17;
				_modules = function(moduleCount) {
					const modules = new Array(moduleCount);
					for (let row = 0; row < moduleCount; row += 1) {
						modules[row] = new Array(moduleCount);
						for (let col = 0; col < moduleCount; col += 1) modules[row][col] = null;
					}
					return modules;
				}(_moduleCount);
				setupPositionProbePattern(0, 0);
				setupPositionProbePattern(_moduleCount - 7, 0);
				setupPositionProbePattern(0, _moduleCount - 7);
				setupPositionAdjustPattern();
				setupTimingPattern();
				setupTypeInfo(test, maskPattern);
				if (_typeNumber >= 7) setupTypeNumber(test);
				if (_dataCache == null) _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
				mapData(_dataCache, maskPattern);
			};
			const setupPositionProbePattern = function(row, col) {
				for (let r = -1; r <= 7; r += 1) {
					if (row + r <= -1 || _moduleCount <= row + r) continue;
					for (let c = -1; c <= 7; c += 1) {
						if (col + c <= -1 || _moduleCount <= col + c) continue;
						if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) _modules[row + r][col + c] = true;
						else _modules[row + r][col + c] = false;
					}
				}
			};
			const getBestMaskPattern = function() {
				let minLostPoint = 0;
				let pattern = 0;
				for (let i = 0; i < 8; i += 1) {
					makeImpl(true, i);
					const lostPoint = QRUtil.getLostPoint(_this);
					if (i == 0 || minLostPoint > lostPoint) {
						minLostPoint = lostPoint;
						pattern = i;
					}
				}
				return pattern;
			};
			const setupTimingPattern = function() {
				for (let r = 8; r < _moduleCount - 8; r += 1) {
					if (_modules[r][6] != null) continue;
					_modules[r][6] = r % 2 == 0;
				}
				for (let c = 8; c < _moduleCount - 8; c += 1) {
					if (_modules[6][c] != null) continue;
					_modules[6][c] = c % 2 == 0;
				}
			};
			const setupPositionAdjustPattern = function() {
				const pos = QRUtil.getPatternPosition(_typeNumber);
				for (let i = 0; i < pos.length; i += 1) for (let j = 0; j < pos.length; j += 1) {
					const row = pos[i];
					const col = pos[j];
					if (_modules[row][col] != null) continue;
					for (let r = -2; r <= 2; r += 1) for (let c = -2; c <= 2; c += 1) if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) _modules[row + r][col + c] = true;
					else _modules[row + r][col + c] = false;
				}
			};
			const setupTypeNumber = function(test) {
				const bits = QRUtil.getBCHTypeNumber(_typeNumber);
				for (let i = 0; i < 18; i += 1) {
					const mod = !test && (bits >> i & 1) == 1;
					_modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
				}
				for (let i = 0; i < 18; i += 1) {
					const mod = !test && (bits >> i & 1) == 1;
					_modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
				}
			};
			const setupTypeInfo = function(test, maskPattern) {
				const data = _errorCorrectionLevel << 3 | maskPattern;
				const bits = QRUtil.getBCHTypeInfo(data);
				for (let i = 0; i < 15; i += 1) {
					const mod = !test && (bits >> i & 1) == 1;
					if (i < 6) _modules[i][8] = mod;
					else if (i < 8) _modules[i + 1][8] = mod;
					else _modules[_moduleCount - 15 + i][8] = mod;
				}
				for (let i = 0; i < 15; i += 1) {
					const mod = !test && (bits >> i & 1) == 1;
					if (i < 8) _modules[8][_moduleCount - i - 1] = mod;
					else if (i < 9) _modules[8][15 - i - 1 + 1] = mod;
					else _modules[8][15 - i - 1] = mod;
				}
				_modules[_moduleCount - 8][8] = !test;
			};
			const mapData = function(data, maskPattern) {
				let inc = -1;
				let row = _moduleCount - 1;
				let bitIndex = 7;
				let byteIndex = 0;
				const maskFunc = QRUtil.getMaskFunction(maskPattern);
				for (let col = _moduleCount - 1; col > 0; col -= 2) {
					if (col == 6) col -= 1;
					while (true) {
						for (let c = 0; c < 2; c += 1) if (_modules[row][col - c] == null) {
							let dark = false;
							if (byteIndex < data.length) dark = (data[byteIndex] >>> bitIndex & 1) == 1;
							if (maskFunc(row, col - c)) dark = !dark;
							_modules[row][col - c] = dark;
							bitIndex -= 1;
							if (bitIndex == -1) {
								byteIndex += 1;
								bitIndex = 7;
							}
						}
						row += inc;
						if (row < 0 || _moduleCount <= row) {
							row -= inc;
							inc = -inc;
							break;
						}
					}
				}
			};
			const createBytes = function(buffer, rsBlocks) {
				let offset = 0;
				let maxDcCount = 0;
				let maxEcCount = 0;
				const dcdata = new Array(rsBlocks.length);
				const ecdata = new Array(rsBlocks.length);
				for (let r = 0; r < rsBlocks.length; r += 1) {
					const dcCount = rsBlocks[r].dataCount;
					const ecCount = rsBlocks[r].totalCount - dcCount;
					maxDcCount = Math.max(maxDcCount, dcCount);
					maxEcCount = Math.max(maxEcCount, ecCount);
					dcdata[r] = new Array(dcCount);
					for (let i = 0; i < dcdata[r].length; i += 1) dcdata[r][i] = 255 & buffer.getBuffer()[i + offset];
					offset += dcCount;
					const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
					const modPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1).mod(rsPoly);
					ecdata[r] = new Array(rsPoly.getLength() - 1);
					for (let i = 0; i < ecdata[r].length; i += 1) {
						const modIndex = i + modPoly.getLength() - ecdata[r].length;
						ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
					}
				}
				let totalCodeCount = 0;
				for (let i = 0; i < rsBlocks.length; i += 1) totalCodeCount += rsBlocks[i].totalCount;
				const data = new Array(totalCodeCount);
				let index = 0;
				for (let i = 0; i < maxDcCount; i += 1) for (let r = 0; r < rsBlocks.length; r += 1) if (i < dcdata[r].length) {
					data[index] = dcdata[r][i];
					index += 1;
				}
				for (let i = 0; i < maxEcCount; i += 1) for (let r = 0; r < rsBlocks.length; r += 1) if (i < ecdata[r].length) {
					data[index] = ecdata[r][i];
					index += 1;
				}
				return data;
			};
			const createData = function(typeNumber, errorCorrectionLevel, dataList) {
				const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);
				const buffer = qrBitBuffer();
				for (let i = 0; i < dataList.length; i += 1) {
					const data = dataList[i];
					buffer.put(data.getMode(), 4);
					buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
					data.write(buffer);
				}
				let totalDataCount = 0;
				for (let i = 0; i < rsBlocks.length; i += 1) totalDataCount += rsBlocks[i].dataCount;
				if (buffer.getLengthInBits() > totalDataCount * 8) throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
				if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
				while (buffer.getLengthInBits() % 8 != 0) buffer.putBit(false);
				while (true) {
					if (buffer.getLengthInBits() >= totalDataCount * 8) break;
					buffer.put(PAD0, 8);
					if (buffer.getLengthInBits() >= totalDataCount * 8) break;
					buffer.put(PAD1, 8);
				}
				return createBytes(buffer, rsBlocks);
			};
			_this.addData = function(data, mode) {
				mode = mode || "Byte";
				let newData = null;
				switch (mode) {
					case "Numeric":
						newData = qrNumber(data);
						break;
					case "Alphanumeric":
						newData = qrAlphaNum(data);
						break;
					case "Byte":
						newData = qr8BitByte(data);
						break;
					case "Kanji":
						newData = qrKanji(data);
						break;
					default: throw "mode:" + mode;
				}
				_dataList.push(newData);
				_dataCache = null;
			};
			_this.isDark = function(row, col) {
				if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) throw row + "," + col;
				return _modules[row][col];
			};
			_this.getModuleCount = function() {
				return _moduleCount;
			};
			_this.make = function() {
				if (_typeNumber < 1) {
					let typeNumber = 1;
					for (; typeNumber < 40; typeNumber++) {
						const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
						const buffer = qrBitBuffer();
						for (let i = 0; i < _dataList.length; i++) {
							const data = _dataList[i];
							buffer.put(data.getMode(), 4);
							buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
							data.write(buffer);
						}
						let totalDataCount = 0;
						for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
						if (buffer.getLengthInBits() <= totalDataCount * 8) break;
					}
					_typeNumber = typeNumber;
				}
				makeImpl(false, getBestMaskPattern());
			};
			_this.createTableTag = function(cellSize, margin) {
				cellSize = cellSize || 2;
				margin = typeof margin == "undefined" ? cellSize * 4 : margin;
				let qrHtml = "";
				qrHtml += "<table style=\"";
				qrHtml += " border-width: 0px; border-style: none;";
				qrHtml += " border-collapse: collapse;";
				qrHtml += " padding: 0px; margin: " + margin + "px;";
				qrHtml += "\">";
				qrHtml += "<tbody>";
				for (let r = 0; r < _this.getModuleCount(); r += 1) {
					qrHtml += "<tr>";
					for (let c = 0; c < _this.getModuleCount(); c += 1) {
						qrHtml += "<td style=\"";
						qrHtml += " border-width: 0px; border-style: none;";
						qrHtml += " border-collapse: collapse;";
						qrHtml += " padding: 0px; margin: 0px;";
						qrHtml += " width: " + cellSize + "px;";
						qrHtml += " height: " + cellSize + "px;";
						qrHtml += " background-color: ";
						qrHtml += _this.isDark(r, c) ? "#000000" : "#ffffff";
						qrHtml += ";";
						qrHtml += "\"/>";
					}
					qrHtml += "</tr>";
				}
				qrHtml += "</tbody>";
				qrHtml += "</table>";
				return qrHtml;
			};
			_this.createSvgTag = function(cellSize, margin, alt, title) {
				let opts = {};
				if (typeof arguments[0] == "object") {
					opts = arguments[0];
					cellSize = opts.cellSize;
					margin = opts.margin;
					alt = opts.alt;
					title = opts.title;
				}
				cellSize = cellSize || 2;
				margin = typeof margin == "undefined" ? cellSize * 4 : margin;
				alt = typeof alt === "string" ? { text: alt } : alt || {};
				alt.text = alt.text || null;
				alt.id = alt.text ? alt.id || "qrcode-description" : null;
				title = typeof title === "string" ? { text: title } : title || {};
				title.text = title.text || null;
				title.id = title.text ? title.id || "qrcode-title" : null;
				const size = _this.getModuleCount() * cellSize + margin * 2;
				let c, mc, r, mr, qrSvg = "", rect;
				rect = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";
				qrSvg += "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"";
				qrSvg += !opts.scalable ? " width=\"" + size + "px\" height=\"" + size + "px\"" : "";
				qrSvg += " viewBox=\"0 0 " + size + " " + size + "\" ";
				qrSvg += " preserveAspectRatio=\"xMinYMin meet\"";
				qrSvg += title.text || alt.text ? " role=\"img\" aria-labelledby=\"" + escapeXml([title.id, alt.id].join(" ").trim()) + "\"" : "";
				qrSvg += ">";
				qrSvg += title.text ? "<title id=\"" + escapeXml(title.id) + "\">" + escapeXml(title.text) + "</title>" : "";
				qrSvg += alt.text ? "<description id=\"" + escapeXml(alt.id) + "\">" + escapeXml(alt.text) + "</description>" : "";
				qrSvg += "<rect width=\"100%\" height=\"100%\" fill=\"white\" cx=\"0\" cy=\"0\"/>";
				qrSvg += "<path d=\"";
				for (r = 0; r < _this.getModuleCount(); r += 1) {
					mr = r * cellSize + margin;
					for (c = 0; c < _this.getModuleCount(); c += 1) if (_this.isDark(r, c)) {
						mc = c * cellSize + margin;
						qrSvg += "M" + mc + "," + mr + rect;
					}
				}
				qrSvg += "\" stroke=\"transparent\" fill=\"black\"/>";
				qrSvg += "</svg>";
				return qrSvg;
			};
			_this.createDataURL = function(cellSize, margin) {
				cellSize = cellSize || 2;
				margin = typeof margin == "undefined" ? cellSize * 4 : margin;
				const size = _this.getModuleCount() * cellSize + margin * 2;
				const min = margin;
				const max = size - margin;
				return createDataURL(size, size, function(x, y) {
					if (min <= x && x < max && min <= y && y < max) {
						const c = Math.floor((x - min) / cellSize);
						const r = Math.floor((y - min) / cellSize);
						return _this.isDark(r, c) ? 0 : 1;
					} else return 1;
				});
			};
			_this.createImgTag = function(cellSize, margin, alt) {
				cellSize = cellSize || 2;
				margin = typeof margin == "undefined" ? cellSize * 4 : margin;
				const size = _this.getModuleCount() * cellSize + margin * 2;
				let img = "";
				img += "<img";
				img += " src=\"";
				img += _this.createDataURL(cellSize, margin);
				img += "\"";
				img += " width=\"";
				img += size;
				img += "\"";
				img += " height=\"";
				img += size;
				img += "\"";
				if (alt) {
					img += " alt=\"";
					img += escapeXml(alt);
					img += "\"";
				}
				img += "/>";
				return img;
			};
			const escapeXml = function(s) {
				let escaped = "";
				for (let i = 0; i < s.length; i += 1) {
					const c = s.charAt(i);
					switch (c) {
						case "<":
							escaped += "&lt;";
							break;
						case ">":
							escaped += "&gt;";
							break;
						case "&":
							escaped += "&amp;";
							break;
						case "\"":
							escaped += "&quot;";
							break;
						default: escaped += c;
					}
				}
				return escaped;
			};
			const _createHalfASCII = function(margin) {
				const cellSize = 1;
				margin = typeof margin == "undefined" ? 2 : margin;
				const size = _this.getModuleCount() * cellSize + margin * 2;
				const min = margin;
				const max = size - margin;
				let y, x, r1, r2, p;
				const blocks = {
					"██": "█",
					"█ ": "▀",
					" █": "▄",
					"  ": " "
				};
				const blocksLastLineNoMargin = {
					"██": "▀",
					"█ ": "▀",
					" █": " ",
					"  ": " "
				};
				let ascii = "";
				for (y = 0; y < size; y += 2) {
					r1 = Math.floor((y - min) / cellSize);
					r2 = Math.floor((y + 1 - min) / cellSize);
					for (x = 0; x < size; x += 1) {
						p = "█";
						if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) p = " ";
						if (min <= x && x < max && min <= y + 1 && y + 1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) p += " ";
						else p += "█";
						ascii += margin < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
					}
					ascii += "\n";
				}
				if (size % 2 && margin > 0) return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("▀");
				return ascii.substring(0, ascii.length - 1);
			};
			_this.createASCII = function(cellSize, margin) {
				cellSize = cellSize || 1;
				if (cellSize < 2) return _createHalfASCII(margin);
				cellSize -= 1;
				margin = typeof margin == "undefined" ? cellSize * 2 : margin;
				const size = _this.getModuleCount() * cellSize + margin * 2;
				const min = margin;
				const max = size - margin;
				let y, x, r, p;
				const white = Array(cellSize + 1).join("██");
				const black = Array(cellSize + 1).join("  ");
				let ascii = "";
				let line = "";
				for (y = 0; y < size; y += 1) {
					r = Math.floor((y - min) / cellSize);
					line = "";
					for (x = 0; x < size; x += 1) {
						p = 1;
						if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) p = 0;
						line += p ? white : black;
					}
					for (r = 0; r < cellSize; r += 1) ascii += line + "\n";
				}
				return ascii.substring(0, ascii.length - 1);
			};
			_this.renderTo2dContext = function(context, cellSize) {
				cellSize = cellSize || 2;
				const length = _this.getModuleCount();
				for (let row = 0; row < length; row++) for (let col = 0; col < length; col++) {
					context.fillStyle = _this.isDark(row, col) ? "black" : "white";
					context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
				}
			};
			return _this;
		};
		qrcode.stringToBytes = function(s) {
			const bytes = [];
			for (let i = 0; i < s.length; i += 1) {
				const c = s.charCodeAt(i);
				bytes.push(c & 255);
			}
			return bytes;
		};
		/**
		* @param unicodeData base64 string of byte array.
		* [16bit Unicode],[16bit Bytes], ...
		* @param numChars
		*/
		qrcode.createStringToBytes = function(unicodeData, numChars) {
			const unicodeMap = function() {
				const bin = base64DecodeInputStream(unicodeData);
				const read = function() {
					const b = bin.read();
					if (b == -1) throw "eof";
					return b;
				};
				let count = 0;
				const unicodeMap = {};
				while (true) {
					const b0 = bin.read();
					if (b0 == -1) break;
					const b1 = read();
					const b2 = read();
					const b3 = read();
					const k = String.fromCharCode(b0 << 8 | b1);
					unicodeMap[k] = b2 << 8 | b3;
					count += 1;
				}
				if (count != numChars) throw count + " != " + numChars;
				return unicodeMap;
			}();
			const unknownChar = "?".charCodeAt(0);
			return function(s) {
				const bytes = [];
				for (let i = 0; i < s.length; i += 1) {
					const c = s.charCodeAt(i);
					if (c < 128) bytes.push(c);
					else {
						const b = unicodeMap[s.charAt(i)];
						if (typeof b == "number") {
							if ((b & 255) == b) bytes.push(b);
							else {
								bytes.push(b >>> 8);
								bytes.push(b & 255);
							}
						} else bytes.push(unknownChar);
					}
				}
				return bytes;
			};
		};
		const QRMode = {
			MODE_NUMBER: 1,
			MODE_ALPHA_NUM: 2,
			MODE_8BIT_BYTE: 4,
			MODE_KANJI: 8
		};
		const QRErrorCorrectionLevel = {
			L: 1,
			M: 0,
			Q: 3,
			H: 2
		};
		const QRMaskPattern = {
			PATTERN000: 0,
			PATTERN001: 1,
			PATTERN010: 2,
			PATTERN011: 3,
			PATTERN100: 4,
			PATTERN101: 5,
			PATTERN110: 6,
			PATTERN111: 7
		};
		const QRUtil = function() {
			const PATTERN_POSITION_TABLE = [
				[],
				[6, 18],
				[6, 22],
				[6, 26],
				[6, 30],
				[6, 34],
				[
					6,
					22,
					38
				],
				[
					6,
					24,
					42
				],
				[
					6,
					26,
					46
				],
				[
					6,
					28,
					50
				],
				[
					6,
					30,
					54
				],
				[
					6,
					32,
					58
				],
				[
					6,
					34,
					62
				],
				[
					6,
					26,
					46,
					66
				],
				[
					6,
					26,
					48,
					70
				],
				[
					6,
					26,
					50,
					74
				],
				[
					6,
					30,
					54,
					78
				],
				[
					6,
					30,
					56,
					82
				],
				[
					6,
					30,
					58,
					86
				],
				[
					6,
					34,
					62,
					90
				],
				[
					6,
					28,
					50,
					72,
					94
				],
				[
					6,
					26,
					50,
					74,
					98
				],
				[
					6,
					30,
					54,
					78,
					102
				],
				[
					6,
					28,
					54,
					80,
					106
				],
				[
					6,
					32,
					58,
					84,
					110
				],
				[
					6,
					30,
					58,
					86,
					114
				],
				[
					6,
					34,
					62,
					90,
					118
				],
				[
					6,
					26,
					50,
					74,
					98,
					122
				],
				[
					6,
					30,
					54,
					78,
					102,
					126
				],
				[
					6,
					26,
					52,
					78,
					104,
					130
				],
				[
					6,
					30,
					56,
					82,
					108,
					134
				],
				[
					6,
					34,
					60,
					86,
					112,
					138
				],
				[
					6,
					30,
					58,
					86,
					114,
					142
				],
				[
					6,
					34,
					62,
					90,
					118,
					146
				],
				[
					6,
					30,
					54,
					78,
					102,
					126,
					150
				],
				[
					6,
					24,
					50,
					76,
					102,
					128,
					154
				],
				[
					6,
					28,
					54,
					80,
					106,
					132,
					158
				],
				[
					6,
					32,
					58,
					84,
					110,
					136,
					162
				],
				[
					6,
					26,
					54,
					82,
					110,
					138,
					166
				],
				[
					6,
					30,
					58,
					86,
					114,
					142,
					170
				]
			];
			const G15 = 1335;
			const G18 = 7973;
			const G15_MASK = 21522;
			const _this = {};
			const getBCHDigit = function(data) {
				let digit = 0;
				while (data != 0) {
					digit += 1;
					data >>>= 1;
				}
				return digit;
			};
			_this.getBCHTypeInfo = function(data) {
				let d = data << 10;
				while (getBCHDigit(d) - getBCHDigit(G15) >= 0) d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
				return (data << 10 | d) ^ G15_MASK;
			};
			_this.getBCHTypeNumber = function(data) {
				let d = data << 12;
				while (getBCHDigit(d) - getBCHDigit(G18) >= 0) d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
				return data << 12 | d;
			};
			_this.getPatternPosition = function(typeNumber) {
				return PATTERN_POSITION_TABLE[typeNumber - 1];
			};
			_this.getMaskFunction = function(maskPattern) {
				switch (maskPattern) {
					case QRMaskPattern.PATTERN000: return function(i, j) {
						return (i + j) % 2 == 0;
					};
					case QRMaskPattern.PATTERN001: return function(i, j) {
						return i % 2 == 0;
					};
					case QRMaskPattern.PATTERN010: return function(i, j) {
						return j % 3 == 0;
					};
					case QRMaskPattern.PATTERN011: return function(i, j) {
						return (i + j) % 3 == 0;
					};
					case QRMaskPattern.PATTERN100: return function(i, j) {
						return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
					};
					case QRMaskPattern.PATTERN101: return function(i, j) {
						return i * j % 2 + i * j % 3 == 0;
					};
					case QRMaskPattern.PATTERN110: return function(i, j) {
						return (i * j % 2 + i * j % 3) % 2 == 0;
					};
					case QRMaskPattern.PATTERN111: return function(i, j) {
						return (i * j % 3 + (i + j) % 2) % 2 == 0;
					};
					default: throw "bad maskPattern:" + maskPattern;
				}
			};
			_this.getErrorCorrectPolynomial = function(errorCorrectLength) {
				let a = qrPolynomial([1], 0);
				for (let i = 0; i < errorCorrectLength; i += 1) a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
				return a;
			};
			_this.getLengthInBits = function(mode, type) {
				if (1 <= type && type < 10) switch (mode) {
					case QRMode.MODE_NUMBER: return 10;
					case QRMode.MODE_ALPHA_NUM: return 9;
					case QRMode.MODE_8BIT_BYTE: return 8;
					case QRMode.MODE_KANJI: return 8;
					default: throw "mode:" + mode;
				}
				else if (type < 27) switch (mode) {
					case QRMode.MODE_NUMBER: return 12;
					case QRMode.MODE_ALPHA_NUM: return 11;
					case QRMode.MODE_8BIT_BYTE: return 16;
					case QRMode.MODE_KANJI: return 10;
					default: throw "mode:" + mode;
				}
				else if (type < 41) switch (mode) {
					case QRMode.MODE_NUMBER: return 14;
					case QRMode.MODE_ALPHA_NUM: return 13;
					case QRMode.MODE_8BIT_BYTE: return 16;
					case QRMode.MODE_KANJI: return 12;
					default: throw "mode:" + mode;
				}
				else throw "type:" + type;
			};
			_this.getLostPoint = function(qrcode) {
				const moduleCount = qrcode.getModuleCount();
				let lostPoint = 0;
				for (let row = 0; row < moduleCount; row += 1) for (let col = 0; col < moduleCount; col += 1) {
					let sameCount = 0;
					const dark = qrcode.isDark(row, col);
					for (let r = -1; r <= 1; r += 1) {
						if (row + r < 0 || moduleCount <= row + r) continue;
						for (let c = -1; c <= 1; c += 1) {
							if (col + c < 0 || moduleCount <= col + c) continue;
							if (r == 0 && c == 0) continue;
							if (dark == qrcode.isDark(row + r, col + c)) sameCount += 1;
						}
					}
					if (sameCount > 5) lostPoint += 3 + sameCount - 5;
				}
				for (let row = 0; row < moduleCount - 1; row += 1) for (let col = 0; col < moduleCount - 1; col += 1) {
					let count = 0;
					if (qrcode.isDark(row, col)) count += 1;
					if (qrcode.isDark(row + 1, col)) count += 1;
					if (qrcode.isDark(row, col + 1)) count += 1;
					if (qrcode.isDark(row + 1, col + 1)) count += 1;
					if (count == 0 || count == 4) lostPoint += 3;
				}
				for (let row = 0; row < moduleCount; row += 1) for (let col = 0; col < moduleCount - 6; col += 1) if (qrcode.isDark(row, col) && !qrcode.isDark(row, col + 1) && qrcode.isDark(row, col + 2) && qrcode.isDark(row, col + 3) && qrcode.isDark(row, col + 4) && !qrcode.isDark(row, col + 5) && qrcode.isDark(row, col + 6)) lostPoint += 40;
				for (let col = 0; col < moduleCount; col += 1) for (let row = 0; row < moduleCount - 6; row += 1) if (qrcode.isDark(row, col) && !qrcode.isDark(row + 1, col) && qrcode.isDark(row + 2, col) && qrcode.isDark(row + 3, col) && qrcode.isDark(row + 4, col) && !qrcode.isDark(row + 5, col) && qrcode.isDark(row + 6, col)) lostPoint += 40;
				let darkCount = 0;
				for (let col = 0; col < moduleCount; col += 1) for (let row = 0; row < moduleCount; row += 1) if (qrcode.isDark(row, col)) darkCount += 1;
				const ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
				lostPoint += ratio * 10;
				return lostPoint;
			};
			return _this;
		}();
		const QRMath = function() {
			const EXP_TABLE = new Array(256);
			const LOG_TABLE = new Array(256);
			for (let i = 0; i < 8; i += 1) EXP_TABLE[i] = 1 << i;
			for (let i = 8; i < 256; i += 1) EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
			for (let i = 0; i < 255; i += 1) LOG_TABLE[EXP_TABLE[i]] = i;
			const _this = {};
			_this.glog = function(n) {
				if (n < 1) throw "glog(" + n + ")";
				return LOG_TABLE[n];
			};
			_this.gexp = function(n) {
				while (n < 0) n += 255;
				while (n >= 256) n -= 255;
				return EXP_TABLE[n];
			};
			return _this;
		}();
		const qrPolynomial = function(num, shift) {
			if (typeof num.length == "undefined") throw num.length + "/" + shift;
			const _num = function() {
				let offset = 0;
				while (offset < num.length && num[offset] == 0) offset += 1;
				const _num = new Array(num.length - offset + shift);
				for (let i = 0; i < num.length - offset; i += 1) _num[i] = num[i + offset];
				return _num;
			}();
			const _this = {};
			_this.getAt = function(index) {
				return _num[index];
			};
			_this.getLength = function() {
				return _num.length;
			};
			_this.multiply = function(e) {
				const num = new Array(_this.getLength() + e.getLength() - 1);
				for (let i = 0; i < _this.getLength(); i += 1) for (let j = 0; j < e.getLength(); j += 1) num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
				return qrPolynomial(num, 0);
			};
			_this.mod = function(e) {
				if (_this.getLength() - e.getLength() < 0) return _this;
				const ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));
				const num = new Array(_this.getLength());
				for (let i = 0; i < _this.getLength(); i += 1) num[i] = _this.getAt(i);
				for (let i = 0; i < e.getLength(); i += 1) num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
				return qrPolynomial(num, 0).mod(e);
			};
			return _this;
		};
		const QRRSBlock = function() {
			const RS_BLOCK_TABLE = [
				[
					1,
					26,
					19
				],
				[
					1,
					26,
					16
				],
				[
					1,
					26,
					13
				],
				[
					1,
					26,
					9
				],
				[
					1,
					44,
					34
				],
				[
					1,
					44,
					28
				],
				[
					1,
					44,
					22
				],
				[
					1,
					44,
					16
				],
				[
					1,
					70,
					55
				],
				[
					1,
					70,
					44
				],
				[
					2,
					35,
					17
				],
				[
					2,
					35,
					13
				],
				[
					1,
					100,
					80
				],
				[
					2,
					50,
					32
				],
				[
					2,
					50,
					24
				],
				[
					4,
					25,
					9
				],
				[
					1,
					134,
					108
				],
				[
					2,
					67,
					43
				],
				[
					2,
					33,
					15,
					2,
					34,
					16
				],
				[
					2,
					33,
					11,
					2,
					34,
					12
				],
				[
					2,
					86,
					68
				],
				[
					4,
					43,
					27
				],
				[
					4,
					43,
					19
				],
				[
					4,
					43,
					15
				],
				[
					2,
					98,
					78
				],
				[
					4,
					49,
					31
				],
				[
					2,
					32,
					14,
					4,
					33,
					15
				],
				[
					4,
					39,
					13,
					1,
					40,
					14
				],
				[
					2,
					121,
					97
				],
				[
					2,
					60,
					38,
					2,
					61,
					39
				],
				[
					4,
					40,
					18,
					2,
					41,
					19
				],
				[
					4,
					40,
					14,
					2,
					41,
					15
				],
				[
					2,
					146,
					116
				],
				[
					3,
					58,
					36,
					2,
					59,
					37
				],
				[
					4,
					36,
					16,
					4,
					37,
					17
				],
				[
					4,
					36,
					12,
					4,
					37,
					13
				],
				[
					2,
					86,
					68,
					2,
					87,
					69
				],
				[
					4,
					69,
					43,
					1,
					70,
					44
				],
				[
					6,
					43,
					19,
					2,
					44,
					20
				],
				[
					6,
					43,
					15,
					2,
					44,
					16
				],
				[
					4,
					101,
					81
				],
				[
					1,
					80,
					50,
					4,
					81,
					51
				],
				[
					4,
					50,
					22,
					4,
					51,
					23
				],
				[
					3,
					36,
					12,
					8,
					37,
					13
				],
				[
					2,
					116,
					92,
					2,
					117,
					93
				],
				[
					6,
					58,
					36,
					2,
					59,
					37
				],
				[
					4,
					46,
					20,
					6,
					47,
					21
				],
				[
					7,
					42,
					14,
					4,
					43,
					15
				],
				[
					4,
					133,
					107
				],
				[
					8,
					59,
					37,
					1,
					60,
					38
				],
				[
					8,
					44,
					20,
					4,
					45,
					21
				],
				[
					12,
					33,
					11,
					4,
					34,
					12
				],
				[
					3,
					145,
					115,
					1,
					146,
					116
				],
				[
					4,
					64,
					40,
					5,
					65,
					41
				],
				[
					11,
					36,
					16,
					5,
					37,
					17
				],
				[
					11,
					36,
					12,
					5,
					37,
					13
				],
				[
					5,
					109,
					87,
					1,
					110,
					88
				],
				[
					5,
					65,
					41,
					5,
					66,
					42
				],
				[
					5,
					54,
					24,
					7,
					55,
					25
				],
				[
					11,
					36,
					12,
					7,
					37,
					13
				],
				[
					5,
					122,
					98,
					1,
					123,
					99
				],
				[
					7,
					73,
					45,
					3,
					74,
					46
				],
				[
					15,
					43,
					19,
					2,
					44,
					20
				],
				[
					3,
					45,
					15,
					13,
					46,
					16
				],
				[
					1,
					135,
					107,
					5,
					136,
					108
				],
				[
					10,
					74,
					46,
					1,
					75,
					47
				],
				[
					1,
					50,
					22,
					15,
					51,
					23
				],
				[
					2,
					42,
					14,
					17,
					43,
					15
				],
				[
					5,
					150,
					120,
					1,
					151,
					121
				],
				[
					9,
					69,
					43,
					4,
					70,
					44
				],
				[
					17,
					50,
					22,
					1,
					51,
					23
				],
				[
					2,
					42,
					14,
					19,
					43,
					15
				],
				[
					3,
					141,
					113,
					4,
					142,
					114
				],
				[
					3,
					70,
					44,
					11,
					71,
					45
				],
				[
					17,
					47,
					21,
					4,
					48,
					22
				],
				[
					9,
					39,
					13,
					16,
					40,
					14
				],
				[
					3,
					135,
					107,
					5,
					136,
					108
				],
				[
					3,
					67,
					41,
					13,
					68,
					42
				],
				[
					15,
					54,
					24,
					5,
					55,
					25
				],
				[
					15,
					43,
					15,
					10,
					44,
					16
				],
				[
					4,
					144,
					116,
					4,
					145,
					117
				],
				[
					17,
					68,
					42
				],
				[
					17,
					50,
					22,
					6,
					51,
					23
				],
				[
					19,
					46,
					16,
					6,
					47,
					17
				],
				[
					2,
					139,
					111,
					7,
					140,
					112
				],
				[
					17,
					74,
					46
				],
				[
					7,
					54,
					24,
					16,
					55,
					25
				],
				[
					34,
					37,
					13
				],
				[
					4,
					151,
					121,
					5,
					152,
					122
				],
				[
					4,
					75,
					47,
					14,
					76,
					48
				],
				[
					11,
					54,
					24,
					14,
					55,
					25
				],
				[
					16,
					45,
					15,
					14,
					46,
					16
				],
				[
					6,
					147,
					117,
					4,
					148,
					118
				],
				[
					6,
					73,
					45,
					14,
					74,
					46
				],
				[
					11,
					54,
					24,
					16,
					55,
					25
				],
				[
					30,
					46,
					16,
					2,
					47,
					17
				],
				[
					8,
					132,
					106,
					4,
					133,
					107
				],
				[
					8,
					75,
					47,
					13,
					76,
					48
				],
				[
					7,
					54,
					24,
					22,
					55,
					25
				],
				[
					22,
					45,
					15,
					13,
					46,
					16
				],
				[
					10,
					142,
					114,
					2,
					143,
					115
				],
				[
					19,
					74,
					46,
					4,
					75,
					47
				],
				[
					28,
					50,
					22,
					6,
					51,
					23
				],
				[
					33,
					46,
					16,
					4,
					47,
					17
				],
				[
					8,
					152,
					122,
					4,
					153,
					123
				],
				[
					22,
					73,
					45,
					3,
					74,
					46
				],
				[
					8,
					53,
					23,
					26,
					54,
					24
				],
				[
					12,
					45,
					15,
					28,
					46,
					16
				],
				[
					3,
					147,
					117,
					10,
					148,
					118
				],
				[
					3,
					73,
					45,
					23,
					74,
					46
				],
				[
					4,
					54,
					24,
					31,
					55,
					25
				],
				[
					11,
					45,
					15,
					31,
					46,
					16
				],
				[
					7,
					146,
					116,
					7,
					147,
					117
				],
				[
					21,
					73,
					45,
					7,
					74,
					46
				],
				[
					1,
					53,
					23,
					37,
					54,
					24
				],
				[
					19,
					45,
					15,
					26,
					46,
					16
				],
				[
					5,
					145,
					115,
					10,
					146,
					116
				],
				[
					19,
					75,
					47,
					10,
					76,
					48
				],
				[
					15,
					54,
					24,
					25,
					55,
					25
				],
				[
					23,
					45,
					15,
					25,
					46,
					16
				],
				[
					13,
					145,
					115,
					3,
					146,
					116
				],
				[
					2,
					74,
					46,
					29,
					75,
					47
				],
				[
					42,
					54,
					24,
					1,
					55,
					25
				],
				[
					23,
					45,
					15,
					28,
					46,
					16
				],
				[
					17,
					145,
					115
				],
				[
					10,
					74,
					46,
					23,
					75,
					47
				],
				[
					10,
					54,
					24,
					35,
					55,
					25
				],
				[
					19,
					45,
					15,
					35,
					46,
					16
				],
				[
					17,
					145,
					115,
					1,
					146,
					116
				],
				[
					14,
					74,
					46,
					21,
					75,
					47
				],
				[
					29,
					54,
					24,
					19,
					55,
					25
				],
				[
					11,
					45,
					15,
					46,
					46,
					16
				],
				[
					13,
					145,
					115,
					6,
					146,
					116
				],
				[
					14,
					74,
					46,
					23,
					75,
					47
				],
				[
					44,
					54,
					24,
					7,
					55,
					25
				],
				[
					59,
					46,
					16,
					1,
					47,
					17
				],
				[
					12,
					151,
					121,
					7,
					152,
					122
				],
				[
					12,
					75,
					47,
					26,
					76,
					48
				],
				[
					39,
					54,
					24,
					14,
					55,
					25
				],
				[
					22,
					45,
					15,
					41,
					46,
					16
				],
				[
					6,
					151,
					121,
					14,
					152,
					122
				],
				[
					6,
					75,
					47,
					34,
					76,
					48
				],
				[
					46,
					54,
					24,
					10,
					55,
					25
				],
				[
					2,
					45,
					15,
					64,
					46,
					16
				],
				[
					17,
					152,
					122,
					4,
					153,
					123
				],
				[
					29,
					74,
					46,
					14,
					75,
					47
				],
				[
					49,
					54,
					24,
					10,
					55,
					25
				],
				[
					24,
					45,
					15,
					46,
					46,
					16
				],
				[
					4,
					152,
					122,
					18,
					153,
					123
				],
				[
					13,
					74,
					46,
					32,
					75,
					47
				],
				[
					48,
					54,
					24,
					14,
					55,
					25
				],
				[
					42,
					45,
					15,
					32,
					46,
					16
				],
				[
					20,
					147,
					117,
					4,
					148,
					118
				],
				[
					40,
					75,
					47,
					7,
					76,
					48
				],
				[
					43,
					54,
					24,
					22,
					55,
					25
				],
				[
					10,
					45,
					15,
					67,
					46,
					16
				],
				[
					19,
					148,
					118,
					6,
					149,
					119
				],
				[
					18,
					75,
					47,
					31,
					76,
					48
				],
				[
					34,
					54,
					24,
					34,
					55,
					25
				],
				[
					20,
					45,
					15,
					61,
					46,
					16
				]
			];
			const qrRSBlock = function(totalCount, dataCount) {
				const _this = {};
				_this.totalCount = totalCount;
				_this.dataCount = dataCount;
				return _this;
			};
			const _this = {};
			const getRsBlockTable = function(typeNumber, errorCorrectionLevel) {
				switch (errorCorrectionLevel) {
					case QRErrorCorrectionLevel.L: return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
					case QRErrorCorrectionLevel.M: return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
					case QRErrorCorrectionLevel.Q: return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
					case QRErrorCorrectionLevel.H: return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
					default: return;
				}
			};
			_this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {
				const rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
				if (typeof rsBlock == "undefined") throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel;
				const length = rsBlock.length / 3;
				const list = [];
				for (let i = 0; i < length; i += 1) {
					const count = rsBlock[i * 3 + 0];
					const totalCount = rsBlock[i * 3 + 1];
					const dataCount = rsBlock[i * 3 + 2];
					for (let j = 0; j < count; j += 1) list.push(qrRSBlock(totalCount, dataCount));
				}
				return list;
			};
			return _this;
		}();
		const qrBitBuffer = function() {
			const _buffer = [];
			let _length = 0;
			const _this = {};
			_this.getBuffer = function() {
				return _buffer;
			};
			_this.getAt = function(index) {
				const bufIndex = Math.floor(index / 8);
				return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
			};
			_this.put = function(num, length) {
				for (let i = 0; i < length; i += 1) _this.putBit((num >>> length - i - 1 & 1) == 1);
			};
			_this.getLengthInBits = function() {
				return _length;
			};
			_this.putBit = function(bit) {
				const bufIndex = Math.floor(_length / 8);
				if (_buffer.length <= bufIndex) _buffer.push(0);
				if (bit) _buffer[bufIndex] |= 128 >>> _length % 8;
				_length += 1;
			};
			return _this;
		};
		const qrNumber = function(data) {
			const _mode = QRMode.MODE_NUMBER;
			const _data = data;
			const _this = {};
			_this.getMode = function() {
				return _mode;
			};
			_this.getLength = function(buffer) {
				return _data.length;
			};
			_this.write = function(buffer) {
				const data = _data;
				let i = 0;
				while (i + 2 < data.length) {
					buffer.put(strToNum(data.substring(i, i + 3)), 10);
					i += 3;
				}
				if (i < data.length) {
					if (data.length - i == 1) buffer.put(strToNum(data.substring(i, i + 1)), 4);
					else if (data.length - i == 2) buffer.put(strToNum(data.substring(i, i + 2)), 7);
				}
			};
			const strToNum = function(s) {
				let num = 0;
				for (let i = 0; i < s.length; i += 1) num = num * 10 + chatToNum(s.charAt(i));
				return num;
			};
			const chatToNum = function(c) {
				if ("0" <= c && c <= "9") return c.charCodeAt(0) - "0".charCodeAt(0);
				throw "illegal char :" + c;
			};
			return _this;
		};
		const qrAlphaNum = function(data) {
			const _mode = QRMode.MODE_ALPHA_NUM;
			const _data = data;
			const _this = {};
			_this.getMode = function() {
				return _mode;
			};
			_this.getLength = function(buffer) {
				return _data.length;
			};
			_this.write = function(buffer) {
				const s = _data;
				let i = 0;
				while (i + 1 < s.length) {
					buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);
					i += 2;
				}
				if (i < s.length) buffer.put(getCode(s.charAt(i)), 6);
			};
			const getCode = function(c) {
				if ("0" <= c && c <= "9") return c.charCodeAt(0) - "0".charCodeAt(0);
				else if ("A" <= c && c <= "Z") return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
				else switch (c) {
					case " ": return 36;
					case "$": return 37;
					case "%": return 38;
					case "*": return 39;
					case "+": return 40;
					case "-": return 41;
					case ".": return 42;
					case "/": return 43;
					case ":": return 44;
					default: throw "illegal char :" + c;
				}
			};
			return _this;
		};
		const qr8BitByte = function(data) {
			const _mode = QRMode.MODE_8BIT_BYTE;
			const _bytes = qrcode.stringToBytes(data);
			const _this = {};
			_this.getMode = function() {
				return _mode;
			};
			_this.getLength = function(buffer) {
				return _bytes.length;
			};
			_this.write = function(buffer) {
				for (let i = 0; i < _bytes.length; i += 1) buffer.put(_bytes[i], 8);
			};
			return _this;
		};
		const qrKanji = function(data) {
			const _mode = QRMode.MODE_KANJI;
			const stringToBytes = qrcode.stringToBytes;
			(function(c, code) {
				const test = stringToBytes(c);
				if (test.length != 2 || (test[0] << 8 | test[1]) != code) throw "sjis not supported.";
			})("友", 38726);
			const _bytes = stringToBytes(data);
			const _this = {};
			_this.getMode = function() {
				return _mode;
			};
			_this.getLength = function(buffer) {
				return ~~(_bytes.length / 2);
			};
			_this.write = function(buffer) {
				const data = _bytes;
				let i = 0;
				while (i + 1 < data.length) {
					let c = (255 & data[i]) << 8 | 255 & data[i + 1];
					if (33088 <= c && c <= 40956) c -= 33088;
					else if (57408 <= c && c <= 60351) c -= 49472;
					else throw "illegal char at " + (i + 1) + "/" + c;
					c = (c >>> 8 & 255) * 192 + (c & 255);
					buffer.put(c, 13);
					i += 2;
				}
				if (i < data.length) throw "illegal char at " + (i + 1);
			};
			return _this;
		};
		const byteArrayOutputStream = function() {
			const _bytes = [];
			const _this = {};
			_this.writeByte = function(b) {
				_bytes.push(b & 255);
			};
			_this.writeShort = function(i) {
				_this.writeByte(i);
				_this.writeByte(i >>> 8);
			};
			_this.writeBytes = function(b, off, len) {
				off = off || 0;
				len = len || b.length;
				for (let i = 0; i < len; i += 1) _this.writeByte(b[i + off]);
			};
			_this.writeString = function(s) {
				for (let i = 0; i < s.length; i += 1) _this.writeByte(s.charCodeAt(i));
			};
			_this.toByteArray = function() {
				return _bytes;
			};
			_this.toString = function() {
				let s = "";
				s += "[";
				for (let i = 0; i < _bytes.length; i += 1) {
					if (i > 0) s += ",";
					s += _bytes[i];
				}
				s += "]";
				return s;
			};
			return _this;
		};
		const base64EncodeOutputStream = function() {
			let _buffer = 0;
			let _buflen = 0;
			let _length = 0;
			let _base64 = "";
			const _this = {};
			const writeEncoded = function(b) {
				_base64 += String.fromCharCode(encode(b & 63));
			};
			const encode = function(n) {
				if (n < 0) throw "n:" + n;
				else if (n < 26) return 65 + n;
				else if (n < 52) return 97 + (n - 26);
				else if (n < 62) return 48 + (n - 52);
				else if (n == 62) return 43;
				else if (n == 63) return 47;
				else throw "n:" + n;
			};
			_this.writeByte = function(n) {
				_buffer = _buffer << 8 | n & 255;
				_buflen += 8;
				_length += 1;
				while (_buflen >= 6) {
					writeEncoded(_buffer >>> _buflen - 6);
					_buflen -= 6;
				}
			};
			_this.flush = function() {
				if (_buflen > 0) {
					writeEncoded(_buffer << 6 - _buflen);
					_buffer = 0;
					_buflen = 0;
				}
				if (_length % 3 != 0) {
					const padlen = 3 - _length % 3;
					for (let i = 0; i < padlen; i += 1) _base64 += "=";
				}
			};
			_this.toString = function() {
				return _base64;
			};
			return _this;
		};
		const base64DecodeInputStream = function(str) {
			const _str = str;
			let _pos = 0;
			let _buffer = 0;
			let _buflen = 0;
			const _this = {};
			_this.read = function() {
				while (_buflen < 8) {
					if (_pos >= _str.length) {
						if (_buflen == 0) return -1;
						throw "unexpected end of file./" + _buflen;
					}
					const c = _str.charAt(_pos);
					_pos += 1;
					if (c == "=") {
						_buflen = 0;
						return -1;
					} else if (c.match(/^\s$/)) continue;
					_buffer = _buffer << 6 | decode(c.charCodeAt(0));
					_buflen += 6;
				}
				const n = _buffer >>> _buflen - 8 & 255;
				_buflen -= 8;
				return n;
			};
			const decode = function(c) {
				if (65 <= c && c <= 90) return c - 65;
				else if (97 <= c && c <= 122) return c - 97 + 26;
				else if (48 <= c && c <= 57) return c - 48 + 52;
				else if (c == 43) return 62;
				else if (c == 47) return 63;
				else throw "c:" + c;
			};
			return _this;
		};
		const gifImage = function(width, height) {
			const _width = width;
			const _height = height;
			const _data = new Array(width * height);
			const _this = {};
			_this.setPixel = function(x, y, pixel) {
				_data[y * _width + x] = pixel;
			};
			_this.write = function(out) {
				out.writeString("GIF87a");
				out.writeShort(_width);
				out.writeShort(_height);
				out.writeByte(128);
				out.writeByte(0);
				out.writeByte(0);
				out.writeByte(0);
				out.writeByte(0);
				out.writeByte(0);
				out.writeByte(255);
				out.writeByte(255);
				out.writeByte(255);
				out.writeString(",");
				out.writeShort(0);
				out.writeShort(0);
				out.writeShort(_width);
				out.writeShort(_height);
				out.writeByte(0);
				const lzwMinCodeSize = 2;
				const raster = getLZWRaster(lzwMinCodeSize);
				out.writeByte(lzwMinCodeSize);
				let offset = 0;
				while (raster.length - offset > 255) {
					out.writeByte(255);
					out.writeBytes(raster, offset, 255);
					offset += 255;
				}
				out.writeByte(raster.length - offset);
				out.writeBytes(raster, offset, raster.length - offset);
				out.writeByte(0);
				out.writeString(";");
			};
			const bitOutputStream = function(out) {
				const _out = out;
				let _bitLength = 0;
				let _bitBuffer = 0;
				const _this = {};
				_this.write = function(data, length) {
					if (data >>> length != 0) throw "length over";
					while (_bitLength + length >= 8) {
						_out.writeByte(255 & (data << _bitLength | _bitBuffer));
						length -= 8 - _bitLength;
						data >>>= 8 - _bitLength;
						_bitBuffer = 0;
						_bitLength = 0;
					}
					_bitBuffer = data << _bitLength | _bitBuffer;
					_bitLength = _bitLength + length;
				};
				_this.flush = function() {
					if (_bitLength > 0) _out.writeByte(_bitBuffer);
				};
				return _this;
			};
			const getLZWRaster = function(lzwMinCodeSize) {
				const clearCode = 1 << lzwMinCodeSize;
				const endCode = (1 << lzwMinCodeSize) + 1;
				let bitLength = lzwMinCodeSize + 1;
				const table = lzwTable();
				for (let i = 0; i < clearCode; i += 1) table.add(String.fromCharCode(i));
				table.add(String.fromCharCode(clearCode));
				table.add(String.fromCharCode(endCode));
				const byteOut = byteArrayOutputStream();
				const bitOut = bitOutputStream(byteOut);
				bitOut.write(clearCode, bitLength);
				let dataIndex = 0;
				let s = String.fromCharCode(_data[dataIndex]);
				dataIndex += 1;
				while (dataIndex < _data.length) {
					const c = String.fromCharCode(_data[dataIndex]);
					dataIndex += 1;
					if (table.contains(s + c)) s = s + c;
					else {
						bitOut.write(table.indexOf(s), bitLength);
						if (table.size() < 4095) {
							if (table.size() == 1 << bitLength) bitLength += 1;
							table.add(s + c);
						}
						s = c;
					}
				}
				bitOut.write(table.indexOf(s), bitLength);
				bitOut.write(endCode, bitLength);
				bitOut.flush();
				return byteOut.toByteArray();
			};
			const lzwTable = function() {
				const _map = {};
				let _size = 0;
				const _this = {};
				_this.add = function(key) {
					if (_this.contains(key)) throw "dup key:" + key;
					_map[key] = _size;
					_size += 1;
				};
				_this.size = function() {
					return _size;
				};
				_this.indexOf = function(key) {
					return _map[key];
				};
				_this.contains = function(key) {
					return typeof _map[key] != "undefined";
				};
				return _this;
			};
			return _this;
		};
		const createDataURL = function(width, height, getPixel) {
			const gif = gifImage(width, height);
			for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) gif.setPixel(x, y, getPixel(x, y));
			const b = byteArrayOutputStream();
			gif.write(b);
			const base64 = base64EncodeOutputStream();
			const bytes = b.toByteArray();
			for (let i = 0; i < bytes.length; i += 1) base64.writeByte(bytes[i]);
			base64.flush();
			return "data:image/gif;base64," + base64;
		};
		qrcode.stringToBytes;
		//#endregion
		//#region src/client/qr.ts
		/** Render a QR code locally as inline SVG (no external image service). */
		function qrSvgDataUrl(data, size = 240) {
			const qr = qrcode(0, "M");
			qr.addData(data);
			qr.make();
			const count = qr.getModuleCount();
			const cell = size / count;
			let rects = "";
			for (let y = 0; y < count; y++) for (let x = 0; x < count; x++) if (qr.isDark(x, y)) rects += `M${x * cell} ${y * cell}h${cell}v${cell}h-${cell}z`;
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${rects}" fill="#000"/></svg>`;
			return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
		}
		//#endregion
		//#region \0dsh-css:D:\project\fork_project\deepseek-harness-plugins\ui-settings-im\src\client\BotChannelTab.module.css.mjs
		const css = ".eiGEEq_section{flex-direction:column;gap:20px;display:flex}.eiGEEq_intro{opacity:.75;margin:0}.eiGEEq_cards{grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;display:grid}@media (width<=720px){.eiGEEq_cards{grid-template-columns:repeat(2,1fr)}}.eiGEEq_card{cursor:pointer;background:color-mix(in srgb, currentColor 4%, transparent);border:1px solid color-mix(in srgb, currentColor 14%, transparent);border-radius:12px;flex-direction:column;align-items:center;gap:10px;padding:18px 12px 14px;transition:border-color .15s,background .15s,transform .1s;display:flex}.eiGEEq_card:hover{border-color:color-mix(in srgb, currentColor 30%, transparent);background:color-mix(in srgb, currentColor 7%, transparent)}.eiGEEq_card:active{transform:scale(.98)}.eiGEEq_card[data-selected=true]{border:2px solid var(--im-accent,#4a6cf7);background:color-mix(in srgb, var(--im-accent,#4a6cf7) 8%, transparent)}.eiGEEq_cardIcon{border-radius:10px;place-items:center;width:44px;height:44px;display:grid}.eiGEEq_cardName{font-size:.95em;font-weight:600}.eiGEEq_cardCount{background:color-mix(in srgb, currentColor 8%, transparent);opacity:.55;border-radius:999px;justify-content:center;align-items:center;min-width:22px;height:22px;padding:0 6px;font-size:.78em;font-weight:600;display:inline-flex}.eiGEEq_cardCount[data-has=true]{background:color-mix(in srgb, var(--im-accent,#4a6cf7) 16%, transparent);color:var(--im-accent,#4a6cf7);opacity:1}.eiGEEq_detail{grid-template-columns:minmax(0,300px) minmax(0,1fr);align-items:start;gap:20px;display:grid}@media (width<=720px){.eiGEEq_detail{grid-template-columns:1fr}}.eiGEEq_qrPanel{border:1px dashed color-mix(in srgb, currentColor 18%, transparent);border-radius:12px;flex-direction:column;justify-content:center;align-items:center;gap:10px;min-height:300px;padding:18px;display:flex}.eiGEEq_qrPanel[data-state=confirmed]{border-style:solid;border-color:#27ae60}.eiGEEq_qrPanel[data-state=error]{border-style:solid;border-color:#c0392b}.eiGEEq_qrImage{background:#fff;border-radius:8px;padding:6px}.eiGEEq_qrClickArea{flex-direction:column;align-items:center;gap:8px;display:flex}.eiGEEq_qrRefreshButton{cursor:pointer;background:0 0;border:none;border-radius:8px;padding:0;line-height:0}.eiGEEq_qrRefreshButton:hover .eiGEEq_qrImage,.eiGEEq_qrRefreshButton:focus-visible .eiGEEq_qrImage{opacity:.82}.eiGEEq_qrRefreshHint{opacity:.55;font-size:.82em}.eiGEEq_qrSpinner{opacity:.6;flex-direction:column;align-items:center;gap:10px;display:flex}.eiGEEq_qrSpinnerRing{border:3px solid color-mix(in srgb, currentColor 20%, transparent);border-top-color:currentColor;border-radius:50%;width:28px;height:28px;animation:.9s linear infinite eiGEEq_qrSpin}@keyframes eiGEEq_qrSpin{to{transform:rotate(360deg)}}.eiGEEq_qrOk{color:#27ae60;font-weight:600}.eiGEEq_qrError{color:#c0392b}.eiGEEq_stepsPanel{flex-direction:column;gap:14px;display:flex}.eiGEEq_stepsTitle{margin:0;font-weight:600}.eiGEEq_steps{counter-reset:step;flex-direction:column;gap:12px;margin:0;padding:0;list-style:none;display:flex}.eiGEEq_step{counter-increment:step;align-items:flex-start;gap:12px;display:flex}.eiGEEq_stepNumber{background:color-mix(in srgb, var(--im-accent,#4a6cf7) 16%, transparent);width:24px;height:24px;color:var(--im-accent,#4a6cf7);border-radius:50%;flex:none;place-items:center;font-size:.78em;font-weight:600;display:grid}.eiGEEq_stepNumber:before{content:counter(step)}.eiGEEq_stepBody{flex-direction:column;gap:3px;font-size:.92em;display:flex}.eiGEEq_stepText{opacity:.9}.eiGEEq_stepNote{opacity:.55;font-size:.82em}.eiGEEq_bindings{flex-direction:column;gap:10px;display:flex}.eiGEEq_bindingsTitle{margin:0;font-weight:600}.eiGEEq_bindingsEmpty{opacity:.55;margin:0;font-size:.9em}.eiGEEq_bindingsTable{border-collapse:collapse;font-size:.88em}.eiGEEq_bindingsTable th{text-align:left;opacity:.6;border-bottom:1px solid color-mix(in srgb, currentColor 18%, transparent);padding:6px 18px 6px 0;font-weight:600}.eiGEEq_bindingsTable td{border-bottom:1px solid color-mix(in srgb, currentColor 10%, transparent);padding:8px 18px 8px 0}.eiGEEq_bindingKind{background:color-mix(in srgb, var(--im-accent,#4a6cf7) 12%, transparent);color:var(--im-accent,#4a6cf7);border-radius:999px;align-items:center;padding:2px 10px;font-size:.9em;display:inline-flex}.eiGEEq_bindingSession{opacity:.7;text-overflow:ellipsis;white-space:nowrap;max-width:220px;font-family:ui-monospace,monospace;font-size:.85em;overflow:hidden}.eiGEEq_bindingRemove{color:#c0392b;cursor:pointer;background:0 0;border:1px solid #c0392b66;border-radius:6px;padding:4px 12px;font-size:.82em;transition:background .15s}.eiGEEq_bindingRemove:hover{background:#c0392b14}.eiGEEq_passphraseCard{border:1px solid color-mix(in srgb, var(--im-accent,#4a6cf7) 30%, transparent);background:color-mix(in srgb, var(--im-accent,#4a6cf7) 6%, transparent);border-radius:12px;flex-wrap:wrap;align-items:center;gap:12px;padding:14px 18px;display:flex}.eiGEEq_passphraseTitle{font-weight:600}.eiGEEq_passphraseHint{opacity:.75;font-size:.88em}.eiGEEq_passphraseCommand{background:color-mix(in srgb, var(--im-accent,#4a6cf7) 12%, transparent);color:var(--im-accent,#4a6cf7);cursor:pointer;user-select:all;border-radius:8px;padding:6px 14px;font-family:ui-monospace,Consolas,monospace;font-size:.95em;font-weight:600}";
		const tagId = "@dsh-extra/dsh-client-ui-settings-im/BotChannelTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-extra/dsh-client-ui-settings-im";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var BotChannelTab_module_css_default = {
			"qrRefreshHint": "eiGEEq_qrRefreshHint",
			"section": "eiGEEq_section",
			"steps": "eiGEEq_steps",
			"stepNote": "eiGEEq_stepNote",
			"stepsTitle": "eiGEEq_stepsTitle",
			"qrSpinner": "eiGEEq_qrSpinner",
			"bindingsTitle": "eiGEEq_bindingsTitle",
			"cardName": "eiGEEq_cardName",
			"detail": "eiGEEq_detail",
			"qrImage": "eiGEEq_qrImage",
			"qrError": "eiGEEq_qrError",
			"cards": "eiGEEq_cards",
			"qrSpin": "eiGEEq_qrSpin",
			"qrOk": "eiGEEq_qrOk",
			"qrSpinnerRing": "eiGEEq_qrSpinnerRing",
			"passphraseCommand": "eiGEEq_passphraseCommand",
			"stepBody": "eiGEEq_stepBody",
			"qrPanel": "eiGEEq_qrPanel",
			"cardIcon": "eiGEEq_cardIcon",
			"stepText": "eiGEEq_stepText",
			"bindingsEmpty": "eiGEEq_bindingsEmpty",
			"bindingsTable": "eiGEEq_bindingsTable",
			"passphraseTitle": "eiGEEq_passphraseTitle",
			"bindings": "eiGEEq_bindings",
			"bindingRemove": "eiGEEq_bindingRemove",
			"step": "eiGEEq_step",
			"passphraseCard": "eiGEEq_passphraseCard",
			"passphraseHint": "eiGEEq_passphraseHint",
			"cardCount": "eiGEEq_cardCount",
			"intro": "eiGEEq_intro",
			"stepsPanel": "eiGEEq_stepsPanel",
			"qrClickArea": "eiGEEq_qrClickArea",
			"card": "eiGEEq_card",
			"stepNumber": "eiGEEq_stepNumber",
			"qrRefreshButton": "eiGEEq_qrRefreshButton",
			"bindingKind": "eiGEEq_bindingKind",
			"bindingSession": "eiGEEq_bindingSession"
		};
		//#endregion
		//#region src/client/BotChannelTab.tsx
		/**
		* Mobile Connect tab content: platform cards in one row, each with its brand
		* mark. Selecting a card starts a QR login via the im-channel host routes;
		* the detail area below splits into the QR (left) and the
		* platform-specific operation steps (right).
		*/
		const POLL_INTERVAL_MS = 1500;
		const KIND_LABELS = {
			wechat: "微信",
			feishu: "飞书"
		};
		const CARD_MARKS = {
			wechat: WechatMark,
			feishu: FeishuMark
		};
		function BotChannelTab(props) {
			const t = props.t;
			if (t === void 0) return null;
			const [selected, setSelected] = (0, react.useState)(void 0);
			const [login, setLogin] = (0, react.useState)(void 0);
			const [startError, setStartError] = (0, react.useState)(void 0);
			const [bindings, setBindings] = (0, react.useState)([]);
			const pollTimer = (0, react.useRef)(void 0);
			const refreshBindings = async () => {
				try {
					const body = await (await fetch("/im-channel/bindings")).json();
					if (body.ok) setBindings(body.bindings);
				} catch {}
			};
			const removeBinding = async (row) => {
				try {
					await fetch("/im-channel/bindings/remove", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ sessionId: row.sessionId })
					});
					await refreshBindings();
				} catch {}
			};
			(0, react.useEffect)(() => {
				refreshBindings();
				selectCard("wechat");
				const interval = setInterval(() => {
					refreshBindings();
				}, 1e4);
				return () => {
					clearInterval(interval);
					if (pollTimer.current !== void 0) clearInterval(pollTimer.current);
				};
			}, []);
			const stopPolling = () => {
				if (pollTimer.current !== void 0) {
					clearInterval(pollTimer.current);
					pollTimer.current = void 0;
				}
			};
			const selectCard = (kind) => {
				stopPolling();
				setSelected(kind);
				setLogin(void 0);
				setStartError(void 0);
				startLogin(kind);
			};
			const startLogin = async (kind) => {
				try {
					const body = await (await fetch("/im-channel/login/start", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ kind })
					})).json();
					if (!body.ok) {
						setStartError(body.error ?? "login start failed");
						return;
					}
					if (body.qrUrl !== void 0) setLogin({
						kind,
						status: "pending",
						qrUrl: body.qrUrl,
						error: void 0
					});
				} catch (error) {
					setStartError(error instanceof Error ? error.message : String(error));
					return;
				}
				pollTimer.current = setInterval(() => {
					pollStatus();
				}, POLL_INTERVAL_MS);
			};
			const refreshQr = () => {
				if (selected === void 0) return;
				stopPolling();
				setStartError(void 0);
				setLogin({
					kind: selected,
					status: "pending",
					qrUrl: void 0,
					error: void 0
				});
				startLogin(selected);
			};
			const pollStatus = async () => {
				try {
					const body = await (await fetch("/im-channel/login/status")).json();
					if (!body.ok || body.session === null) return;
					setLogin(body.session);
					if (body.session.status === "confirmed") {
						stopPolling();
						refreshBindings();
					}
					if (body.session.status === "error") stopPolling();
				} catch {}
			};
			const cards = [{
				kind: "wechat",
				label: t("card.wechat")
			}, {
				kind: "feishu",
				label: t("card.feishu")
			}];
			const stepKeys = selected === void 0 ? [] : [
				"1",
				"2",
				"3",
				"4"
			].flatMap((n) => [`step.${selected}.${n}`, `note.${selected}.${n}`]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: BotChannelTab_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: BotChannelTab_module_css_default.intro,
						children: t("intro")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						role: "radiogroup",
						"aria-label": t("cards"),
						className: BotChannelTab_module_css_default.cards,
						children: cards.map(({ kind, label }) => {
							const Mark = CARD_MARKS[kind];
							const kindCount = bindings.filter((b) => b.kind === kind).length;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "radio",
								"aria-checked": selected === kind,
								"data-selected": selected === kind ? "true" : void 0,
								className: BotChannelTab_module_css_default.card,
								onClick: () => selectCard(kind),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BotChannelTab_module_css_default.cardIcon,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BotChannelTab_module_css_default.cardName,
										children: label
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BotChannelTab_module_css_default.cardCount,
										"data-has": kindCount > 0 ? "true" : void 0,
										children: kindCount
									})
								]
							}, kind);
						})
					}),
					selected !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: BotChannelTab_module_css_default.detail,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: BotChannelTab_module_css_default.qrPanel,
							"data-state": login?.status ?? (startError !== void 0 ? "error" : "pending"),
							children: [
								startError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: BotChannelTab_module_css_default.qrError,
									children: startError
								}),
								startError === void 0 && login?.qrUrl === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: BotChannelTab_module_css_default.qrSpinner,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: BotChannelTab_module_css_default.qrSpinnerRing }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("qr.waiting") })]
								}),
								login?.qrUrl !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: BotChannelTab_module_css_default.qrClickArea,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: BotChannelTab_module_css_default.qrRefreshButton,
										onClick: refreshQr,
										"aria-label": t("qr.refresh"),
										title: t("qr.refresh"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
											className: BotChannelTab_module_css_default.qrImage,
											src: qrSvgDataUrl(login.qrUrl),
											alt: t("qr.alt"),
											width: 240,
											height: 240
										})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BotChannelTab_module_css_default.qrRefreshHint,
										children: t("qr.refreshHint")
									})]
								}),
								login?.status === "confirmed" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: BotChannelTab_module_css_default.qrOk,
									children: t("qr.confirmed")
								}),
								login?.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: BotChannelTab_module_css_default.qrError,
									children: login.error
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: BotChannelTab_module_css_default.stepsPanel,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									className: BotChannelTab_module_css_default.stepsTitle,
									children: t(`steps.title.${selected}`)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
									className: BotChannelTab_module_css_default.steps,
									children: stepKeys.length > 0 && stepKeys.map((key) => key.startsWith("step.") ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
										className: BotChannelTab_module_css_default.step,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: BotChannelTab_module_css_default.stepNumber,
											"aria-hidden": "true"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: BotChannelTab_module_css_default.stepBody,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: BotChannelTab_module_css_default.stepText,
												children: t(key)
											})
										})]
									}, key) : null)
								}),
								selected === "wechat" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: BotChannelTab_module_css_default.stepNote,
									children: t("note.wechat.verifycode")
								})
							]
						})]
					}),
					login?.status === "confirmed" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: BotChannelTab_module_css_default.passphraseCard,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: BotChannelTab_module_css_default.passphraseTitle,
								children: t("bind.commandTitle")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: BotChannelTab_module_css_default.passphraseHint,
								children: t("bind.commandHint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
								className: BotChannelTab_module_css_default.passphraseCommand,
								children: "/bind"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: BotChannelTab_module_css_default.bindings,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
								className: BotChannelTab_module_css_default.bindingsTitle,
								children: [
									t("bindings.title"),
									"（",
									bindings.length,
									"）"
								]
							}),
							bindings.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: BotChannelTab_module_css_default.bindingsEmpty,
								children: t("bindings.empty")
							}),
							bindings.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
								className: BotChannelTab_module_css_default.bindingsTable,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("bindings.kind") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("bindings.session") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("bindings.boundAt") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { "aria-hidden": "true" })
								] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: bindings.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BotChannelTab_module_css_default.bindingKind,
										children: KIND_LABELS[row.kind] ?? row.kind
									}) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
										className: BotChannelTab_module_css_default.bindingSession,
										children: row.sessionId
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: row.boundAt.replace("T", " ").slice(0, 19) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: BotChannelTab_module_css_default.bindingRemove,
										onClick: () => {
											removeBinding(row);
										},
										children: t("bindings.remove")
									}) })
								] }, `${row.kind}:${row.sessionId}:${index}`)) })]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** zh copy for the Bot Channel tab. */
		const zh = {
			nav: "手机连接",
			intro: "选择一个平台，手机扫码即可创建/绑定机器人并接入 harness。",
			cards: "平台",
			"card.wechat": "微信",
			"card.feishu": "飞书",
			"qr.waiting": "正在获取二维码…",
			"qr.alt": "登录二维码",
			"qr.refresh": "刷新二维码",
			"qr.refreshHint": "点击二维码可刷新",
			"qr.confirmed": "登录成功，机器人已接入。",
			"bindings.title": "已绑定的机器人",
			"bindings.empty": "还没有绑定。手机扫码登录后在 IM 上发送 /bind 完成绑定。",
			"bindings.kind": "平台",
			"bindings.session": "会话",
			"bindings.boundAt": "绑定时间",
			"bindings.remove": "解绑",
			"bind.commandTitle": "完成绑定",
			"bind.commandHint": "在 IM 上发送以下命令完成绑定：",
			"steps.title.wechat": "微信接入步骤",
			"step.wechat.1": "用手机微信「扫一扫」扫描左侧二维码。",
			"step.wechat.2": "在手机上确认授权，完成机器人绑定。",
			"step.wechat.3": "页面提示「登录成功」后，即可在微信里与机器人对话。",
			"step.wechat.4": "发送 /bind 绑定你的会话。",
			"note.wechat.verifycode": "如微信要求输入验证码，请在启动 harness 的终端中改用终端登录流程。",
			"steps.title.feishu": "飞书接入步骤",
			"step.feishu.1": "用手机飞书「扫一扫」扫描左侧二维码。",
			"step.feishu.2": "在飞书授权页选择「创建新应用」或绑定已有应用。",
			"step.feishu.3": "确认授权——应用会自动配好机器人能力与事件订阅。",
			"step.feishu.4": "页面提示「登录成功」后，即可在飞书里与机器人对话。"
		};
		/** en copy for the Bot Channel tab. */
		const en = {
			nav: "Mobile Connect",
			intro: "Pick a platform and scan the QR code from your phone to create/bind your bot.",
			cards: "Platform",
			"card.wechat": "WeChat",
			"card.feishu": "Feishu",
			"qr.waiting": "Fetching QR code…",
			"qr.alt": "Login QR code",
			"qr.refresh": "Refresh QR code",
			"qr.refreshHint": "Click the QR code to refresh",
			"qr.confirmed": "Logged in — your bot is connected.",
			"bindings.title": "Bound bots",
			"bindings.empty": "No bindings yet. Scan to log in, then send /bind from your IM.",
			"bindings.kind": "Platform",
			"bindings.session": "Session",
			"bindings.boundAt": "Bound at",
			"bindings.remove": "Unbind",
			"bind.commandTitle": "Finish binding",
			"bind.commandHint": "Send this command in your IM to bind:",
			"steps.title.wechat": "WeChat setup",
			"step.wechat.1": "Scan the QR code with WeChat on your phone.",
			"step.wechat.2": "Confirm the authorization to bind your bot.",
			"step.wechat.3": "Once the page says connected, chat with your bot in WeChat.",
			"step.wechat.4": "Send /bind to bind your session.",
			"note.wechat.verifycode": "If WeChat asks for a verification code, use the terminal login flow in the terminal running the harness.",
			"steps.title.feishu": "Feishu setup",
			"step.feishu.1": "Scan the QR code with Feishu on your phone.",
			"step.feishu.2": "Choose \"create a new app\" or bind an existing one.",
			"step.feishu.3": "Confirm — bot capability and event subscriptions are configured automatically.",
			"step.feishu.4": "Once the page says connected, chat with your bot in Feishu."
		};
		//#endregion
		//#region src/client/store.ts
		/** The supported bot platform kinds. */
		const KINDS = ["feishu", "wechat"];
		//#endregion
		//#region src/client/index.ts
		const NS = "settings.im";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-settings-im: copy dictionaries");
			const t = ctx.locale.bind(NS);
			const injected = () => ({ t: (key) => t(key) });
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "bot-channel",
				order: 10,
				label: () => t("nav"),
				locale: NS,
				inject: injected
			}, BotChannelTab));
		}
		//#endregion
		exports.KINDS = KINDS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map