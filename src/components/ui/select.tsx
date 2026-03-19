/**
 * COMPONENTE DE UI: SELECT (SELEÇÃO)
 * 
 * Este componente permite que o usuário escolha uma opção de uma lista suspensa.
 * Ele é construído sobre as primitivas do Radix UI para garantir acessibilidade.
 * 
 * Estilo Visual (Playful Soft UI):
 * - SelectTrigger: Segue o estilo do Input, com cantos arredondados (`rounded-2xl`) e borda 3D (`border-b-4`).
 * - SelectContent: Menu suspenso com cantos arredondados e sombra suave.
 * - SelectItem: Itens com feedback visual claro ao passar o mouse ou selecionar.
 */

import * as React from "react"
/* Importação das primitivas do Radix UI para lógica de seleção */
import * as SelectPrimitive from "@radix-ui/react-select"
/* Ícones para indicação de seleção e navegação */
import { Check, ChevronDown, ChevronUp } from "lucide-react"
/* Utilitário para combinar classes Tailwind */
import { cn } from "@/src/lib/utils"

/* Componentes base exportados diretamente do Radix */
const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/**
 * COMPONENTE: SelectTrigger
 * O botão que abre o menu de seleção.
 */
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      /* LAYOUT: Flexível, altura padrão e largura total */
      "flex h-14 w-full items-center justify-between rounded-2xl bg-white px-5 py-3 text-base font-bold text-slate-900",
      /* EFEITO 3D: Borda inferior mais grossa */
      "border-2 border-slate-200 border-b-4",
      /* ESTADOS: Foco e desabilitado */
      "focus:outline-none focus:ring-2 focus:ring-me-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-6 w-6 opacity-50 text-slate-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * COMPONENTE: SelectScrollUpButton
 * Botão para rolar a lista para cima (em listas longas).
 */
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-5 w-5 text-slate-400" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/**
 * COMPONENTE: SelectScrollDownButton
 * Botão para rolar a lista para baixo (em listas longas).
 */
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-5 w-5 text-slate-400" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

/**
 * COMPONENTE: SelectContent
 * O container que abriga a lista de opções.
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        /* ESTILO: Menu suspenso com cantos arredondados e animações */
        "relative z-50 max-h-96 min-w-[10rem] overflow-hidden rounded-[1.5rem] border-2 border-slate-200 bg-white text-slate-900 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        position === "popper" &&
          "data-[state=bottom]:translate-y-2 data-[state=left]:-translate-x-2 data-[state=right]:translate-x-2 data-[state=top]:-translate-y-2",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * COMPONENTE: SelectLabel
 * Rótulo para agrupar itens dentro do select.
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-2 pl-10 pr-4 text-xs font-black uppercase tracking-widest text-slate-400", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * COMPONENTE: SelectItem
 * Uma opção individual dentro do menu de seleção.
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      /* ESTILO: Item clicável com cantos arredondados e feedback de foco */
      "relative flex w-full cursor-default select-none items-center rounded-xl py-3 pl-10 pr-4 text-base font-bold text-slate-700 outline-none focus:bg-slate-50 focus:text-me-blue data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
      className
    )}
    {...props}
  >
    {/* Indicador de seleção (ícone de check) */}
    <span className="absolute left-3 flex h-5 w-5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-5 w-5 text-me-blue" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * COMPONENTE: SelectSeparator
 * Linha divisória entre itens ou grupos.
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-2 h-0.5 bg-slate-100", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
