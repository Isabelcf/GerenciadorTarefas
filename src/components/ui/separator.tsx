import * as React from "react"
/* Importa a primitiva do Radix UI para Separator, garantindo acessibilidade */
import * as SeparatorPrimitive from "@radix-ui/react-separator"
/* Importa utilitário para mesclar classes CSS */
import { cn } from "@/src/lib/utils"

/* Componente de Separador Visual */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        /* Estética Soft UI: Separador ligeiramente mais grosso e arredondado para suavidade */
        "shrink-0 bg-slate-200 rounded-full",
        orientation === "horizontal" ? "h-1 w-full" : "h-full w-1",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
