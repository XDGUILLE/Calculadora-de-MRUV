# Calculadora MRUV 🚗

Proyecto de Física I — Cinemática: Movimiento Rectilíneo Uniformemente Variado.

Calculadora web interactiva que resuelve las cinco fórmulas del MRUV con soporte de múltiples unidades y una simulación visual del movimiento en tiempo real.

---

## ¿Qué es el MRUV?

El **Movimiento Rectilíneo Uniformemente Variado** describe el desplazamiento de un objeto en línea recta con **aceleración constante**. Es uno de los modelos cinemáticos fundamentales de la física clásica.

---

## Fórmulas implementadas

| # | Calcular | Fórmula | Datos necesarios |
|---|----------|---------|-----------------|
| 1 | Aceleración | `a = (Vf − V₀) / t` | V₀, Vf, t |
| 2 | Velocidad final | `Vf = V₀ + a·t` | V₀, a, t |
| 3 | Distancia sin aceleración | `d = ((V₀ + Vf) / 2) · t` | V₀, Vf, t |
| 4 | Distancia sin Vf | `d = V₀·t + ½·a·t²` | V₀, a, t |
| 5 | Velocidad final² | `Vf² = V₀² + 2·a·d` | V₀, a, d |

---

## Estructura del proyecto

```
/
├── index.html      # Estructura HTML y estilos CSS
├── app.js          # Lógica de cálculo y conversión de unidades
├── animation.js    # Simulación del carrito sobre Canvas API
└── README.md
```

### `index.html`
Contiene el layout completo de la interfaz y todos los estilos embebidos. Diseño oscuro con tipografías `Space Mono` y `Syne`, fondo animado con cuadrícula y efectos de luz.

### `app.js`
Maneja toda la lógica de la calculadora:
- Lectura y validación de inputs
- Conversión de unidades a SI antes de calcular
- Cinco funciones de fórmula (`formula1` a `formula5`)
- Comunicación con `animation.js` mediante `window.triggerAnimation()` y `window.resetAnimation()`

### `animation.js`
Simulación visual independiente usando Canvas API nativo (sin librerías externas):
- Carrito con ruedas que giran según la velocidad instantánea
- Movimiento calculado con la cinemática real del MRUV: `x = x₀ + v₀t + ½at²`
- Flechas de velocidad (verde) y aceleración (rojo) sobre el carrito
- Partículas de rastro proporcionales a la velocidad
- Indicador de distancia recorrida en tiempo real
- Se activa automáticamente al calcular y se resetea al limpiar

---

## Unidades soportadas

| Magnitud | Opciones |
|----------|----------|
| Velocidad | m/s, km/h, mi/h |
| Tiempo | segundos, minutos, horas |
| Distancia | mm, cm, m, km, mi |
| Aceleración | m/s², km/h², mi/h² |

> Todos los valores se convierten a SI internamente antes de calcular.

---

## Casos de prueba

Usá los siguientes casos para verificar que la calculadora funciona correctamente:

| Caso | Fórmula | V₀ | Vf | t | a | d | Resultado esperado |
|------|---------|----|----|---|---|---|--------------------|
| 1 | Aceleración | 0 m/s | 20 m/s | 4 s | — | — | a = (20−0)/4 = **5 m/s²** |
| 2 | Velocidad final | 0 m/s | — | 5 s | 2 m/s² | — | Vf = 0 + 2·5 = **10 m/s** |
| 3 | Distancia sin Vf | 3 m/s | 7 m/s | 4 s | — | — | d = ((3+7)/2)·4 = **20 m** |
| 4 | Distancia con aceleración | 2 m/s | — | 3 s | 3 m/s² | — | d = 2·3 + 0.5·3·9 = **19.5 m** |
| 5 | Vf² | 5 m/s | — | — | 2 m/s² | 10 m | Vf² = 5² + 2·2·10 = 65 → **Vf ≈ 8.062 m/s** |
| 6 | Unidades alternas | 10 km/h | — | 2 min | 0.5 km/h² | — | Prueba de conversión de unidades |

---

## Cómo usar

1. Ingresá los valores conocidos en los campos correspondientes
2. Seleccioná las unidades de cada magnitud
3. Hacé clic en el botón de la fórmula que querés resolver
4. El resultado aparece en el campo inferior y la animación se activa automáticamente
5. Usá **Limpiar** para reiniciar todos los campos

---

## Tecnologías

- HTML5 / CSS3
- JavaScript (ES6+)
- Canvas API (animación, sin librerías externas)
- Google Fonts — [Space Mono](https://fonts.google.com/specimen/Space+Mono) + [Syne](https://fonts.google.com/specimen/Syne)

---

## Autores

- **David Israel Cahuec Tobias** — 0910-25-7393  
- **Luis Guillermo Ventura Piriz** — 0910-25-30211  
- **Donny Luis Ramiro Ramos Alvarez** — 0910-25-3526  
- **Jose Leonel Garcia** — 0910-25-8028  

Proyecto desarrollado para el curso de **Física I** — Facultad de Ingeniería en Sistemas de la Información y Ciencias de la Computación — Universidad Mariano Gálvez de Guatemala  

