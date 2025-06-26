# Traductor2000 🚀

**Traductor2000** es una aplicación web moderna que convierte automáticamente texto HTML en claves de traducción multiidioma. Utiliza inteligencia artificial para extraer texto legible del HTML y generar traducciones en español, inglés, francés y portugués.

## ✨ Características

- 🔄 **Extracción automática de texto** desde HTML
- 🌍 **Traducción multiidioma** (Español, Inglés, Francés, Portugués)
- 🤖 **Soporte para múltiples modelos de IA** (OpenAI GPT y Google Gemini)
- 📋 **Copiado al portapapeles** para cada idioma
- 🎨 **Interfaz moderna** con Material-UI
- ⚡ **Filtrado automático** de expresiones dinámicas (AngularJS, Vue, etc.)
- 🔑 **Generación de claves** en formato SCREAMING_SNAKE_CASE

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Material-UI (MUI)
- **IA**: OpenAI GPT y Google Gemini
- **Estilos**: CSS-in-JS con Emotion
- **Linting**: ESLint + TypeScript ESLint

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn** o **pnpm**
- **Clave API** de OpenAI o Google AI

### Obtener Claves API

#### OpenAI API Key
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú lateral
4. Haz clic en "Create new secret key"
5. Copia la clave generada

#### Google AI API Key
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave generada

## 🚀 Instalación y Configuración

### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd translator2000
```

### Paso 2: Instalar Dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Para OpenAI
VITE_OPENAI_API_KEY=tu_clave_api_de_openai_aqui

# Para Google AI
VITE_GEMINI_API_KEY=tu_clave_api_de_google_aqui
```

**Nota**: Puedes configurar ambas claves si quieres alternar entre proveedores.

### Paso 4: Ejecutar la Aplicación

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📖 Cómo Usar Traductor2000

### Paso 1: Seleccionar Modelo de IA
- Elige entre los modelos disponibles:
  - **GPT-3.5 Turbo**: Buena relación rendimiento/costo
  - **GPT-4**: Mayor calidad, más costoso
  - **Gemini 2.0 Flash**: Respuestas rápidas de Google

### Paso 2: Configurar Prefijo
- Ingresa un prefijo para las claves de traducción
- Ejemplo: `DEBFRONT.HTML.STYLEGUIDE.TEMPLATES.DASH.REVIEW`
- **Obligatorio**: Este campo es requerido

### Paso 3: Pegar HTML
- Copia y pega el HTML que quieres traducir
- La aplicación automáticamente filtrará expresiones dinámicas como `{{$index+1}}`

### Paso 4: Generar Traducciones
- Haz clic en **"¡Tradúcime Esta!"**
- Espera a que se procese (puede tomar unos segundos)

### Paso 5: Revisar Resultados
- Las traducciones aparecerán en 4 pestañas:
  - 🇪🇸 **Español**
  - 🇺🇸 **English**
  - 🇫🇷 **Français**
  - 🇵🇹 **Português**

### Paso 6: Copiar Traducciones
- Haz clic en el botón de copiar (📋) en cada pestaña
- Las traducciones se copiarán al portapapeles en formato JSON

## 📝 Ejemplo de Uso

### HTML de Entrada
```html
<div class="step-content">
    <div class="step-content_title">
        <b>1/2 ¿Cómo fue tu experiencia utilizando Numia?</b>
    </div>
    <div class="step-content_info">
        <span>Nada satisfactoria</span>
        <span>Muy satisfactoria</span>
    </div>
</div>
```

### Resultado Generado
```json
{
  "DEBFRONT.HTML.STYLEGUIDE.TEMPLATES.DASH.REVIEW.STEP1_TITLE": "1/2 ¿Cómo fue tu experiencia utilizando Numia?",
  "DEBFRONT.HTML.STYLEGUIDE.TEMPLATES.DASH.REVIEW.NOT_SATISFIED": "Nada satisfactoria",
  "DEBFRONT.HTML.STYLEGUIDE.TEMPLATES.DASH.REVIEW.VERY_SATISFIED": "Muy satisfactoria"
}
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Previsualiza build de producción
npm run lint         # Ejecuta ESLint
npm run lint:fix     # Corrige errores de ESLint automáticamente
```

## 🐛 Solución de Problemas

### Error: "Clave API no encontrada"
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que las variables de entorno tengan el prefijo `VITE_`
- Reinicia el servidor de desarrollo después de crear el archivo `.env`

### Error: "Cuota excedida"
- Verifica tu saldo en la plataforma correspondiente
- Considera cambiar a un proveedor diferente
- Los modelos GPT-4 son más costosos que GPT-3.5

### Error: "Límite de velocidad excedido"
- Espera un minuto antes de intentar de nuevo
- Cambia a un proveedor diferente temporalmente

### No se generan traducciones
- Verifica que el HTML contenga texto legible
- Asegúrate de que el prefijo esté configurado
- Revisa que la clave API sea válida

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **OpenAI** por proporcionar acceso a sus modelos GPT
- **Google AI** por el modelo Gemini
- **Material-UI** por los componentes de interfaz
- **Vite** por el bundler rápido y eficiente

---

**¡Disfruta traduciendo con Traductor2000! 🎉**
