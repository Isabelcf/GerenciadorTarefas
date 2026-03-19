/**
 * COMPONENTE DE UI: INPUT (CAMPO DE ENTRADA)
 * 
 * Este é o componente de entrada de texto base da aplicação.
 * Ele foi estilizado para seguir a estética "Playful Soft UI" (estilo Duolingo/Me+).
 * 
 * Características principais:
 * - Cantos Arredondados: Usa `rounded-2xl` para um visual amigável e moderno.
 * - Efeito 3D: Possui uma borda inferior mais grossa (`border-b-4`) que simula profundidade, como um botão físico.
 * - Tipografia: Texto em negrito (`font-bold`) para facilitar a leitura e manter a consistência gamificada.
 * - Foco Interativo: Ao receber foco, a borda muda para a cor `me-blue` (azul vibrante).
 */

import * as React from "react"
/* Utilitário para combinar classes Tailwind de forma condicional e limpa */
import { cn } from "@/src/lib/utils"

/**
 * INTERFACE: InputProps
 * Estende os atributos padrão de um elemento <input> do HTML.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * COMPONENTE: Input
 * Implementado com forwardRef para permitir que o React e outras bibliotecas acessem o elemento DOM diretamente.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          /* LAYOUT BASE: Flexível, altura fixa (h-14) e largura total */
          "flex h-14 w-full",
          /* ESTÉTICA SOFT UI: Cantos arredondados, fundo branco e padding interno generoso */
          "rounded-2xl bg-white px-5 py-3 text-base font-bold text-slate-900 shadow-inner",
          /* EFEITO 3D: Borda cinza suave com base inferior mais grossa */
          "border-2 border-slate-200 border-b-4",
          /* ESTADOS DE FOCO: Muda a cor da borda para azul e remove o outline padrão do navegador */
          "focus-visible:border-me-blue focus-visible:outline-none focus-visible:ring-0 transition-all duration-200",
          /* ESTILIZAÇÃO DO PLACEHOLDER: Texto cinza médio com peso de fonte normal */
          "placeholder:text-slate-400 placeholder:font-medium",
          /* ESTILIZAÇÃO PARA INPUT DE ARQUIVO (se usado) */
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          /* ESTADO DESABILITADO: Muda o cursor e reduz a opacidade */
          "disabled:cursor-not-allowed disabled:opacity-50",
          /* Permite sobrescrever estilos via props */
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

/* Nome de exibição para ferramentas de desenvolvimento do React */
Input.displayName = "Input"

export { Input }
