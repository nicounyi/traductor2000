import { useState } from 'react'
import { 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { AVAILABLE_MODELS } from './services/translationProviders'
import { extractMultiLanguageTranslations } from './services/translationService'
import type { MultiLanguageTranslations } from './services/translationProviders'

const defaultModel = AVAILABLE_MODELS.find(m => m.id === 'gemini-2.0-flash') || AVAILABLE_MODELS[0];

function App() {
  const [html, setHtml] = useState('')
  const [prefix, setPrefix] = useState('')
  const [translations, setTranslations] = useState<MultiLanguageTranslations | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(defaultModel.id)
  const [activeTab, setActiveTab] = useState(0)
  const [copyNotification, setCopyNotification] = useState<string | null>(null)

  const selectedProvider = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.provider || 'google'
  const apiKey = selectedProvider === 'openai' ? import.meta.env.VITE_OPENAI_API_KEY : import.meta.env.VITE_GEMINI_API_KEY

  const handleTranslate = async () => {
    if (!apiKey) {
      setError(`Clave API de ${selectedProvider === 'openai' ? 'OpenAI' : 'Google AI'} no encontrada en las variables de entorno`)
      return
    }

    if (!html.trim()) {
      setError('El HTML de entrada es requerido')
      return
    }

    if (!prefix.trim()) {
      setError('El prefijo de clave de traducción es requerido')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      setTranslations(null)
      
      const multiLanguageTranslations = await extractMultiLanguageTranslations(html, prefix, apiKey, selectedModel)
      
      if (Object.keys(multiLanguageTranslations.spanish).length === 0) {
        setError('No se generaron traducciones. Por favor verifica tu HTML de entrada.')
        return
      }

      setTranslations(multiLanguageTranslations)
    } catch (error) {
      console.error('Error procesando HTML:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error procesando HTML. Por favor verifica tu entrada y clave API.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTranslations = (translations: { [key: string]: string }): string => {
    return JSON.stringify(translations, null, 2)
  }

  const languages = [
    { key: 'spanish', label: 'Español', color: '#e3f2fd' },
    { key: 'english', label: 'English', color: '#f3e5f5' },
    { key: 'french', label: 'Français', color: '#e8f5e8' },
    { key: 'portuguese', label: 'Português', color: '#fff3e0' }
  ]

  const handleCopyToClipboard = async (text: string, language: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyNotification(`${language} traducciones copiadas al portapapeles!`)
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error)
      setCopyNotification('Error al copiar al portapapeles')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl fullWidth>
            <InputLabel id="model-select-label">Modelo de IA</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label="Modelo de IA"
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {AVAILABLE_MODELS.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name} ({model.provider === 'openai' ? 'OpenAI' : 'Google AI'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip 
            title={
              <Box>
                {AVAILABLE_MODELS.map((model) => (
                  <Box key={model.id} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{model.name}</Typography>
                    <Typography variant="body2">{model.description}</Typography>
                  </Box>
                ))}
              </Box>
            }
          >
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          label="Prefijo de Clave de Traducción"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="ej., DEBFRONT.HTML.STYLEGUIDE.TEMPLATES.DASH.REVIEW"
          fullWidth
          error={!prefix.trim()}
          helperText={!prefix.trim() ? "El prefijo de clave de traducción es requerido" : ""}
        />
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            error.includes('quota exceeded') || error.includes('billing') ? (
              <Button 
                color="inherit" 
                size="small"
                href={selectedProvider === 'openai' 
                  ? "https://platform.openai.com/account/billing"
                  : "https://console.cloud.google.com/billing"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Verificar Facturación
              </Button>
            ) : error.includes('rate limit') ? (
              <Typography variant="caption" sx={{ display: 'inline-block', ml: 2 }}>
                Intenta de nuevo en un minuto o cambia de proveedor
              </Typography>
            ) : null
          }
        >
          {error.split('\n').map((line, i) => (
            <Typography key={i} component="div">
              {line}
            </Typography>
          ))}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          label="HTML de Entrada"
          multiline
          rows={10}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          error={!html.trim()}
          helperText={!html.trim() ? "El HTML de entrada es requerido" : ""}
        />
        
        <Button 
          variant="contained" 
          onClick={handleTranslate}
          disabled={!html.trim() || !prefix.trim() || !apiKey || isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? 'Procesando...' : '¡Traducime Esta!'}
        </Button>

        {translations && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Traducciones Generadas
            </Typography>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              {languages.map((lang, index) => (
                <Tab key={lang.key} label={lang.label} />
              ))}
            </Tabs>
            
            {languages.map((lang, index) => (
              <Box
                key={lang.key}
                role="tabpanel"
                hidden={activeTab !== index}
                sx={{ 
                  backgroundColor: lang.color,
                  p: 2,
                  borderRadius: 1,
                  minHeight: '400px'
                }}
              >
                {activeTab === index && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        Traducciones en {lang.label}
                      </Typography>
                      <Tooltip title={`Copiar traducciones en ${lang.label} al portapapeles`}>
                        <IconButton
                          onClick={() => handleCopyToClipboard(
                            formatTranslations(translations[lang.key as keyof MultiLanguageTranslations]),
                            lang.label
                          )}
                          sx={{ 
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      multiline
                      rows={15}
                      value={formatTranslations(translations[lang.key as keyof MultiLanguageTranslations])}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: 'white',
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={!!copyNotification}
        autoHideDuration={3000}
        onClose={() => setCopyNotification(null)}
        message={copyNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  )
}

export default App
