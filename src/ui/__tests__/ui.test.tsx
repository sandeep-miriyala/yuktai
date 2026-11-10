// @vitest-environment happy-dom
import React, { act, useState } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it } from "vitest"
import { alpha, Box, Button, Chip, MenuItem, Select, Slider, Stack, Switch, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, sxToCss, getUiStyles, useTheme } from "../index"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
function mount(el: React.ReactElement) {
  host = document.createElement("div")
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(el))
  return { root, host }
}
afterEach(() => host?.remove())

const flat = (css: string) => css.replace(/\s+/g, "")

describe("sx engine", () => {
  it("turns spacing, palette and sizes into CSS", () => {
    const css = flat(sxToCss({ p: 2, mx: 1, bgcolor: "background.paper", color: "text.secondary", width: 0.5, maxWidth: 480, borderRadius: 2, border: 1 }, ".x"))
    expect(css).toContain("padding:16px")
    expect(css).toContain("margin-left:8px;margin-right:8px")
    expect(css).toContain("background-color:var(--surface-elevated,#ffffff)")
    expect(css).toContain("color:var(--muted-text,#434c5c)")
    expect(css).toContain("width:50%")
    expect(css).toContain("max-width:480px")
    expect(css).toContain("border-radius:8px")
    expect(css).toContain("border:1pxsolid")
  })

  it("writes responsive values mobile first", () => {
    const css = flat(sxToCss({ display: { xs: "none", md: "flex" }, fontSize: ["1rem", "1.2rem"] }, ".x"))
    expect(css).toContain(".x{display:none;font-size:1rem;}")
    expect(css).toContain("@media(min-width:900px){.x{display:flex;}}")
    expect(css).toContain("@media(min-width:600px){.x{font-size:1.2rem;}}")
  })

  it("nests selectors, media queries and keyframes", () => {
    const css = flat(sxToCss({ "&:hover": { color: "primary.main" }, "& .MuiSvgIcon-root": { fontSize: 20 }, "@media (max-width:600px)": { p: 1 }, "@keyframes pulse": { "50%": { opacity: 0.5 } } }, ".x"))
    expect(css).toContain(".x:hover{color:var(--primary,#1f4e8c);}")
    expect(sxToCss({ "& .MuiSvgIcon-root": { fontSize: 20 } }, ".x")).toBe(".x .MuiSvgIcon-root{font-size:20px;}")
    expect(css).toContain("@media(max-width:600px){.x{padding:8px;}}")
    expect(css).toContain("@keyframespulse{50%{opacity:0.5;}}")
  })

  it("accepts arrays and theme functions", () => {
    const css = flat(sxToCss([{ p: 1 }, (t: ReturnType<typeof useTheme>) => ({ color: t.palette.error.main }), false as never], ".x"))
    expect(css).toContain("padding:8px")
    expect(css).toContain("color:var(--error,#a1271b)")
  })

  it("alpha works for hex and CSS variables", () => {
    expect(alpha("#ff0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)")
    expect(alpha("var(--primary)", 0.1)).toBe("color-mix(in srgb, var(--primary) 10%, transparent)")
  })

  it("server rendering keeps the rules for the HTML, with the same class name", () => {
    const html = renderToString(<Box sx={{ p: 3, color: "error.main" }}>hi</Box>)
    const cls = /class="([^"]*yk-[a-z0-9]+[^"]*)"/.exec(html)?.[1] ?? ""
    const name = cls.split(" ").find((c) => /^yk-[a-z0-9]+$/.test(c))!
    const { css } = getUiStyles(new Set())
    expect(css).toContain(`.${name}{`)
    expect(css).toContain(":where(.MuiButton-root)")
  })
})

describe("components", () => {
  it("Box, Stack and Typography render the right elements and system props", () => {
    mount(
      <Stack direction="row" spacing={2} mb={1}>
        <Typography variant="h2">Title</Typography>
        <Typography variant="body2" component="div">Body</Typography>
        <Box component="section" fontWeight={700}>x</Box>
      </Stack>,
    )
    expect(host.querySelector("h2")?.textContent).toBe("Title")
    expect(host.querySelector("div.MuiTypography-body2")).not.toBeNull()
    expect(host.querySelector("section.MuiBox-root")).not.toBeNull()
    expect(host.querySelector(".MuiStack-root")!.className).toMatch(/yk-/)
  })

  it("Button is a real button; href makes it a link; startIcon is wrapped", () => {
    mount(
      <>
        <Button variant="contained" startIcon={<span>★</span>}>Save</Button>
        <Button href="/about">About</Button>
      </>,
    )
    const b = host.querySelector("button")!
    expect(b.getAttribute("type")).toBe("button")
    expect(b.className).toContain("MuiButton-contained")
    expect(b.querySelector(".MuiButton-startIcon")).not.toBeNull()
    expect(host.querySelector("a.MuiButton-root")?.getAttribute("href")).toBe("/about")
  })

  it("Select is a native select that returns the original values", () => {
    let got: unknown = null
    mount(
      <Select value={2} onChange={(e: { target: { value: unknown } }) => (got = e.target.value)} label="Size">
        <MenuItem value={1}>One</MenuItem>
        <MenuItem value={2}>Two</MenuItem>
      </Select>,
    )
    const sel = host.querySelector("select")!
    expect(sel.getAttribute("aria-label")).toBe("Size")
    expect(sel.options[sel.selectedIndex].textContent).toBe("Two")
    act(() => {
      sel.value = sel.options[0].value
      sel.dispatchEvent(new Event("change", { bubbles: true }))
    })
    expect(got).toBe(1)
  })

  it("TextField wires label and helper text to the input", () => {
    mount(<TextField label="Name" helperText="Your full name" defaultValue="" />)
    const input = host.querySelector("input")!
    const label = host.querySelector("label")!
    expect(label.getAttribute("for")).toBe(input.id)
    expect(input.getAttribute("aria-describedby")).toBe(host.querySelector(".MuiFormHelperText-root")!.id)
  })

  it("Tabs: roles, selection and change", () => {
    function T() {
      const [v, setV] = useState(0)
      return (
        <Tabs value={v} onChange={(_e: unknown, n: number) => setV(n)} aria-label="Pages">
          <Tab label="A" />
          <Tab label="B" />
        </Tabs>
      )
    }
    mount(<T />)
    const tabs = host.querySelectorAll('[role="tab"]')
    expect(host.querySelector('[role="tablist"]')?.getAttribute("aria-label")).toBe("Pages")
    expect(tabs[0].getAttribute("aria-selected")).toBe("true")
    act(() => (tabs[1] as HTMLElement).click())
    expect(tabs[1].getAttribute("aria-selected")).toBe("true")
  })

  it("ToggleButtonGroup exclusive gives the new value; buttons are aria-pressed", () => {
    let got: unknown = "x"
    mount(
      <ToggleButtonGroup value="a" exclusive onChange={(_e: unknown, v: unknown) => (got = v)}>
        <ToggleButton value="a">A</ToggleButton>
        <ToggleButton value="b">B</ToggleButton>
      </ToggleButtonGroup>,
    )
    const [a, b] = Array.from(host.querySelectorAll("button"))
    expect(a.getAttribute("aria-pressed")).toBe("true")
    act(() => b.click())
    expect(got).toBe("b")
  })

  it("Switch is role=switch and reports checked", () => {
    let got: boolean | null = null
    mount(<Switch checked={false} onChange={(_e: unknown, c: boolean) => (got = c)} inputProps={{ "aria-label": "Dark" }} />)
    const input = host.querySelector('input[role="switch"]') as HTMLInputElement
    expect(input.getAttribute("aria-label")).toBe("Dark")
    act(() => input.click())
    expect(got).toBe(true)
  })

  it("Slider is a range input and passes a number", () => {
    let got: unknown = null
    mount(<Slider value={20} min={10} max={50} onChange={(_e: unknown, v: number) => (got = v)} aria-label="Size" />)
    const r = host.querySelector('input[type="range"]') as HTMLInputElement
    expect(r.getAttribute("aria-label")).toBe("Size")
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
      setter.call(r, "30")
      r.dispatchEvent(new Event("input", { bubbles: true }))
    })
    expect(got).toBe(30)
  })

  it("Chip with onClick is a button; Tooltip names an icon-only button", () => {
    mount(
      <>
        <Chip label="Tag" onClick={() => {}} />
        <Tooltip title="Close">
          <button>×</button>
        </Tooltip>
      </>,
    )
    expect(host.querySelector("button.MuiChip-root")).not.toBeNull()
    const btns = host.querySelectorAll("button")
    expect(btns[1].getAttribute("aria-label")).toBeNull() // has visible text
  })
})
