/**
 * COMPONENTE DE UI: ACCORDION (ACORDEÃO)
 * 
 * Permite exibir conteúdo de forma expansível e colapsável.
 * Baseado nas primitivas do Radix UI para acessibilidade total.
 * 
 * Estilo Visual (Playful Soft UI):
 * - Bordas suaves e arredondadas.
 * - Tipografia forte e clara.
 * - Animações fluidas de abertura e fechamento.
 */

import * as React from "react"
/* Importação das primitivas do Radix UI para lógica de acordeão */
import * as AccordionPrimitive from "@radix-ui/react-accordion"
/* Ícone de seta para indicar expansão */
import { ChevronDown } from "lucide-react"
/* Utilitário para combinar classes Tailwind */
import { cn } from "@/src/lib/utils"

/**
 * COMPONENTE: Accordion
 * Raiz do componente de acordeão.
 */
const Accordion = AccordionPrimitive.Root

/**
 * COMPONENTE: AccordionItem
 * Representa um item individual dentro do acordeão.
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b-2 border-slate-100", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * COMPONENTE: AccordionTrigger
 * O botão que o usuário clica para expandir/recolher o conteúdo.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        /* Estilo do gatilho: flexível, texto em negrito e transição de ícone */
        "flex flex-1 items-center justify-between py-6 font-black uppercase tracking-widest text-slate-700 transition-all hover:text-me-purple [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      {/* Ícone de seta com animação de rotação */}
      <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-300 text-slate-300" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * COMPONENTE: AccordionContent
 * O container que abriga o conteúdo revelado.
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-base font-medium text-slate-500 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-6 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
