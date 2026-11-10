// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · styles.ts
//
// The look of every YuktAI UI component, in one stylesheet.
//   • Every rule is wrapped in :where(), so it has no weight: a site's own CSS
//     and the sx prop always win.
//   • Colours come from CSS variables (the site's tokens first).
//   • WCAG built in: 44px touch targets (2.5.5 AAA, 40px for size="small"),
//     a 3px focus ring that never disappears (2.4.7, 2.4.13), visible state
//     for selected / pressed / disabled that is not colour alone, and no motion
//     when the visitor asks for less (2.3.3).
// Class names also include the familiar Mui* names, so existing CSS that
// targets .MuiButton-root or .Mui-selected keeps working.
// ─────────────────────────────────────────────────────────────────────────────

import { insertRule } from "./sx"

const FG = "var(--foreground, #1c2433)"
const MUTED = "var(--muted-text, #434c5c)"
const BG = "var(--background, #ffffff)"
const PAPER = "var(--surface-elevated, #ffffff)"
const SURFACE = "var(--surface, #f3f5f8)"
const LINE = "var(--border, #dde3ea)"
const LINE_STRONG = "var(--border-strong, #6b7585)"
const FOCUS = "var(--focus-ring, var(--primary, #1f4e8c))"
const PRIMARY = "var(--primary, #1f4e8c)"
const mix = (c: string, pct: number, o = "transparent") => `color-mix(in srgb, ${c} ${pct}%, ${o})`

const COLORS: Record<string, [string, string]> = {
  primary: [PRIMARY, "var(--on-primary, #ffffff)"],
  secondary: ["var(--secondary, #173d6e)", "var(--on-secondary, #ffffff)"],
  error: ["var(--error, #a1271b)", "#ffffff"],
  warning: ["var(--warning, #6e4300)", "#ffffff"],
  info: ["var(--info, #1f4e8c)", "#ffffff"],
  success: ["var(--success, #1d6b3a)", "#ffffff"],
  inherit: ["currentColor", BG],
  default: [FG, BG],
}

const colorVars = Object.entries(COLORS)
  .map(([k, [c, on]]) => `:where(.yk-c-${k}){--yk-c:${c};--yk-on:${on};}`)
  .join("")

const css = /* css */ `
${colorVars}
:where([class*="yk-"],[class*="Mui"]){box-sizing:border-box;}
:where(.yk-focus):focus-visible,:where(.yk-focus.Mui-focusVisible){outline:3px solid ${FOCUS};outline-offset:2px;}
:where(.yk-reset){font:inherit;color:inherit;background:none;border:0;margin:0;padding:0;}

/* Typography */
:where(.MuiTypography-root){margin:0;}
:where(.MuiTypography-gutterBottom){margin-bottom:0.35em;}
:where(.MuiTypography-paragraph){margin-bottom:1em;}
:where(.MuiTypography-noWrap){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* SvgIcon */
:where(.MuiSvgIcon-root){width:1em;height:1em;display:inline-block;flex-shrink:0;font-size:1.5rem;user-select:none;vertical-align:middle;}
:where(.MuiSvgIcon-fontSizeSmall){font-size:1.25rem;}
:where(.MuiSvgIcon-fontSizeLarge){font-size:2.1875rem;}
:where(.MuiSvgIcon-fontSizeInherit){font-size:inherit;}

/* Buttons */
:where(.MuiButtonBase-root){display:inline-flex;align-items:center;justify-content:center;position:relative;gap:8px;
  font:inherit;font-weight:600;line-height:1.4;cursor:pointer;user-select:none;text-decoration:none;color:inherit;
  background:transparent;border:0;margin:0;-webkit-tap-highlight-color:transparent;
  transition:background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease,filter .15s ease;}
:where(.MuiButtonBase-root):focus-visible{outline:3px solid ${FOCUS};outline-offset:2px;}
:where(.MuiButtonBase-root.Mui-disabled){cursor:not-allowed;opacity:.55;}
:where(.MuiButton-root){min-height:44px;min-width:64px;padding:8px 18px;border-radius:10px;color:var(--yk-c);}
:where(.MuiButton-sizeSmall){min-height:40px;padding:6px 12px;font-size:.9rem;}
:where(.MuiButton-sizeLarge){min-height:52px;padding:10px 24px;font-size:1.05rem;}
:where(.MuiButton-fullWidth){width:100%;}
:where(.MuiButton-text):hover{background:${mix("var(--yk-c)", 9)};}
:where(.MuiButton-outlined){border:2px solid var(--yk-c);}
:where(.MuiButton-outlined):hover{background:${mix("var(--yk-c)", 9)};}
:where(.MuiButton-contained){background:var(--yk-c);color:var(--yk-on);box-shadow:0 1px 2px rgba(15,23,42,.18);}
:where(.MuiButton-contained):hover{filter:brightness(1.08);box-shadow:0 3px 8px rgba(15,23,42,.2);}
:where(.MuiButton-startIcon,.MuiButton-endIcon){display:inline-flex;}
:where(.MuiButton-startIcon>.MuiSvgIcon-root,.MuiButton-endIcon>.MuiSvgIcon-root){font-size:1.25rem;}
:where(.yk-loading){color:transparent !important;}
:where(.yk-loading>.yk-spinner-slot){position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--yk-on,currentColor);}
:where(.MuiButton-text.yk-loading>.yk-spinner-slot,.MuiButton-outlined.yk-loading>.yk-spinner-slot){color:var(--yk-c);}

:where(.MuiIconButton-root){min-width:44px;min-height:44px;padding:8px;border-radius:999px;color:var(--yk-c,inherit);font-size:1.5rem;}
:where(.MuiIconButton-root.yk-c-default){color:inherit;}
:where(.MuiIconButton-root):hover{background:${mix("currentColor", 9)};}
:where(.MuiIconButton-sizeSmall){min-width:40px;min-height:40px;padding:6px;font-size:1.25rem;}
:where(.MuiIconButton-sizeLarge){min-width:52px;min-height:52px;padding:12px;font-size:1.75rem;}
:where(.MuiIconButton-edgeStart){margin-left:-8px;}
:where(.MuiIconButton-edgeEnd){margin-right:-8px;}

:where(.MuiFab-root){min-height:56px;min-width:56px;border-radius:999px;padding:0 16px;background:var(--yk-c);color:var(--yk-on);
  box-shadow:0 3px 10px rgba(15,23,42,.24);}
:where(.MuiFab-root.yk-c-default){background:${PAPER};color:${FG};}
:where(.MuiFab-root):hover{filter:brightness(1.08);}
:where(.MuiFab-circular){width:56px;padding:0;}
:where(.MuiFab-sizeSmall){min-height:44px;min-width:44px;}
:where(.MuiFab-sizeSmall.MuiFab-circular){width:44px;}
:where(.MuiFab-sizeMedium){min-height:48px;min-width:48px;}
:where(.MuiFab-sizeMedium.MuiFab-circular){width:48px;}
:where(.MuiFab-extended){border-radius:999px;padding:0 20px;}

:where(.MuiButtonGroup-root){display:inline-flex;border-radius:10px;}
:where(.MuiButtonGroup-root>.MuiButton-root:not(:first-child)){border-top-left-radius:0;border-bottom-left-radius:0;}
:where(.MuiButtonGroup-root>.MuiButton-root:not(:last-child)){border-top-right-radius:0;border-bottom-right-radius:0;}
:where(.MuiButtonGroup-root>.MuiButton-outlined:not(:first-child)){margin-left:-2px;}

/* Toggle buttons */
:where(.MuiToggleButtonGroup-root){display:inline-flex;flex-wrap:wrap;border-radius:10px;}
:where(.MuiToggleButton-root){min-height:44px;padding:8px 14px;border:2px solid ${LINE_STRONG};color:${FG};border-radius:10px;}
:where(.MuiToggleButtonGroup-root>.MuiToggleButton-root:not(:first-child)){margin-left:-2px;border-top-left-radius:0;border-bottom-left-radius:0;}
:where(.MuiToggleButtonGroup-root>.MuiToggleButton-root:not(:last-child)){border-top-right-radius:0;border-bottom-right-radius:0;}
:where(.MuiToggleButtonGroup-vertical){flex-direction:column;}
:where(.MuiToggleButton-root):hover{background:${mix(FG, 6)};}
:where(.MuiToggleButton-root.Mui-selected){background:var(--yk-c,${PRIMARY});color:var(--yk-on,#fff);border-color:var(--yk-c,${PRIMARY});position:relative;z-index:1;}
:where(.MuiToggleButton-sizeSmall){min-height:40px;padding:6px 10px;font-size:.9rem;}
:where(.MuiToggleButton-fullWidth){flex:1;}

/* Chip */
:where(.MuiChip-root){display:inline-flex;align-items:center;gap:6px;min-height:32px;max-width:100%;padding:2px 12px;border-radius:999px;
  font-size:.875rem;font-weight:600;line-height:1.4;background:${mix("var(--yk-c)", 12)};color:${FG};border:1px solid ${mix("var(--yk-c)", 35)};vertical-align:middle;}
:where(.MuiChip-root.yk-c-default){background:${mix(FG, 8)};border-color:${LINE};}
:where(.MuiChip-filled.yk-c-primary,.MuiChip-filled.yk-c-secondary,.MuiChip-filled.yk-c-error,.MuiChip-filled.yk-c-success,.MuiChip-filled.yk-c-info,.MuiChip-filled.yk-c-warning){background:var(--yk-c);color:var(--yk-on);border-color:var(--yk-c);}
:where(.MuiChip-outlined){background:transparent;border:1.5px solid var(--yk-c,${LINE_STRONG});}
:where(.MuiChip-outlined.yk-c-default){border-color:${LINE_STRONG};}
:where(.MuiChip-sizeSmall){min-height:26px;padding:1px 8px;font-size:.8rem;}
:where(.MuiChip-clickable){cursor:pointer;min-height:40px;}
:where(.MuiChip-clickable.MuiChip-sizeSmall){min-height:32px;}
:where(.MuiChip-clickable):hover{filter:brightness(.96);}
:where(.MuiChip-label){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
:where(.MuiChip-icon){display:inline-flex;font-size:1.1rem;}
:where(.MuiChip-icon .MuiSvgIcon-root){font-size:1.1rem;}
:where(.MuiChip-deleteIcon){display:inline-flex;align-items:center;justify-content:center;min-width:28px;min-height:28px;margin-right:-6px;border-radius:999px;cursor:pointer;color:inherit;}
:where(.MuiChip-deleteIcon):hover{background:${mix("currentColor", 12)};}

/* Inputs */
:where(.MuiFormControl-root){display:inline-flex;flex-direction:column;position:relative;min-width:0;vertical-align:top;border:0;margin:0;padding:0;}
:where(.MuiFormControl-fullWidth,.MuiTextField-root.MuiFormControl-fullWidth){width:100%;}
:where(.MuiFormLabel-root,.MuiInputLabel-root){display:block;font-size:.9rem;font-weight:600;color:${FG};margin-bottom:6px;line-height:1.4;}
:where(.MuiFormLabel-root.Mui-error){color:var(--error,#a1271b);}
:where(.MuiInputBase-root){display:inline-flex;align-items:center;position:relative;max-width:100%;font:inherit;color:${FG};cursor:text;}
:where(.MuiInputBase-fullWidth,.MuiFormControl-fullWidth>.MuiInputBase-root,.MuiAutocomplete-root .MuiInputBase-root){width:100%;}
:where(.MuiOutlinedInput-root){background:${PAPER};border-radius:10px;min-height:44px;padding:0 12px;}
:where(.MuiOutlinedInput-notchedOutline){position:absolute;inset:0;border:2px solid ${LINE_STRONG};border-radius:inherit;pointer-events:none;margin:0;padding:0;}
:where(.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline){border-color:${FG};}
:where(.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline){border-color:${FOCUS};border-width:3px;}
:where(.MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline){border-color:var(--error,#a1271b);}
:where(.MuiInputBase-sizeSmall.MuiOutlinedInput-root){min-height:40px;}
:where(.MuiFilledInput-root){background:${SURFACE};border-radius:10px 10px 0 0;border-bottom:2px solid ${LINE_STRONG};min-height:44px;padding:0 12px;}
:where(.MuiInput-root){border-bottom:2px solid ${LINE_STRONG};min-height:40px;}
:where(.MuiInputBase-input){font:inherit;color:inherit;background:none;border:0;outline:0;width:100%;min-width:0;padding:10px 0;margin:0;}
:where(.MuiInputBase-input)::placeholder{color:${MUTED};opacity:1;}
:where(textarea.MuiInputBase-input){resize:vertical;line-height:1.6;}
:where(.MuiInputBase-multiline){align-items:stretch;padding-top:4px;padding-bottom:4px;}
:where(.MuiInputBase-root.Mui-disabled){opacity:.6;cursor:not-allowed;}
:where(.MuiInputAdornment-root){display:inline-flex;align-items:center;color:${MUTED};white-space:nowrap;max-height:2em;}
:where(.MuiInputAdornment-positionStart){margin-right:8px;}
:where(.MuiInputAdornment-positionEnd){margin-left:8px;}
:where(.MuiFormHelperText-root){font-size:.85rem;color:${MUTED};margin:6px 2px 0;line-height:1.5;}
:where(.MuiFormHelperText-root.Mui-error){color:var(--error,#a1271b);font-weight:600;}
:where(.MuiSelect-select){appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:28px;}
:where(.MuiSelect-icon){position:absolute;right:10px;pointer-events:none;font-size:1.25rem;color:${MUTED};}
:where(.MuiSelect-select option){color:${FG};background:${PAPER};}
:where(.MuiAutocomplete-root){position:relative;width:100%;}
:where(.MuiAutocomplete-listbox){position:absolute;z-index:1300;left:0;right:0;top:100%;margin:4px 0 0;padding:6px;list-style:none;max-height:320px;overflow:auto;
  background:${PAPER};color:${FG};border:1px solid ${LINE};border-radius:12px;box-shadow:0 10px 30px rgba(15,23,42,.18);}
:where(.MuiAutocomplete-groupLabel){position:sticky;top:-6px;z-index:1;padding:8px 12px 4px;font-size:.8rem;font-weight:700;color:var(--muted-text,#555);background:var(--surface-elevated,#fff);}
:where(.MuiAutocomplete-option){padding:10px 12px;border-radius:8px;cursor:pointer;min-height:44px;display:flex;align-items:center;}
:where(.MuiAutocomplete-option[aria-selected="true"],.MuiAutocomplete-option.Mui-focused){background:${mix(PRIMARY, 12)};}

/* Switch, checkbox, radio */
:where(.MuiFormControlLabel-root){display:inline-flex;align-items:center;gap:10px;cursor:pointer;min-height:44px;margin:0;vertical-align:middle;}
:where(.MuiFormControlLabel-labelPlacementStart){flex-direction:row-reverse;}
:where(.MuiFormControlLabel-root.Mui-disabled){cursor:not-allowed;opacity:.6;}
:where(.MuiSwitch-root){position:relative;display:inline-flex;align-items:center;width:52px;height:32px;flex-shrink:0;}
:where(.MuiSwitch-input){position:absolute;inset:-6px;width:calc(100% + 12px);height:calc(100% + 12px);opacity:0;margin:0;cursor:inherit;z-index:1;}
:where(.MuiSwitch-track){position:absolute;inset:4px 0;border-radius:999px;background:${mix(FG, 30)};border:2px solid ${LINE_STRONG};transition:background-color .15s;}
:where(.MuiSwitch-thumb){position:absolute;left:4px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .15s;}
:where(.MuiSwitch-root.Mui-checked .MuiSwitch-track){background:var(--yk-c,${PRIMARY});border-color:var(--yk-c,${PRIMARY});}
:where(.MuiSwitch-root.Mui-checked .MuiSwitch-thumb){transform:translateX(20px);}
:where(.MuiSwitch-input:focus-visible~.MuiSwitch-track){outline:3px solid ${FOCUS};outline-offset:2px;}
:where(.MuiSwitch-sizeSmall){width:44px;height:26px;}
:where(.MuiSwitch-sizeSmall .MuiSwitch-thumb){width:16px;height:16px;}
:where(.MuiSwitch-sizeSmall.Mui-checked .MuiSwitch-thumb){transform:translateX(16px);}
:where(.MuiCheckbox-root,.MuiRadio-root){display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;}
:where(.MuiCheckbox-root input,.MuiRadio-root input){width:22px;height:22px;margin:0;accent-color:var(--yk-c,${PRIMARY});cursor:pointer;}

/* Slider */
:where(.MuiSlider-root){display:flex;flex-direction:column;justify-content:center;width:100%;min-height:44px;color:var(--yk-c,${PRIMARY});}
:where(.MuiSlider-input){width:100%;margin:0;accent-color:var(--yk-c,${PRIMARY});cursor:pointer;height:28px;}
:where(.MuiSlider-input):focus-visible{outline:3px solid ${FOCUS};outline-offset:4px;border-radius:8px;}
:where(.MuiSlider-marks){display:flex;justify-content:space-between;font-size:.8rem;color:${MUTED};padding:0 4px;}
:where(.MuiSlider-root.Mui-disabled){opacity:.55;}

/* Surfaces */
:where(.MuiPaper-root){background:${PAPER};color:${FG};border-radius:12px;}
:where(.MuiPaper-outlined){border:1px solid ${LINE};}
:where(.MuiPaper-square){border-radius:0;}
:where(.MuiCard-root){overflow:hidden;border-radius:14px;}
:where(.MuiCardContent-root){padding:16px;}
:where(.MuiCardContent-root:last-child){padding-bottom:20px;}
:where(.MuiCardActions-root){display:flex;align-items:center;gap:8px;padding:8px 12px;}
:where(.MuiCardHeader-root){display:flex;align-items:center;gap:12px;padding:16px;}
:where(.MuiCardHeader-content){flex:1;min-width:0;}
:where(.MuiCardMedia-root){display:block;background-size:cover;background-position:center;width:100%;object-fit:cover;}
:where(.MuiCardActionArea-root){display:block;width:100%;text-align:inherit;border-radius:inherit;}
:where(.MuiCardActionArea-root):hover{background:${mix(FG, 4)};}
:where(.MuiAccordion-root){border:1px solid ${LINE};border-radius:12px;overflow:hidden;background:${PAPER};}
:where(.MuiAccordion-root+.MuiAccordion-root){margin-top:8px;}
:where(.MuiAccordionSummary-root){display:flex;align-items:center;gap:12px;width:100%;min-height:52px;padding:8px 16px;text-align:left;cursor:pointer;font:inherit;color:inherit;background:none;border:0;}
:where(.MuiAccordionSummary-root):hover{background:${mix(FG, 4)};}
:where(.MuiAccordionSummary-content){flex:1;min-width:0;display:flex;align-items:center;gap:8px;}
:where(.MuiAccordionSummary-expandIconWrapper){display:inline-flex;transition:transform .2s;}
:where(.MuiAccordionSummary-root.Mui-expanded .MuiAccordionSummary-expandIconWrapper){transform:rotate(180deg);}
:where(.MuiAccordionDetails-root){padding:8px 16px 16px;}
:where(.MuiAppBar-root){display:flex;flex-direction:column;width:100%;z-index:1100;background:var(--yk-c,${PRIMARY});color:var(--yk-on,#fff);}
:where(.MuiAppBar-positionFixed){position:fixed;top:0;left:0;right:0;}
:where(.MuiAppBar-positionSticky){position:sticky;top:0;}
:where(.MuiToolbar-root){display:flex;align-items:center;min-height:56px;padding:0 16px;gap:8px;}
:where(.MuiToolbar-dense){min-height:48px;}
:where(.MuiContainer-root){width:100%;margin-left:auto;margin-right:auto;padding-left:16px;padding-right:16px;}
@media (min-width:600px){:where(.MuiContainer-root){padding-left:24px;padding-right:24px;}}
:where(.MuiContainer-disableGutters){padding-left:0;padding-right:0;}
:where(.MuiDivider-root){margin:0;border:0;border-top:1px solid ${LINE};flex-shrink:0;}
:where(.MuiDivider-vertical){border-top:0;border-left:1px solid ${LINE};align-self:stretch;height:auto;}
:where(.MuiDivider-middle){margin-left:16px;margin-right:16px;}
:where(.MuiDivider-withChildren){display:flex;align-items:center;gap:12px;border:0;color:${MUTED};font-size:.875rem;}
:where(.MuiDivider-withChildren)::before,:where(.MuiDivider-withChildren)::after{content:"";flex:1;border-top:1px solid ${LINE};}
:where(.MuiDivider-textAlignLeft)::before{flex:0 0 24px;}
:where(.MuiDivider-textAlignRight)::after{flex:0 0 24px;}

/* Lists */
:where(.MuiList-root){list-style:none;margin:0;padding:8px 0;position:relative;}
:where(.MuiList-dense){padding:4px 0;}
:where(.MuiListItem-root){display:flex;align-items:center;gap:12px;padding:8px 16px;position:relative;text-align:left;}
:where(.MuiListItem-disablePadding){padding:0;}
:where(.MuiListItemButton-root){display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:8px 16px;text-align:left;border-radius:10px;justify-content:flex-start;font-weight:400;}
:where(.MuiListItemButton-root):hover{background:${mix(FG, 6)};}
:where(.MuiListItemButton-root.Mui-selected){background:${mix(PRIMARY, 14)};font-weight:600;box-shadow:inset 4px 0 0 ${PRIMARY};}
:where(.MuiListItemIcon-root){display:inline-flex;min-width:36px;color:${MUTED};flex-shrink:0;}
:where(.MuiListItemText-root){flex:1;min-width:0;margin:2px 0;}
:where(.MuiListItemText-primary){display:block;}
:where(.MuiListItemText-secondary){display:block;font-size:.875rem;color:${MUTED};}
:where(.MuiListSubheader-root){display:block;padding:10px 16px 6px;font-size:.8rem;font-weight:700;letter-spacing:.04em;color:${MUTED};background:${PAPER};list-style:none;}
:where(.MuiListSubheader-sticky){position:sticky;top:0;z-index:1;}

/* Tabs */
:where(.MuiTabs-root){display:flex;position:relative;min-height:48px;border-bottom:1px solid ${LINE};}
:where(.MuiTabs-scroller){flex:1;overflow:hidden;position:relative;}
:where(.MuiTabs-scrollableX){overflow-x:auto;scrollbar-width:thin;}
:where(.MuiTabs-flexContainer){display:flex;gap:4px;}
:where(.MuiTabs-centered){justify-content:center;}
:where(.MuiTabs-flexContainerVertical){flex-direction:column;}
:where(.MuiTabs-vertical){border-bottom:0;border-right:1px solid ${LINE};flex-direction:column;}
:where(.MuiTab-root){min-height:48px;min-width:72px;padding:10px 16px;border-radius:10px 10px 0 0;color:${MUTED};font-weight:600;flex-shrink:0;
  flex-direction:column;gap:4px;border-bottom:3px solid transparent;margin-bottom:-1px;}
:where(.MuiTab-labelIcon){flex-direction:row;gap:8px;}
:where(.MuiTab-root):hover{color:${FG};background:${mix(FG, 5)};}
:where(.MuiTab-root.Mui-selected){color:var(--yk-c,${PRIMARY});border-bottom-color:currentColor;}
:where(.MuiTab-fullWidth){flex:1;}
:where(.MuiTab-wrapped){white-space:normal;}
:where(.MuiTabs-vertical .MuiTab-root){border-bottom:0;border-right:3px solid transparent;margin:0 -1px 0 0;border-radius:10px 0 0 10px;align-items:flex-start;}
:where(.MuiTabs-vertical .MuiTab-root.Mui-selected){border-right-color:currentColor;}
:where(.MuiTabs-indicator){display:none;}

/* Pagination */
:where(.MuiPagination-ul){display:flex;flex-wrap:wrap;align-items:center;gap:6px;list-style:none;margin:0;padding:0;}
:where(.MuiPaginationItem-root){min-width:44px;min-height:44px;padding:0 10px;border-radius:10px;font-weight:600;color:${FG};}
:where(.MuiPaginationItem-root):hover{background:${mix(FG, 6)};}
:where(.MuiPaginationItem-root.Mui-selected){background:var(--yk-c,${PRIMARY});color:var(--yk-on,#fff);}
:where(.MuiPaginationItem-outlined){border:1.5px solid ${LINE_STRONG};}
:where(.MuiPaginationItem-ellipsis){display:inline-flex;align-items:center;justify-content:center;min-width:32px;color:${MUTED};}

/* Feedback */
:where(.MuiAlert-root){display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-radius:12px;line-height:1.6;
  background:${mix("var(--yk-c)", 10, PAPER)};color:${FG};border:1px solid ${mix("var(--yk-c)", 45)};border-left-width:5px;}
:where(.MuiAlert-filled){background:var(--yk-c);color:var(--yk-on);border-color:var(--yk-c);}
:where(.MuiAlert-outlined){background:transparent;}
:where(.MuiAlert-icon){display:inline-flex;padding-top:2px;color:var(--yk-c);font-size:1.4rem;}
:where(.MuiAlert-filled .MuiAlert-icon){color:inherit;}
:where(.MuiAlert-message){flex:1;min-width:0;padding-top:1px;}
:where(.MuiAlert-action){display:inline-flex;align-items:center;margin:-6px -8px -6px auto;padding-left:8px;}
:where(.MuiAlertTitle-root){font-weight:700;margin:0 0 2px;}
:where(.MuiCircularProgress-root){display:inline-block;color:var(--yk-c,${PRIMARY});}
:where(.MuiCircularProgress-indeterminate){animation:yk-spin 1s linear infinite;}
:where(.MuiCircularProgress-svg){display:block;}
:where(.MuiCircularProgress-circle){stroke:currentColor;}
:where(.MuiCircularProgress-indeterminate .MuiCircularProgress-circle){stroke-dasharray:80px,200px;stroke-dashoffset:0;}
:where(.MuiLinearProgress-root){position:relative;overflow:hidden;height:6px;border-radius:999px;background:${mix("var(--yk-c)", 20)};color:var(--yk-c,${PRIMARY});}
:where(.MuiLinearProgress-bar){position:absolute;left:0;top:0;bottom:0;background:currentColor;border-radius:inherit;transition:width .3s ease;}
:where(.MuiLinearProgress-indeterminate .MuiLinearProgress-bar){width:40%;animation:yk-slide 1.4s ease-in-out infinite;}
:where(.MuiSkeleton-root){display:block;background:${mix(FG, 11)};border-radius:6px;height:1.2em;}
:where(.MuiSkeleton-text){transform:scale(1,.7);transform-origin:0 55%;}
:where(.MuiSkeleton-circular){border-radius:50%;}
:where(.MuiSkeleton-rectangular){border-radius:0;}
:where(.MuiSkeleton-rounded){border-radius:12px;}
:where(.MuiSkeleton-pulse){animation:yk-pulse 1.6s ease-in-out infinite;}
:where(.MuiSkeleton-wave){animation:yk-pulse 1.6s ease-in-out infinite;}
:where(.MuiSnackbar-root){position:fixed;z-index:1400;display:flex;left:16px;right:16px;bottom:16px;justify-content:center;pointer-events:none;}
:where(.MuiSnackbar-root>*){pointer-events:auto;}
:where(.MuiSnackbar-anchorOriginTopCenter,.MuiSnackbar-anchorOriginTopLeft,.MuiSnackbar-anchorOriginTopRight){top:16px;bottom:auto;}
:where(.MuiSnackbar-anchorOriginBottomLeft,.MuiSnackbar-anchorOriginTopLeft){justify-content:flex-start;}
:where(.MuiSnackbar-anchorOriginBottomRight,.MuiSnackbar-anchorOriginTopRight){justify-content:flex-end;}
:where(.MuiSnackbarContent-root){display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-height:48px;padding:8px 16px;border-radius:12px;
  background:${FG};color:${BG};box-shadow:0 6px 20px rgba(15,23,42,.3);max-width:600px;}
:where(.MuiSnackbarContent-action){margin-left:auto;display:flex;gap:8px;}

/* Tooltip */
:where(.MuiTooltip-popper){position:fixed;z-index:1500;pointer-events:none;}
:where(.MuiTooltip-tooltip){max-width:300px;padding:6px 10px;border-radius:8px;background:${FG};color:${BG};font-size:.85rem;line-height:1.5;font-weight:500;
  box-shadow:0 4px 14px rgba(15,23,42,.25);word-wrap:break-word;}

/* Overlays */
:where(.MuiDialog-root){padding:0;margin:auto;border:0;background:transparent;max-width:100vw;max-height:100dvh;overflow:visible;color:${FG};}
:where(.MuiDialog-root)::backdrop{background:rgba(15,23,42,.55);}
:where(.MuiDialog-root:not([open])){display:none;}
:where(.MuiDialog-paper){display:flex;flex-direction:column;margin:16px;max-height:calc(100dvh - 32px);overflow-y:auto;border-radius:16px;
  box-shadow:0 20px 50px rgba(15,23,42,.35);max-width:600px;}
:where(.MuiDialog-paperWidthXs){max-width:444px;}
:where(.MuiDialog-paperWidthSm){max-width:600px;}
:where(.MuiDialog-paperWidthMd){max-width:900px;}
:where(.MuiDialog-paperWidthLg){max-width:1200px;}
:where(.MuiDialog-paperWidthXl){max-width:1536px;}
:where(.MuiDialog-paperWidthFalse){max-width:calc(100vw - 32px);}
:where(.MuiDialog-paperFullWidth){width:calc(100vw - 32px);}
:where(.MuiDialog-paperFullScreen){margin:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0;}
:where(.MuiDialogTitle-root){margin:0;padding:18px 24px 10px;font-size:1.25rem;font-weight:700;line-height:1.4;}
:where(.MuiDialogContent-root){flex:1 1 auto;overflow-y:auto;padding:8px 24px 16px;}
:where(.MuiDialogContent-dividers){border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};padding:16px 24px;}
:where(.MuiDialogContentText-root){margin:0 0 8px;color:${MUTED};}
:where(.MuiDialogActions-root){display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:10px 20px 18px;}
:where(.MuiDrawer-root){position:fixed;inset:0;z-index:1200;}
:where(.MuiDrawer-paper){position:fixed;top:0;bottom:0;display:flex;flex-direction:column;overflow-y:auto;max-width:100vw;border-radius:0;
  box-shadow:0 10px 40px rgba(15,23,42,.35);}
:where(.MuiDrawer-paperAnchorLeft){left:0;border-radius:0 16px 16px 0;}
:where(.MuiDrawer-paperAnchorRight){right:0;border-radius:16px 0 0 16px;}
:where(.MuiDrawer-paperAnchorTop){top:0;left:0;right:0;bottom:auto;border-radius:0 0 16px 16px;}
:where(.MuiDrawer-paperAnchorBottom){bottom:0;left:0;right:0;top:auto;border-radius:16px 16px 0 0;max-height:90dvh;}
:where(.MuiBackdrop-root){position:fixed;inset:0;background:rgba(15,23,42,.55);}
:where(.MuiBackdrop-invisible){background:transparent;}
:where(.MuiModal-root){position:fixed;inset:0;z-index:1300;}
:where(.MuiPopover-paper,.MuiMenu-paper){position:fixed;z-index:1300;min-width:180px;max-width:calc(100vw - 16px);max-height:calc(100dvh - 32px);overflow:auto;
  border-radius:12px;border:1px solid ${LINE};box-shadow:0 12px 32px rgba(15,23,42,.22);outline:0;}
:where(.MuiMenu-list){padding:6px;}
:where(.MuiMenuItem-root){display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:8px 14px;border-radius:8px;justify-content:flex-start;font-weight:400;text-align:left;white-space:nowrap;}
:where(.MuiMenuItem-root):hover,:where(.MuiMenuItem-root):focus-visible{background:${mix(FG, 7)};}
:where(.MuiMenuItem-root.Mui-selected){background:${mix(PRIMARY, 14)};font-weight:600;}
:where(.MuiMenuItem-divider){border-bottom:1px solid ${LINE};}

/* Collapse and fades */
:where(.MuiCollapse-root){display:grid;grid-template-rows:0fr;transition:grid-template-rows .25s ease,visibility 0s linear .25s;visibility:hidden;}
:where(.MuiCollapse-entered){grid-template-rows:1fr;visibility:visible;transition:grid-template-rows .25s ease;}
:where(.MuiCollapse-wrapper){min-height:0;overflow:hidden;}
:where(.MuiCollapse-entered>.MuiCollapse-wrapper){overflow:visible;}
:where(.yk-fade){transition:opacity .2s ease,transform .2s ease,visibility 0s linear .2s;}
:where(.yk-fade-in){transition:opacity .2s ease,transform .2s ease;}

/* Layout */
:where(.MuiStack-root){display:flex;flex-direction:column;}
:where(.MuiGrid-container){display:flex;flex-wrap:wrap;}
:where(.MuiLink-root){color:${PRIMARY};text-decoration-thickness:1px;text-underline-offset:3px;}
:where(.MuiLink-underlineHover){text-decoration:none;}
:where(.MuiLink-underlineHover):hover{text-decoration:underline;}
:where(.MuiLink-underlineNone){text-decoration:none;}
:where(.MuiLink-button){background:none;border:0;padding:0;font:inherit;cursor:pointer;}

@keyframes yk-spin{to{transform:rotate(360deg)}}
@keyframes yk-slide{0%{left:-40%}100%{left:100%}}
@keyframes yk-pulse{50%{opacity:.45}}
@media (prefers-reduced-motion: reduce){
  :where([class*="Mui"],[class*="yk-"]){transition-duration:.01ms !important;}
  :where(.MuiSkeleton-root,.MuiLinearProgress-indeterminate .MuiLinearProgress-bar){animation:none !important;}
  :where(.MuiCircularProgress-indeterminate){animation-duration:2.4s !important;}
}
:root[data-motion="off"] :where([class*="Mui"],[class*="yk-"]){transition-duration:.01ms !important;}
@media (forced-colors: active){
  :where(.MuiButton-contained,.MuiChip-filled,.MuiToggleButton-root.Mui-selected,.MuiPaginationItem-root.Mui-selected){border:2px solid ButtonText;}
  :where(.MuiTab-root.Mui-selected){border-bottom-color:Highlight;}
}
`

let added = false
/** Writes the component styles once, before any sx rule. */
export function ensureBaseStyles(): void {
  if (added && typeof document === "undefined") return
  insertRule("yk-base", css.replace(/\n\s*/g, ""), true)
  added = true
}

ensureBaseStyles()

export const BASE_CSS = css
