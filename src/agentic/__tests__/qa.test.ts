// @vitest-environment happy-dom
// v5.3.11 QA fixes: WCAG 2.5.8 spacing exception, and YuktAI's own buttons
// are never reported as problems on the host page.
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { runQaAudit } from "../qaAudit"

// happy-dom has no layout: give elements a box from data-rect="x,y,w,h"
const original = Element.prototype.getBoundingClientRect
beforeEach(() => {
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const r = this.getAttribute("data-rect")
    if (!r) return original.call(this)
    const [x, y, w, h] = r.split(",").map(Number)
    return { x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON() {} } as DOMRect
  }
})
afterEach(() => {
  Element.prototype.getBoundingClientRect = original
  document.body.innerHTML = ""
})

const targetIssues = () => runQaAudit().issues.filter((i) => i.rule === "target-size")

describe("target size (WCAG 2.5.8)", () => {
  it("passes small links with enough space around them", () => {
    document.body.innerHTML = `<nav aria-label="Main">
      <a href="/a" data-rect="0,0,45,20">Home</a>
      <a href="/b" data-rect="80,0,45,20">Grid</a>
      <a href="/c" data-rect="160,0,45,20">Icons</a></nav>`
    expect(targetIssues()).toEqual([])
  })

  it("fails small targets that crowd each other", () => {
    document.body.innerHTML = `<div>
      <button type="button" data-rect="0,0,16,16">A</button>
      <button type="button" data-rect="18,0,16,16">B</button></div>`
    expect(targetIssues().length).toBe(2)
  })

  it("fails a small target touching a big one", () => {
    document.body.innerHTML = `<form>
      <input aria-label="Name" data-rect="0,0,185,40">
      <button type="submit" data-rect="187,10,10,10">Go</button></form>`
    const issues = targetIssues()
    expect(issues.length).toBe(1)
    expect(issues[0].message).toMatch(/10×10px and too close/)
  })
})

describe("YuktAI's own buttons are not the page's problem", () => {
  it("skips anything inside data-yuktai-ui and data-yuktai-fabs", () => {
    document.body.innerHTML = `
      <button type="button" data-yuktai-ui="true" data-rect="0,0,10,10">⚡</button>
      <button type="button" data-yuktai-ui="true" data-rect="12,0,10,10">🤖</button>
      <div data-yuktai-fabs=""><button type="button" data-rect="30,0,10,10">♿</button><button type="button" data-rect="42,0,10,10">🛠</button></div>`
    const issues = runQaAudit().issues
    expect(issues.filter((i) => /⚡|🤖|♿|🛠/.test(i.message))).toEqual([])
    expect(issues.filter((i) => i.rule === "target-size")).toEqual([])
  })
})
