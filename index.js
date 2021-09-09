const nameElement = document.getElementById('name')
const rangeElement = document.getElementById('range')
const paintElement = document.getElementById('paint')
const paintShadowElement = document.getElementById('paintShadow')
const enableShadows = document.getElementById('enableShadows')
const colorElement = document.getElementById('color')
const resultElement = document.getElementsByClassName('result')

const g_color_table = [
    [0.0, 0.0, 0.0, 1.0],
    [255, 0.0, 0.0, 1.0],
    [0.0, 255, 0.0, 1.0],
    [255, 255, 0.0, 1.0],
    [0.0, 0.0, 255, 1.0],
    [0.0, 255, 255, 1.0],
    [255, 0.0, 255, 1.0],
    [255, 255, 255, 1.0]
]

const v4DKGREY2 = [38, 38, 38, 1.0]


function parseRGBA(rgba) {
    let inParts = rgba.substring(rgba.indexOf("(")).split(","),
        r = parseInt(inParts[0].substring(1).trim(), 10),
        g = parseInt(inParts[1].trim(), 10),
        b = parseInt(inParts[2].trim(), 10)
    let a
    if (typeof inParts[3] !== 'undefined')
        a = parseFloat(inParts[3].substring(0, inParts[3].length - 1).trim())
    else
        a = 1.0

    return [r, g, b, a]
}

/*
type 1: ^YRRGGBBAA
type 2: ^XRRGGBB
type 3: ^yRGBA
type 4: ^xRGB
*/

// ^YRRGGBBAA
function get32bit(rgba, alpha) {
    let [r, g, b, a] = rgba
    let outParts = [
        r.toString(16),
        g.toString(16),
        b.toString(16)
    ]

    let character = '^X'
    if (alpha) {
        outParts.push(Math.round(a * 255).toString(16).substring(0, 2))
        character = '^Y'
    }

    outParts.forEach(function (part, i) {
        if (part.length === 1) {
            outParts[i] = '0' + part
        }
    })

    return (character + outParts.join(''))
}

// ^yRGBA
function get16bit(rgba, alpha) {
    let [r, g, b, a] = rgba
    r = r & 0b11110000
    g = g & 0b11110000
    b = g & 0b11110000

    let outParts = [
        r.toString(16),
        g.toString(16),
        b.toString(16)
    ]

    let character = '^x'
    if (alpha) {
        a = Math.round(a * 255) & 0b11110000
        outParts.push(a.toString(16).substring(0, 2))
        character = '^y'
    }

    outParts.forEach(function (part, i) {
        if (part.length === 2) {
            outParts[i] = part.substring(0, 1)
        }
    })

    return (character + outParts.join(''))
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

function getColorFromTable(rgba) {
    for (let i = 0; i <= g_color_table.length; i++) {
        if (arrayEquals(g_color_table[i], rgba)) {
            return '^' + i
        }
    }
    return null
}

function convertToJK2_old() {
    for (let e of resultElement) {
        e.value = ''
    }
    let rgbaSave = g_color_table[7]
    for (let e of nameElement.childNodes) {
        if (typeof e.style !== 'undefined' && typeof e.style.color !== 'undefined') {
            const rgba = parseRGBA(e.style.color)

            if (!arrayEquals(rgba, rgbaSave)) {
                let found = false
                for (let i = 0; i <= g_color_table.length; i++) {
                    if (arrayEquals(g_color_table[i], rgba)) {
                        for (let r of resultElement) {
                            r.value += '^' + i
                            console.log(r.value)
                        }
                        found = true
                        break
                    }
                }
                if (!found) {
                    resultElement[0].value += get32bit(rgba, true)
                    resultElement[1].value += get32bit(rgba, false)
                    resultElement[2].value += get16bit(rgba, true)
                    resultElement[3].value += get16bit(rgba, false)
                }
                rgbaSave = rgba
            }
        } else {
            rgba = g_color_table[7]
            if (!arrayEquals(rgba, rgbaSave)) {
                for (let r of resultElement) {
                    r.value += '^7'
                }
                rgbaSave = rgba
            }
        }
        for (let r of resultElement) {
            r.value += e.textContent
        }
    }
}

function convertToJK2() {
    for (let e of resultElement) {
        e.value = ''
    }
    for (let e of nameElement.childNodes) {
        if (typeof e.style !== 'undefined' && typeof e.style.textShadow !== 'undefined' && e.style.textShadow !== '') {
            const rgbaShadow = parseRGBA(e.style.textShadow)
            let color = getColorFromTable(rgbaShadow)
            if (color !== null) {
                for (let r of resultElement) {
                    r.value += '^7' + color
                }
            } else {
                resultElement[0].value += '^7' + get32bit(rgbaShadow, true)
                resultElement[1].value += '^7' + get32bit(rgbaShadow, false)
                resultElement[2].value += '^7' + get16bit(rgbaShadow, true)
                resultElement[3].value += '^7' + get16bit(rgbaShadow, false)
            }
        } else {
            for (let r of resultElement) {
                //r.value += '^7' + get32bit(v4DKGREY2, false)
                r.value += '^7^0'
            }
        }
        if (typeof e.style !== 'undefined' && typeof e.style.color !== 'undefined' && e.style.color !== '') {
            const rgba = parseRGBA(e.style.color)
            let color = getColorFromTable(rgba)
            if (color !== null) {
                for (let r of resultElement) {
                    r.value += color
                }
            } else {
                resultElement[0].value += get32bit(rgba, true)
                resultElement[1].value += get32bit(rgba, false)
                resultElement[2].value += get16bit(rgba, true)
                resultElement[3].value += get16bit(rgba, false)
            }
        } else {
            for (let r of resultElement) {
                r.value += '^7'
            }
        }
        for (let r of resultElement) {
            r.value += e.textContent
        }
    }
}

let color = '#AD6956FF'

function updateColor() {
    color = colorElement.value + parseInt(rangeElement.value).toString(16)
    document.documentElement.style.setProperty("--selection-background", color)
}

colorElement.oninput = function (e) { updateColor() }
paintElement.onclick = function (e) {
    document.execCommand('styleWithCSS', false, true)
    document.execCommand('foreColor', false, color)
    window.getSelection().removeAllRanges()
    if (enableShadows.checked)
        convertToJK2()
    else
        convertToJK2_old()
}
paintShadowElement.onclick = function (e) {
    document.execCommand('styleWithCSS', false, true)
    document.execCommand('foreColor', false, color)
    let span = window.getSelection().focusNode.parentNode
    span.style.textShadow = "5px 5px" + color
    window.getSelection().removeAllRanges()
    if (enableShadows.checked)
        convertToJK2()
    else
        convertToJK2_old()
}
rangeElement.oninput = function (e) {
    colorElement.style.opacity = parseInt(rangeElement.value) / 255
    updateColor()
}

nameElement.oninput = function (e) {
    if (enableShadows.checked)
        convertToJK2()
    else
        convertToJK2_old()
}

enableShadows.oninput = function (e) {
    if (enableShadows.checked)
        paintShadowElement.disabled = false
    else
        paintShadowElement.disabled = true
}

const colors = document.getElementsByClassName('colors')
for (let i = 0; i < colors.length; i++) {
    colors[i].onclick = function (e) {
        colorElement.value = '#' + get32bit(g_color_table[i], false).substr(2)
        updateColor()
    }
}