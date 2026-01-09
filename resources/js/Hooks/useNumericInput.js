import { useCallback } from "react";
import { NUMERIC_NAVIGATION_KEYS, NUMERIC_REGEX } from "@/Constants/keyboardConstants";

/**
 * Hook para controlar entrada numérica via teclado
 * 
 * Previne a entrada de caracteres não-numéricos mantendo
 * as teclas de navegação funcionales
 * 
 * @returns {Function} Handler para onKeyDown em inputs numéricos
 * 
 * @example
 * const handleNumericInput = useNumericInput();
 * <input type="number" onKeyDown={handleNumericInput} />
 */
export function useNumericInput() {
	return useCallback((event) => {
		// Permite teclas de navegação sem processamento
		if (NUMERIC_NAVIGATION_KEYS.includes(event.key)) {
			return;
		}

		// Bloqueia qualquer tecla que não seja um dígito
		if (!NUMERIC_REGEX.test(event.key)) {
			event.preventDefault();
		}
	}, []);
}

/**
 * Hook para controlar entrada decimal via teclado
 * 
 * Previne a entrada de caracteres não-numéricos e permite
 * apenas uma vírgula ou ponto como separador decimal
 * 
 * @returns {Function} Handler para onKeyDown em inputs decimais
 * 
 * @example
 * const handleDecimalInput = useDecimalInput();
 * <input type="text" inputMode="decimal" onKeyDown={handleDecimalInput} />
 */
export function useDecimalInput() {
	return useCallback((event) => {
		// Permite teclas de navegação sem processamento
		if (NUMERIC_NAVIGATION_KEYS.includes(event.key)) {
			return;
		}

		// Permite vírgula e ponto como separadores decimais
		if (event.key === "," || event.key === ".") {
			return;
		}

		// Bloqueia qualquer tecla que não seja um dígito
		if (!NUMERIC_REGEX.test(event.key)) {
			event.preventDefault();
		}
	}, []);
}
