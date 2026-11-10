// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · inputs.tsx
// ButtonBase, Button, IconButton, Fab, ButtonGroup, ToggleButton(Group), Chip,
// FormControl, InputLabel, FormLabel, FormHelperText, InputBase, OutlinedInput,
// InputAdornment, TextField, Select, MenuItem (in a Select), NativeSelect,
// Switch, Checkbox, Radio, RadioGroup, FormGroup, FormControlLabel, Slider,
// Autocomplete.
//
// Real elements underneath (<button>, <input>, <select>), so keyboard,
// screen readers, autofill and phones work without extra code.
// ─────────────────────────────────────────────────────────────────────────────

import React, { cloneElement, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState } from "react"
import { cap, colorClass, cx, flatChildren, mergeRefs, textOf, ui, useId, type UIProps } from "./base"
import { ICON_PATHS } from "../icons/paths"
import { CircularProgressInner } from "./feedback"

/* a small chevron / close glyph drawn from the YuktAI icon set */
export function Glyph({ name, className }: { name: keyof typeof ICON_PATHS | string; className?: string }) {
  const d = (ICON_PATHS as Record<string, string>)[name] ?? ""
  return (
    <svg className={cx("MuiSvgIcon-root", className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
    </svg>
  )
}

/* ───────────── buttons ───────────── */

function buttonProps(Comp: any, p: UIProps, disabled?: boolean) {
  const isButton = Comp === "button"
  const extra: UIProps = {}
  if (isButton) {
    extra.type = p.type ?? "button"
    extra.disabled = disabled
  } else if (disabled) {
    extra["aria-disabled"] = true
    extra.tabIndex = -1
    extra.onClick = (e: React.MouseEvent) => e.preventDefault()
  }
  return extra
}

export const ButtonBase = ui("ButtonBase", ({ ykClass, Comp, className, disabled, disableRipple: _r, focusRipple: _f, centerRipple: _c, TouchRippleProps: _t, focusVisibleClassName: _v, ...p }, ref) => {
  const Tag = p.href && Comp === "button" ? "a" : Comp
  return <Tag ref={ref} className={cx("MuiButtonBase-root", disabled && "Mui-disabled", ykClass, className)} {...p} {...buttonProps(Tag, p, disabled)} />
}, { tag: "button" })

export const Button = ui("Button", ({ ykClass, Comp, className, style, variant = "text", color = "primary", size = "medium", fullWidth, startIcon, endIcon, disabled, loading, loadingPosition = "center", loadingIndicator, disableElevation, disableRipple: _r, disableFocusRipple: _f, children, ...p }, ref) => {
  const Tag = p.href && Comp === "button" ? "a" : Comp
  const busy = !!loading
  return (
    <Tag
      ref={ref}
      aria-busy={busy || undefined}
      className={cx(
        "MuiButtonBase-root MuiButton-root",
        `MuiButton-${variant}`,
        `MuiButton-${variant}${cap(String(color))}`,
        `MuiButton-size${cap(size)}`,
        colorClass(color),
        fullWidth && "MuiButton-fullWidth",
        (disabled || busy) && "Mui-disabled",
        busy && loadingPosition === "center" && "yk-loading",
        disableElevation && "MuiButton-disableElevation",
        ykClass,
        className,
      )}
      style={disableElevation ? { boxShadow: "none", ...style } : style}
      {...p}
      {...buttonProps(Tag, p, disabled || busy)}
    >
      {startIcon && <span className="MuiButton-icon MuiButton-startIcon">{busy && loadingPosition === "start" ? (loadingIndicator ?? <CircularProgressInner size={18} />) : startIcon}</span>}
      {children}
      {endIcon && <span className="MuiButton-icon MuiButton-endIcon">{busy && loadingPosition === "end" ? (loadingIndicator ?? <CircularProgressInner size={18} />) : endIcon}</span>}
      {busy && loadingPosition === "center" && <span className="yk-spinner-slot">{loadingIndicator ?? <CircularProgressInner size={20} />}</span>}
    </Tag>
  )
}, { tag: "button" })

export const IconButton = ui("IconButton", ({ ykClass, Comp, className, color = "default", size = "medium", edge, disabled, loading, disableRipple: _r, disableFocusRipple: _f, children, ...p }, ref) => {
  const Tag = p.href && Comp === "button" ? "a" : Comp
  return (
    <Tag
      ref={ref}
      aria-busy={loading || undefined}
      className={cx(
        "MuiButtonBase-root MuiIconButton-root",
        `MuiIconButton-size${cap(size)}`,
        color !== "default" && `MuiIconButton-color${cap(String(color))}`,
        colorClass(color, "default"),
        edge && `MuiIconButton-edge${cap(edge)}`,
        (disabled || loading) && "Mui-disabled",
        ykClass,
        className,
      )}
      {...p}
      {...buttonProps(Tag, p, disabled || loading)}
    >
      {loading ? <CircularProgressInner size={20} /> : children}
    </Tag>
  )
}, { tag: "button" })

export const Fab = ui("Fab", ({ ykClass, Comp, className, variant = "circular", color = "default", size = "large", disabled, disableRipple: _r, disableFocusRipple: _f, ...p }, ref) => {
  const Tag = p.href && Comp === "button" ? "a" : Comp
  return (
    <Tag
      ref={ref}
      className={cx("MuiButtonBase-root MuiFab-root", `MuiFab-${variant}`, `MuiFab-size${cap(size)}`, colorClass(color, "default"), disabled && "Mui-disabled", ykClass, className)}
      {...p}
      {...buttonProps(Tag, p, disabled)}
    />
  )
}, { tag: "button" })

export const ButtonGroup = ui("ButtonGroup", ({ ykClass, Comp, className, style, variant = "outlined", color = "primary", size, orientation, fullWidth, disabled, disableElevation: _e, children, ...p }, ref) => (
  <Comp ref={ref} role="group" className={cx("MuiButtonGroup-root", ykClass, className)} style={orientation === "vertical" ? { flexDirection: "column", ...style } : style} {...p}>
    {flatChildren(children).map((c, i) =>
      isValidElement(c)
        ? cloneElement(c as React.ReactElement<any>, {
            key: c.key ?? i,
            variant: (c.props as UIProps).variant ?? variant,
            color: (c.props as UIProps).color ?? color,
            size: (c.props as UIProps).size ?? size,
            fullWidth: (c.props as UIProps).fullWidth ?? fullWidth,
            disabled: (c.props as UIProps).disabled ?? disabled,
          })
        : c,
    )}
  </Comp>
))

/* ───────────── toggle buttons ───────────── */

type ToggleCtx = { value: unknown; exclusive?: boolean; onChange?: (e: React.MouseEvent, v: unknown) => void; size?: string; color?: string; disabled?: boolean; fullWidth?: boolean }
const ToggleContext = createContext<ToggleCtx | null>(null)

export const ToggleButtonGroup = ui("ToggleButtonGroup", ({ ykClass, Comp, className, style, value, exclusive, onChange, size = "medium", color = "standard", orientation = "horizontal", disabled, fullWidth, children, ...p }, ref) => (
  <ToggleContext.Provider value={{ value, exclusive, onChange, size, color, disabled, fullWidth }}>
    <Comp ref={ref} role="group" className={cx("MuiToggleButtonGroup-root", orientation === "vertical" && "MuiToggleButtonGroup-vertical", fullWidth && "MuiToggleButtonGroup-fullWidth", ykClass, className)} style={fullWidth ? { display: "flex", width: "100%", ...style } : style} {...p}>
      {children}
    </Comp>
  </ToggleContext.Provider>
))

export const ToggleButton = ui("ToggleButton", ({ ykClass, Comp, className, value, selected, onChange, onClick, size, color, disabled, fullWidth, disableRipple: _r, disableFocusRipple: _f, ...p }, ref) => {
  const g = useContext(ToggleContext)
  const isOn = selected ?? (g ? (g.exclusive ? g.value === value : Array.isArray(g.value) && g.value.includes(value)) : false)
  const off = disabled ?? g?.disabled
  const c = color ?? g?.color
  return (
    <Comp
      ref={ref}
      type="button"
      aria-pressed={!!isOn}
      disabled={off}
      onClick={(e: React.MouseEvent) => {
        onClick?.(e, value)
        if (e.defaultPrevented) return
        onChange?.(e, value)
        if (g?.onChange) {
          if (g.exclusive) g.onChange(e, isOn ? null : value)
          else {
            const arr = Array.isArray(g.value) ? g.value : []
            g.onChange(e, isOn ? arr.filter((x) => x !== value) : [...arr, value])
          }
        }
      }}
      className={cx(
        "MuiButtonBase-root MuiToggleButton-root",
        `MuiToggleButton-size${cap(size ?? g?.size ?? "medium")}`,
        c && c !== "standard" && colorClass(c),
        isOn && "Mui-selected",
        off && "Mui-disabled",
        (fullWidth ?? g?.fullWidth) && "MuiToggleButton-fullWidth",
        ykClass,
        className,
      )}
      {...p}
    />
  )
}, { tag: "button" })

/* ───────────── Chip ───────────── */

export const Chip = ui("Chip", ({ ykClass, Comp, ykHasComp, className, label, icon, avatar, deleteIcon, onDelete, onClick, onKeyDown, clickable, variant = "filled", color = "default", size = "medium", disabled, ...p }, ref) => {
  const interactive = !!onClick || clickable || (ykHasComp && Comp !== "div")
  const Tag = ykHasComp ? Comp : onClick ? "button" : "div"
  return (
    <Tag
      ref={ref}
      {...(Tag === "button" ? { type: "button", disabled } : {})}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        onKeyDown?.(e)
        if (onDelete && (e.key === "Backspace" || e.key === "Delete")) onDelete(e)
      }}
      className={cx(
        "MuiChip-root",
        `MuiChip-${variant}`,
        `MuiChip-size${cap(size)}`,
        `MuiChip-color${cap(String(color))}`,
        colorClass(color, "default"),
        interactive && "MuiChip-clickable MuiButtonBase-root",
        onDelete && "MuiChip-deletable",
        disabled && "Mui-disabled",
        ykClass,
        className,
      )}
      {...p}
    >
      {avatar && <span className="MuiChip-avatar">{avatar}</span>}
      {icon && isValidElement(icon) ? cloneElement(icon as React.ReactElement<any>, { className: cx("MuiChip-icon", (icon.props as UIProps).className) }) : icon}
      <span className="MuiChip-label">{label}</span>
      {onDelete && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Remove"
          className="MuiChip-deleteIcon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(e)
          }}
        >
          {deleteIcon ?? <Glyph name="close" />}
        </span>
      )}
    </Tag>
  )
})

/* ───────────── form plumbing ───────────── */

type FormCtx = { id?: string; labelId?: string; helperId?: string; error?: boolean; disabled?: boolean; required?: boolean; size?: string; variant?: string; fullWidth?: boolean; focused?: boolean; setFocused?: (b: boolean) => void; filled?: boolean }
export const FormControlContext = createContext<FormCtx | null>(null)
export const useFormControl = () => useContext(FormControlContext)

export const FormControl = ui("FormControl", ({ ykClass, Comp, className, style, error, disabled, required, size, variant = "outlined", fullWidth, margin, focused: _f, hiddenLabel: _h, children, ...p }, ref) => {
  const id = useId()
  const [focused, setFocused] = useState(false)
  return (
    <FormControlContext.Provider value={{ id: `${id}-input`, labelId: `${id}-label`, helperId: `${id}-helper`, error, disabled, required, size, variant, fullWidth, focused, setFocused }}>
      <Comp
        ref={ref}
        className={cx("MuiFormControl-root", fullWidth && "MuiFormControl-fullWidth", ykClass, className)}
        style={margin === "normal" ? { marginTop: 16, marginBottom: 8, ...style } : margin === "dense" ? { marginTop: 8, marginBottom: 4, ...style } : style}
        {...p}
      >
        {children}
      </Comp>
    </FormControlContext.Provider>
  )
})

export const FormLabel = ui("FormLabel", ({ ykClass, Comp, className, error, required, children, ...p }, ref) => {
  const f = useFormControl()
  return (
    <Comp ref={ref} className={cx("MuiFormLabel-root", (error ?? f?.error) && "Mui-error", ykClass, className)} {...p}>
      {children}
      {(required ?? f?.required) && <span aria-hidden="true"> *</span>}
    </Comp>
  )
}, { tag: "label" })

export const InputLabel = ui("InputLabel", ({ ykClass, Comp, className, shrink: _s, disableAnimation: _d, variant: _v, size: _z, error, required, htmlFor, id, children, ...p }, ref) => {
  const f = useFormControl()
  return (
    <Comp ref={ref} id={id ?? f?.labelId} htmlFor={htmlFor ?? f?.id} className={cx("MuiFormLabel-root MuiInputLabel-root", (error ?? f?.error) && "Mui-error", ykClass, className)} {...p}>
      {children}
      {(required ?? f?.required) && <span aria-hidden="true"> *</span>}
    </Comp>
  )
}, { tag: "label" })

export const FormHelperText = ui("FormHelperText", ({ ykClass, Comp, className, error, id, ...p }, ref) => {
  const f = useFormControl()
  return <Comp ref={ref} id={id ?? f?.helperId} className={cx("MuiFormHelperText-root", (error ?? f?.error) && "Mui-error", ykClass, className)} {...p} />
}, { tag: "p" })

export const InputAdornment = ui("InputAdornment", ({ ykClass, Comp, className, style, position = "start", disablePointerEvents, disableTypography: _d, variant: _v, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiInputAdornment-root", `MuiInputAdornment-position${cap(position)}`, ykClass, className)} style={disablePointerEvents ? { pointerEvents: "none", ...style } : style} {...p} />
))

/** The box around an input: outline, adornments, focus state. */
function InputShell({ variant = "outlined", size, error, disabled, fullWidth, multiline, startAdornment, endAdornment, className, sxClass, style, children, shellRef, onClick }: UIProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      ref={shellRef}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={onClick}
      style={style}
      className={cx(
        "MuiInputBase-root",
        variant === "outlined" ? "MuiOutlinedInput-root" : variant === "filled" ? "MuiFilledInput-root" : variant === "standard" ? "MuiInput-root" : "",
        size === "small" && "MuiInputBase-sizeSmall",
        focused && "Mui-focused",
        error && "Mui-error",
        disabled && "Mui-disabled",
        fullWidth && "MuiInputBase-fullWidth",
        multiline && "MuiInputBase-multiline",
        startAdornment && "MuiInputBase-adornedStart",
        endAdornment && "MuiInputBase-adornedEnd",
        sxClass,
        className,
      )}
    >
      {startAdornment}
      {children}
      {endAdornment}
      {variant === "outlined" && <fieldset aria-hidden="true" className="MuiOutlinedInput-notchedOutline" />}
    </div>
  )
}

function inputElement({ multiline, rows, minRows, maxRows, inputRef, inputProps = {}, inputComponent, ...p }: UIProps, ref?: React.Ref<any>) {
  const Tag = inputComponent ?? (multiline ? "textarea" : "input")
  const rowCount = rows ?? minRows ?? (multiline ? 2 : undefined)
  const { className: ic, ref: innerRef, style: istyle, ...ip } = inputProps
  return (
    <Tag
      ref={mergeRefs(ref, inputRef, innerRef)}
      rows={multiline ? rowCount : undefined}
      style={multiline && maxRows ? { maxHeight: `${Number(maxRows) * 1.6 + 1}em`, ...istyle } : istyle}
      {...p}
      {...ip}
      className={cx("MuiInputBase-input", multiline && "MuiInputBase-inputMultiline", ic)}
    />
  )
}

const INPUT_KEYS = ["value", "defaultValue", "onChange", "onBlur", "onFocus", "onKeyDown", "onKeyUp", "onInput", "onPaste", "placeholder", "type", "name", "id", "autoComplete", "autoFocus", "readOnly", "required", "disabled", "multiline", "rows", "minRows", "maxRows", "inputRef", "inputProps", "inputComponent", "inputMode", "enterKeyHint", "spellCheck", "maxLength", "minLength", "pattern", "min", "max", "step", "lang", "dir", "list", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "aria-required", "aria-controls", "aria-expanded", "aria-autocomplete", "aria-activedescendant", "role", "tabIndex", "accept", "capture", "multiple"]

function splitInput(p: UIProps) {
  const input: UIProps = {}
  const shell: UIProps = {}
  for (const [k, v] of Object.entries(p)) (INPUT_KEYS.includes(k) || k.startsWith("data-input") ? input : shell)[k] = v
  return { input, shell }
}

export const InputBase = ui("InputBase", ({ ykClass, Comp: _c, className, startAdornment, endAdornment, error, fullWidth, size, multiline, style, ...p }, ref) => {
  const f = useFormControl()
  const { input, shell } = splitInput({ multiline, ...p })
  return (
    <InputShell variant="none" sxClass={ykClass} className={className} style={style} startAdornment={startAdornment} endAdornment={endAdornment} error={error ?? f?.error} disabled={p.disabled ?? f?.disabled} fullWidth={fullWidth} size={size} multiline={multiline} {...shell}>
      {inputElement({ id: f?.id, ...input }, ref)}
    </InputShell>
  )
})

export const OutlinedInput = ui("OutlinedInput", ({ ykClass, Comp: _c, className, startAdornment, endAdornment, error, fullWidth, size, multiline, label: _l, notched: _n, style, ...p }, ref) => {
  const f = useFormControl()
  const { input, shell } = splitInput({ multiline, ...p })
  return (
    <InputShell variant="outlined" sxClass={ykClass} className={className} style={style} startAdornment={startAdornment} endAdornment={endAdornment} error={error ?? f?.error} disabled={p.disabled ?? f?.disabled} fullWidth={fullWidth} size={size ?? f?.size} multiline={multiline} {...shell}>
      {inputElement({ id: f?.id, ...input }, ref)}
    </InputShell>
  )
})
export const Input = InputBase
export const FilledInput = OutlinedInput

/* ───────────── Select (a real <select>) ───────────── */

type Opt = { kind: "option"; key: string; value: unknown; label: string; disabled?: boolean } | { kind: "group"; label: string; items: Opt[] } | { kind: "raw"; node: React.ReactNode }

const SelectContext = createContext<boolean>(false)
export const useInSelect = () => useContext(SelectContext)

function readOptions(children: React.ReactNode): Opt[] {
  const out: Opt[] = []
  let group: { kind: "group"; label: string; items: Opt[] } | null = null
  let i = 0
  for (const c of flatChildren(children)) {
    if (!isValidElement(c)) continue
    const props = c.props as UIProps
    const t = c.type as any
    if (t === "option" || t === "optgroup") {
      ;(group ? group.items : out).push({ kind: "raw", node: c })
      continue
    }
    if (t?.displayName === "ListSubheader" || props["data-subheader"]) {
      group = { kind: "group", label: textOf(props.children), items: [] }
      out.push(group)
      continue
    }
    if (t?.displayName === "Divider") continue
    const opt: Opt = { kind: "option", key: `o${i++}`, value: props.value, label: props["data-label"] ?? (textOf(props.children) || String(props.value ?? "")), disabled: props.disabled }
    ;(group ? group.items : out).push(opt)
  }
  return out
}

function flatOpts(opts: Opt[]): Extract<Opt, { kind: "option" }>[] {
  return opts.flatMap((o) => (o.kind === "group" ? flatOpts(o.items) : o.kind === "option" ? [o] : []))
}

function renderOpt(o: Opt, i: number): React.ReactNode {
  if (o.kind === "raw") return isValidElement(o.node) ? cloneElement(o.node as React.ReactElement, { key: (o.node as React.ReactElement).key ?? `r${i}` }) : o.node
  if (o.kind === "group") return <optgroup key={`g${i}`} label={o.label}>{o.items.map(renderOpt)}</optgroup>
  return <option key={o.key} value={o.key} disabled={o.disabled}>{o.label}</option>
}

export const Select = ui("Select", ({ ykClass, Comp: _c, className, value, defaultValue, onChange, children, label, labelId, id, name, displayEmpty, multiple, native, renderValue, input, variant, size, fullWidth, disabled, error, inputProps = {}, MenuProps: _m, IconComponent, autoWidth: _a, open: _o, onOpen: _on, onClose: _oc, style, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, slotProps: _sp, ...rest }, ref) => {
  const f = useFormControl()
  const opts = useMemo(() => readOptions(children), [children])
  const flat = flatOpts(opts)
  const hasRaw = opts.some((o) => o.kind === "raw")
  const toKey = (v: unknown) => flat.find((o) => o.value === v || String(o.value) === String(v))?.key ?? (v === "" || v === undefined || v === null ? "" : String(v))
  const fromKey = (k: string) => (hasRaw && !flat.length ? k : (flat.find((o) => o.key === k)?.value ?? (k === "" ? "" : k)))
  const selectValue = value === undefined ? undefined : multiple ? (Array.isArray(value) ? value.map(toKey) : []) : hasRaw && !flat.length ? (value ?? "") : toKey(value)
  const selectDefault = defaultValue === undefined ? undefined : multiple ? (defaultValue as unknown[]).map(toKey) : toKey(defaultValue)
  const needsEmpty = !multiple && !hasRaw && (displayEmpty || value === "" || value === undefined) && !flat.some((o) => o.value === "" || o.value === undefined)
  const emptyLabel = needsEmpty && renderValue ? textOf(renderValue(multiple ? [] : "")) : ""
  const { className: ic, ref: innerRef, ...ip } = inputProps
  const v = variant ?? f?.variant ?? "outlined"
  return (
    <InputShell
      variant={v}
      sxClass={ykClass}
      className={cx("MuiSelect-root", className)}
      style={style}
      size={size ?? f?.size}
      error={error ?? f?.error}
      disabled={disabled ?? f?.disabled}
      fullWidth={fullWidth ?? f?.fullWidth}
      endAdornment={IconComponent ? <IconComponent className="MuiSelect-icon" aria-hidden="true" /> : <Glyph name="chevrons" className="MuiSelect-icon" />}
    >
      <select
        ref={mergeRefs(ref, innerRef)}
        id={id ?? ip.id ?? f?.id}
        name={name}
        multiple={multiple}
        disabled={disabled ?? f?.disabled}
        value={selectValue as any}
        defaultValue={selectDefault as any}
        aria-label={ariaLabel ?? ip["aria-label"] ?? (!labelId && !ariaLabelledby && !f?.labelId ? (typeof label === "string" ? label : undefined) : undefined)}
        aria-labelledby={ariaLabelledby ?? (labelId && !f ? labelId : undefined)}
        aria-describedby={f?.helperId}
        aria-invalid={(error ?? f?.error) || undefined}
        onChange={(e) => {
          const el = e.target
          const next = multiple ? Array.from(el.selectedOptions).map((o) => fromKey(o.value)) : fromKey(el.value)
          const target = { value: next, name, id: el.id }
          onChange?.({ ...e, target, currentTarget: target } as any, null)
        }}
        className={cx("MuiSelect-select MuiInputBase-input", native && "MuiNativeSelect-select", ic)}
        {...ip}
        {...rest}
      >
        {needsEmpty && <option value="">{emptyLabel}</option>}
        {opts.map(renderOpt)}
      </select>
    </InputShell>
  )
})

export const NativeSelect = Select

/* ───────────── TextField ───────────── */

export const TextField = ui("TextField", ({ ykClass, Comp: _c, className, label, helperText, error, fullWidth, size, variant = "outlined", select, SelectProps = {}, InputProps = {}, inputProps = {}, InputLabelProps = {}, FormHelperTextProps = {}, slotProps = {}, children, id, required, disabled, margin, style, hiddenLabel: _h, color: _co, focused: _f, ...p }, ref) => {
  const autoId = useId()
  const inputId = id ?? `${autoId}-input`
  const helperId = helperText ? `${inputId}-helper` : undefined
  const ip = { ...InputProps, ...slotProps.input }
  const hp = { ...inputProps, ...slotProps.htmlInput }
  const lp = { ...InputLabelProps, ...slotProps.inputLabel }
  const sp = { ...SelectProps, ...slotProps.select }
  const fp = { ...FormHelperTextProps, ...slotProps.formHelperText }
  const { startAdornment, endAdornment, className: ipClass, sx: _ipsx, inputComponent, ref: shellRef, disableUnderline: _du, ...ipAll } = ip
  const { input: ipInput, shell: ipRest } = splitInput(ipAll)
  const describedBy = cx(helperId, p["aria-describedby"]) || undefined
  return (
    <div
      ref={ref}
      style={margin === "normal" ? { marginTop: 16, marginBottom: 8, ...style } : margin === "dense" ? { marginTop: 8, marginBottom: 4, ...style } : style}
      className={cx("MuiFormControl-root MuiTextField-root", fullWidth && "MuiFormControl-fullWidth", ykClass, className)}
    >
      {label !== undefined && label !== null && label !== "" && (
        <label htmlFor={inputId} id={`${inputId}-label`} {...lp} className={cx("MuiFormLabel-root MuiInputLabel-root", error && "Mui-error", lp.className)}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {select ? (
        <Select
          {...sp}
          {...ipRest}
          native={sp.native}
          id={inputId}
          value={p.value}
          defaultValue={p.defaultValue}
          onChange={p.onChange}
          name={p.name}
          disabled={disabled}
          error={error}
          size={size}
          variant={variant}
          fullWidth={fullWidth}
          className={ipClass}
          aria-label={typeof label === "string" && label ? undefined : p["aria-label"]}
          inputProps={{ ...hp, "aria-describedby": describedBy, "aria-required": required || undefined }}
        >
          {children}
        </Select>
      ) : (
        <InputShell variant={variant} size={size} error={error} disabled={disabled} fullWidth={fullWidth} multiline={p.multiline} startAdornment={startAdornment} endAdornment={endAdornment} className={ipClass} shellRef={shellRef} {...ipRest}>
          {inputElement({
            ...p,
            ...ipInput,
            id: inputId,
            disabled,
            required,
            inputComponent,
            "aria-describedby": describedBy,
            "aria-invalid": error || undefined,
            inputProps: hp,
          })}
        </InputShell>
      )}
      {helperText && (
        <p id={helperId} {...fp} className={cx("MuiFormHelperText-root", error && "Mui-error", fp.className)}>
          {helperText}
        </p>
      )}
    </div>
  )
})

/* ───────────── MenuItem (inside a Select it is read as an <option>; inside a Menu it is a menu item) ───────────── */

export const MenuContext = createContext<{ close?: () => void } | null>(null)

export const MenuItem = ui("MenuItem", ({ ykClass, Comp, ykHasComp, className, selected, disabled, dense: _d, divider, disableGutters: _g, autoFocus, value: _v, onClick, onKeyDown, ...p }, ref) => {
  const own = useRef<HTMLElement>(null)
  useEffect(() => {
    if (autoFocus) own.current?.focus()
  }, [autoFocus])
  const Tag = ykHasComp ? Comp : "li"
  return (
    <Tag
      ref={mergeRefs(ref, own)}
      role="menuitem"
      tabIndex={disabled ? undefined : -1}
      aria-disabled={disabled || undefined}
      aria-current={selected || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e)
        if (!e.defaultPrevented && (e.key === "Enter" || e.key === " ") && Tag === "li") {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).click()
        }
      }}
      className={cx("MuiButtonBase-root MuiMenuItem-root", selected && "Mui-selected", disabled && "Mui-disabled", divider && "MuiMenuItem-divider", ykClass, className)}
      {...p}
    />
  )
})

/* ───────────── Switch, Checkbox, Radio ───────────── */

export const Switch = ui("Switch", ({ ykClass, Comp: _c, className, checked, defaultChecked, onChange, color = "primary", size = "medium", disabled, inputProps = {}, slotProps = {}, name, value, id, required, edge: _e, inputRef, "aria-label": ariaLabel, ...p }, ref) => {
  const [inner, setInner] = useState(!!defaultChecked)
  const on = checked ?? inner
  const ip = { ...inputProps, ...slotProps.input }
  return (
    <span ref={ref} className={cx("MuiSwitch-root", `MuiSwitch-size${cap(size)}`, colorClass(color), on && "Mui-checked", disabled && "Mui-disabled", ykClass, className)} {...p}>
      <input
        ref={inputRef}
        type="checkbox"
        role="switch"
        className="MuiSwitch-input"
        checked={on}
        disabled={disabled}
        name={name}
        value={value}
        id={id}
        required={required}
        aria-checked={on}
        aria-label={ariaLabel}
        onChange={(e) => {
          if (checked === undefined) setInner(e.target.checked)
          onChange?.(e, e.target.checked)
        }}
        {...ip}
      />
      <span className="MuiSwitch-track" aria-hidden="true" />
      <span className="MuiSwitch-thumb" aria-hidden="true" />
    </span>
  )
})

function checkLike(kind: "Checkbox" | "Radio") {
  return ui(kind, ({ ykClass, Comp: _c, className, checked, defaultChecked, onChange, color = "primary", size: _s, disabled, inputProps = {}, slotProps = {}, name, value, id, required, icon: _i, checkedIcon: _ci, indeterminate, inputRef, "aria-label": ariaLabel, ...p }, ref) => {
    const radio = useContext(RadioContext)
    const isOn = kind === "Radio" && radio ? String(radio.value) === String(value) : checked
    const ip = { ...inputProps, ...slotProps.input }
    return (
      <span ref={ref} className={cx(`Mui${kind}-root`, colorClass(color), isOn && "Mui-checked", disabled && "Mui-disabled", ykClass, className)} {...p}>
        <input
          ref={(el) => {
            if (el) el.indeterminate = !!indeterminate
            if (typeof inputRef === "function") inputRef(el)
            else if (inputRef) inputRef.current = el
          }}
          type={kind === "Radio" ? "radio" : "checkbox"}
          checked={isOn}
          defaultChecked={defaultChecked}
          disabled={disabled}
          name={name ?? radio?.name}
          value={value}
          id={id}
          required={required}
          aria-label={ariaLabel}
          onChange={(e) => {
            onChange?.(e, e.target.checked)
            if (kind === "Radio" && radio?.onChange) radio.onChange(e, e.target.value)
          }}
          {...ip}
        />
      </span>
    )
  })
}
const RadioContext = createContext<{ value?: unknown; name?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>, v: string) => void } | null>(null)
export const Checkbox = checkLike("Checkbox")
export const Radio = checkLike("Radio")

export const RadioGroup = ui("RadioGroup", ({ ykClass, Comp, className, style, value, defaultValue, onChange, name, row, children, ...p }, ref) => {
  const auto = useId()
  const [inner, setInner] = useState(defaultValue)
  return (
    <RadioContext.Provider value={{ value: value ?? inner, name: name ?? auto, onChange: (e, v) => (value === undefined && setInner(v), onChange?.(e, v)) }}>
      <Comp ref={ref} role="radiogroup" className={cx("MuiFormGroup-root MuiRadioGroup-root", ykClass, className)} style={{ display: "flex", flexDirection: row ? "row" : "column", flexWrap: "wrap", ...style }} {...p}>
        {children}
      </Comp>
    </RadioContext.Provider>
  )
})

export const FormGroup = ui("FormGroup", ({ ykClass, Comp, className, style, row, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiFormGroup-root", row && "MuiFormGroup-row", ykClass, className)} style={{ display: "flex", flexDirection: row ? "row" : "column", flexWrap: "wrap", ...style }} {...p} />
))

export const FormControlLabel = ui("FormControlLabel", ({ ykClass, Comp, className, control, label, labelPlacement = "end", disabled, checked, value, name, onChange, inputRef, slotProps: _sp, componentsProps: _cp, disableTypography: _dt, required, ...p }, ref) => {
  const ctl = isValidElement(control)
    ? cloneElement(control as React.ReactElement<any>, {
        disabled: (control.props as UIProps).disabled ?? disabled,
        ...(checked !== undefined ? { checked } : {}),
        ...(value !== undefined ? { value } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(onChange ? { onChange } : {}),
        ...(inputRef ? { inputRef } : {}),
      })
    : control
  return (
    <Comp ref={ref} className={cx("MuiFormControlLabel-root", labelPlacement !== "end" && `MuiFormControlLabel-labelPlacement${cap(labelPlacement)}`, disabled && "Mui-disabled", ykClass, className)} {...p}>
      {ctl}
      <span className="MuiFormControlLabel-label MuiTypography-root yk-t-body1">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
    </Comp>
  )
}, { tag: "label" })

/* ───────────── Slider (a real range input) ───────────── */

export const Slider = ui("Slider", ({ ykClass, Comp: _c, className, value, defaultValue, onChange, onChangeCommitted, min = 0, max = 100, step = 1, marks, valueLabelDisplay: _vl, valueLabelFormat, getAriaValueText, getAriaLabel, disabled, size = "medium", color = "primary", orientation: _o, track: _t, name, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-valuetext": ariaValueText, scale: _sc, shiftStep: _ss, slotProps: _sp, ...p }, ref) => {
  const [inner, setInner] = useState(defaultValue ?? min)
  const current = value ?? inner
  const values: number[] = Array.isArray(current) ? current : [current]
  const markList: { value: number; label?: React.ReactNode }[] = Array.isArray(marks) ? marks : []
  const fmt = (v: number) => (typeof valueLabelFormat === "function" ? textOf(valueLabelFormat(v, 0)) : String(v))
  const set = (i: number, n: number, e: React.SyntheticEvent, commit: boolean) => {
    const next = Array.isArray(current) ? values.map((x, j) => (j === i ? n : x)) : n
    if (value === undefined) setInner(next)
    if (commit) onChangeCommitted?.(e, next)
    else onChange?.(e, next, i)
  }
  return (
    <span ref={ref} className={cx("MuiSlider-root", `MuiSlider-size${cap(size)}`, colorClass(color), disabled && "Mui-disabled", ykClass, className)} {...p}>
      {values.map((v, i) => (
        <input
          key={i}
          type="range"
          className="MuiSlider-input"
          min={min}
          max={max}
          step={step === null ? "any" : step}
          value={v}
          disabled={disabled}
          name={name}
          aria-label={typeof getAriaLabel === "function" ? getAriaLabel(i) : ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-valuetext={ariaValueText ?? (typeof getAriaValueText === "function" ? getAriaValueText(v, i) : valueLabelFormat ? fmt(v) : undefined)}
          onChange={(e) => set(i, Number(e.target.value), e, false)}
          onPointerUp={(e) => set(i, Number((e.target as HTMLInputElement).value), e, true)}
          onKeyUp={(e) => set(i, Number((e.target as HTMLInputElement).value), e, true)}
        />
      ))}
      {markList.some((m) => m.label) && (
        <span className="MuiSlider-marks" aria-hidden="true" style={{ position: "relative", height: "1.4em" }}>
          {markList.map((m) => (
            <span key={m.value} className="MuiSlider-markLabel" style={{ position: "absolute", left: `${((m.value - min) / (max - min)) * 100}%`, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
              {m.label}
            </span>
          ))}
        </span>
      )}
    </span>
  )
})

/* ───────────── Autocomplete (combobox + listbox, ARIA 1.2) ───────────── */

export const Autocomplete = ui("Autocomplete", ({ ykClass, Comp: _c, className, options = [], value, defaultValue, onChange, inputValue, onInputChange, getOptionLabel = (o: any) => (typeof o === "string" ? o : (o?.label ?? String(o ?? ""))), renderInput, renderOption, filterOptions, isOptionEqualToValue = (a: any, b: any) => a === b, freeSolo, disableClearable: _dc, noOptionsText = "No options", loading, loadingText = "Loading…", disabled, size, fullWidth, autoHighlight, openOnFocus, blurOnSelect: _bs, clearOnBlur: _cb, selectOnFocus: _sf, handleHomeEndKeys: _he, includeInputInList: _ii, ListboxProps: _lp, slotProps: _sp, PaperComponent: _pc, groupBy: _g, id, ...p }, ref) => {
  const auto = useId(id)
  const [inner, setInner] = useState(defaultValue ?? null)
  const [text, setText] = useState(inputValue ?? (value != null ? getOptionLabel(value) : ""))
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const current = value !== undefined ? value : inner
  const typed = inputValue ?? text
  useEffect(() => {
    if (inputValue === undefined && current != null && !open) setText(getOptionLabel(current))
  }, [current])
  const list: any[] = filterOptions
    ? filterOptions(options, { inputValue: typed, getOptionLabel })
    : options.filter((o: any) => getOptionLabel(o).toLowerCase().includes(String(typed).toLowerCase()))
  const listId = `${auto}-listbox`
  const choose = (e: React.SyntheticEvent, o: any) => {
    if (value === undefined) setInner(o)
    onChange?.(e, o, "selectOption")
    const label = o == null ? "" : getOptionLabel(o)
    if (inputValue === undefined) setText(label)
    onInputChange?.(e, label, "reset")
    setOpen(false)
    setActive(-1)
  }
  const params = {
    id: auto,
    disabled,
    size,
    fullWidth: fullWidth ?? true,
    InputLabelProps: {},
    InputProps: { ref: undefined, className: "MuiAutocomplete-inputRoot", startAdornment: undefined, endAdornment: undefined },
    inputProps: {
      role: "combobox",
      "aria-expanded": open,
      "aria-controls": listId,
      "aria-autocomplete": "list",
      "aria-activedescendant": active >= 0 ? `${auto}-option-${active}` : undefined,
      autoComplete: "off",
      value: typed,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (inputValue === undefined) setText(e.target.value)
        onInputChange?.(e, e.target.value, "input")
        setOpen(true)
        setActive(autoHighlight ? 0 : -1)
        if (freeSolo) onChange?.(e, e.target.value, "createOption")
      },
      onFocus: () => openOnFocus && setOpen(true),
      onBlur: () => setTimeout(() => setOpen(false), 120),
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setOpen(true)
          setActive((a) => Math.min(list.length - 1, a + 1))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setActive((a) => Math.max(0, a - 1))
        } else if (e.key === "Enter" && open && active >= 0 && list[active] !== undefined) {
          e.preventDefault()
          choose(e, list[active])
        } else if (e.key === "Escape") {
          setOpen(false)
        }
      },
    },
  }
  return (
    <div ref={ref} className={cx("MuiAutocomplete-root", fullWidth && "MuiAutocomplete-fullWidth", ykClass, className)} {...p}>
      {renderInput?.(params)}
      {open && (
        <ul id={listId} role="listbox" className="MuiAutocomplete-listbox MuiPaper-root">
          {loading ? (
            <li className="MuiAutocomplete-loading">{loadingText}</li>
          ) : list.length === 0 ? (
            <li className="MuiAutocomplete-noOptions">{noOptionsText}</li>
          ) : (
            list.map((o, i) => {
              const sel = current != null && isOptionEqualToValue(o, current)
              const props = {
                key: i,
                id: `${auto}-option-${i}`,
                role: "option",
                "aria-selected": sel,
                className: cx("MuiAutocomplete-option", i === active && "Mui-focused"),
                onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
                onClick: (e: React.MouseEvent) => choose(e, o),
              }
              return renderOption ? renderOption(props, o, { selected: sel, index: i, inputValue: typed }) : <li {...props}>{getOptionLabel(o)}</li>
            })
          )}
        </ul>
      )}
    </div>
  )
})

export { SelectContext }
