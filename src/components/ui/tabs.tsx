/**
 * COMPONENTE DE UI: TABS (ABAS)
 * 
 * Este componente permite organizar o conteúdo em diferentes visualizações alternáveis.
 * Ele é construído sobre as primitivas do Radix UI para garantir acessibilidade (WAI-ARIA).
 * 
 * Estilo Visual (Playful Soft UI):
 * - TabsList: Container arredondado com fundo cinza suave e sombra interna (`shadow-inner`).
 * - TabsTrigger: Botões que, quando ativos, ganham um fundo branco, sombra externa e uma borda inferior roxa (`me-purple`) para o efeito 3D.
 * - Tipografia: Texto em negrito pesado (`font-black`) e em caixa alta (`uppercase`) para manter o estilo gamificado.
 */

import * as React from "react"
/* Importação das primitivas do Radix UI que lidam com a lógica de navegação por teclado e acessibilidade */
import * as TabsPrimitive from "@radix-ui/react-tabs"
/* Utilitário para combinar classes Tailwind de forma condicional */
import { cn } from "@/src/lib/utils"

/**
 * COMPONENTE: Tabs
 * O componente raiz que envolve toda a estrutura de abas.
 */
const Tabs = TabsPrimitive.Root

/**
 * COMPONENTE: TabsList
 * O container horizontal que abriga os botões das abas.
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      /* LAYOUT: Flexbox horizontal centralizado */
      "inline-flex h-16 items-center justify-center rounded-[1.5rem] bg-slate-100 p-2 text-slate-500 border-2 border-slate-200 shadow-inner",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * COMPONENTE: TabsTrigger
 * O botão individual que o usuário clica para alternar entre as abas.
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      /* ESTILO BASE: Texto em negrito, uppercase e transições suaves */
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-8 py-3 text-sm font-black uppercase tracking-[0.15em] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      /* ESTADO ATIVO: Quando a aba está selecionada, aplica o estilo Soft UI 3D */
      "data-[state=active]:bg-white data-[state=active]:text-me-purple data-[state=active]:shadow-lg data-[state=active]:border-b-4 data-[state=active]:border-me-purple",
      /* Efeito de clique sutil */
      "active:scale-95",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * COMPONENTE: TabsContent
 * O container que exibe o conteúdo relacionado à aba selecionada.
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      /* Espaçamento superior para separar o conteúdo dos botões */
      "mt-8 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-purple focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
