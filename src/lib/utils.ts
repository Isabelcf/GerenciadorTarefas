/**
 * ARQUIVO: UTILS.TS
 * 
 * Este arquivo contém funções utilitárias compartilhadas por toda a aplicação.
 * A principal função aqui é a `cn`, usada para gerenciar classes CSS dinâmicas.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * FUNÇÃO: cn (Class Name)
 * 
 * Esta função resolve conflitos de classes do Tailwind CSS e permite a concatenação
 * condicional de nomes de classes de forma limpa.
 * 
 * Como funciona:
 * 1. `clsx(inputs)`: Lida com a lógica condicional (ex: { 'bg-red-500': isError }).
 * 2. `twMerge(...)`: Garante que, se houver classes conflitantes (ex: 'p-2 p-4'),
 *    a última classe declarada prevaleça corretamente no Tailwind.
 * 
 * @param inputs - Lista de classes ou objetos de classes condicionais.
 * @returns Uma string de classes CSS otimizada.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
