/**
 * COMPONENTE DE UI: BUTTON (BOTÃO)
 * 
 * Este é o componente de botão base da aplicação, construído sobre o Radix UI Slot e CVA.
 * Ele foi customizado para seguir a estética "Playful Soft UI" (estilo Duolingo/Me+).
 * 
 * Características principais:
 * - Efeito 3D: Possui uma borda inferior mais grossa (`border-b-4`) que simula profundidade.
 * - Feedback Tátil: Ao ser clicado (`active`), o botão desce levemente (`translate-y-[2px]`), simulando um botão físico sendo pressionado.
 * - Tipografia: Usa fontes pesadas (`font-black`) e em caixa alta (`uppercase`) para um visual gamificado.
 * - Variantes: Inclui cores da marca como `duo` (verde), `me` (azul) e `warning` (amarelo).
 */

import * as React from "react"
/* Slot permite que o componente Button repasse suas propriedades para um componente filho (ex: um Link do React Router) */
import { Slot } from "@radix-ui/react-slot"
/* cva (Class Variance Authority) ajuda a gerenciar múltiplas variantes de estilo (cores, tamanhos) de forma limpa */
import { cva, type VariantProps } from "class-variance-authority"
/* Utilitário para combinar classes Tailwind de forma condicional */
import { cn } from "@/src/lib/utils"

/**
 * CONFIGURAÇÃO DE VARIANTES: buttonVariants
 * Define todas as combinações de estilos possíveis para o botão.
 */
const buttonVariants = cva(
  /* CLASSES BASE: Aplicadas a todos os botões independentemente da variante */
  "inline-flex items-center justify-center whitespace-normal text-center leading-tight rounded-2xl text-sm font-black uppercase tracking-[0.15em] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[4px] active:border-b-0",
  {
    variants: {
      variant: {
        /* Padrão (Verde Duolingo): Fundo verde com borda inferior escura */
        default: "bg-primary text-white border-b-4 border-primary-dark hover:bg-primary/90",
        /* Destrutivo (Vermelho): Para ações de exclusão ou perigo */
        destructive: "bg-destructive text-destructive-foreground border-b-4 border-red-700 hover:bg-destructive/90",
        /* Outline: Fundo branco com borda cinza 3D */
        outline: "border-2 border-border bg-background hover:bg-accent/10 hover:border-accent/30 border-b-4",
        /* Secundário (Roxo Me+): Fundo roxo com borda inferior escura */
        secondary: "bg-secondary text-white border-b-4 border-secondary-dark hover:bg-secondary/90",
        /* Ghost: Botão sem fundo ou borda fixa, apenas efeito de hover */
        ghost: "hover:bg-accent/10 text-muted-foreground active:translate-y-0",
        /* Link: Estilo de link de texto tradicional */
        link: "text-primary underline-offset-4 hover:underline active:translate-y-0",
        
        /* ALIASES DA MARCA: Facilitam o uso das cores específicas do projeto */
        duo: "bg-primary text-white border-b-4 border-primary-dark hover:bg-primary/90 shadow-lg",
        me: "bg-accent text-white border-b-4 border-accent-dark hover:bg-accent/90 shadow-lg",
        warning: "bg-warning text-white border-b-4 border-warning-dark hover:bg-warning/90 shadow-lg",
      },
      size: {
        /* TAMANHOS: Controlam a altura, arredondamento e padding */
        default: "h-14 px-8 py-4",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-16 rounded-[1.5rem] px-12 text-base",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      /* Define os valores iniciais se nada for passado via props */
      variant: "default",
      size: "default",
    },
  }
)

/**
 * INTERFACE: ButtonProps
 * Estende os atributos padrão do botão HTML e as propriedades de variante do CVA.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean /* Permite que o botão se comporte como outro elemento (ex: <a> ou <Link>) */
}

/**
 * COMPONENTE: Button
 * Implementado com forwardRef para permitir que bibliotecas externas acessem o elemento DOM.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    /* Escolhe entre o componente Slot (se asChild for true) ou a tag 'button' padrão */
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        /* Combina as classes das variantes com qualquer classe extra passada pelo usuário */
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

/* Nome de exibição para ferramentas de desenvolvimento do React */
Button.displayName = "Button"

export { Button, buttonVariants }
