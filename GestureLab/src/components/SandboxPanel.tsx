import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { shaderParamMeta, shaderDefaults } from "../shaders/buildShaderMaterial"

const Svg = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline align-text-bottom">
    <path d={d} />
  </svg>
)

interface Props {
  shaderId: string
  values: Record<string, number>
  onChange: (key: string, val: number) => void
  onReset: () => void
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function SandboxPanel({ shaderId, values, onChange, onReset, open, onOpenChange }: Props) {
  const params = shaderParamMeta[shaderId]
  if (!params) return null

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="fixed bottom-4 left-4 z-[10002]">
      <CollapsibleTrigger className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="inline align-text-bottom mr-1"><path d="M4 3h8M4 8h8M4 13h8" /><circle cx="4" cy="3" r="1.5" fill="currentColor" /><circle cx="12" cy="8" r="1.5" fill="currentColor" /><circle cx="7" cy="13" r="1.5" fill="currentColor" /></svg>
        Shader Sandbox
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 w-64 rounded-xl border border-white/10 bg-[#0a1420]/95 backdrop-blur-xl p-3 shadow-2xl space-y-3">
        {params.map(({ key, label, min, max, step }) => (
          <div key={key} className="flex items-center gap-2">
            <Label className="text-xs text-white/70 w-20 shrink-0">{label}</Label>
            <Slider
              value={[values[key] ?? shaderDefaults[shaderId]?.[key] ?? 0]}
              onValueChange={(vals) => onChange(key, Array.isArray(vals) ? vals[0] : vals)}
              min={min}
              max={max}
              step={step}
              className="flex-1"
            />
            <span className="text-xs text-cyan-400 w-12 text-right font-mono">
              {(values[key] ?? shaderDefaults[shaderId]?.[key] ?? 0).toFixed(step < 1 ? 3 : 1)}
            </span>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onReset} className="w-full text-xs h-7">
          <Svg d="M4 6A6 6 0 1 1 2 9M2 2v5h5" /> Reset
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}
