var hoverInspectEnable = true
var hoverElement
var tooltipDiv
var tooltipContentNode
var elementType
var elementId
var elementClass
var elementValue
var xPath
var clickText
var clickTextOriginal
var modalHTMLString = `<div class="hm__modal hm__hidden">
<div class="hm__form">
  <h2>Data Picker</h2>
  <i class="hm__form-close">&#10006;</i>
  <div class="hm__form-group">
    <label class="hm__form-input-label">Element Type</label>
    <input readonly type="text" name="elementType" class="hm__form-input">
  </div>
  <div class="hm__form-group">
    <label class="hm__form-input-label">Element Class</label>
    <input readonly type="text" name="elementId" class="hm__form-input">
  </div>
  <div class="hm__form-group">
    <label class="hm__form-input-label">Element ID</label>
    <input readonly type="text" name="elementClass" class="hm__form-input">
  </div>
  <div class="hm__form-group">
    <label class="hm__form-input-label">Element Value</label>
    <input readonly type="text" name="elementValue" class="hm__form-input">
  </div>
  <div class="hm__form-group">
    <label class="hm__form-input-label">Element XPath</label>
    <input readonly type="text" name="xPath" class="hm__form-input">
  </div>
  <div class="hm__form-group">
    <label class="hm__form-input-label">Click Text</label>
    <input readonly type="text" name="clickText" class="hm__form-input">
  </div>

  <div class="hm__form-button">
    <button class="hm__form-button-download">Download</button>
  </div>
</div>
</div>`

var modal = stringToHTML(modalHTMLString)
modal = document.body.appendChild(modal.querySelector('.hm__modal'))

createHoverElement()

document.addEventListener("mouseleave", function (e) {
    if (e.target && e.target.classList) {
        e.target.classList.remove("hm__hover-highlight")
    }
}, true)

document.addEventListener("mousemove", function (e) {
    if (e.target && e.target.classList && !e.target.matches(".hm__hover-highlight, .hm__modal") && hoverInspectEnable) {
        addHoverClass(e)
    }
}, true)

document.addEventListener("click", function (e) {
    if (hoverInspectEnable) {
        // disabling default click action
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();

        // enable modal
        if (modal && modal.classList.contains('hm__hidden')) {
            modal.classList.remove('hm__hidden')
            hoverInspectEnable = false
            tooltipDiv.classList.add("hm__hidden")

            document.querySelector('.hm__form-input[name="elementType"]').value = elementType
            document.querySelector('.hm__form-input[name="elementId"]').value = elementId
            document.querySelector('.hm__form-input[name="elementClass"]').value = elementClass
            document.querySelector('.hm__form-input[name="elementValue"]').value = elementValue
            document.querySelector('.hm__form-input[name="xPath"]').value = xPath
            document.querySelector('.hm__form-input[name="clickText"]').value = clickTextOriginal

            var downloadBtn = document.querySelector('.hm__form-button-download');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', get, false);
            }
        }

        return false;
    }
}, true)

//closing modal
if (modal) {
    modal.addEventListener("click", function (e) {
        if ((e.target.classList.contains("hm__form-close") || !e.target.closest(".hm__form")) && !hoverInspectEnable) {
            modal.classList.add('hm__hidden')
            hoverInspectEnable = true
            tooltipDiv.classList.remove("hm__hidden")
        }
    }, true)
}

function addHoverClass(e) {
    if (hoverElement && hoverElement.classList) {
        hoverElement.classList.remove("hm__hover-highlight")
    }

    hoverElement = e.target
    e.target.classList.add("hm__hover-highlight")
    setHoverElement(e)
}

function createHoverElement() {
    if (tooltipDiv) {
        return
    }
    tooltipDiv = document.createElement("div")
    tooltipDiv.classList.add("hm__tooltip")
    tooltipContentNode = tooltipDiv.appendChild(document.createTextNode(""))
    document.body.appendChild(tooltipDiv)
}

function getXPathForElement(element) {
    const index = (sib, name) => sib ?
        index(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) :
        1;
    const segs = elm => !elm || elm.nodeType !== 1 ? [''] :
        elm.id && document.getElementById(elm.id) === elm ? [`id("${elm.id}")`] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${index(elm)}]`];
    return segs(element).join('/');
}

function stringToHTML(str) {
    if (!window.DOMParser) return false;
    var parser = new DOMParser();
    try {
        parser.parseFromString('x', 'text/html');
    } catch (err) {
        var dom = document.createElement('div');
        dom.innerHTML = str;
        return dom;
    }
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body;
}

function setHoverElement(e) {
    if (!tooltipDiv || !hoverElement || hoverElement == tooltipDiv) {
        return
    }

    tooltipContentNode.textContent = ""

    elementType = hoverElement.nodeName || "(not set)"
    elementId = hoverElement.getAttribute('id') || "(not set)"
    elementClass = hoverElement.getAttribute('class').replace(" hm__hover-highlight", "") || "(not set)"
    elementValue = hoverElement.getAttribute('href') || hoverElement.getAttribute('title') || hoverElement.getAttribute('name') || "(not set)"
    xPath = getXPathForElement(hoverElement) || "(not set)"
    clickText = hoverElement.textContent.replace(xPath, "").trim().substring(0, 100).trim().toLowerCase() || "(not set)"
    clickTextOriginal = hoverElement.textContent.replace(xPath, "").trim().toLowerCase() || "(not set)"

    tooltipContentNode.textContent = "elementType: " + elementType + "\n" + "elementId: " + elementId + "\n" + "elementClass: " + elementClass + "\n" + "elementValue: " + elementValue + "\n" + "xPath: " + xPath + "\n" + "clickText: " + clickText

    tooltipDiv.style.top = e.clientY + "px"
    tooltipDiv.style.left = e.clientX + "px"
    tooltipDiv.style.right = null

    if (document.body.scrollWidth > document.body.clientWidth) {
        tooltipDiv.style.left = null
        tooltipDiv.style.right = document.body.clientWidth - e.clientX + "px"
    }
}


function download(data) {
    const blob = new Blob([data], {
        type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'download.csv');
    a.click()
}

function csvmaker(data) {
    csvRows = [];
    const headers = Object.keys(data);
    csvRows.push(headers.join(','));
    const values = Object.values(data).join(',');
    csvRows.push(values)

    return csvRows.join('\n')
}

async function get() {
    data = {
        "Element Type": elementType,
        "Element Id": elementId,
        "Element Class": elementClass,
        "Element Value": elementValue,
        "XPath": xPath,
        "Click Text": clickTextOriginal,
    }

    csvdata = csvmaker(data);
    download(csvdata);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const {
        checkbox
    } = message;
    console.log(`Checkbox is turned ${checkbox ? "on" : "off"}`);

});